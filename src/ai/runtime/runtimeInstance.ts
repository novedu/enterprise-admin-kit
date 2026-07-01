import { useAiConfigStore } from '@/store'

import { getDefaultRuntimeBinding } from './applicationRuntime'

function readCurrentConfig() {
  const store = useAiConfigStore()

  return store.currentConfig
}

export function getChatRuntime() {
  return getDefaultRuntimeBinding(readCurrentConfig).runtime
}
