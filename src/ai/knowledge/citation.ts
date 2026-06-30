import type { KnowledgeChunk, KnowledgeCitation, KnowledgeDocument } from './types'

export function createCitation(
  chunk: KnowledgeChunk,
  document?: KnowledgeDocument,
): KnowledgeCitation {
  return {
    id: `citation-${chunk.id}`,
    source: document?.title ?? chunk.docId,
    content: chunk.content,
    score: chunk.score,
  }
}

export function createCitations(
  chunks: KnowledgeChunk[],
  documents: Map<string, KnowledgeDocument>,
) {
  return chunks.map((chunk) => createCitation(chunk, documents.get(chunk.docId)))
}
