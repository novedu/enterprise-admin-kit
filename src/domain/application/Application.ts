export type ApplicationType = 'erp-copilot' | 'hr-assistant' | 'crm-assistant' | 'knowledge-qa'

export interface Application {
  id: string
  workspaceId: string
  name: string
  description: string
  type: ApplicationType
  icon: string
  runtimeConfigId: string
  providerId: string
  knowledgeBaseId: string
  promptTemplateId: string
  createdAt: number
  updatedAt: number
}

export interface CreateApplicationInput {
  workspaceId: string
  name: string
  description?: string
  type: ApplicationType
  icon?: string
  runtimeConfigId?: string
  providerId?: string
  knowledgeBaseId?: string
  promptTemplateId?: string
}
