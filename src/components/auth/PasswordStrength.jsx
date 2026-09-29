"use client";

import { useTranslation } from "react-i18next";

import { getPasswordStrength } from "../../lib/passwordStrength";

const STRENGTH_META = {
  weak: { labelKey: "auth.strength.weak", bar: "bg-red-400/70", text: "text-red-600", segments: 1 },
  medium: { labelKey: "auth.strength.medium", bar: "bg-accent", text: "text-yellow-600", segments: 2 },
  strong: { labelKey: "auth.strength.strong", bar: "bg-emerald-500", text: "text-emerald-600", segments: 3 },
  "very-strong": {
    labelKey: "auth.strength.veryStrong",
    bar: "bg-emerald-600",
    text: "text-emerald-700",
    segments: 4,
  },
};

export function PasswordStrength({ password }) {
  const { t } = useTranslation();
  const result = getPasswordStrength(password);
  if (!result.label) return null;

  const meta = STRENGTH_META[result.label];

  return (
    <div>
      <div
        className="mt-1 flex gap-1.5"
        aria-label={`${t("auth.passwordStrength")} ${t(meta.labelKey)}`}
      >
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
        {t("auth.passwordStrength")} <span className={meta.text}>{t(meta.labelKey)}</span>
      </p>
    </div>
  );
}
