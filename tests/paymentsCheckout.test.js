import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectDB: vi.fn(async () => {}),
  requireUser: vi.fn(),
  getStripe: vi.fn(),
  orderCreate: vi.fn(),
  orderDeleteOne: vi.fn(),
  bookingFindOne: vi.fn(),
  bookingCreate: vi.fn(),
  bookingDeleteOne: vi.fn(),
  availabilityFindOneAndUpdate: vi.fn(),
  availabilityUpdateOne: vi.fn(),
  sessionCreate: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body, init) => ({ body, status: init?.status ?? 200 }),
  },
}));

vi.mock("../src/lib/db.js", () => ({ connectDB: mocks.connectDB }));
vi.mock("../src/lib/session.js", () => ({ requireUser: mocks.requireUser }));
vi.mock("../src/lib/stripe.js", () => ({ getStripe: mocks.getStripe }));
vi.mock("../src/lib/rateLimit.js", () => ({
  rateLimit: () => ({ ok: true, remaining: 5, retryAfter: 0 }),
  clientIp: () => "127.0.0.1",
  rateLimitedResponse: (retryAfter) => ({
    error: "Too many attempts.",
    code: "RATE_LIMITED",
    retryAfter,
  }),
}));
vi.mock("../src/models/Order.js", () => ({
  default: { create: mocks.orderCreate, deleteOne: mocks.orderDeleteOne },
}));
vi.mock("../src/models/Booking.js", () => ({
  default: {
    findOne: mocks.bookingFindOne,
    create: mocks.bookingCreate,
    deleteOne: mocks.bookingDeleteOne,
  },
}));
vi.mock("../src/models/Availability.js", () => ({
  default: {
    findOneAndUpdate: mocks.availabilityFindOneAndUpdate,
    updateOne: mocks.availabilityUpdateOne,
  },
}));

let post;

const USER = {
  _id: "user-1",
  name: "Sara",
  email: "sara@example.com",
  whatsapp: "+8801700000000",
  country: "Bangladesh",
};

function makeRequest(body) {
  return {
    headers: { get: () => null },
    json: async () => body,
  };
}

beforeEach(async () => {
  vi.clearAllMocks();
  mocks.requireUser.mockResolvedValue({ user: USER, error: null, status: null });
  mocks.bookingFindOne.mockResolvedValue(null);
  mocks.bookingCreate.mockImplementation(async (doc) => ({
    ...doc,
    _id: "booking-1",
    save: vi.fn(async () => {}),
  }));
  mocks.availabilityFindOneAndUpdate.mockResolvedValue({ _id: "slot-1" });
  mocks.orderCreate.mockImplementation(async (doc) => ({
    ...doc,
    _id: "order-1",
    save: vi.fn(async () => {}),
  }));
  mocks.sessionCreate.mockResolvedValue({
    id: "cs_1",
    url: "https://stripe.test/cs_1",
  });
  mocks.getStripe.mockReturnValue({
    checkout: { sessions: { create: mocks.sessionCreate } },
  });

  ({ POST: post } = await import(
    "../src/app/api/payments/checkout/route.js"
  ));
});

const SLOT = {
  region: "intl",
  planIndex: 1,
  course: "hifz",
  date: "2030-01-05",
  time: "10:00",
  duration: 45,
  whatsapp: "+8801700000000",
};

describe("POST /api/payments/checkout — auth and validation", () => {
  it("requires authentication", async () => {
    mocks.requireUser.mockResolvedValue({
      user: null,
      error: "Not authenticated.",
      status: 401,
    });
    const result = await post(makeRequest(SLOT));
    expect(result.status).toBe(401);
    expect(result.body.code).toBe("NOT_AUTHENTICATED");
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });

  it("rejects an invalid plan", async () => {
    const result = await post(makeRequest({ ...SLOT, planIndex: 99 }));
    expect(result.status).toBe(400);
    expect(result.body.code).toBe("VALIDATION");
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });

  it("rejects an invalid course", async () => {
    const result = await post(makeRequest({ ...SLOT, course: "astronomy" }));
    expect(result.status).toBe(400);
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });

  it("rejects a past date", async () => {
    const result = await post(makeRequest({ ...SLOT, date: "2000-01-01" }));
    expect(result.status).toBe(400);
    expect(result.body.code).toBe("PAST_DATE");
  });

  it("reports missing Stripe configuration without creating records", async () => {
    mocks.getStripe.mockReturnValue(null);
    const result = await post(makeRequest(SLOT));
    expect(result.status).toBe(503);
    expect(result.body.code).toBe("STRIPE_NOT_CONFIGURED");
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });
});

describe("POST /api/payments/checkout — slot binding", () => {
  it("creates a linked pending booking and order and returns the Stripe url", async () => {
    const result = await post(makeRequest(SLOT));

    expect(result.status).toBe(200);
    expect(result.body.url).toBe("https://stripe.test/cs_1");

    // Booking created as a pending, unpaid subscription.
    const bookingDoc = mocks.bookingCreate.mock.calls[0][0];
    expect(bookingDoc).toMatchObject({
      user: "user-1",
      type: "subscription",
      course: "hifz",
      date: "2030-01-05",
      time: "10:00",
      duration: 45,
      status: "pending",
      paymentStatus: "pending",
      planName: "Popular",
    });

    // Slot claimed atomically for that booking.
    expect(mocks.availabilityFindOneAndUpdate).toHaveBeenCalledWith(
      { date: "2030-01-05", time: "10:00", duration: 45, status: "available" },
      { $set: { status: "booked", booking: "booking-1" } }
    );

    // Order linked to the booking, price decided by the server.
    const orderDoc = mocks.orderCreate.mock.calls[0][0];
    expect(orderDoc).toMatchObject({
      user: "user-1",
      booking: "booking-1",
      course: "hifz",
      amount: 3600,
      currency: "usd",
      status: "pending",
    });

    // Stripe metadata carries trusted server-side ids only.
    const sessionArgs = mocks.sessionCreate.mock.calls[0][0];
    expect(sessionArgs.metadata).toEqual({
      orderId: "order-1",
      userId: "user-1",
      bookingId: "booking-1",
    });
    expect(sessionArgs.line_items[0].price_data.unit_amount).toBe(3600);
  });

  it("never trusts a client-supplied price or currency", async () => {
    await post(
      makeRequest({ ...SLOT, amount: 1, currency: "usd", price: 1 })
    );
    const orderDoc = mocks.orderCreate.mock.calls[0][0];
    expect(orderDoc.amount).toBe(3600);
    expect(orderDoc.currency).toBe("usd");
  });

  it("rejects a taken slot and removes the unconfirmed booking", async () => {
    mocks.availabilityFindOneAndUpdate.mockResolvedValue(null);

    const result = await post(makeRequest(SLOT));

    expect(result.status).toBe(409);
    expect(result.body.code).toBe("SLOT_TAKEN");
    expect(mocks.bookingDeleteOne).toHaveBeenCalledWith({ _id: "booking-1" });
    expect(mocks.orderCreate).not.toHaveBeenCalled();
  });

  it("rejects a duplicate booking for the same email/slot", async () => {
    mocks.bookingFindOne.mockResolvedValue({ _id: "existing" });
    const result = await post(makeRequest(SLOT));
    expect(result.status).toBe(409);
    expect(result.body.code).toBe("DUPLICATE_BOOKING");
    expect(mocks.bookingCreate).not.toHaveBeenCalled();
  });

  it("rolls back the booking and releases the slot when Stripe fails", async () => {
    mocks.sessionCreate.mockRejectedValue(new Error("stripe down"));

    const result = await post(makeRequest(SLOT));

    expect(result.status).toBe(502);
    expect(result.body.code).toBe("STRIPE_ERROR");
    expect(mocks.orderDeleteOne).toHaveBeenCalledWith({ _id: "order-1" });
    expect(mocks.bookingDeleteOne).toHaveBeenCalledWith({ _id: "booking-1" });
    expect(mocks.availabilityUpdateOne).toHaveBeenCalledWith(
      { booking: "booking-1", status: "booked" },
      { $set: { status: "available", booking: null } }
    );
  });
});
