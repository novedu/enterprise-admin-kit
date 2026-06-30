import { describe, expect, it } from 'vitest'

import { EventBus } from '@/ai/events/EventBus'
import { ContextManager } from '@/ai/context/ContextManager'
import { KnowledgeBase } from '@/ai/knowledge'
import { PromptEngine } from '@/ai/prompt'
import type { ChatMessage, ChatRequest, IProvider, ProviderStreamCallbacks } from '@/ai/types'

import { ChatRuntime } from './ChatRuntime'

function message(content: string): ChatMessage {
  return {
    id: 'user-1',
    role: 'user',
    content,
    status: 'done',
    createdAt: 1,
  }
}

class CaptureProvider implements IProvider {
  name = 'capture'
  models = ['capture-model']
  capabilities = {
    streaming: true,
    maxTokens: 4096,
    contextLimit: 8192,
    costTier: 'mock' as const,
  }
  receivedPrompt = ''

  async streamChat() {
    throw new Error('streamChat should not be called when streamPrompt exists.')
  }

  async streamPrompt(prompt: string, _request: ChatRequest, callbacks: ProviderStreamCallbacks) {
    this.receivedPrompt = prompt
    callbacks.onStart?.()
    callbacks.onChunk?.({
      id: 'chunk-1',
      messageId: 'assistant-1',
      delta: 'done',
      done: false,
      index: 0,
    })
    callbacks.onFinish?.('done')
  }
}

describe('ChatRuntime pipeline', () => {
  it('runs context, knowledge, prompt and provider as one execution flow', async () => {
    const provider = new CaptureProvider()
    const eventBus = new EventBus()
    const knowledgeBase = new KnowledgeBase({
      id: 'kb-1',
      name: 'Runtime KB',
      chunkSize: 120,
    })
    knowledgeBase.uploadDocument({
      title: 'Runtime Notes',
      content: 'Runtime pipeline uses knowledge retrieval and prompt construction.',
    })
    const promptEngine = new PromptEngine()
    const pipelineSteps: string[] = []

    eventBus.on('chat:pipeline', ({ step }) => {
      pipelineSteps.push(step)
    })

    const runtime = new ChatRuntime(
      provider,
      eventBus,
      () => ({
        provider: 'mock',
        version: 'v1',
        model: 'capture-model',
        providerCredentials: {},
        temperature: 0.7,
        topP: 1,
        maxTokens: 256,
        stream: true,
        enableKnowledge: true,
        enableCache: false,
        contextWindow: 2048,
        compressionStrategy: 'none',
        systemPrompt: 'Use available knowledge.',
        knowledgeTopK: 3,
        requestTimeoutMs: 30_000,
        maxRetries: 1,
      }),
      new ContextManager(),
      promptEngine,
      knowledgeBase,
    )

    await runtime.execute({
      conversationId: 'conversation-1',
      messages: [message('How does runtime knowledge retrieval work?')],
      model: 'capture-model',
      enableKnowledge: true,
    })

    expect(pipelineSteps).toEqual([
      'context:before',
      'context:after',
      'knowledge:after',
      'prompt:after',
      'provider:before',
    ])
    expect(provider.receivedPrompt).toContain('Use available knowledge.')
    expect(provider.receivedPrompt).toContain('Runtime pipeline uses knowledge retrieval')
    expect(runtime.getSnapshot().messages.at(-1)?.citations?.[0]?.source).toContain('Runtime Notes')
  })
})
