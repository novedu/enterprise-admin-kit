import type { EventBus } from '@/ai/events/EventBus'
import { DEFAULT_AI_CONFIG } from '@/ai/config/defaultConfig'
import type {
  AIConfigReader,
  ChatMessage,
  ChatMessageStatus,
  ChatRequest,
  IProvider,
  TokenUsage,
} from '@/ai/types'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function now() {
  return Date.now()
}

function cloneMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({ ...message }))
}

function getVisibleMessages(messages: ChatMessage[]) {
  return cloneMessages(messages.filter((message) => message.role !== 'system'))
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

  constructor(
    private provider: IProvider,
    private eventBus: EventBus,
    private readConfig: AIConfigReader = () => DEFAULT_AI_CONFIG,
  ) {}

  getMessages() {
    return cloneMessages(this.messages)
  }

  getStatus() {
    return this.status
  }

  getDefaultModel() {
    return this.resolveModel(this.readConfig().model)
  }

  setProvider(provider: IProvider) {
    this.provider = provider
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

    this.eventBus.emit('chat:start', {
      conversationId: normalizedRequest.conversationId,
      message: assistantMessage,
      messages: getVisibleMessages(this.messages),
      status: 'loading',
    })

    try {
      await this.provider.streamChat(
        normalizedRequest,
        {
          onStart: () => undefined,
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
              fullText,
              status: 'streaming',
            })
          },
          onFinish: (text) => {
            fullText = text
          },
        },
        this.controller.signal,
      )

      const tokenUsage = estimateTokenUsage(normalizedRequest.messages, fullText)

      this.updateAssistantMessage(assistantMessage.id, {
        content: fullText,
        status: 'done',
        tokenUsage,
      })
      this.setStatus('done')
      this.eventBus.emit('chat:finish', {
        messageId: assistantMessage.id,
        fullText,
        tokenUsage,
        status: 'done',
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.updateAssistantMessage(assistantMessage.id, {
          status: 'cancelled',
        })
        this.setStatus('cancelled')
        this.eventBus.emit('chat:abort', {
          messageId: assistantMessage.id,
          status: 'cancelled',
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
        status: 'error',
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
    const config = this.readConfig()
    const conversationId = request.conversationId || createId('conversation')
    const requestMessages = this.applySystemPrompt(request.messages, config.systemPrompt)
    const messages = requestMessages.map((message) => ({
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
      provider: request.provider ?? config.provider,
      model: this.resolveModel(request.model || config.model),
      temperature: request.temperature ?? config.temperature,
      topP: request.topP ?? config.topP,
      maxTokens: request.maxTokens ?? config.maxTokens,
      stream: request.stream ?? config.stream,
      enableKnowledge: request.enableKnowledge ?? config.enableKnowledge,
      enableCache: request.enableCache ?? config.enableCache,
      contextWindow: request.contextWindow ?? config.contextWindow,
      compressionStrategy: request.compressionStrategy ?? config.compressionStrategy,
    }
  }

  private applySystemPrompt(messages: ChatMessage[], systemPrompt: string) {
    if (!systemPrompt.trim()) return messages

    const timestamp = now()
    const systemMessage: ChatMessage = {
      id: 'system-runtime-prompt',
      role: 'system',
      content: systemPrompt,
      status: 'done',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const existingSystemIndex = messages.findIndex((message) => message.role === 'system')
    if (existingSystemIndex === -1) {
      return [systemMessage, ...messages]
    }

    return messages.map((message, index) =>
      index === existingSystemIndex
        ? {
            ...message,
            content: systemPrompt,
            updatedAt: timestamp,
          }
        : message,
    )
  }

  private resolveModel(model?: string) {
    if (model && this.provider.models.includes(model)) return model

    return this.provider.models[0] || model || 'unknown-model'
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
  }

  private setStatus(status: ChatMessageStatus) {
    this.status = status
  }

  private isBusy() {
    return this.status === 'loading' || this.status === 'streaming'
  }
}
