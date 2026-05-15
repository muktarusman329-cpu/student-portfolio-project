import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    hallId: { type: String, required: true },
    phone: String,
    guests: Number,
    notes: String,
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

bookingSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
