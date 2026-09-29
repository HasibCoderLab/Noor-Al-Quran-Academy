import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { requireUser } from "../../../lib/session";
import Progress from "../../../models/Progress";
import { toPublicProgress } from "../../../lib/serializers";

export async function GET(request) {
  const auth = await requireUser(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: "NOT_AUTHENTICATED" },
      { status: auth.status }
    );
  }

  try {
    await connectDB();
    const progress = await Progress.find({ user: auth.user._id }).sort({
      course: 1,
    });
    return NextResponse.json({ progress: progress.map(toPublicProgress) });
  } catch (error) {
    console.error("[Progress] List error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
