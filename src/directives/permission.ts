import type { App, DirectiveBinding } from 'vue'

import { hasButtonPermission } from '@/utils/permission'

export function registerPermissionDirective(app: App) {
  app.directive('permission', {
    mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
      if (!hasButtonPermission(binding.value)) {
        el.parentElement?.removeChild(el)
      }
    },
    updated(el: HTMLElement, binding: DirectiveBinding<string>) {
      el.style.display = hasButtonPermission(binding.value) ? '' : 'none'
    },
  })
}
