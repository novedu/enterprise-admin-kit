import type { ChatRequest, IProvider, ProviderStreamCallbacks } from '@/ai/types'

const replies = [
  `I can help you reason about this admin starter.\n\n\`\`\`ts\nconst layers = ['Route', 'Button', 'Field', 'Schema']\n\`\`\`\n\nThe key is keeping permission checks close to the UI surface while still deriving them from one backend contract.`,
  `A good TablePage abstraction owns pagination, loading, search and mutations.\n\nPages should provide schema and business API only. That keeps CRUD pages boring in the best possible way.`,
  `For SSE, model the assistant answer as a stream of chunks. The UI should support stop, retry and partial rendering because real model responses are never atomic.`,
]

function createAbortError() {
  return new DOMException('Aborted', 'AbortError')
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = globalThis.setTimeout(resolve, ms)

    signal.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timer)
        reject(createAbortError())
      },
      { once: true },
    )
  })
}

function createTokenChunks(text: string, maxTokens = 80) {
  const chunks = text.match(/.{1,8}/g) || []

  return chunks.slice(0, maxTokens)
}

export class MockProvider implements IProvider {
  name = 'mock'
  models = ['mock-chat-runtime']

  async streamChat(
    request: ChatRequest,
    callbacks: ProviderStreamCallbacks,
    signal = new AbortController().signal,
  ) {
    const prompt = request.messages.at(-1)?.content || ''
    const messageId = request.messages.at(-1)?.id || request.conversationId
    const seed = prompt.length % replies.length
    const answer = replies[seed]
    const chunks = createTokenChunks(answer, request.maxTokens)
    let fullText = ''

    callbacks.onStart?.()

    try {
      for (const [index, chunk] of chunks.entries()) {
        if (signal.aborted) {
          throw createAbortError()
        }

        await wait(55, signal)
        fullText += chunk
        callbacks.onChunk?.({
          id: `${messageId}-${index}`,
          messageId,
          delta: chunk,
          done: false,
          index,
        })
      }

      callbacks.onChunk?.({
        id: `${messageId}-done`,
        messageId,
        delta: '',
        done: true,
        index: chunks.length,
      })
      callbacks.onFinish?.(fullText)
    } catch (error) {
      callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }
}
