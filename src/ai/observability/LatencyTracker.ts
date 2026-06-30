import type { LatencyMetrics } from './types'

export class LatencyTracker {
  private metrics = new Map<string, LatencyMetrics>()

  constructor(private now: () => number = Date.now) {}

  start(traceId: string) {
    const metrics: LatencyMetrics = {
      traceId,
      startTime: this.now(),
      chunkCount: 0,
      chunkRate: 0,
    }

    this.metrics.set(traceId, metrics)

    return { ...metrics }
  }

  recordChunk(traceId: string) {
    const metrics = this.metrics.get(traceId)
    if (!metrics) return

    const timestamp = this.now()
    if (metrics.firstTokenTime === undefined) {
      metrics.firstTokenTime = timestamp
      metrics.timeToFirstToken = timestamp - metrics.startTime
    }

    metrics.chunkCount += 1
    metrics.streamingDuration = timestamp - metrics.firstTokenTime
    metrics.chunkRate = this.calculateChunkRate(metrics)
  }

  finish(traceId: string) {
    const metrics = this.metrics.get(traceId)
    if (!metrics) return

    const endTime = this.now()
    metrics.endTime = endTime
    metrics.totalRequestTime = endTime - metrics.startTime
    metrics.streamingDuration =
      metrics.firstTokenTime === undefined ? 0 : endTime - metrics.firstTokenTime
    metrics.chunkRate = this.calculateChunkRate(metrics)
  }

  getMetrics(traceId: string) {
    const metrics = this.metrics.get(traceId)

    return metrics ? { ...metrics } : undefined
  }

  listMetrics() {
    return Array.from(this.metrics.values()).map((metrics) => ({ ...metrics }))
  }

  clear() {
    this.metrics.clear()
  }

  private calculateChunkRate(metrics: LatencyMetrics) {
    const durationMs = metrics.streamingDuration ?? 0
    if (durationMs <= 0) return metrics.chunkCount

    return metrics.chunkCount / (durationMs / 1000)
  }
}
