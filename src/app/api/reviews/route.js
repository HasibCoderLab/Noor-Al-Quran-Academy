import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { requireUser } from "../../../lib/session";
import Review from "../../../models/Review";
import Booking from "../../../models/Booking";
import { toPublicReview } from "../../../lib/serializers";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../lib/rateLimit";

const COURSES = ["tajweed", "hifz", "nazra", "dua"];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requested = Number(searchParams.get("limit"));
    const limit = Math.min(
      50,
      Number.isInteger(requested) && requested > 0 ? requested : 30
    );

    await connectDB();

    const reviews = await Review.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ reviews: reviews.map(toPublicReview) });
  } catch (error) {
    console.error("[Reviews] List error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit({ key: `review:ip:${ip}`, limit: 20 });
    if (!ipLimit.ok) {
      return NextResponse.json(rateLimitedResponse(ipLimit.retryAfter), {
        status: 429,
      });
    }

    const auth = await requireUser(request);
    if (auth.error) {
      return NextResponse.json(
        { error: auth.error, code: "NOT_AUTHENTICATED" },
        { status: auth.status }
      );
    }

    const userLimit = rateLimit({ key: `review:user:${auth.user._id}`, limit: 10 });
    if (!userLimit.ok) {
      return NextResponse.json(rateLimitedResponse(userLimit.retryAfter), {
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

    const course = typeof body.course === "string" ? body.course : "";
    const rating = Number(body.rating);
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!COURSES.includes(course)) {
      return NextResponse.json(
        { error: "Please choose a course.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please choose a rating.", code: "RATING_INVALID" },
        { status: 400 }
      );
    }
    if (text.length < 10) {
      return NextResponse.json(
        { error: "Please write at least 10 characters.", code: "REVIEW_MIN" },
        { status: 400 }
      );
    }
    if (text.length > 500) {
      return NextResponse.json(
        { error: "Review must be at most 500 characters.", code: "REVIEW_MAX" },
        { status: 400 }
      );
    }

    await connectDB();

    const eligible = await Booking.exists({
      user: auth.user._id,
      course,
      status: "completed",
    });
    if (!eligible) {
      return NextResponse.json(
        {
          error: "You can review a course after you have completed a class for it.",
          code: "NOT_ELIGIBLE",
        },
        { status: 403 }
      );
    }

    const existing = await Review.findOne({ user: auth.user._id, course });
    if (existing) {
      return NextResponse.json(
        {
          error: "You have already reviewed this course.",
          code: "DUPLICATE_REVIEW",
        },
        { status: 409 }
      );
    }

    const review = await Review.create({
      user: auth.user._id,
      name: auth.user.name,
      country: auth.user.country || "",
      course,
      text,
      rating,
      status: "pending",
    });

    return NextResponse.json(
      { review: toPublicReview(review), pending: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Reviews] Create error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
