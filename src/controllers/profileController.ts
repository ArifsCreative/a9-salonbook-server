
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { mongoDb } from "../lib/mongodb.js";

// Get logged-in user's profile
export const getMyProfile = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = res.locals.currentUser.id;

    const user = await mongoDb.collection("users").findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          phone: 1,
          role: 1,
          isBlocked: 1,
          createdAt: 1,
        },
      }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile.",
    });
  }
};

// Update logged-in user's permitted profile information
export const updateMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = res.locals.currentUser.id;
    const { name, image, phone } = req.body;

    if (
      name === undefined &&
      image === undefined &&
      phone === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "Provide at least one profile field to update.",
      });
      return;
    }

    const updates: {
      name?: string;
      image?: string;
      phone?: string;
    } = {};

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        res.status(400).json({
          success: false,
          message: "Name must contain 2 to 100 characters.",
        });
        return;
      }

      updates.name = name.trim();
    }

    if (image !== undefined) {
      if (
        typeof image !== "string" ||
        image.length > 2048 ||
        !/^https?:\/\/\S+$/i.test(image)
      ) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid profile image URL.",
        });
        return;
      }

      updates.image = image.trim();
    }

    if (phone !== undefined) {
      if (
        typeof phone !== "string" ||
        phone.trim().length > 25 ||
        (phone.trim() !== "" &&
          !/^[+0-9()\-\s]+$/.test(phone.trim()))
      ) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid phone number.",
        });
        return;
      }

      updates.phone = phone.trim();
    }

    const result = await mongoDb.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
      return;
    }

    const updatedUser = await mongoDb.collection("users").findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          phone: 1,
          role: 1,
          isBlocked: 1,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};
