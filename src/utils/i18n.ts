type TranslateFunction = (key: string, ...args: unknown[]) => string | number

export function translateWithFallback(t: TranslateFunction, key?: string, fallback = '') {
  if (!key) return fallback
  const translated = String(t(key))
  return translated === key ? fallback : translated
}
