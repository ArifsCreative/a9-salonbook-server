
import { Router } from "express";

import {
  getServices,
  getServiceById,
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

// Public: Browse active services
router.get("/", getServices);

// Admin: View all services, including inactive
router.get(
  "/admin/all",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  getAllServices
);

// Admin: Create service
router.post(
  "/",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  createService
);

// Admin: Update service
router.patch(
  "/:id",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  updateService
);

// Admin: Delete service
router.delete(
  "/:id",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  deleteService
);

// Customer: View service details
router.get(
  "/:id",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("customer"),
  getServiceById
);

export default router;
