import { NextResponse } from "next/server";

import { connectDB } from "../../../../../lib/db";
import Availability from "../../../../../models/Availability";
import { requireAdmin } from "../../../../../lib/admin";
import { toAdminAvailability } from "../../../../../lib/serializers";
import { isValidDate, isPastDate, weekdayOf, todayDhaka } from "../../../../../lib/schedule";
import { SITE } from "../../../../../data/siteData";

const MAX_DAYS = 31;
const DEFAULT_DURATION = 30;

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: auth.status === 401 ? "NOT_AUTHENTICATED" : "FORBIDDEN" },
      { status: auth.status }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const from =
    typeof body.from === "string" && isValidDate(body.from)
      ? body.from
      : todayDhaka();
  const days = Math.min(MAX_DAYS, Math.max(1, Number(body.days) || 7));
  const duration = Number(body.duration) || DEFAULT_DURATION;

  if (isPastDate(from)) {
    return NextResponse.json(
      { error: "Choose today or a future date.", code: "PAST_DATE" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    let created = 0;
    let skipped = 0;
    const startDate = new Date(from + "T00:00:00Z");

    for (let i = 0; i < days; i += 1) {
      const current = new Date(startDate);
      current.setUTCDate(startDate.getUTCDate() + i);
      const date = current.toISOString().slice(0, 10);
      const day = weekdayOf(date);
      const times =
        day === "fri" ? SITE.classTimes.friday : SITE.classTimes.satThu;

      for (const time of times) {
        try {
          const result = await Availability.updateOne(
            { date, time, duration },
            {
              $setOnInsert: { date, day, time, duration, status: "available" },
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
    }

    return NextResponse.json({ created, skipped, days });
  } catch (error) {
    console.error("[Admin] Availability generate error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
