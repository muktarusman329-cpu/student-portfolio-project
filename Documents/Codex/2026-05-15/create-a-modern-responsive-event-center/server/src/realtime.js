import { EventEmitter } from "events";

export const realtime = new EventEmitter();
realtime.setMaxListeners(100);

export function broadcast(type, payload) {
  realtime.emit("message", {
    type,
    payload,
    at: new Date().toISOString()
  });
}
