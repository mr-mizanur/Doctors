import "server-only";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// Never silently fall back to localhost: a missing .env.local must be visible.
// This app uses the same MongoDB Atlas database as the standalone Express API.
const uri = process.env.MONGODB_URI?.trim();
if (!uri) {
  throw new Error(
    "MONGODB_URI is missing in the Next.js process. Create Doctors-Tracker/.env.local, " +
    "set MONGODB_URI to your MongoDB Atlas connection string, then restart npm run dev."
  );
}
if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
  throw new Error("Invalid MONGODB_URI scheme. Expected mongodb:// or mongodb+srv://.");
}
// Keep a single client per auth module instance. Do not cache MongoClient on
// globalThis: Next.js development hot reload can reuse an already closed client,
// resulting in MongoTopologyClosedError on sign-up and sign-in.
const mongo = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

export const authDb = mongo.db(process.env.MONGODB_DB || "doctor-tracker");

export const auth = betterAuth({
  database: mongodbAdapter(authDb),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  // Registration must always create an ordinary user, even for a forged signup payload.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { ...user, role: "user" } }),
      },
    },
  },
  // Role is server-owned. It is never accepted from registration/profile inputs.
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
        returned: true,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});
