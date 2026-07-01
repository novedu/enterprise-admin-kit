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
      <div class="inline-actions">
        <el-tag>{{ workspace.currentWorkspace?.name || 'No workspace' }}</el-tag>
        <el-button type="primary" @click="openCreateDialog">New Application</el-button>
      </div>
    </div>

    <section class="application-grid">
      <div
        v-for="item in application.applicationList"
        :key="item.id"
        class="surface application-card"
      >
        <RouterLink
          class="application-main"
          :to="`/applications/${item.id}`"
          @click="selectApplication(item.id)"
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
        <div class="application-actions">
          <el-button size="small" @click="selectApplication(item.id)">Switch</el-button>
          <el-button size="small" type="danger" plain @click="deleteApplication(item.id)">
            Delete
          </el-button>
        </div>
      </div>
      <el-empty
        v-if="!application.applicationList.length"
        description="No applications in current workspace"
      />
    </section>

    <el-dialog v-model="createVisible" title="Create application" width="min(560px, 92vw)">
      <el-form label-position="top">
        <el-form-item label="Name">
          <el-input v-model="createForm.name" placeholder="ERP Copilot" />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="createForm.type">
            <el-option
              v-for="option in applicationTypes"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="4"
            placeholder="Describe the AI application and its business workflow."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">Cancel</el-button>
        <el-button
          type="primary"
          :disabled="!workspace.currentWorkspace"
          @click="createApplication"
        >
          Create
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ApplicationListPage',
})

import { ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { ApplicationType } from '@/domain/application/Application'
import { useApplicationStore, useWorkspaceStore } from '@/store'

const workspace = useWorkspaceStore()
const application = useApplicationStore()
const router = useRouter()
const createVisible = ref(false)
const applicationTypes: ApplicationType[] = [
  'erp-copilot',
  'hr-assistant',
  'crm-assistant',
  'knowledge-qa',
]
const createForm = reactive<{
  name: string
  description: string
  type: ApplicationType
}>({
  name: '',
  description: '',
  type: 'erp-copilot',
})

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

function openCreateDialog() {
  createForm.name = ''
  createForm.description = ''
  createForm.type = 'erp-copilot'
  createVisible.value = true
}

async function createApplication() {
  if (!workspace.currentWorkspace) return

  const created = await application.createApplication({
    workspaceId: workspace.currentWorkspace.id,
    name: createForm.name || 'New AI Application',
    description: createForm.description || 'Application-scoped AI runtime surface.',
    type: createForm.type,
  })
  createVisible.value = false
  ElMessage.success('Application created')
  router.push(`/applications/${created.id}`)
}

async function selectApplication(id: string) {
  await application.switchApplication(id)
  ElMessage.success('Application switched')
}

async function deleteApplication(id: string) {
  await ElMessageBox.confirm(
    'Delete this application? This only affects local mock data.',
    'Delete',
  )
  await application.deleteApplication(id)
  ElMessage.success('Application deleted')
}
</script>

<style scoped>
.application-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.application-card {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.application-main {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px 12px;
  color: inherit;
  text-decoration: none;
}

.application-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.application-main strong {
  font-size: 18px;
}

.application-main p {
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
