<template>
  <div class="not-found">
    <h1>404</h1>
    <p>{{ t('page.notFound.description') }}</p>
    <el-button type="primary" @click="$router.replace('/')">{{ t('page.notFound.backHome') }}</el-button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.not-found {
  display: grid;
  min-height: 100vh;
  place-content: center;
  text-align: center;
}

.not-found h1 {
  margin: 0;
  font-size: 72px;
}
</style>
