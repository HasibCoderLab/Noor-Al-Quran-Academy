const buckets = new Map();

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

function prune(now) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.start >= bucket.windowMs) buckets.delete(key);
  }
}

export function rateLimit({ key, limit = 5, windowMs = DEFAULT_WINDOW_MS }) {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now - bucket.start >= bucket.windowMs) {
    bucket = { start: now, count: 0, windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (buckets.size > 5000) prune(now);

  const ok = bucket.count <= limit;
  const retryAfter = ok
    ? 0
    : Math.max(1, Math.ceil((bucket.start + bucket.windowMs - now) / 1000));

  return { ok, remaining: Math.max(0, limit - bucket.count), retryAfter };
}

export function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "local";
}

export function rateLimitedResponse(retryAfter) {
  return {
    error: "Too many attempts. Please wait a moment and try again.",
    code: "RATE_LIMITED",
    retryAfter,
  };
}
