"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { styles } from "../../../styles/commonStyles";
import { slideFromBottom } from "../../../lib/animations";

export default function PaymentCancelledPage() {
  const { t } = useTranslation();

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
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl text-primary/60"
            aria-hidden="true"
          >
            ✕
          </div>

          <h1 className="mt-6 font-hind-siliguri text-2xl font-bold text-primary sm:text-3xl">
            {t("payment.cancelled.title")}
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-primary/70">
            {t("payment.cancelled.body")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/#pricing" className={styles.btnAccent}>
              {t("payment.cancelled.retry")}
            </Link>
            <Link href="/" className={styles.btnPrimary}>
              {t("payment.success.home")}
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
