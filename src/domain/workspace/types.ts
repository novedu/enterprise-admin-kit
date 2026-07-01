export type WorkspaceStatus = 'active' | 'archived' | 'disabled'

export interface WorkspaceSettings {
  defaultApplicationId?: string
  defaultProviderId?: string
  enableKnowledge: boolean
  enableObservability: boolean
}

export interface Workspace {
  id: string
  name: string
  description: string
  icon: string
  color: string
  createdAt: number
  updatedAt: number
  status: WorkspaceStatus
  settings: WorkspaceSettings
  applications: string[]
  knowledgeRefs: string[]
  promptRefs: string[]
  providerRefs: string[]
  conversationRefs: string[]
}

export interface CreateWorkspaceInput {
  name: string
  description?: string
  icon?: string
  color?: string
}
