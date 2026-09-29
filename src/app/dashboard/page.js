"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { SITE, COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { staggerContainer, staggerItem } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";

const courseName = (id) =>
  COURSES.find((course) => course.id === id)?.name || id;

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        setMyBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch {
        if (active) setMyBookings([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-secondary pt-16">
        <p className="text-sm text-primary/60">{t("common.loading")}</p>
      </section>
    );
  }

  const pending = myBookings.filter((booking) => booking.status === "pending");
  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="relative overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={`${styles.container} relative z-10`}
      >
        {/* Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-primary">
              {initials}
            </span>
            <div>
              <h1 className="font-hind-siliguri text-2xl font-bold text-primary">
                {t("dashboard.greeting", { name: user.name.split(" ")[0] })}
              </h1>
              <p className="text-sm text-primary/60">
                {user.email} {user.country ? `· ${user.country}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/free-trial" className={styles.btnAccent}>
              {t("dashboard.bookFreeTrial")}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: t("dashboard.classesTaken"), value: "0" },
            { label: t("dashboard.pendingTrials"), value: String(pending.length) },
            { label: t("dashboard.courseStat"), value: "—" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10"
            >
              <p className="font-hind-siliguri text-3xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-primary/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Bookings */}
          <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10 lg:col-span-2">
            <h2 className="font-hind-siliguri text-lg font-bold text-primary">
              {t("dashboard.yourRequests")}
            </h2>

            {myBookings.length === 0 ? (
              <div className="mt-6 rounded-xl bg-secondary p-8 text-center">
                <p className="text-3xl">🌙</p>
                <p className="mt-3 text-sm text-primary/70">
                  {t("dashboard.emptyTitle")}
                </p>
                <Link href="/free-trial" className={`${styles.btnPrimary} mt-5 inline-flex`}>
                  {t("dashboard.emptyCta")}
                </Link>
              </div>
            ) : (
              <ul className="mt-6 flex flex-col gap-4">
                {myBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-xl border border-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-hind-siliguri font-bold text-primary">
                          {courseName(booking.course)}
                        </span>
                        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                          {t("booking.status." + booking.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-primary/60">
                        {booking.name} · {booking.whatsapp} · {booking.duration} min
                        {booking.time ? ` · ${booking.time} Dhaka` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-primary/40">
                        {t("booking.requestedOn", { date: formatDate(booking.createdAt) })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-primary p-7 text-white shadow-xl">
              <h2 className="font-hind-siliguri text-lg font-bold">
                {t("dashboard.nextSteps")}
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">1.</span>
                  {t("dashboard.step1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">2.</span>
                  {t("dashboard.step2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">3.</span>
                  {t("dashboard.step3")}
                </li>
              </ul>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-accent/90"
              >
                💬 WhatsApp {SITE.teacher.split(" ").pop()}
              </a>
            </div>

            <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10">
              <h2 className="font-hind-siliguri text-lg font-bold text-primary">
                {t("dashboard.upcomingClass")}
              </h2>
              <p className="mt-3 text-sm text-primary/70">
                {t("dashboard.upcomingHint")}
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-secondary p-4 text-sm text-primary/70">
                <span className="text-lg">🗓️</span>
                {t("dashboard.noClasses")}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
