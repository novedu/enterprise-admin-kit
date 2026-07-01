import type { CreateWorkspaceInput, Workspace } from './types'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function createWorkspace(input: CreateWorkspaceInput): Workspace {
  const timestamp = Date.now()
  const id = createId('workspace')

  return {
    id,
    name: input.name.trim() || 'Untitled Workspace',
    description: input.description?.trim() || '',
    icon: input.icon || 'Grid',
    color: input.color || '#2563eb',
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'active',
    settings: {
      enableKnowledge: true,
      enableObservability: true,
    },
    applications: [],
    knowledgeRefs: [],
    promptRefs: [],
    providerRefs: [],
    conversationRefs: [],
  }
}

export function renameWorkspace(workspace: Workspace, name: string): Workspace {
  return {
    ...workspace,
    name: name.trim() || workspace.name,
    updatedAt: Date.now(),
  }
}
