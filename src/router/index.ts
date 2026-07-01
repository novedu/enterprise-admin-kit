import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/store'

import { asyncChildren, constantRoutes, notFoundRoute, rootRoute } from './routes'

const dynamicRouteNames = new Set<string>()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, rootRoute, notFoundRoute],
})

export function setupDynamicRoutes(routeNames: string[]) {
  const allowed = asyncChildren.filter((route) => {
    if (route.redirect) return true
    return route.name && routeNames.includes(String(route.name))
  })

  allowed.forEach((route) => {
    if (route.name && !router.hasRoute(route.name)) {
      router.addRoute('Root', route)
      dynamicRouteNames.add(String(route.name))
    }
  })
}

export function resetDynamicRoutes() {
  dynamicRouteNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
  dynamicRouteNames.clear()
}

router.beforeEach((to) => {
  const auth = useAuthStore()
  const maybeDynamicRoute = to.name === 'NotFound'
  auth.hydrateRoutes()

  if (auth.isLoggedIn && maybeDynamicRoute && router.resolve(to.fullPath).name !== 'NotFound') {
    return to.fullPath
  }

  if (to.path === '/login' && auth.isLoggedIn) {
    return '/dashboard'
  }

  if (to.meta.public) {
    return true
  }

  if (!auth.isLoggedIn) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (
    to.name &&
    !auth.permissions.routes.includes(String(to.name)) &&
    !to.matched.some(
      (record) => record.name && auth.permissions.routes.includes(String(record.name)),
    ) &&
    ![
      'Workspaces',
      'WorkspaceDetail',
      'Applications',
      'ApplicationDetail',
      'Conversations',
    ].includes(String(to.name)) &&
    to.name !== 'Root' &&
    to.name !== 'NotFound'
  ) {
    return '/dashboard'
  }

  return true
})

export default router
