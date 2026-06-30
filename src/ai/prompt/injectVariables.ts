const VARIABLE_PATTERN = /\{\{\s*([\w.-]+)\s*\}\}/g

function resolvePathValue(source: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key]
    }

    return undefined
  }, source)
}

function stringifyValue(value: unknown) {
  if (value === undefined || value === null) return ''
  if (Array.isArray(value)) return value.join('\n')
  if (typeof value === 'object') return JSON.stringify(value, null, 2)

  return String(value)
}

export function extractTemplateVariables(template: string) {
  const variables = new Set<string>()

  for (const match of template.matchAll(VARIABLE_PATTERN)) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

export function injectVariables(template: string, variables: Record<string, unknown>) {
  return template.replace(VARIABLE_PATTERN, (_, variableName: string) =>
    stringifyValue(resolvePathValue(variables, variableName)),
  )
}
