import { useAuthStore } from '@/store'

export function hasButtonPermission(code?: string) {
  if (!code) return true
  const auth = useAuthStore()
  return auth.permissions.buttons.includes(code)
}

export function hasFieldPermission(code?: string) {
  if (!code) return true
  const auth = useAuthStore()
  return auth.permissions.fields.includes(code)
}

export function hasRoutePermission(name?: string) {
  if (!name) return true
  const auth = useAuthStore()
  return auth.permissions.routes.includes(name)
}
