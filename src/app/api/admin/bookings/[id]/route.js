import { NextResponse } from "next/server";

import { connectDB } from "../../../../../lib/db";
import Booking from "../../../../../models/Booking";
import Availability from "../../../../../models/Availability";
import { requireAdmin } from "../../../../../lib/admin";
import { toAdminBooking } from "../../../../../lib/serializers";

const ALLOWED_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    await connectDB();

    const booking = await Booking.findById(id).populate("user", "name email");
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking: toAdminBooking(booking) });
  } catch (error) {
    if (error?.name === "CastError") {
      return NextResponse.json(
        { error: "Booking not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    console.error("[Admin] Booking detail error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

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
  if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status value.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const booking = await Booking.findById(id).populate("user", "name email");
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (booking.status !== status) {
      if (!TRANSITIONS[booking.status]?.includes(status)) {
        return NextResponse.json(
          { error: "That status change is not allowed.", code: "INVALID_TRANSITION" },
          { status: 409 }
        );
      }

      booking.status = status;
      await booking.save();

      if (status === "cancelled") {
        await Availability.updateOne(
          { booking: booking._id, status: "booked" },
          { $set: { status: "available", booking: null } }
        );
      }
    }

    return NextResponse.json({ booking: toAdminBooking(booking) });
  } catch (error) {
    if (error?.name === "CastError") {
      return NextResponse.json(
        { error: "Booking not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    console.error("[Admin] Booking update error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
