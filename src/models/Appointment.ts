
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  serviceId: Types.ObjectId;
  customerId: Types.ObjectId;
  appointmentDate: Date;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },

  customerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  appointmentDate: {
    type: Date,
    required: true,
  },

  timeSlot: {
    type: String,
    required: true,
    trim: true,
  },

  message: {
    type: String,
    trim: true,
    maxlength: 500,
  },

  servicePrice: {
    type: Number,
    required: true,
    min: 0,
  },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

appointmentSchema.index({
  customerId: 1,
  createdAt: -1,
});

appointmentSchema.index({
  appointmentDate: 1,
  timeSlot: 1,
  status: 1,
});

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
