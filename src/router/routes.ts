import type { RouteRecordRaw } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      title: 'Login',
      public: true,
    },
  },
]

export const asyncChildren: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/index.vue'),
    meta: {
      title: 'Dashboard',
      titleKey: 'menu.dashboard',
      icon: 'DataLine',
    },
  },
  {
    path: 'user',
    name: 'User',
    component: () => import('@/pages/user/index.vue'),
    meta: {
      title: 'User Management',
      titleKey: 'menu.user',
      icon: 'User',
    },
  },
  {
    path: 'role',
    name: 'Role',
    component: () => import('@/pages/role/index.vue'),
    meta: {
      title: 'Role Management',
      titleKey: 'menu.role',
      icon: 'Lock',
    },
  },
  {
    path: 'ai',
    name: 'AI',
    component: () => import('@/pages/ai/index.vue'),
    redirect: '/ai/provider',
    meta: {
      title: 'AI Admin Console',
      titleKey: 'menu.ai',
      icon: 'ChatDotRound',
    },
    children: [
      {
        path: 'provider',
        name: 'AIProvider',
        component: () => import('@/pages/ai/provider/index.vue'),
        meta: {
          title: 'Provider Center',
          titleKey: 'page.ai.tabs.provider',
        },
      },
      {
        path: 'knowledge',
        name: 'AIKnowledge',
        component: () => import('@/pages/ai/knowledge/index.vue'),
        meta: {
          title: 'Knowledge Base',
          titleKey: 'page.ai.tabs.knowledge',
        },
      },
      {
        path: 'prompt',
        name: 'AIPrompt',
        component: () => import('@/pages/ai/prompt/index.vue'),
        meta: {
          title: 'Prompt Studio',
          titleKey: 'page.ai.tabs.prompt',
        },
      },
      {
        path: 'observability',
        name: 'AIObservability',
        component: () => import('@/pages/ai/observability/index.vue'),
        meta: {
          title: 'Observability',
          titleKey: 'page.ai.tabs.observability',
        },
      },
      {
        path: 'settings',
        name: 'AISettings',
        component: () => import('@/pages/ai/settings/index.vue'),
        meta: {
          title: 'Settings Center',
          titleKey: 'page.ai.tabs.settings',
        },
      },
    ],
  },
  {
    path: 'schema-editor',
    name: 'SchemaEditor',
    component: () => import('@/pages/schema-editor/index.vue'),
    meta: {
      title: 'Schema Editor',
      titleKey: 'menu.schemaEditor',
      icon: 'Document',
    },
  },
  {
    path: 'monitor',
    name: 'Monitor',
    component: () => import('@/pages/monitor/index.vue'),
    meta: {
      title: 'Realtime Monitor',
      titleKey: 'menu.monitor',
      icon: 'Monitor',
    },
  },
  {
    path: 'setting',
    name: 'Setting',
    component: () => import('@/pages/setting/index.vue'),
    meta: {
      title: 'System Setting',
      titleKey: 'menu.setting',
      icon: 'Setting',
    },
  },
  {
    path: 'profile',
    name: 'Profile',
    component: () => import('@/pages/profile/index.vue'),
    meta: {
      title: 'Profile',
      titleKey: 'menu.profile',
      icon: 'Avatar',
    },
  },
]

export const rootRoute: RouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: '/dashboard',
  component: AdminLayout,
  children: [],
}

export const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/pages/not-found/index.vue'),
}
