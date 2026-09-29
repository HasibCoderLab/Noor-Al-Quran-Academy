"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";

import { styles } from "../styles/commonStyles";
import { scaleFade, slideFromBottom } from "../lib/animations";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={slideFromBottom}
        initial="hidden"
        animate="visible"
        className={`${styles.container} relative z-10`}
      >
        <div className="flex flex-col items-center text-center">
          <motion.span
            variants={scaleFade}
            dir="rtl"
            className={`${styles.badgeGold} font-amiri text-lg`}
          >
            ﴾ وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ ﴿
          </motion.span>
          <p className="mt-1.5 text-xs font-medium text-primary/50">
            {t("notFound.surah")}
          </p>

          <h1
            aria-hidden="true"
            className={`font-hind-siliguri mt-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-8xl font-extrabold leading-none text-transparent sm:text-9xl`}
          >
            404
          </h1>

          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-accent">
            {t("notFound.label")}
          </p>

          <h2 className="font-hind-siliguri mt-5 text-2xl font-bold text-primary sm:text-3xl">
            {t("notFound.title")}
          </h2>

          <p className="mt-3 max-w-md text-base leading-relaxed text-primary/70">
            {t("notFound.body")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className={styles.btnAccent}>
              {t("notFound.home")}
            </Link>
            <Link href="/#courses" className={styles.btnOutline}>
              {t("notFound.courses")}
            </Link>
          </div>

          <p className="mt-10 text-xs font-medium text-primary/40">
            <Trans
              i18nKey="notFound.help"
              components={{
                strong: (
                  <strong className="font-semibold text-primary/60" />
                ),
                a: (
                  <Link
                    href="/free-trial"
                    className="font-semibold text-primary hover:text-accent"
                  />
                ),
              }}
            />
          </p>
        </div>
      </motion.div>
    </section>
  );
}
