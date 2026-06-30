import { DEFAULT_PROMPT_TEMPLATES } from './templates'
import type { PromptTemplate } from './types'

export class PromptRegistry {
  private templates = new Map<string, PromptTemplate>()

  constructor(templates: PromptTemplate[] = DEFAULT_PROMPT_TEMPLATES) {
    for (const template of templates) {
      this.register(template)
    }
  }

  register(template: PromptTemplate) {
    this.templates.set(template.id, {
      ...template,
      variables: [...template.variables],
    })
  }

  get(templateId: string) {
    const template = this.templates.get(templateId)
    if (!template) return undefined

    return {
      ...template,
      variables: [...template.variables],
    }
  }

  require(templateId: string) {
    const template = this.get(templateId)
    if (!template) {
      throw new Error(`Prompt template ${templateId} does not exist.`)
    }

    return template
  }

  list() {
    return Array.from(this.templates.values()).map((template) => ({
      ...template,
      variables: [...template.variables],
    }))
  }

  remove(templateId: string) {
    this.templates.delete(templateId)
  }

  clear() {
    this.templates.clear()
  }
}
