import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Guest", trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    reply: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Open", "Resolved"], default: "Open" }
  },
  { timestamps: true }
);

supportMessageSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const SupportMessage =
  mongoose.models.SupportMessage || mongoose.model("SupportMessage", supportMessageSchema);
