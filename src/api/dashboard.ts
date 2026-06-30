import { get } from '@/services/request'

export interface DashboardData {
  metrics: Array<{
    label: string
    labelKey?: string
    value: string
    trend: string
    level: 'success' | 'warning' | 'danger' | 'info'
  }>
  server: {
    cpu: number
    memory: number
    network: number
    status: string
  }
  sales: Array<{
    date: string
    orders: number
    sales: number
  }>
}

export function getDashboard() {
  return get<DashboardData>('/dashboard', { loading: false, retry: 1 })
}

export const dashboardCacheKey = ['dashboard']
