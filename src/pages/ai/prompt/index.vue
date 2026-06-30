<template>
  <section class="console-grid prompt-grid">
    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.prompt.templatesTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.prompt.templatesSubtitle') }}</p>
        </div>
        <el-button :icon="DocumentAdd" @click="savePromptTemplate">
          {{ t('page.ai.actions.saveDraft') }}
        </el-button>
      </div>
      <el-radio-group v-model="selectedTemplateId" class="template-list" @change="selectTemplate">
        <el-radio-button v-for="template in templates" :key="template.id" :label="template.id">
          {{ template.name }}
        </el-radio-button>
      </el-radio-group>
      <el-input v-model="templateDraft" type="textarea" :rows="14" />
    </div>

    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.prompt.variablesTitle') }}</h2>
          <p class="section-subtitle">
            {{ t('page.ai.prompt.variablesPrefix') }}
            <code>{{ variableSyntax }}</code>
            {{ t('page.ai.prompt.variablesSuffix') }}
          </p>
        </div>
        <el-button type="primary" :icon="View" @click="renderPromptPreview">
          {{ t('page.ai.actions.preview') }}
        </el-button>
      </div>
      <div class="variable-tags">
        <el-tag v-for="variable in selectedTemplate?.variables" :key="variable">
          {{ variable }}
        </el-tag>
      </div>
      <el-input v-model="promptVariables" type="textarea" :rows="10" />
      <el-form label-position="top" class="control-form">
        <el-form-item :label="t('page.ai.prompt.globalSystemPrompt')">
          <el-input
            v-model="systemPromptDraft"
            type="textarea"
            :rows="4"
            @change="saveSystemPrompt"
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="surface panel wide-panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.prompt.previewTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.prompt.previewSubtitle') }}</p>
        </div>
        <el-tag :type="promptError ? 'danger' : 'success'">
          {{ promptError ? t('page.ai.prompt.invalidVariables') : t('page.ai.prompt.renderable') }}
        </el-tag>
      </div>
      <p v-if="promptError" class="error-text">{{ promptError }}</p>
      <pre>{{ promptPreview }}</pre>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiPromptStudio',
})

import { DocumentAdd, View } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { usePromptStudio } from '../shared/useAiControlPlane'

const { t } = useI18n()
const {
  templates,
  selectedTemplateId,
  selectedTemplate,
  templateDraft,
  promptVariables,
  promptPreview,
  promptError,
  variableSyntax,
  systemPromptDraft,
  savePromptTemplate,
  renderPromptPreview,
  selectTemplate,
  saveSystemPrompt,
} = usePromptStudio()

renderPromptPreview()
</script>
