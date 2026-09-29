import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import Availability from "../../../../models/Availability";
import "../../../../models/Booking";
import { requireAdmin } from "../../../../lib/admin";
import { toAdminAvailability } from "../../../../lib/serializers";
import {
  isValidDate,
  isPastDate,
  weekdayOf,
  todayDhaka,
  TIME_RE,
} from "../../../../lib/schedule";

const DURATIONS = [30, 45, 60];
const MAX_RANGE_DAYS = 62;

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: auth.status === 401 ? "NOT_AUTHENTICATED" : "FORBIDDEN" },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || todayDhaka();
    const to = searchParams.get("to") || from;

    if (!isValidDate(from) || !isValidDate(to) || to < from) {
      return NextResponse.json(
        { error: "Please provide a valid date range.", code: "VALIDATION" },
        { status: 400 }
      );
    }

    await connectDB();

    const slots = await Availability.find({
      date: { $gte: from, $lte: to },
      ...(searchParams.get("status") === "booked"
        ? { status: "booked" }
        : searchParams.get("status") === "available"
          ? { status: "available" }
          : searchParams.get("status") === "blocked"
            ? { status: "blocked" }
            : {}),
    })
      .sort({ date: 1, time: 1, duration: 1 })
      .populate("booking", "name email");

    return NextResponse.json({
      slots: slots.map(toAdminAvailability),
      from,
      to,
    });
  } catch (error) {
    console.error("[Admin] Availability list error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: auth.status === 401 ? "NOT_AUTHENTICATED" : "FORBIDDEN" },
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

  const date = typeof body.date === "string" ? body.date.trim() : "";
  const duration = Number(body.duration);
  const times = (Array.isArray(body.times) ? body.times : [body.times])
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!isValidDate(date) || isPastDate(date)) {
    return NextResponse.json(
      { error: "Choose today or a future date.", code: "PAST_DATE" },
      { status: 400 }
    );
  }
  if (!DURATIONS.includes(duration)) {
    return NextResponse.json(
      { error: "Please choose a valid lesson length.", code: "VALIDATION" },
      { status: 400 }
    );
  }
  if (!times.length || times.some((time) => !TIME_RE.test(time))) {
    return NextResponse.json(
      { error: "Please provide valid times (HH:MM).", code: "VALIDATION" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const day = weekdayOf(date);
    let created = 0;
    let skipped = 0;

    for (const time of times) {
      try {
        const result = await Availability.updateOne(
          { date, time, duration },
          {
            $setOnInsert: { date, day, time, duration, status: "available", notes },
          },
          { upsert: true }
        );
        if (result.upsertedCount > 0) created += 1;
        else skipped += 1;
      } catch (error) {
        if (error?.code === 11000) skipped += 1;
        else throw error;
      }
    }

    if (created === 0 && skipped > 0) {
      return NextResponse.json(
        {
          error: "A slot already exists for that date and time.",
          code: "DUPLICATE",
          created,
          skipped,
        },
        { status: 409 }
      );
    }

    const slots = await Availability.find({ date }).sort({ time: 1, duration: 1 });

    return NextResponse.json(
      { created, skipped, slots: slots.map(toAdminAvailability) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin] Availability create error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: auth.status === 401 ? "NOT_AUTHENTICATED" : "FORBIDDEN" },
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

  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status;

  if (!id || (status !== "available" && status !== "blocked")) {
    return NextResponse.json(
      { error: "Invalid request body", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const slot = await Availability.findById(id);
    if (!slot) {
      return NextResponse.json(
        { error: "Slot not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    if (slot.status === "booked") {
      return NextResponse.json(
        {
          error: "That status change is not allowed.",
          code: "INVALID_TRANSITION",
        },
        { status: 409 }
      );
    }
    if (slot.status === status) {
      return NextResponse.json({ slot: toAdminAvailability(slot) });
    }

    slot.status = status;
    await slot.save();

    return NextResponse.json({ slot: toAdminAvailability(slot) });
  } catch (error) {
    if (error?.name === "CastError") {
      return NextResponse.json(
        { error: "Slot not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    console.error("[Admin] Availability patch error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
