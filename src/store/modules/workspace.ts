import { defineStore } from 'pinia'

import { workspaceRepository } from '@/domain/workspace/WorkspaceRepository'
import type { CreateWorkspaceInput, Workspace } from '@/domain/workspace/Workspace'

const CURRENT_WORKSPACE_KEY = 'enterprise-ai-platform:current-workspace'

function readCurrentWorkspaceId() {
  if (typeof window === 'undefined') return ''

  return window.localStorage.getItem(CURRENT_WORKSPACE_KEY) || ''
}

function persistCurrentWorkspaceId(id: string) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(CURRENT_WORKSPACE_KEY, id)
}

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    workspaceList: [] as Workspace[],
    currentWorkspace: null as Workspace | null,
    loading: false,
  }),
  getters: {
    applications: (state) => state.currentWorkspace?.applications || [],
    currentWorkspaceId: (state) => state.currentWorkspace?.id || '',
    workspaceOptions: (state) =>
      state.workspaceList.map((workspace) => ({
        label: workspace.name,
        value: workspace.id,
      })),
  },
  actions: {
    async loadWorkspaces() {
      this.loading = true
      try {
        this.workspaceList = await workspaceRepository.list()
        const persistedId = readCurrentWorkspaceId()
        const current =
          this.workspaceList.find((workspace) => workspace.id === persistedId) ||
          this.workspaceList[0] ||
          null

        this.currentWorkspace = current
        if (current) this.persistWorkspace(current.id)
      } finally {
        this.loading = false
      }
    },
    async switchWorkspace(id: string) {
      const workspace =
        this.workspaceList.find((item) => item.id === id) ||
        (await workspaceRepository.findById(id))
      if (!workspace) return

      this.currentWorkspace = workspace
      this.persistWorkspace(workspace.id)
    },
    async createWorkspace(input: CreateWorkspaceInput) {
      const workspace = await workspaceRepository.create(input)
      this.workspaceList = [...this.workspaceList, workspace]
      await this.switchWorkspace(workspace.id)

      return workspace
    },
    async deleteWorkspace(id: string) {
      this.workspaceList = await workspaceRepository.delete(id)
      if (this.currentWorkspace?.id === id) {
        const fallback = this.workspaceList[0] || null
        this.currentWorkspace = fallback
        this.persistWorkspace(fallback?.id || '')
      }
    },
    async renameWorkspace(id: string, name: string) {
      const workspace = await workspaceRepository.rename(id, name)
      if (!workspace) return

      this.workspaceList = this.workspaceList.map((item) => (item.id === id ? workspace : item))
      if (this.currentWorkspace?.id === id) {
        this.currentWorkspace = workspace
      }
    },
    persistWorkspace(id?: string) {
      persistCurrentWorkspaceId(id ?? this.currentWorkspace?.id ?? '')
    },
  },
})
