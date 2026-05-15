import { Router } from "express";
import { body, validationResult } from "express-validator";
import { bookings, halls } from "../data/dummyData.js";
import { requireAuth } from "../middleware/auth.js";
import { broadcast } from "../realtime.js";

export const bookingRouter = Router();

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

bookingRouter.get("/", requireAuth, (request, response) => {
  if (request.user.role === "admin") return response.json(bookings);
  response.json(bookings.filter((booking) => booking.customerEmail === request.user.email));
});

bookingRouter.get("/availability", (_request, response) => {
  response.json(
    halls.map((hall) => ({
      hallId: hall.id,
      hallName: hall.name,
      bookedDates: hall.bookedDates,
      availabilityStatus: hall.availabilityStatus
    }))
  );
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
  (request, response) => {
    const hall = halls.find((entry) => entry.id === request.body.hallId);
    if (!hall) return response.status(404).json({ message: "Selected hall not found" });
    if (hall.bookedDates.includes(request.body.date)) {
      return response.status(409).json({ message: "Selected date is already booked" });
    }

    const booking = {
      id: `BK-${Math.floor(2000 + Math.random() * 7000)}`,
      ...request.body,
      amount: hall.pricePerDay,
      status: "Pending",
      paymentStatus: "Awaiting"
    };
    bookings.unshift(booking);
    hall.bookedDates.push(request.body.date);
    hall.availabilityStatus = "Few slots";
    broadcast("booking.created", { booking, bookings, halls });

    response.status(201).json({
      booking,
      notifications: ["email_confirmation_queued", "booking_reminder_scheduled", "admin_alert_created"]
    });
  }
);

bookingRouter.patch("/:id/status", requireAuth, (request, response) => {
  if (request.user.role !== "admin") return response.status(403).json({ message: "Admin access required" });
  const booking = bookings.find((entry) => entry.id === request.params.id);
  if (!booking) return response.status(404).json({ message: "Booking not found" });
  booking.status = request.body.status;
  broadcast("booking.status", { booking, bookings });
  response.json(booking);
});
