import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { createProvider } from '@/ai/providers/providerFactory'
import { useAiConfigStore } from '@/store'

import { ChatRuntime } from './ChatRuntime'

let runtime: ChatRuntime | null = null
let activeProvider = 'mock'
let eventsBound = false

function readCurrentConfig() {
  const store = useAiConfigStore()

  return store.currentConfig
}

function syncProvider() {
  if (!runtime) return

  const config = readCurrentConfig()
  if (config.provider === activeProvider) return

  runtime.setProvider(createProvider(config))
  activeProvider = config.provider
}

function bindRuntimeEvents() {
  if (eventsBound) return

  runtimeEventBus.on('config:update', ({ key }) => {
    if (key !== 'provider') return

    syncProvider()
  })
  eventsBound = true
}

export function getChatRuntime() {
  if (!runtime) {
    const config = readCurrentConfig()
    runtime = new ChatRuntime(createProvider(config), runtimeEventBus, readCurrentConfig)
    activeProvider = config.provider
    bindRuntimeEvents()
  }

  syncProvider()

  return runtime
}
