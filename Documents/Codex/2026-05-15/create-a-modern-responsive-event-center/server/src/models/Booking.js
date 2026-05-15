import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: "Hall" },
    eventType: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    services: [{ type: String }],
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    paymentStatus: { type: String, enum: ["Awaiting", "Processing", "Paid", "Failed"], default: "Awaiting" }
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
