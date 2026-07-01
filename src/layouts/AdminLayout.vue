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

      <div class="side-scroll">
        <div v-for="group in navigationGroups" :key="group.label" class="nav-group">
          <p>{{ group.label }}</p>
          <el-menu
            :default-active="route.path"
            router
            class="side-menu"
            background-color="transparent"
            text-color="#cbd5e1"
            active-text-color="#ffffff"
          >
            <el-menu-item v-for="item in group.items" :key="item.path" :index="item.path">
              <el-icon>
                <component :is="resolveIcon(item.icon)" />
              </el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </el-menu>
        </div>
      </div>

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
          <el-select
            v-model="selectedWorkspaceId"
            class="context-select"
            :loading="workspace.loading"
            @change="handleWorkspaceChange"
          >
            <el-option
              v-for="item in workspace.workspaceList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>

          <el-select
            v-model="selectedApplicationId"
            class="context-select"
            :loading="application.loading"
            @change="handleApplicationChange"
          >
            <el-option
              v-for="item in application.applicationList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>

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
  Connection,
  DataLine,
  Document,
  Expand,
  Fold,
  Grid,
  Lock,
  Monitor,
  Moon,
  Operation,
  Setting,
  Sunny,
  User,
} from '@element-plus/icons-vue'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'
import { useApplicationStore, useAuthStore, useNotificationStore, useWorkspaceStore } from '@/store'

const auth = useAuthStore()
const notifications = useNotificationStore()
const workspace = useWorkspaceStore()
const application = useApplicationStore()
const route = useRoute()
const { t } = useI18n()
const { locale, localeOptions } = useLocale()
const { isDark, toggleTheme } = useTheme()
const collapsed = ref(localStorage.getItem('enterprise-admin-sidebar') === 'collapsed')
const selectedWorkspaceId = ref('')
const selectedApplicationId = ref('')

const iconMap = {
  Avatar,
  Bell,
  ChatDotRound,
  Connection,
  DataLine,
  Document,
  Expand,
  Fold,
  Grid,
  Lock,
  Monitor,
  Moon,
  Operation,
  Setting,
  Sunny,
  User,
}

const resolveIcon = (name = 'DataLine') => iconMap[name as keyof typeof iconMap] || DataLine
const navigationGroups = computed(() => [
  {
    label: 'Home',
    items: [{ path: '/dashboard', title: t('menu.dashboard'), icon: 'DataLine' }],
  },
  {
    label: 'Workspace',
    items: [
      { path: '/workspaces', title: 'Workspaces', icon: 'Grid' },
      { path: '/applications', title: 'Applications', icon: 'Operation' },
    ],
  },
  {
    label: 'AI Studio',
    items: [
      { path: '/ai/provider', title: t('page.ai.tabs.provider'), icon: 'Connection' },
      { path: '/ai/knowledge', title: t('page.ai.tabs.knowledge'), icon: 'Document' },
      { path: '/ai/prompt', title: t('page.ai.tabs.prompt'), icon: 'ChatDotRound' },
    ],
  },
  {
    label: 'Runtime',
    items: [
      { path: '/conversations', title: 'Conversations', icon: 'ChatDotRound' },
      { path: '/ai/observability', title: t('page.ai.tabs.observability'), icon: 'Monitor' },
      { path: '/ai/settings', title: t('page.ai.tabs.settings'), icon: 'Setting' },
    ],
  },
  {
    label: 'Governance',
    items: [{ path: '/monitor', title: t('menu.monitor'), icon: 'Monitor' }],
  },
  {
    label: 'Admin',
    items: [
      { path: '/user', title: t('menu.user'), icon: 'User' },
      { path: '/role', title: t('menu.role'), icon: 'Lock' },
      { path: '/schema-editor', title: t('menu.schemaEditor'), icon: 'Document' },
      { path: '/setting', title: t('menu.setting'), icon: 'Setting' },
      { path: '/profile', title: t('menu.profile'), icon: 'Avatar' },
    ],
  },
])
const pageTitle = computed(() => {
  const titleKey = route.meta.titleKey
  return typeof titleKey === 'string'
    ? t(titleKey)
    : String(route.meta.title || 'Enterprise Admin Kit')
})

async function handleWorkspaceChange(value: string | number | boolean) {
  await workspace.switchWorkspace(String(value))
  selectedWorkspaceId.value = workspace.currentWorkspace?.id || ''
  await application.loadApplications(selectedWorkspaceId.value)
  selectedApplicationId.value = application.currentApplication?.id || ''
}

async function handleApplicationChange(value: string | number | boolean) {
  await application.switchApplication(String(value))
  selectedApplicationId.value = application.currentApplication?.id || ''
}

onMounted(async () => {
  await workspace.loadWorkspaces()
  selectedWorkspaceId.value = workspace.currentWorkspace?.id || ''
  await application.loadApplications(selectedWorkspaceId.value)
  selectedApplicationId.value = application.currentApplication?.id || ''
})

watch(
  () => workspace.currentWorkspace?.id,
  (id) => {
    selectedWorkspaceId.value = id || ''
  },
)

watch(
  () => application.currentApplication?.id,
  (id) => {
    selectedApplicationId.value = id || ''
  },
)

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
.admin-layout.is-collapsed .side-menu span,
.admin-layout.is-collapsed .nav-group p {
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

.side-scroll {
  flex: 1;
  overflow: auto;
  padding: 8px 8px 12px;
}

.nav-group {
  margin-bottom: 10px;
}

.nav-group p {
  margin: 12px 10px 6px;
  color: var(--app-sidebar-subtle);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.side-menu {
  border-right: none;
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

.context-select {
  width: 174px;
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
  .side-menu span,
  .nav-group p {
    display: none;
  }

  .side-scroll {
    display: flex;
    width: 100%;
    overflow-x: auto;
    padding: 8px;
    scrollbar-width: none;
  }

  .side-scroll::-webkit-scrollbar {
    display: none;
  }

  .nav-group {
    flex: 0 0 auto;
    margin-bottom: 0;
  }

  .side-menu {
    display: flex;
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

  .context-select {
    width: 150px;
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
