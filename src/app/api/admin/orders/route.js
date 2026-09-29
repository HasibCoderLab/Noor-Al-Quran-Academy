import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/admin";
import Order from "../../../../models/Order";
import { toAdminOrder } from "../../../../lib/serializers";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      {
        error: auth.error,
        code: auth.status === 401 ? "NOT_AUTHENTICATED" : "FORBIDDEN",
      },
      { status: auth.status }
    );
  }

  try {
    await connectDB();

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name email");

    return NextResponse.json({ orders: orders.map(toAdminOrder) });
  } catch (error) {
    console.error("[Admin] Orders list error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
