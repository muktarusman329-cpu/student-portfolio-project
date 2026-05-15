import { Router } from "express";
import { bookings, halls } from "../data/dummyData.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/overview", (_request, response) => {
  const revenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);
  const pending = bookings.filter((booking) => booking.status === "Pending").length;
  const paid = bookings.filter((booking) => booking.paymentStatus === "Paid").length;

  response.json({
    metrics: {
      revenue,
      bookings: bookings.length,
      pendingReservations: pending,
      paidReservations: paid,
      halls: halls.length
    },
    revenueSeries: [
      { month: "Jan", revenue: 4200000 },
      { month: "Feb", revenue: 5100000 },
      { month: "Mar", revenue: 6200000 },
      { month: "Apr", revenue: 7800000 },
      { month: "May", revenue }
    ],
    alerts: [
      "3 reservations need approval",
      "2 payment confirmations pending",
      "Grand Aurora Ballroom has high June demand"
    ]
  });
});
