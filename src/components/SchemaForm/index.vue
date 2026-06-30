<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    class="schema-form"
  >
    <template v-for="item in visibleSchema" :key="item.field">
      <el-form-item :label="getLabel(item)" :prop="item.field">
        <el-input
          v-if="item.component === 'Input'"
          v-model="model[item.field]"
          :placeholder="getPlaceholder(item, 'input')"
          clearable
          v-bind="item.props"
        />

        <el-select
          v-else-if="item.component === 'Select'"
          v-model="model[item.field]"
          :placeholder="getPlaceholder(item, 'select')"
          clearable
          filterable
          class="w-full"
          v-bind="item.props"
        >
          <el-option
            v-for="option in item.options"
            :key="String(option.value)"
            :label="translateWithFallback(t, option.labelKey, option.label)"
            :value="option.value"
          />
        </el-select>

        <el-date-picker
          v-else-if="item.component === 'Date'"
          v-model="model[item.field]"
          type="date"
          value-format="YYYY-MM-DD"
          :placeholder="getPlaceholder(item, 'pick')"
          class="w-full"
          v-bind="item.props"
        />

        <el-radio-group v-else-if="item.component === 'Radio'" v-model="model[item.field]">
          <el-radio
            v-for="option in item.options"
            :key="String(option.value)"
            :value="option.value"
          >
            {{ translateWithFallback(t, option.labelKey, option.label) }}
          </el-radio>
        </el-radio-group>

        <el-upload v-else action="#" :auto-upload="false" v-bind="item.props">
          <el-button>{{ t('common.upload') }}</el-button>
        </el-upload>
      </el-form-item>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { FormSchema, FormSchemaItem } from '@/types/schema'
import { translateWithFallback } from '@/utils/i18n'
import { hasFieldPermission } from '@/utils/permission'

const props = withDefaults(
  defineProps<{
    schema: FormSchema
    labelWidth?: string
  }>(),
  {
    labelWidth: '96px',
  },
)

const model = defineModel<Record<string, unknown>>({
  required: true,
})

const formRef = ref<FormInstance>()
const { t } = useI18n()

const visibleSchema = computed(() =>
  props.schema.filter((item) => !item.hidden && hasFieldPermission(item.permission)),
)

const rules = computed<FormRules>(() =>
  Object.fromEntries(
    visibleSchema.value
      .filter((item) => item.required)
      .map((item) => [
        item.field,
        [
          {
            required: true,
            message: t('form.required', { label: getLabel(item) }),
            trigger: 'blur',
          },
        ],
      ]),
  ),
)

function getLabel(item: FormSchemaItem) {
  return translateWithFallback(t, item.labelKey, item.label)
}

function getPlaceholder(item: FormSchemaItem, type: 'input' | 'select' | 'pick') {
  return (
    translateWithFallback(t, item.placeholderKey, item.placeholder) ||
    t(`form.${type}`, { label: getLabel(item) })
  )
}

async function validate() {
  return formRef.value?.validate()
}

function resetFields() {
  formRef.value?.resetFields()
}

defineExpose({
  validate,
  resetFields,
})
</script>

<style scoped>
.schema-form {
  width: 100%;
}

@media (max-width: 640px) {
  .schema-form :deep(.el-form-item) {
    display: block;
  }

  .schema-form :deep(.el-form-item__label) {
    display: block;
    width: 100% !important;
    height: auto;
    margin-bottom: 6px;
    padding: 0;
    text-align: left;
    line-height: 1.4;
  }

  .schema-form :deep(.el-form-item__content) {
    display: block;
    margin-left: 0 !important;
  }

  .schema-form :deep(.el-radio-group) {
    display: grid;
    gap: 8px;
  }
}
</style>
