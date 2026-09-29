"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import i18n, {
  DEFAULT_LANG,
  LANGUAGES,
  STORAGE_KEY,
  getDir,
  isSupportedLang,
} from "../../lib/i18n";

const I18nContext = createContext(null);

function readStoredLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isSupportedLang(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    const stored = readStoredLang();
    setLangState(stored);
    if (stored !== i18n.language) i18n.changeLanguage(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = getDir(lang);
  }, [lang]);

  const setLang = useCallback((code) => {
    if (!isSupportedLang(code)) return;
    setLangState(code);
    i18n.changeLanguage(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable — language still applies for this session */
    }
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, languages: LANGUAGES, dir: getDir(lang) }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLang() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLang must be used within an I18nProvider");
  }
  return context;
}
