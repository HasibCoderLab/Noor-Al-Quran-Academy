import { SITE, COURSES, PRICING, FAQS } from "./siteData";

// ============================================================
// Noor AI — demo knowledge base.
//
// Future integration points:
//   • OpenAI API  → replace getAIResponse() with a fetch to /api/ai/chat
//   • Gemini API  → same, swap the endpoint
//   • Claude API  → same
//   • Local AI    → keep getAIResponse() but feed it real data
// The UI (NoorAIWindow) only calls getAIResponse(), so swapping
// the backend never touches the interface.
// ============================================================

const bd = PRICING.bd;
const intl = PRICING.intl;
const whatsappNumber = SITE.whatsapp.replace("https://wa.me/", "");

export const QUICK_ACTIONS = [
  { id: "courses", label: "📚 Courses", message: "What courses do you offer?" },
  { id: "pricing", label: "💰 Pricing", message: "How much does it cost?" },
  { id: "trial", label: "🎓 Free Trial", message: "How can I book a free trial?" },
  { id: "teacher", label: "👨‍🏫 Teacher", message: "Tell me about the teacher" },
  { id: "schedule", label: "🕒 Schedule", message: "What are the class times?" },
  { id: "contact", label: "📞 Contact", message: "How can I contact you?" },
  { id: "languages", label: "🌍 Languages", message: "What languages do you support?" },
  { id: "faq", label: "❓ FAQ", message: "Show me the FAQ" },
];

export const WELCOME_MESSAGE = `السلام عليكم ورحمة الله وبركاته

Welcome to Noor AI.
How can I help you today?`;

export const GREETING_RESPONSE = `وعليكم السلام ورحمة الله وبركاته! 🌙

Welcome! I'm Noor AI.
Ask me about courses, pricing, the free trial, class times, our teacher, payment, or contact details.`;

export const THANKS_RESPONSE = `Wa iyyakum! 🌙 May Allah bless your learning journey.
Is there anything else I can help you with?`;

export const FALLBACK_RESPONSE = `I'm currently a demo assistant.
Our full AI knowledge system will be available soon.
Please contact us via WhatsApp for detailed information.`;

const COURSES_RESPONSE = `We offer 4 one-to-one online courses:

${COURSES.map(
  (course) => `• ${course.name} (${course.arabic}) — ${course.level}\n  ${course.description}`
).join("\n")}

Every class is one-to-one with ${SITE.teacher}, a ${SITE.teacherTitle}.`;

const PRICING_RESPONSE = `Our monthly plans are simple and honest:

🇧🇩 Bangladesh (${bd.plans[0].currency}):
${bd.plans
  .map((plan) => `• ${plan.name} — ${plan.classes} classes — ${plan.symbol}${plan.price}/mo`)
  .join("\n")}

🌍 International (${intl.plans[0].currency}):
${intl.plans
  .map((plan) => `• ${plan.name} — ${plan.classes} classes — ${plan.symbol}${plan.price}/mo`)
  .join("\n")}

Payment: bKash in Bangladesh, Stripe (Card / Apple Pay / Google Pay) internationally.
Every plan includes a free trial class.`;

const TRIAL_RESPONSE = `Yes! We offer a FREE one-to-one trial class with ${SITE.teacher}.

Book it in seconds:
1. Click "Book Free Trial" in the menu, or
2. WhatsApp us at ${whatsappNumber}

No payment needed. Duration: ${SITE.classTimes.durations.join(" / ")} minutes.`;

const TIME_RESPONSE = `Class times are in ${SITE.timezone}:

Saturday–Thursday: ${SITE.classTimes.satThu.join(", ")}
Friday: ${SITE.classTimes.friday.join(", ")}

Class durations: ${SITE.classTimes.durations.map((d) => `${d} min`).join(" / ")}`;

const TEACHER_RESPONSE = `${SITE.teacher} is a ${SITE.teacherTitle} (${SITE.hafizYear}) from ${SITE.location}.

He teaches Tajweed, Hifz, Nazra and Masnoon Duas to students across ${SITE.targetCountries.join(", ")}.`;

const LANGUAGES_RESPONSE = `The website supports 3 languages:
• 🇬🇧 English
• 🇧🇩 বাংলা (Bengali)
• 🇸🇦 العربية (Arabic)

Use the language switcher in the top menu to change. Arabic switches the layout to RTL automatically.`;

const COUNTRIES_RESPONSE = `We serve students worldwide, including ${SITE.targetCountries.join(", ")}.

Classes are fully online (Google Meet / Zoom), so you can join from anywhere in the world.`;

const PAYMENT_RESPONSE = `Payment options:

🇧🇩 Bangladesh: bKash (manual confirmation)
🌍 International: Stripe — Card, Apple Pay, Google Pay

Need help? Message us on WhatsApp: ${whatsappNumber}`;

const WHATSAPP_RESPONSE = `You can chat with us on WhatsApp: ${whatsappNumber}

It's the fastest way to get help, book a class, or ask any question.`;

const EMAIL_RESPONSE = `You can reach us by email:
${SITE.email}

We usually reply within 24 hours.`;

const CONTACT_RESPONSE = `Here's how to reach us:

📧 Email: ${SITE.email}
💬 WhatsApp: ${whatsappNumber}
🌐 Facebook: ${SITE.facebook}

Prefer a live chat? Click the WhatsApp button to talk to us right now.`;

const DASHBOARD_RESPONSE = `Your student dashboard lets you:
• Book and track free trial requests
• See your upcoming class schedule
• Manage your account and profile

Login or Register from the top menu, then visit your dashboard.`;

const CERTIFICATE_RESPONSE = `We provide structured progress tracking with regular assessments.

For details about certificates and completion after finishing a course, please message us on WhatsApp — we'll guide you personally.`;

const FAQ_RESPONSE = `Here are the most common questions:

${FAQS.slice(0, 3).map((f) => `• ${f.question}`).join("\n")}

For full details, visit the FAQ section on the homepage.`;

export const AI_KNOWLEDGE = [
  {
    keywords: ["courses", "course", "tajweed", "hifz", "nazra", "dua", "subjects", "subject", "curriculum", "learn"],
    response: COURSES_RESPONSE,
  },
  {
    keywords: ["price", "pricing", "cost", "fee", "fees", "plan", "plans", "month", "bdt", "usd", "how much", "expensive"],
    response: PRICING_RESPONSE,
  },
  {
    keywords: ["trial", "free class", "demo", "sample"],
    response: TRIAL_RESPONSE,
  },
  {
    keywords: ["time", "times", "schedule", "slot", "slots", "timing", "when", "class time"],
    response: TIME_RESPONSE,
  },
  {
    keywords: ["teacher", "teachers", "ustad", "hafiz", "instructor", "mentor", "who teaches"],
    response: TEACHER_RESPONSE,
  },
  {
    keywords: ["language", "languages", "bangla", "bengali", "arabic", "english", "translate"],
    response: LANGUAGES_RESPONSE,
  },
  {
    keywords: ["country", "countries", "italy", "usa", "uk", "saudi", "abroad", "overseas"],
    response: COUNTRIES_RESPONSE,
  },
  {
    keywords: ["pay", "payment", "payments", "bkash", "stripe", "card", "invoice", "money"],
    response: PAYMENT_RESPONSE,
  },
  {
    keywords: ["whatsapp", "wa.me", "chat"],
    response: WHATSAPP_RESPONSE,
  },
  {
    keywords: ["email", "emails", "mail", "inbox"],
    response: EMAIL_RESPONSE,
  },
  {
    keywords: ["contact", "contacts", "phone", "reach", "support"],
    response: CONTACT_RESPONSE,
  },
  {
    keywords: ["dashboard", "account", "accounts", "login", "register", "profile", "student portal"],
    response: DASHBOARD_RESPONSE,
  },
  {
    keywords: ["certificate", "certification", "ijazah", "completion", "graduate"],
    response: CERTIFICATE_RESPONSE,
  },
  {
    keywords: ["faq", "question", "questions", "common"],
    response: FAQ_RESPONSE,
  },
];

const GREETING_KEYWORDS = [
  "salam",
  "hello",
  "hi",
  "hey",
  "assalamu",
  "asalamu",
  "assalam",
  "alaikum",
  "alo",
];
const THANKS_KEYWORDS = ["thank", "thanks", "shukran", "jazak", "jazzak", "barakallah"];

const matches = (text, keywords) =>
  keywords.some((keyword) => {
    if (keyword.includes(" ")) return text.includes(keyword);
    return new RegExp(`\\b${keyword}\\b`).test(text);
  });

export function getAIResponse(input) {
  const text = (input || "").toLowerCase().trim();

  if (!text) return GREETING_RESPONSE;
  if (matches(text, GREETING_KEYWORDS)) return GREETING_RESPONSE;
  if (matches(text, THANKS_KEYWORDS)) return THANKS_RESPONSE;

  const match = AI_KNOWLEDGE.find((item) => matches(text, item.keywords));

  return match ? match.response : FALLBACK_RESPONSE;
}
