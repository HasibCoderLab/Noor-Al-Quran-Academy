import { describe, it, expect } from "vitest";
import {
  rateLimit,
  clientIp,
  rateLimitedResponse,
} from "../src/lib/rateLimit.js";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    const key = "test:allow";
    expect(rateLimit({ key, limit: 3, windowMs: 60_000 })).toMatchObject({
      ok: true,
      remaining: 2,
    });
    expect(rateLimit({ key, limit: 3, windowMs: 60_000 })).toMatchObject({
      ok: true,
      remaining: 1,
    });
    expect(rateLimit({ key, limit: 3, windowMs: 60_000 })).toMatchObject({
      ok: true,
      remaining: 0,
    });
    const blocked = rateLimit({ key, limit: 3, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(1);
  });

  it("keeps buckets isolated per key", () => {
    rateLimit({ key: "iso:a", limit: 1, windowMs: 60_000 });
    expect(rateLimit({ key: "iso:a", limit: 1, windowMs: 60_000 }).ok).toBe(
      false
    );
    expect(rateLimit({ key: "iso:b", limit: 1, windowMs: 60_000 }).ok).toBe(
      true
    );
  });

  it("resets after the window elapses", async () => {
    const key = "window:test";
    expect(rateLimit({ key, limit: 1, windowMs: 40 }).ok).toBe(true);
    expect(rateLimit({ key, limit: 1, windowMs: 40 }).ok).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(rateLimit({ key, limit: 1, windowMs: 40 }).ok).toBe(true);
  });

  it("never reports negative remaining", () => {
    const key = "negative:test";
    rateLimit({ key, limit: 1, windowMs: 60_000 });
    rateLimit({ key, limit: 1, windowMs: 60_000 });
    const result = rateLimit({ key, limit: 1, windowMs: 60_000 });
    expect(result.remaining).toBe(0);
  });
});

describe("clientIp", () => {
  const makeRequest = (headers) => ({ headers: new Headers(headers) });

  it("prefers the first x-forwarded-for entry", () => {
    expect(
      clientIp(makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))
    ).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(makeRequest({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("falls back to 'local' when nothing is set", () => {
    expect(clientIp(makeRequest({}))).toBe("local");
  });
});

describe("rateLimitedResponse", () => {
  it("returns a structured payload", () => {
    const result = rateLimitedResponse(42);
    expect(result.code).toBe("RATE_LIMITED");
    expect(result.retryAfter).toBe(42);
    expect(result.error).toMatch(/too many/i);
  });
});
