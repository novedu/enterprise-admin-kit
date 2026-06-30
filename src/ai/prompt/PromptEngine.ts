import { injectVariables } from './injectVariables'
import { PromptRegistry } from './PromptRegistry'
import type { BuildPromptOptions, PromptContext, PromptTemplate } from './types'

function compactSections(sections: Array<string | undefined>) {
  return sections
    .map((section) => section?.trim())
    .filter(Boolean)
    .join('\n\n')
}

function formatKnowledge(context: PromptContext) {
  return context.retrievedDocuments
    ?.map((chunk, index) => `[${index + 1}] ${chunk.content}`)
    .join('\n\n')
}

function formatCitations(context: PromptContext) {
  return context.citations
    ?.map((citation, index) => `[${index + 1}] ${citation.source}: ${citation.content}`)
    .join('\n')
}

export class PromptEngine {
  constructor(private registry = new PromptRegistry()) {}

  register(template: PromptTemplate) {
    this.registry.register(template)
  }

  getTemplate(templateId: string) {
    return this.registry.get(templateId)
  }

  listTemplates() {
    return this.registry.list()
  }

  build(templateId: string, variables: Record<string, unknown> = {}) {
    const template = this.registry.require(templateId)

    return injectVariables(template.template, variables).trim()
  }

  buildFromContext(templateId: string, context: PromptContext, options: BuildPromptOptions = {}) {
    const variables = this.createVariables(context, options)

    return this.build(templateId, variables)
  }

  createVariables(context: PromptContext, options: BuildPromptOptions = {}) {
    const systemPrompt = compactSections([
      options.systemPrompt,
      context.systemPrompt,
      options.conversationSystemPrompt,
      context.conversationSystemPrompt,
    ])

    return {
      ...context.variables,
      systemPrompt,
      conversationSystemPrompt: context.conversationSystemPrompt ?? '',
      input: context.userPrompt ?? '',
      knowledge: formatKnowledge(context) ?? '',
      citations: formatCitations(context) ?? '',
      context: context.variables?.context ?? '',
    }
  }
}
