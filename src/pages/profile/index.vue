<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page.profile.title') }}</h1>
        <p class="page-subtitle">{{ t('page.profile.subtitle') }}</p>
      </div>
    </div>

    <div class="profile-grid">
      <div class="surface profile-card">
        <el-avatar :size="72" :src="auth.profile?.avatar" />
        <h2>{{ auth.profile?.name }}</h2>
        <p>{{ auth.profile?.department }}</p>
        <el-tag>{{ auth.role }}</el-tag>
      </div>

      <div class="surface permission-panel">
        <strong>{{ t('page.profile.routePermission') }}</strong>
        <div class="tag-list">
          <el-tag v-for="item in auth.permissions.routes" :key="item" type="info">{{
            item
          }}</el-tag>
        </div>
        <strong>{{ t('page.profile.buttonPermission') }}</strong>
        <div class="tag-list">
          <el-tag v-for="item in auth.permissions.buttons" :key="item">{{ item }}</el-tag>
          <el-empty
            v-if="!auth.permissions.buttons.length"
            :description="t('page.profile.noButtonPermissions')"
          />
        </div>
        <strong>{{ t('page.profile.fieldPermission') }}</strong>
        <div class="tag-list">
          <el-tag v-for="item in auth.permissions.fields" :key="item" type="success">{{
            item
          }}</el-tag>
          <el-empty
            v-if="!auth.permissions.fields.length"
            :description="t('page.profile.noFieldPermissions')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
}

.profile-card,
.permission-panel {
  padding: 22px;
}

.profile-card {
  text-align: center;
}

.profile-card h2 {
  margin: 14px 0 4px;
}

.profile-card p {
  color: var(--app-muted);
}

.permission-panel {
  display: grid;
  gap: 12px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-list :deep(.el-tag) {
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
}

@media (max-width: 820px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-card,
  .permission-panel {
    padding: 16px;
  }
}
</style>
