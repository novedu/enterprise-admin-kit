import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { MockProvider } from '@/ai/providers/MockProvider'
import { ChatRuntime } from '@/ai/runtime/ChatRuntime'
import type { ChatMessage, ChatRequest } from '@/ai/types'
import { useChatStore } from '@/store'

let runtime: ChatRuntime | null = null
let unsubscribe: (() => void) | null = null

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

  if (!runtime) {
    runtime = new ChatRuntime(new MockProvider(), runtimeEventBus)
  }

  if (!unsubscribe) {
    unsubscribe = runtime.subscribe((messages, status) => {
      store.syncRuntimeSnapshot(messages, status)
    })
  }

  const { messages, status } = storeToRefs(store)
  const streaming = computed(() => store.isBusy)

  return {
    messages,
    status,
    streaming,
    sendMessage: (prompt: string) => {
      const text = prompt.trim()
      if (!text || !runtime) return

      const request: ChatRequest = {
        conversationId: `conversation-${Date.now()}`,
        messages: runtime.getMessages().concat(createUserMessage(text)),
        model: 'mock-chat-runtime',
        stream: true,
      }

      return runtime.sendMessage(request)
    },
    stop: () => runtime?.stop(),
    retry: () => runtime?.retry(),
    clear: () => runtime?.clear(),
  }
}
