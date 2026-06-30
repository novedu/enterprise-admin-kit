let traceCounter = 0

export function createTraceId() {
  traceCounter += 1

  return `trace-${Date.now()}-${traceCounter}`
}

export function clonePayload<T>(payload: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(payload)
  }

  return JSON.parse(JSON.stringify(payload)) as T
}
