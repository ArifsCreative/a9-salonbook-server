
import { Router } from "express";

import {
  createAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

// Customer authentication
const customerAuth = [
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("customer"),
];

// Admin authentication
const adminAuth = [
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
];

// Customer: Create appointment
router.post("/", ...customerAuth, createAppointment);

// Customer: View own appointments
router.get("/my", ...customerAuth, getMyAppointments);

// Admin: View all appointments
router.get("/admin/all", ...adminAuth, getAllAppointments);

// Admin: Confirm or cancel appointment
router.patch(
  "/admin/:id/status",
  ...adminAuth,
  updateAppointmentStatus
);

// Customer: Cancel own pending appointment
router.patch("/:id/cancel", ...customerAuth, cancelMyAppointment);

export default router;
