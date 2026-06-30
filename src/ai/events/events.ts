import type {
  ChatMessage,
  ChatMessageStatus,
  ChatSnapshot,
  PipelineStepEvent,
  ProviderErrorCode,
  TokenUsage,
} from '@/ai/types'

export type RuntimeEventMap = {
  'chat:snapshot': ChatSnapshot

  'chat:start': {
    traceId?: string
    conversationId: string
    message: ChatMessage
    messages: ChatMessage[]
    status: ChatMessageStatus
  }

  'chat:chunk': {
    traceId?: string
    messageId: string
    chunk: string
    fullText: string
    status: ChatMessageStatus
  }

  'chat:finish': {
    traceId?: string
    messageId: string
    fullText: string
    tokenUsage: TokenUsage
    status: ChatMessageStatus
  }

  'chat:error': {
    traceId?: string
    messageId: string
    error: string
    code?: ProviderErrorCode
    retryable?: boolean
    status: ChatMessageStatus
  }

  'chat:abort': {
    traceId?: string
    messageId: string
    status: ChatMessageStatus
  }

  'chat:pipeline': PipelineStepEvent

  'provider:change': {
    provider: string
    model: string
  }

  'config:update': {
    key: string
    value: unknown
  }
}
