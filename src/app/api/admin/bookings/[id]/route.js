import { NextResponse } from "next/server";

import { connectDB } from "../../../../../lib/db";
import Booking from "../../../../../models/Booking";
import { requireAdmin } from "../../../../../lib/admin";

const ALLOWED_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const toAdminBooking = (booking) => ({
  id: String(booking._id),
  user: booking.user
    ? {
        id: String(booking.user._id || booking.user),
        name: booking.user.name || "",
        email: booking.user.email || "",
      }
    : null,
  type: booking.type,
  course: booking.course,
  day: booking.day || "",
  time: booking.time || "",
  duration: booking.duration,
  status: booking.status,
  name: booking.name,
  email: booking.email,
  country: booking.country || "",
  whatsapp: booking.whatsapp,
  message: booking.message || "",
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

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
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ booking: toAdminBooking(booking) });
  } catch (error) {
    if (error?.name === "CastError") {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    console.error("[Admin] Booking detail error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
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
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const status = body.status;
  if (typeof status !== "string" || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status value." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ booking: toAdminBooking(booking) });
  } catch (error) {
    if (error?.name === "CastError") {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }
    console.error("[Admin] Booking update error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
