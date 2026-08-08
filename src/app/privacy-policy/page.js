import Link from "next/link";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";

export const metadata = {
  title: "Privacy Policy",
};

const h2 = "font-hind-siliguri text-xl font-bold text-primary";
const p = "mt-2 text-sm leading-relaxed text-primary/75";
const ul = "mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-primary/75";
const li = "flex items-start gap-2";
const bullet = "mt-0.5 shrink-0 text-accent";

export default function PrivacyPolicyPage() {
  return (
    <section className="relative overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <div className={`${styles.container} relative z-10`}>
        <div className={styles.sectionHeader}>
          <span className={styles.badgeGold}>Legal</span>
          <h1 className={`${styles.sectionTitle} mt-4`}>Privacy Policy</h1>
          <div className={styles.goldDivider} />
          <p className={styles.sectionSub}>
            How {SITE.name} collects, uses and protects your information.
            Last updated: August 2026.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10 sm:p-10">
            <section>
              <h2 className={h2}>1. Who We Are</h2>
              <p className={p}>
                {SITE.name} (“we”, “us”, “our”) is an online Quran learning academy
                based in {SITE.location}, Bangladesh, providing one-to-one online
                classes in Tajweed, Hifz, Nazra and Masnoon Duas. This policy
                explains what information we collect when you use our website and
                services, and how we use and protect it.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>2. Information We Collect</h2>
              <p className={p}>We collect the following information:</p>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <span>
                    <strong>Account details</strong> — when you register, we collect
                    your name, email address, country and a password (stored in an
                    encrypted, hashed form).
                  </span>
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <span>
                    <strong>Booking details</strong> — when you request a free trial
                    or book a class, we collect your name, email, WhatsApp number,
                    country, chosen course, preferred time and any message you send.
                  </span>
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <span>
                    <strong>Language preference</strong> — your chosen site language
                    (English, Bengali or Arabic).
                  </span>
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <span>
                    <strong>Chat messages</strong> — when you use the Noor AI
                    assistant, your questions are sent to the AI provider to generate
                    a reply (see section 5).
                  </span>
                </li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className={h2}>3. Where Your Data Is Stored</h2>
              <p className={p}>
                Currently, your account and booking information is stored{" "}
                <strong>only on your own device</strong> in your browser&apos;s local
                storage. This means it is not transmitted to or stored on our
                servers, and clearing your browser data will remove it. If we later
                introduce server-side accounts and payments, we will update this
                policy and provide secure, encrypted storage and processing.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>4. How We Use Your Information</h2>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  To process your bookings and schedule your classes.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  To contact you by email or WhatsApp about your classes, payments
                  and schedule.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  To deliver and improve the Noor AI assistant and the website.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  To meet legal and administrative obligations.
                </li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className={h2}>5. Noor AI Assistant</h2>
              <p className={p}>
                When you chat with Noor AI, your messages are sent to a third-party
                AI service (Groq) to generate an answer. Chat history is not saved by
                the website and is not used to build profiles about you. Please do
                not include sensitive personal information in AI chat messages.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>6. Third-Party Services</h2>
              <p className={p}>
                We use or may use the following third-party services, each of which
                has its own privacy policy:
              </p>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <strong>Groq</strong> — processes Noor AI chat messages to generate
                  responses.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <strong>Video calls</strong> — classes are delivered via Google
                  Meet or Zoom.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <strong>Payments</strong> — bKash (Bangladesh) and a secure card
                  payment provider (Stripe) for international students. We do not
                  store your card details.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  <strong>WhatsApp and Messenger</strong> — used for support and
                  bookings when you choose to contact us there.
                </li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className={h2}>7. Cookies and Tracking</h2>
              <p className={p}>
                We do not use advertising cookies, analytics trackers or third-party
                advertising. We only use browser local storage to remember your
                account session, bookings and language preference. You can clear this
                at any time through your browser settings.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>8. Children&apos;s Privacy</h2>
              <p className={p}>
                Our classes are open to children, and parents or guardians are
                responsible for providing consent and supervising lessons. We do not
                knowingly collect personal information from children beyond what is
                needed to enrol and schedule classes for them.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>9. Your Rights</h2>
              <p className={p}>You have the right to:</p>
              <ul className={ul}>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Access and correct the information you have provided.
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Delete your account and booking data at any time (via your browser&apos;s
                  storage settings or by contacting us).
                </li>
                <li className={li}>
                  <span className={bullet}>✓</span>
                  Opt out of any non-essential communications from us.
                </li>
              </ul>
              <p className={p}>
                To exercise any of these rights, contact us using the details in
                section 12.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>10. Data Security</h2>
              <p className={p}>
                Passwords are stored only in a hashed (encrypted) form, and we apply
                reasonable technical measures to protect information. However, no
                method of transmission or storage over the internet is completely
                secure, so we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>11. Changes to This Policy</h2>
              <p className={p}>
                We may update this policy as our services evolve. The latest version
                will always be available on this page, with the date of the last
                update shown at the top.
              </p>
            </section>

            <section className="mt-8">
              <h2 className={h2}>12. Contact Us</h2>
              <p className={p}>
                If you have any questions about this policy or your data, contact us
                at{" "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  {SITE.email}
                </a>{" "}
                or via{" "}
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  WhatsApp
                </a>
                . Please also review our{" "}
                <Link href="/terms" className="font-semibold text-primary underline decoration-accent underline-offset-2 hover:text-accent">
                  Terms of Service
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
