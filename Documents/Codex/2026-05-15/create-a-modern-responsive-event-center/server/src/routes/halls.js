import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import { halls } from "../data/dummyData.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { broadcast } from "../realtime.js";

export const hallRouter = Router();

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

hallRouter.get("/", query("capacity").optional().isInt({ min: 1 }), validate, (request, response) => {
  const search = String(request.query.search || "").toLowerCase();
  const minCapacity = Number(request.query.capacity || 0);
  const results = halls.filter((hall) => {
    const searchable = `${hall.name} ${hall.location} ${hall.features.join(" ")}`.toLowerCase();
    return searchable.includes(search) && hall.capacity >= minCapacity;
  });
  response.json(results);
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
  (request, response) => {
    const hall = { id: request.body.id || request.body.name.toLowerCase().replace(/\W+/g, "-"), ...request.body, bookedDates: [] };
    halls.push(hall);
    broadcast("hall.created", { hall, halls });
    response.status(201).json(hall);
  }
);

hallRouter.put("/:id", requireAuth, requireAdmin, (request, response) => {
  const index = halls.findIndex((hall) => hall.id === request.params.id);
  if (index === -1) return response.status(404).json({ message: "Hall not found" });
  halls[index] = { ...halls[index], ...request.body };
  broadcast("hall.updated", { hall: halls[index], halls });
  response.json(halls[index]);
});

hallRouter.delete("/:id", requireAuth, requireAdmin, (request, response) => {
  const index = halls.findIndex((hall) => hall.id === request.params.id);
  if (index === -1) return response.status(404).json({ message: "Hall not found" });
  const [removed] = halls.splice(index, 1);
  broadcast("hall.deleted", { hall: removed, halls });
  response.json(removed);
});
