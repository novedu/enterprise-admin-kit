import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'

import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { getApplicationRuntimeBinding } from '@/ai/runtime/applicationRuntime'
import type { ChatMessage, ChatRequest } from '@/ai/types'
import {
  useApplicationStore,
  useChatStore,
  useConversationStore,
  useRuntimeProfileStore,
  useWorkspaceStore,
} from '@/store'

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
  const runtimeProfile = useRuntimeProfileStore()
  const workspace = useWorkspaceStore()
  const application = useApplicationStore()
  const conversation = useConversationStore()
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
      () => runtimeProfile.getResolvedConfig(application.currentApplication?.id),
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

  async function ensureConversations() {
    const applicationId = application.currentApplication?.id
    if (!applicationId) return

    await conversation.loadConversations(applicationId)
  }

  async function ensureCurrentConversation(title?: string) {
    if (conversation.currentConversation) return conversation.currentConversation
    const currentApplication = application.currentApplication
    const currentWorkspace = workspace.currentWorkspace
    if (!currentApplication || !currentWorkspace) return null

    return conversation.createConversation({
      workspaceId: currentWorkspace.id,
      applicationId: currentApplication.id,
      title,
      providerId: currentApplication.providerId,
      promptTemplateId: currentApplication.promptTemplateId,
      knowledgeBaseId: currentApplication.knowledgeBaseId,
    })
  }

  syncCurrentSnapshot()
  watch(
    scopeKey,
    async () => {
      await ensureConversations()
      const activeConversationId = conversation.currentConversation?.id
      if (activeConversationId) {
        getCurrentBinding().runtime.openConversation(activeConversationId)
      }
      syncCurrentSnapshot()
    },
    { immediate: true },
  )

  watch(
    () => conversation.currentConversation?.id,
    (conversationId) => {
      if (!conversationId) return

      getCurrentBinding().runtime.openConversation(conversationId)
      syncCurrentSnapshot()
    },
  )

  const { messages, status } = storeToRefs(store)
  const streaming = computed(() => store.streaming)

  return {
    messages,
    status,
    streaming,
    sendMessage: async (prompt: string) => {
      const text = prompt.trim()
      if (!text) return
      const activeConversation = await ensureCurrentConversation(text.slice(0, 48))
      const runtime = getCurrentBinding().runtime
      if (activeConversation && runtime.getSnapshot().activeSessionId !== activeConversation.id) {
        runtime.openConversation(activeConversation.id)
      }
      const userMessage = createUserMessage(text)
      const snapshot = runtime.getSnapshot()

      const request: ChatRequest = {
        conversationId: snapshot.activeSessionId,
        messages: runtime.getMessages().concat(userMessage),
        model: runtime.getDefaultModel(),
      }

      const result = await runtime.sendMessage(request)
      if (activeConversation) {
        await conversation.touchConversation(activeConversation.id, {
          title: activeConversation.title || text.slice(0, 48),
          messageCount: runtime.getSnapshot().messages.length,
        })
      }

      return result
    },
    stop: () => getCurrentBinding().runtime.stop(),
    retry: () => getCurrentBinding().runtime.retry(),
    clear: () => {
      getCurrentBinding().runtime.clear()
    },
  }
}
