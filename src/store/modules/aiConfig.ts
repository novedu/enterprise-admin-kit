import { defineStore } from 'pinia'

import { DEFAULT_AI_CONFIG } from '@/ai/config/defaultConfig'
import { runtimeEventBus } from '@/ai/events/runtimeBus'
import type { AIConfig, AIConfigPatch, AIProviderName, ProviderCredential } from '@/ai/types'

const STORAGE_KEY = 'enterprise-admin-kit:ai-config'

function readPersistedConfig(): AIConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_AI_CONFIG }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_AI_CONFIG }

    return {
      ...DEFAULT_AI_CONFIG,
      ...(JSON.parse(raw) as AIConfigPatch),
    }
  } catch {
    return { ...DEFAULT_AI_CONFIG }
  }
}

function persistConfig(config: AIConfig) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export const useAiConfigStore = defineStore('aiConfig', {
  state: (): AIConfig => readPersistedConfig(),
  getters: {
    currentConfig: (state): AIConfig => ({ ...state }),
    isStreamingEnabled: (state) => state.stream,
    currentProvider: (state) => state.provider,
    currentProviderCredential: (state): ProviderCredential => ({
      apiKey: '',
      baseUrl: '',
      ...state.providerCredentials[state.provider],
    }),
  },
  actions: {
    updateConfig(partial: AIConfigPatch) {
      this.$patch(partial)
      persistConfig(this.currentConfig)
      emitConfigUpdates(partial)
    },
    setProvider(provider: AIProviderName) {
      this.provider = provider
      persistConfig(this.currentConfig)
      runtimeEventBus.emit('provider:change', {
        provider,
        model: this.model,
      })
      emitConfigUpdates({ provider })
    },
    setModel(model: string) {
      this.model = model
      persistConfig(this.currentConfig)
      runtimeEventBus.emit('provider:change', {
        provider: this.provider,
        model,
      })
      emitConfigUpdates({ model })
    },
    updateProviderCredential(provider: AIProviderName, partial: Partial<ProviderCredential>) {
      const nextCredentials = {
        ...this.providerCredentials,
        [provider]: {
          apiKey: '',
          baseUrl: '',
          ...this.providerCredentials[provider],
          ...partial,
        },
      }
      this.providerCredentials = nextCredentials
      persistConfig(this.currentConfig)
      emitConfigUpdates({ providerCredentials: nextCredentials })
    },
    clearProviderCredential(provider: AIProviderName) {
      this.updateProviderCredential(provider, {
        apiKey: '',
        baseUrl: '',
        organizationId: '',
        projectId: '',
      })
    },
    resetConfig() {
      this.$patch({ ...DEFAULT_AI_CONFIG })
      persistConfig(this.currentConfig)
      emitConfigUpdates(DEFAULT_AI_CONFIG)
    },
  },
})

function emitConfigUpdates(partial: AIConfigPatch) {
  for (const [key, value] of Object.entries(partial)) {
    runtimeEventBus.emit('config:update', { key, value })
  }
}
