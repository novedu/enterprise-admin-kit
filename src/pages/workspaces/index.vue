<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Workspaces</h1>
        <p class="page-subtitle">
          Workspace is the root domain for applications, prompts, knowledge, providers,
          conversations and observability.
        </p>
      </div>
      <el-button type="primary" :icon="Grid" @click="createDefaultWorkspace">
        New Workspace
      </el-button>
    </div>

    <section class="workspace-grid">
      <RouterLink
        v-for="item in workspace.workspaceList"
        :key="item.id"
        class="surface workspace-card"
        :to="`/workspaces/${item.id}`"
        @click="workspace.switchWorkspace(item.id)"
      >
        <span class="workspace-mark" :style="{ background: item.color }">{{ item.name[0] }}</span>
        <div>
          <h2>{{ item.name }}</h2>
          <p>{{ item.description }}</p>
          <div class="workspace-meta">
            <el-tag size="small">{{ item.status }}</el-tag>
            <span>{{ item.applications.length }} applications</span>
            <span>{{ item.knowledgeRefs.length }} knowledge</span>
            <span>{{ item.promptRefs.length }} prompts</span>
          </div>
        </div>
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WorkspaceListPage',
})

import { Grid } from '@element-plus/icons-vue'
import { onMounted } from 'vue'

import { useWorkspaceStore } from '@/store'

const workspace = useWorkspaceStore()

onMounted(() => {
  if (!workspace.workspaceList.length) {
    workspace.loadWorkspaces()
  }
})

function createDefaultWorkspace() {
  workspace.createWorkspace({
    name: `Workspace ${workspace.workspaceList.length + 1}`,
    description: 'New workspace for isolated enterprise AI applications.',
  })
}
</script>

<style scoped>
.workspace-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.workspace-card {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  padding: 18px;
  color: inherit;
  text-decoration: none;
}

.workspace-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  color: white;
  font-weight: 800;
}

.workspace-card h2 {
  margin: 0 0 6px;
  font-size: 18px;
}

.workspace-card p {
  margin: 0;
  color: var(--app-muted);
  line-height: 1.6;
}

.workspace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  color: var(--app-muted);
  font-size: 12px;
}

@media (max-width: 1080px) {
  .workspace-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 680px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}
</style>
