import type { ChatMessage } from './chatSnapshot'
import type { KnowledgeBase } from '@/ai/knowledge'
import type { PromptEngine } from '@/ai/prompt'

export type AIProviderName = 'mock' | 'openai' | 'claude' | 'qwen' | 'deepseek'

export type CompressionStrategy = 'none' | 'window' | 'summary' | 'hybrid'

export type AIConfigVersion = 'v1'

export type ProviderCostTier = 'mock' | 'low' | 'medium' | 'high'

export type ProviderErrorCode =
  | 'PROVIDER_UNSUPPORTED'
  | 'PROVIDER_ABORTED'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_RATE_LIMITED'
  | 'PROVIDER_AUTH_FAILED'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_UNKNOWN'

export interface ProviderCapabilities {
  streaming: boolean
  maxTokens: number
  contextLimit: number
  costTier: ProviderCostTier
}

export interface ProviderError extends Error {
  code: ProviderErrorCode
  retryable: boolean
  provider?: string
  cause?: unknown
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
  knowledgeBase?: KnowledgeBase
  promptEngine?: PromptEngine
  promptTemplateId?: string
  knowledgeTopK?: number
}

export interface StreamChunk {
  id: string
  messageId: string
  delta: string
  done: boolean
  index: number
}

export interface ProviderStreamCallbacks {
  onStart?: () => void
  onChunk?: (chunk: StreamChunk) => void
  onFinish?: (fullText: string) => void
  onError?: (error: Error) => void
}

export interface IProvider {
  name: string
  models: string[]
  capabilities: ProviderCapabilities
  streamPrompt?(
    prompt: string,
    request: ChatRequest,
    callbacks: ProviderStreamCallbacks,
    signal?: AbortSignal,
  ): Promise<void>
  streamChat(
    request: ChatRequest,
    callbacks: ProviderStreamCallbacks,
    signal?: AbortSignal,
  ): Promise<void>
}

export type Provider = IProvider

export interface RuntimeEvent {
  type:
    | 'chat:start'
    | 'chat:chunk'
    | 'chat:finish'
    | 'chat:error'
    | 'chat:abort'
    | 'chat:pipeline'
    | 'provider:change'
    | 'config:update'
  payload: unknown
  timestamp: number
}

export type PipelineStepName =
  'context:before' | 'context:after' | 'knowledge:after' | 'prompt:after' | 'provider:before'

export interface PipelineStepEvent {
  traceId: string
  timestamp: number
  step: PipelineStepName
  payload: Record<string, unknown>
}

export interface ProviderCredential {
  id: string
  name: string
  type: AIProviderName
  encryptedRef: string
}

export interface AIConfig {
  version: AIConfigVersion
  provider: AIProviderName
  model: string
  providerCredentials: Partial<Record<AIProviderName, ProviderCredential>>
  temperature: number
  topP: number
  maxTokens: number
  stream: boolean
  enableKnowledge: boolean
  enableCache: boolean
  contextWindow: number
  compressionStrategy: CompressionStrategy
  systemPrompt: string
  knowledgeTopK: number
  requestTimeoutMs: number
  maxRetries: number
}

export type AIConfigPatch = Partial<AIConfig>

export type AIConfigReader = () => AIConfig

export type {
  ChatMessage,
  ChatMessageStatus,
  ChatRole,
  ChatRuntimeState,
  ChatRuntimeStatus,
  ChatSession,
  ChatSnapshot,
  Citation,
  Conversation,
  TokenUsage,
} from './chatSnapshot'
