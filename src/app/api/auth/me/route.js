import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { AUTH_COOKIE, verifyToken, toPublicUser } from "../../../../lib/jwt";

export async function GET(request) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Not authenticated.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(payload.sub);
    if (!user || (payload.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return NextResponse.json(
        { error: "Not authenticated.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("[Auth] Me error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
