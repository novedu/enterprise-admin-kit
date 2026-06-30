import type { AIConfig } from '@/ai/types'

export const DEFAULT_AI_CONFIG: AIConfig = {
  version: 'v1',
  provider: 'mock',
  model: 'mock-chat-runtime',
  providerCredentials: {
    mock: {
      id: 'credential-mock',
      name: 'Mock Credential',
      type: 'mock',
      encryptedRef: 'mock://local-development',
    },
  },
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
  knowledgeTopK: 3,
  requestTimeoutMs: 30_000,
  maxRetries: 1,
}
