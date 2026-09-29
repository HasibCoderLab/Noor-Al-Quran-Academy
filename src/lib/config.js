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

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || "";
  if (!whatsapp || PLACEHOLDER_RE.test(whatsapp)) {
    warnings.push("NEXT_PUBLIC_WHATSAPP is unset or still a placeholder");
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
