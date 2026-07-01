<template>
  <section class="console-grid knowledge-grid">
    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.knowledge.managerTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.knowledge.managerSubtitle') }}</p>
        </div>
        <div class="base-toolbar">
          <el-tag effect="plain">{{ scopeLabel }}</el-tag>
          <el-select
            v-model="activeKnowledgeBaseId"
            class="base-select"
            @change="switchKnowledgeBase(String(activeKnowledgeBaseId))"
          >
            <el-option
              v-for="base in knowledgeBases"
              :key="base.id"
              :label="base.name"
              :value="base.id"
            />
          </el-select>
          <el-button :icon="DocumentAdd" @click="createKnowledgeBase">
            {{ t('page.ai.actions.newBase') }}
          </el-button>
        </div>
      </div>

      <el-form label-position="top" class="control-form">
        <el-form-item :label="t('page.ai.knowledge.newBaseName')">
          <el-input
            v-model="newKnowledgeBaseName"
            :placeholder="t('page.ai.knowledge.newBasePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('page.ai.knowledge.documentTitle')">
          <el-input
            v-model="documentTitle"
            :placeholder="t('page.ai.knowledge.documentTitlePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('page.ai.knowledge.documentContent')">
          <el-input
            v-model="documentContent"
            type="textarea"
            :rows="8"
            :placeholder="t('page.ai.knowledge.documentContentPlaceholder')"
          />
        </el-form-item>
        <el-button type="primary" :icon="Upload" @click="uploadKnowledgeDocument">
          {{ t('page.ai.actions.uploadDocument') }}
        </el-button>
      </el-form>
    </div>

    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.knowledge.documentsTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.knowledge.documentsSubtitle') }}</p>
        </div>
        <div class="inline-actions">
          <el-tag>{{ t('page.ai.knowledge.docCount', { count: documents.length }) }}</el-tag>
          <el-tag effect="plain">{{ chunks.length }} chunks</el-tag>
        </div>
      </div>
      <div class="document-list">
        <div v-for="document in documents" :key="document.id" class="document-item">
          <strong>{{ document.title }}</strong>
          <span>{{ t('page.ai.knowledge.charCount', { count: document.content.length }) }}</span>
        </div>
        <el-empty v-if="!documents.length" :description="t('page.ai.knowledge.noDocuments')" />
      </div>
    </div>

    <div class="surface panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">Chunk Viewer</h2>
          <p class="section-subtitle">Persisted chunks generated for the active knowledge base.</p>
        </div>
        <el-tag effect="plain">{{ activeKnowledgeBase?.name || 'No base' }}</el-tag>
      </div>
      <div class="document-list chunk-list">
        <div v-for="chunk in chunks" :key="chunk.id" class="document-item">
          <strong>{{ chunk.id }}</strong>
          <span>{{ chunk.keywords.slice(0, 8).join(', ') || 'No keywords' }}</span>
          <p>{{ chunk.content }}</p>
        </div>
        <el-empty v-if="!chunks.length" description="No chunks generated yet" />
      </div>
    </div>

    <div class="surface panel wide-panel">
      <div class="panel-head">
        <div>
          <h2 class="section-title">{{ t('page.ai.knowledge.retrievalTitle') }}</h2>
          <p class="section-subtitle">{{ t('page.ai.knowledge.retrievalSubtitle') }}</p>
        </div>
        <div class="inline-actions">
          <el-input-number v-model="retrievalTopK" :min="1" :max="8" size="small" />
          <el-button :icon="Search" type="primary" @click="runRetrieval">
            {{ t('page.ai.actions.retrieve') }}
          </el-button>
        </div>
      </div>
      <el-input
        v-model="retrievalQuery"
        :placeholder="t('page.ai.knowledge.retrievalPlaceholder')"
      />
      <div class="retrieval-grid">
        <div>
          <h3>{{ t('page.ai.knowledge.topKChunks') }}</h3>
          <div v-for="chunk in retrievedChunks" :key="chunk.id" class="result-item">
            <el-tag size="small">
              {{ t('page.ai.knowledge.score', { score: chunk.score }) }}
            </el-tag>
            <p>{{ chunk.content }}</p>
          </div>
          <el-empty
            v-if="!retrievedChunks.length"
            :description="t('page.ai.knowledge.noRetrievalResults')"
          />
        </div>
        <div>
          <h3>{{ t('page.ai.knowledge.citations') }}</h3>
          <div v-for="citation in citations" :key="citation.id" class="result-item">
            <strong>{{ citation.source }}</strong>
            <p>{{ citation.content }}</p>
          </div>
          <el-empty v-if="!citations.length" :description="t('page.ai.knowledge.noCitations')" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AiKnowledgeConsole',
})

import { DocumentAdd, Search, Upload } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { useKnowledgeConsole } from '../shared/useAiControlPlane'

const { t } = useI18n()
const {
  activeKnowledgeBaseId,
  activeKnowledgeBase,
  knowledgeBases,
  chunks,
  newKnowledgeBaseName,
  documentTitle,
  documentContent,
  documents,
  retrievalQuery,
  retrievalTopK,
  retrievedChunks,
  citations,
  scopeLabel,
  createKnowledgeBase,
  uploadKnowledgeDocument,
  runRetrieval,
  switchKnowledgeBase,
} = useKnowledgeConsole()
</script>
