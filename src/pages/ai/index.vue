<template>
  <div class="page ai-console">
    <div class="page-header console-header">
      <div>
        <h1 class="page-title">{{ t('page.ai.title') }}</h1>
        <p class="page-subtitle">{{ t('page.ai.subtitle') }}</p>
      </div>
      <div class="header-controls">
        <el-tag type="success" effect="plain">{{ aiConfig.provider }}</el-tag>
        <el-tag effect="plain">{{ aiConfig.model }}</el-tag>
      </div>
    </div>

    <nav class="module-nav" aria-label="AI Control Plane modules">
      <RouterLink
        v-for="item in modules"
        :key="item.name"
        class="module-link"
        :to="{ name: item.name }"
      >
        {{ t(item.labelKey) }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiConsolePage',
})

import { useI18n } from 'vue-i18n'

import { useAiConfigStore } from '@/store'

import './shared/console.css'

const { t } = useI18n()
const aiConfig = useAiConfigStore()

const modules = [
  { name: 'AIProvider', labelKey: 'page.ai.tabs.provider' },
  { name: 'AIKnowledge', labelKey: 'page.ai.tabs.knowledge' },
  { name: 'AIPrompt', labelKey: 'page.ai.tabs.prompt' },
  { name: 'AIObservability', labelKey: 'page.ai.tabs.observability' },
  { name: 'AISettings', labelKey: 'page.ai.tabs.settings' },
]
</script>
