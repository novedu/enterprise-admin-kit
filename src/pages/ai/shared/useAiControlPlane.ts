import { computed, ref } from 'vue'

import { useChatRuntime } from '@/ai/composables/useChatRuntime'
import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { KnowledgeWorkspace } from '@/ai/knowledge'
import { RuntimeInspector } from '@/ai/observability'
import type { RuntimeInspectionSnapshot, TraceStatus } from '@/ai/observability'
import { PromptEngine } from '@/ai/prompt'
import type { PromptTemplate } from '@/ai/prompt'
import type { AIConfigPatch, AIProviderName, CompressionStrategy } from '@/ai/types'
import { useAiConfigStore } from '@/store'

export const providerModels: Record<AIProviderName, string[]> = {
  mock: ['mock-chat-runtime'],
  openai: ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
  qwen: ['qwen-max', 'qwen-plus'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

const workspace = new KnowledgeWorkspace()
const defaultKnowledgeBase = workspace.createKnowledgeBase({
  id: 'runtime-docs',
  name: 'Runtime Docs',
  chunkSize: 360,
})
defaultKnowledgeBase.uploadDocument({
  title: 'Runtime Architecture',
  content:
    'ChatRuntime orchestrates context building, knowledge retrieval, prompt construction and provider streaming. ContextManager controls token windows and compression. PromptEngine renders final prompts. KnowledgeBase provides mock RAG citations.',
})

const promptEngine = new PromptEngine()
const inspector = new RuntimeInspector(runtimeEventBus, {
  metadataResolver: () => {
    const config = useAiConfigStore()

    return {
      provider: config.provider,
      model: config.model,
    }
  },
})

const activeKnowledgeBaseId = ref(defaultKnowledgeBase.id)
const newKnowledgeBaseName = ref('Security Runbook')
const documentTitle = ref('Knowledge Notes')
const documentContent = ref('')
const retrievalQuery = ref('runtime prompt knowledge')
const retrievalTopK = ref(3)
const documents = ref(defaultKnowledgeBase.getDocuments())
const retrievedChunks = ref(defaultKnowledgeBase.retrieve(retrievalQuery.value))
const citations = ref(defaultKnowledgeBase.cite(retrievedChunks.value))

const selectedTemplateId = ref('default-chat')
const templateDraft = ref(promptEngine.getTemplate(selectedTemplateId.value)?.template || '')
const promptVariables = ref(
  JSON.stringify(
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
  ),
)
const promptPreview = ref('')
const promptError = ref('')

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

export function useProviderCenter() {
  const aiConfig = useAiConfigStore()
  const { status: chatStatus, streaming, sendMessage } = useChatRuntime()
  const providerDraft = ref<AIProviderName>(aiConfig.provider)
  const modelDraft = ref(aiConfig.model)
  const temperatureDraft = ref(aiConfig.temperature)
  const topPDraft = ref(aiConfig.topP)
  const maxTokensDraft = ref(aiConfig.maxTokens)
  const providerProbe = ref(
    'Test the active provider routing and stream a short architecture note.',
  )
  const credentialNameDraft = ref(aiConfig.currentProviderCredential?.name || '')
  const credentialRefDraft = ref(aiConfig.currentProviderCredential?.encryptedRef || '')

  const currentModelOptions = computed(() => providerModels[providerDraft.value])
  const providerOptions = Object.keys(providerModels)
  const credentialStatus = computed(() => Boolean(aiConfig.currentProviderCredential?.encryptedRef))

  function syncCredentialDrafts() {
    const credential = aiConfig.currentProviderCredential
    credentialNameDraft.value = credential?.name || ''
    credentialRefDraft.value = credential?.encryptedRef || ''
  }

  function handleProviderChange(value: string | number | boolean) {
    providerDraft.value = value as AIProviderName
    aiConfig.setProvider(providerDraft.value)
    modelDraft.value = providerModels[providerDraft.value][0]
    aiConfig.setModel(modelDraft.value)
    syncCredentialDrafts()
  }

  function saveProviderCredential() {
    aiConfig.updateProviderCredential(providerDraft.value, {
      name: credentialNameDraft.value.trim() || `${providerDraft.value} credential`,
      encryptedRef:
        credentialRefDraft.value.trim() || `${providerDraft.value}://credential-reference`,
    })
    syncCredentialDrafts()
  }

  function clearProviderCredential() {
    aiConfig.clearProviderCredential(providerDraft.value)
    syncCredentialDrafts()
  }

  return {
    aiConfig,
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
    saveProviderCredential,
    clearProviderCredential,
  }
}

export function useKnowledgeConsole() {
  const activeKnowledgeBase = computed(() =>
    workspace.getKnowledgeBase(activeKnowledgeBaseId.value),
  )
  const knowledgeBases = computed(() => workspace.listKnowledgeBases())

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
    retrievedChunks.value = result.chunks
    citations.value = result.citations
  }

  function switchKnowledgeBase(id: string) {
    workspace.switchKnowledgeBase(id)
    refreshKnowledgeState()
    runRetrieval()
  }

  return {
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
  const aiConfig = useAiConfigStore()
  const systemPromptDraft = ref(aiConfig.systemPrompt)
  const templates = ref(promptEngine.listTemplates())
  const selectedTemplate = computed(() => promptEngine.getTemplate(selectedTemplateId.value))
  const variableSyntax = '{{variableName}}'

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

  function selectTemplate(templateId: string) {
    selectedTemplateId.value = templateId
    templateDraft.value = promptEngine.getTemplate(templateId)?.template || ''
    renderPromptPreview()
  }

  function saveSystemPrompt() {
    aiConfig.updateConfig({ systemPrompt: systemPromptDraft.value })
  }

  return {
    aiConfig,
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
  const latestTrace = computed(() => runtimeSnapshot.value.traces.at(-1))
  const selectedTrace = computed(
    () =>
      runtimeSnapshot.value.traces.find((trace) => trace.traceId === selectedTraceId.value) ||
      latestTrace.value,
  )
  const selectedTokenUsage = computed(() =>
    runtimeSnapshot.value.tokenUsage.find(
      (usage) => usage.traceId === selectedTrace.value?.traceId,
    ),
  )
  const selectedLatency = computed(() =>
    runtimeSnapshot.value.latency.find(
      (metrics) => metrics.traceId === selectedTrace.value?.traceId,
    ),
  )
  const selectedEvents = computed(() => {
    const traceId = selectedTrace.value?.traceId
    if (!traceId) return []

    return runtimeSnapshot.value.events.filter((event) => event.traceId === traceId)
  })
  const chunkEvents = computed(() =>
    selectedEvents.value.filter((event) => event.type === 'chat:chunk'),
  )

  function refreshSnapshot() {
    runtimeSnapshot.value = inspector.getSnapshot()
    selectedTraceId.value ||= runtimeSnapshot.value.traces.at(-1)?.traceId || ''
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
    snapshot: runtimeSnapshot,
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
  const aiConfig = useAiConfigStore()
  const contextWindowDraft = ref(aiConfig.contextWindow)
  const compressionDraft = ref<CompressionStrategy>(aiConfig.compressionStrategy)
  const streamDraft = ref(aiConfig.stream)
  const knowledgeDraft = ref(aiConfig.enableKnowledge)
  const cacheDraft = ref(aiConfig.enableCache)
  const configJson = ref(JSON.stringify(aiConfig.currentConfig, null, 2))
  const configError = ref('')

  function syncDraftsFromConfig() {
    contextWindowDraft.value = aiConfig.contextWindow
    compressionDraft.value = aiConfig.compressionStrategy
    streamDraft.value = aiConfig.stream
    knowledgeDraft.value = aiConfig.enableKnowledge
    cacheDraft.value = aiConfig.enableCache
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

  function resetConfig() {
    aiConfig.resetConfig()
    syncDraftsFromConfig()
    exportConfig()
  }

  return {
    aiConfig,
    contextWindowDraft,
    compressionDraft,
    streamDraft,
    knowledgeDraft,
    cacheDraft,
    configJson,
    configError,
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
