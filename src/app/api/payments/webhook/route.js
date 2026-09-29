import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { getStripe } from "../../../../lib/stripe";
import Order from "../../../../models/Order";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.expired",
]);

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
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    await connectDB();

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
      return NextResponse.json({ received: true, ignored: true });
    }

    if (event.type === "checkout.session.expired") {
      if (order.status === "pending") {
        order.status = "expired";
        order.stripeEventId = event.id;
        await order.save();
      }
      return NextResponse.json({ received: true });
    }

    // checkout.session.completed
    if (order.status === "paid") {
      return NextResponse.json({ received: true, alreadyPaid: true });
    }
    if (order.stripeEventId === event.id) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (session.payment_status !== "paid") {
      console.warn(
        "[Payments] Session completed without payment:",
        session.id,
        session.payment_status
      );
      return NextResponse.json({ received: true, ignored: true });
    }
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
      return NextResponse.json({ received: true, mismatch: true });
    }

    order.status = "paid";
    order.paidAt = new Date();
    order.stripeEventId = event.id;
    await order.save();

    return NextResponse.json({ received: true, paid: true });
  } catch (error) {
    console.error("[Payments] Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
