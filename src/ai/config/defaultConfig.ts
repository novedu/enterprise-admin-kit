import type { AIConfig } from '@/ai/types'

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'mock',
  model: 'mock-chat-runtime',
  temperature: 0.7,
  topP: 1,
  maxTokens: 2048,
  stream: true,
  enableKnowledge: false,
  enableCache: false,
  contextWindow: 8192,
  compressionStrategy: 'none',
  systemPrompt:
    'You are an enterprise AI assistant. Answer clearly and cite sources when available.',
}
