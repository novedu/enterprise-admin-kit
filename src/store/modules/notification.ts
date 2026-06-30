import { defineStore } from 'pinia'

import type { RealtimeNotification } from '@/types/notification'

interface NotificationState {
  list: RealtimeNotification[]
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    list: [],
  }),
  getters: {
    unreadCount: (state) => state.list.filter((item) => !item.read).length,
  },
  actions: {
    push(item: RealtimeNotification) {
      this.list.unshift(item)
      this.list = this.list.slice(0, 20)
    },
    markAllRead() {
      this.list = this.list.map((item) => ({ ...item, read: true }))
    },
  },
})
