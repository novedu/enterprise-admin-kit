import { chunkDocument } from '@/ai/knowledge/chunker'
import { createCitations } from '@/ai/knowledge/citation'
import { KnowledgeBase } from '@/ai/knowledge'
import { retrieveChunks } from '@/ai/knowledge/retriever'
import type { KnowledgeChunk, KnowledgeDocument } from '@/ai/knowledge'

import type {
  CreateKnowledgeBaseInput,
  KnowledgeBaseRecord,
  KnowledgeChunkRecord,
  KnowledgeDocumentRecord,
  KnowledgeRetrievalResult,
  UploadKnowledgeDocumentInput,
} from './Knowledge'

interface KnowledgeState {
  bases: KnowledgeBaseRecord[]
  documents: KnowledgeDocumentRecord[]
  chunks: KnowledgeChunkRecord[]
}

const STORAGE_KEY = 'enterprise-ai-platform:knowledge'
const DEFAULT_CHUNK_SIZE = 360
const MAX_DOCUMENT_CHARS = 60_000

const timestamp = 1_735_689_600_000

const mockDocuments: KnowledgeDocumentRecord[] = [
  {
    id: 'doc-runtime-architecture',
    workspaceId: 'workspace-enterprise-ai',
    knowledgeBaseId: 'kb-runtime-docs',
    title: 'Runtime Architecture',
    content:
      'ChatRuntime orchestrates context building, knowledge retrieval, prompt construction and provider streaming. ContextManager controls token windows and compression. PromptEngine renders final prompts. KnowledgeBase provides mock RAG citations. Runtime observability records traces, token usage, latency and streaming events.',
    createdAt: timestamp,
  },
  {
    id: 'doc-hr-policy',
    workspaceId: 'workspace-people-ops',
    knowledgeBaseId: 'kb-hr-policy',
    title: 'Annual Leave Policy',
    content:
      'Employees can request annual leave through the HR assistant. The policy requires manager approval for long leave, records remaining balance, and cites the internal people operations handbook when answering policy questions.',
    createdAt: timestamp + 1_000,
  },
]

const mockBases: KnowledgeBaseRecord[] = [
  {
    id: 'kb-runtime-docs',
    workspaceId: 'workspace-enterprise-ai',
    name: 'Runtime Docs',
    chunkSize: DEFAULT_CHUNK_SIZE,
    documentCount: 0,
    chunkCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'kb-hr-policy',
    workspaceId: 'workspace-people-ops',
    name: 'HR Policy',
    chunkSize: DEFAULT_CHUNK_SIZE,
    documentCount: 0,
    chunkCount: 0,
    createdAt: timestamp + 1_000,
    updatedAt: timestamp + 1_000,
  },
]

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function cloneBase(base: KnowledgeBaseRecord): KnowledgeBaseRecord {
  return { ...base }
}

function cloneDocument(document: KnowledgeDocumentRecord): KnowledgeDocumentRecord {
  return { ...document }
}

function cloneChunk(chunk: KnowledgeChunkRecord): KnowledgeChunkRecord {
  return {
    ...chunk,
    keywords: [...chunk.keywords],
  }
}

function toRuntimeDocument(document: KnowledgeDocumentRecord): KnowledgeDocument {
  return {
    id: document.id,
    workspaceId: document.knowledgeBaseId,
    title: document.title,
    content: document.content,
    createdAt: document.createdAt,
  }
}

function toRuntimeChunk(chunk: KnowledgeChunkRecord): KnowledgeChunk {
  return {
    id: chunk.id,
    workspaceId: chunk.knowledgeBaseId,
    docId: chunk.docId,
    content: chunk.content,
    keywords: [...chunk.keywords],
    score: chunk.score,
  }
}

function toChunkRecord(input: {
  workspaceId: string
  knowledgeBaseId: string
  chunk: KnowledgeChunk
}): KnowledgeChunkRecord {
  return {
    ...input.chunk,
    workspaceId: input.workspaceId,
    knowledgeBaseId: input.knowledgeBaseId,
    keywords: [...input.chunk.keywords],
  }
}

function buildChunksForDocument(document: KnowledgeDocumentRecord, chunkSize = DEFAULT_CHUNK_SIZE) {
  return chunkDocument(toRuntimeDocument(document), { chunkSize }).map((chunk) =>
    toChunkRecord({
      workspaceId: document.workspaceId,
      knowledgeBaseId: document.knowledgeBaseId,
      chunk,
    }),
  )
}

function withCounts(state: KnowledgeState): KnowledgeState {
  return {
    ...state,
    bases: state.bases.map((base) => ({
      ...base,
      documentCount: state.documents.filter((document) => document.knowledgeBaseId === base.id)
        .length,
      chunkCount: state.chunks.filter((chunk) => chunk.knowledgeBaseId === base.id).length,
    })),
  }
}

function createMockState(): KnowledgeState {
  const chunks = mockDocuments.flatMap((document) => {
    const base = mockBases.find((item) => item.id === document.knowledgeBaseId)

    return buildChunksForDocument(document, base?.chunkSize)
  })

  return withCounts({
    bases: mockBases.map(cloneBase),
    documents: mockDocuments.map(cloneDocument),
    chunks,
  })
}

function cloneState(state: KnowledgeState): KnowledgeState {
  return {
    bases: state.bases.map(cloneBase),
    documents: state.documents.map(cloneDocument),
    chunks: state.chunks.map(cloneChunk),
  }
}

function readState() {
  if (typeof window === 'undefined') return createMockState()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createMockState()

    return withCounts(cloneState(JSON.parse(raw) as KnowledgeState))
  } catch {
    return createMockState()
  }
}

function writeState(state: KnowledgeState) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withCounts(state)))
}

function ensureBase(state: KnowledgeState, knowledgeBaseId: string) {
  const base = state.bases.find((item) => item.id === knowledgeBaseId)
  if (!base) {
    throw new Error(`Knowledge base ${knowledgeBaseId} does not exist.`)
  }

  return base
}

export class KnowledgeRepository {
  async listBasesByWorkspace(workspaceId: string) {
    return readState()
      .bases.filter((base) => base.workspaceId === workspaceId)
      .map(cloneBase)
  }

  async findBaseById(id: string) {
    return readState().bases.find((base) => base.id === id) || null
  }

  async createBase(input: CreateKnowledgeBaseInput) {
    const state = readState()
    const name = input.name.trim() || 'Untitled Knowledge Base'
    const id = input.id || `kb-${slugify(name) || 'knowledge'}-${Date.now()}`

    if (state.bases.some((base) => base.id === id)) {
      throw new Error(`Knowledge base ${id} already exists.`)
    }

    const timestamp = Date.now()
    const base: KnowledgeBaseRecord = {
      id,
      workspaceId: input.workspaceId,
      name,
      chunkSize: input.chunkSize || DEFAULT_CHUNK_SIZE,
      documentCount: 0,
      chunkCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    writeState({
      ...state,
      bases: [...state.bases, base],
    })

    return cloneBase(base)
  }

  async listDocuments(knowledgeBaseId: string) {
    return readState()
      .documents.filter((document) => document.knowledgeBaseId === knowledgeBaseId)
      .sort((left, right) => right.createdAt - left.createdAt)
      .map(cloneDocument)
  }

  async listChunks(knowledgeBaseId: string) {
    return readState()
      .chunks.filter((chunk) => chunk.knowledgeBaseId === knowledgeBaseId)
      .map(cloneChunk)
  }

  async uploadDocument(input: UploadKnowledgeDocumentInput) {
    const state = readState()
    const base = ensureBase(state, input.knowledgeBaseId)
    const title = input.title.trim() || 'Untitled Document'
    const content = input.content.trim()

    if (!content) {
      throw new Error('Knowledge document content is required.')
    }

    if (content.length > MAX_DOCUMENT_CHARS) {
      throw new Error(`Knowledge document exceeds ${MAX_DOCUMENT_CHARS} characters.`)
    }

    if (base.workspaceId !== input.workspaceId) {
      throw new Error('Knowledge document workspace boundary violation.')
    }

    const document: KnowledgeDocumentRecord = {
      id: createId('doc'),
      workspaceId: input.workspaceId,
      knowledgeBaseId: input.knowledgeBaseId,
      title,
      content,
      createdAt: Date.now(),
    }
    const chunks = buildChunksForDocument(document, base.chunkSize)
    const nextState = withCounts({
      bases: state.bases.map((item) =>
        item.id === base.id ? { ...item, updatedAt: Date.now() } : item,
      ),
      documents: [...state.documents, document],
      chunks: [...state.chunks, ...chunks],
    })

    writeState(nextState)

    return {
      document: cloneDocument(document),
      chunks: chunks.map(cloneChunk),
    }
  }

  async retrieve(
    knowledgeBaseId: string,
    query: string,
    topK = 3,
  ): Promise<KnowledgeRetrievalResult> {
    const state = readState()
    const base = ensureBase(state, knowledgeBaseId)
    const chunks = state.chunks
      .filter((chunk) => chunk.knowledgeBaseId === knowledgeBaseId)
      .map(toRuntimeChunk)
    const documents = new Map(
      state.documents
        .filter((document) => document.knowledgeBaseId === knowledgeBaseId)
        .map((document) => [document.id, toRuntimeDocument(document)]),
    )
    const retrievedChunks = retrieveChunks(query, chunks, {
      topK,
      workspaceId: base.id,
    })

    return {
      chunks: retrievedChunks,
      citations: createCitations(retrievedChunks, documents),
    }
  }

  async buildRuntimeKnowledgeBase(knowledgeBaseId: string) {
    const state = readState()
    const base = ensureBase(state, knowledgeBaseId)
    const runtimeBase = new KnowledgeBase({
      id: base.id,
      name: base.name,
      chunkSize: base.chunkSize,
    })

    for (const document of state.documents.filter(
      (item) => item.knowledgeBaseId === knowledgeBaseId,
    )) {
      runtimeBase.hydrateDocument(toRuntimeDocument(document))
    }

    return runtimeBase
  }
}

export const knowledgeRepository = new KnowledgeRepository()
