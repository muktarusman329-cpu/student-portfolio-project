import { Router } from "express";
import { body, validationResult } from "express-validator";
import Stripe from "stripe";
import { Booking } from "../models/Booking.js";
import { broadcast } from "../realtime.js";

export const paymentRouter = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

const serializeBooking = (booking) => booking.toJSON();

paymentRouter.post("/intent", body("bookingId").trim().notEmpty(), validate, async (request, response, next) => {
  try {
    const booking = await Booking.findOne({ id: request.body.bookingId });
    if (!booking) return response.status(404).json({ message: "Booking not found" });

    if (!stripe) {
      booking.paymentStatus = "Processing";
      await booking.save();
      const bookings = await Booking.find().sort({ createdAt: -1 });
      broadcast("payment.processing", { booking: serializeBooking(booking), bookings: bookings.map(serializeBooking) });
      return response.json({
        provider: "demo",
        clientSecret: `demo_secret_${booking.id}`,
        message: "Stripe key not configured. Demo payment intent generated."
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount: booking.amount * 100,
      currency: "ngn",
      metadata: { bookingId: booking.id }
    });

    response.json({ provider: "stripe", clientSecret: intent.client_secret });
  } catch (error) {
    next(error);
  }
});

paymentRouter.post("/confirm", body("bookingId").trim().notEmpty(), validate, async (request, response, next) => {
  try {
    const booking = await Booking.findOneAndUpdate({ id: request.body.bookingId }, { paymentStatus: "Paid" }, { new: true });
    if (!booking) return response.status(404).json({ message: "Booking not found" });
    const bookings = await Booking.find().sort({ createdAt: -1 });
    broadcast("payment.paid", { booking: serializeBooking(booking), bookings: bookings.map(serializeBooking) });
    response.json({ booking: serializeBooking(booking), receiptUrl: `/api/payments/${booking.id}/receipt` });
  } catch (error) {
    next(error);
  }
});

paymentRouter.get("/:bookingId/receipt", async (request, response, next) => {
  try {
    const booking = await Booking.findOne({ id: request.params.bookingId });
    if (!booking) return response.status(404).json({ message: "Booking not found" });

    response.setHeader("Content-Type", "text/plain");
    response.setHeader("Content-Disposition", `attachment; filename="${booking.id}-receipt.txt"`);
    response.send(
      [
        "Elite Event Hub Receipt",
        `Booking: ${booking.id}`,
        `Customer: ${booking.customerName}`,
        `Event: ${booking.eventType}`,
        `Date: ${booking.date} ${booking.time}`,
        `Amount: NGN ${booking.amount.toLocaleString("en-NG")}`,
        `Payment: ${booking.paymentStatus}`
      ].join("\n")
    );
  } catch (error) {
    next(error);
  }
});
