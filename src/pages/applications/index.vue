<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Applications</h1>
        <p class="page-subtitle">
          Applications bind runtime, provider, knowledge, prompt and conversations inside one
          workspace.
        </p>
      </div>
      <el-tag>{{ workspace.currentWorkspace?.name || 'No workspace' }}</el-tag>
    </div>

    <section class="application-grid">
      <RouterLink
        v-for="item in application.applicationList"
        :key="item.id"
        class="surface application-card"
        :to="`/applications/${item.id}`"
        @click="application.switchApplication(item.id)"
      >
        <strong>{{ item.name }}</strong>
        <el-tag size="small">{{ item.type }}</el-tag>
        <p>{{ item.description }}</p>
        <div class="binding-list">
          <span>Runtime: {{ item.runtimeConfigId }}</span>
          <span>Provider: {{ item.providerId }}</span>
          <span>Knowledge: {{ item.knowledgeBaseId || 'disabled' }}</span>
          <span>Prompt: {{ item.promptTemplateId }}</span>
        </div>
      </RouterLink>
      <el-empty
        v-if="!application.applicationList.length"
        description="No applications in current workspace"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ApplicationListPage',
})

import { onMounted, watch } from 'vue'

import { useApplicationStore, useWorkspaceStore } from '@/store'

const workspace = useWorkspaceStore()
const application = useApplicationStore()

async function loadCurrentWorkspaceApplications() {
  if (!workspace.currentWorkspace) {
    await workspace.loadWorkspaces()
  }
  await application.loadApplications(workspace.currentWorkspace?.id)
}

onMounted(loadCurrentWorkspaceApplications)

watch(
  () => workspace.currentWorkspace?.id,
  () => {
    loadCurrentWorkspaceApplications()
  },
)
</script>

<style scoped>
.application-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.application-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px 12px;
  padding: 18px;
  color: inherit;
  text-decoration: none;
}

.application-card strong {
  font-size: 18px;
}

.application-card p {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--app-muted);
}

.binding-list {
  display: grid;
  grid-column: 1 / -1;
  gap: 6px;
  border-radius: 8px;
  padding: 12px;
  background: var(--app-panel-soft);
  color: var(--app-muted);
  font-size: 12px;
}

@media (max-width: 820px) {
  .application-grid {
    grid-template-columns: 1fr;
  }
}
</style>
