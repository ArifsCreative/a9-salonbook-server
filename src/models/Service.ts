
import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
  createdAt: Date;
}

const serviceSchema = new Schema<IService>({
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },

  category: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => value > 0,
      message: "Price must be a positive number.",
    },
  },

  duration: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => value > 0,
      message: "Duration must be a positive number.",
    },
  },

  image: {
    type: String,
    required: true,
    trim: true,
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Service =
  mongoose.models.Service ||
  mongoose.model<IService>("Service", serviceSchema);

export default Service;
