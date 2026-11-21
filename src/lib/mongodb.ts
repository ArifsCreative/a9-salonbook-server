
import "dotenv/config";

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

export const mongoClient = new MongoClient(MONGODB_URI);

export const mongoDb = mongoClient.db("salonbook");
