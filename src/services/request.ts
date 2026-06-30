import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { ElLoading, ElMessage } from 'element-plus'

import { i18n } from '@/locales'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface RetryConfig extends AxiosRequestConfig {
  retry?: number
  loading?: boolean
  _retryCount?: number
}

let loadingInstance: ReturnType<typeof ElLoading.service> | null = null
let loadingCount = 0

function openLoading() {
  loadingCount += 1
  if (!loadingInstance) {
    loadingInstance = ElLoading.service({
      text: i18n.global.t('request.loading'),
      background: 'rgba(255, 255, 255, 0.45)',
    })
  }
}

function closeLoading() {
  loadingCount = Math.max(loadingCount - 1, 0)
  if (loadingCount === 0) {
    loadingInstance?.close()
    loadingInstance = null
  }
}

function readToken() {
  const raw = localStorage.getItem('enterprise-admin-auth')
  if (!raw) return ''

  try {
    return (JSON.parse(raw) as { token?: string }).token || ''
  } catch {
    return ''
  }
}

export const request = axios.create({
  baseURL: '/api',
  timeout: 12000,
})

request.interceptors.request.use((config) => {
  const nextConfig = config as RetryConfig

  const token = readToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (nextConfig.loading !== false) {
    openLoading()
  }

  return config
})

request.interceptors.response.use(
  (response) => {
    const config = response.config as RetryConfig
    if (config.loading !== false) closeLoading()

    const body = response.data as ApiResponse<unknown>
    if (body.code !== 0) {
      ElMessage.error(body.message || i18n.global.t('request.businessError'))
      return Promise.reject(new Error(body.message))
    }

    return body.data as never
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    if (config?.loading !== false) closeLoading()

    if (config && (config.retry || 0) > (config._retryCount || 0)) {
      config._retryCount = (config._retryCount || 0) + 1
      await new Promise((resolve) => window.setTimeout(resolve, 300 * config._retryCount!))
      return request(config)
    }

    ElMessage.error(error.message || i18n.global.t('request.requestError'))
    return Promise.reject(error)
  },
)

export function get<T>(url: string, config?: RetryConfig) {
  return request.get<unknown, T>(url, config)
}

export function post<T>(url: string, data?: unknown, config?: RetryConfig) {
  return request.post<unknown, T>(url, data, config)
}
