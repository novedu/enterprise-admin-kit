import { computed } from 'vue'

import { useAuthStore } from '@/store'
import { hasButtonPermission, hasFieldPermission } from '@/utils/permission'

export function usePermission() {
  const auth = useAuthStore()

  return {
    role: computed(() => auth.role),
    canButton: hasButtonPermission,
    canField: hasFieldPermission,
  }
}
