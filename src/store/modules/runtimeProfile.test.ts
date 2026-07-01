import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAiConfigStore } from './aiConfig'
import { useRuntimeProfileStore } from './runtimeProfile'

describe('runtimeProfile store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('resolves application runtime config from global defaults plus application profile patch', () => {
    const aiConfig = useAiConfigStore()
    const runtimeProfile = useRuntimeProfileStore()

    aiConfig.updateConfig({
      temperature: 0.3,
      contextWindow: 4096,
    })
    runtimeProfile.updateProfile('app-1', {
      temperature: 0.9,
      enableKnowledge: true,
    })

    expect(runtimeProfile.getResolvedConfig('app-1')).toMatchObject({
      temperature: 0.9,
      contextWindow: 4096,
      enableKnowledge: true,
    })
    expect(runtimeProfile.getResolvedConfig('app-2')).toMatchObject({
      temperature: 0.3,
      contextWindow: 4096,
      enableKnowledge: false,
    })

    runtimeProfile.resetProfile('app-1')
    expect(runtimeProfile.getResolvedConfig('app-1')).toMatchObject({
      temperature: 0.3,
      contextWindow: 4096,
      enableKnowledge: false,
    })
  })
})
