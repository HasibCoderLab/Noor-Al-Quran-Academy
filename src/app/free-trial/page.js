"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { SITE, COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  whatsapp: "",
  country: "",
  course: "",
  time: "",
  duration: "30",
  message: "",
};

export default function FreeTrialPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
      whatsapp: user.whatsapp || prev.whatsapp,
      country: user.country || prev.country,
    }));
  }, [user]);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      toast.error("Please fill in your name, email and WhatsApp number.");
      return;
    }
    if (!form.course) {
      toast.error("Please choose a course.");
      return;
    }
    if (!form.time) {
      toast.error("Please choose a preferred class time.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "free-trial",
          name: form.name.trim(),
          email: form.email.trim(),
          whatsapp: form.whatsapp.trim(),
          country: form.country.trim(),
          course: form.course,
          time: form.time,
          duration: Number(form.duration),
          message: form.message.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error || "Could not submit your request. Please try again.");
        return;
      }

      toast.success("Free trial requested! We will contact you on WhatsApp shortly.");
      setForm(initialForm);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectField = `${styles.input} appearance-none`;

  return (
    <section className="relative overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={slideFromBottom}
        initial="hidden"
        animate="visible"
        className={`${styles.container} relative z-10`}
      >
        <div className={styles.sectionHeader}>
          <span className={styles.badgeGold}>Free Trial</span>
          <h1 className={`${styles.sectionTitle} mt-4`}>
            Book Your Free Trial Class
          </h1>
          <div className={styles.goldDivider} />
          <p className={styles.sectionSub}>
            Meet {SITE.teacher} ({SITE.teacherTitle}) in a free one-to-one trial
            class and experience the lesson format before you commit.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-8 lg:grid-cols-5">
          {/* Booking form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10 lg:col-span-3"
          >
            <h2 className="font-hind-siliguri text-lg font-bold text-primary">
              Trial class details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-primary">
                  Full name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Ahmed Rahman"
                  className={styles.input}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-primary">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  className={styles.input}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="whatsapp" className="text-sm font-semibold text-primary">
                  WhatsApp number *
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={set("whatsapp")}
                  placeholder="+8801XXXXXXXXX"
                  className={styles.input}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="country" className="text-sm font-semibold text-primary">
                  Country
                </label>
                <select
                  id="country"
                  value={form.country}
                  onChange={set("country")}
                  className={selectField}
                >
                  <option value="">Select country</option>
                  {SITE.targetCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="course" className="text-sm font-semibold text-primary">
                  Course *
                </label>
                <select
                  id="course"
                  value={form.course}
                  onChange={set("course")}
                  className={selectField}
                >
                  <option value="">Select course</option>
                  {COURSES.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="time" className="text-sm font-semibold text-primary">
                  Preferred time *
                </label>
                <select
                  id="time"
                  value={form.time}
                  onChange={set("time")}
                  className={selectField}
                >
                  <option value="">Select time (Dhaka)</option>
                  {SITE.classTimes.satThu.map((time) => (
                    <option key={time} value={time}>
                      {time} — Sat to Thu
                    </option>
                  ))}
                  {SITE.classTimes.friday.map((time) => (
                    <option key={time} value={time}>
                      {time} — Friday
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="duration" className="text-sm font-semibold text-primary">
                  Trial lesson length
                </label>
                <div className="flex flex-wrap gap-2">
                  {SITE.classTimes.durations.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, duration: String(duration) }))}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        form.duration === String(duration)
                          ? "bg-primary text-white shadow-sm"
                          : "bg-secondary text-primary/70 hover:text-primary"
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="message" className="text-sm font-semibold text-primary">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell us about the student, age, and current level…"
                  className={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${styles.btnAccent} mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {submitting ? "Booking…" : "Request Free Trial"}
            </button>

            <p className="mt-4 text-center text-xs text-primary/50">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-accent">
                Login
              </Link>{" "}
              · or{" "}
              <Link href="/register" className="font-semibold text-primary hover:text-accent">
                create an account
              </Link>
            </p>
          </form>

          {/* Info panel */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-2xl bg-primary p-7 text-white shadow-xl">
              <h2 className="font-hind-siliguri text-lg font-bold">
                What you get
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span> 1 free one-to-one
                  trial lesson (30 minutes)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span> Tajweed, Hifz,
                  Nazra or Masnoon Duas
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span> Assessment of your
                  current level
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span> No payment required
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10">
              <h2 className="font-hind-siliguri text-lg font-bold text-primary">
                Class times (Asia/Dhaka)
              </h2>
              <p className="mt-2 text-sm text-primary/70">
                Saturday to Thursday:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SITE.classTimes.satThu.map((time) => (
                  <span
                    key={time}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {time}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-primary/70">Friday:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SITE.classTimes.friday.map((time) => (
                  <span
                    key={time}
                    className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {time}
                  </span>
                ))}
              </div>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                💬 Prefer WhatsApp? Chat now
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
