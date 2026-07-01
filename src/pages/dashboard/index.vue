<template>
  <div class="page ai-overview-page">
    <section class="overview-hero surface">
      <div>
        <el-tag effect="plain" type="primary">Enterprise AI Platform</el-tag>
        <h1 class="page-title">AI Operating Overview</h1>
        <p class="page-subtitle">
          Workspace-first control plane for applications, runtime, providers, knowledge, prompts,
          conversations and observability.
        </p>
      </div>
      <div class="hero-context">
        <span>{{ workspace.currentWorkspace?.name || 'No workspace' }}</span>
        <strong>{{ application.currentApplication?.name || 'No application' }}</strong>
      </div>
    </section>

    <section class="overview-grid">
      <div v-for="item in overviewCards" :key="item.label" class="surface overview-card">
        <div class="card-head">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <el-tag size="small" :type="item.tag">{{ item.status }}</el-tag>
        </div>
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p>{{ item.description }}</p>
      </div>
    </section>

    <section class="overview-layout">
      <div class="surface panel">
        <div class="panel-head">
          <div>
            <h2 class="section-title">Workspace Applications</h2>
            <p class="section-subtitle">Applications are isolated under the selected workspace.</p>
          </div>
          <RouterLink to="/applications">
            <el-button link type="primary">View all</el-button>
          </RouterLink>
        </div>
        <div class="application-stack">
          <RouterLink
            v-for="item in application.applicationList"
            :key="item.id"
            :to="`/applications/${item.id}`"
            class="application-row"
            @click="application.switchApplication(item.id)"
          >
            <strong>{{ item.name }}</strong>
            <span>{{ item.type }}</span>
            <p>{{ item.description }}</p>
          </RouterLink>
        </div>
      </div>

      <aside class="side-stack">
        <div class="surface panel">
          <h2 class="section-title">Runtime Health</h2>
          <div class="health-list">
            <div>
              <span>Status</span>
              <strong>{{ chat.status }}</strong>
            </div>
            <div>
              <span>Streaming</span>
              <strong>{{ chat.streaming ? 'active' : 'idle' }}</strong>
            </div>
            <div>
              <span>Context Window</span>
              <strong>{{ aiConfig.contextWindow }}</strong>
            </div>
            <div>
              <span>Compression</span>
              <strong>{{ aiConfig.compressionStrategy }}</strong>
            </div>
          </div>
        </div>

        <div class="surface panel">
          <h2 class="section-title">Recent Activities</h2>
          <div class="activity-list">
            <div v-for="item in activities" :key="item.title" class="activity-item">
              <span class="status-dot" :class="item.level" />
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiOverviewDashboard',
})

import {
  ChatDotRound,
  Connection,
  Cpu,
  DataLine,
  Document,
  Files,
  Monitor,
  Tickets,
} from '@element-plus/icons-vue'
import { computed, onMounted, watch } from 'vue'

import { useAiConfigStore, useApplicationStore, useChatStore, useWorkspaceStore } from '@/store'

const workspace = useWorkspaceStore()
const application = useApplicationStore()
const aiConfig = useAiConfigStore()
const chat = useChatStore()

const overviewCards = computed(() => [
  {
    label: 'Workspace',
    value: workspace.currentWorkspace?.name || 'Not selected',
    description: `${workspace.workspaceList.length} workspaces available`,
    icon: Files,
    status: workspace.currentWorkspace?.status || 'empty',
    tag: 'primary' as const,
  },
  {
    label: 'Current Application',
    value: application.currentApplication?.name || 'Not selected',
    description: application.currentApplication?.type || 'Application context is required',
    icon: Tickets,
    status: application.currentApplication ? 'isolated' : 'empty',
    tag: 'success' as const,
  },
  {
    label: 'Provider',
    value: `${aiConfig.provider} / ${aiConfig.model}`,
    description: aiConfig.currentProviderCredential
      ? 'Credential reference configured'
      : 'Mock-safe provider routing',
    icon: Connection,
    status: aiConfig.stream ? 'streaming' : 'sync',
    tag: 'warning' as const,
  },
  {
    label: 'Runtime',
    value: chat.status,
    description: chat.streaming ? 'Streaming response in progress' : 'Runtime ready for execution',
    icon: Cpu,
    status: chat.streaming ? 'active' : 'ready',
    tag: chat.streaming ? ('warning' as const) : ('success' as const),
  },
  {
    label: 'Knowledge',
    value: workspace.currentWorkspace?.knowledgeRefs.length || 0,
    description: aiConfig.enableKnowledge
      ? 'RAG enabled in runtime config'
      : 'RAG disabled in runtime config',
    icon: Document,
    status: aiConfig.enableKnowledge ? 'enabled' : 'disabled',
    tag: 'info' as const,
  },
  {
    label: 'Prompt',
    value: workspace.currentWorkspace?.promptRefs.length || 0,
    description: 'Prompt templates are scoped to workspace and applications',
    icon: ChatDotRound,
    status: 'managed',
    tag: 'primary' as const,
  },
  {
    label: 'Conversation',
    value: workspace.currentWorkspace?.conversationRefs.length || 0,
    description: 'Conversation repository prepared for workspace/application isolation',
    icon: DataLine,
    status: 'prepared',
    tag: 'success' as const,
  },
  {
    label: 'Recent Trace',
    value: chat.snapshot?.messages.at(-1)?.metadata?.traceId ? 'available' : 'pending',
    description: 'Runtime observability remains available under /ai/observability',
    icon: Monitor,
    status: 'observable',
    tag: 'info' as const,
  },
])

const activities = computed(() => [
  {
    title: 'Workspace context active',
    content: workspace.currentWorkspace?.name || 'Load a workspace to scope AI assets.',
    level: 'success',
  },
  {
    title: 'Application isolation prepared',
    content: application.currentApplication?.name || 'Select an application for runtime binding.',
    level: 'info',
  },
  {
    title: 'Runtime keeps working',
    content: 'ChatRuntime is intentionally unchanged in this sprint.',
    level: 'warning',
  },
])

async function syncOverview() {
  if (!workspace.workspaceList.length) {
    await workspace.loadWorkspaces()
  }
  if (workspace.currentWorkspace) {
    await application.loadApplications(workspace.currentWorkspace.id)
  }
}

onMounted(syncOverview)

watch(
  () => workspace.currentWorkspace?.id,
  () => syncOverview(),
)
</script>

<style scoped>
.overview-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
  padding: 22px;
}

.overview-hero .page-title {
  margin-top: 12px;
}

.hero-context {
  display: grid;
  gap: 6px;
  min-width: 220px;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 14px;
  background: var(--app-panel-soft);
}

.hero-context span {
  color: var(--app-muted);
  font-size: 12px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.overview-card {
  display: grid;
  gap: 10px;
  min-height: 176px;
  padding: 16px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-head .el-icon {
  color: var(--app-primary);
  font-size: 22px;
}

.overview-card span,
.overview-card p {
  color: var(--app-muted);
}

.overview-card strong {
  font-size: 22px;
  word-break: break-word;
}

.overview-card p {
  margin: 0;
  line-height: 1.6;
}

.overview-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.panel {
  padding: 18px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.application-stack,
.side-stack,
.activity-list,
.health-list {
  display: grid;
  gap: 10px;
}

.application-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px 12px;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 14px;
  color: inherit;
  text-decoration: none;
}

.application-row span,
.application-row p {
  color: var(--app-muted);
}

.application-row p {
  grid-column: 1 / -1;
  margin: 0;
}

.health-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--app-border-subtle);
  padding: 10px 0;
}

.health-list span,
.activity-item p {
  color: var(--app-muted);
}

.activity-item {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 10px;
  align-items: start;
}

.activity-item p {
  margin: 4px 0 0;
}

@media (max-width: 1180px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .overview-hero {
    display: grid;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
