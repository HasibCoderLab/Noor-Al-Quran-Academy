import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireUser } from "../../../../lib/session";
import Review from "../../../../models/Review";
import Booking from "../../../../models/Booking";
import { toPublicReview } from "../../../../lib/serializers";

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

    const [reviews, eligibleCourses] = await Promise.all([
      Review.find({ user: auth.user._id }).sort({ createdAt: -1 }),
      Booking.distinct("course", { user: auth.user._id, status: "completed" }),
    ]);

    return NextResponse.json({
      reviews: reviews.map(toPublicReview),
      eligibleCourses,
    });
  } catch (error) {
    console.error("[Reviews] Mine error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
