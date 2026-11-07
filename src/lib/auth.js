import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// ১. MongoDB ক্লায়েন্ট কানেকশন
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(); // ডাটাবেজ নাম .env এর URI থেকে automatically নিয়ে নেবে

export const auth = betterAuth({
  // ২. মঙ্গোডিবি অ্যাডাপ্টার এখানে কনফিগার করতে হবে
  database: mongodbAdapter(db),
  
  emailAndPassword: {
    enabled: true,
  },
  
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});