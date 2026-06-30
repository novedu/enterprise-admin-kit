<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page.setting.title') }}</h1>
        <p class="page-subtitle">{{ t('page.setting.subtitle') }}</p>
      </div>
    </div>

    <section class="settings-grid">
      <div class="surface setting-panel">
        <div class="panel-head">
          <div>
            <h2 class="section-title">{{ t('page.setting.baseConfig') }}</h2>
            <p class="section-subtitle">{{ t('page.setting.baseConfigSubtitle') }}</p>
          </div>
        </div>

        <el-form class="setting-form" label-width="140px">
          <el-form-item :label="t('page.setting.systemName')">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item :label="t('page.setting.auditLog')">
            <el-switch v-model="form.audit" />
          </el-form-item>
          <el-form-item>
            <el-button v-permission="'setting:save'" type="primary" @click="save">{{
              t('common.save')
            }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <aside class="setting-aside">
        <div class="surface setting-card">
          <div>
            <h2 class="section-title">{{ t('page.setting.appearance') }}</h2>
            <p class="section-subtitle">{{ t('page.setting.appearanceSubtitle') }}</p>
          </div>
          <div class="setting-row">
            <span>{{ t('page.setting.theme') }}</span>
            <el-segmented v-model="theme" :options="themeOptions" />
          </div>
          <div class="setting-row">
            <span>{{ t('page.setting.language') }}</span>
            <el-select v-model="locale" class="setting-select">
              <el-option
                v-for="item in localeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="setting-row">
            <span>{{ t('page.setting.layoutDensity') }}</span>
            <el-segmented v-model="form.density" :options="densityOptions" />
          </div>
        </div>

        <div class="surface setting-card">
          <div>
            <h2 class="section-title">{{ t('page.setting.security') }}</h2>
            <p class="section-subtitle">{{ t('page.setting.securitySubtitle') }}</p>
          </div>
          <div class="security-list">
            <div>
              <span>{{ t('page.setting.sessionTimeout') }}</span>
              <strong>{{ t('page.setting.sessionTimeoutValue') }}</strong>
            </div>
            <div>
              <span>{{ t('page.setting.permissionMode') }}</span>
              <strong>{{ t('page.setting.permissionModeValue') }}</strong>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { theme } = useTheme()
const { locale, localeOptions } = useLocale()

const form = reactive({
  name: 'Enterprise Admin Kit',
  audit: true,
  density: 'default',
})
const themeOptions = computed(() => [
  { label: t('page.setting.themeLight'), value: 'light' },
  { label: t('page.setting.themeDark'), value: 'dark' },
])
const densityOptions = computed(() => [
  { label: t('page.setting.layoutDensityCompact'), value: 'compact' },
  { label: t('page.setting.layoutDensityDefault'), value: 'default' },
  { label: t('page.setting.layoutDensityLoose'), value: 'loose' },
])

function save() {
  ElMessage.success(t('page.setting.saved'))
}
</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 16px;
  align-items: start;
}

.setting-panel {
  padding: 22px;
}

.panel-head {
  margin-bottom: 20px;
}

.setting-aside {
  display: grid;
  gap: 16px;
}

.setting-card {
  display: grid;
  gap: 18px;
  padding: 18px;
}

.setting-row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.setting-row span,
.security-list span {
  color: var(--app-muted);
  font-size: 13px;
}

.setting-select {
  width: 100%;
}

.security-list {
  display: grid;
  gap: 10px;
}

.security-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--app-border-subtle);
  border-radius: 8px;
  padding: 12px;
  background: var(--app-panel-soft);
}

@media (max-width: 1080px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .setting-panel,
  .setting-card {
    padding: 14px;
  }

  .setting-form :deep(.el-form-item) {
    display: block;
  }

  .setting-form :deep(.el-form-item__label) {
    display: block;
    width: 100% !important;
    height: auto;
    margin-bottom: 6px;
    padding: 0;
    text-align: left;
    line-height: 1.4;
  }

  .setting-form :deep(.el-form-item__content) {
    display: block;
    margin-left: 0 !important;
  }

  .setting-form :deep(.el-button) {
    width: 100%;
  }

  .setting-row {
    grid-template-columns: 1fr;
  }

  .setting-row :deep(.el-segmented) {
    width: 100%;
  }

  .security-list div {
    display: grid;
    justify-content: stretch;
  }
}
</style>
