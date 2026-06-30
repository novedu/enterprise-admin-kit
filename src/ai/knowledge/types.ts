export interface KnowledgeDocument {
  id: string
  workspaceId: string
  title: string
  content: string
  createdAt: number
}

export interface KnowledgeChunk {
  id: string
  workspaceId: string
  docId: string
  content: string
  keywords: string[]
  score: number
}

export interface KnowledgeCitation {
  id: string
  source: string
  content: string
  score: number
}

export interface UploadDocumentInput {
  title: string
  content: string
}

export interface RetrieveOptions {
  topK?: number
  workspaceId?: string
}
