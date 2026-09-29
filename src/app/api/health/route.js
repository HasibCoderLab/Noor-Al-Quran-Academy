import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import { envReport, allRequiredPresent } from "../../../lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = envReport();
  let db = "down";

  try {
    await connectDB();
    db = "up";
  } catch {
    db = "down";
  }

  const ok = db === "up" && allRequiredPresent(report);

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      db,
      features: report.features,
      uptime: Math.round(process.uptime()),
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
