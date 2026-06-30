export type RealtimeLevel = 'success' | 'warning' | 'danger' | 'info'

export interface RealtimeNotification {
  id: string
  title: string
  content: string
  level: RealtimeLevel
  createdAt: string
  read?: boolean
}
