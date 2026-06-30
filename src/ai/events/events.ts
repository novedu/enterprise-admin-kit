import type { ChatMessage, ChatMessageStatus, TokenUsage } from '@/ai/types'

export type RuntimeEventMap = {
  'chat:start': {
    conversationId: string
    message: ChatMessage
    messages: ChatMessage[]
    status: ChatMessageStatus
  }

  'chat:chunk': {
    messageId: string
    chunk: string
    fullText: string
    status: ChatMessageStatus
  }

  'chat:finish': {
    messageId: string
    fullText: string
    tokenUsage: TokenUsage
    status: ChatMessageStatus
  }

  'chat:error': {
    messageId: string
    error: string
    status: ChatMessageStatus
  }

  'chat:abort': {
    messageId: string
    status: ChatMessageStatus
  }

  'provider:change': {
    provider: string
    model: string
  }

  'config:update': {
    key: string
    value: unknown
  }
}
