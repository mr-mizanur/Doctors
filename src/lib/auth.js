import "server-only";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";


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

const mongo = new MongoClient(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

export const authDb = mongo.db(process.env.MONGODB_DB || "doctor-tracker");

export const auth = betterAuth({
  database: mongodbAdapter(authDb),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({ data: { ...user, role: "user" } }),
      },
    },
  },
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
