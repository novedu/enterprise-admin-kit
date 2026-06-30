import { chunkDocument, type ChunkDocumentOptions } from './chunker'
import { createCitations } from './citation'
import { retrieveChunks } from './retriever'
import type {
  KnowledgeChunk,
  KnowledgeCitation,
  KnowledgeDocument,
  RetrieveOptions,
  UploadDocumentInput,
} from './types'

export interface KnowledgeBaseOptions extends ChunkDocumentOptions {
  id: string
  name: string
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export class KnowledgeBase {
  private documents = new Map<string, KnowledgeDocument>()
  private chunks = new Map<string, KnowledgeChunk[]>()

  constructor(private options: KnowledgeBaseOptions) {}

  get id() {
    return this.options.id
  }

  get name() {
    return this.options.name
  }

  uploadDocument(input: UploadDocumentInput) {
    const document: KnowledgeDocument = {
      id: createId('doc'),
      title: input.title,
      content: input.content,
      createdAt: Date.now(),
    }

    const chunks = chunkDocument(document, {
      chunkSize: this.options.chunkSize,
    })

    this.documents.set(document.id, document)
    this.chunks.set(document.id, chunks)

    return document
  }

  getDocuments() {
    return Array.from(this.documents.values()).map((document) => ({ ...document }))
  }

  getChunks() {
    return Array.from(this.chunks.values())
      .flat()
      .map((chunk) => ({
        ...chunk,
        keywords: [...chunk.keywords],
      }))
  }

  retrieve(query: string, options: RetrieveOptions = {}) {
    return retrieveChunks(query, this.getChunks(), options)
  }

  cite(chunks: KnowledgeChunk[]): KnowledgeCitation[] {
    return createCitations(chunks, this.documents)
  }

  query(query: string, options: RetrieveOptions = {}) {
    const chunks = this.retrieve(query, options)

    return {
      chunks,
      citations: this.cite(chunks),
    }
  }

  clear() {
    this.documents.clear()
    this.chunks.clear()
  }
}
