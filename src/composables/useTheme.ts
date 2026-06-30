import { computed, ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const themeStorageKey = 'enterprise-admin-theme'
const isBrowser = typeof window !== 'undefined'

function getInitialTheme(): ThemeMode {
  if (!isBrowser) return 'light'

  const saved = localStorage.getItem(themeStorageKey) as ThemeMode | null
  if (saved === 'light' || saved === 'dark') return saved

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const themeState = ref<ThemeMode>(getInitialTheme())

function applyTheme(theme: ThemeMode) {
  themeState.value = theme
  if (!isBrowser) return

  document.documentElement.dataset.theme = theme
  localStorage.setItem(themeStorageKey, theme)
}

applyTheme(themeState.value)

export function useTheme() {
  const theme = computed({
    get: () => themeState.value,
    set: (value: ThemeMode) => applyTheme(value),
  })

  const isDark = computed(() => theme.value === 'dark')

  function setTheme(value: ThemeMode) {
    theme.value = value
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
