import { describe, expect, it } from 'vitest'

import { injectVariables } from './injectVariables'
import { PromptEngine } from './PromptEngine'
import type { PromptTemplate } from './types'

describe('injectVariables', () => {
  it('injects scalar and nested variables', () => {
    const result = injectVariables('You are a {{role}} assistant for {{domain.name}}.', {
      role: 'support',
      domain: {
        name: 'enterprise runtime',
      },
    })

    expect(result).toBe('You are a support assistant for enterprise runtime.')
  })
})

describe('PromptEngine', () => {
  it('builds a registered prompt template', () => {
    const engine = new PromptEngine()
    const template: PromptTemplate = {
      id: 'custom-system',
      name: 'Custom System',
      type: 'system',
      template: 'You are a {{role}} assistant specializing in {{domain}}.',
      variables: ['role', 'domain'],
    }

    engine.register(template)

    expect(
      engine.build('custom-system', {
        role: 'security',
        domain: 'RBAC',
      }),
    ).toBe('You are a security assistant specializing in RBAC.')
  })

  it('builds default chat prompt with global and conversation system prompts', () => {
    const engine = new PromptEngine()
    const prompt = engine.buildFromContext('default-chat', {
      systemPrompt: 'You are an enterprise AI assistant.',
      conversationSystemPrompt: 'Answer for frontend architects.',
      userPrompt: 'Explain runtime events.',
      variables: {
        context: 'ChatRuntime emits lifecycle events.',
      },
    })

    expect(prompt).toContain('You are an enterprise AI assistant.')
    expect(prompt).toContain('Answer for frontend architects.')
    expect(prompt).toContain('ChatRuntime emits lifecycle events.')
    expect(prompt).toContain('Explain runtime events.')
  })

  it('builds rag prompt with retrieved documents and citations', () => {
    const engine = new PromptEngine()
    const prompt = engine.buildFromContext('default-rag', {
      systemPrompt: 'Use citations when answering.',
      userPrompt: 'How does retrieval work?',
      retrievedDocuments: [
        {
          id: 'chunk-1',
          workspaceId: 'kb-1',
          docId: 'doc-1',
          content: 'Retrieval uses keyword overlap scoring.',
          keywords: ['retrieval', 'keyword'],
          score: 2,
        },
      ],
      citations: [
        {
          id: 'citation-1',
          source: 'RAG Notes',
          content: 'Retrieval uses keyword overlap scoring.',
          score: 2,
        },
      ],
    })

    expect(prompt).toContain('Knowledge:')
    expect(prompt).toContain('[1] Retrieval uses keyword overlap scoring.')
    expect(prompt).toContain('[1] RAG Notes: Retrieval uses keyword overlap scoring.')
  })
})
