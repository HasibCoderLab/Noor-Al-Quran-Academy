import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/admin";
import User from "../../../../models/User";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      {
        error: auth.error,
        code: auth.status === 401 ? "NOT_AUTHENTICATED" : "FORBIDDEN",
      },
      { status: auth.status }
    );
  }

  try {
    await connectDB();
    const students = await User.find({ role: "student" })
      .select("name email")
      .sort({ name: 1 })
      .limit(500);

    return NextResponse.json({
      students: students.map((student) => ({
        id: String(student._id),
        name: student.name,
        email: student.email,
      })),
    });
  } catch (error) {
    console.error("[Admin] Students list error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
