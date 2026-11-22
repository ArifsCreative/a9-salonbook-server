import type { Request, Response } from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import Transaction from "../models/Transaction.js";
import { mongoDb } from "../lib/mongodb.js";

// Customer Dashboard Statistics
export const getCustomerDashboardStats = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const customerId = new mongoose.Types.ObjectId(res.locals.currentUser.id);

    const [total, pending, confirmed, cancelled] = await Promise.all([
      Appointment.countDocuments({ customerId }),
      Appointment.countDocuments({ customerId, status: "pending" }),
      Appointment.countDocuments({ customerId, status: "confirmed" }),
      Appointment.countDocuments({ customerId, status: "cancelled" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments: total,
        pendingAppointments: pending,
        confirmedAppointments: confirmed,
        cancelledAppointments: cancelled,
      },
    });
  } catch (error) {
    console.error("Customer dashboard statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load customer dashboard statistics.",
    });
  }
};

// Admin Dashboard Statistics
export const getAdminDashboardStats = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = mongoDb.collection("users");

    const [
      totalCustomers,
      activeServices,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      successfulPayments,
      revenueResult,
    ] = await Promise.all([
      users.countDocuments({ role: "customer" }),
      Service.countDocuments({ status: "active" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      Appointment.countDocuments({ status: "confirmed" }),
      Transaction.countDocuments({ status: "paid" }),
      Transaction.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        activeServices,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        successfulPayments,
        totalRevenue: revenueResult[0]?.total ?? 0,
      },
    });
  } catch (error) {
    console.error("Admin dashboard statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard statistics.",
    });
  }
};
