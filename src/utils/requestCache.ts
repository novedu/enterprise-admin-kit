export type RequestCacheKey = string | readonly unknown[]

export interface RequestCacheOptions {
  staleTime?: number
  cacheTime?: number
}

interface CacheEntry<T> {
  data?: T
  error?: unknown
  promise?: Promise<T>
  updatedAt: number
  timer?: ReturnType<typeof globalThis.setTimeout>
}

const defaultStaleTime = 30_000
const defaultCacheTime = 5 * 60_000
const cache = new Map<string, CacheEntry<unknown>>()

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`

  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`
}

export function createCacheKey(key: RequestCacheKey) {
  return typeof key === 'string' ? key : stableStringify(key)
}

function scheduleGarbageCollection(cacheKey: string, cacheTime: number) {
  const entry = cache.get(cacheKey)
  if (!entry) return

  if (entry.timer) {
    globalThis.clearTimeout(entry.timer)
  }

  entry.timer = globalThis.setTimeout(() => {
    cache.delete(cacheKey)
  }, cacheTime)
}

export function getCacheEntry<T>(key: RequestCacheKey) {
  return cache.get(createCacheKey(key)) as CacheEntry<T> | undefined
}

export function isCacheStale(key: RequestCacheKey, staleTime = defaultStaleTime) {
  const entry = getCacheEntry(key)
  if (!entry || entry.data === undefined) return true
  return Date.now() - entry.updatedAt > staleTime
}

export async function fetchWithCache<T>(
  key: RequestCacheKey,
  fetcher: () => Promise<T>,
  options: RequestCacheOptions = {},
): Promise<T> {
  const cacheKey = createCacheKey(key)
  const staleTime = options.staleTime ?? defaultStaleTime
  const cacheTime = options.cacheTime ?? defaultCacheTime
  const current = cache.get(cacheKey) as CacheEntry<T> | undefined

  if (current?.data !== undefined && Date.now() - current.updatedAt <= staleTime) {
    scheduleGarbageCollection(cacheKey, cacheTime)
    return current.data
  }

  if (current?.promise) {
    return current.promise
  }

  const entry: CacheEntry<T> = current || {
    updatedAt: 0,
  }

  entry.promise = fetcher()
    .then((data) => {
      entry.data = data
      entry.error = undefined
      entry.updatedAt = Date.now()
      return data
    })
    .catch((error) => {
      entry.error = error
      throw error
    })
    .finally(() => {
      entry.promise = undefined
      scheduleGarbageCollection(cacheKey, cacheTime)
    })

  cache.set(cacheKey, entry as CacheEntry<unknown>)
  return entry.promise
}

export function setCacheData<T>(key: RequestCacheKey, data: T, options: RequestCacheOptions = {}) {
  const cacheKey = createCacheKey(key)
  const entry: CacheEntry<T> = {
    data,
    updatedAt: Date.now(),
  }

  cache.set(cacheKey, entry as CacheEntry<unknown>)
  scheduleGarbageCollection(cacheKey, options.cacheTime ?? defaultCacheTime)
}

export function invalidateCache(key?: RequestCacheKey) {
  if (!key) {
    cache.forEach((entry) => {
      entry.updatedAt = 0
    })
    return
  }

  const entry = cache.get(createCacheKey(key))
  if (entry) {
    entry.updatedAt = 0
  }
}

export function invalidateCacheByPrefix(prefix: RequestCacheKey) {
  const prefixKey = createCacheKey(prefix)
  const normalizedPrefix = Array.isArray(prefix) ? prefixKey.slice(0, -1) : prefixKey

  cache.forEach((entry, key) => {
    if (key.startsWith(normalizedPrefix)) {
      entry.updatedAt = 0
    }
  })
}

export function removeCache(key?: RequestCacheKey) {
  if (!key) {
    cache.forEach((entry) => {
      if (entry.timer) globalThis.clearTimeout(entry.timer)
    })
    cache.clear()
    return
  }

  const cacheKey = createCacheKey(key)
  const entry = cache.get(cacheKey)
  if (entry?.timer) globalThis.clearTimeout(entry.timer)
  cache.delete(cacheKey)
}

export function getCacheSnapshot() {
  return Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    hasData: entry.data !== undefined,
    hasError: entry.error !== undefined,
    pending: Boolean(entry.promise),
    updatedAt: entry.updatedAt,
  }))
}
