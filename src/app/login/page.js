"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { errorMessage } from "../../lib/apiError";
import PasswordInput from "../../components/auth/PasswordInput";
import { useAuth } from "../../context/AuthContext";

const DEMO_ACCOUNT = {
  email: "demo.student@noor-academy.test",
  password: "NoorDemo@2026!",
};

const isDemoMode = process.env.NODE_ENV !== "production";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [verifyHint, setVerifyHint] = useState("");

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const fillDemoAccount = () => {
    setForm({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password });
    toast.success(t("auth.demoFilled"));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error(t("validation.emailRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!response.ok) {
        setVerifyHint(
          response.code === "EMAIL_NOT_VERIFIED" ? form.email.trim() : ""
        );
        toast.error(errorMessage(t, response, "auth.loginFailed"));
        return;
      }

      setVerifyHint("");
      toast.success(t("auth.welcomeName", { name: response.user.name.split(" ")[0] }));
      const fromParam = new URLSearchParams(window.location.search).get("from");
      const safeFrom =
        fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")
          ? fromParam
          : null;
      router.push(
        safeFrom || (response.user.role === "admin" ? "/admin" : "/dashboard")
      );
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={slideFromBottom}
        initial="hidden"
        animate="visible"
        className={`${styles.container} relative z-10`}
      >
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10">
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl leading-none">🌙</span>
              <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
                {t("auth.welcomeBack")}
              </h1>
              <p className="mt-1 text-sm text-primary/60">
                {t("auth.loginSubtitle", { app: SITE.shortName })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-primary">
                  {t("common.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={styles.input}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <PasswordInput
                  id="password"
                  label={t("auth.password")}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-primary/60 transition hover:text-accent"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`${styles.btnPrimary} mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {submitting ? t("auth.loggingIn") : t("auth.login")}
              </button>

              {verifyHint && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
                  <p className="text-xs font-semibold text-amber-800">
                    {t("errors.emailNotVerified")}
                  </p>
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(verifyHint)}`}
                    className="mt-2 inline-block text-xs font-bold text-primary underline hover:text-accent"
                  >
                    {t("auth.verifyResend")}
                  </Link>
                </div>
              )}
            </form>

            {isDemoMode && (
              <div className="mt-5 rounded-xl border border-dashed border-accent/50 bg-accent/5 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  {t("auth.demoAccount")}
                </p>
                <p className="mt-1 break-all text-xs text-primary/70">
                  {t("common.email")}: {DEMO_ACCOUNT.email}
                </p>
                <p className="break-all text-xs text-primary/70">
                  {t("auth.password")}: {DEMO_ACCOUNT.password}
                </p>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className={`${styles.btnAccent} mt-3 w-full`}
                >
                  {t("auth.useDemo")}
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-primary/10 pt-5 text-center text-sm text-primary/60">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="font-semibold text-primary hover:text-accent">
                {t("auth.registerFree")}
              </Link>
            </div>

            <div className="mt-3 text-center">
              <Link href="/free-trial" className="text-xs font-semibold text-primary/50 hover:text-accent">
                {t("auth.noAccountHint")}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
