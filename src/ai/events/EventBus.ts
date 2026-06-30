import type { RuntimeEventMap } from './events'

type EventKey = keyof RuntimeEventMap
type EventCallback<T> = (payload: T) => void

export class EventBus {
  private listeners: Map<EventKey, Set<EventCallback<RuntimeEventMap[EventKey]>>> = new Map()

  on<K extends EventKey>(event: K, callback: EventCallback<RuntimeEventMap[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(callback as EventCallback<RuntimeEventMap[EventKey]>)
  }

  off<K extends EventKey>(event: K, callback: EventCallback<RuntimeEventMap[K]>) {
    const set = this.listeners.get(event)
    if (!set) return

    set.delete(callback as EventCallback<RuntimeEventMap[EventKey]>)
  }

  emit<K extends EventKey>(event: K, payload: RuntimeEventMap[K]) {
    const set = this.listeners.get(event)
    if (!set) return

    for (const callback of set) {
      callback(payload)
    }
  }

  once<K extends EventKey>(event: K, callback: EventCallback<RuntimeEventMap[K]>) {
    const wrapper: EventCallback<RuntimeEventMap[K]> = (payload) => {
      callback(payload)
      this.off(event, wrapper)
    }

    this.on(event, wrapper)
  }

  clear() {
    this.listeners.clear()
  }
}
