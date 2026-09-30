import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { toPublicUser } from "../../../../lib/jwt";
import { generateToken } from "../../../../lib/tokens";
import { sendMail, isEmailConfigured } from "../../../../lib/mailer";
import { verificationEmail } from "../../../../lib/emailTemplates";
import { emailVerificationRequired } from "../../../../lib/config";
import { rateLimit, clientIp, rateLimitedResponse } from "../../../../lib/rateLimit";

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;
const EMAIL_TTL_MS = 24 * 60 * 60 * 1000;

function siteUrl(request) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

export async function POST(request) {
  try {
    const ip = clientIp(request);
    const limit = rateLimit({ key: `register:${ip}`, limit: 5 });
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

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const country = typeof body.country === "string" ? body.country.trim() : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Full name is required.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address.", code: "VALIDATION" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters.", code: "WEAK_PASSWORD" },
        { status: 400 }
      );
    }

    await connectDB();

    const requiresVerification = emailVerificationRequired();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists.", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    const { token, hash } = generateToken();
    const user = await User.create({
      name,
      email,
      password,
      country,
      whatsapp,
      emailVerified: !requiresVerification,
      emailVerifyTokenHash: requiresVerification ? hash : undefined,
      emailVerifyExpires: requiresVerification
        ? new Date(Date.now() + EMAIL_TTL_MS)
        : undefined,
    });

    const verifyUrl = `${siteUrl(request)}/verify-email?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;

    let emailSent = false;
    if (requiresVerification) {
      try {
        const { subject, text, html } = verificationEmail({ name, url: verifyUrl });
        const result = await sendMail({ to: email, subject, text, html });
        emailSent = result.delivered;
      } catch (error) {
        console.error("[Auth] Verification email failed:", error);
      }
    }

    const payload = {
      user: toPublicUser(user),
      requiresVerification,
      emailSent,
    };
    if (
      requiresVerification &&
      !emailSent &&
      !isEmailConfigured() &&
      process.env.NODE_ENV !== "production"
    ) {
      payload.devVerificationUrl = verifyUrl;
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("[Auth] Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "GENERIC" },
      { status: 500 }
    );
  }
}
