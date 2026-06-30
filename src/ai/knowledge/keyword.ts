const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with',
])

export function extractKeywords(text: string) {
  const keywords = text
    .toLowerCase()
    .match(/[\p{L}\p{N}_-]+/gu)
    ?.filter((word) => word.length > 1 && !STOP_WORDS.has(word))

  return Array.from(new Set(keywords ?? []))
}

export function getKeywordOverlap(left: string[], right: string[]) {
  const rightSet = new Set(right)

  return left.reduce((score, keyword) => score + (rightSet.has(keyword) ? 1 : 0), 0)
}
