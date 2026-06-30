import type { ChatMessageStatus, ChatRequest, IProvider, ProviderError } from '@/ai/types'

import { normalizeProviderError } from '@/ai/providers/errors'

const allowedTransitions: Record<ChatMessageStatus, ChatMessageStatus[]> = {
  idle: ['loading', 'done', 'error', 'cancelled', 'idle'],
  loading: ['streaming', 'done', 'error', 'cancelled'],
  streaming: ['done', 'error', 'cancelled'],
  done: ['loading', 'idle', 'done'],
  error: ['loading', 'idle', 'error'],
  cancelled: ['loading', 'idle', 'cancelled'],
}

export interface RuntimeGuardLimits {
  maxRetries: number
  requestTimeoutMs: number
}

export class RuntimeGuard {
  private failureCount = 0
  private circuitOpenedAt = 0

  constructor(
    private provider: IProvider,
    private limits: RuntimeGuardLimits,
  ) {}

  update(provider: IProvider, limits: RuntimeGuardLimits) {
    this.provider = provider
    this.limits = limits
  }

  assertTransition(from: ChatMessageStatus, to: ChatMessageStatus) {
    if (!allowedTransitions[from]?.includes(to)) {
      throw new Error(`Invalid chat state transition: ${from} -> ${to}`)
    }
  }

  assertPipelineReady(request: ChatRequest, contextTokens: number) {
    if (this.isCircuitOpen()) {
      throw new Error('Runtime circuit breaker is open after repeated provider failures.')
    }

    if (request.maxTokens && request.maxTokens > this.provider.capabilities.maxTokens) {
      throw new Error(
        `Requested maxTokens ${request.maxTokens} exceeds provider limit ${this.provider.capabilities.maxTokens}.`,
      )
    }

    if (contextTokens > this.provider.capabilities.contextLimit) {
      throw new Error(
        `Context tokens ${contextTokens} exceed provider context limit ${this.provider.capabilities.contextLimit}.`,
      )
    }
  }

  canRetry(retryCount: number) {
    return retryCount < this.limits.maxRetries
  }

  createTimeoutSignal(parentSignal: AbortSignal) {
    const controller = new AbortController()
    let timedOut = false
    const timeout = globalThis.setTimeout(() => {
      timedOut = true
      controller.abort(new Error(`Request timed out after ${this.limits.requestTimeoutMs}ms.`))
    }, this.limits.requestTimeoutMs)

    const abort = () => controller.abort(parentSignal.reason)
    parentSignal.addEventListener('abort', abort, { once: true })

    return {
      signal: controller.signal,
      cleanup: () => {
        globalThis.clearTimeout(timeout)
        parentSignal.removeEventListener('abort', abort)
      },
      isTimedOut: () => timedOut,
    }
  }

  recordFailure(error: unknown): ProviderError {
    const normalizedError = normalizeProviderError(error, this.provider.name)

    if (normalizedError.retryable) {
      this.failureCount += 1
    } else {
      this.failureCount = 0
    }

    if (this.failureCount >= 3) {
      this.circuitOpenedAt = Date.now()
    }

    return normalizedError
  }

  recordSuccess() {
    this.failureCount = 0
    this.circuitOpenedAt = 0
  }

  private isCircuitOpen() {
    if (!this.circuitOpenedAt) return false

    if (Date.now() - this.circuitOpenedAt > 30_000) {
      this.circuitOpenedAt = 0
      this.failureCount = 0
      return false
    }

    return true
  }
}
