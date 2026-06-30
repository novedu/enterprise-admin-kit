import type { KnowledgeCitation, KnowledgeChunk } from '@/ai/knowledge'

export type PromptTemplateType = 'system' | 'chat' | 'rag' | 'agent'

export interface PromptTemplate {
  id: string
  name: string
  type: PromptTemplateType
  template: string
  variables: string[]
  version?: string
}

export interface PromptContext {
  systemPrompt?: string
  conversationSystemPrompt?: string
  userPrompt?: string
  variables?: Record<string, unknown>
  retrievedDocuments?: KnowledgeChunk[]
  citations?: KnowledgeCitation[]
}

export interface BuildPromptOptions {
  systemPrompt?: string
  conversationSystemPrompt?: string
}
