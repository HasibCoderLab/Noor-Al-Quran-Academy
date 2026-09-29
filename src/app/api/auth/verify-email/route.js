import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { tokensMatch, isExpired } from "../../../../lib/tokens";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;

export async function POST(request) {
  try {
    const ip = clientIp(request);
    const limit = rateLimit({ key: `verify:${ip}`, limit: 10 });
    if (!limit.ok) {
      return NextResponse.json(rateLimitedResponse(limit.retryAfter), { status: 429 });
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

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.token === "string" ? body.token : "";

    if (!EMAIL_RE.test(email) || !token) {
      return NextResponse.json(
        { error: "This link is invalid or has expired.", code: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+emailVerifyTokenHash +emailVerifyExpires");
    const matched = user && tokensMatch(user.emailVerifyTokenHash, token);

    if (!matched) {
      return NextResponse.json(
        { error: "This link is invalid or has expired.", code: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    if (isExpired(user.emailVerifyExpires)) {
      return NextResponse.json(
        { error: "This link has expired. Request a new one.", code: "EXPIRED_TOKEN" },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.emailVerifyTokenHash = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Auth] Verify email error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
