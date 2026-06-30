import { KnowledgeBase, type KnowledgeBaseOptions } from './KnowledgeBase'

export class KnowledgeWorkspace {
  private bases = new Map<string, KnowledgeBase>()
  private activeBaseId: string | null = null

  createKnowledgeBase(options: KnowledgeBaseOptions) {
    const base = new KnowledgeBase(options)

    this.bases.set(base.id, base)
    this.activeBaseId ??= base.id

    return base
  }

  getKnowledgeBase(id: string) {
    return this.bases.get(id)
  }

  listKnowledgeBases() {
    return Array.from(this.bases.values())
  }

  switchKnowledgeBase(id: string) {
    if (!this.bases.has(id)) {
      throw new Error(`Knowledge base ${id} does not exist.`)
    }

    this.activeBaseId = id

    return this.getActiveKnowledgeBase()
  }

  getActiveKnowledgeBase() {
    if (!this.activeBaseId) return undefined

    return this.bases.get(this.activeBaseId)
  }

  retrieve(query: string, topK?: number) {
    const base = this.getActiveKnowledgeBase()
    if (!base) {
      return {
        chunks: [],
        citations: [],
      }
    }

    return base.query(query, { topK })
  }
}
