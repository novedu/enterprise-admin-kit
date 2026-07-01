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

const STORAGE_KEY = 'enterprise-ai-platform:conversations'

function cloneConversation(conversation: ConversationSnapshot): ConversationSnapshot {
  return {
    ...conversation,
    metadata: {
      ...conversation.metadata,
      traceIds: [...conversation.metadata.traceIds],
    },
  }
}

function readConversations() {
  if (typeof window === 'undefined') return conversationMockList.map(cloneConversation)

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return conversationMockList.map(cloneConversation)

    return (JSON.parse(raw) as ConversationSnapshot[]).map(cloneConversation)
  } catch {
    return conversationMockList.map(cloneConversation)
  }
}

function writeConversations(conversations: ConversationSnapshot[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export class ConversationRepository {
  async listByWorkspace(workspaceId: string) {
    return readConversations().filter((conversation) => conversation.workspaceId === workspaceId)
  }

  async listByApplication(applicationId: string) {
    return readConversations().filter(
      (conversation) => conversation.applicationId === applicationId,
    )
  }

  async findById(id: string) {
    return readConversations().find((conversation) => conversation.id === id) || null
  }

  async create(input: {
    workspaceId: string
    applicationId: string
    title?: string
    providerId?: string
    promptTemplateId?: string
    knowledgeBaseId?: string
  }) {
    const conversations = readConversations()
    const timestamp = Date.now()
    const conversation: ConversationSnapshot = {
      id: createId('conversation'),
      workspaceId: input.workspaceId,
      applicationId: input.applicationId,
      title: input.title?.trim() || 'New conversation',
      messageCount: 0,
      lastMessageAt: timestamp,
      status: 'active',
      metadata: {
        traceIds: [],
        providerId: input.providerId || 'provider-mock',
        promptTemplateId: input.promptTemplateId || '',
        knowledgeBaseId: input.knowledgeBaseId,
        tokenTotal: 0,
      },
    }
    writeConversations([conversation, ...conversations])

    return cloneConversation(conversation)
  }

  async touch(id: string, patch: Partial<Pick<ConversationSnapshot, 'title' | 'messageCount'>>) {
    const conversations = readConversations()
    let updated: ConversationSnapshot | null = null
    const nextConversations = conversations.map((conversation) => {
      if (conversation.id !== id) return conversation

      updated = {
        ...conversation,
        ...patch,
        lastMessageAt: Date.now(),
      }

      return updated
    })

    writeConversations(nextConversations)

    return updated ? cloneConversation(updated) : null
  }

  async delete(id: string) {
    const nextConversations = readConversations().filter((conversation) => conversation.id !== id)
    writeConversations(nextConversations)

    return nextConversations.map(cloneConversation)
  }
}

export const conversationRepository = new ConversationRepository()
