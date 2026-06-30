import { get } from '@/services/request'
import type { TableSchema } from '@/types/table'

export function getTableSchema(name: string) {
  return get<TableSchema>(`/schema/${name}`, { loading: false })
}

export function tableSchemaCacheKey(name: string) {
  return ['schema', name] as const
}
