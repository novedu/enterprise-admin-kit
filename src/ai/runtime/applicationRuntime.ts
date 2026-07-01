import { DEFAULT_AI_CONFIG } from '@/ai/config/defaultConfig'
import { ContextManager } from '@/ai/context/ContextManager'
import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { KnowledgeBase } from '@/ai/knowledge'
import { PromptEngine } from '@/ai/prompt'
import { createProvider } from '@/ai/providers/providerFactory'
import type { AIConfigReader, ChatSnapshot, AIProviderName } from '@/ai/types'

import { ChatRuntime } from './ChatRuntime'

export interface RuntimeScope {
  workspaceId?: string
  workspaceName?: string
  applicationId?: string
  applicationName?: string
  runtimeConfigId?: string
  providerId?: string
  knowledgeBaseId?: string
  promptTemplateId?: string
}

export interface RuntimeBinding {
  runtimeId: string
  scopeKey: string
  scope: RuntimeScope
  runtime: ChatRuntime
  readConfig: AIConfigReader
  activeProvider: AIProviderName
}

const DEFAULT_SCOPE_KEY = 'workspace:global/application:global'
const runtimeBindings = new Map<string, RuntimeBinding>()
let eventsBound = false

function createScopeKey(scope: RuntimeScope = {}) {
  const workspaceId = scope.workspaceId || 'global'
  const applicationId = scope.applicationId || 'global'

  return `workspace:${workspaceId}/application:${applicationId}`
}

function createRuntimeId(scopeKey: string) {
  return `runtime:${scopeKey}`
}

function createDefaultKnowledgeBase(scopeKey: string) {
  const base = new KnowledgeBase({
    id: `${scopeKey}:knowledge`,
    name: 'Application Runtime Knowledge',
    chunkSize: 360,
  })

  base.uploadDocument({
    title: 'Application Runtime Binding',
    content:
      'Application Runtime Binding creates an isolated ChatRuntime per workspace and application scope. It injects provider, prompt engine, knowledge base and config reader without coupling ChatRuntime to Vue or Pinia.',
  })

  return base
}

function decorateSnapshot(runtimeId: string, scope: RuntimeScope, snapshot: ChatSnapshot) {
  return {
    ...snapshot,
    scope: {
      runtimeId,
      workspaceId: scope.workspaceId,
      workspaceName: scope.workspaceName,
      applicationId: scope.applicationId,
      applicationName: scope.applicationName,
    },
  }
}

function bindRuntimeEvents() {
  if (eventsBound) return

  runtimeEventBus.on('config:update', ({ key }) => {
    for (const binding of runtimeBindings.values()) {
      if (key === 'provider') {
        syncProvider(binding)
      }

      binding.runtime.refreshGuards()
    }
  })
  eventsBound = true
}

function syncProvider(binding: RuntimeBinding) {
  const config = binding.readConfig()
  if (config.provider === binding.activeProvider) return

  binding.runtime.setProvider(createProvider(config))
  binding.activeProvider = config.provider
}

export function getApplicationRuntimeBinding(
  scope: RuntimeScope = {},
  readConfig: AIConfigReader = () => DEFAULT_AI_CONFIG,
) {
  const scopeKey = createScopeKey(scope)
  const cached = runtimeBindings.get(scopeKey)

  if (cached) {
    Object.assign(cached.scope, scope)
    syncProvider(cached)
    return cached
  }

  const config = readConfig()
  const runtimeId = createRuntimeId(scopeKey)
  const bindingScope: RuntimeScope = { ...scope }
  const runtime = new ChatRuntime(
    createProvider(config),
    runtimeEventBus,
    readConfig,
    new ContextManager(),
    new PromptEngine(),
    createDefaultKnowledgeBase(scopeKey),
    (snapshot) => decorateSnapshot(runtimeId, bindingScope, snapshot),
  )

  const binding: RuntimeBinding = {
    runtimeId,
    scopeKey,
    scope: bindingScope,
    runtime,
    readConfig,
    activeProvider: config.provider,
  }

  runtimeBindings.set(scopeKey, binding)
  bindRuntimeEvents()

  return binding
}

export function getDefaultRuntimeBinding(readConfig: AIConfigReader = () => DEFAULT_AI_CONFIG) {
  return getApplicationRuntimeBinding(
    {
      workspaceId: 'global',
      workspaceName: 'Global Workspace',
      applicationId: 'global',
      applicationName: 'Global Application',
    },
    readConfig,
  )
}

export function listRuntimeBindings() {
  return Array.from(runtimeBindings.values())
}

export function clearRuntimeBindings() {
  runtimeBindings.clear()
}

export { DEFAULT_SCOPE_KEY }
