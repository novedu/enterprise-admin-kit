import type { PromptTemplate } from './types'

export const DEFAULT_CHAT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'default-chat',
  name: 'Default Chat Prompt',
  type: 'chat',
  version: '1.0.0',
  variables: ['systemPrompt', 'conversationSystemPrompt', 'context', 'input'],
  template: `{{systemPrompt}}

{{conversationSystemPrompt}}

Context:
{{context}}

User:
{{input}}`,
}

export const DEFAULT_RAG_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'default-rag',
  name: 'Default RAG Prompt',
  type: 'rag',
  version: '1.0.0',
  variables: ['systemPrompt', 'context', 'knowledge', 'citations', 'input'],
  template: `{{systemPrompt}}

Use the knowledge section when it is relevant. Cite sources from the citation section.

Context:
{{context}}

Knowledge:
{{knowledge}}

Citations:
{{citations}}

User:
{{input}}`,
}

export const DEFAULT_AGENT_PROMPT_TEMPLATE: PromptTemplate = {
  id: 'default-agent',
  name: 'Default Agent Prompt',
  type: 'agent',
  version: '0.1.0',
  variables: ['systemPrompt', 'goal', 'tools', 'input'],
  template: `{{systemPrompt}}

Goal:
{{goal}}

Available tools:
{{tools}}

User:
{{input}}`,
}

export const DEFAULT_PROMPT_TEMPLATES = [
  DEFAULT_CHAT_PROMPT_TEMPLATE,
  DEFAULT_RAG_PROMPT_TEMPLATE,
  DEFAULT_AGENT_PROMPT_TEMPLATE,
]
