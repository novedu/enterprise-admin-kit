<template>
  <div class="table-page">
    <SearchForm
      v-if="tableSchema"
      v-model="query"
      :schema="tableSchema.search"
      @search="reload"
      @reset="reload"
    />

    <div class="table-panel surface">
      <div class="toolbar table-toolbar">
        <div>
          <h2 class="section-title">{{ title }}</h2>
          <span>{{ t('common.records', { count: pagination.total }) }}</span>
        </div>
        <div class="table-actions">
          <PermissionButton :icon="Download" :permission="`${schema}:export`" @click="exportData">
            {{ t('common.export') }}
          </PermissionButton>
          <PermissionButton
            type="primary"
            :icon="Plus"
            :permission="`${schema}:create`"
            @click="openCreate"
          >
            {{ t('common.new') }}
          </PermissionButton>
        </div>
      </div>

      <div v-if="!virtual" class="table-scroll">
        <el-table v-loading="loading" :data="rows" :row-key="tableSchema?.rowKey" border>
          <el-table-column type="index" width="56" />
          <el-table-column
            v-for="column in visibleColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="getColumnLabel(column)"
            :width="column.width"
            :min-width="column.minWidth"
          >
            <template #default="{ row }">
              <el-tag
                v-if="column.prop === 'status'"
                :type="row.status === 'active' ? 'success' : 'info'"
              >
                {{ getCellText(row, column) }}
              </el-tag>
              <span v-else>{{ getCellText(row, column) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('common.actions')" fixed="right" width="170">
            <template #default="{ row }">
              <PermissionButton
                link
                type="primary"
                :icon="Edit"
                :permission="`${schema}:edit`"
                @click="openEdit(row)"
              >
                {{ t('common.edit') }}
              </PermissionButton>
              <PermissionButton
                link
                type="danger"
                :icon="Delete"
                :permission="`${schema}:delete`"
                @click="remove(row)"
              >
                {{ t('common.delete') }}
              </PermissionButton>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-else v-loading="loading" class="virtual-table">
        <div class="virtual-table__header">
          <div class="virtual-table__cell virtual-table__index">#</div>
          <div
            v-for="column in visibleColumns"
            :key="column.prop"
            class="virtual-table__cell"
            :style="getColumnStyle(column)"
          >
            {{ getColumnLabel(column) }}
          </div>
          <div class="virtual-table__cell virtual-table__actions">{{ t('common.actions') }}</div>
        </div>

        <VirtualList
          ref="virtualListRef"
          :items="rows"
          :height="virtualHeight"
          :row-height="virtualRowHeight"
          :buffer="virtualBuffer"
          :item-key="tableSchema?.rowKey"
          @reach-end="loadMore"
        >
          <template #default="{ item: row, index }">
            <div class="virtual-table__row" :style="{ height: `${virtualRowHeight}px` }">
              <div class="virtual-table__cell virtual-table__index">{{ index + 1 }}</div>
              <div
                v-for="column in visibleColumns"
                :key="column.prop"
                class="virtual-table__cell"
                :style="getColumnStyle(column)"
              >
                <el-tag
                  v-if="column.prop === 'status'"
                  :type="row.status === 'active' ? 'success' : 'info'"
                >
                  {{ getCellText(row, column) }}
                </el-tag>
                <span v-else>{{ getCellText(row, column) }}</span>
              </div>
              <div class="virtual-table__cell virtual-table__actions">
                <PermissionButton
                  link
                  type="primary"
                  :icon="Edit"
                  :permission="`${schema}:edit`"
                  @click="openEdit(row)"
                >
                  {{ t('common.edit') }}
                </PermissionButton>
                <PermissionButton
                  link
                  type="danger"
                  :icon="Delete"
                  :permission="`${schema}:delete`"
                  @click="remove(row)"
                >
                  {{ t('common.delete') }}
                </PermissionButton>
              </div>
            </div>
          </template>
        </VirtualList>
      </div>

      <div v-if="!virtual || !virtualInfinite" class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.mode === 'create' ? t('common.create') : t('common.edit')"
      width="min(560px, calc(100vw - 32px))"
    >
      <SchemaForm v-if="tableSchema" ref="formRef" v-model="formModel" :schema="tableSchema.form" />
      <template #footer>
        <el-button @click="dialog.visible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submit">{{ t('common.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Delete, Download, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { createRow, deleteRow, getPage, tablePageCacheKey, updateRow } from '@/api/table'
import { getTableSchema, tableSchemaCacheKey } from '@/api/schema'
import { useRequestCache } from '@/composables/useRequestCache'
import PermissionButton from '@/components/PermissionButton/index.vue'
import SchemaForm from '@/components/SchemaForm/index.vue'
import SearchForm from '@/components/SearchForm/index.vue'
import VirtualList from '@/components/VirtualList/index.vue'
import type { TableColumn, TableSchema } from '@/types/table'
import { translateWithFallback } from '@/utils/i18n'
import { hasFieldPermission } from '@/utils/permission'

const props = withDefaults(
  defineProps<{
    api: string
    schema: string
    title: string
    virtual?: boolean
    virtualHeight?: number
    virtualRowHeight?: number
    virtualBuffer?: number
    virtualInfinite?: boolean
  }>(),
  {
    virtual: false,
    virtualHeight: 520,
    virtualRowHeight: 52,
    virtualBuffer: 8,
    virtualInfinite: false,
  },
)

const loading = ref(false)
const { t } = useI18n()
const tableSchema = ref<TableSchema>()
const rows = ref<Record<string, unknown>[]>([])
const query = ref<Record<string, unknown>>({})
const formModel = ref<Record<string, unknown>>({})
const formRef = ref<InstanceType<typeof SchemaForm>>()
const virtualListRef = ref<{ scrollToTop: () => void }>()
const pagination = reactive({
  page: 1,
  pageSize: props.virtual ? 100 : 10,
  total: 0,
})
const dialog = reactive({
  visible: false,
  mode: 'create' as 'create' | 'edit',
})

const visibleColumns = computed(() =>
  (tableSchema.value?.columns || []).filter((column) => hasFieldPermission(column.permission)),
)
const pageParams = computed(() => ({
  ...query.value,
  page: pagination.page,
  pageSize: pagination.pageSize,
}))
const pageRequest = useRequestCache(
  () => tablePageCacheKey(props.api, pageParams.value),
  () => getPage<Record<string, unknown>>(props.api, pageParams.value),
  {
    immediate: false,
    staleTime: 12_000,
    cacheTime: 2 * 60_000,
  },
)
const schemaRequest = useRequestCache(
  () => tableSchemaCacheKey(props.schema),
  () => getTableSchema(props.schema),
  {
    immediate: false,
    staleTime: 5 * 60_000,
    cacheTime: 15 * 60_000,
  },
)

async function loadSchema() {
  const schema = await schemaRequest.execute()
  if (schema) {
    tableSchema.value = schema
  }
}

async function loadData() {
  loading.value = true
  try {
    const result = await pageRequest.execute()
    if (!result) return
    rows.value = result.list
    pagination.total = result.total
    virtualListRef.value?.scrollToTop()
  } finally {
    loading.value = false
  }
}

async function reload() {
  pagination.page = 1
  await loadData()
}

async function loadMore() {
  if (!props.virtualInfinite || loading.value || rows.value.length >= pagination.total) return

  loading.value = true
  try {
    const nextPage = pagination.page + 1
    const nextParams = {
      ...query.value,
      page: nextPage,
      pageSize: pagination.pageSize,
    }
    const result = await getPage<Record<string, unknown>>(props.api, nextParams)
    rows.value = rows.value.concat(result.list)
    pagination.page = nextPage
    pagination.total = result.total
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialog.mode = 'create'
  formModel.value = {}
  dialog.visible = true
}

function openEdit(row: Record<string, unknown>) {
  dialog.mode = 'edit'
  formModel.value = { ...row }
  dialog.visible = true
}

async function submit() {
  await formRef.value?.validate()
  if (dialog.mode === 'create') {
    await createRow(props.api, formModel.value)
  } else {
    await updateRow(props.api, formModel.value)
  }
  dialog.visible = false
  ElMessage.success(t('common.saved'))
  await loadData()
}

async function remove(row: Record<string, unknown>) {
  await ElMessageBox.confirm(`${t('common.delete')}?`, t('common.confirm'), {
    type: 'warning',
  })
  await deleteRow(props.api, Number(row.id))
  ElMessage.success(t('common.deleted'))
  await loadData()
}

function exportData() {
  const csv = [visibleColumns.value.map((column) => getColumnLabel(column)).join(',')]
    .concat(
      rows.value.map((row) =>
        visibleColumns.value.map((column) => JSON.stringify(row[column.prop] ?? '')).join(','),
      ),
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${props.schema}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

function getColumnStyle(column: TableColumn) {
  const width = column.width ? `${column.width}px` : undefined
  const minWidth = column.minWidth ? `${column.minWidth}px` : '120px'
  return {
    flex: width ? `0 0 ${width}` : '1 1 0',
    width,
    minWidth,
  }
}

function getColumnLabel(column: TableColumn) {
  return translateWithFallback(t, column.labelKey, column.label)
}

function getCellText(row: Record<string, unknown>, column: TableColumn) {
  const value = row[column.prop]
  if (typeof value !== 'string') return String(value ?? '')

  return translateWithFallback(t, `schema.${props.schema}.option.${value}`, value)
}

onMounted(async () => {
  await loadSchema()
  await loadData()
})
</script>

<style scoped>
.table-page {
  display: grid;
  gap: 16px;
}

.table-panel {
  overflow: hidden;
  padding: 0;
}

.table-toolbar {
  border-bottom: 1px solid var(--app-border);
  margin-bottom: 0;
  padding: 14px 16px;
  background: linear-gradient(180deg, var(--app-panel), var(--app-panel-soft));
}

.table-toolbar span {
  display: block;
  margin-top: 3px;
  color: var(--app-muted);
  font-size: 12px;
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.table-panel :deep(.el-table) {
  min-width: 720px;
  border-right: 0;
  border-left: 0;
}

.table-scroll {
  overflow-x: auto;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--app-border);
  padding: 12px 16px;
}

.pagination-wrap :deep(.el-pagination) {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.virtual-table {
  overflow-x: auto;
  padding: 0 16px 16px;
}

.virtual-table__header,
.virtual-table__row {
  display: flex;
  min-width: 760px;
}

.virtual-table__header {
  border: 1px solid var(--app-border);
  background: var(--app-panel-soft);
  color: var(--app-muted);
  font-weight: 600;
}

.virtual-table__header .virtual-table__cell {
  height: 44px;
}

.virtual-table__row {
  border-right: 1px solid var(--app-border);
  border-bottom: 1px solid var(--app-border);
  border-left: 1px solid var(--app-border);
  background: var(--app-panel);
}

.virtual-table__row:hover {
  background: var(--app-panel-soft);
}

.virtual-table__cell {
  display: flex;
  align-items: center;
  overflow: hidden;
  min-width: 120px;
  padding: 0 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.virtual-table__cell span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.virtual-table__index {
  flex: 0 0 56px;
  justify-content: center;
  min-width: 56px;
  color: var(--app-muted);
}

.virtual-table__actions {
  flex: 0 0 170px;
  min-width: 170px;
}

@media (max-width: 640px) {
  .table-toolbar {
    display: grid;
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .table-actions,
  .table-actions :deep(.el-button) {
    width: 100%;
  }

  .table-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .pagination-wrap {
    justify-content: flex-start;
    padding: 12px;
  }

  .pagination-wrap :deep(.el-pagination) {
    justify-content: flex-start;
  }

  .virtual-table {
    padding: 0 12px 12px;
  }
}
</style>
