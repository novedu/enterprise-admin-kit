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
    runtimeEventBus.on('chat:snapshot', (snapshot) => {
      store.setSnapshot(snapshot)
    })
    eventsBound = true
  }

  store.setSnapshot(runtime.getSnapshot())

  const { messages, status } = storeToRefs(store)
  const streaming = computed(() => store.streaming)

  return {
    messages,
    status,
    streaming,
    sendMessage: (prompt: string) => {
      const text = prompt.trim()
      if (!text) return
      const userMessage = createUserMessage(text)
      const snapshot = runtime.getSnapshot()

      const request: ChatRequest = {
        conversationId: snapshot.activeSessionId,
        messages: runtime.getMessages().concat(userMessage),
        model: runtime.getDefaultModel(),
      }

      return runtime.sendMessage(request)
    },
    stop: () => runtime.stop(),
    retry: () => runtime.retry(),
    clear: () => {
      runtime.clear()
    },
  }
}
