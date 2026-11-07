import { loadEnvConfig } from "@next/env";
import { MongoClient } from "mongodb";

const { loadedEnvFiles } = loadEnvConfig(process.cwd(), true);
console.log("Next.js environment files found:",
  loadedEnvFiles.length ? loadedEnvFiles.map((f) => f.path).join(", ") : "none");

const uri = process.env.MONGODB_URI?.trim();
const secret = process.env.BETTER_AUTH_SECRET?.trim();
const errors = [];

if (!uri) {
  errors.push("MONGODB_URI is missing. Add it to Doctors-Tracker/.env.local.");
} else if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
  errors.push("MONGODB_URI has an invalid scheme.");
}
if (!secret || secret.length < 32) {
  errors.push("BETTER_AUTH_SECRET must contain at least 32 characters.");
}

if (errors.length) {
  for (const err of errors) console.error("Configuration error:", err);
  process.exitCode = 1;
} else {
  const local = /^(mongodb:\/\/(localhost|127\.0\.0\.1)(:|\/|\?))/i.test(uri);
  console.log("Database setting:", local ? "Local MongoDB" : "MongoDB connection string configured");
  if (local) console.warn("Notice: This points to local MongoDB, not your intended Atlas cluster.");

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });
  try {
    await client.connect();
    await client.db(process.env.MONGODB_DB || "doctor-tracker").command({ ping: 1 });
    console.log("Success: MongoDB connection and ping succeeded.");
  } catch (err) {
    console.error("MongoDB connection failed:", err?.name || "Error");
    if (/ECONNREFUSED|ServerSelection|Network/i.test(err?.name + " " + err?.message)) {
      console.error("Check the Atlas connection string, internet connection and Atlas Network Access IP allowlist.");
    } else if (/Authentication/i.test(err?.name + " " + err?.message)) {
      console.error("Check Atlas database username and password.");
    } else {
      console.error("Check the Atlas database host, user permissions and IP allowlist.");
    }
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
