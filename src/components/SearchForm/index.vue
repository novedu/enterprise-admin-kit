<template>
  <div class="search-form surface">
    <SchemaForm v-model="model" :schema="schema" label-width="84px" />
    <div class="search-actions">
      <el-button :icon="Refresh" @click="reset">{{ t('common.reset') }}</el-button>
      <el-button type="primary" :icon="Search" @click="emit('search')">{{
        t('common.search')
      }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import SchemaForm from '@/components/SchemaForm/index.vue'
import type { FormSchema } from '@/types/schema'

defineProps<{
  schema: FormSchema
}>()

const model = defineModel<Record<string, unknown>>({
  required: true,
})

const emit = defineEmits<{
  search: []
  reset: []
}>()

const { t } = useI18n()

function reset() {
  Object.keys(model.value).forEach((key) => {
    model.value[key] = ''
  })
  emit('reset')
}
</script>

<style scoped>
.search-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 16px;
}

.search-form :deep(.schema-form) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  column-gap: 12px;
}

.search-actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

@media (max-width: 760px) {
  .search-form {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .search-form :deep(.schema-form) {
    grid-template-columns: 1fr;
  }

  .search-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .search-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
