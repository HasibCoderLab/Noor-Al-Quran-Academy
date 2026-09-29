import { describe, it, expect, vi, afterEach } from "vitest";
import { errorCodeKey, errorMessage } from "../src/lib/apiError.js";

const t = (key) => `t:${key}`;

describe("errorCodeKey", () => {
  it("maps known codes to i18n keys", () => {
    expect(errorCodeKey("SLOT_TAKEN")).toBe("errors.slotTaken");
    expect(errorCodeKey("AI_RATE_LIMITED")).toBe("errors.aiRateLimited");
    expect(errorCodeKey("NOT_ELIGIBLE")).toBe("review.notEligible");
  });

  it("returns null for unknown or missing codes", () => {
    expect(errorCodeKey("MADE_UP")).toBeNull();
    expect(errorCodeKey(undefined)).toBeNull();
    expect(errorCodeKey("")).toBeNull();
  });
});

describe("errorMessage", () => {
  it("prefers the mapped code key", () => {
    expect(errorMessage(t, { code: "SLOT_TAKEN", error: "raw" }, "x")).toBe(
      "t:errors.slotTaken"
    );
  });

  it("falls back to the raw error when no code mapping exists", () => {
    expect(errorMessage(t, { error: "plain failure" }, "x")).toBe(
      "plain failure"
    );
  });

  it("falls back to the fallback key when nothing else applies", () => {
    expect(errorMessage(t, {}, "errors.generic")).toBe("t:errors.generic");
    expect(errorMessage(t, null, "errors.generic")).toBe("t:errors.generic");
    expect(errorMessage(t, null)).toBe("t:errors.generic");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
