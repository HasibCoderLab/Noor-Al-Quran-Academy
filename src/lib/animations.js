// All framer-motion variants live in this single file.
// Performance rule: animate transform + opacity ONLY — never layout props.

// Navbar: slides up (hidden) on scroll down, slides back (visible) on scroll up.
export const navbarVariants = {
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  hidden: {
    y: -80,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// Mobile menu: expands from the top of the screen / collapses away.
export const mobileMenuVariants = {
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

// Slide in from the left (desktop nav links, images on the left column).
export const slideFromLeft = {
  hidden: {
    x: -60,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    x: -60,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// Slide in from the right (images / cards on the right column).
export const slideFromRight = {
  hidden: {
    x: 60,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    x: 60,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// Slide up from the bottom — default entrance for sections on scroll down.
export const slideFromBottom = {
  hidden: {
    y: 60,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    x: 60,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// Parent container: staggers its children (see staggerItem) when visible.
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Child of staggerContainer: each item fades and slides up one by one.
export const staggerItem = {
  hidden: {
    y: 30,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Simple fade only — for backgrounds, overlays, subtle elements.
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Fade + slight scale — for hero badges, featured cards, pop-in elements.
export const scaleFade = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Hover: gentle scale up for cards and imagery.
export const hoverScale = {
  whileHover: {
    scale: 1.03,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

// Hover: lift card upward with a soft shadow feel (transform only).
export const hoverLift = {
  whileHover: {
    y: -6,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};
