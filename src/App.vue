<template>
  <el-config-provider :locale="elementLocale">
    <RouterView />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'

const { elementLocale } = useLocale()
</script>
