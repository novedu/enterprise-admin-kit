<template>
  <div class="page schema-editor-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page.schemaEditor.title') }}</h1>
        <p class="page-subtitle">{{ t('page.schemaEditor.subtitle') }}</p>
      </div>
      <div class="schema-actions">
        <el-button :icon="Refresh" @click="resetSchema">{{ t('common.reset') }}</el-button>
        <el-button
          type="primary"
          :icon="DocumentChecked"
          :disabled="!currentSchema"
          @click="formatSchema"
        >
          {{ t('common.format') }}
        </el-button>
      </div>
    </div>

    <section class="schema-editor-grid">
      <MonacoSchemaEditor
        v-model="schemaJson"
        :title="t('page.schemaEditor.editorTitle')"
        @validate="validation = $event"
      />

      <div class="preview-column">
        <div class="surface preview-panel">
          <div class="preview-head">
            <div>
              <strong>{{ t('page.schemaEditor.formPreview') }}</strong>
              <span>{{ t('page.schemaEditor.formPreviewDesc') }}</span>
            </div>
            <el-tag :type="validation.valid ? 'success' : 'danger'">
              {{ validation.valid ? t('common.live') : t('common.invalid') }}
            </el-tag>
          </div>

          <SchemaForm v-if="currentSchema" v-model="formModel" :schema="currentSchema.form" />
          <el-empty v-else :description="t('page.schemaEditor.invalidForm')" />
        </div>

        <div class="surface preview-panel">
          <div class="preview-head">
            <div>
              <strong>{{ t('page.schemaEditor.tablePreview') }}</strong>
              <span>{{ t('page.schemaEditor.tablePreviewDesc') }}</span>
            </div>
          </div>

          <div v-if="currentSchema" class="preview-table-scroll">
            <el-table :data="previewRows" border>
              <el-table-column type="index" width="56" />
              <el-table-column
                v-for="column in currentSchema.columns"
                :key="column.prop"
                :prop="column.prop"
                :label="getColumnLabel(column)"
                :width="column.width"
                :min-width="column.minWidth"
              />
            </el-table>
          </div>
          <el-empty v-else :description="t('page.schemaEditor.invalidTable')" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { DocumentChecked, Refresh } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import MonacoSchemaEditor from '@/components/MonacoSchemaEditor/index.vue'
import SchemaForm from '@/components/SchemaForm/index.vue'
import { userSchema } from '@/schemas/user'
import type { TableColumn } from '@/types/table'
import { translateWithFallback } from '@/utils/i18n'
import type { SchemaValidationResult } from '@/utils/schemaValidation'
import { createEmptyRow, createPreviewRows, parseTableSchema } from '@/utils/schemaValidation'

const initialSchema = JSON.stringify(userSchema, null, 2)
const { t } = useI18n()
const schemaJson = ref(initialSchema)
const validation = ref<SchemaValidationResult>({
  valid: true,
  errors: [],
})

const parsed = computed(() => parseTableSchema(schemaJson.value))
const currentSchema = computed(() => parsed.value.schema)
const formModel = ref<Record<string, unknown>>({})
const previewRows = computed(() =>
  currentSchema.value ? createPreviewRows(currentSchema.value) : [],
)

watch(
  currentSchema,
  (schema) => {
    formModel.value = schema ? createEmptyRow(schema) : {}
  },
  {
    immediate: true,
  },
)

function resetSchema() {
  schemaJson.value = initialSchema
}

function formatSchema() {
  if (!currentSchema.value) return
  schemaJson.value = JSON.stringify(currentSchema.value, null, 2)
}

function getColumnLabel(column: TableColumn) {
  return translateWithFallback(t, column.labelKey, column.label)
}
</script>

<style scoped>
.schema-editor-page {
  min-height: 100%;
}

.schema-actions {
  display: flex;
  gap: 8px;
}

.schema-editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(420px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.preview-column {
  display: grid;
  gap: 16px;
}

.preview-panel {
  overflow: hidden;
  padding: 16px;
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.preview-head span {
  display: block;
  margin-top: 3px;
  color: var(--app-muted);
  font-size: 12px;
}

.preview-table-scroll {
  overflow-x: auto;
}

.preview-table-scroll :deep(.el-table) {
  min-width: 680px;
}

@media (max-width: 1180px) {
  .schema-editor-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .schema-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  .schema-actions :deep(.el-button) {
    width: 100%;
  }

  .preview-panel {
    padding: 14px;
  }

  .preview-head {
    display: grid;
    align-items: start;
  }
}
</style>
