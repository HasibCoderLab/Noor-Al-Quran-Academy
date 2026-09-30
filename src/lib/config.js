import { SITE } from "../data/siteData.js";

const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];

const PLACEHOLDER_RE = /X{3,}|your_|yourdomain|changeme|placeholder/i;

const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSY_VALUES = new Set(["0", "false", "no", "off"]);

export function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

function readEmailVerificationFlag() {
  const raw = (process.env.EMAIL_VERIFICATION_REQUIRED || "")
    .trim()
    .toLowerCase();
  if (TRUTHY_VALUES.has(raw)) return "true";
  if (!raw || FALSY_VALUES.has(raw)) return "false";
  return "invalid";
}

/**
 * Feature flag for the email verification requirement.
 *
 * Temporarily OFF (the default) so that students can register and log in
 * without a confirmed address while the sending domain is still unverified
 * in the mail provider. Every piece of the verification system — the
 * /verify-email page, /api/auth/verify-email, /api/auth/resend-verification,
 * the mailer, the templates, the token hashing/expiry — stays in place and is
 * switched back on by setting EMAIL_VERIFICATION_REQUIRED=true.
 *
 * Server-side only: the value is read from process.env at call time and is
 * never sent to the browser.
 */
export function emailVerificationRequired() {
  return readEmailVerificationFlag() === "true";
}

export function envReport() {
  const required = {};
  for (const key of REQUIRED_ENV) {
    required[key] = Boolean(process.env[key]);
  }

  const features = {
    ai: Boolean(process.env.GROQ_API_KEY),
    payments: Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
    ),
    email: smtpConfigured(),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    emailVerification: emailVerificationRequired(),
  };

  const warnings = [];

  const emailVerificationFlag = readEmailVerificationFlag();
  if (emailVerificationFlag === "invalid") {
    warnings.push(
      "EMAIL_VERIFICATION_REQUIRED is set to an unrecognised value — email verification stays disabled (use true or false)"
    );
  } else if (!features.emailVerification) {
    warnings.push(
      "Email verification is temporarily disabled — new accounts can log in without confirming their address (set EMAIL_VERIFICATION_REQUIRED=true to restore it)"
    );
  } else if (!features.email) {
    warnings.push(
      "EMAIL_VERIFICATION_REQUIRED is on but SMTP is not configured — verification emails cannot be delivered"
    );
  }

  const smtpTouched = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].some(
    (key) => process.env[key]
  );
  if (smtpTouched && !features.email) {
    warnings.push(
      "SMTP is partially configured — SMTP_HOST, SMTP_USER and SMTP_PASS are all required"
    );
  } else if (features.email && !process.env.SMTP_FROM && !process.env.EMAIL_FROM) {
    warnings.push(
      "SMTP_FROM is unset — the From header falls back to SMTP_USER"
    );
  }

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || SITE.whatsapp || "";
  if (!whatsapp || PLACEHOLDER_RE.test(whatsapp)) {
    warnings.push(
      "WhatsApp link resolves to a placeholder — set NEXT_PUBLIC_WHATSAPP"
    );
  }

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  if (email && PLACEHOLDER_RE.test(email)) {
    warnings.push("NEXT_PUBLIC_CONTACT_EMAIL looks like a placeholder");
  }

  if (!features.siteUrl) {
    warnings.push(
      "NEXT_PUBLIC_SITE_URL is unset — emails link to the request origin"
    );
  } else if (/localhost|127\.0\.0\.1/i.test(process.env.NEXT_PUBLIC_SITE_URL)) {
    warnings.push(
      "NEXT_PUBLIC_SITE_URL points at localhost — email verification/reset links will not work in production"
    );
  }
  if (!features.payments) {
    warnings.push("Stripe is not configured — checkout returns 503");
  }

  return { required, features, warnings };
}

export function allRequiredPresent(report = envReport()) {
  return Object.values(report.required).every(Boolean);
}

export function effectiveContact() {
  const whatsappEnv = process.env.NEXT_PUBLIC_WHATSAPP || "";
  const emailEnv = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const whatsapp = whatsappEnv || SITE.whatsapp || "";
  const email = emailEnv || SITE.email || "";
  return {
    whatsapp: {
      value: whatsapp,
      fromEnv: Boolean(whatsappEnv),
      ok: Boolean(whatsapp) && !PLACEHOLDER_RE.test(whatsapp),
    },
    email: {
      value: email,
      fromEnv: Boolean(emailEnv),
      ok: Boolean(email) && !PLACEHOLDER_RE.test(email),
    },
  };
}
