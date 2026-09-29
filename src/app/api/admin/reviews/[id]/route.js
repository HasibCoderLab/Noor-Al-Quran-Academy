import { NextResponse } from "next/server";

import { connectDB } from "../../../../../lib/db";
import { requireAdmin } from "../../../../../lib/admin";
import Review from "../../../../../models/Review";
import { toAdminReview } from "../../../../../lib/serializers";

const STATUSES = ["pending", "approved", "rejected"];

export async function PATCH(request, { params }) {
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const status = body.status;
  if (!STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Please choose a valid status.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const { id } = await params;
    const review = await Review.findById(id).populate("user", "name email");
    if (!review) {
      return NextResponse.json(
        { error: "Review not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    review.status = status;
    await review.save();

    return NextResponse.json({ review: toAdminReview(review) });
  } catch (error) {
    if (error?.name === "CastError") {
      return NextResponse.json(
        { error: "Review not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    console.error("[Admin] Review update error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
