import type { EventBus } from '@/ai/events/EventBus'
import type { ChatMessage, ChatMessageStatus, ChatRequest, Provider, TokenUsage } from '@/ai/types'

type RuntimeListener = (messages: ChatMessage[], status: ChatMessageStatus) => void

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function now() {
  return Date.now()
}

function cloneMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({ ...message }))
}

function estimateTokenUsage(promptMessages: ChatMessage[], completionText: string): TokenUsage {
  const completionTokens = Math.ceil(completionText.length / 4)

  return {
    promptTokens: 100,
    completionTokens,
    totalTokens: 100 + completionTokens,
  }
}

export class ChatRuntime {
  private controller: AbortController | null = null
  private messages: ChatMessage[] = []
  private status: ChatMessageStatus = 'idle'
  private lastRequest: ChatRequest | null = null
  private listeners = new Set<RuntimeListener>()

  constructor(
    private provider: Provider,
    private eventBus: EventBus,
  ) {}

  getMessages() {
    return cloneMessages(this.messages)
  }

  getStatus() {
    return this.status
  }

  subscribe(listener: RuntimeListener) {
    this.listeners.add(listener)
    listener(this.getMessages(), this.status)

    return () => {
      this.listeners.delete(listener)
    }
  }

  async sendMessage(request: ChatRequest) {
    if (this.isBusy()) return

    const normalizedRequest = this.normalizeRequest(request)
    const userMessage = normalizedRequest.messages.at(-1)
    if (!userMessage) return

    const assistantMessage = this.createAssistantMessage()
    this.messages = [...normalizedRequest.messages, assistantMessage]
    this.lastRequest = normalizedRequest
    this.setStatus('loading')

    this.controller = new AbortController()
    let fullText = ''

    try {
      await this.provider.streamChatCompletion(
        normalizedRequest,
        {
          onStart: () => {
            this.eventBus.emit('chat:start', {
              conversationId: normalizedRequest.conversationId,
            })
          },
          onChunk: (chunk) => {
            if (chunk.done) return

            fullText += chunk.delta
            this.updateAssistantMessage(assistantMessage.id, {
              content: fullText,
              status: 'streaming',
            })
            this.setStatus('streaming')
            this.eventBus.emit('chat:chunk', {
              messageId: assistantMessage.id,
              chunk: chunk.delta,
            })
          },
          onFinish: (text) => {
            fullText = text
          },
        },
        this.controller.signal,
      )

      this.updateAssistantMessage(assistantMessage.id, {
        content: fullText,
        status: 'done',
        tokenUsage: estimateTokenUsage(normalizedRequest.messages, fullText),
      })
      this.setStatus('done')
      this.eventBus.emit('chat:finish', {
        messageId: assistantMessage.id,
        fullText,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.updateAssistantMessage(assistantMessage.id, {
          status: 'cancelled',
        })
        this.setStatus('cancelled')
        this.eventBus.emit('chat:abort', {
          messageId: assistantMessage.id,
        })
        return
      }

      const message = error instanceof Error ? error.message : String(error)
      this.updateAssistantMessage(assistantMessage.id, {
        status: 'error',
        metadata: {
          error: message,
        },
      })
      this.setStatus('error')
      this.eventBus.emit('chat:error', {
        messageId: assistantMessage.id,
        error: message,
      })
    } finally {
      this.controller = null
    }
  }

  stop() {
    this.controller?.abort()
  }

  retry(lastRequest = this.lastRequest) {
    if (!lastRequest || this.isBusy()) return

    this.messages = lastRequest.messages
    this.notify()
    this.sendMessage(lastRequest)
  }

  clear() {
    this.controller?.abort()
    this.controller = null
    this.messages = []
    this.lastRequest = null
    this.setStatus('idle')
  }

  private normalizeRequest(request: ChatRequest): ChatRequest {
    const conversationId = request.conversationId || createId('conversation')
    const messages = request.messages.map((message) => ({
      ...message,
      id: message.id || createId(message.role),
      status: message.status || 'done',
      createdAt: message.createdAt || now(),
      updatedAt: now(),
    }))

    return {
      ...request,
      conversationId,
      messages,
      model: request.model || this.provider.models[0],
      stream: request.stream ?? true,
    }
  }

  private createAssistantMessage(): ChatMessage {
    const timestamp = now()

    return {
      id: createId('assistant'),
      role: 'assistant',
      content: '',
      status: 'loading',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }

  private updateAssistantMessage(messageId: string, patch: Partial<ChatMessage>) {
    this.messages = this.messages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            ...patch,
            metadata: patch.metadata
              ? { ...message.metadata, ...patch.metadata }
              : message.metadata,
            updatedAt: now(),
          }
        : message,
    )
    this.notify()
  }

  private setStatus(status: ChatMessageStatus) {
    this.status = status
    this.notify()
  }

  private notify() {
    const messages = this.getMessages()

    for (const listener of this.listeners) {
      listener(messages, this.status)
    }
  }

  private isBusy() {
    return this.status === 'loading' || this.status === 'streaming'
  }
}
