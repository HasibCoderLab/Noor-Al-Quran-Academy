import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { getStripe } from "../../../../lib/stripe";
import Order from "../../../../models/Order";

// Events that can move an order into a terminal state. Anything else is
// acknowledged with 200 so Stripe stops retrying it.
const PAID_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);
const FAILED_EVENTS = new Set(["checkout.session.async_payment_failed"]);
const EXPIRED_EVENTS = new Set(["checkout.session.expired"]);
const REFUNDED_EVENTS = new Set(["charge.refunded"]);
const HANDLED_EVENTS = new Set([
  ...PAID_EVENTS,
  ...FAILED_EVENTS,
  ...EXPIRED_EVENTS,
  ...REFUNDED_EVENTS,
]);

// Status an order may hold before a given webhook transition is allowed. The
// transition itself is applied atomically (see below) so a duplicate or
// concurrent delivery can never apply the same change twice.
const PAID_FROM = ["pending", "expired"];
const EXPIRED_FROM = ["pending"];
const FAILED_FROM = ["pending"];
const REFUNDED_FROM = ["paid"];

function acknowledge(body) {
  return NextResponse.json({ received: true, ...body });
}

/**
 * Atomically applies a status transition only when the order is currently in
 * one of `from` and is not already at `status`.
 *
 * Using a single conditional `findOneAndUpdate` (instead of read-then-save)
 * makes webhook processing idempotent: Stripe delivers at-least-once and may
 * retry, but a repeated event finds no matching document and is ignored. The
 * event id is only stamped on the document that actually made the transition.
 */
async function transitionOrder(orderId, from, status, eventId, extra = {}) {
  return Order.findOneAndUpdate(
    { _id: orderId, status: { $in: from } },
    { $set: { status, stripeEventId: eventId, ...extra } },
    { new: true }
  );
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook is not configured.", code: "WEBHOOK_NOT_CONFIGURED" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured.", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json(
      { error: "Invalid signature.", code: "INVALID_SIGNATURE" },
      { status: 400 }
    );
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return acknowledge({ ignored: true });
  }

  try {
    await connectDB();

    // Refunds arrive as charge events (the object is a Charge, not a session).
    // A charge only maps back to our order through the PaymentIntent id that we
    // persisted on the paid transition, so resolve it that way — never by a
    // client-supplied value.
    if (REFUNDED_EVENTS.has(event.type)) {
      const charge = event.data.object;
      const paymentIntent = charge?.payment_intent;

      // Only a fully refunded charge flips the order; partial refunds stay paid.
      if (charge?.refunded !== true || !paymentIntent) {
        return acknowledge({ ignored: true });
      }

      const order = await Order.findOne({
        stripePaymentIntentId: String(paymentIntent),
      });
      if (!order) {
        console.warn("[Payments] Refund for unknown payment intent:", paymentIntent);
        return acknowledge({ ignored: true });
      }

      const refunded = await transitionOrder(
        order._id,
        REFUNDED_FROM,
        "refunded",
        event.id,
        { refundedAt: new Date() }
      );
      // A duplicate delivery finds the order already refunded.
      return acknowledge({ refunded: Boolean(refunded) });
    }

    const session = event.data.object;
    let order = null;

    if (session.metadata?.orderId) {
      order = await Order.findById(session.metadata.orderId).catch(() => null);
    }
    if (!order && session.id) {
      order = await Order.findOne({ stripeSessionId: session.id });
    }

    if (!order) {
      console.warn("[Payments] Webhook for unknown session:", session.id);
      return acknowledge({ ignored: true });
    }

    if (EXPIRED_EVENTS.has(event.type)) {
      const expired = await transitionOrder(
        order._id,
        EXPIRED_FROM,
        "expired",
        event.id
      );
      return acknowledge({ expired: Boolean(expired) });
    }

    if (FAILED_EVENTS.has(event.type)) {
      const failed = await transitionOrder(
        order._id,
        FAILED_FROM,
        "failed",
        event.id
      );
      return acknowledge({ failed: Boolean(failed) });
    }

    // PAID_EVENTS — never grant paid status on a session that is not paid.
    if (session.payment_status !== "paid") {
      console.warn(
        "[Payments] Session completed without payment:",
        session.id,
        session.payment_status
      );
      return acknowledge({ ignored: true });
    }

    // The server — not the client — decides the real amount. Reject any
    // session whose total or currency does not match the order we created.
    if (
      session.amount_total !== order.amount ||
      (session.currency || "").toLowerCase() !== order.currency
    ) {
      console.error(
        "[Payments] Amount mismatch for order",
        String(order._id),
        "expected",
        order.amount,
        order.currency,
        "got",
        session.amount_total,
        session.currency
      );
      return acknowledge({ mismatch: true });
    }

    const paid = await transitionOrder(
      order._id,
      PAID_FROM,
      "paid",
      event.id,
      {
        paidAt: new Date(),
        // Persist the PaymentIntent so a later refund can be linked back to
        // this order without trusting anything from the client.
        stripePaymentIntentId: session.payment_intent
          ? String(session.payment_intent)
          : null,
      }
    );
    if (!paid) {
      // Already paid by an earlier (possibly concurrent) delivery.
      return acknowledge({ alreadyPaid: true });
    }

    return acknowledge({ paid: true });
  } catch (error) {
    console.error("[Payments] Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
