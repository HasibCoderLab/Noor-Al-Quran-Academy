"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import SectionWrapper from "../ui/SectionWrapper";
import { useInView } from "../../hooks/useInView";
import { SITE, STATS } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromLeft, slideFromRight } from "../../lib/animations";

const highlights = [
  { key: "0" },
  { key: "1" },
  { key: "2" },
  { key: "3" },
];

export default function About() {
  const { t } = useTranslation();
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
          <span className={styles.badgeGreen}>
            {t("landing.about.badge")}
          </span>
          <h2 className={`${styles.sectionTitle} mt-4`}>
            {t("landing.about.title", { teacher: SITE.teacher })}
          </h2>
          <div className={styles.goldDivider} />
          <p className="mt-4 leading-relaxed text-primary/75">
            {t("landing.about.bio", {
              teacher: SITE.teacher,
              title: SITE.teacherTitle,
              year: SITE.hafizYear,
              location: SITE.location,
              countries: SITE.targetCountries.join(", "),
            })}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.key} className={styles.card}>
                <h3 className="text-sm font-bold text-primary">
                  {t(`landing.about.highlights.${item.key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-primary/65">
                  {t(`landing.about.highlights.${item.key}.text`)}
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
              {t("landing.about.verseTranslation")}
            </p>
            <p className="relative z-10 mt-1 text-xs font-medium text-accent">
              {t("landing.about.verseRef")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat, index) => (
              <div key={stat.label} className={styles.card}>
                <p className="font-hind-siliguri text-3xl font-bold text-accent">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-primary/70">
                  {t(`landing.stats.${index}.label`)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
