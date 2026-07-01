<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ currentApplication?.name || 'Application' }}</h1>
        <p class="page-subtitle">{{ currentApplication?.description }}</p>
      </div>
      <el-tag type="success">{{ currentApplication?.type }}</el-tag>
    </div>

    <section class="detail-grid">
      <div v-for="item in bindings" :key="item.label" class="surface binding-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.description }}</p>
      </div>
    </section>

    <section class="surface runtime-note">
      <h2 class="section-title">Runtime Isolation</h2>
      <p class="section-subtitle">
        This sprint prepares application-level ownership. ChatRuntime is intentionally not modified
        yet, but future runtime resolution can consume the current workspace and application
        context.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ApplicationDetailPage',
})

import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useApplicationStore, useWorkspaceStore } from '@/store'

const route = useRoute()
const workspace = useWorkspaceStore()
const application = useApplicationStore()
const currentApplication = computed(() => application.currentApplication)
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
}

onMounted(() => syncApplication(String(route.params.id)))

watch(
  () => route.params.id,
  (id) => {
    if (id) syncApplication(String(id))
  },
)
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
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
