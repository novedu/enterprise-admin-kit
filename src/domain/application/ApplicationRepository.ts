import { applicationMockList } from './application.mock'
import type { Application } from './Application'

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
}

export const applicationRepository = new ApplicationRepository()
