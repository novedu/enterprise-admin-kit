import type { KnowledgeChunk, KnowledgeDocument } from './types'
import { extractKeywords } from './keyword'

export interface ChunkDocumentOptions {
  chunkSize?: number
}

const DEFAULT_CHUNK_SIZE = 360
const MIN_CHUNK_SIZE = 120
const MAX_CHUNK_SIZE = 1_200

export function normalizeChunkSize(chunkSize = DEFAULT_CHUNK_SIZE) {
  return Math.min(MAX_CHUNK_SIZE, Math.max(MIN_CHUNK_SIZE, Math.round(chunkSize)))
}

function normalizeParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function splitLongText(text: string, chunkSize: number) {
  const chunks: string[] = []

  for (let index = 0; index < text.length; index += chunkSize) {
    chunks.push(text.slice(index, index + chunkSize).trim())
  }

  return chunks.filter(Boolean)
}

export function chunkDocument(
  document: KnowledgeDocument,
  options: ChunkDocumentOptions = {},
): KnowledgeChunk[] {
  const chunkSize = normalizeChunkSize(options.chunkSize)
  const rawChunks: string[] = []
  let buffer = ''

  for (const paragraph of normalizeParagraphs(document.content)) {
    if (paragraph.length > chunkSize) {
      if (buffer) {
        rawChunks.push(buffer)
        buffer = ''
      }
      rawChunks.push(...splitLongText(paragraph, chunkSize))
      continue
    }

    const nextBuffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
    if (nextBuffer.length > chunkSize) {
      rawChunks.push(buffer)
      buffer = paragraph
    } else {
      buffer = nextBuffer
    }
  }

  if (buffer) {
    rawChunks.push(buffer)
  }

  return rawChunks.map((content, index) => ({
    id: `${document.id}-chunk-${index + 1}`,
    workspaceId: document.workspaceId,
    docId: document.id,
    content,
    keywords: extractKeywords(content),
    score: 0,
  }))
}
