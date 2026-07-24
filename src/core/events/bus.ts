import { logger } from "@/core/logger"

type EventHandler = (payload: unknown) => void | Promise<void>

const handlers = new Map<string, Set<EventHandler>>()

/**
 * In-process pub/sub for cross-module domain side effects (e.g. audit).
 * Handlers run fire-and-forget; failures are logged and never rethrown to emitters.
 */
export function on(event: string, handler: EventHandler): () => void {
  let set = handlers.get(event)
  if (!set) {
    set = new Set()
    handlers.set(event, set)
  }
  set.add(handler)

  return () => {
    set?.delete(handler)
  }
}

export function emit(event: string, payload: unknown): void {
  const set = handlers.get(event)
  if (!set || set.size === 0) return

  for (const handler of set) {
    try {
      const result = handler(payload)
      if (result instanceof Promise) {
        void result.catch((error: unknown) => {
          logger.error(
            { event, error },
            "Domain event handler failed",
          )
        })
      }
    } catch (error) {
      logger.error({ event, error }, "Domain event handler failed")
    }
  }
}

/** Test helper — clears all subscriptions. */
export function clearEventHandlers(): void {
  handlers.clear()
}
