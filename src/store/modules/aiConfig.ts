import { defineStore } from 'pinia'

import { DEFAULT_AI_CONFIG } from '@/ai/config/defaultConfig'
import {
  createConfigDiff,
  createCredentialRef,
  mergeAndValidateAIConfig,
  validateAIConfig,
} from '@/ai/config/validator'
import { runtimeEventBus } from '@/ai/events/runtimeBus'
import type { AIConfig, AIConfigPatch, AIProviderName, ProviderCredential } from '@/ai/types'

const STORAGE_KEY = 'enterprise-admin-kit:ai-config'

function readPersistedConfig(): AIConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_AI_CONFIG }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_AI_CONFIG }

    return validateAIConfig(JSON.parse(raw)).config
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
    currentProviderCredential: (state): ProviderCredential | undefined =>
      state.providerCredentials[state.provider],
  },
  actions: {
    updateConfig(partial: AIConfigPatch) {
      const result = mergeAndValidateAIConfig(this.currentConfig, partial)
      if (!result.valid) {
        throw new Error(result.errors.join('\n'))
      }

      const previous = this.currentConfig
      this.$patch(result.config)
      persistConfig(this.currentConfig)
      emitConfigUpdatesFromDiff(previous, this.currentConfig)
    },
    setProvider(provider: AIProviderName) {
      this.updateConfig({ provider })
      persistConfig(this.currentConfig)
      runtimeEventBus.emit('provider:change', {
        provider,
        model: this.model,
      })
    },
    setModel(model: string) {
      this.updateConfig({ model })
      persistConfig(this.currentConfig)
      runtimeEventBus.emit('provider:change', {
        provider: this.provider,
        model,
      })
    },
    updateProviderCredential(
      provider: AIProviderName,
      input: Pick<ProviderCredential, 'name' | 'encryptedRef'>,
    ) {
      const credential = createCredentialRef(
        provider,
        input.name.trim() || `${provider} credential`,
        input.encryptedRef.trim(),
      )
      const nextCredentials = {
        ...this.providerCredentials,
        [provider]: credential,
      }
      this.updateConfig({ providerCredentials: nextCredentials })
    },
    clearProviderCredential(provider: AIProviderName) {
      const nextCredentials = { ...this.providerCredentials }
      delete nextCredentials[provider]
      this.updateConfig({ providerCredentials: nextCredentials })
    },
    previewConfigDiff(partial: AIConfigPatch) {
      const result = mergeAndValidateAIConfig(this.currentConfig, partial)
      return {
        ...result,
        diff: createConfigDiff(this.currentConfig, result.config),
      }
    },
    resetConfig() {
      const previous = this.currentConfig
      this.$patch({ ...DEFAULT_AI_CONFIG })
      persistConfig(this.currentConfig)
      emitConfigUpdatesFromDiff(previous, this.currentConfig)
    },
  },
})

function emitConfigUpdatesFromDiff(previous: AIConfig, next: AIConfig) {
  for (const { key, after } of createConfigDiff(previous, next)) {
    runtimeEventBus.emit('config:update', { key, value: after })
  }
}
