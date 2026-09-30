# Production Email Verification — Temporary Disable

**Site:** https://noor-al-quran-academy-pi.vercel.app
**Status:** Implemented, tested, not committed
**Flag:** `EMAIL_VERIFICATION_REQUIRED` (default `false` — i.e. verification NOT required)

---

## 1. Exact files changed

| File | Change |
| --- | --- |
| `src/lib/config.js` | New `emailVerificationRequired()` feature flag, `features.emailVerification` in `envReport()`, and 3 new warnings |
| `src/app/api/auth/login/route.js` | The `403 EMAIL_NOT_VERIFIED` branch is now gated on the flag (branch body untouched) |
| `src/app/api/auth/register/route.js` | `requiresVerification` derived from the flag; token/expiry/email issued only when required |
| `src/context/AuthContext.jsx` | `register` no longer writes a user into the auth context (registration creates no session) |
| `src/app/register/page.js` | Non-verification branch sends the user to `/login` instead of `/dashboard` (no session exists yet) |
| `scripts/doctor.js` | Label for the new feature-readiness row |
| `tests/config.test.js` | `EMAIL_VERIFICATION_REQUIRED` added to the env-isolation list |
| `tests/emailVerification.test.js` | **New** — 51 tests |
| `AGENTS.md` | Documentation of the flag and the re-enable procedure |
| `.env.example` | Documents `EMAIL_VERIFICATION_REQUIRED` (note: this file is gitignored in this repo, so it does not appear in the diff) |

Nothing else was touched. **No commit was made.**

---

## 2. Exact behavior changed

- **Login** no longer returns `403 EMAIL_NOT_VERIFIED`. The auth cookie is set and the existing role-based redirect (`/admin` for admins, `/dashboard` for everyone else) runs unchanged.
- **Registration** now stores `emailVerified: true`, writes no `emailVerifyTokenHash` / `emailVerifyExpires`, and does not attempt a verification email (Resend would reject every send right now) — instead of creating an account that could never be confirmed.
- The register payload returns `requiresVerification: false`, so `/verify-email` is never pushed after sign-up.
- **Unchanged:** password checks, JWT signing/validation, `tokenVersion`, rate limiting, role/authorization, forgot/reset password, the generic `INVALID_CREDENTIALS` error, the mailer, and the email templates.

---

## 3. How email verification is temporarily disabled

A single server-side feature flag read from `process.env` in `src/lib/config.js`, consumed by two API routes:

```js
// src/lib/config.js
export function emailVerificationRequired() {
  return readEmailVerificationFlag() === "true";
}
```

| Value | Meaning |
| --- | --- |
| `true`, `yes`, `on`, `1` | Registration requires a confirmed address again |
| unset, `false`, `no`, `off`, `0` | Verification not required (**current state**) |
| anything else | Treated as disabled + `pnpm doctor` warns about the typo |

No code is commented out, deleted, or disabled. The whole verification path is present and simply flag-selected. The flag is server-side only — it is read at call time and never sent to the browser.

---

## 4. Exact flag to re-enable it later

```bash
EMAIL_VERIFICATION_REQUIRED=true
```

Set it in the Vercel environment **after** verifying the sending domain in the mail provider. No code change is required, and no data backfill is needed — accounts created while the flag is off are stored verified, so flipping it back on never locks anyone out.

Verification steps:
```bash
pnpm doctor    # row "Email verification required" flips ○ → ✓ and the reminder warning disappears
```

---

## 5. Confirmation that /verify-email and the verification APIs remain intact

All of the following are **unmodified** and asserted by tests (both existence and behaviour):

- `src/app/verify-email/page.js` + `src/app/verify-email/layout.js`
- `src/app/api/auth/verify-email/route.js` (timing-safe token match, expiry check, sets `emailVerified = true`)
- `src/app/api/auth/resend-verification/route.js` (still generates a fresh hashed token + expiry)
- `src/app/api/auth/forgot-password/route.js` and `src/app/api/auth/reset-password/route.js` (untouched, still independent of the flag, `tokenVersion` bump intact)
- `src/lib/mailer.js` (nodemailer + Resend SMTP, unchanged)
- `src/lib/emailTemplates.js`, `src/lib/tokens.js`

`pnpm build` emits all of them:
```
ƒ /api/auth/login                 ƒ /api/auth/verify-email
ƒ /api/auth/register              ƒ /api/auth/resend-verification
ƒ /api/auth/forgot-password       ○ /verify-email
ƒ /api/auth/reset-password
```

---

## 6. Test / lint / build / doctor results

| Command | Result |
| --- | --- |
| `pnpm test` | **146 passed / 11 files** (was 95 — 51 new tests added) |
| `pnpm lint` | Clean |
| `pnpm build` | Compiled successfully, no warnings |
| `pnpm doctor` | Exit 0, shows `○ Email verification required` + reminder warning |

The flag was also verified in the opposite direction:
```
EMAIL_VERIFICATION_REQUIRED=true pnpm doctor   →  ✓ Email verification required — configured
```

### What the new tests cover
- Flag truth table (unset / `false` / `off` / `0` / `no` / empty, and `true` / `yes` / `on` / `1`, plus unrecognised values)
- Login with the flag off: unverified account logs in (200), cookie set as `auth-token`, no `EMAIL_NOT_VERIFIED`
- Login with the flag on: unverified account blocked (403 `EMAIL_NOT_VERIFIED`), verified account passes
- Password auth not weakened: wrong password and unknown account both return the same generic `401 INVALID_CREDENTIALS`, no cookie
- Rate limiting still active: 31st login attempt on one IP returns `429 RATE_LIMITED`
- Admin role passes through the unchanged flow
- Register off: `requiresVerification: false`, `emailVerified: true`, no pending token, **no** SMTP send
- Register on: `requiresVerification: true`, `emailVerified: false`, 64-hex token hash + expiry, verification email sent with a `/verify-email?token=` link
- Register resilience: a failing verification email still returns 201; duplicate email still returns 409 `EMAIL_EXISTS`
- Dev-only `devVerificationUrl` still returned when SMTP is unconfigured
- Integrity guards: the `EMAIL_NOT_VERIFIED` branch is still reachable in source, token hashing/expiry/timing-safe matching intact, password-reset routes never reference the flag, the mailer is still the only transport, and **no `"use client"` file** references `SMTP_PASS`, `SMTP_USER`, `EMAIL_VERIFICATION_REQUIRED`, or imports `lib/config`

---

## 7. Production environment variable

**Nothing is required.** The disabled state is the default, so current production behaviour already reflects it once this is deployed.

Optionally add this to Vercel to make the temporary state explicit and self-documenting:

```
EMAIL_VERIFICATION_REQUIRED=false
```

Nothing else changes. `SMTP_*` values are untouched and never reach the browser. `/api/health` and `pnpm doctor` both report the flag state and warn while it is off.

---

## Security checklist

| Requirement | Status |
| --- | --- |
| Password authentication not weakened | Verified by test — same generic 401 |
| JWT / session validation not removed | Untouched (`src/lib/jwt.js`, `session.js`, `admin.js`) |
| Rate limiting not removed | Verified by test — 429 still fires |
| Verification tokens not exposed | Tokens stay `select:false`, hashed, and the dev log redacts `token=` |
| SMTP credentials not logged or client-exposed | Mailer untouched; new test walks all client components |
| Generic auth error behaviour preserved | `INVALID_CREDENTIALS` unchanged for bad password and unknown account |
| No unrelated security changes | Only the verification gate is flag-gated |
