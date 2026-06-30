<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page.user.title') }}</h1>
        <p class="page-subtitle">{{ t('page.user.subtitle') }}</p>
      </div>
    </div>

    <TablePage api="/user" schema="user" :title="t('table.user.title')" virtual virtual-infinite />
  </div>
</template>

<script setup lang="ts">
import TablePage from '@/components/TablePage/index.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
