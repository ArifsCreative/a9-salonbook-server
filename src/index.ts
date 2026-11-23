import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import connectDB from "./config/db.js";
import { auth } from "./lib/auth.js";
import { verifyToken } from "./middleware/verifyToken.js";
import { loadCurrentUser } from "./middleware/loadCurrentUser.js";
import { checkBlockedUser } from "./middleware/checkBlockedUser.js";
import { verifyRole } from "./middleware/verifyRole.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Better Auth handler — must be before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

// Stripe webhook: raw body required for signature verification
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

// JSON middleware for other API routes
app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/appointments", appointmentRoutes);

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SalonBook API",
  });
});

// Health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "SalonBook server is running",
  });
});

// Temporary Customer test route
app.get(
  "/api/test/customer",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("customer"),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Customer authorization successful",
      user: res.locals.currentUser,
    });
  },
);

app.get(
  "/api/test/admin",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Admin authorization successful",
    });
  },
);

export default app;

if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDB();

      app.listen(PORT, () => {
        console.log(`SalonBook running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Server startup failed:", error);
      process.exit(1);
    }
  };

  void startServer();
}
