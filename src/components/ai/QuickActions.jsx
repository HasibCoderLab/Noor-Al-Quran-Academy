import { motion } from "framer-motion";

import { QUICK_ACTIONS } from "../../data/noorAI";
import { chipIn } from "../../lib/animations";

export default function QuickActions({ onSelect }) {
  return (
    <motion.div
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
      initial="hidden"
      animate="visible"
      className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
      aria-label="Quick questions"
    >
      {QUICK_ACTIONS.map((action) => (
        <motion.button
          key={action.id}
          variants={chipIn}
          type="button"
          onClick={() => onSelect(action.message)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/15 bg-white px-3.5 py-2 text-xs font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden="true">{action.label.split(" ")[0]}</span>
          <span>{action.label.split(" ").slice(1).join(" ")}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
