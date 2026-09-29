import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import Availability from "../../../models/Availability";
import { isValidDate, isPastDate } from "../../../lib/schedule";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || "";

    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: "Please provide a valid date.", code: "VALIDATION" },
        { status: 400 }
      );
    }

    if (isPastDate(date)) {
      return NextResponse.json({ slots: [] });
    }

    await connectDB();

    const slots = await Availability.find({
      date,
      status: "available",
    })
      .sort({ time: 1, duration: 1 })
      .select("date day time duration");

    return NextResponse.json({
      slots: slots.map((slot) => ({
        id: String(slot._id),
        date: slot.date,
        day: slot.day,
        time: slot.time,
        duration: slot.duration,
      })),
    });
  } catch (error) {
    console.error("[Availability] List error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
