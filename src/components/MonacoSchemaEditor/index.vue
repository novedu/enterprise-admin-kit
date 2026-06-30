<template>
  <div class="monaco-schema-editor surface">
    <div class="editor-toolbar">
      <div>
        <strong>{{ editorTitle }}</strong>
        <span>{{ statusText }}</span>
      </div>
      <el-tag :type="validation.valid ? 'success' : 'danger'">
        {{
          validation.valid
            ? t('editor.validSchema')
            : t('editor.issueCount', { count: validation.errors.length })
        }}
      </el-tag>
    </div>

    <div ref="containerRef" class="editor-host" :style="{ height: `${height}px` }" />

    <div v-if="validation.errors.length" class="editor-errors">
      <strong>{{ t('editor.validation') }}</strong>
      <ul>
        <li v-for="error in validation.errors" :key="error">{{ error }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  parseTableSchema,
  tableSchemaJsonSchema,
  type SchemaValidationResult,
} from '@/utils/schemaValidation'

type MonacoModule = typeof import('monaco-editor')
type MonacoEditor = import('monaco-editor').editor.IStandaloneCodeEditor

window.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }

    return new editorWorker()
  },
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    title?: string
    height?: number
    readonly?: boolean
  }>(),
  {
    title: '',
    height: 560,
    readonly: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  validate: [result: SchemaValidationResult]
}>()

const containerRef = ref<HTMLElement>()
const monaco = shallowRef<MonacoModule>()
const editor = shallowRef<MonacoEditor>()
const { t } = useI18n()
const validation = ref<SchemaValidationResult>({
  valid: true,
  errors: [],
})

const statusText = computed(() =>
  validation.value.valid ? t('editor.statusReady') : t('editor.statusInvalid'),
)
const editorTitle = computed(() => props.title || t('editor.title'))

function validate(value: string) {
  const parsed = parseTableSchema(value)
  validation.value = {
    valid: Boolean(parsed.schema),
    errors: parsed.errors,
  }
  emit('validate', validation.value)
}

async function initEditor() {
  if (!containerRef.value) return

  monaco.value = await import('monaco-editor')
  monaco.value.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    schemas: [
      {
        uri: 'https://enterprise-admin-kit.local/table-schema.json',
        fileMatch: ['schema://table-schema.json'],
        schema: tableSchemaJsonSchema,
      },
    ],
  })

  const model = monaco.value.editor.createModel(
    props.modelValue,
    'json',
    monaco.value.Uri.parse('schema://table-schema.json'),
  )

  editor.value = monaco.value.editor.create(containerRef.value, {
    model,
    readOnly: props.readonly,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    tabSize: 2,
    fontSize: 13,
    scrollBeyondLastLine: false,
    formatOnPaste: true,
    formatOnType: true,
  })

  editor.value.onDidChangeModelContent(() => {
    const nextValue = editor.value?.getValue() || ''
    emit('update:modelValue', nextValue)
    validate(nextValue)
  })

  validate(props.modelValue)
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || value === editor.value.getValue()) return
    editor.value.setValue(value)
    validate(value)
  },
)

onMounted(initEditor)

onBeforeUnmount(() => {
  editor.value?.getModel()?.dispose()
  editor.value?.dispose()
})
</script>

<style scoped>
.monaco-schema-editor {
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--app-border);
  padding: 12px 14px;
}

.editor-toolbar span {
  display: block;
  margin-top: 3px;
  color: var(--app-muted);
  font-size: 12px;
}

.editor-errors {
  border-top: 1px solid var(--app-border);
  padding: 12px 14px;
  background: var(--app-warning-soft);
  color: var(--app-warning-text);
}

.editor-errors ul {
  margin: 8px 0 0;
  padding-left: 18px;
}

@media (max-width: 640px) {
  .editor-toolbar {
    display: grid;
    align-items: start;
    padding: 12px;
  }

  .editor-errors {
    padding: 12px;
  }
}
</style>
