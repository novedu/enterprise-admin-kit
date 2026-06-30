import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { getChatRuntime } from '@/ai/runtime/runtimeInstance'
import type { ChatMessage, ChatRequest } from '@/ai/types'
import { useChatStore } from '@/store'

let eventsBound = false

function createUserMessage(content: string): ChatMessage {
  const timestamp = Date.now()

  return {
    id: `user-${timestamp}-${Math.random().toString(16).slice(2)}`,
    role: 'user',
    content,
    status: 'done',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function useChatRuntime() {
  const store = useChatStore()
  const runtime = getChatRuntime()

  if (!eventsBound) {
    runtimeEventBus.on('chat:start', ({ message, messages, status }) => {
      store.startAssistantMessage(message, status, messages)
    })
    runtimeEventBus.on('chat:chunk', ({ messageId, fullText, status }) => {
      store.appendAssistantChunk(messageId, fullText, status)
    })
    runtimeEventBus.on('chat:finish', ({ messageId, fullText, tokenUsage, status }) => {
      store.finishAssistantMessage(messageId, fullText, tokenUsage, status)
    })
    runtimeEventBus.on('chat:error', ({ messageId, error, status }) => {
      store.failAssistantMessage(messageId, error, status)
    })
    runtimeEventBus.on('chat:abort', ({ messageId, status }) => {
      store.abortAssistantMessage(messageId, status)
    })
    eventsBound = true
  }

  const { messages, status } = storeToRefs(store)
  const streaming = computed(() => store.isBusy)

  return {
    messages,
    status,
    streaming,
    sendMessage: (prompt: string) => {
      const text = prompt.trim()
      if (!text) return
      const userMessage = createUserMessage(text)

      const request: ChatRequest = {
        conversationId: `conversation-${Date.now()}`,
        messages: runtime.getMessages().concat(userMessage),
        model: runtime.getDefaultModel(),
      }

      return runtime.sendMessage(request)
    },
    stop: () => runtime.stop(),
    retry: () => runtime.retry(),
    clear: () => {
      runtime.clear()
      store.clear()
    },
  }
}
