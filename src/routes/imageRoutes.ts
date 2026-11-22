import { Router } from "express";

import { uploadServiceImage } from "../controllers/imageController.js";
import { uploadImage } from "../middleware/uploadImage.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { loadCurrentUser } from "../middleware/loadCurrentUser.js";
import { checkBlockedUser } from "../middleware/checkBlockedUser.js";
import { verifyRole } from "../middleware/verifyRole.js";
import multer from "multer";
import type { RequestHandler } from "express";

const handleImageUpload: RequestHandler = (req, res, next) => {
  uploadImage.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Image exceeds the maximum upload size of 5 MB."
          : error.message;

      res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        success: false,
        message,
      });
      return;
    }

    if (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Image upload failed.",
      });
      return;
    }

    next();
  });
};

const router = Router();

// Admin only: Upload service image
router.post(
  "/upload",
  verifyToken,
  loadCurrentUser,
  checkBlockedUser,
  verifyRole("admin"),
  handleImageUpload,
  uploadServiceImage,
);

export default router;
