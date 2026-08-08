import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/Booking";
import { requireAdmin } from "../../../../lib/admin";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

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

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const requestedPageSize = Number(searchParams.get("pageSize")) || PAGE_SIZE;
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.isFinite(requestedPageSize) ? requestedPageSize : PAGE_SIZE)
    );

    const filter = {};
    if (STATUSES.includes(status)) {
      filter.status = status;
    }
    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.$or = [{ name: regex }, { email: regex }, { whatsapp: regex }];
    }

    await connectDB();

    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate("user", "name email"),
    ]);

    return NextResponse.json({
      bookings: bookings.map(toAdminBooking),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("[Admin] Bookings list error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
