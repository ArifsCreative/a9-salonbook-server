import { Router } from "express";
import { getAllTransactions } from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.get(
  "/",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  getAllTransactions,
);

export default router;
