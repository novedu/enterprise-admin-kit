import type { AIConfig } from '@/ai/types'

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'mock',
  model: 'mock-chat-runtime',
  providerCredentials: {
    mock: {
      apiKey: '',
      baseUrl: '',
    },
    openai: {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
    },
    claude: {
      apiKey: '',
      baseUrl: 'https://api.anthropic.com',
    },
    qwen: {
      apiKey: '',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    },
    deepseek: {
      apiKey: '',
      baseUrl: 'https://api.deepseek.com',
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
}
