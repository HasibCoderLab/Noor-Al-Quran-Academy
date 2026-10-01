import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

const mocks = vi.hoisted(() => ({
  connectDB: vi.fn(async () => {}),
  getStripe: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  bookingUpdateOne: vi.fn(),
  availabilityUpdateOne: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body, init) => ({ body, status: init?.status ?? 200 }),
  },
}));

vi.mock("../src/lib/db.js", () => ({ connectDB: mocks.connectDB }));
vi.mock("../src/lib/stripe.js", () => ({
  getStripe: mocks.getStripe,
  stripeConfigured: () => true,
}));
vi.mock("../src/models/Order.js", () => ({
  default: {
    findById: mocks.findById,
    findOne: mocks.findOne,
    findOneAndUpdate: mocks.findOneAndUpdate,
  },
}));
vi.mock("../src/models/Booking.js", () => ({
  default: { updateOne: mocks.bookingUpdateOne },
}));
vi.mock("../src/models/Availability.js", () => ({
  default: { updateOne: mocks.availabilityUpdateOne },
}));

let post;
let constructEvent;

const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

beforeEach(async () => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mocks.connectDB.mockClear();
  mocks.findById.mockReset().mockResolvedValue(null);
  mocks.findOne.mockReset().mockResolvedValue(null);
  mocks.findOneAndUpdate.mockReset();
  mocks.bookingUpdateOne.mockReset().mockResolvedValue({ modifiedCount: 1 });
  mocks.availabilityUpdateOne.mockReset().mockResolvedValue({ modifiedCount: 1 });

  constructEvent = vi.fn((payload, signature) => {
    if (signature === "bad-signature") throw new Error("no match");
    return JSON.parse(payload);
  });
  mocks.getStripe.mockReset().mockReturnValue({
    webhooks: { constructEvent: (p, s, secret) => constructEvent(p, s, secret) },
  });

  ({ POST: post } = await import("../src/app/api/payments/webhook/route.js"));
});

afterAll(() => {
  if (originalSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
});

const ORDER = {
  _id: "order-1",
  status: "pending",
  amount: 220000,
  currency: "bdt",
};

function makeRequest({ signature = "good-signature", payload } = {}) {
  return {
    headers: {
      get: (name) => (name === "stripe-signature" ? signature : null),
    },
    text: async () => payload,
  };
}

function event(type, objectOverrides = {}) {
  return {
    id: "evt_1",
    type,
    data: {
      object: {
        id: "cs_1",
        payment_status: "paid",
        amount_total: 220000,
        currency: "bdt",
        metadata: { orderId: "order-1" },
        ...objectOverrides,
      },
    },
  };
}

async function deliver(type, objectOverrides = {}) {
  const payload = JSON.stringify(event(type, objectOverrides));
  return post(makeRequest({ payload }));
}

describe("POST /api/payments/webhook — configuration", () => {
  it("rejects requests without a signature", async () => {
    const result = await post(makeRequest({ signature: null, payload: "{}" }));
    expect(result.status).toBe(400);
    expect(result.body.code).toBe("WEBHOOK_NOT_CONFIGURED");
  });

  it("rejects requests when the webhook secret is unset", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const result = await post(makeRequest({ payload: "{}" }));
    expect(result.status).toBe(400);
    expect(result.body.code).toBe("WEBHOOK_NOT_CONFIGURED");
  });
});

describe("POST /api/payments/webhook — signature", () => {
  it("rejects an invalid signature", async () => {
    const bad = await post(
      makeRequest({
        signature: "bad-signature",
        payload: JSON.stringify(event("checkout.session.completed")),
      })
    );
    expect(bad.status).toBe(400);
    expect(bad.body.code).toBe("INVALID_SIGNATURE");
  });

  it("ignores events it does not handle without touching the database", async () => {
    const result = await deliver("customer.created");
    expect(result.body.ignored).toBe(true);
    expect(mocks.findById).not.toHaveBeenCalled();
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe("POST /api/payments/webhook — paid transitions", () => {
  it("marks a pending order paid atomically with a paidAt timestamp", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "paid" });

    const result = await deliver("checkout.session.completed");

    expect(result.body.paid).toBe(true);
    expect(mocks.findOneAndUpdate).toHaveBeenCalledTimes(1);
    const [filter, update, options] = mocks.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({
      _id: "order-1",
      status: { $in: ["pending", "expired"] },
    });
    expect(update.$set.status).toBe("paid");
    expect(update.$set.stripeEventId).toBe("evt_1");
    expect(update.$set.paidAt).toBeInstanceOf(Date);
    expect(options).toEqual({ new: true });
  });

  it("is idempotent — a duplicate delivery reports alreadyPaid and does not re-transition", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER, status: "paid" });
    mocks.findOneAndUpdate.mockResolvedValue(null);

    const result = await deliver("checkout.session.completed");

    expect(result.body.alreadyPaid).toBe(true);
    expect(result.body.paid).toBeUndefined();
  });

  it("never marks an order paid when the session was not paid", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });

    const result = await deliver("checkout.session.completed", {
      payment_status: "unpaid",
    });

    expect(result.body.ignored).toBe(true);
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects a session whose amount or currency does not match the order", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });

    const tampered = await deliver("checkout.session.completed", {
      amount_total: 1,
    });
    expect(tampered.body.mismatch).toBe(true);

    mocks.findById.mockResolvedValue({ ...ORDER });
    const wrongCurrency = await deliver("checkout.session.completed", {
      currency: "usd",
    });
    expect(wrongCurrency.body.mismatch).toBe(true);
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("handles async payment success as a paid transition", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "paid" });

    const result = await deliver("checkout.session.async_payment_succeeded");
    expect(result.body.paid).toBe(true);
  });

  it("persists the payment intent id so a later refund can be linked", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "paid" });

    await deliver("checkout.session.completed", { payment_intent: "pi_123" });

    const update = mocks.findOneAndUpdate.mock.calls[0][1];
    expect(update.$set.stripePaymentIntentId).toBe("pi_123");
  });
});

describe("POST /api/payments/webhook — refunds", () => {
  it("marks a paid order refunded atomically by payment intent", async () => {
    mocks.findOne.mockResolvedValue({ ...ORDER, status: "paid", stripePaymentIntentId: "pi_1" });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "refunded" });

    const result = await deliver("charge.refunded", {
      payment_intent: "pi_1",
      refunded: true,
    });

    expect(result.body.refunded).toBe(true);
    expect(mocks.findOne).toHaveBeenCalledWith({ stripePaymentIntentId: "pi_1" });
    const [filter, update] = mocks.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: "order-1", status: { $in: ["paid"] } });
    expect(update.$set.status).toBe("refunded");
    expect(update.$set.refundedAt).toBeInstanceOf(Date);
  });

  it("is idempotent — a duplicate refund does not re-transition", async () => {
    mocks.findOne.mockResolvedValue({ ...ORDER, status: "refunded", stripePaymentIntentId: "pi_1" });
    mocks.findOneAndUpdate.mockResolvedValue(null);

    const result = await deliver("charge.refunded", {
      payment_intent: "pi_1",
      refunded: true,
    });

    expect(result.body.refunded).toBe(false);
  });

  it("ignores a partial refund so the order stays paid", async () => {
    const result = await deliver("charge.refunded", {
      payment_intent: "pi_1",
      refunded: false,
    });
    expect(result.body.ignored).toBe(true);
    expect(mocks.findOne).not.toHaveBeenCalled();
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("ignores a refund that matches no known payment intent", async () => {
    mocks.findOne.mockResolvedValue(null);

    const result = await deliver("charge.refunded", {
      payment_intent: "pi_unknown",
      refunded: true,
    });
    expect(result.body.ignored).toBe(true);
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe("POST /api/payments/webhook — expiry and failure", () => {
  it("expires a pending order", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "expired" });

    const result = await deliver("checkout.session.expired");
    expect(result.body.expired).toBe(true);
    expect(mocks.findOneAndUpdate.mock.calls[0][0].status).toEqual({
      $in: ["pending"],
    });
  });

  it("marks a failed async payment as failed", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "failed" });

    const result = await deliver("checkout.session.async_payment_failed");
    expect(result.body.failed).toBe(true);
    expect(mocks.findOneAndUpdate.mock.calls[0][1].$set.status).toBe("failed");
  });
});

describe("POST /api/payments/webhook — order resolution", () => {
  it("ignores a webhook whose session cannot be matched to an order", async () => {
    mocks.findById.mockResolvedValue(null);
    mocks.findOne.mockResolvedValue(null);

    const result = await deliver("checkout.session.completed");
    expect(result.body.ignored).toBe(true);
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("falls back to the session id when metadata lookup fails", async () => {
    mocks.findById.mockRejectedValue(new Error("cast error"));
    mocks.findOne.mockResolvedValue({ ...ORDER });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "paid" });

    const result = await deliver("checkout.session.completed");
    expect(mocks.findOne).toHaveBeenCalledWith({ stripeSessionId: "cs_1" });
    expect(result.body.paid).toBe(true);
  });
});

describe("POST /api/payments/webhook — booking reconciliation", () => {
  it("marks the linked booking paid on a paid transition", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER, booking: "booking-1" });
    mocks.findOneAndUpdate.mockResolvedValue({
      ...ORDER,
      status: "paid",
      booking: "booking-1",
    });

    const result = await deliver("checkout.session.completed");

    expect(result.body.paid).toBe(true);
    const [filter, update] = mocks.bookingUpdateOne.mock.calls[0];
    expect(filter).toEqual({
      _id: "booking-1",
      paymentStatus: { $in: ["pending", "unpaid", "failed"] },
    });
    expect(update.$set.paymentStatus).toBe("paid");
  });

  it("leaves a plan-only order's non-existent booking untouched", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER });
    mocks.findOneAndUpdate.mockResolvedValue({ ...ORDER, status: "paid" });

    await deliver("checkout.session.completed");
    expect(mocks.bookingUpdateOne).not.toHaveBeenCalled();
  });

  it("cancels the linked booking and releases the slot when the session expires", async () => {
    mocks.findById.mockResolvedValue({ ...ORDER, booking: "booking-1" });
    mocks.findOneAndUpdate.mockResolvedValue({
      ...ORDER,
      status: "expired",
      booking: "booking-1",
    });

    const result = await deliver("checkout.session.expired");

    expect(result.body.expired).toBe(true);
    const [filter, update] = mocks.bookingUpdateOne.mock.calls[0];
    expect(filter).toEqual({
      _id: "booking-1",
      paymentStatus: { $in: ["pending", "unpaid"] },
    });
    expect(update.$set).toEqual({ paymentStatus: "failed", status: "cancelled" });
    expect(mocks.availabilityUpdateOne).toHaveBeenCalledWith(
      { booking: "booking-1", status: "booked" },
      { $set: { status: "available", booking: null } }
    );
  });

  it("does not release the slot when the booking was already failed", async () => {
    mocks.bookingUpdateOne.mockResolvedValue({ modifiedCount: 0 });
    mocks.findById.mockResolvedValue({ ...ORDER, booking: "booking-1" });
    mocks.findOneAndUpdate.mockResolvedValue({
      ...ORDER,
      status: "failed",
      booking: "booking-1",
    });

    await deliver("checkout.session.async_payment_failed");
    expect(mocks.availabilityUpdateOne).not.toHaveBeenCalled();
  });

  it("marks the linked booking refunded on a full refund", async () => {
    mocks.findOne.mockResolvedValue({
      ...ORDER,
      status: "paid",
      booking: "booking-1",
      stripePaymentIntentId: "pi_1",
    });
    mocks.findOneAndUpdate.mockResolvedValue({
      ...ORDER,
      status: "refunded",
      booking: "booking-1",
    });

    const result = await deliver("charge.refunded", {
      payment_intent: "pi_1",
      refunded: true,
    });

    expect(result.body.refunded).toBe(true);
    expect(mocks.bookingUpdateOne).toHaveBeenCalledWith(
      { _id: "booking-1", paymentStatus: "paid" },
      { $set: { paymentStatus: "refunded" } }
    );
  });
});
