<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
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