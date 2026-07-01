import { afterEach, describe, expect, it } from 'vitest'

import { DEFAULT_AI_CONFIG } from '@/ai/config/defaultConfig'

import {
  clearRuntimeBindings,
  getApplicationRuntimeBinding,
  listRuntimeBindings,
} from './applicationRuntime'

describe('application runtime binding', () => {
  afterEach(() => {
    clearRuntimeBindings()
  })

  it('creates one ChatRuntime per workspace/application scope', () => {
    const readConfig = () => DEFAULT_AI_CONFIG
    const first = getApplicationRuntimeBinding(
      {
        workspaceId: 'workspace-1',
        workspaceName: 'Workspace One',
        applicationId: 'application-1',
        applicationName: 'ERP Copilot',
      },
      readConfig,
    )
    const again = getApplicationRuntimeBinding(
      {
        workspaceId: 'workspace-1',
        workspaceName: 'Workspace One',
        applicationId: 'application-1',
        applicationName: 'ERP Copilot',
      },
      readConfig,
    )
    const second = getApplicationRuntimeBinding(
      {
        workspaceId: 'workspace-1',
        workspaceName: 'Workspace One',
        applicationId: 'application-2',
        applicationName: 'HR Assistant',
      },
      readConfig,
    )

    expect(first.runtime).toBe(again.runtime)
    expect(first.runtime).not.toBe(second.runtime)
    expect(listRuntimeBindings()).toHaveLength(2)
    expect(first.runtime.getSnapshot().scope).toMatchObject({
      runtimeId: first.runtimeId,
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
    })
  })
})
