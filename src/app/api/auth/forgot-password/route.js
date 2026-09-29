import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { generateToken } from "../../../../lib/tokens";
import { sendMail, isEmailConfigured } from "../../../../lib/mailer";
import { passwordResetEmail } from "../../../../lib/emailTemplates";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;
const RESET_TTL_MS = 30 * 60 * 1000;

function siteUrl(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

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
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address.", code: "VALIDATION" },
        { status: 400 }
      );
    }

    const emailLimit = rateLimit({ key: `forgot:email:${email}`, limit: 3 });
    if (!emailLimit.ok) {
      return NextResponse.json(rateLimitedResponse(emailLimit.retryAfter), {
        status: 429,
      });
    }
    const ipLimit = rateLimit({ key: `forgot:ip:${ip}`, limit: 10 });
    if (!ipLimit.ok) {
      return NextResponse.json(rateLimitedResponse(ipLimit.retryAfter), { status: 429 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (user) {
      const { token, hash } = generateToken();
      user.passwordResetTokenHash = hash;
      user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MS);
      await user.save();

      const resetUrl = `${siteUrl(request)}/reset-password?token=${encodeURIComponent(
        token
      )}&email=${encodeURIComponent(email)}`;

      try {
        const { subject, text, html } = passwordResetEmail({
          name: user.name,
          url: resetUrl,
        });
        const result = await sendMail({ to: email, subject, text, html });
        if (!result.delivered && !isEmailConfigured() && process.env.NODE_ENV !== "production") {
          return NextResponse.json({ ok: true, devResetUrl: resetUrl });
        }
      } catch (error) {
        console.error("[Auth] Password reset email failed:", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
