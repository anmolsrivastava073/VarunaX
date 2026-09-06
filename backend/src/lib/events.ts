import { EventEmitter } from "events";

const globalForEvents = globalThis as unknown as { bus: EventEmitter };
const bus = globalForEvents.bus || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.bus = bus;
}

bus.setMaxListeners(100);

export interface IncidentEvent {
  incidentId: string;
  system: string;
  status: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export function emitIncidentUpdate(event: IncidentEvent): void {
  bus.emit(`incident:${event.incidentId}`, event);
  bus.emit("incident:*", event);
}

export function subscribeIncidentUpdates(
  incidentId: string,
  callback: (event: IncidentEvent) => void
): () => void {
  const channel = `incident:${incidentId}`;
  bus.on(channel, callback);
  return () => {
    bus.off(channel, callback);
  };
}

export function subscribeAllIncidentUpdates(
  callback: (event: IncidentEvent) => void
): () => void {
  bus.on("incident:*", callback);
  return () => {
    bus.off("incident:*", callback);
  };
}
