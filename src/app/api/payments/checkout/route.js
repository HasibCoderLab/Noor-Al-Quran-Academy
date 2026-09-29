import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/session";
import { planFor, REGIONS } from "../../../../lib/pricing";
import { getStripe } from "../../../../lib/stripe";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";
import { toPublicOrder } from "../../../../lib/serializers";
import Order from "../../../../models/Order";

function requestOrigin(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("host");
  if (host) return `http://${host}`;
  return "http://localhost:3000";
}

export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: "NOT_AUTHENTICATED" },
      { status: auth.status }
    );
  }

  try {
    const ip = clientIp(request);
    const limit = rateLimit({ key: `checkout:${auth.user._id}:${ip}`, limit: 5 });
    if (!limit.ok) {
      return NextResponse.json(rateLimitedResponse(limit.retryAfter), {
        status: 429,
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const region = typeof body.region === "string" ? body.region : "";
    const plan = planFor(region, body.planIndex);
    if (!plan || !REGIONS.includes(region)) {
      return NextResponse.json(
        { error: "Please choose a valid plan.", code: "VALIDATION" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        {
          error: "Online payments are not configured yet.",
          code: "STRIPE_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    await connectDB();

    const order = await Order.create({
      user: auth.user._id,
      email: auth.user.email,
      region: plan.region,
      planName: plan.planName,
      classes: plan.classes,
      amount: plan.amount,
      currency: plan.currency,
      status: "pending",
    });

    try {
      const origin = requestOrigin(request);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: auth.user.email,
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              unit_amount: plan.amount,
              product_data: {
                name: `Noor Academy — ${plan.planName} plan`,
                description: `${plan.classes} classes per month (1-to-1 online)`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: String(order._id),
          userId: String(auth.user._id),
        },
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment/cancelled`,
      });

      order.stripeSessionId = session.id;
      await order.save();

      return NextResponse.json({
        url: session.url,
        order: toPublicOrder(order),
      });
    } catch (error) {
      console.error("[Payments] Checkout session error:", error?.message || error);
      await Order.deleteOne({ _id: order._id });
      return NextResponse.json(
        { error: "Could not start checkout. Please try again.", code: "STRIPE_ERROR" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[Payments] Checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
