import { describe, it, expect } from "vitest";
import { planFor, REGIONS } from "../src/lib/pricing.js";
import { PRICING } from "../src/data/siteData.js";

describe("planFor", () => {
  it("returns a BD plan with minor-unit amount", () => {
    const plan = planFor("bd", 0);
    expect(plan).not.toBeNull();
    expect(plan.region).toBe("bd");
    expect(plan.planName).toBe(PRICING.bd.plans[0].name);
    expect(plan.currency).toBe("bdt");
    expect(plan.price).toBe(PRICING.bd.plans[0].price);
    expect(plan.amount).toBe(Math.round(PRICING.bd.plans[0].price * 100));
  });

  it("returns an intl plan with USD in minor units", () => {
    const plan = planFor("intl", 0);
    expect(plan).not.toBeNull();
    expect(plan.currency).toBe("usd");
    expect(plan.amount).toBe(plan.price * 100);
  });

  it("resolves each index of each region", () => {
    for (const region of REGIONS) {
      PRICING[region].plans.forEach((_, index) => {
        const plan = planFor(region, index);
        expect(plan).not.toBeNull();
        expect(plan.planName).toBe(PRICING[region].plans[index].name);
      });
    }
  });

  it("rejects unknown regions", () => {
    expect(planFor("eu", 0)).toBeNull();
    expect(planFor("", 0)).toBeNull();
    expect(planFor(undefined, 0)).toBeNull();
  });

  it("rejects non-integer plan indexes", () => {
    expect(planFor("bd", "starter")).toBeNull();
    expect(planFor("bd", 1.5)).toBeNull();
    expect(planFor("bd", NaN)).toBeNull();
    expect(planFor("bd", undefined)).toBeNull();
  });

  it("rejects out-of-range indexes", () => {
    expect(planFor("bd", -1)).toBeNull();
    expect(planFor("bd", 99)).toBeNull();
    expect(planFor("bd", String(PRICING.bd.plans.length))).toBeNull();
  });

  it("never trusts client-shaped strings as prices", () => {
    const plan = planFor("bd", "0");
    expect(plan.amount).toBe(Math.round(PRICING.bd.plans[0].price * 100));
  });
});
