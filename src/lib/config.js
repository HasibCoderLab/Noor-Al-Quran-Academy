import { SITE } from "../data/siteData.js";

const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];

const PLACEHOLDER_RE = /X{3,}|your_|yourdomain|changeme|placeholder/i;

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
    email: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  };

  const warnings = [];

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
