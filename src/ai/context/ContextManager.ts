import type { ChatMessage, CompressionStrategy, TokenUsage } from '@/ai/types'

import { estimateMessageTokens, getTokenUsage } from './tokenEstimator'

export interface ContextManagerConfig {
  contextWindow: number
  compressionStrategy: CompressionStrategy
}

const DEFAULT_CONTEXT_CONFIG: ContextManagerConfig = {
  contextWindow: 8192,
  compressionStrategy: 'none',
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

function isSameMessage(left: ChatMessage, right: ChatMessage) {
  return left === right || left.id === right.id
}

function findLatestUserMessage(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') return messages[index]
  }

  return undefined
}

function createSummaryMessage(messages: ChatMessage[]): ChatMessage {
  return {
    id: `context-summary-${now()}`,
    role: 'system',
    content: 'Summary of previous conversation...',
    status: 'done',
    createdAt: now(),
    updatedAt: now(),
    metadata: {
      summarizedMessageCount: messages.length,
    },
  }
}

function normalizeConfig(config?: Partial<ContextManagerConfig>): ContextManagerConfig {
  return {
    ...DEFAULT_CONTEXT_CONFIG,
    ...config,
    contextWindow: Math.max(0, config?.contextWindow ?? DEFAULT_CONTEXT_CONFIG.contextWindow),
  }
}

export class ContextManager {
  constructor(private config: ContextManagerConfig = DEFAULT_CONTEXT_CONFIG) {}

  build(messages: ChatMessage[], config = this.config) {
    return this.getContext(messages, config)
  }

  getContext(messages: ChatMessage[], config = this.config) {
    return this.applyStrategy(messages, config)
  }

  getTokenUsage(messages: ChatMessage[]): TokenUsage {
    return getTokenUsage(messages)
  }

  applyStrategy(messages: ChatMessage[], config = this.config) {
    const resolvedConfig = normalizeConfig(config)

    switch (resolvedConfig.compressionStrategy) {
      case 'window':
        return this.applyWindowStrategy(messages, resolvedConfig.contextWindow)
      case 'summary':
        return this.applySummaryStrategy(messages, resolvedConfig.contextWindow)
      case 'hybrid':
        return this.applyHybridStrategy(messages, resolvedConfig.contextWindow)
      case 'none':
      default:
        return cloneMessages(messages)
    }
  }

  private applyWindowStrategy(messages: ChatMessage[], contextWindow: number) {
    if (this.getTokenUsage(messages).totalTokens <= contextWindow) {
      return cloneMessages(messages)
    }

    const preservedMessages = this.getPreservedMessages(messages)
    const selectedMessages = new Set<ChatMessage>(preservedMessages)
    let usedTokens = this.getUniqueTokenCount(preservedMessages)

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index]
      if (selectedMessages.has(message)) continue

      const tokens = estimateMessageTokens(message)
      if (usedTokens + tokens > contextWindow) continue

      selectedMessages.add(message)
      usedTokens += tokens
    }

    return cloneMessages(messages.filter((message) => selectedMessages.has(message)))
  }

  private applySummaryStrategy(messages: ChatMessage[], contextWindow: number) {
    if (this.getTokenUsage(messages).totalTokens <= contextWindow) {
      return cloneMessages(messages)
    }

    const systemMessages = messages.filter((message) => message.role === 'system')
    const latestUserMessage = findLatestUserMessage(messages)
    const summarizedMessages = messages.filter(
      (message) =>
        message.role !== 'system' &&
        (!latestUserMessage || !isSameMessage(message, latestUserMessage)),
    )
    const summaryMessage = createSummaryMessage(summarizedMessages)
    const context = latestUserMessage
      ? [...systemMessages, summaryMessage, latestUserMessage]
      : [...systemMessages, summaryMessage]

    return cloneMessages(context)
  }

  private applyHybridStrategy(messages: ChatMessage[], contextWindow: number) {
    if (this.getTokenUsage(messages).totalTokens <= contextWindow) {
      return cloneMessages(messages)
    }

    const systemMessages = messages.filter((message) => message.role === 'system')
    const latestUserMessage = findLatestUserMessage(messages)
    const summaryMessage = createSummaryMessage([])
    const preservedMessages = latestUserMessage
      ? [...systemMessages, summaryMessage, latestUserMessage]
      : [...systemMessages, summaryMessage]
    const selectedMessages = new Set<ChatMessage>(preservedMessages)
    let usedTokens = this.getUniqueTokenCount(preservedMessages)

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index]
      if (message.role === 'system') continue
      if (latestUserMessage && isSameMessage(message, latestUserMessage)) continue

      const tokens = estimateMessageTokens(message)
      if (usedTokens + tokens > contextWindow) continue

      selectedMessages.add(message)
      usedTokens += tokens
    }

    const summarizedMessages = messages.filter(
      (message) =>
        message.role !== 'system' &&
        !selectedMessages.has(message) &&
        (!latestUserMessage || !isSameMessage(message, latestUserMessage)),
    )

    if (!summarizedMessages.length) {
      selectedMessages.delete(summaryMessage)
    } else {
      summaryMessage.metadata = {
        ...summaryMessage.metadata,
        summarizedMessageCount: summarizedMessages.length,
      }
    }

    return this.orderHybridMessages(messages, systemMessages, summaryMessage, selectedMessages)
  }

  private getPreservedMessages(messages: ChatMessage[]) {
    const systemMessages = messages.filter((message) => message.role === 'system')
    const latestUserMessage = findLatestUserMessage(messages)

    return latestUserMessage ? [...systemMessages, latestUserMessage] : systemMessages
  }

  private getUniqueTokenCount(messages: ChatMessage[]) {
    return Array.from(new Set(messages)).reduce(
      (total, message) => total + estimateMessageTokens(message),
      0,
    )
  }

  private orderHybridMessages(
    messages: ChatMessage[],
    systemMessages: ChatMessage[],
    summaryMessage: ChatMessage,
    selectedMessages: Set<ChatMessage>,
  ) {
    const orderedMessages: ChatMessage[] = []

    orderedMessages.push(...systemMessages)
    if (selectedMessages.has(summaryMessage)) {
      orderedMessages.push(summaryMessage)
    }
    orderedMessages.push(
      ...messages.filter((message) => message.role !== 'system' && selectedMessages.has(message)),
    )

    return cloneMessages(orderedMessages)
  }
}
