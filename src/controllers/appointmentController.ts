
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";

// Customer: Create appointment
export const createAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = res.locals.currentUser.id;
    const { serviceId, appointmentDate, timeSlot, message } = req.body;

    if (
      typeof serviceId !== "string" ||
      !mongoose.Types.ObjectId.isValid(serviceId) ||
      typeof appointmentDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ||
      typeof timeSlot !== "string" ||
      !timeSlot.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide valid appointment information.",
      });
      return;
    }

    if (message !== undefined &&
        (typeof message !== "string" || message.length > 500)) {
      res.status(400).json({
        success: false,
        message: "Message must not exceed 500 characters.",
      });
      return;
    }

    const date = new Date(`${appointmentDate}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== appointmentDate ||
      date.getTime() < new Date().setUTCHours(0, 0, 0, 0)
    ) {
      res.status(400).json({
        success: false,
        message: "Please select a valid current or future date.",
      });
      return;
    }

    const service = await Service.findById(serviceId);

    if (!service || service.status !== "active") {
      res.status(404).json({
        success: false,
        message: "Active service not found.",
      });
      return;
    }

    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const existingAppointment = await Appointment.findOne({
      appointmentDate: {
        $gte: date,
        $lt: nextDay,
      },
      timeSlot: timeSlot.trim(),
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      res.status(409).json({
        success: false,
        message: "This appointment date and time slot is already booked.",
      });
      return;
    }

    const appointment = await Appointment.create({
      serviceId: new mongoose.Types.ObjectId(serviceId),
      customerId: new mongoose.Types.ObjectId(customerId),
      appointmentDate: date,
      timeSlot: timeSlot.trim(),
      message: message?.trim() || "",
      servicePrice: service.price,
      status: "pending",
      paymentStatus: "unpaid",
    });

    res.status(201).json({
      success: true,
      message: "Appointment request submitted successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create appointment.",
    });
  }
};

// Customer: Get own appointments
export const getMyAppointments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const customerId = res.locals.currentUser.id;

    const appointments = await Appointment.find({
      customerId: new mongoose.Types.ObjectId(customerId),
    })
      .populate("serviceId", "serviceName category image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get customer appointments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments.",
    });
  }
};

// Customer: Cancel own pending appointment
export const cancelMyAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
      return;
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        customerId: new mongoose.Types.ObjectId(
          res.locals.currentUser.id
        ),
        status: "pending",
      },
      { $set: { status: "cancelled" } },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Pending appointment not found or cannot be cancelled.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment.",
    });
  }
};

// Admin: Get all appointments
export const getAllAppointments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointments = await Appointment.find()
      .populate("serviceId", "serviceName category image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get all appointments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments.",
    });
  }
};

// Admin: Confirm or cancel appointment
export const updateAppointmentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (
      typeof id !== "string" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
      return;
    }

    if (!["confirmed", "cancelled"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be confirmed or cancelled.",
      });
      return;
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
      return;
    }

    if (appointment.status === "cancelled") {
      res.status(400).json({
        success: false,
        message: "Cancelled appointments cannot be changed.",
      });
      return;
    }

    if (
      status === "confirmed" &&
      appointment.status !== "pending"
    ) {
      res.status(400).json({
        success: false,
        message: "Only pending appointments can be confirmed.",
      });
      return;
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully.`,
      appointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update appointment.",
    });
  }
};
