import type { RuntimeMetadata, RuntimeTrace, TraceEventPayload, TraceStatus } from './types'
import { createTraceId } from './utils'

export class TraceCollector {
  private traces = new Map<string, RuntimeTrace>()
  private messageTraceMap = new Map<string, string>()

  constructor(
    private now: () => number = Date.now,
    private makeTraceId: () => string = createTraceId,
  ) {}

  startTrace(payload: TraceEventPayload, metadata: RuntimeMetadata) {
    const traceId = this.makeTraceId()
    const startTime = this.now()
    const trace: RuntimeTrace = {
      traceId,
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      startTime,
      provider: metadata.provider,
      model: metadata.model,
      status: 'running',
    }

    this.traces.set(traceId, trace)

    if (payload.messageId) {
      this.messageTraceMap.set(payload.messageId, traceId)
    }

    return trace
  }

  finishTrace(traceId: string, status: TraceStatus) {
    const trace = this.traces.get(traceId)
    if (!trace) return

    const endTime = this.now()
    trace.endTime = endTime
    trace.duration = endTime - trace.startTime
    trace.status = status
  }

  getTraceIdByMessage(messageId?: string) {
    if (!messageId) return undefined

    return this.messageTraceMap.get(messageId)
  }

  getTrace(traceId: string) {
    const trace = this.traces.get(traceId)

    return trace ? { ...trace } : undefined
  }

  listTraces() {
    return Array.from(this.traces.values()).map((trace) => ({ ...trace }))
  }

  clear() {
    this.traces.clear()
    this.messageTraceMap.clear()
  }
}
