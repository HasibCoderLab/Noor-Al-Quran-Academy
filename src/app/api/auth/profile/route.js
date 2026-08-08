import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { AUTH_COOKIE, verifyToken, toPublicUser } from "../../../../lib/jwt";

export async function PATCH(request) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.sub) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (typeof body.name === "string" && body.name.trim()) {
      user.name = body.name.trim();
    }
    if (typeof body.country === "string") {
      user.country = body.country.trim();
    }
    if (typeof body.whatsapp === "string") {
      user.whatsapp = body.whatsapp.trim();
    }
    if (typeof body.avatar === "string") {
      user.avatar = body.avatar.trim();
    }

    await user.save();

    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("[Auth] Profile update error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
