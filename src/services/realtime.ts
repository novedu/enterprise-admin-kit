import { ElNotification } from 'element-plus'

import { i18n } from '@/locales'
import { useNotificationStore } from '@/store'
import type { RealtimeNotification } from '@/types/notification'

const templates = [
  {
    titleKey: 'notification.robotOnline',
    contentKey: 'notification.robotOnlineContent',
    level: 'success',
  },
  {
    titleKey: 'notification.orderCreated',
    contentKey: 'notification.orderCreatedContent',
    level: 'info',
  },
  {
    titleKey: 'notification.deviceOffline',
    contentKey: 'notification.deviceOfflineContent',
    level: 'warning',
  },
  {
    titleKey: 'notification.inventoryAlert',
    contentKey: 'notification.inventoryAlertContent',
    level: 'danger',
  },
] as const

class RealtimeService {
  private timer: number | null = null

  start() {
    if (this.timer) return
    this.timer = window.setInterval(() => this.emit(), 9000)
    window.setTimeout(() => this.emit(), 1500)
  }

  stop() {
    if (this.timer) {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }

  emit() {
    const store = useNotificationStore()
    const template = templates[Math.floor(Math.random() * templates.length)]
    const t = i18n.global.t
    const item: RealtimeNotification = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: t(template.titleKey),
      content: t(template.contentKey),
      level: template.level,
      createdAt: new Date().toLocaleTimeString(),
    }

    store.push(item)
    ElNotification({
      title: item.title,
      message: item.content,
      type: item.level === 'danger' ? 'error' : item.level,
      duration: 3600,
      position: 'top-right',
    })
  }
}

export const realtimeService = new RealtimeService()
