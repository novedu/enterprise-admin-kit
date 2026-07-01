import { applicationMockList } from './application.mock'
import type { Application, CreateApplicationInput } from './Application'

const STORAGE_KEY = 'enterprise-ai-platform:applications'

function cloneApplication(application: Application): Application {
  return { ...application }
}

function readApplications(): Application[] {
  if (typeof window === 'undefined') return applicationMockList.map(cloneApplication)

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return applicationMockList.map(cloneApplication)

    return (JSON.parse(raw) as Application[]).map(cloneApplication)
  } catch {
    return applicationMockList.map(cloneApplication)
  }
}

function writeApplications(applications: Application[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createApplication(input: CreateApplicationInput): Application {
  const timestamp = Date.now()
  const id = createId('app')
  const name = input.name.trim() || 'Untitled Application'
  const type = input.type

  return {
    id,
    workspaceId: input.workspaceId,
    name,
    description: input.description?.trim() || '',
    type,
    icon: input.icon || 'Operation',
    runtimeConfigId: input.runtimeConfigId || `runtime-${id}`,
    providerId: input.providerId || 'provider-mock',
    knowledgeBaseId: input.knowledgeBaseId || '',
    promptTemplateId: input.promptTemplateId || `prompt-${type}`,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export class ApplicationRepository {
  async list() {
    return readApplications()
  }

  async listByWorkspace(workspaceId: string) {
    return readApplications().filter((application) => application.workspaceId === workspaceId)
  }

  async findById(id: string) {
    return readApplications().find((application) => application.id === id) || null
  }

  async persist(applications: Application[]) {
    writeApplications(applications)
  }

  async create(input: CreateApplicationInput) {
    const applications = readApplications()
    const application = createApplication(input)
    const nextApplications = [...applications, application]
    writeApplications(nextApplications)

    return cloneApplication(application)
  }

  async update(id: string, patch: Partial<Omit<Application, 'id' | 'createdAt'>>) {
    const applications = readApplications()
    let updated: Application | null = null
    const nextApplications = applications.map((application) => {
      if (application.id !== id) return application

      updated = {
        ...application,
        ...patch,
        id: application.id,
        createdAt: application.createdAt,
        updatedAt: Date.now(),
      }

      return updated
    })

    writeApplications(nextApplications)

    return updated ? cloneApplication(updated) : null
  }

  async delete(id: string) {
    const nextApplications = readApplications().filter((application) => application.id !== id)
    writeApplications(nextApplications)

    return nextApplications.map(cloneApplication)
  }
}

export const applicationRepository = new ApplicationRepository()
