import { EventEmitter } from "events";

/**
 * In-process pub/sub event bus for case pipeline updates.
 *
 * Development: Uses Node.js EventEmitter (single-process).
 * Production:  Swap this implementation for Redis Pub/Sub (e.g., Upstash)
 *              to synchronize across multiple server instances.
 */

// Increase default listener limit for many concurrent SSE connections
const bus = new EventEmitter();
bus.setMaxListeners(100);

export interface CaseEvent {
  caseId: string;
  stage: string;
  status: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

/**
 * Emit a case update event to all subscribers of a specific case.
 */
export function emitCaseUpdate(event: CaseEvent): void {
  bus.emit(`case:${event.caseId}`, event);
  bus.emit("case:*", event); // Wildcard channel for global listeners
}

/**
 * Subscribe to updates for a specific case.
 * Returns an unsubscribe function.
 */
export function subscribeCaseUpdates(
  caseId: string,
  callback: (event: CaseEvent) => void
): () => void {
  const channel = `case:${caseId}`;
  bus.on(channel, callback);
  return () => {
    bus.off(channel, callback);
  };
}

/**
 * Subscribe to ALL case updates (wildcard).
 * Returns an unsubscribe function.
 */
export function subscribeAllCaseUpdates(
  callback: (event: CaseEvent) => void
): () => void {
  bus.on("case:*", callback);
  return () => {
    bus.off("case:*", callback);
  };
}
