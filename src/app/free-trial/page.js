"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SITE, COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../lib/apiError";

const initialForm = {
  name: "",
  email: "",
  whatsapp: "",
  country: "",
  course: "",
  date: "",
  time: "",
  duration: "30",
  message: "",
};

const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DAY_COUNT = 14;

export default function FreeTrialPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAY_COUNT }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return { value: toLocalDateValue(date), date };
    });
  }, []);

  const dayLabel = (date) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(date);
    } catch {
      return toLocalDateValue(date);
    }
  };

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

  useEffect(() => {
    setSelectedSlotId("");
    setForm((prev) => ({ ...prev, time: "", duration: "30" }));
    setSlots([]);

    if (!form.date) return;
    let active = true;
    setLoadingSlots(true);

    fetch(`/api/availability?date=${encodeURIComponent(form.date)}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (!active) return;
        setSlots(Array.isArray(data.slots) ? data.slots : []);
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [form.date]);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const selectDay = (value) => {
    setForm((prev) => ({ ...prev, date: value }));
  };

  const selectSlot = (slot) => {
    setSelectedSlotId(slot.id);
    setForm((prev) => ({
      ...prev,
      time: slot.time,
      duration: String(slot.duration),
    }));
  };

  const refreshSlots = async () => {
    if (!form.date) return;
    try {
      const res = await fetch(
        `/api/availability?date=${encodeURIComponent(form.date)}`
      );
      const data = await res.json().catch(() => ({}));
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setSlots([]);
    }
    setSelectedSlotId("");
    setForm((prev) => ({ ...prev, time: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      toast.error(t("validation.contactRequired"));
      return;
    }
    if (!form.course) {
      toast.error(t("validation.chooseCourse"));
      return;
    }
    if (!form.date) {
      toast.error(t("booking.pickDate"));
      return;
    }
    if (!form.time) {
      toast.error(t("validation.chooseSlot"));
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
          date: form.date,
          time: form.time,
          duration: Number(form.duration),
          message: form.message.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(errorMessage(t, data, "errors.generic"));
        if (data.code === "SLOT_TAKEN" || data.code === "DUPLICATE_BOOKING") {
          refreshSlots();
        }
        return;
      }

      toast.success(t("booking.success"));
      setForm((prev) => ({
        ...initialForm,
        name: prev.name,
        email: prev.email,
        whatsapp: prev.whatsapp,
        country: prev.country,
      }));
      setSlots([]);
      setSelectedSlotId("");
    } catch {
      toast.error(t("errors.network"));
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
          <span className={styles.badgeGold}>{t("booking.badge")}</span>
          <h1 className={`${styles.sectionTitle} mt-4`}>{t("booking.title")}</h1>
          <div className={styles.goldDivider} />
          <p className={styles.sectionSub}>
            {t("booking.subtitle", {
              teacher: SITE.teacher,
              title: SITE.teacherTitle,
            })}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-8 lg:grid-cols-5">
          {/* Booking form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10 lg:col-span-3"
          >
            <h2 className="font-hind-siliguri text-lg font-bold text-primary">
              {t("booking.detailsHeading")}
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-primary">
                  {t("common.fullName")} *
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
                  {t("booking.emailLabel")}
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
                  {t("booking.whatsappLabel")}
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
                  {t("booking.countryLabel")}
                </label>
                <select
                  id="country"
                  value={form.country}
                  onChange={set("country")}
                  className={selectField}
                >
                  <option value="">{t("booking.selectCountry")}</option>
                  {SITE.targetCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="course" className="text-sm font-semibold text-primary">
                  {t("booking.courseLabel")}
                </label>
                <select
                  id="course"
                  value={form.course}
                  onChange={set("course")}
                  className={selectField}
                >
                  <option value="">{t("booking.selectCourse")}</option>
                  {COURSES.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + slot picker */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-primary">
                  {t("booking.dateLabel")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => selectDay(day.value)}
                      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                        form.date === day.value
                          ? "bg-primary text-white shadow-sm"
                          : "bg-secondary text-primary/70 hover:text-primary"
                      }`}
                    >
                      {dayLabel(day.date)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-primary">
                  {t("booking.times")}
                </span>

                {!form.date ? (
                  <p className="rounded-xl bg-secondary p-4 text-sm text-primary/60">
                    {t("booking.pickDate")}
                  </p>
                ) : loadingSlots ? (
                  <p className="rounded-xl bg-secondary p-4 text-sm text-primary/60">
                    {t("common.loading")}
                  </p>
                ) : slots.length === 0 ? (
                  <p className="rounded-xl bg-secondary p-4 text-sm text-primary/60">
                    {t("booking.noSlots")}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => selectSlot(slot)}
                        className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                          selectedSlotId === slot.id
                            ? "bg-accent text-primary shadow-sm"
                            : "bg-secondary text-primary/75 hover:text-primary"
                        }`}
                      >
                        {slot.time}
                        <span className="ms-1.5 text-xs opacity-70">
                          {slot.duration} min
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="message" className="text-sm font-semibold text-primary">
                  {t("booking.messageLabel")}
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={set("message")}
                  placeholder={t("booking.messagePlaceholder")}
                  className={styles.input}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${styles.btnAccent} mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {submitting ? t("booking.submitting") : t("booking.submit")}
            </button>

            <p className="mt-4 text-center text-xs text-primary/50">
              {t("booking.alreadyAccount")}{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-accent">
                {t("booking.login")}
              </Link>{" "}
              {t("booking.or")}{" "}
              <Link href="/register" className="font-semibold text-primary hover:text-accent">
                {t("booking.createAccount")}
              </Link>
            </p>
          </form>

          {/* Info panel */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-2xl bg-primary p-7 text-white shadow-xl">
              <h2 className="font-hind-siliguri text-lg font-bold">
                {t("booking.whatYouGet")}
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>{" "}
                  {t("booking.includes1", { duration: 30 })}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>{" "}
                  {t("booking.includes2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>{" "}
                  {t("booking.includes3")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>{" "}
                  {t("booking.includes4")}
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10">
              <h2 className="font-hind-siliguri text-lg font-bold text-primary">
                {t("booking.classTimes")}
              </h2>
              <p className="mt-2 text-sm text-primary/70">{t("booking.satThu")}</p>
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
              <p className="mt-4 text-sm text-primary/70">{t("booking.friday")}</p>
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
                {t("booking.preferWhatsApp")}
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
