import { PRICING } from "../data/siteData";

export const REGIONS = ["bd", "intl"];

export function planFor(region, planIndex) {
  if (!REGIONS.includes(region)) return null;
  const block = PRICING[region];
  if (!block) return null;

  const index = Number(planIndex);
  if (!Number.isInteger(index)) return null;
  const plan = block.plans[index];
  if (!plan) return null;

  return {
    region,
    planName: plan.name,
    classes: plan.classes,
    price: plan.price,
    currency: block.currency.toLowerCase(),
    amount: Math.round(plan.price * 100),
  };
}
