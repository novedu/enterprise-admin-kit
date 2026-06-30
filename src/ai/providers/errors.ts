import type { ProviderError, ProviderErrorCode } from '@/ai/types'

const RETRYABLE_CODES = new Set<ProviderErrorCode>([
  'PROVIDER_TIMEOUT',
  'PROVIDER_RATE_LIMITED',
  'PROVIDER_UNAVAILABLE',
  'PROVIDER_UNKNOWN',
])

export class NormalizedProviderError extends Error implements ProviderError {
  code: ProviderErrorCode
  retryable: boolean
  provider?: string
  cause?: unknown

  constructor(
    message: string,
    options: {
      code?: ProviderErrorCode
      retryable?: boolean
      provider?: string
      cause?: unknown
    } = {},
  ) {
    super(message)
    this.name = 'ProviderError'
    this.code = options.code ?? 'PROVIDER_UNKNOWN'
    this.retryable = options.retryable ?? RETRYABLE_CODES.has(this.code)
    this.provider = options.provider
    this.cause = options.cause
  }
}

export function createProviderError(
  message: string,
  code: ProviderErrorCode,
  provider?: string,
  cause?: unknown,
) {
  return new NormalizedProviderError(message, {
    code,
    provider,
    cause,
  })
}

export function normalizeProviderError(error: unknown, provider?: string): ProviderError {
  if (isProviderError(error)) {
    return error
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new NormalizedProviderError('Provider request was aborted.', {
      code: 'PROVIDER_ABORTED',
      retryable: false,
      provider,
      cause: error,
    })
  }

  if (error instanceof Error && /timeout/i.test(error.message)) {
    return new NormalizedProviderError(error.message, {
      code: 'PROVIDER_TIMEOUT',
      provider,
      cause: error,
    })
  }

  const message = error instanceof Error ? error.message : String(error)

  return new NormalizedProviderError(message || 'Unknown provider error.', {
    code: 'PROVIDER_UNKNOWN',
    provider,
    cause: error,
  })
}

function isProviderError(error: unknown): error is ProviderError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as ProviderError).code === 'string' &&
    'retryable' in error &&
    typeof (error as ProviderError).retryable === 'boolean'
  )
}
