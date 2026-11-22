
import type { Request, Response } from "express";
import Transaction from "../models/Transaction.js";

// Admin: Get all payment transactions
export const getAllTransactions = async (
  _req: Request,
  res: Response
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
