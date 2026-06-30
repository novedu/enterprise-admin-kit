import { describe, expect, it, vi } from 'vitest'

import { fetchWithCache, removeCache } from './requestCache'

describe('requestCache', () => {
  it('deduplicates in-flight requests with the same key', async () => {
    removeCache()
    const fetcher = vi.fn(async () => 'cached-result')

    const [first, second] = await Promise.all([
      fetchWithCache(['demo', 1], fetcher),
      fetchWithCache(['demo', 1], fetcher),
    ])

    expect(first).toBe('cached-result')
    expect(second).toBe('cached-result')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
