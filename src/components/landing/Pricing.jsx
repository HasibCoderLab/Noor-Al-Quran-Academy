"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import SectionWrapper from "../ui/SectionWrapper";
import { PRICING } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { fadeIn } from "../../lib/animations";

export default function Pricing() {
  const [region, setRegion] = useState("intl");

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setRegion(timezone === "Asia/Dhaka" ? "bd" : "intl");
  }, []);

  const data = PRICING[region];
  const isBD = region === "bd";

  return (
    <SectionWrapper id="pricing" direction="bottom">
      <div className={styles.sectionHeader}>
        <span className={styles.badgeGold}>Pricing</span>
        <h2 className={`${styles.sectionTitle} mt-4`}>Simple, Honest Plans</h2>
        <div className={styles.goldDivider} />
        <p className={styles.sectionSub}>
          Choose your region to see prices in your currency. Every plan includes
          one-to-one online classes with your chosen subject.
        </p>
      </div>

      {/* Region toggle */}
      <div className="mt-8 flex items-center justify-center">
        <div className="inline-flex rounded-full bg-secondary p-1">
          <button
            onClick={() => setRegion("bd")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              isBD
                ? "bg-primary text-white shadow-sm"
                : "text-primary/70 hover:text-primary"
            }`}
          >
            🇧🇩 Bangladesh (BDT)
          </button>
          <button
            onClick={() => setRegion("intl")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              !isBD
                ? "bg-primary text-white shadow-sm"
                : "text-primary/70 hover:text-primary"
            }`}
          >
            🌍 International (USD)
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
            {data.plans.map((plan) => {
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
                      Most Popular
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
                    {plan.classes} classes per month
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
                      / month
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

                  <div className="mt-8 flex flex-1 items-end">
                    <Link
                      href="/free-trial"
                      className={`w-full ${
                        isPopular ? styles.btnAccent : styles.btnPrimary
                      }`}
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-6 text-center text-sm text-primary/60">
        {isBD
          ? "Payment via bKash (manual confirmation) · Free trial class included"
          : "Secure payment via Stripe (Card / Apple Pay / Google Pay) · Free trial class included"}
      </p>
    </SectionWrapper>
  );
}
