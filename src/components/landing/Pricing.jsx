"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import SectionWrapper from "../ui/SectionWrapper";
import { PRICING } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { fadeIn } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../lib/apiError";

export default function Pricing() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [region, setRegion] = useState("intl");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setRegion(timezone === "Asia/Dhaka" ? "bd" : "intl");
  }, []);

  const data = PRICING[region];
  const isBD = region === "bd";

  const startCheckout = async (planIndex) => {
    if (paying) return;
    if (!user) {
      router.push(`/login?from=${encodeURIComponent("/#pricing")}`);
      return;
    }

    setPaying(true);
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, planIndex }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        toast.error(errorMessage(t, result, "errors.generic"));
        return;
      }

      window.location.href = result.url;
    } catch {
      toast.error(t("errors.network"));
      setPaying(false);
    }
  };

  return (
    <SectionWrapper id="pricing" direction="bottom">
      <div className={styles.sectionHeader}>
        <span className={styles.badgeGold}>{t("landing.pricing.badge")}</span>
        <h2 className={`${styles.sectionTitle} mt-4`}>
          {t("landing.pricing.title")}
        </h2>
        <div className={styles.goldDivider} />
        <p className={styles.sectionSub}>{t("landing.pricing.sub")}</p>
      </div>

      {/* Region toggle */}
      <div className="mt-8 flex items-center justify-center">
        <div className="grid w-full max-w-xs grid-cols-2 gap-1 rounded-full bg-secondary p-1 sm:inline-flex sm:w-auto sm:max-w-none sm:gap-0">
          <button
            onClick={() => setRegion("bd")}
            className={`min-w-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition sm:px-5 sm:py-2 sm:text-sm ${
              isBD
                ? "bg-primary text-white shadow-sm"
                : "text-primary/70 hover:text-primary"
            }`}
          >
            🇧🇩 {t("landing.pricing.bd")}
            <span className="hidden sm:inline"> (BDT)</span>
          </button>
          <button
            onClick={() => setRegion("intl")}
            className={`min-w-0 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition sm:px-5 sm:py-2 sm:text-sm ${
              !isBD
                ? "bg-primary text-white shadow-sm"
                : "text-primary/70 hover:text-primary"
            }`}
          >
            🌍 {t("landing.pricing.intl")}
            <span className="hidden sm:inline"> (USD)</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="relative mt-10 min-h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={region}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid gap-6 md:grid-cols-3"
          >
            {data.plans.map((plan, planIndex) => {
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl p-7 ${
                    isPopular
                      ? "bg-primary text-white shadow-xl"
                      : "bg-white shadow-sm ring-1 ring-primary/10"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-primary shadow-sm">
                      {t("landing.pricing.popular")}
                    </span>
                  )}

                  <h3
                    className={`text-lg font-bold ${
                      isPopular ? "text-white" : "text-primary"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      isPopular ? "text-white/70" : "text-primary/60"
                    }`}
                  >
                    {t("landing.pricing.classesPerMonth", {
                      count: plan.classes,
                    })}
                  </p>

                  <p className="mt-6 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">{data.symbol}</span>
                    <span className="font-hind-siliguri text-5xl font-bold">
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        isPopular ? "text-white/70" : "text-primary/50"
                      }`}
                    >
                      {t("landing.pricing.perMonth")}
                    </span>
                  </p>

                  <ul className="mt-6 flex flex-col gap-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2 ${
                          isPopular ? "text-white/85" : "text-primary/70"
                        }`}
                      >
                        <span
                          className={`mt-0.5 ${
                            isPopular ? "text-accent" : "text-primary"
                          }`}
                        >
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-1 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => startCheckout(planIndex)}
                      disabled={paying}
                      className={`w-full disabled:cursor-not-allowed disabled:opacity-70 ${
                        isPopular ? styles.btnAccent : styles.btnPrimary
                      }`}
                    >
                      {paying ? t("common.redirecting") : t("landing.pricing.choose")}
                    </button>
                    <Link
                      href="/free-trial"
                      className={`text-center text-xs font-semibold hover:underline ${
                        isPopular ? "text-white/75" : "text-primary/60"
                      }`}
                    >
                      {t("landing.pricing.startFreeTrial")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-6 text-center text-sm text-primary/60">
        {t(isBD ? "landing.pricing.noteBD" : "landing.pricing.noteIntl")}
      </p>
    </SectionWrapper>
  );
}
