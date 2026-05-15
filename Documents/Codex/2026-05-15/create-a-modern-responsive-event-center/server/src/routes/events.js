import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { Hall } from "../models/Hall.js";
import { realtime } from "../realtime.js";

export const eventsRouter = Router();

const serializeHall = (hall) => hall.toJSON();
const serializeBooking = (booking) => booking.toJSON();

eventsRouter.get("/stream", async (request, response, next) => {
  try {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });

    const send = (message) => response.write(`data: ${JSON.stringify(message)}\n\n`);
    const [halls, bookings] = await Promise.all([Hall.find().sort({ createdAt: 1 }), Booking.find().sort({ createdAt: -1 })]);
    send({
      type: "snapshot",
      payload: { halls: halls.map(serializeHall), bookings: bookings.map(serializeBooking) },
      at: new Date().toISOString()
    });

    const onMessage = (message) => send(message);
    realtime.on("message", onMessage);

    request.on("close", () => {
      realtime.off("message", onMessage);
    });
  } catch (error) {
    next(error);
  }
});
