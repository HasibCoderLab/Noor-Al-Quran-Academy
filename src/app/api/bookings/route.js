import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import Booking from "../../../models/Booking";
import Availability from "../../../models/Availability";
import { AUTH_COOKIE, verifyToken } from "../../../lib/jwt";
import { toPublicBooking } from "../../../lib/serializers";
import { isValidDate, isPastDate, weekdayOf, TIME_RE } from "../../../lib/schedule";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../lib/rateLimit";

const COURSES = ["tajweed", "hifz", "nazra", "dua"];
const DURATIONS = [30, 45, 60];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const ip = clientIp(request);
    const limit = rateLimit({ key: `booking:ip:${ip}`, limit: 10 });
    if (!limit.ok) {
      return NextResponse.json(rateLimitedResponse(limit.retryAfter), { status: 429 });
    }

    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim() : "";
    const course = typeof body.course === "string" ? body.course.trim() : "";
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const type =
      body.type === "class" || body.type === "subscription"
        ? body.type
        : "free-trial";

    if (!name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Please provide your name, email and WhatsApp number.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (!COURSES.includes(course)) {
      return NextResponse.json(
        { error: "Please choose a course.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (!isValidDate(date) || isPastDate(date)) {
      return NextResponse.json(
        { error: "Choose today or a future date.", code: "PAST_DATE" },
        { status: 400 }
      );
    }
    if (!TIME_RE.test(time)) {
      return NextResponse.json(
        { error: "Please choose a preferred time.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (!DURATIONS.includes(Number(body.duration))) {
      return NextResponse.json(
        { error: "Please choose a valid lesson length.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    const duration = Number(body.duration);

    await connectDB();

    const duplicate = await Booking.findOne({
      email,
      date,
      time,
      status: { $ne: "cancelled" },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "You already booked that slot.", code: "DUPLICATE_BOOKING" },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      user: payload?.sub || null,
      type,
      name,
      email,
      whatsapp,
      country,
      course,
      date,
      day: weekdayOf(date),
      time,
      duration,
      message,
    });

    const claim = await Availability.findOneAndUpdate(
      { date, time, duration, status: "available" },
      { $set: { status: "booked", booking: booking._id } }
    );

    if (!claim) {
      await Booking.deleteOne({ _id: booking._id });
      return NextResponse.json(
        { error: "That time slot is no longer available.", code: "SLOT_TAKEN" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { booking: toPublicBooking(booking) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Bookings] Create error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Not authenticated.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({ user: payload.sub }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ bookings: bookings.map(toPublicBooking) });
  } catch (error) {
    console.error("[Bookings] List error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
