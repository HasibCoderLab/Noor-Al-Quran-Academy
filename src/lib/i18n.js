import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en";
import bn from "../locales/bn";
import ar from "../locales/ar";

export const DEFAULT_LANG = "en";
export const STORAGE_KEY = "lang";

export const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇬🇧", name: "English", dir: "ltr" },
  { code: "bn", label: "BN", flag: "🇧🇩", name: "বাংলা", dir: "ltr" },
  { code: "ar", label: "AR", flag: "🇸🇦", name: "العربية", dir: "rtl" },
];

export const isSupportedLang = (code) =>
  LANGUAGES.some((lang) => lang.code === code);

export const getDir = (code) => (code === "ar" ? "rtl" : "ltr");

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
      ar: { translation: ar },
    },
    lng: DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    supportedLngs: LANGUAGES.map((lang) => lang.code),
    nonExplicitSupportedLngs: true,
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    ...(process.env.NODE_ENV !== "production"
      ? {
          saveMissing: true,
          missingKeyHandler: (lng, _ns, key) => {
            console.warn(`[i18n] missing key "${key}" for language "${lng}"`);
          },
        }
      : {}),
  });
}

export default i18n;
