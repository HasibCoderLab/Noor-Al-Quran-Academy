"use client";

import { motion } from "framer-motion";

import SectionWrapper from "../ui/SectionWrapper";
import { useInView } from "../../hooks/useInView";
import { SITE, STATS } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromLeft, slideFromRight } from "../../lib/animations";

const highlights = [
  {
    title: "Hafiz ul Quran (2022)",
    text: "Memorized and certified with proper Tajweed.",
  },
  {
    title: "One-to-One Classes",
    text: "Fully personalized attention, no group mixing.",
  },
  {
    title: "Flexible Scheduling",
    text: "Daily slots designed around your timezone.",
  },
  {
    title: "Progress Tracking",
    text: "Regular assessments to keep you on track.",
  },
];

export default function About() {
  const left = useInView();
  const right = useInView();

  return (
    <SectionWrapper id="about" bg="alt" direction="bottom">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: teacher bio */}
        <motion.div
          ref={left.ref}
          variants={slideFromLeft}
          initial="hidden"
          animate={left.inView ? "visible" : "hidden"}
        >
          <span className={styles.badgeGreen}>About Your Teacher</span>
          <h2 className={`${styles.sectionTitle} mt-4`}>Meet {SITE.teacher}</h2>
          <div className={styles.goldDivider} />
          <p className="mt-4 leading-relaxed text-primary/75">
            {SITE.teacher} is a {SITE.teacherTitle} ({SITE.hafizYear}) from {SITE.location}.
            With years of experience teaching students across {SITE.targetCountries.join(", ")},
            he combines classical Tajweed mastery with a warm, patient teaching style that
            works for both children and adults.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.title} className={styles.card}>
                <h3 className="text-sm font-bold text-primary">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-primary/65">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: verse + stats */}
        <motion.div
          ref={right.ref}
          variants={slideFromRight}
          initial="hidden"
          animate={right.inView ? "visible" : "hidden"}
          className="flex flex-col justify-center gap-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-center">
            <div className="pattern-overlay" aria-hidden="true" />
            <p dir="rtl" className="font-amiri relative z-10 text-3xl leading-relaxed text-white">
              وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
            </p>
            <p className="relative z-10 mt-4 text-sm italic text-white/70">
              &ldquo;And recite the Quran with measured recitation.&rdquo;
            </p>
            <p className="relative z-10 mt-1 text-xs font-medium text-accent">
              Surah Al-Muzzammil (73:4)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className={styles.card}>
                <p className="font-hind-siliguri text-3xl font-bold text-accent">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-primary/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
