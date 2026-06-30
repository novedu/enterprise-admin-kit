export type RuntimeEventMap = {
  'chat:start': {
    conversationId: string
  }

  'chat:chunk': {
    messageId: string
    chunk: string
  }

  'chat:finish': {
    messageId: string
    fullText: string
  }

  'chat:error': {
    messageId: string
    error: string
  }

  'chat:abort': {
    messageId: string
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
