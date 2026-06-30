<template>
  <el-container class="admin-layout" :class="{ 'is-collapsed': collapsed }">
    <el-aside class="admin-sidebar" width="232px">
      <div class="brand">
        <div class="brand-mark">E</div>
        <div>
          <strong>{{ t('layout.appName') }}</strong>
          <span>{{ t('layout.appSubtitle') }}</span>
        </div>
      </div>

      <el-menu
        :default-active="route.path"
        router
        class="side-menu"
        background-color="transparent"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
      >
        <el-menu-item v-for="item in auth.menu" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="resolveIcon(item.icon)" />
          </el-icon>
          <span>{{ item.titleKey ? t(item.titleKey) : item.title }}</span>
        </el-menu-item>
      </el-menu>

      <button class="collapse-trigger" type="button" @click="collapsed = !collapsed">
        <el-icon>
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </button>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <div class="breadcrumb">
            <span>{{ t('layout.appName') }}</span>
            <span>/</span>
            <strong>{{ pageTitle }}</strong>
          </div>
          <span>{{ auth.profile?.department }}</span>
        </div>

        <div class="header-actions">
          <el-popover
            placement="bottom-end"
            :width="'min(360px, calc(100vw - 24px))'"
            trigger="click"
          >
            <template #reference>
              <el-badge
                :value="notifications.unreadCount || ''"
                :hidden="!notifications.unreadCount"
              >
                <el-button :icon="Bell" circle />
              </el-badge>
            </template>
            <div class="notification-head">
              <strong>{{ t('layout.notifications') }}</strong>
              <el-button link type="primary" @click="notifications.markAllRead()">
                {{ t('layout.readAll') }}
              </el-button>
            </div>
            <div class="notification-list">
              <div v-for="item in notifications.list" :key="item.id" class="notification-item">
                <span class="status-dot" :class="item.level" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.content }}</p>
                  <time>{{ item.createdAt }}</time>
                </div>
              </div>
              <el-empty
                v-if="!notifications.list.length"
                :description="t('common.noNotifications')"
              />
            </div>
          </el-popover>

          <el-select v-model="locale" class="locale-select" :aria-label="t('layout.language')">
            <el-option
              v-for="item in localeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-button :icon="isDark ? Sunny : Moon" circle @click="toggleTheme" />

          <el-dropdown>
            <button class="profile-trigger">
              <el-avatar :size="32" :src="auth.profile?.avatar" />
              <span>{{ auth.profile?.name }}</span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">{{
                  t('common.profile')
                }}</el-dropdown-item>
                <el-dropdown-item divided @click="auth.logout()">{{
                  t('common.logout')
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="admin-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import {
  Avatar,
  Bell,
  ChatDotRound,
  DataLine,
  Document,
  Expand,
  Fold,
  Lock,
  Monitor,
  Moon,
  Setting,
  Sunny,
  User,
} from '@element-plus/icons-vue'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore, useNotificationStore } from '@/store'

const auth = useAuthStore()
const notifications = useNotificationStore()
const route = useRoute()
const { t } = useI18n()
const { locale, localeOptions } = useLocale()
const { isDark, toggleTheme } = useTheme()
const collapsed = ref(localStorage.getItem('enterprise-admin-sidebar') === 'collapsed')

const iconMap = {
  Avatar,
  Bell,
  ChatDotRound,
  DataLine,
  Document,
  Expand,
  Fold,
  Lock,
  Monitor,
  Moon,
  Setting,
  Sunny,
  User,
}

const resolveIcon = (name = 'DataLine') => iconMap[name as keyof typeof iconMap] || DataLine
const pageTitle = computed(() => {
  const titleKey = route.meta.titleKey
  return typeof titleKey === 'string'
    ? t(titleKey)
    : String(route.meta.title || 'Enterprise Admin Kit')
})

watchEffect(() => {
  localStorage.setItem('enterprise-admin-sidebar', collapsed.value ? 'collapsed' : 'expanded')
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--app-bg);
}

.admin-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--app-sidebar);
  transition: width 0.2s ease;
}

.admin-layout.is-collapsed .admin-sidebar {
  width: 72px !important;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 64px;
  padding: 0 18px;
  color: white;
}

.admin-layout.is-collapsed .brand div:last-child,
.admin-layout.is-collapsed .side-menu span {
  display: none;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent), var(--app-sidebar-active);
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
}

.brand span {
  display: block;
  margin-top: 2px;
  color: var(--app-sidebar-subtle);
  font-size: 12px;
}

.side-menu {
  flex: 1;
  border-right: none;
  padding: 8px 8px 12px;
}

.side-menu :deep(.el-menu-item) {
  height: 42px;
  margin: 4px 0;
  border-radius: 8px;
}

.side-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08);
}

.side-menu :deep(.el-menu-item.is-active) {
  background: var(--app-sidebar-active);
  box-shadow: inset 3px 0 0 rgba(255, 255, 255, 0.78);
}

.collapse-trigger {
  display: grid;
  width: calc(100% - 20px);
  height: 36px;
  margin: 0 10px 12px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--app-sidebar-text);
  cursor: pointer;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  gap: 12px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-header);
  box-shadow: 0 1px 0 var(--app-border-subtle);
}

.header-left {
  min-width: 0;
}

.header-left span,
.admin-header span {
  display: block;
  margin-top: 3px;
  color: var(--app-muted);
  font-size: 12px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: var(--app-muted);
  font-size: 12px;
}

.breadcrumb strong {
  overflow: hidden;
  color: var(--app-heading);
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.locale-select {
  width: 104px;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: var(--app-text);
  cursor: pointer;
}

.admin-main {
  min-height: calc(100vh - 60px);
  padding: 24px;
  background:
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--app-primary) 9%, transparent),
      transparent 28rem
    ),
    var(--app-bg);
}

.notification-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.notification-list {
  max-height: 360px;
  overflow: auto;
}

.notification-item {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--app-border);
}

.notification-item p {
  margin: 4px 0;
  color: var(--app-muted);
}

.notification-item time {
  color: var(--app-muted);
  font-size: 12px;
}

.admin-header :deep(.el-button.is-circle) {
  flex: 0 0 auto;
}

@media (max-width: 780px) {
  .admin-layout {
    display: block;
    padding-bottom: 68px;
  }

  .admin-sidebar {
    position: fixed;
    top: auto;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    width: 100% !important;
    height: 68px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    border-right: 0;
  }

  .brand,
  .collapse-trigger,
  .side-menu span {
    display: none;
  }

  .side-menu {
    display: flex;
    width: 100%;
    overflow-x: auto;
    padding: 8px;
    scrollbar-width: none;
  }

  .side-menu::-webkit-scrollbar {
    display: none;
  }

  .side-menu :deep(.el-menu-item) {
    display: flex;
    flex: 0 0 52px;
    justify-content: center;
    height: 52px;
    margin: 0 3px;
    padding: 0;
  }

  .side-menu :deep(.el-menu-item .el-icon) {
    margin: 0;
    font-size: 20px;
  }

  .side-menu :deep(.el-menu-item.is-active) {
    box-shadow: inset 0 -3px 0 rgba(255, 255, 255, 0.78);
  }

  .admin-header {
    flex-wrap: wrap;
    height: auto;
    min-height: 62px;
    padding: 10px 12px;
  }

  .header-actions {
    max-width: 100%;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
  }

  .header-actions::-webkit-scrollbar {
    display: none;
  }

  .locale-select {
    width: 96px;
  }

  .profile-trigger span {
    display: none;
  }

  .admin-main {
    min-height: calc(100vh - 130px);
    padding: 12px;
  }

  .notification-list {
    max-height: min(360px, 62vh);
  }
}

@media (max-width: 420px) {
  .breadcrumb span:first-child,
  .breadcrumb span:nth-child(2),
  .header-left > span {
    display: none;
  }

  .admin-header {
    align-items: flex-start;
  }
}
</style>
