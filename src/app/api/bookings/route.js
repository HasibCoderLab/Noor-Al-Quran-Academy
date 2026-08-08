import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import Booking from "../../../models/Booking";
import { AUTH_COOKIE, verifyToken } from "../../../lib/jwt";

const toPublicBooking = (booking) => ({
  id: String(booking._id),
  type: booking.type,
  course: booking.course,
  day: booking.day || "",
  time: booking.time || "",
  duration: booking.duration,
  status: booking.status,
  name: booking.name,
  whatsapp: booking.whatsapp,
  message: booking.message || "",
  createdAt: booking.createdAt,
});

export async function GET(request) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.sub) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    await connectDB();

    const bookings = await Booking.find({ user: payload.sub }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ bookings: bookings.map(toPublicBooking) });
  } catch (error) {
    console.error("[Bookings] List error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
