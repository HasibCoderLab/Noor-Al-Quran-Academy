"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { SITE, FOOTER_LINKS, COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { staggerContainer, staggerItem } from "../../lib/animations";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary text-white">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`${styles.container} relative z-10 grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8`}
      >
        {/* Brand */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl leading-none">🌙</span>
            <div className="flex flex-col leading-tight">
              <span className="font-hind-siliguri text-lg font-bold">
                {SITE.name}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-white/60">
                Online Academy
              </span>
            </div>
          </div>

          <p dir="rtl" className="mt-4 font-amiri text-2xl text-accent">
            نور القرآن الأكاديمية
          </p>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
            {SITE.description}
          </p>

          <div className="mt-6 flex flex-col gap-2 text-sm">
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex w-fit items-center gap-2 text-white/80 transition hover:text-accent"
            >
              <span aria-hidden="true">✉</span>
              {SITE.email}
            </a>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 text-white/80 transition hover:text-accent"
            >
              <span aria-hidden="true">💬</span>
              WhatsApp
            </a>
          </div>
        </motion.div>

        {/* Courses */}
        <motion.div variants={staggerItem}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
            Courses
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {COURSES.map((course) => (
              <li key={course.id}>
                <Link
                  href="/#courses"
                  className="text-white/75 transition hover:text-accent"
                >
                  {course.name}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Quick links */}
        <motion.div variants={staggerItem}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
            Quick Links
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {FOOTER_LINKS.quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-white/75 transition hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/free-trial"
                className="text-white/75 transition hover:text-accent"
              >
                Free Trial
              </Link>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className={`${styles.container} flex flex-col items-center gap-3 py-6 text-center text-xs text-white/60 sm:flex-row sm:justify-between sm:text-left`}>
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p dir="rtl" className="font-amiri text-sm text-accent/90">
            إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ
          </p>
          <p>Made with ♥ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
