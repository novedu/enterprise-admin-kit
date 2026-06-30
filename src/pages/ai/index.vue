<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page.ai.title') }}</h1>
        <p class="page-subtitle">{{ t('page.ai.subtitle') }}</p>
      </div>
    </div>

    <AiChat />
  </div>
</template>

<script setup lang="ts">
import AiChat from '@/components/AiChat/index.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
