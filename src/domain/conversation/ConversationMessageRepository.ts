import type { ChatMessage } from '@/ai/types'

export interface ConversationMessage extends ChatMessage {
  workspaceId: string
  applicationId: string
  conversationId: string
}

const STORAGE_KEY = 'enterprise-ai-platform:conversation-messages'

function cloneMessage(message: ConversationMessage): ConversationMessage {
  return {
    ...message,
    tokenUsage: message.tokenUsage ? { ...message.tokenUsage } : undefined,
    citations: message.citations?.map((citation) => ({ ...citation })),
    metadata: message.metadata ? { ...message.metadata } : undefined,
  }
}

function readMessages() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    return (JSON.parse(raw) as ConversationMessage[]).map(cloneMessage)
  } catch {
    return []
  }
}

function writeMessages(messages: ConversationMessage[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}

function toConversationMessage(input: {
  workspaceId: string
  applicationId: string
  conversationId: string
  message: ChatMessage
}): ConversationMessage {
  return cloneMessage({
    ...input.message,
    workspaceId: input.workspaceId,
    applicationId: input.applicationId,
    conversationId: input.conversationId,
  })
}

export class ConversationMessageRepository {
  async listByConversation(conversationId: string) {
    return readMessages()
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(cloneMessage)
  }

  async saveSnapshot(input: {
    workspaceId: string
    applicationId: string
    conversationId: string
    messages: ChatMessage[]
  }) {
    const scopedMessages = input.messages.map((message) =>
      toConversationMessage({
        workspaceId: input.workspaceId,
        applicationId: input.applicationId,
        conversationId: input.conversationId,
        message,
      }),
    )
    const otherMessages = readMessages().filter(
      (message) => message.conversationId !== input.conversationId,
    )

    writeMessages([...otherMessages, ...scopedMessages])

    return scopedMessages.map(cloneMessage)
  }

  async deleteByConversation(conversationId: string) {
    const nextMessages = readMessages().filter(
      (message) => message.conversationId !== conversationId,
    )
    writeMessages(nextMessages)
  }
}

export const conversationMessageRepository = new ConversationMessageRepository()
