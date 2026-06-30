import type { EventBus } from '@/ai/events/EventBus'
import type { RuntimeEventMap } from '@/ai/events/events'

import { EventTimeline } from './EventTimeline'
import { LatencyTracker } from './LatencyTracker'
import { TokenMonitor } from './TokenMonitor'
import { TraceCollector } from './TraceCollector'
import type {
  ObservableEventName,
  ObservabilityOptions,
  ObservabilitySamplingMode,
  RuntimeInspectionSnapshot,
  RuntimeMetadata,
} from './types'
import { createTraceId } from './utils'

const UNKNOWN_METADATA: RuntimeMetadata = {
  provider: 'unknown',
  model: 'unknown',
}

function resolveMetadata(options: ObservabilityOptions): RuntimeMetadata {
  return {
    ...UNKNOWN_METADATA,
    ...options.metadataResolver?.(),
  }
}

function shouldRecordChunk(index: number, mode: ObservabilitySamplingMode) {
  if (mode === 'debug') return true
  if (mode === 'normal') return index < 20 || index % 5 === 0
  return index < 5 || index % 20 === 0
}

export class RuntimeInspector {
  readonly traceCollector: TraceCollector
  readonly timeline: EventTimeline
  readonly tokenMonitor: TokenMonitor
  readonly latencyTracker: LatencyTracker

  private unsubscribeHandlers: Array<() => void> = []
  private samplingMode: ObservabilitySamplingMode

  constructor(
    private eventBus: EventBus,
    private options: ObservabilityOptions = {},
  ) {
    const now = options.now ?? Date.now
    this.samplingMode = options.samplingMode ?? 'normal'
    this.traceCollector = new TraceCollector(
      now,
      options.createTraceId ?? createTraceId,
      options.maxTraces ?? 100,
    )
    this.timeline = new EventTimeline(now, options.maxEventsPerTrace ?? 120)
    this.tokenMonitor = new TokenMonitor()
    this.latencyTracker = new LatencyTracker(now)
  }

  start() {
    if (this.unsubscribeHandlers.length) return

    this.listen('chat:start', (payload) => this.handleStart(payload))
    this.listen('chat:chunk', (payload) => this.handleChunk(payload))
    this.listen('chat:finish', (payload) => this.handleFinish(payload))
    this.listen('chat:error', (payload) => this.handleError(payload))
    this.listen('chat:abort', (payload) => this.handleAbort(payload))
    this.listen('chat:pipeline', (payload) => this.handlePipeline(payload))
  }

  stop() {
    for (const unsubscribe of this.unsubscribeHandlers) {
      unsubscribe()
    }

    this.unsubscribeHandlers = []
  }

  getSnapshot(): RuntimeInspectionSnapshot {
    return {
      traces: this.traceCollector.listTraces(),
      events: this.timeline.listEvents(),
      tokenUsage: this.tokenMonitor.listUsage(),
      latency: this.latencyTracker.listMetrics(),
    }
  }

  clear() {
    this.traceCollector.clear()
    this.timeline.clear()
    this.tokenMonitor.clear()
    this.latencyTracker.clear()
  }

  private listen<K extends ObservableEventName>(
    event: K,
    callback: (payload: RuntimeEventMap[K]) => void,
  ) {
    this.eventBus.on(event, callback)
    this.unsubscribeHandlers.push(() => this.eventBus.off(event, callback))
  }

  private handleStart(payload: RuntimeEventMap['chat:start']) {
    const trace = this.traceCollector.startTrace(
      {
        conversationId: payload.conversationId,
        messageId: payload.message.id,
        traceId: payload.traceId,
        status: payload.status,
      },
      resolveMetadata(this.options),
    )

    this.latencyTracker.start(trace.traceId)
    this.timeline.record(trace.traceId, 'chat:start', payload)
    this.trimToActiveTraces()
  }

  private handleChunk(payload: RuntimeEventMap['chat:chunk']) {
    const traceId = this.traceCollector.getTraceIdByMessage(payload.messageId)
    if (!traceId) return

    this.latencyTracker.recordChunk(traceId)
    const index = this.latencyTracker.getMetrics(traceId)?.chunkCount ?? 0
    if (shouldRecordChunk(index, this.samplingMode)) {
      this.timeline.record(traceId, 'chat:chunk', payload)
    }
  }

  private handleFinish(payload: RuntimeEventMap['chat:finish']) {
    const traceId = this.traceCollector.getTraceIdByMessage(payload.messageId)
    if (!traceId) return

    this.tokenMonitor.record(traceId, payload.tokenUsage)
    this.latencyTracker.finish(traceId)
    this.traceCollector.finishTrace(traceId, 'done')
    this.timeline.record(traceId, 'chat:finish', payload)
    this.trimToActiveTraces()
  }

  private handleError(payload: RuntimeEventMap['chat:error']) {
    const traceId = this.traceCollector.getTraceIdByMessage(payload.messageId)
    if (!traceId) return

    this.latencyTracker.finish(traceId)
    this.traceCollector.finishTrace(traceId, 'error')
    this.timeline.record(traceId, 'chat:error', payload)
    this.trimToActiveTraces()
  }

  private handleAbort(payload: RuntimeEventMap['chat:abort']) {
    const traceId = this.traceCollector.getTraceIdByMessage(payload.messageId)
    if (!traceId) return

    this.latencyTracker.finish(traceId)
    this.traceCollector.finishTrace(traceId, 'cancelled')
    this.timeline.record(traceId, 'chat:abort', payload)
    this.trimToActiveTraces()
  }

  private handlePipeline(payload: RuntimeEventMap['chat:pipeline']) {
    this.timeline.record(payload.traceId, 'chat:pipeline', payload)
  }

  private trimToActiveTraces() {
    const activeTraceIds = this.traceCollector.getActiveTraceIds()
    this.timeline.trimTraces(activeTraceIds)
    this.tokenMonitor.trimTraces(activeTraceIds)
    this.latencyTracker.trimTraces(activeTraceIds)
  }
}
