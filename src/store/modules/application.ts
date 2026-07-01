import { defineStore } from 'pinia'

import { applicationRepository } from '@/domain/application/ApplicationRepository'
import type { Application, CreateApplicationInput } from '@/domain/application/Application'

const CURRENT_APPLICATION_KEY = 'enterprise-ai-platform:current-application'

function storageKey(workspaceId: string) {
  return `${CURRENT_APPLICATION_KEY}:${workspaceId}`
}

function readCurrentApplicationId(workspaceId: string) {
  if (typeof window === 'undefined' || !workspaceId) return ''

  return window.localStorage.getItem(storageKey(workspaceId)) || ''
}

function persistCurrentApplicationId(workspaceId: string, applicationId: string) {
  if (typeof window === 'undefined' || !workspaceId) return

  window.localStorage.setItem(storageKey(workspaceId), applicationId)
}

export const useApplicationStore = defineStore('application', {
  state: () => ({
    applicationList: [] as Application[],
    currentApplication: null as Application | null,
    loading: false,
  }),
  getters: {
    currentApplicationId: (state) => state.currentApplication?.id || '',
    applicationsByWorkspace: (state) => (workspaceId: string) =>
      state.applicationList.filter((application) => application.workspaceId === workspaceId),
    applicationOptions: (state) =>
      state.applicationList.map((application) => ({
        label: application.name,
        value: application.id,
      })),
  },
  actions: {
    async loadApplications(workspaceId?: string) {
      this.loading = true
      try {
        this.applicationList = workspaceId
          ? await applicationRepository.listByWorkspace(workspaceId)
          : await applicationRepository.list()

        const persistedId = readCurrentApplicationId(workspaceId || '')
        const current =
          this.applicationList.find((application) => application.id === persistedId) ||
          this.applicationList[0] ||
          null

        this.currentApplication = current
        if (current) {
          persistCurrentApplicationId(current.workspaceId, current.id)
        }
      } finally {
        this.loading = false
      }
    },
    async switchApplication(id: string) {
      const application =
        this.applicationList.find((item) => item.id === id) ||
        (await applicationRepository.findById(id))
      if (!application) return

      this.currentApplication = application
      persistCurrentApplicationId(application.workspaceId, application.id)
    },
    clearApplication() {
      this.currentApplication = null
      this.applicationList = []
    },
    async createApplication(input: CreateApplicationInput) {
      const application = await applicationRepository.create(input)
      if (!this.applicationList.some((item) => item.id === application.id)) {
        this.applicationList = [...this.applicationList, application]
      }
      await this.switchApplication(application.id)

      return application
    },
    async updateApplication(id: string, patch: Partial<Omit<Application, 'id' | 'createdAt'>>) {
      const application = await applicationRepository.update(id, patch)
      if (!application) return null

      this.applicationList = this.applicationList.map((item) =>
        item.id === id ? application : item,
      )
      if (this.currentApplication?.id === id) {
        this.currentApplication = application
      }

      return application
    },
    async deleteApplication(id: string) {
      this.applicationList = await applicationRepository.delete(id)
      if (this.currentApplication?.id === id) {
        const fallback = this.applicationList[0] || null
        this.currentApplication = fallback
        if (fallback) {
          persistCurrentApplicationId(fallback.workspaceId, fallback.id)
        }
      }
    },
  },
})
