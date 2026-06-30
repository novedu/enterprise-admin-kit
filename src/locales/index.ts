import { createI18n } from 'vue-i18n'

import enUS from './en-US'
import zhCN from './zh-CN'

export const localeStorageKey = 'enterprise-admin-locale'
export const localeOptions = [
  { label: 'English', value: 'en-US' },
  { label: '中文', value: 'zh-CN' },
] as const

export type LocaleCode = (typeof localeOptions)[number]['value']

const messages = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

function getInitialLocale(): LocaleCode {
  const saved = localStorage.getItem(localeStorageKey) as LocaleCode | null
  if (saved && saved in messages) return saved

  return navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: 'en-US',
  messages,
})
