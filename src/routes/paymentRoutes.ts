
import { Router } from "express";

import {
  createCheckoutSession,
  getPaymentStatus,
} from "../controllers/paymentController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

const customerAuth = [
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("customer"),
];

// Customer: Create checkout session for own confirmed appointment
router.post(
  "/checkout/:id",
  ...customerAuth,
  createCheckoutSession
);

// Customer: Check payment status
router.get(
  "/status/:sessionId",
  ...customerAuth,
  getPaymentStatus
);

export default router;
