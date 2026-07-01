<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ currentApplication?.name || 'Application' }}</h1>
        <p class="page-subtitle">{{ currentApplication?.description }}</p>
      </div>
      <div class="inline-actions">
        <el-tag type="success">{{ currentApplication?.type }}</el-tag>
        <el-button type="primary" @click="openBindingDialog">Edit Bindings</el-button>
      </div>
    </div>

    <section class="detail-grid">
      <div v-for="item in bindings" :key="item.label" class="surface binding-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.description }}</p>
      </div>
    </section>

    <section class="surface runtime-note">
      <div class="section-head">
        <div>
          <h2 class="section-title">Runtime Profile</h2>
          <p class="section-subtitle">
            Application-level runtime configuration resolved from global defaults and local profile.
          </p>
        </div>
        <el-tag>{{ runtimeConfig.provider }} / {{ runtimeConfig.model }}</el-tag>
      </div>
      <div class="profile-grid">
        <span>Temperature: {{ runtimeConfig.temperature }}</span>
        <span>Context: {{ runtimeConfig.contextWindow }}</span>
        <span>Knowledge: {{ runtimeConfig.enableKnowledge ? 'enabled' : 'disabled' }}</span>
        <span>Compression: {{ runtimeConfig.compressionStrategy }}</span>
      </div>
    </section>

    <section class="surface runtime-note">
      <div class="section-head">
        <div>
          <h2 class="section-title">Conversations</h2>
          <p class="section-subtitle">Conversation sessions scoped to this application.</p>
        </div>
        <el-button @click="createConversation">New Conversation</el-button>
      </div>
      <div class="conversation-list">
        <button
          v-for="item in conversation.conversationList"
          :key="item.id"
          class="conversation-item"
          :class="{ active: item.id === conversation.currentConversation?.id }"
          @click="openConversation(item.id)"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.messageCount }} messages</span>
          <small>{{ new Date(item.lastMessageAt).toLocaleString() }}</small>
        </button>
        <el-empty
          v-if="!conversation.conversationList.length"
          description="No conversations for this application"
        />
      </div>
    </section>

    <section class="surface runtime-note">
      <h2 class="section-title">Runtime Binding</h2>
      <p class="section-subtitle">
        ChatRuntime is now resolved through Workspace/Application scope. Provider, prompt, knowledge
        and runtime settings are read from the current application binding.
      </p>
    </section>

    <el-dialog v-model="bindingVisible" title="Edit application bindings" width="min(560px, 92vw)">
      <el-form label-position="top">
        <el-form-item label="Name">
          <el-input v-model="bindingForm.name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="bindingForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="Provider">
            <el-input v-model="bindingForm.providerId" />
          </el-form-item>
          <el-form-item label="Runtime Config">
            <el-input v-model="bindingForm.runtimeConfigId" />
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="Knowledge Base">
            <el-input v-model="bindingForm.knowledgeBaseId" />
          </el-form-item>
          <el-form-item label="Prompt Template">
            <el-input v-model="bindingForm.promptTemplateId" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="bindingVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveBindings">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ApplicationDetailPage',
})

import { ElMessage } from 'element-plus'
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  useApplicationStore,
  useConversationStore,
  useRuntimeProfileStore,
  useWorkspaceStore,
} from '@/store'

const route = useRoute()
const router = useRouter()
const workspace = useWorkspaceStore()
const application = useApplicationStore()
const conversation = useConversationStore()
const runtimeProfile = useRuntimeProfileStore()
const bindingVisible = ref(false)
const bindingForm = reactive({
  name: '',
  description: '',
  providerId: '',
  runtimeConfigId: '',
  knowledgeBaseId: '',
  promptTemplateId: '',
})
const currentApplication = computed(() => application.currentApplication)
const runtimeConfig = computed(() => runtimeProfile.getResolvedConfig(currentApplication.value?.id))
const bindings = computed(() => [
  {
    label: 'Workspace',
    value: workspace.currentWorkspace?.name || currentApplication.value?.workspaceId || '-',
    description: 'Root ownership boundary for this application.',
  },
  {
    label: 'Runtime Config',
    value: currentApplication.value?.runtimeConfigId || '-',
    description: 'Future runtime configuration resolved per application.',
  },
  {
    label: 'Provider',
    value: currentApplication.value?.providerId || '-',
    description: 'Provider configuration isolated by application/workspace.',
  },
  {
    label: 'Knowledge',
    value: currentApplication.value?.knowledgeBaseId || 'disabled',
    description: 'RAG source bound to this application.',
  },
  {
    label: 'Prompt',
    value: currentApplication.value?.promptTemplateId || '-',
    description: 'Prompt template selected for runtime prompt building.',
  },
])

async function syncApplication(id: string) {
  if (!workspace.currentWorkspace) {
    await workspace.loadWorkspaces()
  }
  if (!application.applicationList.length) {
    await application.loadApplications(workspace.currentWorkspace?.id)
  }
  await application.switchApplication(id)
  const current = application.currentApplication
  if (current) {
    await workspace.switchWorkspace(current.workspaceId)
    await conversation.loadConversations(current.id)
  }
}

onMounted(() => syncApplication(String(route.params.id)))

watch(
  () => route.params.id,
  (id) => {
    if (id) syncApplication(String(id))
  },
)

function openBindingDialog() {
  const current = currentApplication.value
  if (!current) return

  bindingForm.name = current.name
  bindingForm.description = current.description
  bindingForm.providerId = current.providerId
  bindingForm.runtimeConfigId = current.runtimeConfigId
  bindingForm.knowledgeBaseId = current.knowledgeBaseId
  bindingForm.promptTemplateId = current.promptTemplateId
  bindingVisible.value = true
}

async function saveBindings() {
  const current = currentApplication.value
  if (!current) return

  await application.updateApplication(current.id, {
    name: bindingForm.name,
    description: bindingForm.description,
    providerId: bindingForm.providerId,
    runtimeConfigId: bindingForm.runtimeConfigId,
    knowledgeBaseId: bindingForm.knowledgeBaseId,
    promptTemplateId: bindingForm.promptTemplateId,
  })
  bindingVisible.value = false
  ElMessage.success('Application bindings updated')
}

async function createConversation() {
  const current = currentApplication.value
  if (!current) return

  const created = await conversation.createConversation({
    workspaceId: current.workspaceId,
    applicationId: current.id,
    title: 'New conversation',
    providerId: current.providerId,
    promptTemplateId: current.promptTemplateId,
    knowledgeBaseId: current.knowledgeBaseId,
  })
  await conversation.switchConversation(created.id)
  ElMessage.success('Conversation created')
  router.push('/conversations')
}

async function openConversation(id: string) {
  await conversation.switchConversation(id)
  router.push('/conversations')
}
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.binding-card,
.runtime-note {
  padding: 18px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
  color: var(--app-muted);
}

.conversation-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.conversation-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-surface);
  color: inherit;
  text-align: left;
}

.conversation-item.active {
  border-color: var(--el-color-primary);
}

.conversation-item span,
.conversation-item small {
  color: var(--app-muted);
}

.binding-card span,
.binding-card p {
  color: var(--app-muted);
}

.binding-card strong {
  display: block;
  margin: 8px 0;
  word-break: break-word;
}

@media (max-width: 960px) {
  .detail-grid {
    grid-template-columns: 1fr 1fr;
  }

  .profile-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .profile-grid,
  .conversation-item {
    grid-template-columns: 1fr;
  }
}
</style>
