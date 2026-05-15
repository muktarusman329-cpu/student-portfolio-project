import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import { slugify } from "../db.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Hall } from "../models/Hall.js";
import { broadcast } from "../realtime.js";

export const hallRouter = Router();

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

const serializeHall = (hall) => hall.toJSON();

hallRouter.get("/", query("capacity").optional().isInt({ min: 1 }), validate, async (request, response, next) => {
  try {
    const search = String(request.query.search || "").trim();
    const minCapacity = Number(request.query.capacity || 0);
    const filter = { capacity: { $gte: minCapacity } };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
        { features: new RegExp(search, "i") }
      ];
    }

    const halls = await Hall.find(filter).sort({ createdAt: 1 });
    response.json(halls.map(serializeHall));
  } catch (error) {
    next(error);
  }
});

hallRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  body("name").trim().isLength({ min: 2 }),
  body("capacity").isInt({ min: 1 }),
  body("pricePerDay").isInt({ min: 1 }),
  body("location").trim().isLength({ min: 2 }),
  validate,
  async (request, response, next) => {
    try {
      const hall = await Hall.create({
        slug: request.body.id || slugify(request.body.name),
        name: request.body.name,
        capacity: request.body.capacity,
        pricePerDay: request.body.pricePerDay,
        location: request.body.location,
        features: request.body.features || [],
        availabilityStatus: request.body.availabilityStatus || "Available",
        bookedDates: [],
        imageUrl: request.body.imageUrl
      });
      const halls = await Hall.find().sort({ createdAt: 1 });
      broadcast("hall.created", { hall: serializeHall(hall), halls: halls.map(serializeHall) });
      response.status(201).json(serializeHall(hall));
    } catch (error) {
      next(error);
    }
  }
);

hallRouter.put("/:id", requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const hall = await Hall.findOneAndUpdate({ slug: request.params.id }, request.body, { new: true });
    if (!hall) return response.status(404).json({ message: "Hall not found" });
    const halls = await Hall.find().sort({ createdAt: 1 });
    broadcast("hall.updated", { hall: serializeHall(hall), halls: halls.map(serializeHall) });
    response.json(serializeHall(hall));
  } catch (error) {
    next(error);
  }
});

hallRouter.delete("/:id", requireAuth, requireAdmin, async (request, response, next) => {
  try {
    const hall = await Hall.findOneAndDelete({ slug: request.params.id });
    if (!hall) return response.status(404).json({ message: "Hall not found" });
    const halls = await Hall.find().sort({ createdAt: 1 });
    broadcast("hall.deleted", { hall: serializeHall(hall), halls: halls.map(serializeHall) });
    response.json(serializeHall(hall));
  } catch (error) {
    next(error);
  }
});
