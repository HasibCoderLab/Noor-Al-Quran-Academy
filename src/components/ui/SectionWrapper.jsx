"use client";

import { motion } from "framer-motion";

import { useInView } from "../../hooks/useInView";
import {
  slideFromLeft,
  slideFromRight,
  slideFromBottom,
} from "../../lib/animations";
import { styles } from "../../styles/commonStyles";

const variants = {
  left: slideFromLeft,
  right: slideFromRight,
  up: slideFromBottom,
  bottom: slideFromBottom,
};

export default function SectionWrapper({
  children,
  direction = "up",
  className = "",
  id = "",
  bg = "default",
}) {
  const { ref, inView } = useInView();

  return (
    <section
      id={id}
      ref={ref}
      className={`${bg === "alt" ? styles.sectionAlt : styles.section} ${className}`}
    >
      <div className="pattern-overlay" aria-hidden="true" />
      <motion.div
        variants={variants[direction] || variants.up}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </section>
  );
}
