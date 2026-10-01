import { describe, it, expect } from "vitest";
import {
  toPublicBooking,
  toAdminBooking,
  toAdminAvailability,
  toPublicOrder,
  toAdminOrder,
  toPublicProgress,
  toPublicReview,
  toAdminReview,
} from "../src/lib/serializers.js";

const bookingDoc = () => ({
  _id: "64b000000000000000000001",
  type: "free-trial",
  course: "tajweed",
  date: "2030-01-05",
  day: "sat",
  time: "10:00",
  duration: 45,
  status: "pending",
  name: "Guest",
  email: "guest@example.com",
  country: "Bangladesh",
  whatsapp: "+8801700000000",
  message: "hello",
  adminNotes: "internal only",
  passwordLeak: "should-never-appear",
  __v: 0,
  createdAt: "2030-01-01T00:00:00.000Z",
});

describe("toPublicBooking", () => {
  it("exposes only public fields", () => {
    const result = toPublicBooking(bookingDoc());
    expect(Object.keys(result).sort()).toEqual(
      [
        "id",
        "type",
        "course",
        "date",
        "day",
        "time",
        "duration",
        "status",
        "paymentStatus",
        "planName",
        "name",
        "email",
        "country",
        "whatsapp",
        "message",
        "createdAt",
      ].sort()
    );
    expect(result.paymentStatus).toBe("unpaid");
    expect(result.id).toBe("64b000000000000000000001");
    expect(JSON.stringify(result)).not.toContain("adminNotes");
    expect(JSON.stringify(result)).not.toContain("__v");
    expect(JSON.stringify(result)).not.toContain("passwordLeak");
  });
});

describe("toAdminBooking", () => {
  it("handles a populated user", () => {
    const result = toAdminBooking({
      ...bookingDoc(),
      user: { _id: "64b000000000000000000002", name: "Sara", email: "sara@x.com" },
    });
    expect(result.user).toEqual({
      id: "64b000000000000000000002",
      name: "Sara",
      email: "sara@x.com",
    });
    expect(result.updatedAt).toBeUndefined();
  });

  it("handles a raw ObjectId reference and guest bookings", () => {
    const populated = toAdminBooking({
      ...bookingDoc(),
      user: "64b000000000000000000002",
    });
    expect(populated.user.id).toBe("64b000000000000000000002");
    expect(populated.user.name).toBe("");

    const guest = toAdminBooking(bookingDoc());
    expect(guest.user).toBeNull();
  });
});

describe("toAdminAvailability", () => {
  it("serializes slot with or without a booking", () => {
    const slot = {
      _id: "64b000000000000000000003",
      date: "2030-01-05",
      day: "sat",
      time: "10:00",
      duration: 30,
      status: "booked",
      notes: "",
      booking: { _id: "64b000000000000000000001", name: "Guest", email: "g@x.com" },
    };
    expect(toAdminAvailability(slot).booking).toEqual({
      id: "64b000000000000000000001",
      name: "Guest",
      email: "g@x.com",
    });
    expect(
      toAdminAvailability({ ...slot, booking: null }).booking
    ).toBeNull();
  });
});

describe("orders", () => {
  const orderDoc = () => ({
    _id: "64b000000000000000000004",
    region: "bd",
    planName: "Popular",
    classes: 8,
    amount: 220000,
    currency: "bdt",
    status: "paid",
    stripeSessionId: "cs_test_123",
    paidAt: "2030-01-02T00:00:00.000Z",
    createdAt: "2030-01-01T00:00:00.000Z",
    updatedAt: "2030-01-02T00:00:00.000Z",
    email: "buyer@x.com",
    stripeEventId: "evt_123",
    __v: 0,
  });

  it("keeps the public shape free of identity and webhook internals", () => {
    const result = toPublicOrder(orderDoc());
    expect(Object.keys(result).sort()).toEqual(
      [
        "id",
        "region",
        "planName",
        "classes",
        "amount",
        "currency",
        "status",
        "bookingId",
        "stripeSessionId",
        "paidAt",
        "createdAt",
      ].sort()
    );
    expect(result.bookingId).toBe("");
    const json = JSON.stringify(result);
    expect(json).not.toContain("buyer@x.com");
    expect(json).not.toContain("evt_123");
  });

  it("extends the public shape for admins", () => {
    const result = toAdminOrder(orderDoc());
    expect(result.email).toBe("buyer@x.com");
    expect(result.updatedAt).toBe("2030-01-02T00:00:00.000Z");
    expect(result.user).toBeNull();
    expect(result.amount).toBe(220000);
  });
});

describe("toPublicProgress", () => {
  it("never exposes the user reference", () => {
    const result = toPublicProgress({
      _id: "64b000000000000000000005",
      user: "64b000000000000000000002",
      course: "hifz",
      status: "in-progress",
      lessonsCompleted: 3,
      totalLessons: 20,
      notes: "good",
      __v: 0,
    });
    expect(result.user).toBeUndefined();
    expect(Object.keys(result)).not.toContain("user");
    expect(result.id).toBe("64b000000000000000000005");
    expect(result.lessonsCompleted).toBe(3);
  });
});

describe("reviews", () => {
  const reviewDoc = () => ({
    _id: "64b000000000000000000006",
    user: "64b000000000000000000002",
    name: "Sara",
    country: "Bangladesh",
    course: "hifz",
    text: "Great teacher.",
    rating: 5,
    status: "approved",
    createdAt: "2030-01-01T00:00:00.000Z",
    updatedAt: "2030-01-01T00:00:00.000Z",
    __v: 0,
  });

  it("keeps user identity out of the public shape", () => {
    const result = toPublicReview(reviewDoc());
    expect(result.user).toBeUndefined();
    expect(result.status).toBe("approved");
    expect(Object.keys(result)).not.toContain("__v");
  });

  it("adds the user for admins (populated or raw)", () => {
    const raw = toAdminReview(reviewDoc());
    expect(raw.user.id).toBe("64b000000000000000000002");

    const populated = toAdminReview({
      ...reviewDoc(),
      user: { _id: "64b000000000000000000002", name: "Sara", email: "s@x.com" },
    });
    expect(populated.user.email).toBe("s@x.com");
  });
});
