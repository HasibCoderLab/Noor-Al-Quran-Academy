import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Booking from "../../../../models/Booking";
import { requireAdmin } from "../../../../lib/admin";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();

    const [totalStudents, pending, confirmed, completed] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
    ]);

    return NextResponse.json({
      overview: {
        totalStudents,
        pending,
        confirmed,
        completed,
      },
    });
  } catch (error) {
    console.error("[Admin] Overview error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
