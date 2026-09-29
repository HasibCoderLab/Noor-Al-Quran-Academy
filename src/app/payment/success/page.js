"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { styles } from "../../../styles/commonStyles";
import { slideFromBottom } from "../../../lib/animations";

const POLL_LIMIT = 20;
const POLL_INTERVAL = 1500;

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const [state, setState] = useState("checking");
  const attemptsRef = useRef(0);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    if (!sessionId) {
      setState("error");
      return undefined;
    }

    let cancelled = false;
    let timer;

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/payments/status?session_id=${encodeURIComponent(sessionId)}`
        );
        if (cancelled) return;

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const status = data.order?.status;
          if (status === "paid") {
            setState("paid");
            return;
          }
          if (status === "failed" || status === "expired") {
            setState("failed");
            return;
          }
        }
      } catch {
        // transient network error — keep polling
      }

      if (cancelled) return;
      attemptsRef.current += 1;
      if (attemptsRef.current >= POLL_LIMIT) {
        setState("timeout");
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const isPaid = state === "paid";
  const isChecking = state === "checking";

  return (
    <section className="relative overflow-hidden bg-secondary pb-20 pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={slideFromBottom}
        initial="hidden"
        animate="visible"
        className={`${styles.container} relative z-10 max-w-xl text-center`}
      >
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10 sm:p-10">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
              isPaid
                ? "bg-green-100 text-green-700"
                : isChecking
                  ? "bg-secondary text-primary/60"
                  : "bg-amber-100 text-amber-700"
            }`}
            aria-hidden="true"
          >
            {isPaid ? "✓" : isChecking ? "…" : "!"}
          </div>

          <h1 className="mt-6 font-hind-siliguri text-2xl font-bold text-primary sm:text-3xl">
            {isPaid
              ? t("payment.success.title")
              : isChecking
                ? t("payment.success.pending")
                : t("payment.failed.title")}
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-primary/70">
            {isPaid
              ? t("payment.success.body")
              : state === "checking"
                ? t("payment.success.checking")
                : state === "timeout"
                  ? t("payment.success.timeout")
                  : t("payment.success.failed")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isPaid && (
              <Link href="/dashboard" className={styles.btnAccent}>
                {t("payment.success.dashboard")}
              </Link>
            )}
            <Link
              href="/"
              className={isPaid ? styles.btnPrimary : styles.btnAccent}
            >
              {t("payment.success.home")}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
