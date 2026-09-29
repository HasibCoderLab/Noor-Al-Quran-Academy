import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/admin";
import Review from "../../../../models/Review";
import { toAdminReview } from "../../../../lib/serializers";

const STATUSES = ["pending", "approved", "rejected"];

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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await connectDB();

    const filter = STATUSES.includes(status) ? { status } : {};
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name email");

    return NextResponse.json({ reviews: reviews.map(toAdminReview) });
  } catch (error) {
    console.error("[Admin] Reviews list error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
