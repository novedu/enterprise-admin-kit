import { defineStore } from 'pinia'

import {
  conversationRepository,
  type ConversationSnapshot,
} from '@/domain/conversation/ConversationRepository'

const CURRENT_CONVERSATION_KEY = 'enterprise-ai-platform:current-conversation'

function storageKey(applicationId: string) {
  return `${CURRENT_CONVERSATION_KEY}:${applicationId}`
}

function readCurrentConversationId(applicationId: string) {
  if (typeof window === 'undefined' || !applicationId) return ''

  return window.localStorage.getItem(storageKey(applicationId)) || ''
}

function persistCurrentConversationId(applicationId: string, conversationId: string) {
  if (typeof window === 'undefined' || !applicationId) return

  window.localStorage.setItem(storageKey(applicationId), conversationId)
}

export const useConversationStore = defineStore('conversation', {
  state: () => ({
    conversationList: [] as ConversationSnapshot[],
    currentConversation: null as ConversationSnapshot | null,
    loading: false,
  }),
  getters: {
    currentConversationId: (state) => state.currentConversation?.id || '',
    conversationOptions: (state) =>
      state.conversationList.map((conversation) => ({
        label: conversation.title,
        value: conversation.id,
      })),
  },
  actions: {
    async loadConversations(applicationId: string) {
      this.loading = true
      try {
        this.conversationList = await conversationRepository.listByApplication(applicationId)
        const persistedId = readCurrentConversationId(applicationId)
        const current =
          this.conversationList.find((conversation) => conversation.id === persistedId) ||
          this.conversationList[0] ||
          null

        this.currentConversation = current
        if (current) {
          persistCurrentConversationId(applicationId, current.id)
        }
      } finally {
        this.loading = false
      }
    },
    async switchConversation(id: string) {
      const conversation =
        this.conversationList.find((item) => item.id === id) ||
        (await conversationRepository.findById(id))
      if (!conversation) return

      this.currentConversation = conversation
      persistCurrentConversationId(conversation.applicationId, conversation.id)
    },
    async createConversation(input: {
      workspaceId: string
      applicationId: string
      title?: string
      providerId?: string
      promptTemplateId?: string
      knowledgeBaseId?: string
    }) {
      const conversation = await conversationRepository.create(input)
      this.conversationList = [conversation, ...this.conversationList]
      this.currentConversation = conversation
      persistCurrentConversationId(conversation.applicationId, conversation.id)

      return conversation
    },
    async touchConversation(
      id: string,
      patch: Partial<Pick<ConversationSnapshot, 'title' | 'messageCount'>>,
    ) {
      const conversation = await conversationRepository.touch(id, patch)
      if (!conversation) return null

      this.conversationList = this.conversationList.map((item) =>
        item.id === id ? conversation : item,
      )
      if (this.currentConversation?.id === id) {
        this.currentConversation = conversation
      }

      return conversation
    },
    async deleteConversation(id: string) {
      const target = this.conversationList.find((conversation) => conversation.id === id)
      this.conversationList = await conversationRepository.delete(id)
      if (this.currentConversation?.id === id) {
        const fallback = this.conversationList[0] || null
        this.currentConversation = fallback
        if (target) {
          persistCurrentConversationId(target.applicationId, fallback?.id || '')
        }
      }
    },
    clearConversations() {
      this.conversationList = []
      this.currentConversation = null
    },
  },
})
