import { describe, expect, it } from 'vitest'

import { DEFAULT_AI_CONFIG } from './defaultConfig'
import { createConfigDiff, validateAIConfig } from './validator'

describe('AI config governance', () => {
  it('removes raw provider keys and keeps safe fallback config', () => {
    const result = validateAIConfig({
      ...DEFAULT_AI_CONFIG,
      providerCredentials: {
        openai: {
          apiKey: 'sk-raw-key',
          baseUrl: 'https://api.openai.com/v1',
        },
      },
    })

    expect(result.valid).toBe(true)
    expect(result.warnings.join(' ')).toContain('Raw provider key material')
    expect(result.config.providerCredentials.openai).toBeUndefined()
  })

  it('rejects unsupported config versions', () => {
    const result = validateAIConfig({
      ...DEFAULT_AI_CONFIG,
      version: 'v2',
    })

    expect(result.valid).toBe(false)
    expect(result.config).toEqual(DEFAULT_AI_CONFIG)
  })

  it('previews config diffs before apply', () => {
    const next = {
      ...DEFAULT_AI_CONFIG,
      temperature: 0.2,
    }

    expect(createConfigDiff(DEFAULT_AI_CONFIG, next)).toEqual([
      {
        key: 'temperature',
        before: 0.7,
        after: 0.2,
      },
    ])
  })
})
