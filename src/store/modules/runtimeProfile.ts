import { defineStore } from 'pinia'

import { createConfigDiff, mergeAndValidateAIConfig, validateAIConfig } from '@/ai/config/validator'
import { runtimeEventBus } from '@/ai/events/runtimeBus'
import type { AIConfig, AIConfigPatch } from '@/ai/types'

import { useAiConfigStore } from './aiConfig'

const STORAGE_KEY = 'enterprise-ai-platform:runtime-profiles'

export interface ApplicationRuntimeProfile {
  applicationId: string
  patch: AIConfigPatch
  updatedAt: number
}

function readProfiles(): Record<string, ApplicationRuntimeProfile> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    return JSON.parse(raw) as Record<string, ApplicationRuntimeProfile>
  } catch {
    return {}
  }
}

function persistProfiles(profiles: Record<string, ApplicationRuntimeProfile>) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

function emitConfigUpdates(previous: AIConfig, next: AIConfig) {
  for (const { key, after } of createConfigDiff(previous, next)) {
    runtimeEventBus.emit('config:update', { key, value: after })
  }
}

export const useRuntimeProfileStore = defineStore('runtimeProfile', {
  state: () => ({
    profiles: readProfiles(),
  }),
  getters: {
    getProfile: (state) => (applicationId?: string) =>
      applicationId ? state.profiles[applicationId] : undefined,
    getProfilePatch:
      (state) =>
      (applicationId?: string): AIConfigPatch =>
        applicationId ? state.profiles[applicationId]?.patch || {} : {},
  },
  actions: {
    getResolvedConfig(applicationId?: string): AIConfig {
      const aiConfig = useAiConfigStore()
      const base = aiConfig.currentConfig
      const patch = applicationId ? this.profiles[applicationId]?.patch || {} : {}

      return validateAIConfig({
        ...base,
        ...patch,
        providerCredentials:
          patch.providerCredentials === undefined
            ? base.providerCredentials
            : patch.providerCredentials,
      }).config
    },
    updateProfile(applicationId: string, patch: AIConfigPatch) {
      if (!applicationId) {
        throw new Error('Application runtime profile requires an applicationId.')
      }

      const previous = this.getResolvedConfig(applicationId)
      const currentPatch = this.profiles[applicationId]?.patch || {}
      const baseConfig = useAiConfigStore().currentConfig
      const merged = mergeAndValidateAIConfig(baseConfig, {
        ...currentPatch,
        ...patch,
        providerCredentials:
          patch.providerCredentials === undefined
            ? currentPatch.providerCredentials
            : patch.providerCredentials,
      })

      if (!merged.valid) {
        throw new Error(merged.errors.join('\n'))
      }

      const nextPatch = {
        ...currentPatch,
        ...patch,
        providerCredentials:
          patch.providerCredentials === undefined
            ? currentPatch.providerCredentials
            : patch.providerCredentials,
      }

      this.profiles = {
        ...this.profiles,
        [applicationId]: {
          applicationId,
          patch: nextPatch,
          updatedAt: Date.now(),
        },
      }
      persistProfiles(this.profiles)
      emitConfigUpdates(previous, this.getResolvedConfig(applicationId))
    },
    resetProfile(applicationId: string) {
      if (!applicationId) return

      const previous = this.getResolvedConfig(applicationId)
      const nextProfiles = { ...this.profiles }
      delete nextProfiles[applicationId]
      this.profiles = nextProfiles
      persistProfiles(this.profiles)
      emitConfigUpdates(previous, this.getResolvedConfig(applicationId))
    },
  },
})
