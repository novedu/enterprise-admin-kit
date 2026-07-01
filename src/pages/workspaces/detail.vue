<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ currentWorkspace?.name || 'Workspace' }}</h1>
        <p class="page-subtitle">{{ currentWorkspace?.description }}</p>
      </div>
      <div class="inline-actions">
        <el-tag type="success">{{ currentWorkspace?.status || 'active' }}</el-tag>
        <el-button type="primary" @click="createApplication">New Application</el-button>
      </div>
    </div>

    <section class="overview-grid">
      <div v-for="item in summaryCards" :key="item.label" class="surface overview-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.description }}</p>
      </div>
    </section>

    <section class="surface workspace-section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Applications</h2>
          <p class="section-subtitle">Applications are isolated under the current workspace.</p>
        </div>
        <RouterLink to="/applications">
          <el-button>Manage Applications</el-button>
        </RouterLink>
      </div>
      <div class="application-list">
        <RouterLink
          v-for="item in application.applicationList"
          :key="item.id"
          :to="`/applications/${item.id}`"
          class="application-item"
          @click="application.switchApplication(item.id)"
        >
          <strong>{{ item.name }}</strong>
          <span>{{ item.type }}</span>
          <p>{{ item.description }}</p>
        </RouterLink>
      </div>
    </section>

    <section class="surface workspace-section">
      <div class="section-head">
        <div>
          <h2 class="section-title">Recent Conversations</h2>
          <p class="section-subtitle">Conversation activity owned by this workspace.</p>
        </div>
        <RouterLink to="/ai/observability">
          <el-button>Open Observability</el-button>
        </RouterLink>
      </div>
      <div class="conversation-list">
        <div v-for="item in workspaceConversations" :key="item.id" class="conversation-item">
          <strong>{{ item.title }}</strong>
          <span>{{ item.messageCount }} messages</span>
          <small>{{ new Date(item.lastMessageAt).toLocaleString() }}</small>
        </div>
        <el-empty
          v-if="!workspaceConversations.length"
          description="No conversations in this workspace"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WorkspaceDetailPage',
})

import { ElMessage } from 'element-plus'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  conversationRepository,
  type ConversationSnapshot,
} from '@/domain/conversation/ConversationRepository'
import { useApplicationStore, useWorkspaceStore } from '@/store'

const route = useRoute()
const router = useRouter()
const workspace = useWorkspaceStore()
const application = useApplicationStore()
const workspaceConversations = ref<ConversationSnapshot[]>([])
const currentWorkspace = computed(() => workspace.currentWorkspace)
const summaryCards = computed(() => [
  {
    label: 'Applications',
    value: currentWorkspace.value?.applications.length || 0,
    description: 'AI products owned by this workspace.',
  },
  {
    label: 'Knowledge',
    value: currentWorkspace.value?.knowledgeRefs.length || 0,
    description: 'Knowledge bases available for RAG.',
  },
  {
    label: 'Prompts',
    value: currentWorkspace.value?.promptRefs.length || 0,
    description: 'Prompt templates scoped to this workspace.',
  },
  {
    label: 'Conversations',
    value: currentWorkspace.value?.conversationRefs.length || 0,
    description: 'Conversation records prepared for isolation.',
  },
])

async function syncWorkspace(id: string) {
  if (!workspace.workspaceList.length) {
    await workspace.loadWorkspaces()
  }
  await workspace.switchWorkspace(id)
  await application.loadApplications(id)
  workspaceConversations.value = await conversationRepository.listByWorkspace(id)
}

onMounted(() => syncWorkspace(String(route.params.id)))

watch(
  () => route.params.id,
  (id) => {
    if (id) syncWorkspace(String(id))
  },
)

async function createApplication() {
  const current = currentWorkspace.value
  if (!current) return

  const created = await application.createApplication({
    workspaceId: current.id,
    name: `Application ${application.applicationList.length + 1}`,
    description: 'Application-scoped AI runtime surface.',
    type: 'erp-copilot',
  })
  ElMessage.success('Application created')
  router.push(`/applications/${created.id}`)
}
</script>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.overview-card {
  padding: 18px;
}

.overview-card span,
.overview-card p {
  color: var(--app-muted);
}

.overview-card strong {
  display: block;
  margin: 8px 0;
  font-size: 30px;
}

.workspace-section {
  padding: 18px;
}

.application-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
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
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 14px;
}

.conversation-item span,
.conversation-item small {
  color: var(--app-muted);
}

.application-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 12px;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 14px;
  color: inherit;
  text-decoration: none;
}

.application-item span,
.application-item p {
  color: var(--app-muted);
}

.application-item p {
  grid-column: 1 / -1;
  margin: 0;
}

@media (max-width: 960px) {
  .overview-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .conversation-item {
    grid-template-columns: 1fr;
  }
}
</style>
