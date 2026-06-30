import { computed, onMounted, ref, shallowRef, unref, watch, type MaybeRefOrGetter } from 'vue'

import {
  fetchWithCache,
  getCacheEntry,
  invalidateCache,
  isCacheStale,
  removeCache,
  type RequestCacheKey,
  type RequestCacheOptions,
} from '@/utils/requestCache'

export interface UseRequestCacheOptions<T> extends RequestCacheOptions {
  enabled?: MaybeRefOrGetter<boolean>
  immediate?: boolean
  initialData?: T
}

function resolveValue<T>(value: MaybeRefOrGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : unref(value)
}

export function useRequestCache<T>(
  key: MaybeRefOrGetter<RequestCacheKey>,
  fetcher: () => Promise<T>,
  options: UseRequestCacheOptions<T> = {},
) {
  const data = shallowRef<T | undefined>(options.initialData)
  const error = ref<unknown>()
  const loading = ref(false)
  const updatedAt = ref(0)

  const enabled = computed(() => resolveValue(options.enabled ?? true))
  const cacheKey = computed(() => resolveValue(key))
  const staleTime = computed(() => options.staleTime ?? 30_000)
  const isStale = computed(() => isCacheStale(cacheKey.value, staleTime.value))

  async function execute(force = false) {
    if (!enabled.value) return data.value

    const entry = getCacheEntry<T>(cacheKey.value)
    if (!force && entry?.data !== undefined && !isStale.value) {
      data.value = entry.data
      updatedAt.value = entry.updatedAt
      return data.value
    }

    loading.value = true
    error.value = undefined

    try {
      if (force) {
        invalidateCache(cacheKey.value)
      }

      const result = await fetchWithCache(cacheKey.value, fetcher, options)
      data.value = result
      updatedAt.value = getCacheEntry<T>(cacheKey.value)?.updatedAt || Date.now()
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  function refetch() {
    return execute(true)
  }

  function invalidate() {
    invalidateCache(cacheKey.value)
  }

  function remove() {
    removeCache(cacheKey.value)
    data.value = undefined
    updatedAt.value = 0
  }

  watch(cacheKey, () => {
    if (options.immediate !== false) {
      execute()
    }
  })

  onMounted(() => {
    if (options.immediate !== false) {
      execute()
    }
  })

  return {
    data,
    error,
    loading,
    updatedAt,
    isStale,
    refetch,
    invalidate,
    remove,
    execute,
  }
}
