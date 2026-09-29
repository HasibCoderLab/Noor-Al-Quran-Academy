import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { requireUser } from "../../../lib/session";
import Order from "../../../models/Order";
import { toPublicOrder } from "../../../lib/serializers";

export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: "NOT_AUTHENTICATED" },
      { status: auth.status }
    );
  }

  try {
    await connectDB();
    const orders = await Order.find({ user: auth.user._id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ orders: orders.map(toPublicOrder) });
  } catch (error) {
    console.error("[Payments] List error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
