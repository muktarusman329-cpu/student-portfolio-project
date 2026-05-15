import bcrypt from "bcryptjs";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";

export const authRouter = Router();

const validate = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return response.status(422).json({ errors: errors.array() });
  return next();
};

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

authRouter.post(
  "/signup",
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 0 }),
  validate,
  async (request, response, next) => {
    try {
      const exists = await User.exists({ email: request.body.email });
      if (exists) return response.status(409).json({ message: "Email already registered" });

      const user = await User.create({
        name: request.body.name,
        email: request.body.email,
        passwordHash: await bcrypt.hash(request.body.password, 12),
        role: "user"
      });

      response.status(201).json({ token: signToken(publicUser(user)), user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  validate,
  async (request, response, next) => {
    try {
      const user = await User.findOne({ email: request.body.email });
      if (!user) return response.status(401).json({ message: "Invalid login credentials" });

      const passwordMatches = await bcrypt.compare(request.body.password, user.passwordHash);
      if (!passwordMatches) return response.status(401).json({ message: "Invalid login credentials" });

      response.json({ token: signToken(publicUser(user)), user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post("/password-reset", body("email").isEmail().normalizeEmail(), validate, (request, response) => {
  response.json({ message: `Password reset link queued for ${request.body.email}` });
});
