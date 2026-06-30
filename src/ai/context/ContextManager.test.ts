import { describe, expect, it } from 'vitest'

import type { ChatMessage, CompressionStrategy } from '@/ai/types'

import { ContextManager } from './ContextManager'
import { getTokenUsage } from './tokenEstimator'

function message(id: string, role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id,
    role,
    content,
    status: 'done',
    createdAt: 1,
  }
}

function buildContext(
  strategy: CompressionStrategy,
  contextWindow: number,
  messages: ChatMessage[],
) {
  return new ContextManager().build(messages, {
    compressionStrategy: strategy,
    contextWindow,
  })
}

describe('ContextManager', () => {
  const messages = [
    message('system', 'system', 'System prompt must remain.'),
    message('user-1', 'user', 'Earlier user request with a lot of details.'),
    message('assistant-1', 'assistant', 'Earlier assistant response with many details.'),
    message('user-2', 'user', 'Latest user request must remain.'),
  ]

  it('estimates prompt and completion tokens with mock 4-character rule', () => {
    const usage = getTokenUsage([
      message('user', 'user', '12345678'),
      message('assistant', 'assistant', '1234'),
    ])

    expect(usage).toEqual({
      promptTokens: 2,
      completionTokens: 1,
      totalTokens: 3,
    })
  })

  it('returns full history for none strategy', () => {
    const context = buildContext('none', 1, messages)

    expect(context.map((item) => item.id)).toEqual(messages.map((item) => item.id))
  })

  it('keeps system prompt and latest user message for window strategy', () => {
    const context = buildContext('window', 12, messages)

    expect(context.some((item) => item.id === 'system')).toBe(true)
    expect(context.some((item) => item.id === 'user-2')).toBe(true)
    expect(context.some((item) => item.id === 'user-1')).toBe(false)
  })

  it('replaces old messages with a summary for summary strategy', () => {
    const context = buildContext('summary', 12, messages)

    expect(context.map((item) => item.role)).toEqual(['system', 'system', 'user'])
    expect(context[1].content).toBe('Summary of previous conversation...')
    expect(context.at(-1)?.id).toBe('user-2')
  })

  it('summarizes middle history while keeping recent messages for hybrid strategy', () => {
    const context = buildContext('hybrid', 24, messages)

    expect(context.some((item) => item.id === 'system')).toBe(true)
    expect(context.some((item) => item.content === 'Summary of previous conversation...')).toBe(
      true,
    )
    expect(context.at(-1)?.id).toBe('user-2')
  })
})
