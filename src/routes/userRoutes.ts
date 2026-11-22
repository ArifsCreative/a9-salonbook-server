
import { Router } from "express";

import {
  getAllCustomers,
  updateCustomerBlockStatus,
} from "../controllers/userController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

router.use(
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin")
);

router.get("/customers", getAllCustomers);

router.patch(
  "/customers/:id/status",
  updateCustomerBlockStatus
);

export default router;
