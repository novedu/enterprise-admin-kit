import type { TokenUsage } from '@/ai/types'

import type { TraceTokenUsage } from './types'

export class TokenMonitor {
  private usageByTrace = new Map<string, TraceTokenUsage>()

  record(traceId: string, tokenUsage: TokenUsage) {
    const usage: TraceTokenUsage = {
      traceId,
      promptTokens: tokenUsage.promptTokens,
      completionTokens: tokenUsage.completionTokens,
      totalTokens: tokenUsage.totalTokens,
    }

    this.usageByTrace.set(traceId, usage)

    return usage
  }

  getUsage(traceId: string) {
    const usage = this.usageByTrace.get(traceId)

    return usage ? { ...usage } : undefined
  }

  listUsage() {
    return Array.from(this.usageByTrace.values()).map((usage) => ({ ...usage }))
  }

  clear() {
    this.usageByTrace.clear()
  }

  trimTraces(allowedTraceIds: Set<string>) {
    for (const traceId of this.usageByTrace.keys()) {
      if (!allowedTraceIds.has(traceId)) {
        this.usageByTrace.delete(traceId)
      }
    }
  }
}
