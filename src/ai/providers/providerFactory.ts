import type { AIConfig, IProvider } from '@/ai/types'

import { MockProvider } from './MockProvider'
import { StubProvider } from './StubProvider'

export function createProvider(config: Pick<AIConfig, 'provider'>): IProvider {
  switch (config.provider) {
    case 'mock':
      return new MockProvider()
    case 'openai':
      return new StubProvider('openai')
    case 'claude':
      return new StubProvider('claude')
    case 'qwen':
      return new StubProvider('qwen')
    case 'deepseek':
      return new StubProvider('deepseek')
    default:
      return new MockProvider()
  }
}
