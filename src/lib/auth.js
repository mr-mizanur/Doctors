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
// Reuse the MongoDB client in development only for the SAME connection string.
// A stale localhost client must never be reused after changing environment config.
const cached = globalThis.__doctorsTrackerMongoCache;
const mongo = cached?.uri === uri
  ? cached.client
  : new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
if (process.env.NODE_ENV !== "production") {
  globalThis.__doctorsTrackerMongoCache = { uri, client: mongo };
}

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
