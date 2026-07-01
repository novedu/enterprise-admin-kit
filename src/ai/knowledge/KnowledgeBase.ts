import { chunkDocument, normalizeChunkSize, type ChunkDocumentOptions } from './chunker'
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
  maxDocumentChars?: number
  maxDocuments?: number
}

const DEFAULT_MAX_DOCUMENT_CHARS = 60_000
const DEFAULT_MAX_DOCUMENTS = 100

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
    const title = input.title.trim()
    const content = input.content.trim()
    const maxDocumentChars = this.options.maxDocumentChars ?? DEFAULT_MAX_DOCUMENT_CHARS
    const maxDocuments = this.options.maxDocuments ?? DEFAULT_MAX_DOCUMENTS

    if (!title) {
      throw new Error('Knowledge document title is required.')
    }

    if (!content) {
      throw new Error('Knowledge document content is required.')
    }

    if (content.length > maxDocumentChars) {
      throw new Error(`Knowledge document exceeds ${maxDocumentChars} characters and was rejected.`)
    }

    if (this.documents.size >= maxDocuments) {
      throw new Error(`Knowledge base ${this.id} reached the ${maxDocuments} document limit.`)
    }

    const document: KnowledgeDocument = {
      id: createId('doc'),
      workspaceId: this.id,
      title,
      content,
      createdAt: Date.now(),
    }

    const chunks = chunkDocument(document, {
      chunkSize: normalizeChunkSize(this.options.chunkSize),
    })

    this.documents.set(document.id, document)
    this.chunks.set(document.id, chunks)

    return document
  }

  hydrateDocument(document: KnowledgeDocument) {
    const title = document.title.trim()
    const content = document.content.trim()
    const maxDocumentChars = this.options.maxDocumentChars ?? DEFAULT_MAX_DOCUMENT_CHARS
    const maxDocuments = this.options.maxDocuments ?? DEFAULT_MAX_DOCUMENTS

    if (!document.id || !title || !content) {
      throw new Error('Knowledge document id, title and content are required.')
    }

    if (content.length > maxDocumentChars) {
      throw new Error(`Knowledge document exceeds ${maxDocumentChars} characters and was rejected.`)
    }

    if (!this.documents.has(document.id) && this.documents.size >= maxDocuments) {
      throw new Error(`Knowledge base ${this.id} reached the ${maxDocuments} document limit.`)
    }

    const normalizedDocument: KnowledgeDocument = {
      ...document,
      workspaceId: this.id,
      title,
      content,
    }
    const chunks = chunkDocument(normalizedDocument, {
      chunkSize: normalizeChunkSize(this.options.chunkSize),
    })

    this.documents.set(normalizedDocument.id, normalizedDocument)
    this.chunks.set(normalizedDocument.id, chunks)

    return normalizedDocument
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
    return retrieveChunks(query, this.getChunks(), {
      ...options,
      workspaceId: this.id,
    })
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
