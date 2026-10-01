import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

const mocks = vi.hoisted(() => ({
  connectDB: vi.fn(async () => {}),
  getStripe: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
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

let post;
let constructEvent;

const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

beforeEach(async () => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  mocks.connectDB.mockClear();
  mocks.findById.mockReset().mockResolvedValue(null);
  mocks.findOne.mockReset().mockResolvedValue(null);
  mocks.findOneAndUpdate.mockReset();

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
