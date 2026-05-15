import bcrypt from "bcryptjs";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import { signToken } from "../middleware/auth.js";
import { users } from "../data/dummyData.js";

export const authRouter = Router();

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() });
  }
  return next();
};

authRouter.post(
  "/signup",
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 0 }),
  validate,
  async (request, response) => {
    const exists = users.some((user) => user.email === request.body.email);
    if (exists) return response.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(request.body.password, 12);
    const user = { id: `USR-${users.length + 1}`, name: request.body.name, email: request.body.email, passwordHash, role: "user" };
    users.push(user);
    response.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }
);

authRouter.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  validate,
  async (request, response) => {
    const user = users.find((entry) => entry.email === request.body.email);
    if (!user) return response.status(401).json({ message: "Invalid login credentials" });

    const passwordMatches = user.passwordHash
      ? await bcrypt.compare(request.body.password, user.passwordHash)
      : user.password === request.body.password;

    if (!passwordMatches) return response.status(401).json({ message: "Invalid login credentials" });

    response.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }
);

authRouter.post("/password-reset", body("email").isEmail().normalizeEmail(), validate, (request, response) => {
  response.json({ message: `Password reset link queued for ${request.body.email}` });
});
