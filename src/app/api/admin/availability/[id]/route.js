import { NextResponse } from "next/server";

import { connectDB } from "../../../../../lib/db";
import Availability from "../../../../../models/Availability";
import { requireAdmin } from "../../../../../lib/admin";
import { toAdminAvailability } from "../../../../../lib/serializers";

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error, code: auth.status === 401 ? "NOT_AUTHENTICATED" : "FORBIDDEN" },
      { status: auth.status }
    );
  }

  const { id } = await params;

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

    await slot.deleteOne();

    return NextResponse.json({ ok: true, slot: toAdminAvailability(slot) });
  } catch (error) {
    if (error?.name === "CastError") {
      return NextResponse.json(
        { error: "Slot not found.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    console.error("[Admin] Availability delete error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
