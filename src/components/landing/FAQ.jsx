"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import SectionWrapper from "../ui/SectionWrapper";
import { FAQS } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <SectionWrapper id="faq" direction="bottom">
      <div className={styles.sectionHeader}>
        <span className={styles.badgeGold}>{t("landing.faq.badge")}</span>
        <h2 className={`${styles.sectionTitle} mt-4`}>
          {t("landing.faq.title")}
        </h2>
        <div className={styles.goldDivider} />
        <p className={styles.sectionSub}>{t("landing.faq.sub")}</p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-xl bg-white ring-1 transition ${
                  isOpen ? "ring-accent/40 shadow-sm" : "ring-primary/10"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                >
                  <span className="font-hind-siliguri text-sm font-bold text-primary sm:text-base">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none ${
                      isOpen ? "bg-accent text-primary" : "bg-secondary text-primary"
                    }`}
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-primary/70">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
