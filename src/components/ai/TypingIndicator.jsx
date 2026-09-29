import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const makeDotVariants = (delay) => ({
  hidden: { y: 0, opacity: 0.4 },
  visible: {
    y: [0, -4, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    },
  },
});

export default function TypingIndicator() {
  const { t } = useTranslation();
  return (
    <div className="flex items-end gap-2" role="status" aria-label={t("ai.typing")}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent"
        aria-hidden="true"
      >
        <span className="text-sm">✨</span>
      </span>

      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-white px-4 py-3.5 shadow-sm ring-1 ring-primary/10">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            variants={makeDotVariants(dot * 0.15)}
            initial="hidden"
            animate="visible"
            className="h-2 w-2 rounded-full bg-primary/50"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
