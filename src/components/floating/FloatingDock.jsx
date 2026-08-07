"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, MessageCircle } from "lucide-react";

import NoorAIWindow from "../ai/NoorAIWindow";
import { SITE } from "../../data/siteData";
import { fabStackContainer, fabStackItem } from "../../lib/animations";

const WhatsAppIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

export default function FloatingDock() {
  const [expanded, setExpanded] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const collapse = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setExpanded(false);
        setAiOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openAI = () => {
    setAiOpen(true);
    setExpanded(false);
  };

  const handleFabClick = () => {
    if (aiOpen) {
      setAiOpen(false);
      return;
    }
    if (expanded) {
      openAI();
      return;
    }
    setExpanded(true);
  };

  const linkPills = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
          <WhatsAppIcon className="h-4 w-4" />
        </span>
      ),
      href: SITE.whatsapp,
      // TODO:
      // Replace SITE.whatsapp with the real academy WhatsApp number
      // (use the "wa.me/<real number>" format without spaces).
    },
    {
      id: "messenger",
      label: "Messenger",
      icon: (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-sm">
          <MessageCircle className="h-4 w-4 fill-current" aria-hidden="true" />
        </span>
      ),
      href: "https://m.me/nooralquranacademy",
      // TODO:
      // Connect the academy's Messenger profile URL once the page is live.
    },
  ];

  const pillClasses =
    "inline-flex h-11 min-w-0 items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 text-sm font-bold text-primary shadow-[0_8px_30px_-8px_rgba(27,67,50,0.35)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-8px_rgba(27,67,50,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <>
      <AnimatePresence>
        {aiOpen && (
          <NoorAIWindow
            onClose={() => setAiOpen(false)}
            onMinimize={() => setAiOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating dock — fixed bottom-right, safe-area aware */}
      <div className="fixed end-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {expanded && !aiOpen && (
            <motion.div
              key="dock"
              variants={fabStackContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-end gap-2.5"
            >
              {linkPills.map((pill) => (
                <motion.div key={pill.id} variants={fabStackItem}>
                  <a
                    href={pill.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setExpanded(false)}
                    aria-label={`Open ${pill.label}`}
                    className={pillClasses}
                  >
                    {pill.icon}
                    <span>{pill.label}</span>
                  </a>
                </motion.div>
              ))}

              <motion.div key="ai" variants={fabStackItem}>
                <button
                  type="button"
                  onClick={openAI}
                  aria-label="Open Noor AI assistant"
                  className={pillClasses}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_22%,#3d7a5f_0%,var(--color-primary)_56%,var(--color-accent)_165%)] text-white shadow-sm">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>Noor AI</span>
                </button>
              </motion.div>

              <motion.div
                key="divider"
                variants={fabStackItem}
                aria-hidden="true"
                className="flex w-full items-center justify-center py-0.5"
              >
                <span className="h-px w-10 bg-primary/20" />
              </motion.div>

              <motion.div key="close" variants={fabStackItem}>
                <button
                  type="button"
                  onClick={collapse}
                  aria-label="Close menu"
                  className={`${pillClasses} bg-white/70 text-primary/60`}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span>Close</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Noor AI button */}
        <motion.button
          whileHover={{ scale: 1.06, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFabClick}
          aria-label={aiOpen ? "Close Noor AI" : expanded ? "Open Noor AI assistant" : "Open assistant menu"}
          aria-expanded={expanded || aiOpen}
          className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_22%,#3d7a5f_0%,var(--color-primary)_56%,var(--color-accent)_165%)] text-white shadow-[0_16px_48px_-12px_rgba(27,67,50,0.75)] ring-1 ring-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:h-16 md:w-16 lg:h-[68px] lg:w-[68px]"
        >
          {/* Glass highlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-transparent to-transparent"
          />
          {/* Soft golden glow pulse */}
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.24, 1], opacity: [0.45, 0, 0.45] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-accent/40 blur-[3px]"
          />
          {/* Sparkle */}
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            {aiOpen ? (
              <X className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
            ) : (
              <Sparkles className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
            )}
          </motion.span>
        </motion.button>
      </div>
    </>
  );
}
