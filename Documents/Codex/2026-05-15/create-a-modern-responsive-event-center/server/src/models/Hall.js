import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    pricePerDay: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    features: [{ type: String, trim: true }],
    availabilityStatus: { type: String, default: "Available" },
    bookedDates: [{ type: String }],
    imageUrl: String
  },
  { timestamps: true }
);

export const Hall = mongoose.models.Hall || mongoose.model("Hall", hallSchema);
