import { defineStore } from 'pinia'

import type { ChatMessage, ChatRuntimeStatus, ChatSnapshot } from '@/ai/types'
import { i18n } from '@/locales'

interface ChatState {
  snapshot: ChatSnapshot | null
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
    snapshot: null,
  }),
  getters: {
    messages: (state): ChatMessage[] => state.snapshot?.messages ?? [createInitialMessage()],
    status: (state): ChatRuntimeStatus => state.snapshot?.status ?? 'idle',
    streaming: (state): boolean => state.snapshot?.streaming ?? false,
    activeSessionId: (state): string => state.snapshot?.activeSessionId ?? '',
    isBusy: (state): boolean => state.snapshot?.streaming ?? false,
  },
  actions: {
    setSnapshot(snapshot: ChatSnapshot) {
      this.snapshot = {
        ...snapshot,
        messages: snapshot.messages.map((message) => ({
          ...message,
          tokenUsage: message.tokenUsage ? { ...message.tokenUsage } : undefined,
          citations: message.citations?.map((citation) => ({ ...citation })),
          metadata: message.metadata ? { ...message.metadata } : undefined,
        })),
        sessions: snapshot.sessions.map((session) => ({ ...session })),
      }
    },
  },
})
