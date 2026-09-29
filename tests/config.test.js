import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { envReport, allRequiredPresent } from "../src/lib/config.js";

const TOUCHED = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GROQ_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_WHATSAPP",
  "NEXT_PUBLIC_CONTACT_EMAIL",
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
});
