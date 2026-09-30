<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## EMAIL VERIFICATION (TEMPORARY FLAG)

Source of truth: `emailVerificationRequired()` in `src/lib/config.js`
Env var: `EMAIL_VERIFICATION_REQUIRED` (server-side only, never exposed to the browser)

  true / yes / on / 1  → registration requires a confirmed address again
  unset / false / no / off / 0 / anything else → verification not required (current state)

Why: the mail provider cannot send to arbitrary addresses until the sending
domain is verified, so new students were being locked out of login.

Current behaviour while disabled:
  - /api/auth/login no longer returns 403 EMAIL_NOT_VERIFIED (branch kept, flag-gated)
  - /api/auth/register returns `requiresVerification: false` and skips the
    verification token + email, so no account is created in an unverified state
  - /verify-email, /api/auth/verify-email, /api/auth/resend-verification, the
    centralized mailer, the email templates and the token hashing/expiry are
    all untouched and still reachable

To re-enable: verify the sending domain in the mail provider, then set
`EMAIL_VERIFICATION_REQUIRED=true` in the deployment env. Nothing else changes.
`pnpm doctor` and `/api/health` report the flag state and warn when it is off.

## I18N (Language System)

Library: react-i18next
Languages: EN (default) | বাংলা (BN) | عربي (AR)
Arabic = RTL (dir="rtl" on html element)
All text via t('key') — future phase
For now: language switcher UI ready, EN content from siteData.js

Language switcher location: Navbar (desktop: right side before CTA, mobile: menu bottom)

Flags + labels:
  EN → 🇬🇧 EN
  BN → 🇧🇩 BN  
  AR → 🇸🇦 AR

State: localStorage key 'lang', default 'en'
AR selected → document.dir = 'rtl'
Others → document.dir = 'ltr'

## DATABASE MODELS (Mongoose — src/models/)

### User.js
- name: String, required, trim
- email: String, required, unique, lowercase, trim
- password: String, select:false, pre-save bcrypt 12 rounds, comparePassword() instance method
- country: String
- whatsapp: String
- role: String, enum ['student', 'teacher', 'admin'], default 'student'
- timestamps: true

### Booking.js
- user: ObjectId, ref 'User' (optional — guest booking allowed)
- type: String, enum ['free-trial', 'class', 'subscription']
- contact fields: name, email, phone (for guest/free-trial)
- course: String, enum ['tajweed', 'hifz', 'nazra', 'dua']
- day: String
- time: String
- duration: Number, enum [30, 45, 60]
- message: String
- status: String, enum ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'], default 'pending'
- Index: { email: 1 }, { user: 1 }
- timestamps: true

### Availability.js
- day: String (e.g. "Saturday")
- time: String (e.g. "09:00")
- duration: Number, enum [30, 45, 60]
- status: String, enum ['available', 'booked'], default 'available'
- booking: ObjectId, ref 'Booking' (optional)
- timestamps: true

### Progress.js
- user: ObjectId, ref 'User', required
- course: String, enum ['tajweed', 'hifz', 'nazra', 'dua']
- Unique index: { user: 1, course: 1 }
- status: String, enum ['not-started', 'in-progress', 'completed'], default 'not-started'
- lessonsCompleted: Number, default 0
- totalLessons: Number, default 0
- lastAssessment: Date
- notes: String
- timestamps: true

### Review.js
- user: ObjectId, ref 'User' (optional)
- name: String, required
- country: String
- text: String, required, minLength 10, maxLength 500
- rating: Number, required, min 1, max 5
- status: String, enum ['pending', 'approved', 'rejected'], default 'pending'
- timestamps: true

### Pattern (all models use):
mongoose.models.ModelName || mongoose.model('ModelName', schema)