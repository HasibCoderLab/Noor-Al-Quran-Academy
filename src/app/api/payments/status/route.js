import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/session";
import Order from "../../../../models/Order";
import { toPublicOrder } from "../../../../lib/serializers";

export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: "NOT_AUTHENTICATED" },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id") || "";

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session id.", code: "VALIDATION" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      stripeSessionId: sessionId,
      user: auth.user._id,
    });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: toPublicOrder(order) });
  } catch (error) {
    console.error("[Payments] Status error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
