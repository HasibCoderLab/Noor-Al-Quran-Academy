"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { auth } from "../../lib/auth";
import { errorMessage } from "../../lib/apiError";

function Spinner() {
  return (
    <span
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
      aria-hidden="true"
    />
  );
}

function VerifyEmailContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [status, setStatus] = useState(
    token && emailParam ? "verifying" : "form"
  );
  const [email, setEmail] = useState(emailParam);
  const [sending, setSending] = useState(false);
  const [resent, setResent] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || !emailParam || attempted.current) return;
    attempted.current = true;

    let active = true;
    auth.verifyEmail({ token, email: emailParam }).then((result) => {
      if (!active) return;
      setStatus(result.ok ? "success" : "failed");
    });
    return () => {
      active = false;
    };
  }, [token, emailParam]);

  const handleResend = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error(t("validation.emailRequired"));
      return;
    }
    setSending(true);
    try {
      const result = await auth.resendVerification({ email: email.trim() });
      if (result.ok) {
        setResent(true);
        toast.success(t("auth.checkEmailResent"));
      } else {
        toast.error(errorMessage(t, result, "auth.registerFailed"));
      }
    } finally {
      setSending(false);
    }
  };

  const card = (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-primary/10">
      {status === "verifying" && (
        <>
          <div className="flex justify-center">
            <Spinner />
          </div>
          <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
            {t("auth.checkEmailTitle")}
          </h1>
          <p className="mt-2 text-sm text-primary/60">
            {t("auth.checkEmailSent", { email: emailParam })}
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <span className="text-3xl leading-none">✅</span>
          <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
            {t("auth.verifiedTitle")}
          </h1>
          <p className="mt-2 text-sm text-primary/60">{t("auth.verifiedBody")}</p>
          <Link href="/login" className={`${styles.btnPrimary} mt-6 inline-flex w-full`}>
            {t("auth.login")}
          </Link>
        </>
      )}

      {status === "failed" && (
        <>
          <span className="text-3xl leading-none">⚠️</span>
          <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
            {t("auth.verifyFailedTitle")}
          </h1>
          <p className="mt-2 text-sm text-primary/60">
            {t("auth.verifyFailedBody")}
          </p>
          <form onSubmit={handleResend} className="mt-6 flex flex-col gap-4 text-start">
            <label htmlFor="email" className="text-sm font-semibold text-primary">
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
            <button
              type="submit"
              disabled={sending}
              className={`${styles.btnPrimary} w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {sending ? t("auth.sending") : t("auth.verifyResend")}
            </button>
          </form>
          {resent && (
            <p className="mt-3 text-xs font-semibold text-emerald-600">
              {t("auth.checkEmailResent")}
            </p>
          )}
          <div className="mt-5 border-t border-primary/10 pt-4 text-sm text-primary/60">
            <Link href="/login" className="font-semibold text-primary hover:text-accent">
              {t("auth.forgotBackToLogin")}
            </Link>
          </div>
        </>
      )}

      {status === "form" && (
        <>
          <span className="text-3xl leading-none">📧</span>
          <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
            {t("auth.verifyMissingTitle")}
          </h1>
          <p className="mt-2 text-sm text-primary/60">
            {t("auth.verifyMissingBody")}
          </p>
          <form onSubmit={handleResend} className="mt-6 flex flex-col gap-4 text-start">
            <label htmlFor="email" className="text-sm font-semibold text-primary">
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
            <button
              type="submit"
              disabled={sending}
              className={`${styles.btnPrimary} w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {sending ? t("auth.sending") : t("auth.sendLink")}
            </button>
          </form>
          {resent && (
            <p className="mt-3 text-xs font-semibold text-emerald-600">
              {t("auth.checkEmailResent")}
            </p>
          )}
          <div className="mt-5 border-t border-primary/10 pt-4 text-sm text-primary/60">
            <Link href="/login" className="font-semibold text-primary hover:text-accent">
              {t("auth.forgotBackToLogin")}
            </Link>
          </div>
        </>
      )}
    </div>
  );

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
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="text-3xl leading-none">🌙</span>
            <p className="font-hind-siliguri mt-2 text-sm font-semibold text-primary/60">
              {SITE.name}
            </p>
          </div>
          {card}
        </div>
      </motion.div>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
