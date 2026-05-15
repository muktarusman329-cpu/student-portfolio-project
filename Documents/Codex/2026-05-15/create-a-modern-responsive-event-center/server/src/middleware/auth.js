import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "development-only-secret";

export function requireAuth(request, response, next) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return response.status(401).json({ message: "Authentication token required" });
  }

  try {
    request.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== "admin") {
    return response.status(403).json({ message: "Admin access required" });
  }
  return next();
}

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, jwtSecret, { expiresIn: "8h" });
}
