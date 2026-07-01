import { computed, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { useChatRuntime } from '@/ai/composables/useChatRuntime'
import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { KnowledgeWorkspace } from '@/ai/knowledge'
import type { KnowledgeChunk, KnowledgeCitation, KnowledgeDocument } from '@/ai/knowledge'
import { RuntimeInspector } from '@/ai/observability'
import type { RuntimeInspectionSnapshot, TraceStatus } from '@/ai/observability'
import { PromptEngine } from '@/ai/prompt'
import type { PromptTemplate } from '@/ai/prompt'
import type { AIConfigPatch, AIProviderName, CompressionStrategy } from '@/ai/types'
import {
  useAiConfigStore,
  useApplicationStore,
  useRuntimeProfileStore,
  useWorkspaceStore,
} from '@/store'

import { useAiScope } from './useAiScope'

export const providerModels: Record<AIProviderName, string[]> = {
  mock: ['mock-chat-runtime'],
  openai: ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
  qwen: ['qwen-max', 'qwen-plus'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

const inspector = new RuntimeInspector(runtimeEventBus, {
  metadataResolver: () => {
    const runtimeProfile = useRuntimeProfileStore()
    const workspace = useWorkspaceStore()
    const application = useApplicationStore()
    const config = runtimeProfile.getResolvedConfig(application.currentApplication?.id)

    return {
      provider: config.provider,
      model: config.model,
      workspaceId: workspace.currentWorkspace?.id,
      workspaceName: workspace.currentWorkspace?.name,
      applicationId: application.currentApplication?.id,
      applicationName: application.currentApplication?.name,
    }
  },
})

const emptySnapshot: RuntimeInspectionSnapshot = {
  traces: [],
  events: [],
  tokenUsage: [],
  latency: [],
}
const runtimeSnapshot = ref<RuntimeInspectionSnapshot>(emptySnapshot)
const selectedTraceId = ref('')
let observabilityStarted = false
let snapshotTimer: number | undefined

const FALLBACK_SCOPE_KEY = 'workspace:pending/application:pending'

interface ScopeIdentity {
  workspaceId: string
  applicationId: string
}

interface KnowledgeConsoleState {
  workspace: KnowledgeWorkspace
  activeKnowledgeBaseId: Ref<string>
  newKnowledgeBaseName: Ref<string>
  documentTitle: Ref<string>
  documentContent: Ref<string>
  retrievalQuery: Ref<string>
  retrievalTopK: Ref<number>
  documents: Ref<KnowledgeDocument[]>
  retrievedChunks: Ref<KnowledgeChunk[]>
  citations: Ref<KnowledgeCitation[]>
}

interface PromptStudioState {
  engine: PromptEngine
  selectedTemplateId: Ref<string>
  templateDraft: Ref<string>
  promptVariables: Ref<string>
  promptPreview: Ref<string>
  promptError: Ref<string>
  systemPromptDraft: Ref<string>
  templates: Ref<PromptTemplate[]>
}

const knowledgeStates = new Map<string, KnowledgeConsoleState>()
const promptStates = new Map<string, PromptStudioState>()

function createScopeKey(scope: ScopeIdentity) {
  if (!scope.workspaceId || !scope.applicationId) return FALLBACK_SCOPE_KEY

  return `workspace:${scope.workspaceId}/application:${scope.applicationId}`
}

function getScopedKnowledgeState(scopeKey: string) {
  const cached = knowledgeStates.get(scopeKey)
  if (cached) return cached

  const knowledgeWorkspace = new KnowledgeWorkspace()
  const defaultKnowledgeBase = knowledgeWorkspace.createKnowledgeBase({
    id: 'runtime-docs',
    name: 'Runtime Docs',
    chunkSize: 360,
  })
  defaultKnowledgeBase.uploadDocument({
    title: 'Runtime Architecture',
    content:
      'ChatRuntime orchestrates context building, knowledge retrieval, prompt construction and provider streaming. ContextManager controls token windows and compression. PromptEngine renders final prompts. KnowledgeBase provides mock RAG citations.',
  })

  const retrievalQuery = ref('runtime prompt knowledge')
  const retrievalTopK = ref(3)
  const retrievalResult = defaultKnowledgeBase.query(retrievalQuery.value, {
    topK: retrievalTopK.value,
  })
  const state: KnowledgeConsoleState = {
    workspace: knowledgeWorkspace,
    activeKnowledgeBaseId: ref(defaultKnowledgeBase.id),
    newKnowledgeBaseName: ref('Security Runbook'),
    documentTitle: ref('Knowledge Notes'),
    documentContent: ref(''),
    retrievalQuery,
    retrievalTopK,
    documents: ref(defaultKnowledgeBase.getDocuments()),
    retrievedChunks: ref(retrievalResult.chunks),
    citations: ref(retrievalResult.citations),
  }

  knowledgeStates.set(scopeKey, state)

  return state
}

function createDefaultPromptVariables() {
  return JSON.stringify(
    {
      role: 'enterprise',
      domain: 'AI runtime',
      context: 'The runtime uses EventBus, Provider Factory and ContextManager.',
      input: 'Explain the current architecture.',
      goal: 'Inspect runtime behavior',
      tools: 'TraceCollector, KnowledgeBase, PromptEngine',
    },
    null,
    2,
  )
}

function getScopedPromptState(scopeKey: string, systemPrompt: string) {
  const cached = promptStates.get(scopeKey)
  if (cached) return cached

  const engine = new PromptEngine()
  const selectedTemplateId = ref('default-chat')
  const state: PromptStudioState = {
    engine,
    selectedTemplateId,
    templateDraft: ref(engine.getTemplate(selectedTemplateId.value)?.template || ''),
    promptVariables: ref(createDefaultPromptVariables()),
    promptPreview: ref(''),
    promptError: ref(''),
    systemPromptDraft: ref(systemPrompt),
    templates: ref(engine.listTemplates()),
  }

  promptStates.set(scopeKey, state)

  return state
}

function createWritableScopedRef<T>(getValue: () => Ref<T>) {
  return computed<T>({
    get: () => getValue().value,
    set: (value) => {
      getValue().value = value
    },
  })
}

function useScopedRuntimeConfig(aiScope = useAiScope()) {
  const globalConfig = useAiConfigStore()
  const runtimeProfile = useRuntimeProfileStore()
  const applicationId = computed(() => aiScope.applicationId.value)
  const runtimeConfig = computed(() => runtimeProfile.getResolvedConfig(applicationId.value))
  const currentProviderCredential = computed(
    () => runtimeConfig.value.providerCredentials[runtimeConfig.value.provider],
  )

  function updateRuntimeConfig(patch: AIConfigPatch) {
    if (applicationId.value) {
      runtimeProfile.updateProfile(applicationId.value, patch)
      return
    }

    globalConfig.updateConfig(patch)
  }

  function resetRuntimeConfig() {
    if (applicationId.value) {
      runtimeProfile.resetProfile(applicationId.value)
      return
    }

    globalConfig.resetConfig()
  }

  return {
    globalConfig,
    runtimeProfile,
    applicationId,
    runtimeConfig,
    currentProviderCredential,
    updateRuntimeConfig,
    resetRuntimeConfig,
  }
}

export function useProviderCenter() {
  const aiScope = useAiScope()
  onMounted(aiScope.ensureAiScope)
  const { runtimeConfig, currentProviderCredential, updateRuntimeConfig } =
    useScopedRuntimeConfig(aiScope)
  const { status: chatStatus, streaming, sendMessage } = useChatRuntime()
  const providerDraft = ref<AIProviderName>(runtimeConfig.value.provider)
  const modelDraft = ref(runtimeConfig.value.model)
  const temperatureDraft = ref(runtimeConfig.value.temperature)
  const topPDraft = ref(runtimeConfig.value.topP)
  const maxTokensDraft = ref(runtimeConfig.value.maxTokens)
  const providerProbe = ref(
    'Test the active provider routing and stream a short architecture note.',
  )
  const credentialNameDraft = ref(currentProviderCredential.value?.name || '')
  const credentialRefDraft = ref(currentProviderCredential.value?.encryptedRef || '')

  const currentModelOptions = computed(() => providerModels[providerDraft.value])
  const providerOptions = Object.keys(providerModels)
  const credentialStatus = computed(() => Boolean(currentProviderCredential.value?.encryptedRef))

  watch(
    runtimeConfig,
    (value) => {
      providerDraft.value = value.provider
      modelDraft.value = value.model
      temperatureDraft.value = value.temperature
      topPDraft.value = value.topP
      maxTokensDraft.value = value.maxTokens
      syncCredentialDrafts()
    },
    { immediate: true },
  )

  function syncCredentialDrafts() {
    const credential = currentProviderCredential.value
    credentialNameDraft.value = credential?.name || ''
    credentialRefDraft.value = credential?.encryptedRef || ''
  }

  function handleProviderChange(value: string | number | boolean) {
    providerDraft.value = value as AIProviderName
    modelDraft.value = providerModels[providerDraft.value][0]
    updateRuntimeConfig({
      provider: providerDraft.value,
      model: modelDraft.value,
    })
    syncCredentialDrafts()
  }

  function handleModelChange() {
    updateRuntimeConfig({ model: modelDraft.value })
  }

  function updateGenerationConfig(patch: AIConfigPatch) {
    updateRuntimeConfig(patch)
  }

  function saveProviderCredential() {
    const credential = {
      id: `credential-${providerDraft.value}-${Date.now()}`,
      name: credentialNameDraft.value.trim() || `${providerDraft.value} credential`,
      type: providerDraft.value,
      encryptedRef:
        credentialRefDraft.value.trim() || `${providerDraft.value}://credential-reference`,
    }

    updateRuntimeConfig({
      providerCredentials: {
        ...runtimeConfig.value.providerCredentials,
        [providerDraft.value]: credential,
      },
    })
    syncCredentialDrafts()
  }

  function clearProviderCredential() {
    const nextCredentials = { ...runtimeConfig.value.providerCredentials }
    delete nextCredentials[providerDraft.value]
    updateRuntimeConfig({ providerCredentials: nextCredentials })
    syncCredentialDrafts()
  }

  return {
    aiScope,
    currentWorkspace: aiScope.currentWorkspace,
    currentApplication: aiScope.currentApplication,
    scopeReady: aiScope.scopeReady,
    scopeLabel: aiScope.scopeLabel,
    aiConfig: runtimeConfig,
    chatStatus,
    streaming,
    sendMessage,
    providerDraft,
    modelDraft,
    temperatureDraft,
    topPDraft,
    maxTokensDraft,
    providerProbe,
    credentialNameDraft,
    credentialRefDraft,
    currentModelOptions,
    providerOptions,
    credentialStatus,
    handleProviderChange,
    handleModelChange,
    updateGenerationConfig,
    saveProviderCredential,
    clearProviderCredential,
  }
}

export function useKnowledgeConsole() {
  const aiScope = useAiScope()
  onMounted(aiScope.ensureAiScope)
  const scopeKey = computed(() =>
    createScopeKey({
      workspaceId: aiScope.workspaceId.value,
      applicationId: aiScope.applicationId.value,
    }),
  )
  const scopedState = computed(() => getScopedKnowledgeState(scopeKey.value))
  const activeKnowledgeBaseId = createWritableScopedRef(
    () => scopedState.value.activeKnowledgeBaseId,
  )
  const newKnowledgeBaseName = createWritableScopedRef(() => scopedState.value.newKnowledgeBaseName)
  const documentTitle = createWritableScopedRef(() => scopedState.value.documentTitle)
  const documentContent = createWritableScopedRef(() => scopedState.value.documentContent)
  const retrievalQuery = createWritableScopedRef(() => scopedState.value.retrievalQuery)
  const retrievalTopK = createWritableScopedRef(() => scopedState.value.retrievalTopK)
  const documents = computed(() => scopedState.value.documents.value)
  const retrievedChunks = computed(() => scopedState.value.retrievedChunks.value)
  const citations = computed(() => scopedState.value.citations.value)
  const activeKnowledgeBase = computed(() =>
    scopedState.value.workspace.getKnowledgeBase(activeKnowledgeBaseId.value),
  )
  const knowledgeBases = computed(() => scopedState.value.workspace.listKnowledgeBases())

  function refreshKnowledgeState() {
    const base = activeKnowledgeBase.value
    scopedState.value.documents.value = base?.getDocuments() || []
  }

  function createKnowledgeBase() {
    const name = newKnowledgeBaseName.value.trim()
    if (!name) return

    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const base = scopedState.value.workspace.createKnowledgeBase({
      id: `${id || 'knowledge'}-${Date.now()}`,
      name,
      chunkSize: 360,
    })

    activeKnowledgeBaseId.value = base.id
    newKnowledgeBaseName.value = ''
    refreshKnowledgeState()
  }

  function uploadKnowledgeDocument() {
    const base = activeKnowledgeBase.value
    const content = documentContent.value.trim()
    if (!base || !content) return

    base.uploadDocument({
      title: documentTitle.value.trim() || 'Untitled Document',
      content,
    })
    documentContent.value = ''
    documentTitle.value = 'Knowledge Notes'
    refreshKnowledgeState()
  }

  function runRetrieval() {
    const base = activeKnowledgeBase.value
    if (!base) return

    const result = base.query(retrievalQuery.value, {
      topK: retrievalTopK.value,
    })
    scopedState.value.retrievedChunks.value = result.chunks
    scopedState.value.citations.value = result.citations
  }

  function switchKnowledgeBase(id: string) {
    scopedState.value.workspace.switchKnowledgeBase(id)
    refreshKnowledgeState()
    runRetrieval()
  }

  return {
    aiScope,
    currentWorkspace: aiScope.currentWorkspace,
    currentApplication: aiScope.currentApplication,
    scopeReady: aiScope.scopeReady,
    scopeLabel: aiScope.scopeLabel,
    activeKnowledgeBase,
    activeKnowledgeBaseId,
    knowledgeBases,
    newKnowledgeBaseName,
    documentTitle,
    documentContent,
    documents,
    retrievalQuery,
    retrievalTopK,
    retrievedChunks,
    citations,
    createKnowledgeBase,
    uploadKnowledgeDocument,
    runRetrieval,
    switchKnowledgeBase,
  }
}

export function usePromptStudio() {
  const aiScope = useAiScope()
  onMounted(aiScope.ensureAiScope)
  const { runtimeConfig, updateRuntimeConfig } = useScopedRuntimeConfig(aiScope)
  const scopeKey = computed(() =>
    createScopeKey({
      workspaceId: aiScope.workspaceId.value,
      applicationId: aiScope.applicationId.value,
    }),
  )
  const scopedState = computed(() =>
    getScopedPromptState(scopeKey.value, runtimeConfig.value.systemPrompt),
  )
  const selectedTemplateId = createWritableScopedRef(() => scopedState.value.selectedTemplateId)
  const templateDraft = createWritableScopedRef(() => scopedState.value.templateDraft)
  const promptVariables = createWritableScopedRef(() => scopedState.value.promptVariables)
  const promptPreview = createWritableScopedRef(() => scopedState.value.promptPreview)
  const promptError = createWritableScopedRef(() => scopedState.value.promptError)
  const systemPromptDraft = createWritableScopedRef(() => scopedState.value.systemPromptDraft)
  const templates = computed(() => scopedState.value.templates.value)
  const selectedTemplate = computed(() =>
    scopedState.value.engine.getTemplate(selectedTemplateId.value),
  )
  const variableSyntax = '{{variableName}}'

  watch(
    runtimeConfig,
    (value) => {
      systemPromptDraft.value = value.systemPrompt
    },
    { immediate: true },
  )

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
    scopedState.value.engine.register(nextTemplate)
    scopedState.value.templates.value = scopedState.value.engine.listTemplates()
  }

  function renderPromptPreview() {
    savePromptTemplate()
    const variables = parsePromptVariables()
    if (!variables) return

    const knowledgeState = getScopedKnowledgeState(scopeKey.value)

    promptPreview.value = scopedState.value.engine.buildFromContext(selectedTemplateId.value, {
      systemPrompt: systemPromptDraft.value,
      userPrompt: String(variables.input || ''),
      variables,
      retrievedDocuments: knowledgeState.retrievedChunks.value,
      citations: knowledgeState.citations.value,
    })
  }

  function selectTemplate(templateId: string) {
    selectedTemplateId.value = templateId
    templateDraft.value = scopedState.value.engine.getTemplate(templateId)?.template || ''
    renderPromptPreview()
  }

  function saveSystemPrompt() {
    updateRuntimeConfig({ systemPrompt: systemPromptDraft.value })
  }

  return {
    aiScope,
    currentWorkspace: aiScope.currentWorkspace,
    currentApplication: aiScope.currentApplication,
    scopeReady: aiScope.scopeReady,
    scopeLabel: aiScope.scopeLabel,
    aiConfig: runtimeConfig,
    templates,
    selectedTemplateId,
    selectedTemplate,
    templateDraft,
    promptVariables,
    promptPreview,
    promptError,
    variableSyntax,
    systemPromptDraft,
    savePromptTemplate,
    renderPromptPreview,
    selectTemplate,
    saveSystemPrompt,
  }
}

export function useRuntimeObservability() {
  const aiScope = useAiScope()
  onMounted(aiScope.ensureAiScope)
  const scopedSnapshot = computed<RuntimeInspectionSnapshot>(() => {
    const workspaceId = aiScope.workspaceId.value
    const applicationId = aiScope.applicationId.value
    if (!workspaceId || !applicationId) return emptySnapshot

    const traceIds = new Set(
      runtimeSnapshot.value.traces
        .filter(
          (trace) => trace.workspaceId === workspaceId && trace.applicationId === applicationId,
        )
        .map((trace) => trace.traceId),
    )

    return {
      traces: runtimeSnapshot.value.traces.filter((trace) => traceIds.has(trace.traceId)),
      events: runtimeSnapshot.value.events.filter((event) => traceIds.has(event.traceId)),
      tokenUsage: runtimeSnapshot.value.tokenUsage.filter((usage) => traceIds.has(usage.traceId)),
      latency: runtimeSnapshot.value.latency.filter((metrics) => traceIds.has(metrics.traceId)),
    }
  })
  const latestTrace = computed(() => scopedSnapshot.value.traces.at(-1))
  const selectedTrace = computed(
    () =>
      scopedSnapshot.value.traces.find((trace) => trace.traceId === selectedTraceId.value) ||
      latestTrace.value,
  )
  const selectedTokenUsage = computed(() =>
    scopedSnapshot.value.tokenUsage.find((usage) => usage.traceId === selectedTrace.value?.traceId),
  )
  const selectedLatency = computed(() =>
    scopedSnapshot.value.latency.find(
      (metrics) => metrics.traceId === selectedTrace.value?.traceId,
    ),
  )
  const selectedEvents = computed(() => {
    const traceId = selectedTrace.value?.traceId
    if (!traceId) return []

    return scopedSnapshot.value.events.filter((event) => event.traceId === traceId)
  })
  const chunkEvents = computed(() =>
    selectedEvents.value.filter((event) => event.type === 'chat:chunk'),
  )

  function refreshSnapshot() {
    runtimeSnapshot.value = inspector.getSnapshot()
    const selectedStillVisible = scopedSnapshot.value.traces.some(
      (trace) => trace.traceId === selectedTraceId.value,
    )
    if (!selectedStillVisible) {
      selectedTraceId.value = scopedSnapshot.value.traces.at(-1)?.traceId || ''
    }
  }

  function startObservability() {
    if (!observabilityStarted) {
      inspector.start()
      observabilityStarted = true
    }
    refreshSnapshot()
    snapshotTimer = window.setInterval(refreshSnapshot, 700)
  }

  function stopObservability() {
    if (snapshotTimer) {
      window.clearInterval(snapshotTimer)
      snapshotTimer = undefined
    }
  }

  function clearObservability() {
    inspector.clear()
    refreshSnapshot()
    selectedTraceId.value = ''
  }

  return {
    aiScope,
    currentWorkspace: aiScope.currentWorkspace,
    currentApplication: aiScope.currentApplication,
    scopeReady: aiScope.scopeReady,
    scopeLabel: aiScope.scopeLabel,
    snapshot: scopedSnapshot,
    selectedTraceId,
    latestTrace,
    selectedTrace,
    selectedTokenUsage,
    selectedLatency,
    selectedEvents,
    chunkEvents,
    refreshSnapshot,
    startObservability,
    stopObservability,
    clearObservability,
  }
}

export function useRuntimeSettings() {
  const aiScope = useAiScope()
  onMounted(aiScope.ensureAiScope)
  const { runtimeConfig, updateRuntimeConfig, resetRuntimeConfig } = useScopedRuntimeConfig(aiScope)
  const contextWindowDraft = ref(runtimeConfig.value.contextWindow)
  const compressionDraft = ref<CompressionStrategy>(runtimeConfig.value.compressionStrategy)
  const streamDraft = ref(runtimeConfig.value.stream)
  const knowledgeDraft = ref(runtimeConfig.value.enableKnowledge)
  const cacheDraft = ref(runtimeConfig.value.enableCache)
  const configJson = ref('')
  const configError = ref('')

  const scopedConfigExport = computed(() => ({
    scope: {
      workspaceId: aiScope.workspaceId.value,
      workspaceName: aiScope.currentWorkspace.value?.name || '',
      applicationId: aiScope.applicationId.value,
      applicationName: aiScope.currentApplication.value?.name || '',
    },
    config: runtimeConfig.value,
  }))

  function syncDraftsFromConfig() {
    contextWindowDraft.value = runtimeConfig.value.contextWindow
    compressionDraft.value = runtimeConfig.value.compressionStrategy
    streamDraft.value = runtimeConfig.value.stream
    knowledgeDraft.value = runtimeConfig.value.enableKnowledge
    cacheDraft.value = runtimeConfig.value.enableCache
  }

  watch(
    runtimeConfig,
    () => {
      syncDraftsFromConfig()
    },
    { immediate: true },
  )

  function exportConfig() {
    configJson.value = JSON.stringify(scopedConfigExport.value, null, 2)
    configError.value = ''
  }

  function importConfig() {
    try {
      const parsed = JSON.parse(configJson.value) as unknown
      const patch =
        parsed &&
        typeof parsed === 'object' &&
        'config' in parsed &&
        (parsed as { config?: unknown }).config
          ? (parsed as { config: AIConfigPatch }).config
          : (parsed as AIConfigPatch)

      updateRuntimeConfig(patch)
      syncDraftsFromConfig()
      exportConfig()
    } catch (error) {
      configError.value = error instanceof Error ? error.message : String(error)
    }
  }

  function resetConfig() {
    resetRuntimeConfig()
    syncDraftsFromConfig()
    exportConfig()
  }

  exportConfig()

  return {
    aiScope,
    currentWorkspace: aiScope.currentWorkspace,
    currentApplication: aiScope.currentApplication,
    scopeReady: aiScope.scopeReady,
    scopeLabel: aiScope.scopeLabel,
    aiConfig: runtimeConfig,
    contextWindowDraft,
    compressionDraft,
    streamDraft,
    knowledgeDraft,
    cacheDraft,
    configJson,
    configError,
    updateRuntimeConfig,
    exportConfig,
    importConfig,
    resetConfig,
  }
}

export function providerTagType(provider: AIProviderName) {
  return provider === 'mock' ? 'success' : 'warning'
}

export function traceStatusType(status: TraceStatus) {
  if (status === 'done') return 'success'
  if (status === 'error') return 'danger'
  if (status === 'cancelled') return 'warning'
  return 'primary'
}

export function tokenBarWidth(totalTokens = 1, value = 0) {
  return `${Math.min(100, Math.round((value / totalTokens) * 100))}%`
}

export function formatRate(value = 0) {
  return value.toFixed(1)
}

export function summarizeEvent(payload: unknown) {
  if (!payload || typeof payload !== 'object') return String(payload)

  const source = payload as Record<string, unknown>
  return JSON.stringify({
    messageId: source.messageId,
    status: source.status,
    chunk: source.chunk,
    step: source.step,
  })
}

export function getChunkText(payload: unknown) {
  if (!payload || typeof payload !== 'object') return ''

  return String((payload as Record<string, unknown>).chunk || '')
}
