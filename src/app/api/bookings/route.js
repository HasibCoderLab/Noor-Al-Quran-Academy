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
  email: booking.email,
  country: booking.country || "",
  whatsapp: booking.whatsapp,
  message: booking.message || "",
  createdAt: booking.createdAt,
});

const COURSES = ["tajweed", "hifz", "nazra", "dua"];
const DURATIONS = [30, 45, 60];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim() : "";
    const course = typeof body.course === "string" ? body.course.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const type =
      body.type === "class" || body.type === "subscription"
        ? body.type
        : "free-trial";
    if (!name || !email || !whatsapp) {
      return NextResponse.json(
        { error: "Please provide your name, email and WhatsApp number." },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }
    if (!COURSES.includes(course)) {
      return NextResponse.json(
        { error: "Please choose a course." },
        { status: 400 }
      );
    }
    if (!time) {
      return NextResponse.json(
        { error: "Please choose a preferred time." },
        { status: 400 }
      );
    }
    if (!DURATIONS.includes(Number(body.duration))) {
      return NextResponse.json(
        { error: "Please choose a valid lesson length." },
        { status: 400 }
      );
    }
    const duration = Number(body.duration);

    await connectDB();

    const booking = await Booking.create({
      user: payload?.sub || null,
      type,
      name,
      email,
      whatsapp,
      country,
      course,
      time,
      duration,
      message,
    });

    return NextResponse.json(
      { booking: toPublicBooking(booking) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Bookings] Create error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

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
