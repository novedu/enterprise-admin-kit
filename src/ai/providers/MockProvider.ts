import type { ChatRequest, Provider, StreamChunk } from '@/ai/types'

const replies = [
  `I can help you reason about this admin starter.\n\n\`\`\`ts\nconst layers = ['Route', 'Button', 'Field', 'Schema']\n\`\`\`\n\nThe key is keeping permission checks close to the UI surface while still deriving them from one backend contract.`,
  `A good TablePage abstraction owns pagination, loading, search and mutations.\n\nPages should provide schema and business API only. That keeps CRUD pages boring in the best possible way.`,
  `For SSE, model the assistant answer as a stream of chunks. The UI should support stop, retry and partial rendering because real model responses are never atomic.`,
]

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms)

    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export class MockProvider implements Provider {
  name = 'Mock'
  models = ['mock-chat-runtime']

  async streamChatCompletion(
    request: ChatRequest,
    callbacks: {
      onStart?: () => void
      onChunk?: (chunk: StreamChunk) => void
      onFinish?: (fullText: string) => void
      onError?: (error: Error) => void
    },
    signal = new AbortController().signal,
  ) {
    const prompt = request.messages.at(-1)?.content || ''
    const messageId = request.messages.at(-1)?.id || request.conversationId
    const seed = prompt.length % replies.length
    const answer = replies[seed]
    const chunks = answer.match(/.{1,10}/g) || []
    let fullText = ''

    callbacks.onStart?.()

    try {
      for (const [index, chunk] of chunks.entries()) {
        if (signal.aborted) {
          throw new DOMException('Aborted', 'AbortError')
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
