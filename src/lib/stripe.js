import Stripe from "stripe";

let client = null;

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  if (!stripeConfigured()) return null;
  if (client) return client;

  const options = {};
  const base = process.env.STRIPE_API_BASE;
  if (base) {
    try {
      const url = new URL(base);
      options.host = url.hostname;
      options.port = url.port ? Number(url.port) : undefined;
      options.protocol = url.protocol.replace(":", "");
    } catch {
      // ignore malformed override, fall back to default endpoint
    }
  }

  client = new Stripe(process.env.STRIPE_SECRET_KEY, options);
  return client;
}
