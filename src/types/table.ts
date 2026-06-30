import type { FormSchema } from './schema'

export interface TableColumn {
  prop: string
  label: string
  labelKey?: string
  width?: number
  minWidth?: number
  permission?: string
}

export interface TableSchema {
  search: FormSchema
  form: FormSchema
  columns: TableColumn[]
  rowKey: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}
