import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { AUTH_COOKIE, verifyToken, setAuthCookie, signToken, toPublicUser } from "../../../../lib/jwt";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";

export async function POST(request) {
  try {
    const ip = clientIp(request);
    const limit = rateLimit({ key: `change-password:${ip}`, limit: 10 });
    if (!limit.ok) {
      return NextResponse.json(rateLimitedResponse(limit.retryAfter), { status: 429 });
    }

    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Not authenticated.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
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

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Please enter your current and new password.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters.", code: "WEAK_PASSWORD" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(payload.sub).select("+password");
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    if ((payload.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return NextResponse.json(
        { error: "Not authenticated.", code: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    if (!(await user.comparePassword(currentPassword))) {
      return NextResponse.json(
        { error: "Your current password is incorrect.", code: "INVALID_PASSWORD" },
        { status: 400 }
      );
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const response = NextResponse.json({ ok: true, user: toPublicUser(user) });
    setAuthCookie(response, signToken(user));
    return response;
  } catch (error) {
    console.error("[Auth] Change password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
