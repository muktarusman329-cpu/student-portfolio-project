import { Router } from "express";
import { bookings, halls } from "../data/dummyData.js";
import { realtime } from "../realtime.js";

export const eventsRouter = Router();

eventsRouter.get("/stream", (request, response) => {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });

  const send = (message) => response.write(`data: ${JSON.stringify(message)}\n\n`);
  send({ type: "snapshot", payload: { halls, bookings }, at: new Date().toISOString() });

  const onMessage = (message) => send(message);
  realtime.on("message", onMessage);

  request.on("close", () => {
    realtime.off("message", onMessage);
  });
});
