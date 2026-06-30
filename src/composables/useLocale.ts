import enUS from 'element-plus/es/locale/lang/en'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import { computed } from 'vue'

import { i18n, localeOptions, localeStorageKey, type LocaleCode } from '@/locales'

const elementLocales = {
  'en-US': enUS,
  'zh-CN': zhCN,
}

export function useLocale() {
  const locale = computed({
    get: () => i18n.global.locale.value as LocaleCode,
    set: (value: LocaleCode) => {
      i18n.global.locale.value = value
      localStorage.setItem(localeStorageKey, value)
    },
  })

  const elementLocale = computed(() => elementLocales[locale.value])

  function setLocale(value: LocaleCode) {
    locale.value = value
  }

  return {
    locale,
    localeOptions,
    elementLocale,
    setLocale,
  }
}
