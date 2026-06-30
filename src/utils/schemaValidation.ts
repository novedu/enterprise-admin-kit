import type { FormSchemaItem, SchemaComponent } from '@/types/schema'
import type { TableColumn, TableSchema } from '@/types/table'

export interface SchemaValidationResult {
  valid: boolean
  errors: string[]
}

const supportedComponents: SchemaComponent[] = ['Input', 'Select', 'Date', 'Radio', 'Upload']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateFormItem(item: unknown, path: string, errors: string[]) {
  if (!isRecord(item)) {
    errors.push(`${path} must be an object`)
    return
  }

  if (typeof item.field !== 'string' || !item.field) {
    errors.push(`${path}.field must be a non-empty string`)
  }

  if (typeof item.label !== 'string' || !item.label) {
    errors.push(`${path}.label must be a non-empty string`)
  }

  if (!supportedComponents.includes(item.component as SchemaComponent)) {
    errors.push(`${path}.component must be one of ${supportedComponents.join(', ')}`)
  }

  if ((item.component === 'Select' || item.component === 'Radio') && !Array.isArray(item.options)) {
    errors.push(`${path}.options is required for ${String(item.component)}`)
  }
}

function validateColumn(item: unknown, path: string, errors: string[]) {
  if (!isRecord(item)) {
    errors.push(`${path} must be an object`)
    return
  }

  if (typeof item.prop !== 'string' || !item.prop) {
    errors.push(`${path}.prop must be a non-empty string`)
  }

  if (typeof item.label !== 'string' || !item.label) {
    errors.push(`${path}.label must be a non-empty string`)
  }
}

export function validateTableSchema(value: unknown): SchemaValidationResult {
  const errors: string[] = []

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ['Schema root must be an object'],
    }
  }

  if (typeof value.rowKey !== 'string' || !value.rowKey) {
    errors.push('rowKey must be a non-empty string')
  }

  if (!Array.isArray(value.search)) {
    errors.push('search must be an array')
  } else {
    value.search.forEach((item, index) => validateFormItem(item, `search[${index}]`, errors))
  }

  if (!Array.isArray(value.form)) {
    errors.push('form must be an array')
  } else {
    value.form.forEach((item, index) => validateFormItem(item, `form[${index}]`, errors))
  }

  if (!Array.isArray(value.columns)) {
    errors.push('columns must be an array')
  } else {
    value.columns.forEach((item, index) => validateColumn(item, `columns[${index}]`, errors))
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function parseTableSchema(json: string): {
  schema: TableSchema | null
  errors: string[]
} {
  try {
    const parsed = JSON.parse(json) as unknown
    const result = validateTableSchema(parsed)

    return {
      schema: result.valid ? (parsed as TableSchema) : null,
      errors: result.errors,
    }
  } catch (error) {
    return {
      schema: null,
      errors: [error instanceof Error ? error.message : 'Invalid JSON'],
    }
  }
}

export const tableSchemaJsonSchema = {
  type: 'object',
  required: ['rowKey', 'search', 'form', 'columns'],
  properties: {
    rowKey: {
      type: 'string',
      description: 'Unique row identifier field.',
    },
    search: {
      type: 'array',
      items: {
        $ref: '#/definitions/formItem',
      },
    },
    form: {
      type: 'array',
      items: {
        $ref: '#/definitions/formItem',
      },
    },
    columns: {
      type: 'array',
      items: {
        type: 'object',
        required: ['prop', 'label'],
        properties: {
          prop: { type: 'string' },
          label: { type: 'string' },
          width: { type: 'number' },
          minWidth: { type: 'number' },
          permission: { type: 'string' },
        },
      },
    },
  },
  definitions: {
    formItem: {
      type: 'object',
      required: ['field', 'component', 'label'],
      properties: {
        field: { type: 'string' },
        component: {
          type: 'string',
          enum: supportedComponents,
        },
        label: { type: 'string' },
        labelKey: { type: 'string' },
        required: { type: 'boolean' },
        hidden: { type: 'boolean' },
        placeholder: { type: 'string' },
        placeholderKey: { type: 'string' },
        permission: { type: 'string' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            required: ['label', 'value'],
            properties: {
              label: { type: 'string' },
              value: {
                oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
              },
            },
          },
        },
        props: { type: 'object' },
      },
    },
  },
}

export function createEmptyRow(schema: TableSchema): Record<string, unknown> {
  return Object.fromEntries(
    schema.form.map((item: FormSchemaItem) => {
      if (item.component === 'Radio' || item.component === 'Select') {
        return [item.field, item.options?.[0]?.value ?? '']
      }

      return [item.field, '']
    }),
  )
}

export function createPreviewRows(schema: TableSchema): Record<string, unknown>[] {
  return Array.from({ length: 4 }).map((_, index) => {
    const row: Record<string, unknown> = {
      [schema.rowKey]: index + 1,
    }

    schema.columns.forEach((column: TableColumn) => {
      row[column.prop] = column.prop === 'status' ? 'active' : `${column.label} ${index + 1}`
    })

    return row
  })
}
