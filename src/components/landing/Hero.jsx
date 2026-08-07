"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { SITE, STATS } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromLeft, slideFromRight, scaleFade } from "../../lib/animations";

const flags = [
  { code: "🇮🇹", label: "Italy" },
  { code: "🇺🇸", label: "USA" },
  { code: "🇬🇧", label: "UK" },
  { code: "🇸🇦", label: "Saudi Arabia" },
  { code: "🇧🇩", label: "Bangladesh" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-secondary via-background to-background pt-24 pb-20 lg:pt-28">
      <div className="pattern-overlay" aria-hidden="true" />

      <div
        className={`${styles.container} relative z-10 grid items-center gap-12 lg:grid-cols-2`}
      >
        {/* Left column */}
        <motion.div
          variants={slideFromLeft}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start"
        >
          <motion.span
            variants={scaleFade}
            dir="rtl"
            className={`${styles.badgeGold} font-amiri text-base`}
          >
            ﴾ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ﴿
          </motion.span>
          <p className="mt-1.5 text-xs font-medium text-primary/50">
            Surah Al-Qamar · 54:17
          </p>

          <h1 className="font-hind-siliguri mt-5 text-4xl font-extrabold leading-tight text-primary sm:text-5xl lg:text-6xl">
            Learn the <span className={styles.gradientText}>Holy Quran</span> with
            a Certified{" "}
            <span className="relative inline-block">
              Hafiz
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 h-1.5 w-full origin-left rounded-full bg-accent"
              />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-primary/70 sm:text-lg">
            One-to-one online Tajweed, Hifz, Nazra and Masnoon Dua classes with{" "}
            {SITE.teacher} ({SITE.teacherTitle}).
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/free-trial" className={`${styles.btnAccent} w-full sm:w-auto`}>
              Book Free Trial
            </Link>
            <Link href="/#courses" className={`${styles.btnOutline} w-full sm:w-auto`}>
              View Courses →
            </Link>
          </div>

          {/* Country flag pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {flags.map((flag) => (
              <span
                key={flag.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-primary/10"
              >
                <span>{flag.code}</span>
                {flag.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right column: teacher card */}
        <motion.div
          variants={slideFromRight}
          initial="hidden"
          animate="visible"
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-2xl">
            <div className="pattern-overlay" aria-hidden="true" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Avatar with live dot */}
              <div className="relative">
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-3xl font-bold text-primary">
                  HH
                </span>
                <span className="absolute bottom-1 right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
              </div>

              <h3 className="font-hind-siliguri mt-4 text-xl font-bold text-white">
                {SITE.teacher}
              </h3>
              <p className="text-sm text-white/70">
                {SITE.teacherTitle} · {SITE.location}
              </p>

              <div
                className="mt-3 flex gap-0.5 text-accent"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              {/* Stats grid */}
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm"
                  >
                    <p className="font-hind-siliguri text-xl font-bold text-accent">
                      {stat.value}
                    </p>
                    <p className="text-xs text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -start-4 top-8 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-lg ring-1 ring-primary/10"
          >
            <span className="text-accent">✓</span> Free Trial Available
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll arrow */}
      <motion.button
        aria-label="Scroll down"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-2xl text-primary/50"
      >
        ↓
      </motion.button>
    </section>
  );
}
