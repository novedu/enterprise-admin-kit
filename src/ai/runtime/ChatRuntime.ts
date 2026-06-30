import type { EventBus } from '@/ai/events/EventBus'
import { DEFAULT_AI_CONFIG } from '@/ai/config/defaultConfig'
import { ContextManager } from '@/ai/context/ContextManager'
import { estimateCompletionTokenUsage } from '@/ai/context/tokenEstimator'
import { KnowledgeBase } from '@/ai/knowledge'
import { PromptEngine } from '@/ai/prompt'
import type {
  AIConfigReader,
  ChatMessage,
  ChatMessageStatus,
  ChatRequest,
  ChatRuntimeState,
  ChatSnapshot,
  ChatSession,
  Citation,
  IProvider,
  PipelineStepName,
} from '@/ai/types'

import { RuntimeGuard } from './RuntimeGuard'

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function now() {
  return Date.now()
}

function cloneMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    tokenUsage: message.tokenUsage ? { ...message.tokenUsage } : undefined,
    citations: message.citations?.map((citation) => ({ ...citation })),
    metadata: message.metadata ? { ...message.metadata } : undefined,
  }
}

function cloneMessages(messages: ChatMessage[]) {
  return messages.map(cloneMessage)
}

function cloneSessions(sessions: ChatSession[]) {
  return sessions.map((session) => ({ ...session }))
}

function getVisibleMessages(messages: ChatMessage[]) {
  return cloneMessages(messages.filter((message) => message.role !== 'system'))
}

function createSession(id = createId('conversation')): ChatSession {
  const timestamp = now()

  return {
    id,
    title: 'New conversation',
    createdAt: timestamp,
    updatedAt: timestamp,
    active: true,
  }
}

function createInitialState(): ChatRuntimeState {
  const session = createSession()

  return {
    messages: [],
    sessions: [session],
    status: 'idle',
    activeSessionId: session.id,
  }
}

export class ChatRuntime {
  private controller: AbortController | null = null
  private state: ChatRuntimeState = createInitialState()
  private lastRequest: ChatRequest | null = null
  private activeRequestId: string | null = null
  private retryCount = 0
  private guard: RuntimeGuard

  constructor(
    private provider: IProvider,
    private eventBus: EventBus,
    private readConfig: AIConfigReader = () => DEFAULT_AI_CONFIG,
    private contextManager = new ContextManager(),
    private promptEngine = new PromptEngine(),
    private knowledgeBase = createDefaultKnowledgeBase(),
  ) {
    this.guard = new RuntimeGuard(provider, this.resolveGuardLimits())
  }

  getMessages() {
    return cloneMessages(this.state.messages)
  }

  getStatus() {
    return this.state.status
  }

  getSnapshot(): ChatSnapshot {
    return {
      messages: getVisibleMessages(this.state.messages),
      sessions: cloneSessions(this.state.sessions),
      status: this.state.status,
      activeSessionId: this.state.activeSessionId,
      streaming: this.isBusy(),
      timestamp: now(),
    }
  }

  getDefaultModel() {
    return this.resolveModel(this.readConfig().model)
  }

  setProvider(provider: IProvider) {
    this.provider = provider
    this.guard.update(provider, this.resolveGuardLimits())
  }

  refreshGuards() {
    this.guard.update(this.provider, this.resolveGuardLimits())
  }

  async sendMessage(request: ChatRequest) {
    return this.execute(request)
  }

  async execute(request: ChatRequest) {
    if (this.isBusy()) return

    const normalizedRequest = this.normalizeRequest(request)
    const userMessage = normalizedRequest.messages.at(-1)
    if (!userMessage) return

    const assistantMessage = this.createAssistantMessage()
    this.state.messages = [...normalizedRequest.messages, assistantMessage]
    this.ensureActiveSession(normalizedRequest.conversationId)
    this.lastRequest = normalizedRequest
    this.setStatus('loading')
    this.emitSnapshot()

    const requestId = createId('request')
    const traceId = requestId
    this.activeRequestId = requestId
    this.controller = new AbortController()
    const timeout = this.guard.createTimeoutSignal(this.controller.signal)
    let fullText = ''

    this.eventBus.emit('chat:start', {
      traceId,
      conversationId: normalizedRequest.conversationId,
      message: assistantMessage,
      messages: getVisibleMessages(this.state.messages),
      status: 'loading',
    })

    try {
      this.emitPipelineStep(traceId, 'context:before', {
        messageCount: normalizedRequest.messages.length,
        contextWindow: normalizedRequest.contextWindow,
        compressionStrategy: normalizedRequest.compressionStrategy,
      })

      const contextResult = this.contextManager.buildResult(normalizedRequest.messages, {
        contextWindow: normalizedRequest.contextWindow ?? this.readConfig().contextWindow,
        compressionStrategy:
          normalizedRequest.compressionStrategy ?? this.readConfig().compressionStrategy,
      })
      const contextMessages = contextResult.messages
      this.guard.assertPipelineReady(normalizedRequest, contextResult.tokenUsage.totalTokens)

      this.emitPipelineStep(traceId, 'context:after', {
        originalMessageCount: contextResult.originalMessageCount,
        finalMessageCount: contextResult.finalMessageCount,
        compressed: contextResult.compressed,
        strategy: contextResult.strategy,
        totalTokens: contextResult.tokenUsage.totalTokens,
      })

      const knowledgeBase = normalizedRequest.knowledgeBase ?? this.knowledgeBase
      const retrievalResult = normalizedRequest.enableKnowledge
        ? knowledgeBase.query(userMessage.content, {
            topK: normalizedRequest.knowledgeTopK,
          })
        : {
            chunks: [],
            citations: [],
          }

      this.emitPipelineStep(traceId, 'knowledge:after', {
        enabled: Boolean(normalizedRequest.enableKnowledge),
        chunkCount: retrievalResult.chunks.length,
        citationCount: retrievalResult.citations.length,
        topScore: retrievalResult.chunks[0]?.score ?? 0,
      })

      const promptEngine = normalizedRequest.promptEngine ?? this.promptEngine
      const finalPrompt = promptEngine.buildFromContext(
        normalizedRequest.promptTemplateId ??
          (retrievalResult.chunks.length ? 'default-rag' : 'default-chat'),
        {
          systemPrompt: this.readConfig().systemPrompt,
          userPrompt: userMessage.content,
          variables: {
            context: this.formatContext(contextMessages),
            input: userMessage.content,
          },
          retrievedDocuments: retrievalResult.chunks,
          citations: retrievalResult.citations,
        },
      )

      this.emitPipelineStep(traceId, 'prompt:after', {
        templateId:
          normalizedRequest.promptTemplateId ??
          (retrievalResult.chunks.length ? 'default-rag' : 'default-chat'),
        promptLength: finalPrompt.length,
        hasKnowledge: retrievalResult.chunks.length > 0,
      })

      this.emitPipelineStep(traceId, 'provider:before', {
        provider: this.provider.name,
        model: normalizedRequest.model,
        promptLength: finalPrompt.length,
      })

      await this.streamFinalPrompt(
        finalPrompt,
        {
          ...normalizedRequest,
          messages: contextMessages,
        },
        {
          onStart: () => undefined,
          onChunk: (chunk) => {
            if (this.activeRequestId !== requestId) return
            if (chunk.done) return

            fullText += chunk.delta
            this.updateAssistantMessage(assistantMessage.id, {
              content: fullText,
              status: 'streaming',
            })
            this.setStatus('streaming')
            this.emitSnapshot()
            this.eventBus.emit('chat:chunk', {
              traceId,
              messageId: assistantMessage.id,
              chunk: chunk.delta,
              fullText,
              status: 'streaming',
            })
          },
          onFinish: (text) => {
            if (this.activeRequestId !== requestId) return
            fullText = text
          },
        },
        timeout.signal,
      )

      if (this.activeRequestId !== requestId) return

      const tokenUsage = estimateCompletionTokenUsage(contextMessages, fullText)

      this.updateAssistantMessage(assistantMessage.id, {
        content: fullText,
        status: 'done',
        tokenUsage,
        citations: retrievalResult.citations.map(this.toMessageCitation),
        metadata: {
          traceId,
          promptLength: finalPrompt.length,
          contextTokens: contextResult.tokenUsage.totalTokens,
          retrievedChunkCount: retrievalResult.chunks.length,
        },
      })
      this.setStatus('done')
      this.retryCount = 0
      this.guard.recordSuccess()
      this.emitSnapshot()
      this.eventBus.emit('chat:finish', {
        traceId,
        messageId: assistantMessage.id,
        fullText,
        tokenUsage,
        status: 'done',
      })
    } catch (error) {
      if (this.activeRequestId !== requestId) return

      if (error instanceof DOMException && error.name === 'AbortError' && !timeout.isTimedOut()) {
        this.updateAssistantMessage(assistantMessage.id, {
          status: 'cancelled',
        })
        this.setStatus('cancelled')
        this.emitSnapshot()
        this.eventBus.emit('chat:abort', {
          traceId,
          messageId: assistantMessage.id,
          status: 'cancelled',
        })
        return
      }

      const normalizedError = this.guard.recordFailure(error)
      const message = normalizedError.message
      this.updateAssistantMessage(assistantMessage.id, {
        status: 'error',
        metadata: {
          error: message,
          errorCode: normalizedError.code,
          retryable: normalizedError.retryable,
        },
      })
      this.setStatus('error')
      this.emitSnapshot()
      this.eventBus.emit('chat:error', {
        traceId,
        messageId: assistantMessage.id,
        error: message,
        code: normalizedError.code,
        retryable: normalizedError.retryable,
        status: 'error',
      })
    } finally {
      timeout.cleanup()
      if (this.activeRequestId === requestId) {
        this.controller = null
        this.activeRequestId = null
      }
    }
  }

  stop() {
    this.controller?.abort()
  }

  retry(lastRequest = this.lastRequest) {
    if (!lastRequest || this.isBusy()) return
    if (!this.guard.canRetry(this.retryCount)) return

    this.retryCount += 1
    this.sendMessage(lastRequest)
  }

  clear() {
    this.controller?.abort()
    this.controller = null
    this.activeRequestId = null
    this.state = createInitialState()
    this.lastRequest = null
    this.retryCount = 0
    this.emitSnapshot()
  }

  private normalizeRequest(request: ChatRequest): ChatRequest {
    const config = this.readConfig()
    const conversationId =
      request.conversationId || this.state.activeSessionId || createId('conversation')
    const requestMessages = this.applySystemPrompt(request.messages, config.systemPrompt)
    const normalizedMessages = requestMessages.map((message) => ({
      ...message,
      id: message.id || createId(message.role),
      status: message.status || 'done',
      createdAt: message.createdAt || now(),
      updatedAt: now(),
    }))
    return {
      ...request,
      conversationId,
      messages: normalizedMessages,
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
      knowledgeBase: request.knowledgeBase,
      promptEngine: request.promptEngine,
      promptTemplateId: request.promptTemplateId,
      knowledgeTopK: request.knowledgeTopK ?? config.knowledgeTopK,
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
    this.state.messages = this.state.messages.map((message) =>
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
    this.guard.assertTransition(this.state.status, status)
    this.state.status = status
    this.touchActiveSession()
  }

  private isBusy() {
    return this.state.status === 'loading' || this.state.status === 'streaming'
  }

  private ensureActiveSession(sessionId: string) {
    const timestamp = now()
    const existingSession = this.state.sessions.find((session) => session.id === sessionId)

    if (existingSession) {
      this.state.sessions = this.state.sessions.map((session) => ({
        ...session,
        active: session.id === sessionId,
        updatedAt: session.id === sessionId ? timestamp : session.updatedAt,
      }))
    } else {
      this.state.sessions = [
        ...this.state.sessions.map((session) => ({ ...session, active: false })),
        {
          ...createSession(sessionId),
          updatedAt: timestamp,
        },
      ]
    }

    this.state.activeSessionId = sessionId
  }

  private touchActiveSession() {
    const timestamp = now()
    this.state.sessions = this.state.sessions.map((session) =>
      session.id === this.state.activeSessionId
        ? {
            ...session,
            updatedAt: timestamp,
          }
        : session,
    )
  }

  private emitSnapshot() {
    this.eventBus.emit('chat:snapshot', this.getSnapshot())
  }

  private emitPipelineStep(
    traceId: string,
    step: PipelineStepName,
    payload: Record<string, unknown>,
  ) {
    this.eventBus.emit('chat:pipeline', {
      traceId,
      timestamp: now(),
      step,
      payload,
    })
  }

  private formatContext(messages: ChatMessage[]) {
    return messages
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n')
      .slice(0, 6000)
  }

  private streamFinalPrompt(
    finalPrompt: string,
    request: ChatRequest,
    callbacks: Parameters<IProvider['streamChat']>[1],
    signal?: AbortSignal,
  ) {
    if (this.provider.streamPrompt) {
      return this.provider.streamPrompt(finalPrompt, request, callbacks, signal)
    }

    const promptMessage = this.createPromptMessage(finalPrompt)

    return this.provider.streamChat(
      {
        ...request,
        messages: [...request.messages, promptMessage],
      },
      callbacks,
      signal,
    )
  }

  private createPromptMessage(prompt: string): ChatMessage {
    const timestamp = now()

    return {
      id: createId('prompt'),
      role: 'user',
      content: prompt,
      status: 'done',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }

  private toMessageCitation(citation: {
    id: string
    source: string
    content: string
    score: number
  }): Citation {
    return {
      id: citation.id,
      source: citation.source,
      title: citation.source,
      content: citation.content,
      score: citation.score,
    }
  }

  private resolveGuardLimits() {
    const config = this.readConfig()

    return {
      maxRetries: config.maxRetries,
      requestTimeoutMs: config.requestTimeoutMs,
    }
  }
}

function createDefaultKnowledgeBase() {
  const base = new KnowledgeBase({
    id: 'runtime-default',
    name: 'Runtime Default Knowledge',
    chunkSize: 360,
  })

  base.uploadDocument({
    title: 'AI Runtime Architecture',
    content:
      'ChatRuntime orchestrates context building, knowledge retrieval, prompt construction and provider streaming. ContextManager controls token windows and compression. PromptEngine renders final prompts. KnowledgeBase provides mock RAG citations.',
  })

  return base
}
