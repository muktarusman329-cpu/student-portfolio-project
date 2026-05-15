import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
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

hallSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret.slug;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Hall = mongoose.models.Hall || mongoose.model("Hall", hallSchema);
