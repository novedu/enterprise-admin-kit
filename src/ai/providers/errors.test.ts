import { describe, expect, it } from 'vitest'

import { createProviderError, normalizeProviderError } from './errors'

describe('provider error normalization', () => {
  it('normalizes abort and unsupported provider errors', () => {
    const abort = normalizeProviderError(new DOMException('Aborted', 'AbortError'), 'mock')
    const unsupported = createProviderError(
      'Provider is not implemented.',
      'PROVIDER_UNSUPPORTED',
      'openai',
    )

    expect(abort).toMatchObject({
      code: 'PROVIDER_ABORTED',
      retryable: false,
      provider: 'mock',
    })
    expect(unsupported).toMatchObject({
      code: 'PROVIDER_UNSUPPORTED',
      retryable: false,
      provider: 'openai',
    })
  })
})
