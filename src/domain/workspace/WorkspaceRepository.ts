import { createWorkspace, renameWorkspace } from './WorkspaceFactory'
import { workspaceMockList } from './workspace.mock'
import type { CreateWorkspaceInput, Workspace } from './types'

const STORAGE_KEY = 'enterprise-ai-platform:workspaces'

function cloneWorkspace(workspace: Workspace): Workspace {
  return {
    ...workspace,
    settings: { ...workspace.settings },
    applications: [...workspace.applications],
    knowledgeRefs: [...workspace.knowledgeRefs],
    promptRefs: [...workspace.promptRefs],
    providerRefs: [...workspace.providerRefs],
    conversationRefs: [...workspace.conversationRefs],
  }
}

function readWorkspaces(): Workspace[] {
  if (typeof window === 'undefined') return workspaceMockList.map(cloneWorkspace)

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return workspaceMockList.map(cloneWorkspace)

    return (JSON.parse(raw) as Workspace[]).map(cloneWorkspace)
  } catch {
    return workspaceMockList.map(cloneWorkspace)
  }
}

function writeWorkspaces(workspaces: Workspace[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces))
}

export class WorkspaceRepository {
  async list() {
    return readWorkspaces()
  }

  async findById(id: string) {
    return readWorkspaces().find((workspace) => workspace.id === id) || null
  }

  async create(input: CreateWorkspaceInput) {
    const workspaces = readWorkspaces()
    const workspace = createWorkspace(input)
    const nextWorkspaces = [...workspaces, workspace]

    writeWorkspaces(nextWorkspaces)

    return cloneWorkspace(workspace)
  }

  async delete(id: string) {
    const nextWorkspaces = readWorkspaces().filter((workspace) => workspace.id !== id)
    writeWorkspaces(nextWorkspaces)

    return nextWorkspaces
  }

  async rename(id: string, name: string) {
    const workspaces = readWorkspaces()
    const nextWorkspaces = workspaces.map((workspace) =>
      workspace.id === id ? renameWorkspace(workspace, name) : workspace,
    )
    writeWorkspaces(nextWorkspaces)

    return nextWorkspaces.find((workspace) => workspace.id === id) || null
  }

  async persist(workspaces: Workspace[]) {
    writeWorkspaces(workspaces)
  }
}

export const workspaceRepository = new WorkspaceRepository()
