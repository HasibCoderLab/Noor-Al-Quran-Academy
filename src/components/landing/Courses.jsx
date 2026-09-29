"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import SectionWrapper from "../ui/SectionWrapper";
import { COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { staggerContainer, staggerItem, hoverLift } from "../../lib/animations";

const icons = {
  tajweed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M2 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-7a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  hifz: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 6l.7 1.5L14.5 8l-1.8.5L12 10l-.7-1.5L9.5 8l1.8-.5z" />
    </svg>
  ),
  nazra: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  dua: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
};

export default function Courses() {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="courses" direction="bottom">
      <div className={styles.sectionHeader}>
        <span className={styles.badgeGold}>{t("landing.courses.badge")}</span>
        <h2 className={`${styles.sectionTitle} mt-4`}>
          {t("landing.courses.title")}
        </h2>
        <div className={styles.goldDivider} />
        <p className={styles.sectionSub}>{t("landing.courses.sub")}</p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {COURSES.map((course) => (
          <motion.div
            key={course.id}
            variants={staggerItem}
            {...hoverLift}
            className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-primary">
              {icons[course.id]}
            </span>

            <h3 className="font-hind-siliguri mt-5 text-lg font-bold text-primary">
              {course.name}
            </h3>
            <p dir="rtl" className="font-amiri mt-1 text-xl text-accent">
              {course.arabic}
            </p>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-primary/70">
              {course.description}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <span className={styles.badgeGreen}>{course.level}</span>
              <span className="text-xs font-medium text-primary/50">
                {course.duration}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
