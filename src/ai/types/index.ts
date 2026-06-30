export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessageStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error' | 'cancelled'

export type ChatRuntimeStatus = ChatMessageStatus

export type AIProviderName = 'mock' | 'openai' | 'claude' | 'qwen' | 'deepseek'

export type CompressionStrategy = 'none' | 'window' | 'summary' | 'hybrid'

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface Citation {
  id: string
  source: string
  title: string
  content: string
  score?: number
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  status: ChatMessageStatus
  createdAt: number
  updatedAt?: number
  tokenUsage?: TokenUsage
  citations?: Citation[]
  metadata?: Record<string, unknown>
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  active: boolean
}

export interface ChatRequest {
  conversationId: string
  messages: ChatMessage[]
  model: string
  temperature?: number
  topP?: number
  maxTokens?: number
  stream?: boolean
  provider?: AIProviderName
  enableKnowledge?: boolean
  enableCache?: boolean
  contextWindow?: number
  compressionStrategy?: CompressionStrategy
}

export interface StreamChunk {
  id: string
  messageId: string
  delta: string
  done: boolean
  index: number
}

export interface Provider {
  name: string
  models: string[]
  streamChatCompletion(
    request: ChatRequest,
    callbacks: {
      onStart?: () => void
      onChunk?: (chunk: StreamChunk) => void
      onFinish?: (fullText: string) => void
      onError?: (error: Error) => void
    },
    signal?: AbortSignal,
  ): Promise<void>
}

export interface RuntimeEvent {
  type:
    | 'chat:start'
    | 'chat:chunk'
    | 'chat:finish'
    | 'chat:error'
    | 'chat:abort'
    | 'provider:change'
    | 'config:update'
  payload: unknown
  timestamp: number
}

export interface AIConfig {
  provider: AIProviderName
  model: string
  temperature: number
  topP: number
  maxTokens: number
  stream: boolean
  enableKnowledge: boolean
  enableCache: boolean
  contextWindow: number
  compressionStrategy: CompressionStrategy
  systemPrompt: string
}

export type AIConfigPatch = Partial<AIConfig>

export type AIConfigReader = () => AIConfig
