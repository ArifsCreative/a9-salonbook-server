import { Request, Response } from "express";
import mongoose, { type SortOrder } from "mongoose";
import Service from "../models/Service.js";

// Get active services with search, category filter and price sorting
export const getServices = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { search, category, sort } = req.query;

  const filter: Record<string, unknown> = {
    status: "active",
  };

  if (typeof search === "string" && search.trim()) {
    filter.serviceName = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (typeof category === "string" && category.trim()) {
    filter.category = category.trim();
  }

  const sortOption: Record<string, 1 | -1> =
    sort === "asc"
      ? { price: 1 }
      : sort === "desc"
        ? { price: -1 }
        : { createdAt: -1 };

  const services = await Service.find(filter).sort(sortOption);

  res.status(200).json({
    success: true,
    total: services.length,
    services,
  });
};

// Get a single service by ID
export const getServiceById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid service ID",
    });
    return;
  }

  const service = await Service.findOne({
    _id: id,
    status: "active",
  });

  if (!service) {
    res.status(404).json({
      success: false,
      message: "Service not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    service,
  });
};

// Admin: Get all services
export const getAllServices = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const services = await Service.find().sort({
    createdAt: -1 as SortOrder,
  });

  res.status(200).json({
    success: true,
    total: services.length,
    services,
  });
};

// Admin: Create service
export const createService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    serviceName,
    category,
    description,
    price,
    duration,
    image,
  } = req.body;

  if (
    !serviceName?.trim() ||
    !category?.trim() ||
    !description?.trim() ||
    !image?.trim() ||
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0 ||
    !Number.isFinite(Number(duration)) ||
    Number(duration) <= 0
  ) {
    res.status(400).json({
      success: false,
      message: "Please provide valid service information.",
    });
    return;
  }

  const service = await Service.create({
    serviceName,
    category,
    description,
    price: Number(price),
    duration: Number(duration),
    image,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully.",
    service,
  });
};

// Admin: Update service
export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid service ID.",
    });
    return;
  }

  const allowedFields = [
    "serviceName",
    "category",
    "description",
    "price",
    "duration",
    "image",
    "status",
  ];

  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const service = await Service.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!service) {
    res.status(404).json({
      success: false,
      message: "Service not found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Service updated successfully.",
    service,
  });
};

// Admin: Delete service
export const deleteService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      message: "Invalid service ID.",
    });
    return;
  }

  const service = await Service.findByIdAndDelete(id);

  if (!service) {
    res.status(404).json({
      success: false,
      message: "Service not found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Service deleted successfully.",
  });
};
