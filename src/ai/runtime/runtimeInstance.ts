import { runtimeEventBus } from '@/ai/events/runtimeBus'
import { MockProvider } from '@/ai/providers/MockProvider'
import { useAiConfigStore } from '@/store'

import { ChatRuntime } from './ChatRuntime'

const runtime = new ChatRuntime(new MockProvider(), runtimeEventBus, () => {
  const store = useAiConfigStore()

  return store.currentConfig
})

export function getChatRuntime() {
  return runtime
}
