import type { AIProviderName, ChatRequest, IProvider, ProviderStreamCallbacks } from '@/ai/types'

const providerModels: Record<Exclude<AIProviderName, 'mock'>, string[]> = {
  openai: ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
  qwen: ['qwen-max', 'qwen-plus'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

function createUnsupportedProviderError(provider: AIProviderName) {
  return new Error(`${provider} provider is registered but not implemented yet.`)
}

export class StubProvider implements IProvider {
  models: string[]

  constructor(public name: Exclude<AIProviderName, 'mock'>) {
    this.models = providerModels[name]
  }

  async streamChat(
    _request: ChatRequest,
    callbacks: ProviderStreamCallbacks,
    signal = new AbortController().signal,
  ) {
    callbacks.onStart?.()

    if (signal.aborted) {
      const error = new DOMException('Aborted', 'AbortError')
      callbacks.onError?.(error)
      throw error
    }

    const error = createUnsupportedProviderError(this.name)
    callbacks.onError?.(error)
    throw error
  }
}
