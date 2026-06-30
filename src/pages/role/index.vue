<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page.role.title') }}</h1>
        <p class="page-subtitle">{{ t('page.role.subtitle') }}</p>
      </div>
    </div>

    <TablePage api="/role" schema="role" :title="t('table.role.title')" />
  </div>
</template>

<script setup lang="ts">
import TablePage from '@/components/TablePage/index.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
