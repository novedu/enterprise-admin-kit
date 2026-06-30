import type { RuntimeEventMap } from '@/ai/events/events'

import type { ObservableEventName, TimelineEvent } from './types'
import { clonePayload } from './utils'

export class EventTimeline {
  private events: TimelineEvent[] = []

  constructor(private now: () => number = Date.now) {}

  record<K extends ObservableEventName>(traceId: string, type: K, payload: RuntimeEventMap[K]) {
    const event: TimelineEvent<K> = {
      traceId,
      type,
      timestamp: this.now(),
      payload: clonePayload(payload),
    }

    this.events.push(event)

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
}
