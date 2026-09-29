import { describe, it, expect } from "vitest";
import {
  generateToken,
  hashToken,
  tokensMatch,
  isExpired,
} from "../src/lib/tokens.js";

describe("generateToken", () => {
  it("produces a token whose hash matches", () => {
    const { token, hash } = generateToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    expect(hash).toBe(hashToken(token));
  });

  it("produces unique tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a.token).not.toBe(b.token);
  });
});

describe("hashToken", () => {
  it("is a stable hex sha256", () => {
    const hash = hashToken("abc");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken("abc")).toBe(hash);
    expect(hashToken("abcd")).not.toBe(hash);
  });
});

describe("tokensMatch", () => {
  it("matches a valid token against its stored hash", () => {
    const { token, hash } = generateToken();
    expect(tokensMatch(hash, token)).toBe(true);
  });

  it("rejects wrong tokens and missing values", () => {
    const { token, hash } = generateToken();
    expect(tokensMatch(hash, `${token}x`)).toBe(false);
    expect(tokensMatch(hash, "")).toBe(false);
    expect(tokensMatch(hash, null)).toBe(false);
    expect(tokensMatch("", token)).toBe(false);
    expect(tokensMatch(null, token)).toBe(false);
    expect(tokensMatch(null, null)).toBe(false);
  });
});

describe("isExpired", () => {
  it("treats null/undefined as expired", () => {
    expect(isExpired(null)).toBe(true);
    expect(isExpired(undefined)).toBe(true);
  });

  it("treats past dates as expired and future dates as valid", () => {
    expect(isExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isExpired(new Date(Date.now() + 60_000))).toBe(false);
  });

  it("treats 'now' as expired (inclusive)", () => {
    const now = new Date();
    expect(isExpired(now)).toBe(true);
  });
});
