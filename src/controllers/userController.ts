
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { mongoDb } from "../lib/mongodb.js";

// Admin: Get all registered customers
export const getAllCustomers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = mongoDb.collection("users");

    const customers = await users
      .find(
        { role: "customer" },
        {
          projection: {
            name: 1,
            email: 1,
            image: 1,
            role: 1,
            isBlocked: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      total: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve customers.",
    });
  }
};

// Admin: Block or unblock a customer
export const updateCustomerBlockStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { isBlocked } = req.body;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
      return;
    }

    if (typeof isBlocked !== "boolean") {
      res.status(400).json({
        success: false,
        message: "isBlocked must be true or false.",
      });
      return;
    }

    const users = mongoDb.collection("users");

    const result = await users.updateOne(
      {
        _id: new ObjectId(id),
        role: "customer",
      },
      {
        $set: { isBlocked },
      }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: isBlocked
        ? "Customer blocked successfully."
        : "Customer unblocked successfully.",
    });
  } catch (error) {
    console.error("Update customer status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer status.",
    });
  }
};
