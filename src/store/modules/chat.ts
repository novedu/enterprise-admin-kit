import { defineStore } from 'pinia'

import type { ChatMessage, ChatRuntimeStatus } from '@/ai/types'
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
    syncRuntimeSnapshot(messages: ChatMessage[], status: ChatRuntimeStatus) {
      this.messages = messages.length ? messages : [createInitialMessage()]
      this.status = status
    },
    clear() {
      this.messages = [createInitialMessage()]
      this.status = 'idle'
    },
  },
})
