import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/session";
import { planFor, REGIONS } from "../../../../lib/pricing";
import { getStripe } from "../../../../lib/stripe";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";
import { toPublicOrder } from "../../../../lib/serializers";
import { isValidDate, isPastDate, weekdayOf, TIME_RE } from "../../../../lib/schedule";
import Order from "../../../../models/Order";
import Booking from "../../../../models/Booking";
import Availability from "../../../../models/Availability";

const COURSES = ["tajweed", "hifz", "nazra", "dua"];
const DURATIONS = [30, 45, 60];

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

  let order = null;
  let booking = null;
  let slotClaimed = false;

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

    // A plan payment is bound to a chosen class slot. The client only names the
    // course/slot; the server owns the price, the booking and the availability
    // claim. Legacy callers that send no slot details get a plan-only order.
    const hasSlotDetails = Boolean(body.course || body.date || body.time);
    const course = typeof body.course === "string" ? body.course.trim() : "";
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const duration = Number(body.duration);
    const whatsapp =
      (typeof body.whatsapp === "string" && body.whatsapp.trim()) ||
      auth.user.whatsapp ||
      "";
    const country =
      (typeof body.country === "string" && body.country.trim()) ||
      auth.user.country ||
      "";

    if (hasSlotDetails) {
      if (!COURSES.includes(course)) {
        return NextResponse.json(
          { error: "Please choose a course.", code: "VALIDATION" },
          { status: 400 }
        );
      }
      if (!isValidDate(date) || isPastDate(date)) {
        return NextResponse.json(
          { error: "Choose today or a future date.", code: "PAST_DATE" },
          { status: 400 }
        );
      }
      if (!TIME_RE.test(time) || !DURATIONS.includes(duration)) {
        return NextResponse.json(
          { error: "Please choose a valid time slot.", code: "VALIDATION" },
          { status: 400 }
        );
      }
      if (!whatsapp) {
        return NextResponse.json(
          { error: "Please provide a WhatsApp number.", code: "VALIDATION" },
          { status: 400 }
        );
      }
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

    if (hasSlotDetails) {
      const duplicate = await Booking.findOne({
        email: auth.user.email,
        date,
        time,
        status: { $ne: "cancelled" },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "You already booked that slot.", code: "DUPLICATE_BOOKING" },
          { status: 409 }
        );
      }

      booking = await Booking.create({
        user: auth.user._id,
        type: "subscription",
        name: auth.user.name,
        email: auth.user.email,
        whatsapp,
        country,
        course,
        date,
        day: weekdayOf(date),
        time,
        duration,
        status: "pending",
        paymentStatus: "pending",
        planName: plan.planName,
        region: plan.region,
      });

      const claim = await Availability.findOneAndUpdate(
        { date, time, duration, status: "available" },
        { $set: { status: "booked", booking: booking._id } }
      );
      if (!claim) {
        await Booking.deleteOne({ _id: booking._id });
        booking = null;
        return NextResponse.json(
          { error: "That time slot is no longer available.", code: "SLOT_TAKEN" },
          { status: 409 }
        );
      }
      slotClaimed = true;
    }

    order = await Order.create({
      user: auth.user._id,
      email: auth.user.email,
      region: plan.region,
      planName: plan.planName,
      classes: plan.classes,
      amount: plan.amount,
      currency: plan.currency,
      status: "pending",
      booking: booking ? booking._id : null,
      course: course || null,
    });

    if (booking) {
      booking.order = order._id;
      await booking.save();
    }

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
          ...(booking ? { bookingId: String(booking._id) } : {}),
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
      await rollbackOrder(order, booking, slotClaimed);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again.", code: "STRIPE_ERROR" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[Payments] Checkout error:", error);
    await rollbackOrder(order, booking, slotClaimed);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}

/**
 * Undo everything created for an order that never reached Stripe, so a failed
 * checkout never leaves an orphan order, a phantom booking or a locked slot.
 */
async function rollbackOrder(order, booking, slotClaimed) {
  try {
    if (order?._id) await Order.deleteOne({ _id: order._id });
    if (booking?._id) {
      await Booking.deleteOne({ _id: booking._id });
      if (slotClaimed) {
        await Availability.updateOne(
          { booking: booking._id, status: "booked" },
          { $set: { status: "available", booking: null } }
        );
      }
    }
  } catch (error) {
    console.error("[Payments] Checkout rollback error:", error);
  }
}
