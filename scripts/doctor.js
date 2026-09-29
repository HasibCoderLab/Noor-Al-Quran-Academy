#!/usr/bin/env node
/**
 * pnpm doctor — validates environment configuration without touching the DB.
 *
 * Loads .env.local / .env via node's --env-file-if-exists flags (see package.json),
 * prints required-env status, feature readiness and warnings, and exits
 * 1 when a required variable is missing.
 */

const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];
const PLACEHOLDER_RE = /X{3,}|your_|changeme|placeholder/i;

function line(symbol, label, detail = "") {
  console.log(`  ${symbol} ${label}${detail ? ` — ${detail}` : ""}`);
}

const requiredOk = {};
let exitCode = 0;

console.log("Noor Al-Quran Academy — configuration doctor\n");

console.log("Required environment:");
for (const key of REQUIRED_ENV) {
  const present = Boolean(process.env[key]);
  requiredOk[key] = present;
  if (!present) exitCode = 1;
  line(present ? "✓" : "✗", key, present ? "set" : "MISSING");
}

console.log("\nFeature readiness:");
const features = [
  ["AI chat (Groq)", Boolean(process.env.GROQ_API_KEY)],
  [
    "Stripe payments",
    Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
    ),
  ],
  ["SMTP email", Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)],
  ["Public site URL", Boolean(process.env.NEXT_PUBLIC_SITE_URL)],
];
for (const [label, ok] of features) {
  line(ok ? "✓" : "○", label, ok ? "configured" : "not configured");
}

console.log("\nContact configuration:");
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || "";
const whatsappOk = Boolean(whatsapp) && !PLACEHOLDER_RE.test(whatsapp);
line(
  whatsappOk ? "✓" : "!",
  "NEXT_PUBLIC_WHATSAPP",
  whatsappOk ? whatsapp : "unset or placeholder — WhatsApp buttons will not work"
);

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
const emailOk = contactEmail && !PLACEHOLDER_RE.test(contactEmail);
line(
  emailOk ? "✓" : "○",
  "NEXT_PUBLIC_CONTACT_EMAIL",
  emailOk ? contactEmail : contactEmail || "using site default"
);

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.log("\nWarnings:");
  console.log(
    "  ! NEXT_PUBLIC_SITE_URL is unset — verification/reset emails link to the request origin"
  );
}

console.log(
  exitCode === 0
    ? "\nResult: OK — all required variables are set."
    : "\nResult: FAILED — fix the missing variables above."
);
process.exit(exitCode);
