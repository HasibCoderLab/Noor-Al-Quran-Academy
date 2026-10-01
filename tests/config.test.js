import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  envReport,
  allRequiredPresent,
  effectiveContact,
  siteUrl,
} from "../src/lib/config.js";

const TOUCHED = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GROQ_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "SMTP_SECURE",
  "EMAIL_FROM",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_WHATSAPP",
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "EMAIL_VERIFICATION_REQUIRED",
];

let snapshot;

beforeEach(() => {
  snapshot = {};
  for (const key of TOUCHED) {
    snapshot[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of TOUCHED) {
    if (snapshot[key] === undefined) delete process.env[key];
    else process.env[key] = snapshot[key];
  }
});

describe("envReport", () => {
  it("reports missing required variables", () => {
    const report = envReport();
    expect(report.required.MONGODB_URI).toBe(false);
    expect(report.required.JWT_SECRET).toBe(false);
    expect(allRequiredPresent(report)).toBe(false);
  });

  it("reports required variables when set", () => {
    process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
    process.env.JWT_SECRET = "a-long-random-secret";
    const report = envReport();
    expect(report.required.MONGODB_URI).toBe(true);
    expect(report.required.JWT_SECRET).toBe(true);
    expect(allRequiredPresent(report)).toBe(true);
  });

  it("detects feature readiness", () => {
    process.env.GROQ_API_KEY = "gsk_test";
    process.env.STRIPE_SECRET_KEY = "sk_test";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "secret";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    const { features } = envReport();
    expect(features).toMatchObject({
      ai: true,
      payments: true,
      email: true,
      siteUrl: true,
    });
  });

  it("flags partial Stripe configuration as not ready", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test";
    const { features } = envReport();
    expect(features.payments).toBe(false);
  });

  it("warns about placeholder or unset contact values", () => {
    process.env.NEXT_PUBLIC_WHATSAPP = "https://wa.me/8801XXXXXXXXX";
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "contact@yourdomain.com";

    const { warnings } = envReport();
    expect(
      warnings.some((w) => w.includes("NEXT_PUBLIC_WHATSAPP"))
    ).toBe(true);
    expect(
      warnings.some((w) => w.includes("NEXT_PUBLIC_CONTACT_EMAIL"))
    ).toBe(true);
  });

  it("accepts real contact values without placeholder warnings", () => {
    process.env.NEXT_PUBLIC_WHATSAPP = "https://wa.me/8801712345678";
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "hello@nooralquran.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://nooralquran.com";

    const { warnings } = envReport();
    expect(
      warnings.some((w) => w.includes("NEXT_PUBLIC_WHATSAPP"))
    ).toBe(false);
    expect(
      warnings.some((w) => w.includes("NEXT_PUBLIC_CONTACT_EMAIL"))
    ).toBe(false);
    expect(warnings.some((w) => w.includes("NEXT_PUBLIC_SITE_URL"))).toBe(
      false
    );
  });

  it("warns when Stripe is not configured", () => {
    const { warnings } = envReport();
    expect(warnings.some((w) => w.includes("Stripe"))).toBe(true);
  });

  it("flags partial SMTP configuration as not ready", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";

    const report = envReport();
    expect(report.features.email).toBe(false);
    expect(
      report.warnings.some(
        (w) => w.includes("SMTP") && w.includes("partially")
      )
    ).toBe(true);
  });

  it("warns when SMTP_FROM is missing", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "secret";

    const report = envReport();
    expect(report.features.email).toBe(true);
    expect(report.warnings.some((w) => w.includes("SMTP_FROM"))).toBe(true);
  });

  it("does not warn about SMTP_FROM when EMAIL_FROM legacy fallback is set", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "secret";
    process.env.EMAIL_FROM = "Noor <no-reply@example.com>";

    const report = envReport();
    expect(report.warnings.some((w) => w.includes("SMTP_FROM"))).toBe(false);
  });

  it("never exposes SMTP secrets in the report", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "super-secret-pass";
    process.env.SMTP_FROM = "Noor <no-reply@example.com>";

    const serialized = JSON.stringify(envReport());
    expect(serialized).not.toContain("super-secret-pass");
    expect(serialized).not.toContain("SMTP_PASS");
  });

  it("warns when NEXT_PUBLIC_SITE_URL points at localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    const { warnings } = envReport();
    expect(warnings.some((w) => w.includes("localhost"))).toBe(true);
  });
});

describe("siteUrl", () => {
  it("strips trailing slashes from NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://noor-al-quran-academy-pi.vercel.app//";
    expect(siteUrl({ nextUrl: { origin: "https://academy.test" } })).toBe(
      "https://noor-al-quran-academy-pi.vercel.app"
    );
  });

  it("falls back to the request origin when NEXT_PUBLIC_SITE_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrl({ nextUrl: { origin: "https://academy.test" } })).toBe(
      "https://academy.test"
    );
  });

  it("tolerates a missing request and returns an empty base", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(siteUrl()).toBe("");
  });
});

describe("effectiveContact", () => {
  it("prefers env values over site defaults", () => {
    process.env.NEXT_PUBLIC_WHATSAPP = "https://wa.me/8801999999999";
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = "real@nooralquran.com";

    const contact = effectiveContact();
    expect(contact.whatsapp).toMatchObject({
      value: "https://wa.me/8801999999999",
      fromEnv: true,
      ok: true,
    });
    expect(contact.email).toMatchObject({
      value: "real@nooralquran.com",
      fromEnv: true,
      ok: true,
    });
  });

  it("falls back to the site defaults when env is unset", () => {
    const contact = effectiveContact();
    expect(contact.whatsapp.fromEnv).toBe(false);
    expect(contact.whatsapp.ok).toBe(true);
    expect(contact.whatsapp.value).toContain("wa.me/");
    expect(contact.email.fromEnv).toBe(false);
    expect(contact.email.value).toContain("@");
  });

  it("flags placeholder env values as not ok", () => {
    process.env.NEXT_PUBLIC_WHATSAPP = "https://wa.me/8801XXXXXXXXX";
    expect(effectiveContact().whatsapp.ok).toBe(false);
  });
});
