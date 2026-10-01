# Noor Al Quran Academy

A full-stack online Quran learning platform built with Next.js, MongoDB, and Stripe. Students can browse courses, book free trials, manage their learning progress, and interact with an AI-powered assistant.

## Tech Stack

- **Framework:** Next.js 15.5.22 (App Router)
- **UI:** React 19.2.8, Tailwind CSS v4, Framer Motion
- **Database:** MongoDB via Mongoose 9.9.1
- **Auth:** JWT (httpOnly cookies), bcryptjs (12 rounds)
- **Payments:** Stripe 22.4.0
- **Email:** Nodemailer 9.0.4
- **AI:** Groq API (Noor AI assistant)
- **i18n:** react-i18next (EN, BN, AR with RTL support)
- **Testing:** Vitest 5.0.2 with mongodb-memory-server
- **Package Manager:** pnpm 11.8.0

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- MongoDB (local or Atlas)

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |

Optional variables:

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key for AI assistant |
| `GROQ_MODEL` | AI model (default: `qwen/qwen3.8-27b`) |
| `NEXT_PUBLIC_SITE_URL` | Base URL for email links |
| `EMAIL_VERIFICATION_REQUIRED` | Set to `true` to enable email verification |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp contact link |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email address |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From header address |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

```bash
pnpm build          # Production build
pnpm start          # Start production server
pnpm lint           # Run ESLint
pnpm test           # Run tests
pnpm doctor         # Check configuration health
pnpm db:seed        # Seed the database
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.js           # Root layout
│   ├── page.js             # Landing page
│   ├── globals.css         # Global styles
│   ├── login/              # Auth pages
│   ├── register/
│   ├── verify-email/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── free-trial/         # Free trial booking
│   ├── dashboard/          # Student dashboard
│   ├── admin/              # Admin panel
│   ├── profile/            # User profile
│   ├── payment/            # Stripe success/cancelled
│   ├── terms/              # Legal pages
│   ├── privacy-policy/
│   ├── refund-policy/
│   └── api/                # 30+ API route handlers
├── components/             # React components
│   ├── admin/              # Admin management UIs
│   ├── ai/                 # Noor AI chatbot
│   ├── auth/               # Password input/strength
│   ├── floating/           # FloatingDock FAB
│   ├── landing/            # Hero, Courses, About, Pricing, Testimonials, FAQ
│   ├── layout/             # Navbar, Footer, AccountMenu
│   ├── profile/            # ChangePasswordForm
│   ├── providers/          # I18nProvider
│   └── ui/                 # Toaster, SectionWrapper, Avatar
├── data/
│   ├── siteData.js         # Single source of truth for site content
│   └── noorAI.js           # Local AI knowledge base
├── hooks/                  # Custom React hooks
├── lib/                    # Utility modules (19 files)
│   ├── config.js           # Environment validation, feature flags
│   ├── db.js               # MongoDB connection with caching
│   ├── auth.js             # Client-side API helper
│   ├── jwt.js              # JWT token creation/verification
│   ├── mailer.js           # Centralized email sending
│   ├── stripe.js           # Stripe API client
│   ├── i18n.js             # i18next configuration
│   └── ...
├── locales/                # i18n translations (en, bn, ar)
├── models/                 # Mongoose models
│   ├── User.js
│   ├── Booking.js
│   ├── Availability.js
│   ├── Progress.js
│   ├── Review.js
│   └── Order.js
└── styles/
    └── commonStyles.js
tests/                      # Test files (11 files)
scripts/
├── doctor.js               # Configuration health check
└── seed.js                 # Database seeder
```

## Features

- **Authentication:** Register, login, logout, email verification, password reset
- **Booking System:** Free trial booking with availability management
- **Student Dashboard:** Track progress, view bookings, manage profile
- **Admin Panel:** Manage students, bookings, availability, reviews, and orders
- **Payments:** Stripe checkout integration
- **AI Assistant:** Noor AI chatbot powered by Groq API
- **Internationalization:** English, Bengali, Arabic (with RTL)
- **PWA:** Installable with app icons
- **Responsive:** Mobile-first design

## API Routes

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `POST /api/auth/logout` — Sign out
- `GET /api/auth/me` — Get current user
- `PATCH /api/auth/profile` — Update profile
- `POST /api/auth/change-password` — Change password
- `POST /api/auth/verify-email` — Verify email
- `POST /api/auth/resend-verification` — Resend verification email
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password

### Bookings & Availability
- `GET/POST /api/bookings` — List/create bookings
- `GET /api/availability` — Get available slots

### Progress & Reviews
- `GET/POST /api/progress` — Track learning progress
- `GET/POST /api/reviews` — Submit/list reviews
- `GET /api/reviews/mine` — Get own reviews

### Payments
- `POST /api/payments/checkout` — Create Stripe checkout session
- `POST /api/payments/webhook` — Stripe webhook handler
- `GET /api/payments/status` — Check payment status
- `GET /api/payments` — List payments

### Admin
- `GET /api/admin/overview` — Dashboard stats
- `GET /api/admin/students` — List students
- `GET /api/admin/orders` — List orders
- `GET /api/admin/progress` — View student progress
- `GET/POST /api/admin/reviews` — Manage reviews
- `PATCH /api/admin/reviews/[id]` — Approve/reject review
- `GET/POST /api/admin/bookings` — Manage bookings
- `PATCH /api/admin/bookings/[id]` — Update booking status
- `GET/POST /api/admin/availability` — Manage availability
- `PATCH /api/admin/availability/[id]` — Update slot
- `POST /api/admin/availability/generate` — Generate slots

### Other
- `POST /api/ai` — Noor AI chat endpoint
- `GET /api/health` — Health check

## Database Models

| Model | Key Fields |
|-------|------------|
| **User** | name, email, password, country, whatsapp, role, emailVerified |
| **Booking** | user, type, course, date, day, time, duration, status |
| **Availability** | day, time, duration, status, booking |
| **Progress** | user, course, status, lessonsCompleted, totalLessons |
| **Review** | user, name, country, course, text, rating, status |
| **Order** | Stripe order data |

## Testing

```bash
pnpm test
```

Tests cover:
- Configuration and environment validation
- Database models (CRUD, validation, hashing)
- Email sending and SMTP configuration
- i18n locale parity
- API error handling
- Token hashing/verification
- Data serialization
- Scheduling logic
- Rate limiting
- Pricing calculations
- Email verification flow

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
docker build -t noor-al-quran-academy .
docker run -p 3000:3000 --env-file .env.local noor-al-quran-academy
```

## License

Private — All rights reserved.
