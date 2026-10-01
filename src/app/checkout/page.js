"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { COURSES, PRICING } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../lib/apiError";

const DAY_COUNT = 14;

const toLocalDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const courseName = (id) =>
  COURSES.find((course) => course.id === id)?.name || id;

function CheckoutInner() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const params = useSearchParams();

  const region = params.get("region") === "bd" ? "bd" : "intl";
  const planIndex = Number(params.get("plan"));
  const block = PRICING[region];
  const plan =
    Number.isInteger(planIndex) && block ? block.plans[planIndex] : null;

  const [course, setCourse] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAY_COUNT }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() + index);
      return { value: toLocalDateValue(day), date: day };
    });
  }, []);

  const dayLabel = (day) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(day);
    } catch {
      return toLocalDateValue(day);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(
        `/login?from=${encodeURIComponent(
          `/checkout?region=${region}&plan=${planIndex}`
        )}`
      );
    }
  }, [isLoading, user, router, region, planIndex]);

  useEffect(() => {
    if (!user) return;
    setWhatsapp((prev) => prev || user.whatsapp || "");
  }, [user]);

  useEffect(() => {
    setSelectedSlot(null);
    setSlots([]);
    if (!date) return undefined;

    let active = true;
    setLoadingSlots(true);
    fetch(`/api/availability?date=${encodeURIComponent(date)}`)
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (active) setSlots(Array.isArray(data.slots) ? data.slots : []);
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
  }, [date]);

  const refreshSlots = async () => {
    if (!date) return;
    try {
      const res = await fetch(
        `/api/availability?date=${encodeURIComponent(date)}`
      );
      const data = await res.json().catch(() => ({}));
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setSlots([]);
    }
    setSelectedSlot(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!course) {
      toast.error(t("validation.chooseCourse"));
      return;
    }
    if (!date) {
      toast.error(t("booking.pickDate"));
      return;
    }
    if (!selectedSlot) {
      toast.error(t("booking.selectSlot"));
      return;
    }
    if (!whatsapp.trim()) {
      toast.error(t("validation.contactRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          planIndex,
          course,
          date,
          time: selectedSlot.time,
          duration: selectedSlot.duration,
          whatsapp: whatsapp.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.url) {
        toast.error(errorMessage(t, data, "errors.generic"));
        if (data.code === "SLOT_TAKEN" || data.code === "DUPLICATE_BOOKING") {
          refreshSlots();
        }
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error(t("errors.network"));
      setSubmitting(false);
    }
  };

  const selectField = `${styles.input} appearance-none`;

  if (plan === null) {
    return (
      <section className="relative flex min-h-screen items-center justify-center bg-secondary pb-20 pt-28 lg:pt-32">
        <div className="pattern-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-md px-4 text-center">
          <h1 className="font-hind-siliguri text-2xl font-bold text-primary">
            {t("payment.title")}
          </h1>
          <p className="mt-3 text-sm text-primary/60">{t("errors.notFound")}</p>
          <Link href="/#pricing" className={`${styles.btnPrimary} mt-6 inline-flex`}>
            {t("payment.cancelled.retry")}
          </Link>
        </div>
      </section>
    );
  }

  const planLabel = `${block.symbol}${plan.price}`;

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
          <span className={styles.badgeGold}>{t("payment.title")}</span>
          <h1 className={`${styles.sectionTitle} mt-4`}>{t("checkout.title")}</h1>
          <div className={styles.goldDivider} />
          <p className={styles.sectionSub}>{t("checkout.subtitle")}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-8 lg:grid-cols-5">
          <form
            onSubmit={submit}
            className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10 lg:col-span-3"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course" className="text-sm font-semibold text-primary">
                {t("booking.courseLabel")}
              </label>
              <select
                id="course"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                className={selectField}
              >
                <option value="">{t("booking.selectCourse")}</option>
                {COURSES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex min-w-0 flex-col gap-1.5">
              <label htmlFor="whatsapp" className="text-sm font-semibold text-primary">
                {t("booking.whatsappLabel")}
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                placeholder="+8801XXXXXXXXX"
                className={styles.input}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <span className="text-sm font-semibold text-primary">
                {t("booking.dateLabel")}
              </span>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => setDate(day.value)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                      date === day.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-secondary text-primary/70 hover:text-primary"
                    }`}
                  >
                    {dayLabel(day.date)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <span className="text-sm font-semibold text-primary">
                {t("booking.selectSlot")}
              </span>

              {!date ? (
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
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                        selectedSlot?.id === slot.id
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

            <button
              type="submit"
              disabled={submitting}
              className={`${styles.btnAccent} mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {submitting
                ? t("payment.redirecting")
                : t("payment.payNow")}
            </button>

            <p className="mt-4 text-center text-xs text-primary/50">
              {t("payment.secureNote")}
            </p>
          </form>

          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-primary p-7 text-white shadow-xl">
              <h2 className="font-hind-siliguri text-lg font-bold">
                {t("booking.orderSummary")}
              </h2>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-xl font-semibold">{block.symbol}</span>
                <span className="font-hind-siliguri text-4xl font-bold">
                  {plan.price}
                </span>
                <span className="text-sm text-white/70">
                  {t("landing.pricing.perMonth")}
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-white/90">
                {plan.name}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {t("landing.pricing.classesPerMonth", { count: plan.classes })}
              </p>

              <ul className="mt-5 flex flex-col gap-2 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">•</span>
                  {course ? courseName(course) : t("checkout.selectCourse")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">•</span>
                  {selectedSlot
                    ? `${selectedSlot.time} · ${selectedSlot.duration} min`
                    : date || t("checkout.selectSlot")}
                </li>
              </ul>

              <p className="mt-6 text-xs text-white/60">
                {t("payment.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-screen items-center justify-center bg-secondary pt-16">
          <p className="text-sm text-primary/60">Loading…</p>
        </section>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
