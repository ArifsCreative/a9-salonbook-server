
import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/profileController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";

const router = Router();

// Both customers and admins can manage their own profiles
router.use(
  verifyToken,
  loadCurrentUser,
  checkBlockedUser
);

// Get own profile
router.get("/me", getMyProfile);

// Update own profile
router.patch("/me", updateMyProfile);

export default router;
