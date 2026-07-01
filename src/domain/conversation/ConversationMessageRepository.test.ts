import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChatMessage } from '@/ai/types'

import { ConversationMessageRepository } from './ConversationMessageRepository'

function message(id: string, content: string): ChatMessage {
  return {
    id,
    role: 'user',
    content,
    status: 'done',
    createdAt: id === 'message-1' ? 1 : 2,
    metadata: {
      traceId: `trace-${id}`,
    },
  }
}

describe('ConversationMessageRepository', () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
        clear: () => storage.clear(),
      },
    })
  })

  it('persists and restores messages by conversation', async () => {
    const repository = new ConversationMessageRepository()

    await repository.saveSnapshot({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      conversationId: 'conversation-1',
      messages: [message('message-2', 'second'), message('message-1', 'first')],
    })

    const messages = await repository.listByConversation('conversation-1')

    expect(messages.map((item) => item.content)).toEqual(['first', 'second'])
    expect(messages[0]).toMatchObject({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      conversationId: 'conversation-1',
      metadata: {
        traceId: 'trace-message-1',
      },
    })
  })

  it('replaces only the target conversation snapshot', async () => {
    const repository = new ConversationMessageRepository()

    await repository.saveSnapshot({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      conversationId: 'conversation-1',
      messages: [message('message-1', 'first')],
    })
    await repository.saveSnapshot({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      conversationId: 'conversation-2',
      messages: [message('message-2', 'other')],
    })
    await repository.saveSnapshot({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      conversationId: 'conversation-1',
      messages: [message('message-3', 'updated')],
    })

    expect(
      (await repository.listByConversation('conversation-1')).map((item) => item.content),
    ).toEqual(['updated'])
    expect(
      (await repository.listByConversation('conversation-2')).map((item) => item.content),
    ).toEqual(['other'])
  })

  it('deletes messages by conversation', async () => {
    const repository = new ConversationMessageRepository()

    await repository.saveSnapshot({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      conversationId: 'conversation-1',
      messages: [message('message-1', 'first')],
    })

    await repository.deleteByConversation('conversation-1')

    expect(await repository.listByConversation('conversation-1')).toEqual([])
  })
})
