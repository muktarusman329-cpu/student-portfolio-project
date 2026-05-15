import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase, mongoUri } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { bookingRouter } from "./routes/bookings.js";
import { hallRouter } from "./routes/halls.js";
import { paymentRouter } from "./routes/payments.js";
import { adminRouter } from "./routes/admin.js";
import { eventsRouter } from "./routes/events.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://127.0.0.1:5173";
const allowedOrigins = new Set([
  clientUrl,
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5174"
]);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "Elite Event Hub API", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/halls", hallRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/events", eventsRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.status || 500).json({ message: error.message || "Unexpected server error" });
});

async function start() {
  try {
    await connectDatabase();
    console.log(`MongoDB connected at ${mongoUri}`);
  } catch (error) {
    console.error("MongoDB connection failed. Start MongoDB or update MONGODB_URI in .env.");
    console.error(error.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Elite Event Hub API running on http://127.0.0.1:${port}`);
  });
}

start();
