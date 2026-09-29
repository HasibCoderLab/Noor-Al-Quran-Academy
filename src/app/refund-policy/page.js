import Link from "next/link";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";

export const metadata = {
  title: "Refund Policy",
  description:
    "Refund policy for class packages and subscriptions at Noor Al-Quran Academy.",
  alternates: { canonical: "/refund-policy" },
};

const h2 = "font-hind-siliguri text-xl font-bold text-primary";
const p = "mt-2 text-sm leading-relaxed text-primary/75";
const ul = "mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-primary/75";
const li = "flex items-start gap-2";
const bullet = "mt-0.5 shrink-0 text-accent";

export default function RefundPolicyPage() {
  return (
    <section className="relative overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <div className={`${styles.container} relative z-10`}>
        <div className={styles.sectionHeader}>
          <span className={styles.badgeGold}>Legal</span>
          <h1 className={`${styles.sectionTitle} mt-4`}>Refund Policy</h1>
          <div className={styles.goldDivider} />
          <p className={styles.sectionSub}>
            How refunds, cancellations and make-up classes work at {SITE.name}.
            Last updated: August 2026.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10 sm:p-10">
            <section>
              <h2 className={h2}>1. Free Trial</h2>
              <p className={p}>
                Every new student receives one free trial class. No payment is
                required for the trial, so there is nothing to refund. If you decide
                to continue, you can then enrol in a paid monthly plan.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>2. Monthly Plans</h2>
              <p className={p}>
                Classes are sold as monthly plans (Starter, Popular and Intensive).
                Plan fees are non-refundable once the month has started, except in
                the cases described below.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>3. When We Issue a Refund</h2>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <span>
                    <strong>Missed class by us:</strong> if a scheduled class does
                    not take place because of a fault on our side, we will offer a
                    make-up class or a pro-rated refund for that class, at our
                    discretion.
                  </span>
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <span>
                    <strong>Duplicate or mistaken payment:</strong> if you are
                    accidentally charged twice or charged the wrong amount, we will
                    refund the error in full.
                  </span>
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <span>
                    <strong>Service cancellation by us:</strong> if we are unable to
                    continue providing your plan, you will receive a pro-rated refund
                    for any unused portion of the month.
                  </span>
                </li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className={h2}>4. When Refunds Are Not Available</h2>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✕</span>
                  Classes you miss without giving notice (no-show).
                </li>
                <li className={li}>
                  <span className={bullet}>✕</span>
                  Classes cancelled or missed because of your own internet or
                  device problems.
                </li>
                <li className={li}>
                  <span className={bullet}>✕</span>
                  Voluntary discontinuation of a plan partway through the month.
                </li>
              </ul>
              <p className={p}>
                In the above cases, we are happy to discuss rescheduling to a
                suitable time instead of a refund.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>5. Make-Up Classes</h2>
              <p className={p}>
                If you notify us with reasonable advance notice that you cannot
                attend a class, we will do our best to offer a make-up class at an
                available time slot in the same week, subject to availability. Make-up
                classes are offered at our discretion and do not carry over beyond
                the current plan month.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>6. How to Request a Refund</h2>
              <p className={p}>
                Contact us at{" "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  {SITE.email}
                </a>{" "}
                or via{" "}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  WhatsApp
                </a>{" "}
                with your name, plan and payment details. We will respond within 5
                working days.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>7. Refund Processing Time</h2>
              <p className={p}>
                Approved refunds are processed within 7–10 working days. Refunds are
                returned to the original payment method (bKash for Bangladesh
                students, or the card used for international payments).
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>8. Contact</h2>
              <p className={p}>
                Questions about this policy? Contact us at{" "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  {SITE.email}
                </a>
                . Please also review our{" "}
                <Link href="/terms" className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
