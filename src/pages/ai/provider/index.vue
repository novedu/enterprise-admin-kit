<template>
  <section class="console-grid provider-grid">
    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.provider.routingTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.provider.routingSubtitle') }}</p>
        </div>
        <div class="inline-actions">
          <el-tag effect="plain">{{ scopeLabel }}</el-tag>
          <el-tag :type="providerTagType(aiConfig.provider)">{{ aiConfig.provider }}</el-tag>
        </div>
      </div>

      <el-form label-position="top" class="control-form">
        <el-form-item :label="t('page.ai.provider.provider')">
          <el-segmented
            v-model="providerDraft"
            :options="providerOptions"
            @change="handleProviderChange"
          />
        </el-form-item>
        <el-form-item :label="t('page.ai.provider.model')">
          <el-select v-model="modelDraft" filterable @change="aiConfig.setModel(modelDraft)">
            <el-option
              v-for="model in currentModelOptions"
              :key="model"
              :label="model"
              :value="model"
            />
          </el-select>
        </el-form-item>
        <div class="form-row">
          <el-form-item :label="t('page.ai.provider.temperature')">
            <el-slider
              v-model="temperatureDraft"
              :min="0"
              :max="2"
              :step="0.1"
              @change="aiConfig.updateConfig({ temperature: temperatureDraft })"
            />
          </el-form-item>
          <el-form-item :label="t('page.ai.provider.topP')">
            <el-slider
              v-model="topPDraft"
              :min="0"
              :max="1"
              :step="0.05"
              @change="aiConfig.updateConfig({ topP: topPDraft })"
            />
          </el-form-item>
        </div>
        <el-form-item :label="t('page.ai.provider.maxTokens')">
          <el-input-number
            v-model="maxTokensDraft"
            :min="128"
            :max="32768"
            :step="128"
            @change="aiConfig.updateConfig({ maxTokens: maxTokensDraft })"
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.provider.probeTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.provider.probeSubtitle') }}</p>
        </div>
        <el-button type="primary" :icon="Promotion" @click="sendMessage(providerProbe)">
          {{ t('page.ai.actions.testChat') }}
        </el-button>
      </div>
      <el-input
        v-model="providerProbe"
        type="textarea"
        :rows="6"
        :placeholder="t('page.ai.provider.probePlaceholder')"
      />
      <div class="probe-result">
        <el-tag effect="plain">{{ chatStatus }}</el-tag>
        <span>{{
          streaming ? t('page.ai.provider.streamingInPlayground') : t('page.ai.provider.ready')
        }}</span>
      </div>
    </div>

    <div class="surface panel wide-panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.provider.credentialsTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.provider.credentialsSubtitle') }}</p>
        </div>
        <el-tag :type="credentialStatus ? 'success' : 'info'">
          {{
            credentialStatus
              ? t('page.ai.provider.credentialsConfigured')
              : t('page.ai.provider.noKey')
          }}
        </el-tag>
      </div>
      <el-form label-position="top" class="control-form">
        <div class="form-row">
          <el-form-item :label="t('page.ai.provider.credentialName')">
            <el-input
              v-model="credentialNameDraft"
              :prefix-icon="Key"
              :placeholder="t('page.ai.provider.credentialNamePlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="t('page.ai.provider.credentialRef')">
            <el-input
              v-model="credentialRefDraft"
              :placeholder="t('page.ai.provider.credentialRefPlaceholder')"
            />
          </el-form-item>
        </div>
        <div class="inline-actions">
          <el-button type="primary" :icon="Key" @click="saveProviderCredential">
            {{ t('page.ai.actions.saveKey') }}
          </el-button>
          <el-button :icon="Hide" @click="clearProviderCredential">
            {{ t('page.ai.actions.clearKey') }}
          </el-button>
        </div>
      </el-form>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiProviderCenter',
})

import { Hide, Key, Promotion } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { providerTagType, useProviderCenter } from '../shared/useAiControlPlane'

const { t } = useI18n()
const {
  aiConfig,
  chatStatus,
  streaming,
  sendMessage,
  providerDraft,
  modelDraft,
  temperatureDraft,
  topPDraft,
  maxTokensDraft,
  providerProbe,
  credentialNameDraft,
  credentialRefDraft,
  currentModelOptions,
  providerOptions,
  credentialStatus,
  scopeLabel,
  handleProviderChange,
  saveProviderCredential,
  clearProviderCredential,
} = useProviderCenter()
</script>
