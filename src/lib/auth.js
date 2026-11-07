import "server-only";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// Cache the MongoDB connection across Next.js hot reloads.
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/doctor-tracker";
const mongo = globalThis.__doctorsTrackerMongo || new MongoClient(uri, { maxPoolSize: 10 });
if (process.env.NODE_ENV !== "production") globalThis.__doctorsTrackerMongo = mongo;

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
