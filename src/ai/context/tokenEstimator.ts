import type { ChatMessage, TokenUsage } from '@/ai/types'

export function estimateTextTokens(text: string) {
  return Math.ceil(text.length / 4)
}

export function estimateMessageTokens(message: ChatMessage) {
  return estimateTextTokens(message.content)
}

export function getTokenUsage(messages: ChatMessage[]): TokenUsage {
  return messages.reduce<TokenUsage>(
    (usage, message) => {
      const tokens = estimateMessageTokens(message)

      if (message.role === 'assistant') {
        usage.completionTokens += tokens
      } else {
        usage.promptTokens += tokens
      }

      usage.totalTokens = usage.promptTokens + usage.completionTokens

      return usage
    },
    {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  )
}

export function estimateCompletionTokenUsage(
  promptMessages: ChatMessage[],
  completionText: string,
): TokenUsage {
  const promptTokens = promptMessages.reduce(
    (total, message) => total + estimateMessageTokens(message),
    0,
  )
  const completionTokens = estimateTextTokens(completionText)

  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  }
}
