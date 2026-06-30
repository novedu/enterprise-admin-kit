import type { MenuItem } from '@/types/auth'

export function flattenMenu(menu: MenuItem[]): MenuItem[] {
  return menu.flatMap((item) => [item, ...(item.children ? flattenMenu(item.children) : [])])
}
