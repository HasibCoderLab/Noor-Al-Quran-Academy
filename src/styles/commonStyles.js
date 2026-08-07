// All shared Tailwind class strings in the project live here.
// Design tokens (from @theme in globals.css):
//   primary #1B4332 (deep emerald) · accent #D4AF37 (gold)
//   background #FDFBF7 (ivory) · secondary #F0F4F0 (light green)

export const styles = {
  // Layout containers
  container: "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
  section: "relative py-16 sm:py-20 lg:py-24",
  sectionAlt: "relative bg-secondary py-16 sm:py-20 lg:py-24",

  // Section headers
  sectionTitle: "font-hind-siliguri text-3xl font-bold text-primary sm:text-4xl",
  sectionSub: "mt-3 max-w-2xl text-base text-primary/70 sm:text-lg",
  goldDivider: "mt-4 h-1 w-16 rounded-full bg-accent",
  sectionHeader: "flex flex-col items-center text-center",

  // Buttons
  btnPrimary: "inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90",
  btnAccent: "inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-accent/90",
  btnOutline: "inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white",
  btnGhost: "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-primary transition hover:bg-secondary",

  // Cards
  card: "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10",
  cardHover: "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10 transition hover:-translate-y-1 hover:shadow-lg hover:ring-accent/40",

  // Badges
  badgeGold: "inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-primary",
  badgeGreen: "inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary",

  // Forms
  input: "w-full rounded-lg border border-primary/20 bg-white px-4 py-3 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-accent focus:ring-2 focus:ring-accent/30",

  // Text effects
  gradientText: "bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent",
};
