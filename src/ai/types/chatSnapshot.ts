export type ChatRole = 'system' | 'user' | 'assistant'

export type ChatMessageStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error' | 'cancelled'

export type ChatRuntimeStatus = ChatMessageStatus

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

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  active: boolean
}

export interface ChatRuntimeState {
  messages: ChatMessage[]
  sessions: ChatSession[]
  status: ChatMessageStatus
  activeSessionId: string
}

export interface ChatSnapshot {
  messages: ChatMessage[]
  sessions: ChatSession[]
  status: ChatMessageStatus
  activeSessionId: string
  streaming: boolean
  timestamp: number
}
