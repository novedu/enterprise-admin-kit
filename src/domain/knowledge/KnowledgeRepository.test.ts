import { beforeEach, describe, expect, it, vi } from 'vitest'

import { KnowledgeRepository } from './KnowledgeRepository'

describe('KnowledgeRepository', () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
    })
  })

  it('loads mock knowledge bases by workspace', async () => {
    const repository = new KnowledgeRepository()
    const bases = await repository.listBasesByWorkspace('workspace-enterprise-ai')

    expect(bases.map((base) => base.id)).toContain('kb-runtime-docs')
    expect(bases[0].documentCount).toBeGreaterThan(0)
    expect(bases[0].chunkCount).toBeGreaterThan(0)
  })

  it('persists uploaded documents and generated chunks', async () => {
    const repository = new KnowledgeRepository()
    const base = await repository.createBase({
      workspaceId: 'workspace-test',
      name: 'Support Docs',
    })

    await repository.uploadDocument({
      workspaceId: 'workspace-test',
      knowledgeBaseId: base.id,
      title: 'Refund Policy',
      content: 'Refund requests require approval. Refund policy citations should be preserved.',
    })

    const documents = await repository.listDocuments(base.id)
    const chunks = await repository.listChunks(base.id)

    expect(documents).toHaveLength(1)
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0]).toMatchObject({
      workspaceId: 'workspace-test',
      knowledgeBaseId: base.id,
      docId: documents[0].id,
    })
  })

  it('retrieves citations from persisted chunks', async () => {
    const repository = new KnowledgeRepository()
    const result = await repository.retrieve('kb-runtime-docs', 'runtime prompt knowledge', 3)

    expect(result.chunks.length).toBeGreaterThan(0)
    expect(result.citations[0].source).toBe('Runtime Architecture')
  })

  it('builds a runtime knowledge base with stable persisted chunk ids', async () => {
    const repository = new KnowledgeRepository()
    const runtimeBase = await repository.buildRuntimeKnowledgeBase('kb-runtime-docs')
    const result = runtimeBase.query('runtime prompt knowledge', { topK: 1 })

    expect(result.chunks[0].id).toBe('doc-runtime-architecture-chunk-1')
    expect(result.citations[0].id).toBe('citation-doc-runtime-architecture-chunk-1')
  })
})
