
import { Request, Response } from "express";

export const uploadServiceImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image to upload.",
      });
      return;
    }

    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: "Image hosting configuration is missing.",
      });
      return;
    }

    const formData = new FormData();

    const imageBlob = new Blob([new Uint8Array(req.file.buffer)], {
      type: req.file.mimetype,
    });

    formData.append("image", imageBlob, req.file.originalname);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success || !result.data?.url) {
      console.error("ImgBB upload failed:", result);

      res.status(502).json({
        success: false,
        message: "Image hosting service failed to upload the image.",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      image: {
        url: result.data.url,
        displayUrl: result.data.display_url,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during image upload.",
    });
  }
};
