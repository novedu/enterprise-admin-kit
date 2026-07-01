export interface ConversationMetadata {
  traceIds: string[]
  providerId: string
  promptTemplateId: string
  knowledgeBaseId?: string
  tokenTotal: number
}

export interface ConversationSummary {
  id: string
  workspaceId: string
  applicationId: string
  title: string
  messageCount: number
  lastMessageAt: number
  status: 'active' | 'archived' | 'error'
}

export interface ConversationSnapshot extends ConversationSummary {
  metadata: ConversationMetadata
}

const conversationMockList: ConversationSnapshot[] = [
  {
    id: 'conversation-runtime-review',
    workspaceId: 'workspace-enterprise-ai',
    applicationId: 'app-erp-copilot',
    title: 'Runtime architecture review',
    messageCount: 8,
    lastMessageAt: 1_735_690_200_000,
    status: 'active',
    metadata: {
      traceIds: ['trace-runtime-001'],
      providerId: 'provider-mock',
      promptTemplateId: 'prompt-runtime-assistant',
      knowledgeBaseId: 'kb-runtime-docs',
      tokenTotal: 1824,
    },
  },
  {
    id: 'conversation-hr-policy',
    workspaceId: 'workspace-people-ops',
    applicationId: 'app-hr-assistant',
    title: 'Annual leave policy',
    messageCount: 5,
    lastMessageAt: 1_735_691_100_000,
    status: 'active',
    metadata: {
      traceIds: ['trace-hr-001'],
      providerId: 'provider-mock',
      promptTemplateId: 'prompt-hr-assistant',
      knowledgeBaseId: 'kb-hr-policy',
      tokenTotal: 962,
    },
  },
  {
    id: 'conversation-crm-summary',
    workspaceId: 'workspace-revenue',
    applicationId: 'app-crm-assistant',
    title: 'Customer renewal summary',
    messageCount: 6,
    lastMessageAt: 1_735_691_800_000,
    status: 'active',
    metadata: {
      traceIds: ['trace-crm-001'],
      providerId: 'provider-mock',
      promptTemplateId: 'prompt-crm-assistant',
      tokenTotal: 1240,
    },
  },
]

export class ConversationRepository {
  async listByWorkspace(workspaceId: string) {
    return conversationMockList.filter((conversation) => conversation.workspaceId === workspaceId)
  }

  async listByApplication(applicationId: string) {
    return conversationMockList.filter(
      (conversation) => conversation.applicationId === applicationId,
    )
  }

  async findById(id: string) {
    return conversationMockList.find((conversation) => conversation.id === id) || null
  }
}

export const conversationRepository = new ConversationRepository()
