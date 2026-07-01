<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ currentWorkspace?.name || 'Workspace' }}</h1>
        <p class="page-subtitle">{{ currentWorkspace?.description }}</p>
      </div>
      <el-tag type="success">{{ currentWorkspace?.status || 'active' }}</el-tag>
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
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WorkspaceDetailPage',
})

import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useApplicationStore, useWorkspaceStore } from '@/store'

const route = useRoute()
const workspace = useWorkspaceStore()
const application = useApplicationStore()
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
}

onMounted(() => syncWorkspace(String(route.params.id)))

watch(
  () => route.params.id,
  (id) => {
    if (id) syncWorkspace(String(id))
  },
)
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
}
</style>
