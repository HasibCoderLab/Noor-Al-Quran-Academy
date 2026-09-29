import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/admin";
import Progress from "../../../../models/Progress";
import User from "../../../../models/User";
import { toPublicProgress } from "../../../../lib/serializers";

const COURSES = ["tajweed", "hifz", "nazra", "dua"];
const STATUSES = ["not-started", "in-progress", "completed"];

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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user") || "";

    if (!userId) {
      return NextResponse.json(
        { error: "Please provide a student id.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (!/^[a-f\d]{24}$/i.test(userId)) {
      return NextResponse.json(
        { error: "Student not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    await connectDB();

    const student = await User.findById(userId).select("role");
    if (!student || student.role !== "student") {
      return NextResponse.json(
        { error: "Student not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const progress = await Progress.find({ user: userId }).sort({ course: 1 });
    return NextResponse.json({ progress: progress.map(toPublicProgress) });
  } catch (error) {
    console.error("[Admin] Progress list error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const userId = typeof body.userId === "string" ? body.userId : "";
  const course = typeof body.course === "string" ? body.course : "";

  if (!/^[a-f\d]{24}$/i.test(userId) || !COURSES.includes(course)) {
    return NextResponse.json(
      { error: "Please provide a valid student and course.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  const status = body.status === undefined ? undefined : body.status;
  if (status !== undefined && !STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Please choose a valid status.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  const toCount = (value) =>
    typeof value === "number" && Number.isInteger(value) && value >= 0
      ? value
      : null;
  const lessonsCompleted =
    body.lessonsCompleted === undefined ? undefined : toCount(body.lessonsCompleted);
  const totalLessons =
    body.totalLessons === undefined ? undefined : toCount(body.totalLessons);

  if (
    (body.lessonsCompleted !== undefined && lessonsCompleted === null) ||
    (body.totalLessons !== undefined && totalLessons === null)
  ) {
    return NextResponse.json(
      { error: "Lesson counts must be whole numbers.", code: "VALIDATION" },
      { status: 400 }
    );
  }

  const text = (value, max) =>
    typeof value === "string" ? value.trim().slice(0, max) : undefined;

  const currentLesson = text(body.currentLesson, 300);
  const lastAssessment = text(body.lastAssessment, 300);
  const notes = text(body.notes, 2000);

  try {
    await connectDB();

    const student = await User.findById(userId).select("role");
    if (!student || student.role !== "student") {
      return NextResponse.json(
        { error: "Student not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    let progress = await Progress.findOne({ user: userId, course });
    if (!progress) {
      progress = new Progress({ user: userId, course });
    }

    if (status !== undefined) progress.status = status;
    if (lessonsCompleted !== undefined) progress.lessonsCompleted = lessonsCompleted;
    if (totalLessons !== undefined) progress.totalLessons = totalLessons;
    if (currentLesson !== undefined) progress.currentLesson = currentLesson;
    if (lastAssessment !== undefined) progress.lastAssessment = lastAssessment;
    if (notes !== undefined) progress.notes = notes;

    if (
      progress.totalLessons > 0 &&
      progress.lessonsCompleted > progress.totalLessons
    ) {
      return NextResponse.json(
        { error: "Lessons completed cannot exceed total lessons.", code: "VALIDATION" },
        { status: 400 }
      );
    }

    const lessonsChanged =
      lessonsCompleted !== undefined || totalLessons !== undefined;

    if (status !== undefined) {
      progress.status = status;
    } else if (lessonsChanged) {
      if (
        progress.totalLessons > 0 &&
        progress.lessonsCompleted >= progress.totalLessons
      ) {
        progress.status = "completed";
      } else if (progress.lessonsCompleted > 0) {
        progress.status = "in-progress";
      } else {
        progress.status = "not-started";
      }
    }

    await progress.save();

    return NextResponse.json({ progress: toPublicProgress(progress) });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message, code: "VALIDATION" },
        { status: 400 }
      );
    }
    console.error("[Admin] Progress upsert error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
