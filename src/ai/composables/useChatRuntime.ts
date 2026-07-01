import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'

import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { getApplicationRuntimeBinding } from '@/ai/runtime/applicationRuntime'
import type { ChatMessage, ChatRequest } from '@/ai/types'
import { useAiConfigStore, useApplicationStore, useChatStore, useWorkspaceStore } from '@/store'

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
  const aiConfig = useAiConfigStore()
  const workspace = useWorkspaceStore()
  const application = useApplicationStore()
  const scopeKey = computed(
    () =>
      `${workspace.currentWorkspace?.id || 'global'}:${application.currentApplication?.id || 'global'}`,
  )

  function getCurrentBinding() {
    return getApplicationRuntimeBinding(
      {
        workspaceId: workspace.currentWorkspace?.id,
        workspaceName: workspace.currentWorkspace?.name,
        applicationId: application.currentApplication?.id,
        applicationName: application.currentApplication?.name,
        runtimeConfigId: application.currentApplication?.runtimeConfigId,
        providerId: application.currentApplication?.providerId,
        knowledgeBaseId: application.currentApplication?.knowledgeBaseId,
        promptTemplateId: application.currentApplication?.promptTemplateId,
      },
      () => aiConfig.currentConfig,
    )
  }

  if (!eventsBound) {
    runtimeEventBus.on('chat:snapshot', (snapshot) => {
      if (snapshot.scope?.runtimeId !== getCurrentBinding().runtimeId) return

      store.setSnapshot(snapshot)
    })
    eventsBound = true
  }

  function syncCurrentSnapshot() {
    store.setSnapshot(getCurrentBinding().runtime.getSnapshot())
  }

  syncCurrentSnapshot()
  watch(scopeKey, syncCurrentSnapshot)

  const { messages, status } = storeToRefs(store)
  const streaming = computed(() => store.streaming)

  return {
    messages,
    status,
    streaming,
    sendMessage: (prompt: string) => {
      const text = prompt.trim()
      if (!text) return
      const runtime = getCurrentBinding().runtime
      const userMessage = createUserMessage(text)
      const snapshot = runtime.getSnapshot()

      const request: ChatRequest = {
        conversationId: snapshot.activeSessionId,
        messages: runtime.getMessages().concat(userMessage),
        model: runtime.getDefaultModel(),
      }

      return runtime.sendMessage(request)
    },
    stop: () => getCurrentBinding().runtime.stop(),
    retry: () => getCurrentBinding().runtime.retry(),
    clear: () => {
      getCurrentBinding().runtime.clear()
    },
  }
}
