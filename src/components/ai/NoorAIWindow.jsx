"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, Send, Sparkles, X, Minus } from "lucide-react";

import MessageBubble from "./MessageBubble";
import QuickActions from "./QuickActions";
import TypingIndicator from "./TypingIndicator";
import { getAIResponse, WELCOME_MESSAGE } from "../../data/noorAI";
import { aiWindowVariants } from "../../lib/animations";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const TYPING_MIN = 700;
const TYPING_MAX = 1200;

export default function NoorAIWindow({ onClose, onMinimize }) {
  const [messages, setMessages] = useState(() => [
    {
      id: uid(),
      role: "ai",
      text: WELCOME_MESSAGE,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const sendMessage = (raw) => {
    const text = (raw || "").trim();
    if (!text || typing) return;

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", text, time: new Date() },
    ]);
    setInput("");
    setTyping(true);

    const delay = TYPING_MIN + Math.random() * (TYPING_MAX - TYPING_MIN);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "ai", text: getAIResponse(text), time: new Date() },
      ]);
      setTyping(false);
    }, delay);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const showQuickActions = messages.length <= 1;

  return (
    <motion.section
      variants={aiWindowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-label="Noor AI assistant chat"
      className="fixed inset-x-0 bottom-0 z-50 flex h-[92dvh] max-h-[100dvh] flex-col overflow-hidden rounded-t-3xl border border-accent/30 bg-background/85 shadow-[0_20px_70px_-20px_rgba(27,67,50,0.55)] backdrop-blur-2xl md:inset-x-auto md:end-4 md:bottom-28 md:h-[650px] md:max-h-[calc(100dvh-8rem)] md:w-[420px] md:rounded-3xl"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-primary/10 bg-white/70 px-4 py-3 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-md">
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            <span
              className="absolute -end-0.5 -top-0.5 flex h-3 w-3"
              aria-hidden="true"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-2 ring-white" />
            </span>
          </span>
          <div className="min-w-0">
            <p className="font-hind-siliguri truncate text-base font-bold text-primary">
              Noor AI
            </p>
            <p className="truncate text-xs text-primary/55">
              Your Quran Learning Assistant
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimize Noor AI"
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 transition hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Noor AI"
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary/60 transition hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              text={message.text}
              time={message.time}
            />
          ))}
        </AnimatePresence>

        {typing && <TypingIndicator />}

        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      <AnimatePresence>
        {showQuickActions && !typing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-primary/10 bg-white/50 px-4 py-3 backdrop-blur-md"
          >
            <QuickActions onSelect={sendMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2 border-t border-primary/10 bg-white/70 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <button
          type="button"
          disabled
          aria-label="Attach file (coming soon)"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary/25 transition focus-visible:outline-none"
        >
          <Paperclip className="h-5 w-5" aria-hidden="true" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything…"
          aria-label="Type your message"
          className="h-11 min-w-0 flex-1 rounded-full border border-primary/15 bg-background px-4 text-base text-primary outline-none transition placeholder:text-primary/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
        />

        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-md transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </motion.section>
  );
}
