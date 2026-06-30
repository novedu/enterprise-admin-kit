import type { RuntimeEventMap } from '@/ai/events/events'
import type { ChatMessageStatus, TokenUsage } from '@/ai/types'

export type ObservableEventName =
  'chat:start' | 'chat:chunk' | 'chat:finish' | 'chat:error' | 'chat:abort' | 'chat:pipeline'

export type TraceStatus = 'running' | 'done' | 'error' | 'cancelled'

export type ObservabilitySamplingMode = 'debug' | 'normal' | 'production'

export interface RuntimeMetadata {
  provider: string
  model: string
}

export interface RuntimeTrace {
  traceId: string
  conversationId?: string
  messageId?: string
  startTime: number
  endTime?: number
  duration?: number
  provider: string
  model: string
  status: TraceStatus
}

export interface TimelineEvent<K extends ObservableEventName = ObservableEventName> {
  traceId: string
  type: K
  timestamp: number
  payload: RuntimeEventMap[K]
}

export interface LatencyMetrics {
  traceId: string
  startTime: number
  firstTokenTime?: number
  endTime?: number
  timeToFirstToken?: number
  streamingDuration?: number
  totalRequestTime?: number
  chunkCount: number
  chunkRate: number
}

export interface TraceTokenUsage {
  traceId: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface RuntimeInspectionSnapshot {
  traces: RuntimeTrace[]
  events: TimelineEvent[]
  tokenUsage: TraceTokenUsage[]
  latency: LatencyMetrics[]
}

export interface ObservabilityOptions {
  now?: () => number
  metadataResolver?: () => Partial<RuntimeMetadata>
  createTraceId?: () => string
  maxTraces?: number
  maxEventsPerTrace?: number
  samplingMode?: ObservabilitySamplingMode
}

export interface TraceEventPayload {
  traceId?: string
  messageId?: string
  conversationId?: string
  status?: ChatMessageStatus
  tokenUsage?: TokenUsage
}
