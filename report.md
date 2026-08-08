# Al Quran Academy — সম্পূর্ণ ওয়েবসাইট অ্যানালাইসিস রিপোর্ট

**অ্যানালাইসিস তারিখ:** 8 August 2026
**প্রজেক্ট:** `al-quran-academy` (Next.js 15.5.22 · React 19.2.8 · Tailwind CSS v4)
**প্যাকেজ ম্যানেজার:** pnpm 11.8.0

---

## ১. প্রজেক্ট ওভারভিউ

**Noor Al-Quran Academy** — একটি আন্তর্জাতিক অনলাইন কুরআন লার্নিং অ্যাকাডেমির ওয়েবসাইট।
উস্তাদ হাসিব হাসান (হাফিজুল কুরআন, ২০২২, চাঁপাইনবাবগঞ্জ) এক-টু-ওয়ান অনলাইন ক্লাস দেন
তাজবীদ, হিফজ, নাজরা ও মাসনূন দোয়া বিষয়ে। টার্গেট দেশ: Italy, USA, UK, Saudi Arabia, Bangladesh।

---

## ২. প্রযুক্তি স্ট্যাক (Tech Stack)

| প্রযুক্তি | সংস্করণ | ব্যবহার |
|---|---|---|
| Next.js | 15.5.22 | App Router, API Route |
| React | 19.2.8 | UI |
| Tailwind CSS | v4 | Styling (CSS-first `@theme` tokens) |
| framer-motion | 13.0.0 | Animations |
| react-i18next / i18next | 17.0.11 / 26.3.6 | Multilingual (UI-ready) |
| bcryptjs | 3.0.3 | Password hashing |
| react-hot-toast | 2.6.0 | Notifications |
| lucide-react | 1.29.0 | Icons |
| mongoose | 9.9.1 | DB (ইনস্টলড কিন্তু **ব্যবহৃত হয়নি**) |
| stripe / nodemailer / jsonwebtoken / cookie | — | ইনস্টলড কিন্তু **ব্যবহৃত হয়নি** |

---

## ৩. পেজ / রাউট স্ট্রাকচার

| রুট | ফাইল | স্ট্যাটাস |
|---|---|---|
| `/` | `src/app/page.js` | ✅ সম্পূর্ণ (Hero, Courses, About, Pricing, Testimonials, FAQ) |
| `/login` | `src/app/login/page.js` | ✅ (localStorage-based) |
| `/register` | `src/app/register/page.js` | ✅ (localStorage-based) |
| `/free-trial` | `src/app/free-trial/page.js` | ✅ বুকিং ফর্ম |
| `/dashboard` | `src/app/dashboard/page.js` | ✅ স্টুডেন্ট ড্যাশবোর্ড |
| `/terms` | `src/app/terms/page.js` | ✅ ১৩টি ধারা |
| `/privacy-policy` | `src/app/privacy-policy/page.js` | ✅ ১২টি ধারা |
| `/refund-policy` | `src/app/refund-policy/page.js` | ✅ ৮টি ধারা |
| `POST /api/ai` | `src/app/api/ai/route.js` | ✅ Groq AI integration |

---

## ৪. ফিচার ইনভেন্টরি (কী কী বানানো হয়েছে)

### ✅ Landing Page
- **Hero:** গোল্ডেন কুরআন আয়াত ব্যাজ, গ্রেডিয়েন্ট টাইটেল, উস্তাদের কার্ড (HH avatar + live dot + 5★), STATS গ্রিড, দেশের ফ্ল্যাগ পিল, স্ক্রল অ্যারো অ্যানিমেশন
- **Courses:** ৪টি কোর্স (তাজবীদ, হিফজ, নাজরা, মাসনূন দোয়া) — প্রতিটিতে আরবি নাম (Amiri ফন্ট), লেভেল ব্যাজ, ডিউরেশন
- **About:** উস্তাদের বায়ো, ৪টি হাইলাইট, কুরআন আয়াত কার্ড (73:4), STATS
- **Pricing:** BD (৳) / International ($) টগল — টাইমজোন অনুযায়ী অটো-ডিটেক্ট (Asia/Dhaka → BD), ৩টি প্ল্যান, "Most Popular" ব্যাজ
- **Testimonials:** ৪টি রিভিউ, স্টার রেটিং, দেশের ফ্ল্যাগ
- **FAQ:** অ্যাকর্ডিয়ন UI

### ✅ Authentication (Frontend-only)
- Register / Login ফর্ম — bcryptjs দিয়ে পাসওয়ার্ড হ্যাশ
- Session localStorage-এ (cookie/jwt প্যাকেজ ইনস্টলড কিন্তু অ্যাটাচড নয়)
- Forgot password → শুধু "coming soon" টোস্ট
- Social login UI (Google/Facebook/Apple) → বাটন প্রেস করলে শুধু console.log / টোস্ট

### ✅ Free Trial Booking
- নাম, ইমেইল, WhatsApp, দেশ, কোর্স, সময়, ডিউরেশন (30/45/60) সিলেক্টর
- টাইম স্লট (Asia/Dhaka): Sat–Thu 08:00–20:00, Fri 20:00/21:00
- "What you get" ইনফো কার্ড
- বুকিং localStorage-এ সেভ

### ✅ Student Dashboard
- অ্যাভতার (আদ্যক্ষর), নাম/ইমেইল/দেশ, লগআউট
- ৩টি স্ট্যাট কার্ড (Classes taken, Pending trials, Course)
- Trial request লিস্ট + Next steps + Upcoming class

### ✅ Noor AI (Chatbot)
- Floating dock (Noor AI + WhatsApp + Messenger) — bottom-right, safe-area aware
- চ্যাট উইন্ডো: quick actions, typing indicator, message bubbles
- **Dual-mode:** আগে local demo response (`getAIResponse`), তারপর `/api/ai` → Groq (llama-3.3-70b-versatile) কল, সফল হলে AI রেসপন্স রিপ্লেস করে
- System prompt-এ পুরো অ্যাকাডেমির ফ্যাক্ট ইনজেক্ট করা
- Fallback: API fail করলে local demo assistant
- Escape key দিয়ে ক্লোজ, attach-file বাটন disabled ("coming soon")

### ✅ i18n / Multilingual (UI-ready)
- EN / BN / AR language switcher (Navbar desktop + mobile)
- AR সিলেক্ট করলে `<html dir="rtl">`, `.start`/`.end` logical properties ব্যবহার (RTL-ফ্রেন্ডলি)
- **যেটা সম্পূর্ণ হয়নি:** ট্রান্সলেশন অ্যাকচুয়ালি নেই — `i18n.js`-এ সব ভাষার `translation: {}` খালি, কোডে `t('key')` ব্যবহার নেই। সুইচার শুধু localStorage + dir চেঞ্জ করে, কনটেন্ট ইংরেজিই থাকে।

### ✅ Legal Pages
- Terms of Service, Privacy Policy, Refund Policy — পূর্ণাঙ্গ কনটেন্ট

### ✅ UI/UX
- Design tokens: `primary #1B4332` (emerald), `accent #D4AF37` (gold), `background #FDFBF7`, `secondary #F0F4F0`
- ফন্ট: Inter, Hind Siliguri (বাংলা), Amiri (আরবি) — `next/font/google`
- প্যাটার্ন-ওভারলে, হোভার লিফট/স্কেল, stagger animations, smooth scroll
- Responsive: mobile hamburger menu, grid breakpoints
- Accessibility: aria-label / aria-expanded ব্যাপক ব্যবহার, focus rings

---

## ৫. ফাইল স্ট্রাকচার ওভারভিউ

```
src/
├── app/
│   ├── api/ai/route.js        # Groq AI endpoint
│   ├── dashboard/page.js      # Student dashboard
│   ├── free-trial/page.js     # Booking form
│   ├── layout.js              # Root layout (fonts, metadata, Navbar/Footer)
│   ├── page.js                # Home landing
│   ├── globals.css            # Tailwind v4 theme + utilities
│   ├── login, register/
│   └── terms, privacy-policy, refund-policy/
├── components/
│   ├── ai/                    # NoorAIWindow, MessageBubble, QuickActions, TypingIndicator
│   ├── auth/                  # SocialLogin
│   ├── floating/              # FloatingDock (FAB)
│   ├── landing/               # Hero, Courses, About, Pricing, Testimonials, FAQ
│   ├── layout/                # Navbar, Footer
│   └── ui/                    # SectionWrapper, Toaster, LanguageSwitcher, SocialAuthButtons
├── data/
│   ├── siteData.js            # Single source of truth (SITE, COURSES, PRICING, FAQS…)
│   └── noorAI.js              # Local demo AI knowledge base
├── hooks/                     # useInView, useScrollDirection
├── lib/                       # auth, bookings, i18n, animations
└── styles/commonStyles.js     # Shared Tailwind class strings
```

**নোট:** কনটেন্ট ম্যানেজমেন্টে **এক-সোর্স-অফ-ট্রুথ** ডিজাইন ভালো — সব ডেটা `siteData.js`-এ, কম্পোনেন্ট ও AI system prompt দুটোই সেখান থেকে টানে।

---

## ৬. সমস্যা / গ্যাপ (Bugs & Issues)

### 🔴 Critical (সমাধান জরুরি)
1. **Auth সম্পূর্ণ insecure** — `src/lib/auth.js` ইউজার + হ্যাশড পাসওয়ার্ড **browser localStorage**-এ রাখে। XSS আক্রমণে ডেটা চুরি হতে পারে, অন্য ডিভাইসে লগইন হয় না। Privacy Policy-ও বলছে "ডেটা শুধু আপনার ডিভাইসে থাকে" — কিন্তু Terms/Pricing-এ Stripe পেমেন্টের কথা আছে, যা এখনও অ্যাকচুয়াল নয়।
2. **Dashboard ডেটা লিক বাগ** — `dashboard/page.js:42` — `bookings.getAll()` **সবাইকে** দেখায়। লগইন করা ইউজারের সাথে ফিল্টার নেই; যেকোনো ইউজার সবার trial request দেখতে পাবে।
3. **mongoose/DB সংযোগ নেই** — `MONGODB_URI` env-এ যোগ হয়েছে কিন্তু কোডে **কোথাও** mongoose ব্যবহার নেই, কোনো Model/Connection ফাইল নেই। MongoDB URL ঢোকালেই কাজ করবে না — lib মডিউল + API route লিখতে হবে।

### 🟠 Major
4. **i18n নামমাত্র** — ভাষা সুইচার শুধু dir/localStorage বদলায়, কোনো টেক্সট ট্রান্সলেট হয় না। `LanguageSwitcher.jsx` নামে আলাদা কম্পোনেন্ট আছে কিন্তু Navbar-এ ইনলাইন সুইচার ব্যবহার হচ্ছে (ডুপ্লিকেট, অপ্রয়োজনীয়)।
5. **OAuth বাস্তবায়িত নয়** — Google/Facebook/Apple বাটনগুলো `console.log` / টোস্ট ছাড়া কিছু করে না (login/register page.js-এ `handleOAuth`, SocialLogin.jsx-এ TODO)।
6. **SociaLogin ডুপ্লিকেট** — `SocialLogin.jsx` (ব্যবহৃত) আর `SocialAuthButtons.jsx` (অব্যবহৃত) — একই কাজের দুটি ফাইল।
7. **AI endpoint-এ rate limiting/প্রোটেকশন নেই** — যেকোনো ক্লায়েন্ট unlimited কল করে Groq কস্ট বাড়াতে পারে। Server-only হলেও cost risk আছে।
8. **বুকিং localStorage-এ** — সার্ভারে সেভ হয় না, ক্লাস কনফার্ম/শিডিউলিংয়ের কোনো ব্যবস্থা নেই। Free trial ফর্ম আসলে "আমরা WhatsApp-এ যোগাযোগ করব" বলে শেষ।

### 🟡 Minor
9. **Placeholder কন্টাক্ট তথ্য** — phone `+8801XXXXXXXXX`, bKash `01XXXXXXXXX`, WhatsApp `8801XXXXXXXXX`, Facebook/Messenger URL — সব placeholder। FloatingDock-এ TODO কমেন্টও আছে।
10. **Hero "Scroll down" বাটন অকার্যকর** — onClick নেই, স্ক্রল করে না।
11. **অ্যানিমেশন বাগ** — `animations.js:80` — `slideFromBottom.exit`-এ `x: 60` লেখা (উচিত `y: 60`)।
12. **Free trial ডিউরেশন ইনকনসিস্টেন্সি** — ফর্মে 30/45/60 মিনিট দেওয়া যায়, কিন্তু "What you get" কার্ড বলছে trial 30 মিনিট।
13. **Auth পেজে ফেক লোডিং** — `setTimeout(…, 400)` — আসল নেটওয়ার্ক অপারেশন নেই।
14. **কিছু পেজে metadata নেই** — login/register/free-trial/dashboard পেজে `export const metadata` নেই (শুধু layout + legal পেজে আছে)।
15. **`lang="en"` হার্ডকোডেড** — layout.js-এ `<html lang="en">` — ভাষা বদলালেও আপডেট হয় না (SEO সমস্যা)।
16. **রিয়েল ইমেজ নেই** — সব জায়গায় emoji/আদ্যক্ষর avatar/আইকন; teacher card-এ "HH" placeholder।
17. **নো টেস্ট, নো CI** — `package.json`-এ test script নেই, কোনো unit/e2e test নেই।
18. **README ডিফল্ট** — create-next-app-এর ডিফল্ট README আছে, প্রজেক্টের ডকুমেন্টেশন নেই।

---

## ৭. নিরাপত্তা নোট (Security)

- ⚠️ **`src/lib/auth.js` client-side auth** — সবচেয়ে বড় নিরাপত্তা দুর্বলতা। পাসওয়ার্ড হ্যাশ হলেও হ্যাশ localStorage-এ বসে।
- ✅ Groq API key **.env.local**-এ আছে (gitignored) — ভালো।
- ✅ AI route-এ message count limit (12) + per-message 2000 chars cap।
- ⚠️ `.env*` পুরোই gitignored — ভবিষ্যতে `.env.example` আলাদাভাবে commit নিশ্চিত করতে হবে (ইতিমধ্যে আছে)।

---

## ৮. কী কী করা হবে — নেক্সট ফেজ সুপারিশ

**ডাটাবেস ফেজ (সবচেয়ে জরুরি):**
1. `src/lib/db.js` — mongoose global connection (MONGODB_URI দিয়ে)
2. User, Booking, Class মডেল
3. Register/Login → **API route** (`/api/auth/register`, `/api/auth/login`) + httpOnly cookie / JWT
4. Booking → `/api/bookings` API + dashboard-এ শুধু নিজের booking দেখানো (ইমেইল ফিল্টার)
5. Privacy Policy-তে "localStorage" বাক্যগুলো আপডেট

**ফিচার ফেজ:**
6. OAuth (Google/Facebook/Apple) — Auth.js
7. Stripe checkout integration (package ইনস্টল করা আছে)
8. Forgot password / email verification (nodemailer)
9. আসল i18n ট্রান্সলেশন (EN/BN/AR keys)
10. AI endpoint-এ rate limit + token cost limit
11. Hero scroll-down বাটন, ডিউরেশন ইনকনসিস্টেন্সি ফিক্স

**প্রোডাকশন ফেজ:**
12. রিয়েল কন্টাক্ট নম্বর/WhatsApp/ফেসবুক বসানো
13. Image optimization (`next/image`), OG images, per-page metadata
14. Unit tests (Vitest/Jest) + basic CI
15. README আপডেট, ডকুমেন্টেশন

---

## ৯. সামারি (ভার্ডিক্ট)

সাইটটি **UI/UX ডিজাইনে চমৎকার** — ক্লিন কম্পোনেন্ট আর্কিটেকচার, কনসিস্টেন্ট ডিজাইন সিস্টেম, RTL-রেডি, রেসপন্সিভ, সুন্দর অ্যানিমেশন এবং একটি কার্যকর AI চ্যাটবট (Groq) রয়েছে। মার্কেটিং ল্যান্ডিং + ফ্রি ট্রায়াল ফ্লো + ড্যাশবোর্ড + লিগ্যাল পেজ — সম্পূর্ণ ফ্রন্টএন্ড প্রোটোটাইপ রেডি।

**মূল দুর্বলতা:** পুরো ডেটা লেয়ার এখনো client-side (localStorage)। Auth, booking, payment — কিছুই সার্ভারে নেই। mongoose/Stripe ইত্যাদি প্যাকেজ ইনস্টল করা আছে কিন্তু সংযুক্ত নয়। তাই পরবর্তী ধাপে **MongoDB-তে auth + booking সার্ভার-সাইড করা** এবং তারপর **Stripe পেমেন্ট** যুক্ত করা — এটাই সবচেয়ে বড় লজিক্যাল অগ্রাধিকার।
