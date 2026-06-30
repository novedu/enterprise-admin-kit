import { defineStore } from 'pinia'

import { login as loginApi } from '@/api/auth'
import router, { resetDynamicRoutes, setupDynamicRoutes } from '@/router'
import type { LoginPayload, LoginResult, MenuItem, PermissionSet, RoleCode } from '@/types/auth'

interface AuthState {
  token: string
  role: RoleCode | ''
  permissions: PermissionSet
  menu: MenuItem[]
  profile: LoginResult['profile'] | null
}

function createEmptyState(): AuthState {
  return {
    token: '',
    role: '',
    permissions: {
      buttons: [],
      fields: [],
      routes: [],
    },
    menu: [],
    profile: null,
  }
}

function createAuthState(): AuthState {
  const persisted = localStorage.getItem('enterprise-admin-auth')
  return persisted ? JSON.parse(persisted) : createEmptyState()
}

export const useAuthStore = defineStore('auth', {
  state: createAuthState,
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
  },
  actions: {
    persist() {
      localStorage.setItem('enterprise-admin-auth', JSON.stringify(this.$state))
    },
    async login(payload: LoginPayload) {
      const result = await loginApi(payload)
      this.token = result.token
      this.role = result.role
      this.permissions = result.permissions
      this.menu = result.menu
      this.profile = result.profile
      this.persist()
      setupDynamicRoutes(result.permissions.routes)
      await router.replace('/')
    },
    hydrateRoutes() {
      if (this.token) {
        setupDynamicRoutes(this.permissions.routes)
      }
    },
    logout() {
      this.$patch(createEmptyState())
      resetDynamicRoutes()
      localStorage.removeItem('enterprise-admin-auth')
      router.replace('/login')
    },
  },
})
