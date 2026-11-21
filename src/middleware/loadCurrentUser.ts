
import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import { mongoDb } from "../lib/mongodb.js";

export const loadCurrentUser = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = res.locals.auth;
    const userId = auth?.sub;

    if (
      !userId ||
      typeof userId !== "string" ||
      !ObjectId.isValid(userId)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid user identity",
      });
      return;
    }

    const userCollection = mongoDb.collection("users");

    const user = await userCollection.findOne({
      _id: new ObjectId(userId),
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account not found",
      });
      return;
    }

    res.locals.currentUser = {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };

    next();
  } catch (error) {
    console.error("Current user lookup failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify user account",
    });
  }
};
