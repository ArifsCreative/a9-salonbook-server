
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  appointmentId: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },

  customerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
    min: 0,
  },

  currency: {
    type: String,
    required: true,
    default: "usd",
  },

  stripeSessionId: {
    type: String,
    required: true,
    unique: true,
  },

  status: {
    type: String,
    enum: ["paid", "failed"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;
