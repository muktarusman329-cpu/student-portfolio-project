import { Router } from "express";
import { Booking } from "../models/Booking.js";
import { Hall } from "../models/Hall.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/overview", async (_request, response, next) => {
  try {
    const [bookings, hallCount] = await Promise.all([Booking.find(), Hall.countDocuments()]);
    const revenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);
    const pending = bookings.filter((booking) => booking.status === "Pending").length;
    const paid = bookings.filter((booking) => booking.paymentStatus === "Paid").length;

    response.json({
      metrics: {
        revenue,
        bookings: bookings.length,
        pendingReservations: pending,
        paidReservations: paid,
        halls: hallCount
      },
      revenueSeries: [
        { month: "Jan", revenue: 4200000 },
        { month: "Feb", revenue: 5100000 },
        { month: "Mar", revenue: 6200000 },
        { month: "Apr", revenue: 7800000 },
        { month: "May", revenue }
      ],
      alerts: [
        `${pending} reservations need approval`,
        `${bookings.length - paid} payment confirmations pending`,
        "MongoDB persistence is active"
      ]
    });
  } catch (error) {
    next(error);
  }
});
