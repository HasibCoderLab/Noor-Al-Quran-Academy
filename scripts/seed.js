import mongoose from "mongoose";
import User from "../src/models/User.js";

const SEED_USERS = [
  {
    name: "Site Admin",
    email: "admin@nooralquran.com",
    password: "Admin@1234",
    country: "Bangladesh",
    role: "admin",
  },
  {
    name: "Test Student",
    email: "student@nooralquran.com",
    password: "Student@1234",
    country: "Bangladesh",
    role: "student",
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const data of SEED_USERS) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      console.log(`[seed] Already exists: ${data.email}`);
      continue;
    }
    await User.create(data);
    console.log(`[seed] Created: ${data.email} / ${data.password}`);
  }

  await mongoose.disconnect();
  console.log("[seed] Done.");
}

seed().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
