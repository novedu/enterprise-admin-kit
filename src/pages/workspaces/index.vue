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
      <el-button type="primary" :icon="Grid" @click="openCreateDialog"> New Workspace </el-button>
    </div>

    <section class="workspace-grid">
      <div v-for="item in workspace.workspaceList" :key="item.id" class="surface workspace-card">
        <RouterLink
          class="workspace-main"
          :to="`/workspaces/${item.id}`"
          @click="selectWorkspace(item.id)"
        >
          <span class="workspace-mark" :style="{ background: item.color }">
            {{ item.name[0] }}
          </span>
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
        <div class="workspace-actions">
          <el-button size="small" @click="selectWorkspace(item.id)">Switch</el-button>
          <el-button size="small" @click="openRenameDialog(item.id, item.name)">Rename</el-button>
          <el-button size="small" type="danger" plain @click="deleteWorkspace(item.id)">
            Delete
          </el-button>
        </div>
      </div>
    </section>

    <el-dialog v-model="createVisible" title="Create workspace" width="min(520px, 92vw)">
      <el-form label-position="top">
        <el-form-item label="Name">
          <el-input v-model="createForm.name" placeholder="Enterprise AI Workspace" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="4"
            placeholder="Describe the workspace ownership and business scope."
          />
        </el-form-item>
        <el-form-item label="Color">
          <el-color-picker v-model="createForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">Cancel</el-button>
        <el-button type="primary" @click="createWorkspace">Create</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="renameVisible" title="Rename workspace" width="min(420px, 92vw)">
      <el-input v-model="renameForm.name" placeholder="Workspace name" />
      <template #footer>
        <el-button @click="renameVisible = false">Cancel</el-button>
        <el-button type="primary" @click="renameWorkspace">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WorkspaceListPage',
})

import { Grid } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useWorkspaceStore } from '@/store'

const workspace = useWorkspaceStore()
const router = useRouter()
const createVisible = ref(false)
const renameVisible = ref(false)
const createForm = reactive({
  name: '',
  description: '',
  color: '#2563eb',
})
const renameForm = reactive({
  id: '',
  name: '',
})

onMounted(() => {
  if (!workspace.workspaceList.length) {
    workspace.loadWorkspaces()
  }
})

function openCreateDialog() {
  createForm.name = ''
  createForm.description = ''
  createForm.color = '#2563eb'
  createVisible.value = true
}

async function createWorkspace() {
  const created = await workspace.createWorkspace({
    name: createForm.name || `Workspace ${workspace.workspaceList.length + 1}`,
    description: createForm.description || 'New workspace for isolated enterprise AI applications.',
    color: createForm.color,
  })
  createVisible.value = false
  ElMessage.success('Workspace created')
  router.push(`/workspaces/${created.id}`)
}

async function selectWorkspace(id: string) {
  await workspace.switchWorkspace(id)
  ElMessage.success('Workspace switched')
}

function openRenameDialog(id: string, name: string) {
  renameForm.id = id
  renameForm.name = name
  renameVisible.value = true
}

async function renameWorkspace() {
  await workspace.renameWorkspace(renameForm.id, renameForm.name)
  renameVisible.value = false
  ElMessage.success('Workspace renamed')
}

async function deleteWorkspace(id: string) {
  await ElMessageBox.confirm('Delete this workspace? This only affects local mock data.', 'Delete')
  await workspace.deleteWorkspace(id)
  ElMessage.success('Workspace deleted')
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
  gap: 14px;
  padding: 18px;
}

.workspace-main {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  color: inherit;
  text-decoration: none;
}

.workspace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.workspace-main h2 {
  margin: 0 0 6px;
  font-size: 18px;
}

.workspace-main p {
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
