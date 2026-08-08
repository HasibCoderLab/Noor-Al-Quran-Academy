"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { styles } from "../../styles/commonStyles";
import { getPasswordStrength } from "../../lib/password";

const STRENGTH_ORDER = ["weak", "medium", "strong"];
const STRENGTH_COLORS = {
  weak: "bg-red-500",
  medium: "bg-yellow-500",
  strong: "bg-emerald-500",
};
const STRENGTH_LABELS = {
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
};

export default function PasswordField({
  label,
  id,
  value,
  onChange,
  placeholder,
  showStrength = false,
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;
  const filledUntil = strength ? STRENGTH_ORDER.indexOf(strength) : -1;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-primary">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${styles.input} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-3 flex items-center text-primary/50 transition hover:text-primary focus-visible:outline-none"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {showStrength && strength && (
        <div>
          <div className="mt-1 flex gap-1.5">
            {STRENGTH_ORDER.map((level, index) => (
              <span
                key={level}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index <= filledUntil ? STRENGTH_COLORS[strength] : "bg-primary/10"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-semibold text-primary/60">
            Password strength:{" "}
            <span className={strength === "strong" ? "text-emerald-600" : strength === "weak" ? "text-red-500" : "text-yellow-600"}>
              {STRENGTH_LABELS[strength]}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
