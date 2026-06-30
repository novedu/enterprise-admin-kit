import type { RuntimeEventMap } from '@/ai/events/events'

import type { ObservableEventName, TimelineEvent } from './types'
import { clonePayload } from './utils'

export class EventTimeline {
  private events: TimelineEvent[] = []

  constructor(
    private now: () => number = Date.now,
    private maxEventsPerTrace = 120,
  ) {}

  record<K extends ObservableEventName>(traceId: string, type: K, payload: RuntimeEventMap[K]) {
    const event: TimelineEvent<K> = {
      traceId,
      type,
      timestamp: this.now(),
      payload: clonePayload(payload),
    }

    this.events.push(event)
    this.trimTraceEvents(traceId)

    return event
  }

  listEvents(traceId?: string) {
    const events = traceId ? this.events.filter((event) => event.traceId === traceId) : this.events

    return events.map((event) => ({
      ...event,
      payload: clonePayload(event.payload),
    }))
  }

  clear() {
    this.events = []
  }

  trimTraces(allowedTraceIds: Set<string>) {
    this.events = this.events.filter((event) => allowedTraceIds.has(event.traceId))
  }

  private trimTraceEvents(traceId: string) {
    const traceEvents = this.events.filter((event) => event.traceId === traceId)
    if (traceEvents.length <= this.maxEventsPerTrace) return

    const overflow = traceEvents.length - this.maxEventsPerTrace
    let removed = 0

    this.events = this.events.filter((event) => {
      if (event.traceId !== traceId) return true
      if (removed >= overflow) return true
      removed += 1
      return false
    })
  }
}
