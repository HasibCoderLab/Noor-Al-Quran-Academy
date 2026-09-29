import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";
import Booking from "../src/models/Booking.js";
import Review from "../src/models/Review.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all([User.init(), Booking.init(), Review.init()]);
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.deleteMany({}))
  );
});

const validUser = () => ({
  name: "Test Student",
  email: "  Student@Example.COM ",
  password: "secret123",
  country: "Bangladesh",
});

describe("User model", () => {
  it("hashes the password on save", async () => {
    const user = await User.create(validUser());
    expect(user.password).not.toBe("secret123");
    expect(user.password).toMatch(/^\$2[a-z]\$/);
    expect(await user.comparePassword("secret123")).toBe(true);
    expect(await user.comparePassword("wrong-password")).toBe(false);
  });

  it("normalizes email casing and whitespace", async () => {
    const user = await User.create(validUser());
    expect(user.email).toBe("student@example.com");
  });

  it("applies safe defaults", async () => {
    const user = await User.create(validUser());
    expect(user.role).toBe("student");
    expect(user.emailVerified).toBe(true);
    expect(user.tokenVersion).toBe(0);
  });

  it("never selects the password by default", async () => {
    const created = await User.create(validUser());
    const found = await User.findById(created._id);
    expect(found.password).toBeUndefined();
    const withPassword = await User.findById(created._id).select("+password");
    expect(withPassword.password).toMatch(/^\$2[a-z]\$/);
  });

  it("rejects duplicate emails", async () => {
    await User.create(validUser());
    const duplicate = User.create(validUser());
    await expect(duplicate).rejects.toMatchObject({ code: 11000 });
  });

  it("validates email format", async () => {
    const user = User.create({ ...validUser(), email: "not-an-email" });
    await expect(user).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("validates password length", async () => {
    const user = User.create({ ...validUser(), password: "12345" });
    await expect(user).rejects.toThrow(mongoose.Error.ValidationError);
  });
});

const validBooking = () => ({
  name: "Guest Name",
  email: "guest@example.com",
  whatsapp: "+8801700000000",
  course: "tajweed",
  date: "2030-01-05",
  day: "sat",
  time: "10:00",
  duration: 45,
});

describe("Booking model", () => {
  it("creates a booking with safe defaults", async () => {
    const booking = await Booking.create(validBooking());
    expect(booking.type).toBe("free-trial");
    expect(booking.status).toBe("pending");
    expect(booking.user).toBeNull();
  });

  it("rejects unknown courses and statuses", async () => {
    await expect(
      Booking.create({ ...validBooking(), course: "mind-reading" })
    ).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(
      Booking.create({ ...validBooking(), status: "paid" })
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("rejects durations outside 30/45/60", async () => {
    await expect(
      Booking.create({ ...validBooking(), duration: 15 })
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("rejects malformed dates and weekday names", async () => {
    await expect(
      Booking.create({ ...validBooking(), date: "05-01-2030" })
    ).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(
      Booking.create({ ...validBooking(), day: "funday" })
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("requires contact and scheduling fields", async () => {
    for (const field of ["name", "email", "whatsapp", "course", "time"]) {
      const payload = { ...validBooking() };
      delete payload[field];
      await expect(Booking.create(payload)).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    }
  });
});

const validReview = (overrides = {}) => ({
  name: "Reviewer",
  country: "Bangladesh",
  course: "hifz",
  text: "An excellent teacher, very patient with my children.",
  rating: 5,
  ...overrides,
});

describe("Review model", () => {
  it("creates a review pending moderation by default", async () => {
    const review = await Review.create(validReview());
    expect(review.status).toBe("pending");
  });

  it("requires a course", async () => {
    const payload = validReview();
    delete payload.course;
    await expect(Review.create(payload)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
    await expect(
      Review.create(validReview({ course: "astronomy" }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("enforces rating bounds", async () => {
    await expect(
      Review.create(validReview({ rating: 0 }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
    await expect(
      Review.create(validReview({ rating: 6 }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("enforces required text", async () => {
    await expect(
      Review.create(validReview({ text: "" }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("caps text length at the schema limit", async () => {
    await expect(
      Review.create(validReview({ text: "x".repeat(2001) }))
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
