import { DEFAULT_AI_CONFIG } from './defaultConfig'
import type {
  AIConfig,
  AIConfigPatch,
  AIProviderName,
  CompressionStrategy,
  ProviderCredential,
} from '@/ai/types'

const PROVIDERS: AIProviderName[] = ['mock', 'openai', 'claude', 'qwen', 'deepseek']
const COMPRESSION_STRATEGIES: CompressionStrategy[] = ['none', 'window', 'summary', 'hybrid']

const MIN_CONTEXT_WINDOW = 512
const MAX_CONTEXT_WINDOW = 128_000
const MIN_MAX_TOKENS = 64
const MAX_MAX_TOKENS = 32_000
const MAX_TOP_K = 10
const MIN_TIMEOUT_MS = 1_000
const MAX_TIMEOUT_MS = 120_000

export interface ConfigValidationResult {
  valid: boolean
  config: AIConfig
  errors: string[]
  warnings: string[]
}

export interface ConfigDiffEntry {
  key: keyof AIConfig
  before: unknown
  after: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isProvider(value: unknown): value is AIProviderName {
  return typeof value === 'string' && PROVIDERS.includes(value as AIProviderName)
}

function isCompressionStrategy(value: unknown): value is CompressionStrategy {
  return typeof value === 'string' && COMPRESSION_STRATEGIES.includes(value as CompressionStrategy)
}

function toFiniteNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function clamp(value: unknown, fallback: number, min: number, max: number) {
  return Math.min(max, Math.max(min, toFiniteNumber(value, fallback)))
}

function hasRawCredentialShape(value: unknown) {
  return isRecord(value) && ('apiKey' in value || 'baseUrl' in value)
}

function sanitizeCredential(
  provider: AIProviderName,
  credential: unknown,
  warnings: string[],
): ProviderCredential | undefined {
  if (!isRecord(credential)) return undefined

  if (hasRawCredentialShape(credential)) {
    warnings.push(`${provider} credential used raw key fields and was removed.`)
    return undefined
  }

  const id = typeof credential.id === 'string' ? credential.id.trim() : ''
  const name = typeof credential.name === 'string' ? credential.name.trim() : ''
  const type = isProvider(credential.type) ? credential.type : provider
  const encryptedRef =
    typeof credential.encryptedRef === 'string' ? credential.encryptedRef.trim() : ''

  if (!id || !name || !encryptedRef || type !== provider) {
    warnings.push(`${provider} credential reference is incomplete and was removed.`)
    return undefined
  }

  return {
    id,
    name,
    type,
    encryptedRef,
  }
}

function sanitizeCredentials(
  source: unknown,
  warnings: string[],
): Partial<Record<AIProviderName, ProviderCredential>> {
  const next: Partial<Record<AIProviderName, ProviderCredential>> = {}
  if (!isRecord(source)) return next

  for (const provider of PROVIDERS) {
    const credential = sanitizeCredential(provider, source[provider], warnings)
    if (credential) {
      next[provider] = credential
    }
  }

  return next
}

function hasDirectKeyMaterial(source: unknown) {
  if (!isRecord(source)) return false

  return Object.values(source).some(hasRawCredentialShape)
}

export function validateAIConfig(input: unknown): ConfigValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const source = isRecord(input) ? input : {}

  if (source.version !== undefined && source.version !== 'v1') {
    errors.push(`Unsupported AI config version: ${String(source.version)}`)
  }

  if (hasDirectKeyMaterial(source.providerCredentials)) {
    warnings.push('Raw provider key material is not allowed in frontend runtime config.')
  }

  const provider = isProvider(source.provider) ? source.provider : DEFAULT_AI_CONFIG.provider
  const compressionStrategy = isCompressionStrategy(source.compressionStrategy)
    ? source.compressionStrategy
    : DEFAULT_AI_CONFIG.compressionStrategy

  const config: AIConfig = {
    version: 'v1',
    provider,
    model:
      typeof source.model === 'string' && source.model.trim()
        ? source.model.trim()
        : DEFAULT_AI_CONFIG.model,
    providerCredentials: {
      ...sanitizeCredentials(DEFAULT_AI_CONFIG.providerCredentials, warnings),
      ...sanitizeCredentials(source.providerCredentials, warnings),
    },
    temperature: clamp(source.temperature, DEFAULT_AI_CONFIG.temperature, 0, 2),
    topP: clamp(source.topP, DEFAULT_AI_CONFIG.topP, 0, 1),
    maxTokens: Math.round(
      clamp(source.maxTokens, DEFAULT_AI_CONFIG.maxTokens, MIN_MAX_TOKENS, MAX_MAX_TOKENS),
    ),
    stream: typeof source.stream === 'boolean' ? source.stream : DEFAULT_AI_CONFIG.stream,
    enableKnowledge:
      typeof source.enableKnowledge === 'boolean'
        ? source.enableKnowledge
        : DEFAULT_AI_CONFIG.enableKnowledge,
    enableCache:
      typeof source.enableCache === 'boolean' ? source.enableCache : DEFAULT_AI_CONFIG.enableCache,
    contextWindow: Math.round(
      clamp(
        source.contextWindow,
        DEFAULT_AI_CONFIG.contextWindow,
        MIN_CONTEXT_WINDOW,
        MAX_CONTEXT_WINDOW,
      ),
    ),
    compressionStrategy,
    systemPrompt:
      typeof source.systemPrompt === 'string'
        ? source.systemPrompt.slice(0, 12_000)
        : DEFAULT_AI_CONFIG.systemPrompt,
    knowledgeTopK: Math.round(
      clamp(source.knowledgeTopK, DEFAULT_AI_CONFIG.knowledgeTopK, 1, MAX_TOP_K),
    ),
    requestTimeoutMs: Math.round(
      clamp(
        source.requestTimeoutMs,
        DEFAULT_AI_CONFIG.requestTimeoutMs,
        MIN_TIMEOUT_MS,
        MAX_TIMEOUT_MS,
      ),
    ),
    maxRetries: Math.round(clamp(source.maxRetries, DEFAULT_AI_CONFIG.maxRetries, 0, 5)),
  }

  if (!PROVIDERS.includes(config.provider)) {
    errors.push(`Unsupported provider: ${String(source.provider)}`)
  }

  return {
    valid: errors.length === 0,
    config: errors.length ? { ...DEFAULT_AI_CONFIG } : config,
    errors,
    warnings,
  }
}

export function mergeAndValidateAIConfig(
  current: AIConfig,
  patch: AIConfigPatch,
): ConfigValidationResult {
  return validateAIConfig({
    ...current,
    ...patch,
    providerCredentials:
      patch.providerCredentials === undefined
        ? current.providerCredentials
        : patch.providerCredentials,
  })
}

export function createConfigDiff(current: AIConfig, next: AIConfig): ConfigDiffEntry[] {
  const keys = Object.keys(DEFAULT_AI_CONFIG) as Array<keyof AIConfig>

  return keys
    .filter((key) => JSON.stringify(current[key]) !== JSON.stringify(next[key]))
    .map((key) => ({
      key,
      before: current[key],
      after: next[key],
    }))
}

export function createCredentialRef(
  provider: AIProviderName,
  name: string,
  encryptedRef: string,
): ProviderCredential {
  return {
    id: `credential-${provider}-${Date.now()}`,
    name,
    type: provider,
    encryptedRef,
  }
}
