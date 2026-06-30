import { describe, expect, it } from 'vitest'

import { EventBus } from '@/ai/events/EventBus'
import type { ChatMessage } from '@/ai/types'

import { RuntimeInspector } from './RuntimeInspector'

function assistantMessage(id: string): ChatMessage {
  return {
    id,
    role: 'assistant',
    content: '',
    status: 'loading',
    createdAt: 1,
  }
}

describe('RuntimeInspector', () => {
  it('collects trace, timeline, token and latency metrics passively', () => {
    const eventBus = new EventBus()
    const timestamps = [1000, 1000, 1000, 1200, 1200, 1300, 1300, 1600, 1600, 1600]
    const inspector = new RuntimeInspector(eventBus, {
      now: () => timestamps.shift() ?? 1600,
      createTraceId: () => 'trace-001',
      metadataResolver: () => ({
        provider: 'mock',
        model: 'mock-chat-runtime',
      }),
    })

    inspector.start()

    eventBus.emit('chat:start', {
      traceId: 'trace-001',
      conversationId: 'conversation-1',
      message: assistantMessage('assistant-1'),
      messages: [assistantMessage('assistant-1')],
      status: 'loading',
    })
    eventBus.emit('chat:pipeline', {
      traceId: 'trace-001',
      timestamp: 1100,
      step: 'context:after',
      payload: {
        totalTokens: 12,
      },
    })
    eventBus.emit('chat:chunk', {
      traceId: 'trace-001',
      messageId: 'assistant-1',
      chunk: 'hello',
      fullText: 'hello',
      status: 'streaming',
    })
    eventBus.emit('chat:chunk', {
      traceId: 'trace-001',
      messageId: 'assistant-1',
      chunk: ' world',
      fullText: 'hello world',
      status: 'streaming',
    })
    eventBus.emit('chat:finish', {
      traceId: 'trace-001',
      messageId: 'assistant-1',
      fullText: 'hello world',
      tokenUsage: {
        promptTokens: 10,
        completionTokens: 3,
        totalTokens: 13,
      },
      status: 'done',
    })

    const snapshot = inspector.getSnapshot()

    expect(snapshot.traces).toEqual([
      {
        traceId: 'trace-001',
        conversationId: 'conversation-1',
        messageId: 'assistant-1',
        startTime: 1000,
        endTime: 1600,
        duration: 600,
        provider: 'mock',
        model: 'mock-chat-runtime',
        status: 'done',
      },
    ])
    expect(snapshot.events.map((event) => event.type)).toEqual([
      'chat:start',
      'chat:pipeline',
      'chat:chunk',
      'chat:chunk',
      'chat:finish',
    ])
    expect(snapshot.tokenUsage[0]).toEqual({
      traceId: 'trace-001',
      promptTokens: 10,
      completionTokens: 3,
      totalTokens: 13,
    })
    expect(snapshot.latency[0]).toMatchObject({
      traceId: 'trace-001',
      timeToFirstToken: 200,
      streamingDuration: 400,
      totalRequestTime: 600,
      chunkCount: 2,
      chunkRate: 5,
    })
  })

  it('marks aborted traces as cancelled', () => {
    const eventBus = new EventBus()
    const inspector = new RuntimeInspector(eventBus, {
      now: () => 1000,
      createTraceId: () => 'trace-abort',
    })

    inspector.start()
    eventBus.emit('chat:start', {
      conversationId: 'conversation-2',
      message: assistantMessage('assistant-2'),
      messages: [assistantMessage('assistant-2')],
      status: 'loading',
    })
    eventBus.emit('chat:abort', {
      messageId: 'assistant-2',
      status: 'cancelled',
    })

    expect(inspector.getSnapshot().traces[0].status).toBe('cancelled')
  })

  it('bounds traces and timeline events', () => {
    const eventBus = new EventBus()
    const inspector = new RuntimeInspector(eventBus, {
      maxTraces: 1,
      maxEventsPerTrace: 3,
      samplingMode: 'debug',
      metadataResolver: () => ({
        provider: 'mock',
        model: 'mock-chat-runtime',
      }),
    })

    inspector.start()

    eventBus.emit('chat:start', {
      traceId: 'trace-old',
      conversationId: 'conversation-old',
      message: assistantMessage('assistant-old'),
      messages: [assistantMessage('assistant-old')],
      status: 'loading',
    })
    eventBus.emit('chat:start', {
      traceId: 'trace-new',
      conversationId: 'conversation-new',
      message: assistantMessage('assistant-new'),
      messages: [assistantMessage('assistant-new')],
      status: 'loading',
    })

    for (let index = 0; index < 5; index += 1) {
      eventBus.emit('chat:chunk', {
        traceId: 'trace-new',
        messageId: 'assistant-new',
        chunk: String(index),
        fullText: String(index),
        status: 'streaming',
      })
    }

    const snapshot = inspector.getSnapshot()

    expect(snapshot.traces.map((trace) => trace.traceId)).toEqual(['trace-new'])
    expect(snapshot.events.every((event) => event.traceId === 'trace-new')).toBe(true)
    expect(snapshot.events).toHaveLength(3)
  })
})
