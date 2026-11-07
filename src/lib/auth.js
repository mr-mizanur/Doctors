import "server-only";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// Cache the MongoDB connection across Next.js hot reloads.
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/doctor-tracker";
const mongo = globalThis.__doctorsTrackerMongo || new MongoClient(uri, { maxPoolSize: 10 });
if (process.env.NODE_ENV !== "production") globalThis.__doctorsTrackerMongo = mongo;

export const auth = betterAuth({
  database: mongodbAdapter(mongo.db(process.env.MONGODB_DB || "doctor-tracker")),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});
