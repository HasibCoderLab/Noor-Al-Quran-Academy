"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { auth } from "../../lib/auth";
import { errorMessage } from "../../lib/apiError";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error(t("validation.emailRequired"));
      return;
    }

    setSending(true);
    try {
      const result = await auth.forgotPassword({ email: email.trim() });
      if (result.ok) {
        setSent(true);
        setDevUrl(result.devResetUrl || "");
      } else {
        toast.error(errorMessage(t, result, "auth.registerFailed"));
      }
    } finally {
      setSending(false);
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
                {t("auth.forgotTitle")}
              </h1>
              <p className="mt-1 text-sm text-primary/60">
                {sent ? t("auth.forgotSent") : t("auth.forgotSubtitle")}
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-primary"
                  >
                    {t("common.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className={`${styles.btnPrimary} w-full disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {sending ? t("auth.sending") : t("auth.forgotSubmit")}
                </button>
              </form>
            ) : (
              <div className="mt-8 text-center">
                <span className="text-3xl leading-none">📬</span>
                {devUrl && (
                  <div className="mt-4 rounded-xl border border-dashed border-accent/50 bg-accent/5 p-4 text-start">
                    <p className="text-xs font-bold uppercase tracking-wider text-accent">
                      Dev only — SMTP not configured
                    </p>
                    <a
                      href={devUrl}
                      className="mt-1 block break-all text-xs font-semibold text-primary underline hover:text-accent"
                    >
                      {devUrl}
                    </a>
                  </div>
                )}
                <Link
                  href="/login"
                  className={`${styles.btnOutline} mt-6 inline-flex w-full`}
                >
                  {t("auth.forgotBackToLogin")}
                </Link>
              </div>
            )}

            <div className="mt-6 border-t border-primary/10 pt-5 text-center text-sm text-primary/60">
              <Link
                href="/register"
                className="font-semibold text-primary hover:text-accent"
              >
                {t("auth.registerFree")}
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-primary/40">{SITE.shortName}</p>
        </div>
      </motion.div>
    </section>
  );
}
