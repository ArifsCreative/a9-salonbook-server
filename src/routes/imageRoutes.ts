
import { Router } from "express";

import { uploadServiceImage } from "../controllers/imageController.js";
import { uploadImage } from "../middleware/uploadImage.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = Router();

// Admin only: Upload service image
router.post(
  "/upload",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  uploadImage.single("image"),
  uploadServiceImage
);

export default router;
