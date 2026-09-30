#!/usr/bin/env node
/**
 * pnpm doctor — validates environment configuration without touching the DB.
 *
 * Shares all checks with src/lib/config.js (the same report /api/health returns),
 * loads .env.local / .env via node's --env-file-if-exists flags (see package.json),
 * prints required-env status, feature readiness and warnings, and exits
 * 1 when a required variable is missing.
 */

function line(symbol, label, detail = "") {
  console.log(`  ${symbol} ${label}${detail ? ` — ${detail}` : ""}`);
}

const FEATURE_LABELS = {
  ai: "AI chat (Groq)",
  payments: "Stripe payments",
  email: "SMTP email",
  siteUrl: "Public site URL",
  emailVerification: "Email verification required",
};

async function main() {
  const { envReport, allRequiredPresent, effectiveContact } = await import(
    new URL("../src/lib/config.js", `file://${__filename.replace(/\\/g, "/")}`)
      .href
  );

  const report = envReport();
  const contact = effectiveContact();

  console.log("Noor Al-Quran Academy — configuration doctor\n");

  console.log("Required environment:");
  for (const [key, present] of Object.entries(report.required)) {
    line(present ? "✓" : "✗", key, present ? "set" : "MISSING");
  }

  console.log("\nFeature readiness:");
  for (const [key, ok] of Object.entries(report.features)) {
    line(ok ? "✓" : "○", FEATURE_LABELS[key], ok ? "configured" : "not configured");
  }

  console.log("\nContact configuration:");
  line(
    contact.whatsapp.ok ? "✓" : "!",
    "NEXT_PUBLIC_WHATSAPP",
    contact.whatsapp.ok
      ? contact.whatsapp.fromEnv
        ? contact.whatsapp.value
        : `${contact.whatsapp.value} (site default)`
      : "resolves to a placeholder — set NEXT_PUBLIC_WHATSAPP"
  );
  line(
    contact.email.ok ? "✓" : "○",
    "NEXT_PUBLIC_CONTACT_EMAIL",
    contact.email.fromEnv
      ? contact.email.value
      : `${contact.email.value} (site default)`
  );

  if (report.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of report.warnings) {
      console.log(`  ! ${warning}`);
    }
  }

  console.log(
    allRequiredPresent(report)
      ? "\nResult: OK — all required variables are set."
      : "\nResult: FAILED — fix the missing variables above."
  );
  process.exit(allRequiredPresent(report) ? 0 : 1);
}

main().catch((error) => {
  console.error("Doctor failed:", error);
  process.exit(1);
});
