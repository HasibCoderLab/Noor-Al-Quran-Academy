import mongoose from "mongoose";
import User from "../src/models/User.js";
import Availability from "../src/models/Availability.js";
import { SITE } from "../src/data/siteData.js";
import { weekdayOf } from "../src/lib/schedule.js";

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
  {
    name: "Demo Student",
    email: "demo.student@noor-academy.test",
    password: "NoorDemo@2026!",
    country: "Bangladesh",
    role: "student",
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const backfill = await User.updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: true } }
  );
  if (backfill.modifiedCount > 0) {
    console.log(`[seed] Marked ${backfill.modifiedCount} legacy user(s) as verified`);
  }

  for (const data of SEED_USERS) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      console.log(`[seed] Already exists: ${data.email}`);
      continue;
    }
    await User.create(data);
    console.log(`[seed] Created: ${data.email} / ${data.password}`);
  }

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
  }).format(new Date());
  const startDate = new Date(today + "T00:00:00Z");
  let slotCount = 0;
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(startDate);
    current.setUTCDate(startDate.getUTCDate() + i);
    const date = current.toISOString().slice(0, 10);
    const day = weekdayOf(date);
    const times = day === "fri" ? SITE.classTimes.friday : SITE.classTimes.satThu;
    for (const time of times) {
      const result = await Availability.updateOne(
        { date, time, duration: 30 },
        {
          $setOnInsert: { date, day, time, duration: 30, status: "available" },
        },
        { upsert: true }
      );
      if (result.upsertedCount > 0) slotCount += 1;
    }
  }
  if (slotCount > 0) console.log(`[seed] Created ${slotCount} availability slot(s)`);

  await mongoose.disconnect();
  console.log("[seed] Done.");
}

seed().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
