<template>
  <div class="chat-workbench">
    <aside class="conversation-panel surface">
      <div class="conversation-head">
        <strong>{{ t('chat.workspace') }}</strong>
        <el-button type="primary" size="small">+</el-button>
      </div>
      <div class="conversation-list">
        <button
          v-for="item in conversations"
          :key="item.id"
          class="conversation-item"
          :class="{ active: item.active }"
        >
          <span>{{ item.title }}</span>
          <small>{{ item.time }}</small>
        </button>
      </div>
    </aside>

    <div class="chat-shell surface">
      <div class="chat-header">
        <div>
          <h2 class="section-title">{{ t('chat.assistant') }}</h2>
          <p class="section-subtitle">{{ t('chat.assistantSubtitle') }}</p>
        </div>
        <el-tag type="success">{{ t('chat.sseMock') }}</el-tag>
      </div>

      <div class="chat-stream">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-row"
          :class="message.role"
        >
          <div class="message-bubble">
            <div
              v-if="message.role === 'assistant'"
              class="markdown"
              v-html="render(message.content)"
            />
            <p v-else>{{ message.content }}</p>
            <span
              v-if="message.status === 'loading' || message.status === 'streaming'"
              class="typing"
            >
              {{ t('chat.streaming') }}
            </span>
            <span v-if="message.status === 'cancelled'" class="message-state">
              {{ t('chat.cancelled') }}
            </span>
            <span v-if="message.status === 'error'" class="message-state danger">
              {{ message.metadata?.error || t('chat.failed') }}
            </span>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input
          v-model="currentPrompt"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 5 }"
          :placeholder="t('chat.placeholder')"
          @keydown.enter.exact.prevent="handleSend"
        />
        <div class="chat-actions">
          <el-tag effect="plain">{{ status }}</el-tag>
          <el-button :icon="RefreshRight" :disabled="streaming" @click="retry">
            {{ t('common.regenerate') }}
          </el-button>
          <el-button v-if="streaming" type="danger" :icon="CircleClose" @click="stop">
            {{ t('common.stop') }}
          </el-button>
          <el-button v-else type="primary" :icon="Promotion" @click="handleSend">
            {{ t('common.send') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiChat',
})

import { CircleClose, Promotion, RefreshRight } from '@element-plus/icons-vue'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useChatRuntime } from '@/ai/composables/useChatRuntime'

const { messages, status, streaming, sendMessage, stop, retry } = useChatRuntime()
const { t } = useI18n()
const currentPrompt = ref('')
const conversations = computed(() => [
  { id: 1, title: t('chat.conversation.rbac'), time: '09:32', active: true },
  {
    id: 2,
    title: t('chat.conversation.schema'),
    time: t('chat.conversation.yesterday'),
    active: false,
  },
  {
    id: 3,
    title: t('chat.conversation.streaming'),
    time: t('chat.conversation.monday'),
    active: false,
  },
])

const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(code: string, language: string) {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    }
    return hljs.highlightAuto(code).value
  },
})

function render(content: string) {
  return md.render(content)
}

function handleSend() {
  const text = currentPrompt.value.trim()
  if (!text) return

  sendMessage(text)
  currentPrompt.value = ''
}
</script>

<style scoped>
.chat-workbench {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  min-height: calc(100vh - 150px);
}

.conversation-panel {
  overflow: hidden;
}

.conversation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--app-border);
  padding: 14px;
}

.conversation-list {
  display: grid;
  gap: 8px;
  padding: 12px;
}

.conversation-item {
  display: grid;
  gap: 4px;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 10px 12px;
  background: transparent;
  color: var(--app-text);
  text-align: left;
  cursor: pointer;
}

.conversation-item.active,
.conversation-item:hover {
  border-color: var(--app-border);
  background: var(--app-panel-soft);
}

.conversation-item small {
  color: var(--app-muted);
}

.chat-shell {
  display: grid;
  grid-template-rows: auto minmax(420px, 1fr) auto;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--app-border);
  padding: 14px 16px;
}

.chat-stream {
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  padding: 18px;
  background: var(--app-panel-soft);
}

.message-row {
  display: flex;
}

.message-row.user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: min(760px, 86%);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--app-panel);
}

.message-row.user .message-bubble {
  border-color: var(--app-primary);
  background: var(--app-panel-muted);
}

.message-bubble p {
  margin: 0;
  line-height: 1.65;
}

.markdown :deep(p) {
  margin: 0 0 10px;
  line-height: 1.65;
}

.markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.typing {
  display: inline-block;
  margin-top: 8px;
  color: var(--app-muted);
  font-size: 12px;
}

.message-state {
  display: inline-block;
  margin-top: 8px;
  color: var(--app-muted);
  font-size: 12px;
}

.message-state.danger {
  color: var(--app-danger);
}

.chat-input {
  display: grid;
  gap: 10px;
  border-top: 1px solid var(--app-border);
  padding: 14px;
  background: var(--app-panel);
}

.chat-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 980px) {
  .chat-workbench {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .conversation-list {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .conversation-list::-webkit-scrollbar {
    display: none;
  }

  .conversation-item {
    min-width: 180px;
  }
}

@media (max-width: 640px) {
  .conversation-panel {
    display: none;
  }

  .chat-shell {
    grid-template-rows: auto minmax(340px, calc(100vh - 310px)) auto;
  }

  .chat-header {
    display: grid;
    gap: 10px;
    padding: 12px;
  }

  .chat-stream {
    gap: 12px;
    padding: 12px;
  }

  .message-bubble {
    max-width: 100%;
    padding: 10px 12px;
  }

  .chat-input {
    padding: 12px;
  }

  .chat-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .chat-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }
}
</style>
