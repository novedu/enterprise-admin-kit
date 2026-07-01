import type { KnowledgeChunk, KnowledgeCitation } from '@/ai/knowledge'

export interface KnowledgeBaseRecord {
  id: string
  workspaceId: string
  name: string
  chunkSize: number
  documentCount: number
  chunkCount: number
  createdAt: number
  updatedAt: number
}

export interface KnowledgeDocumentRecord {
  id: string
  workspaceId: string
  knowledgeBaseId: string
  title: string
  content: string
  createdAt: number
}

export interface KnowledgeChunkRecord {
  id: string
  workspaceId: string
  knowledgeBaseId: string
  docId: string
  content: string
  keywords: string[]
  score: number
}

export interface KnowledgeRetrievalResult {
  chunks: KnowledgeChunk[]
  citations: KnowledgeCitation[]
}

export interface CreateKnowledgeBaseInput {
  workspaceId: string
  name: string
  id?: string
  chunkSize?: number
}

export interface UploadKnowledgeDocumentInput {
  workspaceId: string
  knowledgeBaseId: string
  title: string
  content: string
}
