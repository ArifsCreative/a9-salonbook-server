import { Router } from "express";

import {
  getCustomerDashboardStats,
  getAdminDashboardStats,
} from "../controllers/dashboardController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

// Customer Dashboard
router.get(
  "/customer",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("customer"),
  getCustomerDashboardStats,
);

// Admin Dashboard
router.get(
  "/admin",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  getAdminDashboardStats,
);

export default router;
