import { Router } from "express";
import { body, validationResult } from "express-validator";
import Stripe from "stripe";
import { bookings } from "../data/dummyData.js";
import { broadcast } from "../realtime.js";

export const paymentRouter = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

paymentRouter.post("/intent", body("bookingId").trim().notEmpty(), validate, async (request, response) => {
  const booking = bookings.find((entry) => entry.id === request.body.bookingId);
  if (!booking) return response.status(404).json({ message: "Booking not found" });

  if (!stripe) {
    booking.paymentStatus = "Processing";
    broadcast("payment.processing", { booking, bookings });
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
});

paymentRouter.post("/confirm", body("bookingId").trim().notEmpty(), validate, (request, response) => {
  const booking = bookings.find((entry) => entry.id === request.body.bookingId);
  if (!booking) return response.status(404).json({ message: "Booking not found" });

  booking.paymentStatus = "Paid";
  broadcast("payment.paid", { booking, bookings });
  response.json({ booking, receiptUrl: `/api/payments/${booking.id}/receipt` });
});

paymentRouter.get("/:bookingId/receipt", (request, response) => {
  const booking = bookings.find((entry) => entry.id === request.params.bookingId);
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
});
