import { defineStore } from 'pinia'

import type { KnowledgeChunk, KnowledgeCitation } from '@/ai/knowledge'
import { knowledgeRepository } from '@/domain/knowledge/KnowledgeRepository'
import type {
  KnowledgeBaseRecord,
  KnowledgeChunkRecord,
  KnowledgeDocumentRecord,
} from '@/domain/knowledge/Knowledge'

export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    knowledgeBases: [] as KnowledgeBaseRecord[],
    activeKnowledgeBaseId: '',
    documents: [] as KnowledgeDocumentRecord[],
    chunks: [] as KnowledgeChunkRecord[],
    retrievedChunks: [] as KnowledgeChunk[],
    citations: [] as KnowledgeCitation[],
    loading: false,
    error: '',
  }),
  getters: {
    activeKnowledgeBase: (state) =>
      state.knowledgeBases.find((base) => base.id === state.activeKnowledgeBaseId) || null,
  },
  actions: {
    async loadKnowledgeBases(workspaceId: string, preferredKnowledgeBaseId?: string) {
      if (!workspaceId) return

      this.loading = true
      this.error = ''
      try {
        this.knowledgeBases = await knowledgeRepository.listBasesByWorkspace(workspaceId)
        const nextActiveId =
          this.knowledgeBases.find((base) => base.id === preferredKnowledgeBaseId)?.id ||
          this.knowledgeBases.find((base) => base.id === this.activeKnowledgeBaseId)?.id ||
          this.knowledgeBases[0]?.id ||
          ''

        if (nextActiveId) {
          await this.switchKnowledgeBase(nextActiveId)
        } else {
          this.activeKnowledgeBaseId = ''
          this.documents = []
          this.chunks = []
          this.retrievedChunks = []
          this.citations = []
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
      } finally {
        this.loading = false
      }
    },
    async createKnowledgeBase(input: { workspaceId: string; name: string }) {
      const base = await knowledgeRepository.createBase(input)
      this.knowledgeBases = [...this.knowledgeBases, base]
      await this.switchKnowledgeBase(base.id)

      return base
    },
    async switchKnowledgeBase(id: string) {
      this.activeKnowledgeBaseId = id
      this.documents = await knowledgeRepository.listDocuments(id)
      this.chunks = await knowledgeRepository.listChunks(id)
      this.retrievedChunks = []
      this.citations = []
    },
    async uploadDocument(input: {
      workspaceId: string
      knowledgeBaseId: string
      title: string
      content: string
    }) {
      const result = await knowledgeRepository.uploadDocument(input)
      this.documents = await knowledgeRepository.listDocuments(input.knowledgeBaseId)
      this.chunks = await knowledgeRepository.listChunks(input.knowledgeBaseId)
      this.knowledgeBases = this.knowledgeBases.map((base) =>
        base.id === input.knowledgeBaseId
          ? {
              ...base,
              documentCount: this.documents.length,
              chunkCount: this.chunks.length,
              updatedAt: Date.now(),
            }
          : base,
      )

      return result
    },
    async runRetrieval(query: string, topK: number) {
      if (!this.activeKnowledgeBaseId) return

      const result = await knowledgeRepository.retrieve(this.activeKnowledgeBaseId, query, topK)
      this.retrievedChunks = result.chunks
      this.citations = result.citations
    },
    async buildRuntimeKnowledgeBase(knowledgeBaseId?: string) {
      const id = knowledgeBaseId || this.activeKnowledgeBaseId
      if (!id) return undefined

      return knowledgeRepository.buildRuntimeKnowledgeBase(id)
    },
  },
})
