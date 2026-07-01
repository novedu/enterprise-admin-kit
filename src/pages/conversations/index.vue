<template>
  <div class="page conversation-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Conversation Center</h1>
        <p class="page-subtitle">
          Operate application-scoped AI conversations with runtime state, streaming controls and
          trace-ready sessions.
        </p>
      </div>
      <div class="inline-actions">
        <el-tag effect="plain">{{ workspace.currentWorkspace?.name || 'No workspace' }}</el-tag>
        <el-tag>{{ application.currentApplication?.name || 'No application' }}</el-tag>
        <el-button type="primary" :icon="Plus" @click="createConversation">
          New Conversation
        </el-button>
      </div>
    </div>

    <section class="conversation-shell">
      <aside class="surface conversation-sidebar">
        <div class="sidebar-head">
          <div>
            <h2 class="section-title">Sessions</h2>
            <p class="section-subtitle">Current application conversations.</p>
          </div>
          <el-tag>{{ conversation.conversationList.length }}</el-tag>
        </div>

        <div class="session-list">
          <button
            v-for="item in conversation.conversationList"
            :key="item.id"
            class="session-item"
            :class="{ active: item.id === conversation.currentConversation?.id }"
            type="button"
            @click="switchConversation(item.id)"
          >
            <strong>{{ item.title }}</strong>
            <span>{{ item.messageCount }} messages</span>
            <small>{{ new Date(item.lastMessageAt).toLocaleString() }}</small>
          </button>
          <el-empty
            v-if="!conversation.conversationList.length"
            description="No conversations yet"
          />
        </div>
      </aside>

      <main class="surface chat-panel">
        <div class="chat-head">
          <div>
            <h2 class="section-title">
              {{ conversation.currentConversation?.title || 'New conversation' }}
            </h2>
            <p class="section-subtitle">{{ status }} · {{ streaming ? 'streaming' : 'ready' }}</p>
          </div>
          <div class="inline-actions">
            <el-button :icon="RefreshLeft" @click="retry">Retry</el-button>
            <el-button :icon="VideoPause" :disabled="!streaming" @click="stop">Stop</el-button>
            <el-button :icon="Delete" @click="deleteCurrentConversation">Delete</el-button>
          </div>
        </div>

        <div ref="messageViewport" class="message-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-row"
            :class="message.role"
          >
            <span class="message-role">{{ message.role }}</span>
            <div class="message-bubble">
              <p>{{ message.content }}</p>
              <div v-if="message.citations?.length" class="citation-list">
                <el-tag v-for="citation in message.citations" :key="citation.id" size="small">
                  {{ citation.title }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="composer">
          <el-input
            v-model="draft"
            type="textarea"
            :rows="3"
            resize="none"
            placeholder="Ask the current application runtime..."
            @keydown.meta.enter.prevent="submit"
            @keydown.ctrl.enter.prevent="submit"
          />
          <div class="composer-actions">
            <span>Runtime reads the current Workspace/Application/Conversation scope.</span>
            <el-button type="primary" :icon="Promotion" :disabled="!draft.trim()" @click="submit">
              Send
            </el-button>
          </div>
        </div>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ConversationCenterPage',
})

import { Delete, Plus, Promotion, RefreshLeft, VideoPause } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { nextTick, onMounted, ref, watch } from 'vue'

import { useChatRuntime } from '@/ai/composables/useChatRuntime'
import { useApplicationStore, useConversationStore, useWorkspaceStore } from '@/store'

const workspace = useWorkspaceStore()
const application = useApplicationStore()
const conversation = useConversationStore()
const { messages, status, streaming, sendMessage, stop, retry } = useChatRuntime()
const draft = ref('')
const messageViewport = ref<HTMLElement>()

async function ensureScope() {
  if (!workspace.currentWorkspace) {
    await workspace.loadWorkspaces()
  }
  if (!application.currentApplication) {
    await application.loadApplications(workspace.currentWorkspace?.id)
  }
  if (application.currentApplication) {
    await conversation.loadConversations(application.currentApplication.id)
  }
}

async function createConversation() {
  const currentWorkspace = workspace.currentWorkspace
  const currentApplication = application.currentApplication
  if (!currentWorkspace || !currentApplication) return

  await conversation.createConversation({
    workspaceId: currentWorkspace.id,
    applicationId: currentApplication.id,
    title: 'New conversation',
    providerId: currentApplication.providerId,
    promptTemplateId: currentApplication.promptTemplateId,
    knowledgeBaseId: currentApplication.knowledgeBaseId,
  })
  ElMessage.success('Conversation created')
}

async function switchConversation(id: string) {
  await conversation.switchConversation(id)
}

async function deleteCurrentConversation() {
  const current = conversation.currentConversation
  if (!current) return

  await ElMessageBox.confirm(
    'Delete this conversation? This removes the local session index.',
    'Delete',
  )
  await conversation.deleteConversation(current.id)
  ElMessage.success('Conversation deleted')
}

async function submit() {
  const text = draft.value.trim()
  if (!text) return

  draft.value = ''
  await sendMessage(text)
  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  const viewport = messageViewport.value
  if (!viewport) return

  viewport.scrollTop = viewport.scrollHeight
}

onMounted(ensureScope)

watch(
  () => application.currentApplication?.id,
  () => {
    ensureScope()
  },
)

watch(messages, scrollToBottom, { deep: true })
</script>

<style scoped>
.conversation-shell {
  display: grid;
  grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
  gap: 16px;
  min-height: 640px;
}

.conversation-sidebar,
.chat-panel {
  min-height: 640px;
  padding: 18px;
}

.sidebar-head,
.chat-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.session-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.session-item {
  display: grid;
  gap: 6px;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-surface);
  color: inherit;
  text-align: left;
}

.session-item.active {
  border-color: var(--el-color-primary);
  box-shadow: inset 3px 0 0 var(--el-color-primary);
}

.session-item span,
.session-item small {
  color: var(--app-muted);
  font-size: 12px;
}

.chat-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 16px;
}

.message-list {
  display: grid;
  align-content: start;
  gap: 14px;
  overflow: auto;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 16px;
  background: var(--app-panel-soft);
}

.message-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 12px;
}

.message-role {
  color: var(--app-muted);
  font-size: 12px;
  text-transform: uppercase;
}

.message-bubble {
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--app-surface);
}

.message-row.user .message-bubble {
  border-color: var(--el-color-primary-light-5);
}

.message-bubble p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
}

.citation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.composer {
  display: grid;
  gap: 10px;
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--app-muted);
  font-size: 12px;
}

@media (max-width: 980px) {
  .conversation-shell {
    grid-template-columns: 1fr;
  }

  .conversation-sidebar,
  .chat-panel {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .message-row {
    grid-template-columns: 1fr;
  }

  .composer-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
