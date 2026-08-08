"use client";

import { getPasswordStrength } from "../../lib/passwordStrength";

const STRENGTH_META = {
  weak: { label: "Weak", bar: "bg-red-400/70", text: "text-red-600", segments: 1 },
  medium: { label: "Medium", bar: "bg-accent", text: "text-yellow-600", segments: 2 },
  strong: { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600", segments: 3 },
  "very-strong": {
    label: "Very Strong",
    bar: "bg-emerald-600",
    text: "text-emerald-700",
    segments: 4,
  },
};

export function PasswordStrength({ password }) {
  const result = getPasswordStrength(password);
  if (!result.label) return null;

  const meta = STRENGTH_META[result.label];

  return (
    <div>
      <div className="mt-1 flex gap-1.5" aria-label={`Password strength: ${meta.label}`}>
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              segment <= meta.segments ? meta.bar : "bg-primary/10"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-semibold text-primary/60">
        Password strength: <span className={meta.text}>{meta.label}</span>
      </p>
    </div>
  );
}
