import { describe, expect, it } from 'vitest'

import { KnowledgeBase } from './KnowledgeBase'
import { KnowledgeWorkspace } from './KnowledgeWorkspace'

describe('KnowledgeBase', () => {
  it('uploads documents and creates searchable chunks', () => {
    const base = new KnowledgeBase({
      id: 'kb-product',
      name: 'Product Docs',
      chunkSize: 80,
    })

    const document = base.uploadDocument({
      title: 'Runtime Guide',
      content:
        'The AI runtime supports streaming chat and provider switching.\n\nKnowledge retrieval returns citations for enterprise answers.',
    })

    expect(base.getDocuments()).toHaveLength(1)
    expect(base.getChunks().length).toBeGreaterThan(1)
    expect(base.getChunks()[0].docId).toBe(document.id)
  })

  it('retrieves top chunks by keyword overlap score', () => {
    const base = new KnowledgeBase({
      id: 'kb-runtime',
      name: 'Runtime Docs',
    })

    base.uploadDocument({
      title: 'Provider Guide',
      content: 'Provider factory enables openai claude qwen deepseek switching.',
    })
    base.uploadDocument({
      title: 'Knowledge Guide',
      content: 'Knowledge retrieval uses keyword overlap and citation generation.',
    })

    const results = base.retrieve('keyword citation retrieval', { topK: 1 })

    expect(results).toHaveLength(1)
    expect(results[0].score).toBeGreaterThan(0)
    expect(results[0].content).toContain('citation')
  })

  it('generates citations from retrieved chunks', () => {
    const base = new KnowledgeBase({
      id: 'kb-citation',
      name: 'Citation Docs',
    })

    base.uploadDocument({
      title: 'RAG Notes',
      content: 'RAG citation source content should be attached to answers.',
    })

    const { citations } = base.query('rag citation source', { topK: 1 })

    expect(citations).toHaveLength(1)
    expect(citations[0].source).toBe('RAG Notes')
    expect(citations[0].score).toBeGreaterThan(0)
  })

  it('rejects oversized documents and caps retrieval topK', () => {
    const base = new KnowledgeBase({
      id: 'kb-guarded',
      name: 'Guarded KB',
      maxDocumentChars: 20,
    })

    expect(() =>
      base.uploadDocument({
        title: 'Too Large',
        content: 'This document is much too large for the configured knowledge base.',
      }),
    ).toThrow(/exceeds/)

    const searchable = new KnowledgeBase({
      id: 'kb-search',
      name: 'Search KB',
      chunkSize: 120,
    })

    for (let index = 0; index < 12; index += 1) {
      searchable.uploadDocument({
        title: `Runtime ${index}`,
        content: `runtime provider streaming retrieval citation ${index}`,
      })
    }

    expect(searchable.retrieve('runtime provider retrieval', { topK: 50 })).toHaveLength(10)
    expect(searchable.getChunks()[0].workspaceId).toBe('kb-search')
  })
})

describe('KnowledgeWorkspace', () => {
  it('supports multiple switchable knowledge bases', () => {
    const workspace = new KnowledgeWorkspace()
    const productBase = workspace.createKnowledgeBase({
      id: 'product',
      name: 'Product',
    })
    const policyBase = workspace.createKnowledgeBase({
      id: 'policy',
      name: 'Policy',
    })

    productBase.uploadDocument({
      title: 'Product Runtime',
      content: 'Runtime provider streaming configuration.',
    })
    policyBase.uploadDocument({
      title: 'Security Policy',
      content: 'Security policy requires audit logging.',
    })

    workspace.switchKnowledgeBase('policy')

    const result = workspace.retrieve('security audit', 1)

    expect(workspace.listKnowledgeBases()).toHaveLength(2)
    expect(result.citations[0].source).toBe('Security Policy')
  })
})
