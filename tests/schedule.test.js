import { describe, it, expect } from "vitest";
import {
  isValidDate,
  weekdayOf,
  isPastDate,
  todayDhaka,
} from "../src/lib/schedule.js";

describe("isValidDate", () => {
  it("accepts real dates in YYYY-MM-DD", () => {
    expect(isValidDate("2026-01-31")).toBe(true);
    expect(isValidDate("2024-02-29")).toBe(true); // leap year
  });

  it("rejects malformed values", () => {
    expect(isValidDate("")).toBe(false);
    expect(isValidDate("31-01-2026")).toBe(false);
    expect(isValidDate("2026-1-31")).toBe(false);
    expect(isValidDate("not-a-date")).toBe(false);
    expect(isValidDate(20260131)).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
  });

  it("rejects impossible dates", () => {
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("2025-02-29")).toBe(false); // not a leap year
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("2026-00-10")).toBe(false);
    expect(isValidDate("2026-04-31")).toBe(false);
  });
});

describe("weekdayOf", () => {
  it("maps known dates to weekday keys", () => {
    expect(weekdayOf("2026-01-01")).toBe("thu");
    expect(weekdayOf("2026-01-04")).toBe("sun");
    expect(weekdayOf("2026-01-03")).toBe("sat");
    expect(weekdayOf("2026-01-05")).toBe("mon");
  });
});

describe("isPastDate", () => {
  it("treats dates before today (Dhaka) as past", () => {
    expect(isPastDate("2000-01-01")).toBe(true);
  });

  it("treats far-future dates as not past", () => {
    expect(isPastDate("2999-12-31")).toBe(false);
  });
});

describe("todayDhaka", () => {
  it("returns today's date in Asia/Dhaka as YYYY-MM-DD", () => {
    const value = todayDhaka();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const dhakaNow = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
    }).format(new Date());
    expect(value).toBe(dhakaNow);
  });
});
