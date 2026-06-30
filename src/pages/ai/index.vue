<template>
  <div class="page ai-console">
    <div class="page-header console-header">
      <div>
        <h1 class="page-title">{{ t('page.ai.title') }}</h1>
        <p class="page-subtitle">{{ t('page.ai.subtitle') }}</p>
      </div>
      <div class="header-controls">
        <el-tag type="success" effect="plain">{{ aiConfig.provider }}</el-tag>
        <el-tag effect="plain">{{ aiConfig.model }}</el-tag>
        <el-button :icon="Refresh" @click="refreshSnapshot">
          {{ t('page.ai.actions.refreshMetrics') }}
        </el-button>
      </div>
    </div>

    <section class="metric-grid">
      <div class="metric-tile surface">
        <span>{{ t('page.ai.metrics.provider') }}</span>
        <strong>{{ aiConfig.provider }}</strong>
        <small>{{ aiConfig.model }}</small>
      </div>
      <div class="metric-tile surface">
        <span>{{ t('page.ai.metrics.contextWindow') }}</span>
        <strong>{{ aiConfig.contextWindow }}</strong>
        <small>{{ aiConfig.compressionStrategy }}</small>
      </div>
      <div class="metric-tile surface">
        <span>{{ t('page.ai.metrics.knowledgeBases') }}</span>
        <strong>{{ knowledgeBases.length }}</strong>
        <small>{{ activeKnowledgeBase?.name || t('page.ai.metrics.noActiveBase') }}</small>
      </div>
      <div class="metric-tile surface">
        <span>{{ t('page.ai.metrics.traces') }}</span>
        <strong>{{ snapshot.traces.length }}</strong>
        <small>{{ latestTrace?.status || 'idle' }}</small>
      </div>
    </section>

    <el-tabs v-model="activeTab" class="console-tabs">
      <el-tab-pane :label="t('page.ai.tabs.provider')" name="provider">
        <section class="console-grid provider-grid">
          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.provider.routingTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.provider.routingSubtitle') }}</p>
              </div>
              <el-tag :type="providerTagType(aiConfig.provider)">{{ aiConfig.provider }}</el-tag>
            </div>

            <el-form label-position="top" class="control-form">
              <el-form-item :label="t('page.ai.provider.provider')">
                <el-segmented
                  v-model="providerDraft"
                  :options="providerOptions"
                  @change="handleProviderChange"
                />
              </el-form-item>
              <el-form-item :label="t('page.ai.provider.model')">
                <el-select v-model="modelDraft" filterable @change="aiConfig.setModel(modelDraft)">
                  <el-option
                    v-for="model in currentModelOptions"
                    :key="model"
                    :label="model"
                    :value="model"
                  />
                </el-select>
              </el-form-item>
              <div class="form-row">
                <el-form-item :label="t('page.ai.provider.temperature')">
                  <el-slider
                    v-model="temperatureDraft"
                    :min="0"
                    :max="2"
                    :step="0.1"
                    @change="aiConfig.updateConfig({ temperature: temperatureDraft })"
                  />
                </el-form-item>
                <el-form-item :label="t('page.ai.provider.topP')">
                  <el-slider
                    v-model="topPDraft"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    @change="aiConfig.updateConfig({ topP: topPDraft })"
                  />
                </el-form-item>
              </div>
              <el-form-item :label="t('page.ai.provider.maxTokens')">
                <el-input-number
                  v-model="maxTokensDraft"
                  :min="128"
                  :max="32768"
                  :step="128"
                  @change="aiConfig.updateConfig({ maxTokens: maxTokensDraft })"
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.provider.probeTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.provider.probeSubtitle') }}</p>
              </div>
              <el-button type="primary" :icon="Promotion" @click="runProviderProbe">
                {{ t('page.ai.actions.testChat') }}
              </el-button>
            </div>
            <el-input
              v-model="providerProbe"
              type="textarea"
              :rows="6"
              :placeholder="t('page.ai.provider.probePlaceholder')"
            />
            <div class="probe-result">
              <el-tag effect="plain">{{ chatStatus }}</el-tag>
              <span>{{
                streaming
                  ? t('page.ai.provider.streamingInPlayground')
                  : t('page.ai.provider.ready')
              }}</span>
            </div>
          </div>

          <div class="surface panel wide-panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.provider.credentialsTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.provider.credentialsSubtitle') }}</p>
              </div>
              <el-tag :type="apiKeyDraft ? 'success' : 'info'">
                {{ credentialStatus }}
              </el-tag>
            </div>
            <el-form label-position="top" class="control-form">
              <div class="form-row">
                <el-form-item :label="t('page.ai.provider.apiKey')">
                  <el-input
                    v-model="apiKeyDraft"
                    :prefix-icon="Key"
                    show-password
                    :placeholder="t('page.ai.provider.apiKeyPlaceholder')"
                  />
                </el-form-item>
                <el-form-item :label="t('page.ai.provider.baseUrl')">
                  <el-input
                    v-model="baseUrlDraft"
                    :placeholder="t('page.ai.provider.baseUrlPlaceholder')"
                  />
                </el-form-item>
              </div>
              <div class="form-row">
                <el-form-item :label="t('page.ai.provider.organizationId')">
                  <el-input
                    v-model="organizationIdDraft"
                    :placeholder="t('page.ai.provider.optionalPlaceholder')"
                  />
                </el-form-item>
                <el-form-item :label="t('page.ai.provider.projectId')">
                  <el-input
                    v-model="projectIdDraft"
                    :placeholder="t('page.ai.provider.optionalPlaceholder')"
                  />
                </el-form-item>
              </div>
              <div class="inline-actions">
                <el-button type="primary" :icon="Key" @click="saveProviderCredential">
                  {{ t('page.ai.actions.saveKey') }}
                </el-button>
                <el-button :icon="Hide" @click="clearProviderCredential">
                  {{ t('page.ai.actions.clearKey') }}
                </el-button>
              </div>
            </el-form>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane :label="t('page.ai.tabs.knowledge')" name="knowledge">
        <section class="console-grid knowledge-grid">
          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.knowledge.managerTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.knowledge.managerSubtitle') }}</p>
              </div>
              <div class="base-toolbar">
                <el-select v-model="activeKnowledgeBaseId" class="base-select">
                  <el-option
                    v-for="base in knowledgeBases"
                    :key="base.id"
                    :label="base.name"
                    :value="base.id"
                  />
                </el-select>
                <el-button :icon="DocumentAdd" @click="createKnowledgeBase">
                  {{ t('page.ai.actions.newBase') }}
                </el-button>
              </div>
            </div>

            <el-form label-position="top" class="control-form">
              <el-form-item :label="t('page.ai.knowledge.newBaseName')">
                <el-input
                  v-model="newKnowledgeBaseName"
                  :placeholder="t('page.ai.knowledge.newBasePlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('page.ai.knowledge.documentTitle')">
                <el-input
                  v-model="documentTitle"
                  :placeholder="t('page.ai.knowledge.documentTitlePlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('page.ai.knowledge.documentContent')">
                <el-input
                  v-model="documentContent"
                  type="textarea"
                  :rows="8"
                  :placeholder="t('page.ai.knowledge.documentContentPlaceholder')"
                />
              </el-form-item>
              <el-button type="primary" :icon="Upload" @click="uploadKnowledgeDocument">
                {{ t('page.ai.actions.uploadDocument') }}
              </el-button>
            </el-form>
          </div>

          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.knowledge.documentsTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.knowledge.documentsSubtitle') }}</p>
              </div>
              <el-tag>{{ t('page.ai.knowledge.docCount', { count: documents.length }) }}</el-tag>
            </div>
            <div class="document-list">
              <div v-for="document in documents" :key="document.id" class="document-item">
                <strong>{{ document.title }}</strong>
                <span>{{
                  t('page.ai.knowledge.charCount', { count: document.content.length })
                }}</span>
              </div>
              <el-empty
                v-if="!documents.length"
                :description="t('page.ai.knowledge.noDocuments')"
              />
            </div>
          </div>

          <div class="surface panel wide-panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.knowledge.retrievalTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.knowledge.retrievalSubtitle') }}</p>
              </div>
              <div class="inline-actions">
                <el-input-number v-model="retrievalTopK" :min="1" :max="8" size="small" />
                <el-button :icon="Search" type="primary" @click="runRetrieval">
                  {{ t('page.ai.actions.retrieve') }}
                </el-button>
              </div>
            </div>
            <el-input
              v-model="retrievalQuery"
              :placeholder="t('page.ai.knowledge.retrievalPlaceholder')"
            />
            <div class="retrieval-grid">
              <div>
                <h3>{{ t('page.ai.knowledge.topKChunks') }}</h3>
                <div v-for="chunk in retrievedChunks" :key="chunk.id" class="result-item">
                  <el-tag size="small">
                    {{ t('page.ai.knowledge.score', { score: chunk.score }) }}
                  </el-tag>
                  <p>{{ chunk.content }}</p>
                </div>
                <el-empty
                  v-if="!retrievedChunks.length"
                  :description="t('page.ai.knowledge.noRetrievalResults')"
                />
              </div>
              <div>
                <h3>{{ t('page.ai.knowledge.citations') }}</h3>
                <div v-for="citation in citations" :key="citation.id" class="result-item">
                  <strong>{{ citation.source }}</strong>
                  <p>{{ citation.content }}</p>
                </div>
                <el-empty
                  v-if="!citations.length"
                  :description="t('page.ai.knowledge.noCitations')"
                />
              </div>
            </div>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane :label="t('page.ai.tabs.prompt')" name="prompt">
        <section class="console-grid prompt-grid">
          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.prompt.templatesTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.prompt.templatesSubtitle') }}</p>
              </div>
              <el-button :icon="DocumentAdd" @click="savePromptTemplate">
                {{ t('page.ai.actions.saveDraft') }}
              </el-button>
            </div>
            <el-radio-group v-model="selectedTemplateId" class="template-list">
              <el-radio-button
                v-for="template in templates"
                :key="template.id"
                :label="template.id"
              >
                {{ template.name }}
              </el-radio-button>
            </el-radio-group>
            <el-input v-model="templateDraft" type="textarea" :rows="14" />
          </div>

          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.prompt.variablesTitle') }}</h2>
                <p class="section-subtitle">
                  {{ t('page.ai.prompt.variablesPrefix') }}
                  <code>{{ variableSyntax }}</code>
                  {{ t('page.ai.prompt.variablesSuffix') }}
                </p>
              </div>
              <el-button type="primary" :icon="View" @click="renderPromptPreview">{{
                t('page.ai.actions.preview')
              }}</el-button>
            </div>
            <div class="variable-tags">
              <el-tag v-for="variable in selectedTemplate?.variables" :key="variable">
                {{ variable }}
              </el-tag>
            </div>
            <el-input v-model="promptVariables" type="textarea" :rows="10" />
            <el-form label-position="top" class="control-form">
              <el-form-item :label="t('page.ai.prompt.globalSystemPrompt')">
                <el-input
                  v-model="systemPromptDraft"
                  type="textarea"
                  :rows="4"
                  @change="aiConfig.updateConfig({ systemPrompt: systemPromptDraft })"
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="surface panel wide-panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.prompt.previewTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.prompt.previewSubtitle') }}</p>
              </div>
              <el-tag :type="promptError ? 'danger' : 'success'">
                {{
                  promptError
                    ? t('page.ai.prompt.invalidVariables')
                    : t('page.ai.prompt.renderable')
                }}
              </el-tag>
            </div>
            <p v-if="promptError" class="error-text">{{ promptError }}</p>
            <pre>{{ promptPreview }}</pre>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane :label="t('page.ai.tabs.observability')" name="observability">
        <section class="console-grid observability-grid">
          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.observability.traceTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.observability.traceSubtitle') }}</p>
              </div>
              <el-button :icon="Delete" @click="clearObservability">
                {{ t('page.ai.actions.clear') }}
              </el-button>
            </div>
            <div class="trace-list">
              <button
                v-for="trace in snapshot.traces"
                :key="trace.traceId"
                class="trace-item"
                :class="{ active: selectedTraceId === trace.traceId }"
                @click="selectedTraceId = trace.traceId"
              >
                <strong>{{ trace.traceId }}</strong>
                <span>{{ trace.provider }} / {{ trace.model }}</span>
                <el-tag size="small" :type="traceStatusType(trace.status)">
                  {{ trace.status }}
                </el-tag>
              </button>
              <el-empty
                v-if="!snapshot.traces.length"
                :description="t('page.ai.observability.noTraces')"
              />
            </div>
          </div>

          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.observability.tokenTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.observability.tokenSubtitle') }}</p>
              </div>
              <el-tag>
                {{
                  t('page.ai.observability.tokenCount', {
                    count: selectedTokenUsage?.totalTokens || 0,
                  })
                }}
              </el-tag>
            </div>
            <div class="bar-stack">
              <div class="bar-row">
                <span>{{ t('page.ai.observability.promptTokens') }}</span>
                <div><i :style="{ width: tokenBarWidth(selectedTokenUsage?.promptTokens) }" /></div>
                <b>{{ selectedTokenUsage?.promptTokens || 0 }}</b>
              </div>
              <div class="bar-row">
                <span>{{ t('page.ai.observability.completionTokens') }}</span>
                <div class="completion">
                  <i :style="{ width: tokenBarWidth(selectedTokenUsage?.completionTokens) }" />
                </div>
                <b>{{ selectedTokenUsage?.completionTokens || 0 }}</b>
              </div>
            </div>
          </div>

          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.observability.latencyTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.observability.latencySubtitle') }}</p>
              </div>
            </div>
            <div class="latency-grid">
              <div>
                <span>{{ t('page.ai.observability.ttft') }}</span>
                <strong>{{ selectedLatency?.timeToFirstToken || 0 }}ms</strong>
              </div>
              <div>
                <span>{{ t('page.ai.observability.total') }}</span>
                <strong>{{ selectedLatency?.totalRequestTime || 0 }}ms</strong>
              </div>
              <div>
                <span>{{ t('page.ai.observability.chunks') }}</span>
                <strong>{{ selectedLatency?.chunkCount || 0 }}</strong>
              </div>
              <div>
                <span>{{ t('page.ai.observability.rate') }}</span>
                <strong>{{ formatRate(selectedLatency?.chunkRate) }}/s</strong>
              </div>
            </div>
          </div>

          <div class="surface panel wide-panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.observability.timelineTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.observability.timelineSubtitle') }}</p>
              </div>
            </div>
            <div class="timeline">
              <div
                v-for="event in selectedEvents"
                :key="`${event.traceId}-${event.timestamp}-${event.type}`"
              >
                <span class="timeline-dot" />
                <strong>{{ event.type }}</strong>
                <small>{{ new Date(event.timestamp).toLocaleTimeString() }}</small>
                <code>{{ summarizeEvent(event.payload) }}</code>
              </div>
              <el-empty
                v-if="!selectedEvents.length"
                :description="t('page.ai.observability.noEvents')"
              />
            </div>
            <div class="chunk-strip">
              <span v-for="(chunk, index) in chunkEvents" :key="`${chunk.timestamp}-${index}`">
                {{ getChunkText(chunk.payload) }}
              </span>
            </div>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane :label="t('page.ai.tabs.settings')" name="settings">
        <section class="console-grid settings-grid">
          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.settings.contextTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.settings.contextSubtitle') }}</p>
              </div>
              <el-tag>{{ aiConfig.compressionStrategy }}</el-tag>
            </div>
            <el-form label-position="top" class="control-form">
              <el-form-item :label="t('page.ai.settings.contextWindow')">
                <el-input-number
                  v-model="contextWindowDraft"
                  :min="1024"
                  :max="128000"
                  :step="1024"
                  @change="aiConfig.updateConfig({ contextWindow: contextWindowDraft })"
                />
              </el-form-item>
              <el-form-item :label="t('page.ai.settings.compressionStrategy')">
                <el-select
                  v-model="compressionDraft"
                  @change="aiConfig.updateConfig({ compressionStrategy: compressionDraft })"
                >
                  <el-option :label="t('page.ai.settings.strategyNone')" value="none" />
                  <el-option :label="t('page.ai.settings.strategyWindow')" value="window" />
                  <el-option :label="t('page.ai.settings.strategySummary')" value="summary" />
                  <el-option :label="t('page.ai.settings.strategyHybrid')" value="hybrid" />
                </el-select>
              </el-form-item>
              <el-checkbox
                v-model="streamDraft"
                @change="aiConfig.updateConfig({ stream: streamDraft })"
              >
                {{ t('page.ai.settings.enableStreaming') }}
              </el-checkbox>
              <el-checkbox
                v-model="knowledgeDraft"
                @change="aiConfig.updateConfig({ enableKnowledge: knowledgeDraft })"
              >
                {{ t('page.ai.settings.enableKnowledge') }}
              </el-checkbox>
              <el-checkbox
                v-model="cacheDraft"
                @change="aiConfig.updateConfig({ enableCache: cacheDraft })"
              >
                {{ t('page.ai.settings.enableCache') }}
              </el-checkbox>
            </el-form>
          </div>

          <div class="surface panel">
            <div class="panel-head">
              <div>
                <h2 class="section-title">{{ t('page.ai.settings.configTitle') }}</h2>
                <p class="section-subtitle">{{ t('page.ai.settings.configSubtitle') }}</p>
              </div>
              <div class="inline-actions">
                <el-button :icon="Download" @click="exportConfig">
                  {{ t('common.export') }}
                </el-button>
                <el-button type="primary" :icon="Upload" @click="importConfig">
                  {{ t('page.ai.actions.import') }}
                </el-button>
              </div>
            </div>
            <el-input v-model="configJson" type="textarea" :rows="18" />
            <p v-if="configError" class="error-text">{{ configError }}</p>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane :label="t('page.ai.tabs.playground')" name="playground">
        <AiChat />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiConsolePage',
})

import {
  Delete,
  DocumentAdd,
  Download,
  Hide,
  Key,
  Promotion,
  Refresh,
  Search,
  Upload,
  View,
} from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useChatRuntime } from '@/ai/composables/useChatRuntime'
import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { KnowledgeWorkspace } from '@/ai/knowledge'
import { RuntimeInspector } from '@/ai/observability'
import type { RuntimeInspectionSnapshot, TraceStatus } from '@/ai/observability'
import { PromptEngine } from '@/ai/prompt'
import type { PromptTemplate } from '@/ai/prompt'
import type { AIConfigPatch, AIProviderName, CompressionStrategy } from '@/ai/types'
import AiChat from '@/components/AiChat/index.vue'
import { useAiConfigStore } from '@/store'

const { t } = useI18n()

const providerModels: Record<AIProviderName, string[]> = {
  mock: ['mock-chat-runtime'],
  openai: ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
  qwen: ['qwen-max', 'qwen-plus'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

const providerOptions = Object.keys(providerModels)
const aiConfig = useAiConfigStore()
const { status: chatStatus, streaming, sendMessage } = useChatRuntime()

const activeTab = ref('provider')
const providerDraft = ref<AIProviderName>(aiConfig.provider)
const modelDraft = ref(aiConfig.model)
const temperatureDraft = ref(aiConfig.temperature)
const topPDraft = ref(aiConfig.topP)
const maxTokensDraft = ref(aiConfig.maxTokens)
const providerProbe = ref(t('page.ai.defaults.providerProbe'))
const apiKeyDraft = ref(aiConfig.currentProviderCredential.apiKey)
const baseUrlDraft = ref(aiConfig.currentProviderCredential.baseUrl)
const organizationIdDraft = ref(aiConfig.currentProviderCredential.organizationId || '')
const projectIdDraft = ref(aiConfig.currentProviderCredential.projectId || '')

const workspace = new KnowledgeWorkspace()
const defaultKnowledgeBase = workspace.createKnowledgeBase({
  id: 'runtime-docs',
  name: t('page.ai.defaults.knowledgeBaseName'),
  chunkSize: 360,
})
defaultKnowledgeBase.uploadDocument({
  title: t('page.ai.defaults.knowledgeDocTitle'),
  content: t('page.ai.defaults.knowledgeDocContent'),
})

const activeKnowledgeBaseId = ref(defaultKnowledgeBase.id)
const newKnowledgeBaseName = ref(t('page.ai.defaults.newKnowledgeBaseName'))
const documentTitle = ref(t('page.ai.defaults.documentTitle'))
const documentContent = ref('')
const retrievalQuery = ref(t('page.ai.defaults.retrievalQuery'))
const retrievalTopK = ref(3)
const documents = ref(defaultKnowledgeBase.getDocuments())
const retrievedChunks = ref(defaultKnowledgeBase.retrieve(retrievalQuery.value))
const citations = ref(defaultKnowledgeBase.cite(retrievedChunks.value))

const promptEngine = new PromptEngine()
const templates = ref(promptEngine.listTemplates())
const selectedTemplateId = ref('default-chat')
const templateDraft = ref(promptEngine.getTemplate(selectedTemplateId.value)?.template || '')
const promptVariables = ref(
  JSON.stringify(
    {
      role: 'enterprise',
      domain: 'AI runtime',
      context: t('page.ai.defaults.promptContext'),
      input: t('page.ai.defaults.promptInput'),
      goal: t('page.ai.defaults.promptGoal'),
      tools: 'TraceCollector, KnowledgeBase, PromptEngine',
    },
    null,
    2,
  ),
)
const systemPromptDraft = ref(aiConfig.systemPrompt)
const promptPreview = ref('')
const promptError = ref('')
const variableSyntax = '{{variableName}}'

const inspector = new RuntimeInspector(runtimeEventBus, {
  metadataResolver: () => ({
    provider: aiConfig.provider,
    model: aiConfig.model,
  }),
})
const emptySnapshot: RuntimeInspectionSnapshot = {
  traces: [],
  events: [],
  tokenUsage: [],
  latency: [],
}
const snapshot = ref<RuntimeInspectionSnapshot>(emptySnapshot)
const selectedTraceId = ref('')
let snapshotTimer: number | undefined

const contextWindowDraft = ref(aiConfig.contextWindow)
const compressionDraft = ref<CompressionStrategy>(aiConfig.compressionStrategy)
const streamDraft = ref(aiConfig.stream)
const knowledgeDraft = ref(aiConfig.enableKnowledge)
const cacheDraft = ref(aiConfig.enableCache)
const configJson = ref(JSON.stringify(aiConfig.currentConfig, null, 2))
const configError = ref('')

const currentModelOptions = computed(() => providerModels[providerDraft.value])
const activeKnowledgeBase = computed(() => workspace.getKnowledgeBase(activeKnowledgeBaseId.value))
const knowledgeBases = computed(() => workspace.listKnowledgeBases())
const selectedTemplate = computed(() => promptEngine.getTemplate(selectedTemplateId.value))
const latestTrace = computed(() => snapshot.value.traces.at(-1))
const selectedTrace = computed(
  () =>
    snapshot.value.traces.find((trace) => trace.traceId === selectedTraceId.value) ||
    latestTrace.value,
)
const selectedTokenUsage = computed(() =>
  snapshot.value.tokenUsage.find((usage) => usage.traceId === selectedTrace.value?.traceId),
)
const selectedLatency = computed(() =>
  snapshot.value.latency.find((metrics) => metrics.traceId === selectedTrace.value?.traceId),
)
const selectedEvents = computed(() => {
  const traceId = selectedTrace.value?.traceId
  if (!traceId) return []

  return snapshot.value.events.filter((event) => event.traceId === traceId)
})
const chunkEvents = computed(() =>
  selectedEvents.value.filter((event) => event.type === 'chat:chunk'),
)
const credentialStatus = computed(() =>
  apiKeyDraft.value ? t('page.ai.provider.credentialsConfigured') : t('page.ai.provider.noKey'),
)

function handleProviderChange(value: string | number | boolean) {
  providerDraft.value = value as AIProviderName
  aiConfig.setProvider(providerDraft.value)
  modelDraft.value = providerModels[providerDraft.value][0]
  aiConfig.setModel(modelDraft.value)
  syncCredentialDrafts()
}

function runProviderProbe() {
  sendMessage(providerProbe.value)
  activeTab.value = 'playground'
}

function saveProviderCredential() {
  aiConfig.updateProviderCredential(providerDraft.value, {
    apiKey: apiKeyDraft.value.trim(),
    baseUrl: baseUrlDraft.value.trim(),
    organizationId: organizationIdDraft.value.trim(),
    projectId: projectIdDraft.value.trim(),
  })
}

function clearProviderCredential() {
  aiConfig.clearProviderCredential(providerDraft.value)
  syncCredentialDrafts()
}

function syncCredentialDrafts() {
  const credential = aiConfig.currentProviderCredential
  apiKeyDraft.value = credential.apiKey
  baseUrlDraft.value = credential.baseUrl
  organizationIdDraft.value = credential.organizationId || ''
  projectIdDraft.value = credential.projectId || ''
}

function refreshKnowledgeState() {
  const base = activeKnowledgeBase.value
  documents.value = base?.getDocuments() || []
}

function createKnowledgeBase() {
  const name = newKnowledgeBaseName.value.trim()
  if (!name) return

  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const base = workspace.createKnowledgeBase({
    id: `${id || 'knowledge'}-${Date.now()}`,
    name,
    chunkSize: 360,
  })

  activeKnowledgeBaseId.value = base.id
  newKnowledgeBaseName.value = ''
}

function uploadKnowledgeDocument() {
  const base = activeKnowledgeBase.value
  const content = documentContent.value.trim()
  if (!base || !content) return

  base.uploadDocument({
    title: documentTitle.value.trim() || t('page.ai.knowledge.untitledDocument'),
    content,
  })
  documentContent.value = ''
  documentTitle.value = t('page.ai.defaults.documentTitle')
  refreshKnowledgeState()
}

function runRetrieval() {
  const base = activeKnowledgeBase.value
  if (!base) return

  const result = base.query(retrievalQuery.value, {
    topK: retrievalTopK.value,
  })
  retrievedChunks.value = result.chunks
  citations.value = result.citations
}

function parsePromptVariables() {
  try {
    promptError.value = ''
    return JSON.parse(promptVariables.value) as Record<string, unknown>
  } catch (error) {
    promptError.value = error instanceof Error ? error.message : String(error)
    return undefined
  }
}

function savePromptTemplate() {
  const template = selectedTemplate.value
  if (!template) return

  const nextTemplate: PromptTemplate = {
    ...template,
    template: templateDraft.value,
  }
  promptEngine.register(nextTemplate)
  templates.value = promptEngine.listTemplates()
}

function renderPromptPreview() {
  savePromptTemplate()
  const variables = parsePromptVariables()
  if (!variables) return

  promptPreview.value = promptEngine.buildFromContext(selectedTemplateId.value, {
    systemPrompt: systemPromptDraft.value,
    userPrompt: String(variables.input || ''),
    variables,
    retrievedDocuments: retrievedChunks.value,
    citations: citations.value,
  })
}

function refreshSnapshot() {
  snapshot.value = inspector.getSnapshot()
  selectedTraceId.value ||= snapshot.value.traces.at(-1)?.traceId || ''
}

function clearObservability() {
  inspector.clear()
  refreshSnapshot()
  selectedTraceId.value = ''
}

function tokenBarWidth(value = 0) {
  const total = selectedTokenUsage.value?.totalTokens || 1
  return `${Math.min(100, Math.round((value / total) * 100))}%`
}

function formatRate(value = 0) {
  return value.toFixed(1)
}

function summarizeEvent(payload: unknown) {
  if (!payload || typeof payload !== 'object') return String(payload)

  const source = payload as Record<string, unknown>
  return JSON.stringify({
    messageId: source.messageId,
    status: source.status,
    chunk: source.chunk,
  })
}

function getChunkText(payload: unknown) {
  if (!payload || typeof payload !== 'object') return ''

  return String((payload as Record<string, unknown>).chunk || '')
}

function providerTagType(provider: AIProviderName) {
  return provider === 'mock' ? 'success' : 'warning'
}

function traceStatusType(status: TraceStatus) {
  if (status === 'done') return 'success'
  if (status === 'error') return 'danger'
  if (status === 'cancelled') return 'warning'
  return 'primary'
}

function exportConfig() {
  configJson.value = JSON.stringify(aiConfig.currentConfig, null, 2)
  configError.value = ''
}

function importConfig() {
  try {
    const parsed = JSON.parse(configJson.value) as AIConfigPatch
    aiConfig.updateConfig(parsed)
    syncDraftsFromConfig()
    exportConfig()
  } catch (error) {
    configError.value = error instanceof Error ? error.message : String(error)
  }
}

function syncDraftsFromConfig() {
  providerDraft.value = aiConfig.provider
  modelDraft.value = aiConfig.model
  temperatureDraft.value = aiConfig.temperature
  topPDraft.value = aiConfig.topP
  maxTokensDraft.value = aiConfig.maxTokens
  contextWindowDraft.value = aiConfig.contextWindow
  compressionDraft.value = aiConfig.compressionStrategy
  streamDraft.value = aiConfig.stream
  knowledgeDraft.value = aiConfig.enableKnowledge
  cacheDraft.value = aiConfig.enableCache
  systemPromptDraft.value = aiConfig.systemPrompt
  syncCredentialDrafts()
}

watch(activeKnowledgeBaseId, () => {
  workspace.switchKnowledgeBase(activeKnowledgeBaseId.value)
  refreshKnowledgeState()
  runRetrieval()
})

watch(selectedTemplateId, (templateId) => {
  templateDraft.value = promptEngine.getTemplate(templateId)?.template || ''
  renderPromptPreview()
})

watch(
  () => aiConfig.currentConfig,
  () => {
    configJson.value = JSON.stringify(aiConfig.currentConfig, null, 2)
  },
)

onMounted(() => {
  inspector.start()
  renderPromptPreview()
  refreshSnapshot()
  snapshotTimer = window.setInterval(refreshSnapshot, 700)
})

onUnmounted(() => {
  inspector.stop()
  if (snapshotTimer) {
    window.clearInterval(snapshotTimer)
  }
})
</script>

<style scoped>
.ai-console {
  display: grid;
  gap: 18px;
}

.console-header {
  margin-bottom: 0;
}

.header-controls,
.inline-actions,
.probe-result {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-tile {
  display: grid;
  gap: 4px;
  min-height: 92px;
  padding: 14px;
}

.metric-tile span,
.metric-tile small {
  color: var(--app-muted);
  font-size: 12px;
}

.metric-tile strong {
  overflow: hidden;
  color: var(--app-heading);
  font-size: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.console-tabs {
  min-width: 0;
}

.console-tabs :deep(.el-tabs__header) {
  margin-bottom: 14px;
}

.console-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.provider-grid,
.settings-grid {
  grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
}

.observability-grid {
  grid-template-columns: minmax(300px, 0.85fr) repeat(2, minmax(0, 1fr));
}

.panel {
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
  padding: 16px;
}

.wide-panel {
  grid-column: 1 / -1;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.control-form {
  display: grid;
  gap: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.base-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.base-select {
  width: 180px;
}

.document-list,
.trace-list,
.bar-stack,
.timeline {
  display: grid;
  gap: 10px;
}

.document-item,
.result-item,
.trace-item {
  display: grid;
  gap: 6px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--app-panel-soft);
  color: var(--app-text);
  text-align: left;
}

.document-item span,
.result-item p,
.trace-item span {
  margin: 0;
  color: var(--app-muted);
  font-size: 12px;
  line-height: 1.55;
}

.trace-item {
  cursor: pointer;
}

.trace-item.active,
.trace-item:hover {
  border-color: var(--app-primary);
  background: var(--app-panel-muted);
}

.retrieval-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.retrieval-grid h3 {
  margin: 0 0 10px;
  color: var(--app-heading);
  font-size: 13px;
}

.template-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.variable-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.error-text {
  margin: 0;
  color: var(--app-danger);
  font-size: 12px;
}

.bar-row {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) 56px;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.bar-row div {
  overflow: hidden;
  height: 10px;
  border-radius: 999px;
  background: var(--app-panel-soft);
}

.bar-row i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--app-primary);
}

.bar-row .completion i {
  background: var(--app-success);
}

.latency-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.latency-grid div {
  display: grid;
  gap: 4px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-panel-soft);
}

.latency-grid span {
  color: var(--app-muted);
  font-size: 12px;
}

.latency-grid strong {
  color: var(--app-heading);
  font-size: 18px;
}

.timeline div {
  display: grid;
  grid-template-columns: 12px 120px 96px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--app-border-subtle);
  padding: 8px 0;
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--app-primary);
}

.timeline code {
  overflow: hidden;
  color: var(--app-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chunk-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px solid var(--app-border-subtle);
  padding-top: 12px;
}

.chunk-strip span {
  max-width: 180px;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 5px 8px;
  background: var(--app-panel-soft);
  color: var(--app-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .metric-grid,
  .console-grid,
  .provider-grid,
  .settings-grid,
  .observability-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .metric-grid,
  .console-grid,
  .provider-grid,
  .settings-grid,
  .observability-grid,
  .retrieval-grid,
  .form-row {
    grid-template-columns: 1fr;
  }

  .panel-head,
  .header-controls {
    display: grid;
    grid-template-columns: 1fr;
  }

  .timeline div {
    grid-template-columns: 12px minmax(0, 1fr);
  }

  .timeline small,
  .timeline code {
    grid-column: 2;
  }
}
</style>
