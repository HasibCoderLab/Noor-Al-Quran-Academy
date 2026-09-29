import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { setAuthCookie, signToken, toPublicUser } from "../../../../lib/jwt";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;

export async function POST(request) {
  try {
    const ip = clientIp(request);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter your email and password.", code: "VALIDATION" },
        { status: 400 }
      );
    }

    const ipLimit = rateLimit({ key: `login:ip:${ip}`, limit: 30 });
    if (!ipLimit.ok) {
      return NextResponse.json(rateLimitedResponse(ipLimit.retryAfter), { status: 429 });
    }
    if (EMAIL_RE.test(email)) {
      const acctLimit = rateLimit({ key: `login:acct:${email}`, limit: 10 });
      if (!acctLimit.ok) {
        return NextResponse.json(rateLimitedResponse(acctLimit.retryAfter), {
          status: 429,
        });
      }
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { error: "Invalid email or password.", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    if (user.emailVerified === false) {
      return NextResponse.json(
        {
          error: "Please confirm your email address before logging in.",
          code: "EMAIL_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ user: toPublicUser(user) });
    setAuthCookie(response, signToken(user));
    return response;
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
