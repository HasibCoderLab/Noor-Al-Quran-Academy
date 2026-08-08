"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";

import { useScrollDirection } from "../../hooks/useScrollDirection";
import i18n from "../../lib/i18n";
import { NAV_LINKS, SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import AccountMenu from "./AccountMenu";
import {
  navbarVariants,
  mobileMenuVariants,
  staggerContainer,
  staggerItem,
  hoverScale,
  scaleFade,
} from "../../lib/animations";

const LANGS = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "bn", flag: "🇧🇩", label: "BN" },
  { code: "ar", flag: "🇸🇦", label: "AR" },
];

export default function Navbar() {
  const { scrollDir, isAtTop } = useScrollDirection();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    setHash(window.location.hash.replace("#", ""));
    const onHashChange = () => setHash(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("lang") || "en";
    setLang(stored);
    document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
    i18n.changeLanguage(stored);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const applyLang = (code) => {
    setLang(code);
    setLangOpen(false);
    localStorage.setItem("lang", code);
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    i18n.changeLanguage(code);
  };

  const isActive = (href) => {
    if (href.startsWith("/#")) {
      return pathname === "/" && hash === href.split("#")[1];
    }
    return pathname === href;
  };

  const handleMobileLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const handleDashboardLogout = async () => {
    await logout();
    router.push("/login");
  };

  const barClasses =
    "block h-0.5 w-6 rounded-full bg-current transition";

  return (
    <motion.header
      animate={scrollDir === "down" ? "hidden" : "visible"}
      variants={navbarVariants}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isAtTop
          ? "bg-transparent text-primary"
          : "border-b border-primary/10 bg-background/95 text-primary shadow-sm backdrop-blur-md"
      }`}
    >
      <nav className={`${styles.container} flex h-16 items-center justify-between lg:h-20`}>
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="text-2xl leading-none">🌙</span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-hind-siliguri truncate text-lg font-bold text-primary">
              {SITE.name}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-primary/60">
              Online Academy
            </span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 xl:flex xl:items-center xl:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-2 text-sm font-semibold transition-colors hover:text-accent ${
                isActive(link.href) ? "text-accent" : "text-primary/80"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.span
                  layoutId="activeNavDot"
                  className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
                />
              )}
            </Link>
          ))}

          {/* Language toggle */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              aria-label="Language"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className={`flex items-center justify-center rounded-full p-2 transition ${
                langOpen
                  ? "bg-secondary text-accent"
                  : "text-primary/80 hover:bg-secondary hover:text-primary"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  variants={scaleFade}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute end-0 top-full mt-2 w-32 overflow-hidden rounded-xl bg-white p-1 shadow-lg ring-1 ring-primary/10"
                >
                  {LANGS.map((item) => (
                    <li key={item.code}>
                      <button
                        onClick={() => applyLang(item.code)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                          lang === item.code
                            ? "text-accent"
                            : "text-primary/80 hover:bg-secondary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.flag}</span>
                          {item.label}
                        </span>
                        {lang === item.code && <span>✓</span>}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden items-center gap-3 xl:flex">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-9 w-9 animate-pulse rounded-full bg-primary/10" />
              <span className="h-3 w-16 animate-pulse rounded-full bg-primary/10" />
            </span>
          ) : isAuthenticated && isDashboard ? (
            <>
              <AccountMenu />
              <button
                type="button"
                onClick={handleDashboardLogout}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : isAuthenticated ? (
            <>
              <AccountMenu />
              <motion.span variants={hoverScale} className="inline-flex">
                <Link href="/free-trial" className={styles.btnAccent}>
                  Free Trial
                </Link>
              </motion.span>
            </>
          ) : (
            <>
              <motion.span variants={hoverScale} className="inline-flex">
                <Link href="/login" className={styles.btnGhost}>
                  Login
                </Link>
              </motion.span>
              <motion.span variants={hoverScale} className="inline-flex">
                <Link href="/free-trial" className={styles.btnAccent}>
                  Free Trial
                </Link>
              </motion.span>
            </>
          )}
        </div>

        {/* Hamburger */}
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          animate={isOpen ? "open" : "closed"}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 xl:hidden"
        >
          <motion.span
            variants={{ open: { rotate: 45, y: 8 }, closed: { rotate: 0, y: 0 } }}
            transition={{ duration: 0.25 }}
            className={barClasses}
          />
          <motion.span
            variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }}
            transition={{ duration: 0.2 }}
            className={barClasses}
          />
          <motion.span
            variants={{ open: { rotate: -45, y: -8 }, closed: { rotate: 0, y: 0 } }}
            transition={{ duration: 0.25 }}
            className={barClasses}
          />
        </motion.button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="xl:hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="overflow-hidden border-t border-primary/10 bg-background/95 backdrop-blur-md"
            >
              <motion.ul
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1 px-4 py-6"
              >
                {NAV_LINKS.map((link) => (
                  <motion.li key={link.href} variants={staggerItem}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive(link.href)
                          ? "bg-accent/10 text-accent"
                          : "text-primary/80 hover:bg-secondary"
                      }`}
                    >
                      {isActive(link.href) && (
                        <motion.span
                          layoutId="activeNavDot"
                          className="h-1.5 w-1.5 rounded-full bg-accent"
                        />
                      )}
                      {link.label}
                    </Link>
                  </motion.li>
                ))}

                <motion.li variants={staggerItem} className="mt-4 flex flex-col gap-3 border-t border-primary/10 pt-4">
                  <p className="px-4 text-xs font-bold uppercase tracking-wider text-primary/50">
                    Language
                  </p>
                  <div className="flex gap-1 px-4">
                    {LANGS.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => applyLang(item.code)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${
                          lang === item.code
                            ? "bg-primary text-white shadow-sm"
                            : "bg-secondary text-primary/70 hover:text-primary"
                        }`}
                      >
                        <span>{item.flag}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </motion.li>

                <motion.li variants={staggerItem} className="mt-3 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
                        <Avatar user={user} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-primary">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-primary/60">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={styles.btnOutline}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/free-trial"
                        onClick={() => setIsOpen(false)}
                        className={styles.btnAccent}
                      >
                        Book Free Trial
                      </Link>
                      <button
                        type="button"
                        onClick={handleMobileLogout}
                        className={styles.btnGhost}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className={styles.btnGhost}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className={styles.btnOutline}
                      >
                        Register
                      </Link>
                      <Link
                        href="/free-trial"
                        onClick={() => setIsOpen(false)}
                        className={styles.btnAccent}
                      >
                        Book Free Trial
                      </Link>
                    </>
                  )}
                </motion.li>
              </motion.ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
