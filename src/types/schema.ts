export type SchemaComponent = 'Input' | 'Select' | 'Date' | 'Radio' | 'Upload'

export interface SchemaOption {
  label: string
  labelKey?: string
  value: string | number | boolean
}

export interface FormSchemaItem {
  field: string
  component: SchemaComponent
  label: string
  labelKey?: string
  required?: boolean
  hidden?: boolean
  placeholder?: string
  placeholderKey?: string
  options?: SchemaOption[]
  props?: Record<string, unknown>
  permission?: string
}

export type FormSchema = FormSchemaItem[]
