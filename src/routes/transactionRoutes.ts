import { Router } from "express";

import {
  getAllTransactions,
  getMyTransactions,
} from "../controllers/transactionController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.get(
  "/my",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("customer"),
  getMyTransactions,
);

router.get(
  "/",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  getAllTransactions,
);

export default router;
