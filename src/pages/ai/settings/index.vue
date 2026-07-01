<template>
  <section class="console-grid settings-grid">
    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.settings.contextTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.settings.contextSubtitle') }}</p>
        </div>
        <div class="inline-actions">
          <el-tag effect="plain">{{ scopeLabel }}</el-tag>
          <el-tag>{{ aiConfig.compressionStrategy }}</el-tag>
        </div>
      </div>
      <el-form label-position="top" class="control-form">
        <el-form-item :label="t('page.ai.settings.contextWindow')">
          <el-input-number
            v-model="contextWindowDraft"
            :min="1024"
            :max="128000"
            :step="1024"
            @change="aiConfig.updateConfig({ contextWindow: contextWindowDraft })"
          />
        </el-form-item>
        <el-form-item :label="t('page.ai.settings.compressionStrategy')">
          <el-select
            v-model="compressionDraft"
            @change="aiConfig.updateConfig({ compressionStrategy: compressionDraft })"
          >
            <el-option :label="t('page.ai.settings.strategyNone')" value="none" />
            <el-option :label="t('page.ai.settings.strategyWindow')" value="window" />
            <el-option :label="t('page.ai.settings.strategySummary')" value="summary" />
            <el-option :label="t('page.ai.settings.strategyHybrid')" value="hybrid" />
          </el-select>
        </el-form-item>
        <el-checkbox v-model="streamDraft" @change="aiConfig.updateConfig({ stream: streamDraft })">
          {{ t('page.ai.settings.enableStreaming') }}
        </el-checkbox>
        <el-checkbox
          v-model="knowledgeDraft"
          @change="aiConfig.updateConfig({ enableKnowledge: knowledgeDraft })"
        >
          {{ t('page.ai.settings.enableKnowledge') }}
        </el-checkbox>
        <el-checkbox
          v-model="cacheDraft"
          @change="aiConfig.updateConfig({ enableCache: cacheDraft })"
        >
          {{ t('page.ai.settings.enableCache') }}
        </el-checkbox>
        <el-button :icon="RefreshLeft" @click="resetConfig">{{ t('common.reset') }}</el-button>
      </el-form>
    </div>

    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.settings.configTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.settings.configSubtitle') }}</p>
        </div>
        <div class="inline-actions">
          <el-button :icon="Download" @click="exportConfig">
            {{ t('common.export') }}
          </el-button>
          <el-button type="primary" :icon="Upload" @click="importConfig">
            {{ t('page.ai.actions.import') }}
          </el-button>
        </div>
      </div>
      <el-input v-model="configJson" type="textarea" :rows="18" />
      <p v-if="configError" class="error-text">{{ configError }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiRuntimeSettings',
})

import { Download, RefreshLeft, Upload } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { useRuntimeSettings } from '../shared/useAiControlPlane'

const { t } = useI18n()
const {
  aiConfig,
  contextWindowDraft,
  compressionDraft,
  streamDraft,
  knowledgeDraft,
  cacheDraft,
  configJson,
  configError,
  scopeLabel,
  exportConfig,
  importConfig,
  resetConfig,
} = useRuntimeSettings()
</script>
