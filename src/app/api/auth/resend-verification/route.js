import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { generateToken } from "../../../../lib/tokens";
import { sendMail, isEmailConfigured } from "../../../../lib/mailer";
import { verificationEmail } from "../../../../lib/emailTemplates";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;
const EMAIL_TTL_MS = 24 * 60 * 60 * 1000;

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

    const emailLimit = rateLimit({ key: `resend:email:${email}`, limit: 3 });
    if (!emailLimit.ok) {
      return NextResponse.json(rateLimitedResponse(emailLimit.retryAfter), {
        status: 429,
      });
    }
    const ipLimit = rateLimit({ key: `resend:ip:${ip}`, limit: 10 });
    if (!ipLimit.ok) {
      return NextResponse.json(rateLimitedResponse(ipLimit.retryAfter), { status: 429 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (user && user.emailVerified === false) {
      const { token, hash } = generateToken();
      user.emailVerifyTokenHash = hash;
      user.emailVerifyExpires = new Date(Date.now() + EMAIL_TTL_MS);
      await user.save();

      const verifyUrl = `${siteUrl(request)}/verify-email?token=${encodeURIComponent(
        token
      )}&email=${encodeURIComponent(email)}`;

      try {
        const { subject, text, html } = verificationEmail({
          name: user.name,
          url: verifyUrl,
        });
        const result = await sendMail({ to: email, subject, text, html });
        if (!result.delivered && !isEmailConfigured() && process.env.NODE_ENV !== "production") {
          return NextResponse.json({ ok: true, devVerificationUrl: verifyUrl });
        }
      } catch (error) {
        console.error("[Auth] Resend verification email failed:", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Auth] Resend verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
