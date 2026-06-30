import { extractKeywords, getKeywordOverlap } from './keyword'
import type { KnowledgeChunk, RetrieveOptions } from './types'

const DEFAULT_TOP_K = 3
const MAX_TOP_K = 10
const MAX_SCORE = 100

function normalizeTopK(topK = DEFAULT_TOP_K) {
  return Math.min(MAX_TOP_K, Math.max(1, Math.round(topK)))
}

export function retrieveChunks(
  query: string,
  chunks: KnowledgeChunk[],
  options: RetrieveOptions = {},
) {
  const topK = normalizeTopK(options.topK)
  const queryKeywords = extractKeywords(query)

  return chunks
    .filter((chunk) => !options.workspaceId || chunk.workspaceId === options.workspaceId)
    .map((chunk) => ({
      ...chunk,
      score: Math.min(MAX_SCORE, getKeywordOverlap(queryKeywords, chunk.keywords)),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)
}
