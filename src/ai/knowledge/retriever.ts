import { extractKeywords, getKeywordOverlap } from './keyword'
import type { KnowledgeChunk, RetrieveOptions } from './types'

const DEFAULT_TOP_K = 3

export function retrieveChunks(
  query: string,
  chunks: KnowledgeChunk[],
  options: RetrieveOptions = {},
) {
  const topK = options.topK ?? DEFAULT_TOP_K
  const queryKeywords = extractKeywords(query)

  return chunks
    .map((chunk) => ({
      ...chunk,
      score: getKeywordOverlap(queryKeywords, chunk.keywords),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
}
