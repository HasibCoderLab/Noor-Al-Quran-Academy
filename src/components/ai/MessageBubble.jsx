import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { messageIn } from "../../lib/animations";

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function MessageBubble({ role, text, time }) {
  const isUser = role === "user";

  return (
    <motion.div
      variants={messageIn}
      initial="hidden"
      animate="visible"
      className={`flex w-full items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent"
          aria-hidden="true"
        >
          <Sparkles className="h-4 w-4 text-white" />
        </span>
      )}

      <div className={`flex max-w-[85%] flex-col sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`whitespace-pre-line text-sm leading-relaxed ${
            isUser
              ? "rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-white shadow-sm"
              : "rounded-2xl rounded-tl-md bg-white px-4 py-3 text-primary/85 shadow-sm ring-1 ring-primary/10"
          }`}
        >
          {text}
        </div>
        <span
          className={`mt-1 text-[10px] font-medium text-primary/40 ${
            isUser ? "text-end" : "text-start"
          }`}
        >
          {formatTime(time)}
        </span>
      </div>
    </motion.div>
  );
}
