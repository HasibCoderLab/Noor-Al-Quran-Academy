import { describe, it, expect } from "vitest";
import en from "../src/locales/en.js";
import bn from "../src/locales/bn.js";
import ar from "../src/locales/ar.js";

const locales = { en, bn, ar };
const sortedKeys = (messages) => Object.keys(messages).sort();

describe("locale parity", () => {
  const enKeys = sortedKeys(en);

  it("has a non-trivial key set", () => {
    expect(enKeys.length).toBeGreaterThan(400);
  });

  it("bn has exactly the same keys as en", () => {
    expect(sortedKeys(bn)).toEqual(enKeys);
  });

  it("ar has exactly the same keys as en", () => {
    expect(sortedKeys(ar)).toEqual(enKeys);
  });

  it("has no empty or non-string values in any locale", () => {
    for (const [name, messages] of Object.entries(locales)) {
      for (const key of Object.keys(messages)) {
        expect(
          typeof messages[key],
          `${name}: ${key} should be a string`
        ).toBe("string");
        expect(messages[key].trim().length, `${name}: ${key} empty`).toBeGreaterThan(0);
      }
    }
  });
});
