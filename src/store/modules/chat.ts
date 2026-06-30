import { defineStore } from 'pinia'

import type { ChatMessage, ChatRuntimeStatus, TokenUsage } from '@/ai/types'
import { i18n } from '@/locales'

interface ChatState {
  messages: ChatMessage[]
  status: ChatRuntimeStatus
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function now() {
  return Date.now()
}

function createInitialMessage(): ChatMessage {
  return {
    id: createId(),
    role: 'assistant',
    content: i18n.global.t('chat.welcome'),
    status: 'done',
    createdAt: now(),
  }
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    messages: [createInitialMessage()],
    status: 'idle',
  }),
  getters: {
    isBusy: (state) => state.status === 'loading' || state.status === 'streaming',
  },
  actions: {
    setRuntimeMessages(messages: ChatMessage[]) {
      this.messages = messages.length ? messages : [createInitialMessage()]
    },
    setStatus(status: ChatRuntimeStatus) {
      this.status = status
    },
    startAssistantMessage(
      message: ChatMessage,
      status: ChatRuntimeStatus,
      messages?: ChatMessage[],
    ) {
      if (messages?.length) {
        this.messages = messages
      } else {
        this.messages.push(message)
      }
      this.status = status
    },
    appendAssistantChunk(messageId: string, fullText: string, status: ChatRuntimeStatus) {
      const message = this.messages.find((item) => item.id === messageId)
      if (!message) return

      message.content = fullText
      message.status = status
      message.updatedAt = now()
      this.status = status
    },
    finishAssistantMessage(
      messageId: string,
      fullText: string,
      tokenUsage: TokenUsage,
      status: ChatRuntimeStatus,
    ) {
      const message = this.messages.find((item) => item.id === messageId)
      if (!message) return

      message.content = fullText
      message.status = status
      message.tokenUsage = tokenUsage
      message.updatedAt = now()
      this.status = status
    },
    failAssistantMessage(messageId: string, error: string, status: ChatRuntimeStatus) {
      const message = this.messages.find((item) => item.id === messageId)
      if (!message) return

      message.status = status
      message.metadata = { ...message.metadata, error }
      message.updatedAt = now()
      this.status = status
    },
    abortAssistantMessage(messageId: string, status: ChatRuntimeStatus) {
      const message = this.messages.find((item) => item.id === messageId)
      if (!message) return

      message.status = status
      message.updatedAt = now()
      this.status = status
    },
    clear() {
      this.messages = [createInitialMessage()]
      this.status = 'idle'
    },
  },
})
