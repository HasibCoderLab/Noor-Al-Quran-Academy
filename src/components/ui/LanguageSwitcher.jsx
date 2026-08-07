"use client";

import { useCallback, useEffect, useState } from "react";

import i18n from "../../lib/i18n";

const LANGS = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "bn", label: "BN", flag: "🇧🇩" },
  { code: "ar", label: "AR", flag: "🇸🇦" },
];

export default function LanguageSwitcher({ className = "" }) {
  const [lang, setLang] = useState("en");

  const applyLang = useCallback((code) => {
    setLang(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", code);
      document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    }
    i18n.changeLanguage(code);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("lang") || "en";
    applyLang(stored);
  }, [applyLang]);

  return (
    <div className={`flex items-center gap-1 rounded-full bg-secondary p-1 ${className}`}>
      {LANGS.map((item) => (
        <button
          key={item.code}
          onClick={() => applyLang(item.code)}
          aria-pressed={lang === item.code}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            lang === item.code
              ? "bg-primary text-white shadow-sm"
              : "text-primary/70 hover:text-primary"
          }`}
        >
          <span>{item.flag}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
