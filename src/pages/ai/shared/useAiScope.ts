import { computed } from 'vue'

import { useApplicationStore, useWorkspaceStore } from '@/store'

export function useAiScope() {
  const workspace = useWorkspaceStore()
  const application = useApplicationStore()

  const currentWorkspace = computed(() => workspace.currentWorkspace)
  const currentApplication = computed(() => application.currentApplication)
  const workspaceId = computed(() => currentWorkspace.value?.id || '')
  const applicationId = computed(() => currentApplication.value?.id || '')
  const scopeReady = computed(() => Boolean(workspaceId.value && applicationId.value))
  const scopeLabel = computed(() => {
    const workspaceName = currentWorkspace.value?.name || 'No workspace'
    const applicationName = currentApplication.value?.name || 'No application'

    return `${workspaceName} / ${applicationName}`
  })

  async function ensureAiScope() {
    if (!workspace.workspaceList.length) {
      await workspace.loadWorkspaces()
    }

    if (workspace.currentWorkspace && !application.applicationList.length) {
      await application.loadApplications(workspace.currentWorkspace.id)
    }

    return {
      workspace: workspace.currentWorkspace,
      application: application.currentApplication,
    }
  }

  return {
    workspace,
    application,
    currentWorkspace,
    currentApplication,
    workspaceId,
    applicationId,
    scopeReady,
    scopeLabel,
    ensureAiScope,
  }
}
