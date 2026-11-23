import type { Request, Response } from "express";
import Transaction from "../models/Transaction.js";

// Admin: Get all payment transactions
export const getAllTransactions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .populate("appointmentId", "appointmentDate timeSlot status")
      .sort({ createdAt: -1 });

    const totalRevenue = transactions
      .filter((transaction) => transaction.status === "paid")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    res.status(200).json({
      success: true,
      total: transactions.length,
      totalRevenue,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions.",
    });
  }
};

// Customer: Get their own payment history
export const getMyTransactions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = res.locals.currentUser;

    if (!currentUser?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const transactions = await Transaction.find({
      customerId: currentUser.id,
    })
      .populate("appointmentId", "appointmentDate timeSlot status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get my transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment history.",
    });
  }
};
