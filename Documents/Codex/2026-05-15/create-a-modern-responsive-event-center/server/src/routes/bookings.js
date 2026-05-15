import { Router } from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Hall } from "../models/Hall.js";
import { broadcast } from "../realtime.js";

export const bookingRouter = Router();

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

const serializeHall = (hall) => hall.toJSON();
const serializeBooking = (booking) => booking.toJSON();

bookingRouter.get("/", requireAuth, async (request, response, next) => {
  try {
    const filter = request.user.role === "admin" ? {} : { customerEmail: request.user.email };
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    response.json(bookings.map(serializeBooking));
  } catch (error) {
    next(error);
  }
});

bookingRouter.get("/availability", async (_request, response, next) => {
  try {
    const halls = await Hall.find().sort({ createdAt: 1 });
    response.json(
      halls.map((hall) => ({
        hallId: hall.slug,
        hallName: hall.name,
        bookedDates: hall.bookedDates,
        availabilityStatus: hall.availabilityStatus
      }))
    );
  } catch (error) {
    next(error);
  }
});

bookingRouter.post(
  "/",
  body("customerName").trim().isLength({ min: 2 }),
  body("customerEmail").isEmail().normalizeEmail(),
  body("hallId").trim().notEmpty(),
  body("date").isISO8601(),
  body("time").matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body("eventType").trim().isLength({ min: 2 }),
  validate,
  async (request, response, next) => {
    try {
      const hall = await Hall.findOne({ slug: request.body.hallId });
      if (!hall) return response.status(404).json({ message: "Selected hall not found" });
      if (hall.bookedDates.includes(request.body.date)) {
        return response.status(409).json({ message: "Selected date is already booked" });
      }

      const booking = await Booking.create({
        id: `BK-${Math.floor(2000 + Math.random() * 7000)}`,
        customerName: request.body.customerName,
        customerEmail: request.body.customerEmail,
        phone: request.body.phone,
        hallId: hall.slug,
        eventType: request.body.eventType,
        date: request.body.date,
        time: request.body.time,
        guests: request.body.guests,
        services: request.body.services || [],
        notes: request.body.notes,
        amount: hall.pricePerDay,
        status: "Pending",
        paymentStatus: "Awaiting"
      });

      hall.bookedDates.push(request.body.date);
      hall.availabilityStatus = "Few slots";
      await hall.save();

      const [bookings, halls] = await Promise.all([Booking.find().sort({ createdAt: -1 }), Hall.find().sort({ createdAt: 1 })]);
      broadcast("booking.created", {
        booking: serializeBooking(booking),
        bookings: bookings.map(serializeBooking),
        halls: halls.map(serializeHall)
      });

      response.status(201).json({
        booking: serializeBooking(booking),
        notifications: ["email_confirmation_queued", "booking_reminder_scheduled", "admin_alert_created"]
      });
    } catch (error) {
      next(error);
    }
  }
);

bookingRouter.patch("/:id/status", requireAuth, async (request, response, next) => {
  try {
    if (request.user.role !== "admin") return response.status(403).json({ message: "Admin access required" });
    const booking = await Booking.findOneAndUpdate({ id: request.params.id }, { status: request.body.status }, { new: true });
    if (!booking) return response.status(404).json({ message: "Booking not found" });
    const bookings = await Booking.find().sort({ createdAt: -1 });
    broadcast("booking.status", { booking: serializeBooking(booking), bookings: bookings.map(serializeBooking) });
    response.json(serializeBooking(booking));
  } catch (error) {
    next(error);
  }
});
