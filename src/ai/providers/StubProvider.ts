import type {
  AIProviderName,
  ChatRequest,
  IProvider,
  ProviderCapabilities,
  ProviderStreamCallbacks,
} from '@/ai/types'

import { createProviderError, normalizeProviderError } from './errors'

const providerModels: Record<Exclude<AIProviderName, 'mock'>, string[]> = {
  openai: ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'],
  claude: ['claude-3-5-sonnet', 'claude-3-5-haiku'],
  qwen: ['qwen-max', 'qwen-plus'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

const providerCapabilities: Record<Exclude<AIProviderName, 'mock'>, ProviderCapabilities> = {
  openai: {
    streaming: true,
    maxTokens: 4096,
    contextLimit: 128_000,
    costTier: 'high',
  },
  claude: {
    streaming: true,
    maxTokens: 4096,
    contextLimit: 200_000,
    costTier: 'high',
  },
  qwen: {
    streaming: true,
    maxTokens: 4096,
    contextLimit: 32_000,
    costTier: 'medium',
  },
  deepseek: {
    streaming: true,
    maxTokens: 4096,
    contextLimit: 64_000,
    costTier: 'medium',
  },
}

export class StubProvider implements IProvider {
  models: string[]
  capabilities: ProviderCapabilities

  constructor(public name: Exclude<AIProviderName, 'mock'>) {
    this.models = providerModels[name]
    this.capabilities = providerCapabilities[name]
  }

  async streamChat(
    _request: ChatRequest,
    callbacks: ProviderStreamCallbacks,
    signal = new AbortController().signal,
  ) {
    return this.streamPrompt('', _request, callbacks, signal)
  }

  async streamPrompt(
    _prompt: string,
    _request: ChatRequest,
    callbacks: ProviderStreamCallbacks,
    signal = new AbortController().signal,
  ) {
    callbacks.onStart?.()

    if (signal.aborted) {
      const error = normalizeProviderError(new DOMException('Aborted', 'AbortError'), this.name)
      callbacks.onError?.(error)
      throw error
    }

    const error = createProviderError(
      `${this.name} provider is registered but not implemented yet.`,
      'PROVIDER_UNSUPPORTED',
      this.name,
    )
    callbacks.onError?.(error)
    throw error
  }
}
