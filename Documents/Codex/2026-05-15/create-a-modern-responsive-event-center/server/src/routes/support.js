import { Router } from "express";
import { body, validationResult } from "express-validator";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { SupportMessage } from "../models/SupportMessage.js";
import { broadcast } from "../realtime.js";

export const supportRouter = Router();

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

const serialize = (message) => message.toJSON();

function createReply(text) {
  const message = text.toLowerCase();
  if (message.includes("price") || message.includes("cost") || message.includes("package")) {
    return "Our packages start from NGN 650,000. Tell me your event type and guest count, and an event specialist can recommend the best hall.";
  }
  if (message.includes("date") || message.includes("available") || message.includes("book")) {
    return "I can help check availability. Choose a hall and date in the booking form, or share your preferred date here for admin follow-up.";
  }
  if (message.includes("payment") || message.includes("receipt") || message.includes("invoice")) {
    return "Payments generate a receipt after confirmation. If you already booked, share your booking ID and admin can verify it.";
  }
  return "Thanks for reaching Elite Event Hub. Your message has been sent to admin, and we will follow up shortly.";
}

supportRouter.get("/", requireAuth, requireAdmin, async (_request, response, next) => {
  try {
    const messages = await SupportMessage.find().sort({ createdAt: -1 });
    response.json(messages.map(serialize));
  } catch (error) {
    next(error);
  }
});

supportRouter.post(
  "/",
  body("message").trim().isLength({ min: 2 }),
  body("email").optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  validate,
  async (request, response, next) => {
    try {
      const supportMessage = await SupportMessage.create({
        name: request.body.name || "Guest",
        email: request.body.email,
        message: request.body.message,
        reply: createReply(request.body.message)
      });
      const messages = await SupportMessage.find().sort({ createdAt: -1 });
      broadcast("support.created", {
        supportMessage: serialize(supportMessage),
        supportMessages: messages.map(serialize)
      });
      response.status(201).json(serialize(supportMessage));
    } catch (error) {
      next(error);
    }
  }
);

supportRouter.patch("/:id/resolve", requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const supportMessage = await SupportMessage.findByIdAndUpdate(
      request.params.id,
      { status: "Resolved" },
      { new: true }
    );
    if (!supportMessage) return response.status(404).json({ message: "Support message not found" });
    const messages = await SupportMessage.find().sort({ createdAt: -1 });
    broadcast("support.resolved", {
      supportMessage: serialize(supportMessage),
      supportMessages: messages.map(serialize)
    });
    response.json(serialize(supportMessage));
  } catch (error) {
    next(error);
  }
});
