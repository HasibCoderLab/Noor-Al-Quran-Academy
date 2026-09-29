import Link from "next/link";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for studying with Noor Al-Quran Academy — bookings, payments, schedules and conduct.",
  alternates: { canonical: "/terms" },
};

const h2 = "font-hind-siliguri text-xl font-bold text-primary";
const p = "mt-2 text-sm leading-relaxed text-primary/75";
const ul = "mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-primary/75";
const li = "flex items-start gap-2";
const bullet = "mt-0.5 shrink-0 text-accent";

export default function TermsPage() {
  return (
    <section className="relative overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <div className={`${styles.container} relative z-10`}>
        <div className={styles.sectionHeader}>
          <span className={styles.badgeGold}>Legal</span>
          <h1 className={`${styles.sectionTitle} mt-4`}>Terms of Service</h1>
          <div className={styles.goldDivider} />
          <p className={styles.sectionSub}>
            Please read these terms carefully before enrolling in our classes.
            Last updated: August 2026.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10 sm:p-10">
            {/* 1 */}
            <section>
              <h2 className={h2}>1. About {SITE.name}</h2>
              <p className={p}>
                {SITE.name} (“we”, “us”, “our”) provides online, one-to-one Quran
                learning classes taught by {SITE.teacher}, {SITE.teacherTitle},
                based in {SITE.location}. Our services include live video-call
                lessons in Tajweed, Hifz, Nazra and Masnoon Duas, a free trial
                class, and supporting tools such as the student dashboard and the
                Noor AI assistant.
              </p>
            </section>

            {/* 2 */}
            <section className="mt-8">
              <h2 className={h2}>2. Acceptance of Terms</h2>
              <p className={p}>
                By accessing this website, creating an account, booking a class, or
                using any of our services, you agree to be bound by these Terms of
                Service and our{" "}
                <Link href="/privacy-policy" className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  Privacy Policy
                </Link>
                . If you do not agree, please do not use our services.
              </p>
            </section>

            {/* 3 */}
            <section className="mt-8">
              <h2 className={h2}>3. Eligibility</h2>
              <p className={p}>
                Our classes are open to learners of all ages. If you are enrolling a
                minor, you confirm that you are their parent or legal guardian and
                that you agree to these terms on their behalf. A responsible adult
                should remain present or reasonably supervise any online class
                involving a young student.
              </p>
            </section>

            {/* 4 */}
            <section className="mt-8">
              <h2 className={h2}>4. Courses, Scheduling and Classes</h2>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Classes are one-to-one and delivered online via video call
                  (Google Meet / Zoom) at the time you select.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Available slots are Saturday to Thursday at{" "}
                  {SITE.classTimes.satThu.join(", ")} and Friday at{" "}
                  {SITE.classTimes.friday.join(", ")} ({SITE.timezone} time).
                  Lesson lengths are {SITE.classTimes.durations.join(" / ")} minutes.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  You may request to reschedule or cancel a class from your student
                  dashboard, subject to reasonable advance notice so the teacher can
                  adjust the schedule.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Free trial classes are offered once per student. Additional trials
                  are not guaranteed.
                </li>
              </ul>
            </section>

            {/* 5 */}
            <section className="mt-8">
              <h2 className={h2}>5. Fees and Payment</h2>
              <p className={p}>Our monthly plans are shown on the Pricing section of the website:</p>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Bangladesh (BDT): Starter ৳1,200, Popular ৳2,200, Intensive ৳3,000
                  per month.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  International (USD): Starter $20, Popular $36, Intensive $48 per
                  month.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Students in Bangladesh pay by bKash (manual confirmation).
                  International students pay by card via a secure payment
                  processor.
                </li>
              </ul>
              <p className={p}>
                Monthly plans renew on a month-to-month basis. Fees are non-refundable
                except where we fail to deliver a scheduled class through no fault of
                your own, in which case we will offer a make-up class or a refund at
                our discretion.
              </p>
            </section>

            {/* 6 */}
            <section className="mt-8">
              <h2 className={h2}>6. Accounts and Your Responsibilities</h2>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  You must provide accurate information when registering or booking.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  You are responsible for keeping your login credentials secure and
                  for all activity under your account.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  You agree to behave respectfully toward the teacher and other
                  participants, and to use a stable internet connection during
                  scheduled lessons.
                </li>
              </ul>
            </section>

            {/* 7 */}
            <section className="mt-8">
              <h2 className={h2}>7. Noor AI Assistant</h2>
              <p className={p}>
                The Noor AI assistant is provided to help you find information about
                our courses, pricing, schedule and academy. AI responses are
                generated automatically and may occasionally be incomplete or
                inaccurate. Always confirm important details (such as pricing or
                bookings) with us directly via WhatsApp or email before relying on
                them.
              </p>
            </section>

            {/* 8 */}
            <section className="mt-8">
              <h2 className={h2}>8. Acceptable Use</h2>
              <p className={p}>
                You agree not to misuse the website, including attempting to disrupt
                the service, access other users&apos; data, or use our content in any way
                that violates applicable law.
              </p>
            </section>

            {/* 9 */}
            <section className="mt-8">
              <h2 className={h2}>9. Intellectual Property</h2>
              <p className={p}>
                All content on this website — including text, course materials,
                lesson plans, graphics and the {SITE.name} name and logo — is our
                property or the property of our licensors and is protected by
                applicable copyright and intellectual property laws. You may not
                reproduce, redistribute or commercially exploit our materials without
                prior written permission.
              </p>
            </section>

            {/* 10 */}
            <section className="mt-8">
              <h2 className={h2}>10. Limitation of Liability</h2>
              <p className={p}>
                To the maximum extent permitted by law, {SITE.name} shall not be
                liable for any indirect, incidental or consequential damages arising
                from your use of the website or our services. Our total liability for
                any claim shall not exceed the amount you paid for the relevant
                service.
              </p>
            </section>

            {/* 11 */}
            <section className="mt-8">
              <h2 className={h2}>11. Governing Law</h2>
              <p className={p}>
                These terms are governed by the laws of the People&apos;s Republic of
                Bangladesh. Any disputes shall be subject to the jurisdiction of the
                courts of Bangladesh.
              </p>
            </section>

            {/* 12 */}
            <section className="mt-8">
              <h2 className={h2}>12. Changes to These Terms</h2>
              <p className={p}>
                We may update these terms from time to time. The latest version will
                always be available on this page, and significant changes will be
                communicated to registered students.
              </p>
            </section>

            {/* 13 */}
            <section className="mt-8">
              <h2 className={h2}>13. Contact Us</h2>
              <p className={p}>
                Questions about these terms? Contact us at{" "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  {SITE.email}
                </a>{" "}
                or via{" "}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  WhatsApp
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
