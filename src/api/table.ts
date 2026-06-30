import { get, post } from '@/services/request'
import type { PageResult } from '@/types/table'
import { invalidateCacheByPrefix } from '@/utils/requestCache'

export function tablePageCacheKey(api: string, params: Record<string, unknown>) {
  return ['table-page', api, params] as const
}

export function invalidateTableCache(api: string) {
  invalidateCacheByPrefix(['table-page', api])
}

export function getPage<T>(api: string, params: Record<string, unknown>) {
  return get<PageResult<T>>(api, {
    params,
    loading: false,
    retry: 1,
  })
}

export async function createRow<T>(api: string, data: Partial<T>) {
  const result = await post<T>(api, data)
  invalidateTableCache(api)
  return result
}

export async function updateRow<T extends { id?: number }>(api: string, data: Partial<T>) {
  const result = await post<T>(`${api}/${data.id}`, data)
  invalidateTableCache(api)
  return result
}

export async function deleteRow(api: string, id: number) {
  const result = await post<boolean>(`${api}/${id}/delete`)
  invalidateTableCache(api)
  return result
}
