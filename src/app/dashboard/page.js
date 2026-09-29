"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SITE, COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { staggerContainer, staggerItem } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../lib/apiError";

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
  const [progressDocs, setProgressDocs] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    course: "",
    rating: 5,
    text: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const [response, progressResponse, reviewsResponse] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/progress"),
          fetch("/api/reviews/mine"),
        ]);
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        setMyBookings(Array.isArray(data.bookings) ? data.bookings : []);

        const progressData = await progressResponse.json().catch(() => ({}));
        if (!active) return;
        setProgressDocs(
          Array.isArray(progressData.progress) ? progressData.progress : []
        );

        const reviewsData = await reviewsResponse.json().catch(() => ({}));
        if (!active) return;
        setMyReviews(Array.isArray(reviewsData.reviews) ? reviewsData.reviews : []);
        setEligibleCourses(
          Array.isArray(reviewsData.eligibleCourses)
            ? reviewsData.eligibleCourses
            : []
        );
      } catch {
        if (active) {
          setMyBookings([]);
          setProgressDocs([]);
          setMyReviews([]);
          setEligibleCourses([]);
        }
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
  const completedCount = myBookings.filter(
    (booking) => booking.status === "completed"
  ).length;
  const latestCourse = myBookings[0] ? courseName(myBookings[0].course) : "—";

  const reviewedCourses = myReviews.map((review) => review.course);
  const availableReviewCourses = eligibleCourses.filter(
    (course) => !reviewedCourses.includes(course)
  );

  const submitReview = async (event) => {
    event.preventDefault();
    const course = availableReviewCourses.includes(reviewForm.course)
      ? reviewForm.course
      : availableReviewCourses[0];
    if (!course) return;

    const text = reviewForm.text.trim();
    if (text.length < 10) {
      toast.error(t("validation.reviewMin"));
      return;
    }
    if (text.length > 500) {
      toast.error(t("validation.reviewMax"));
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course,
          rating: reviewForm.rating,
          text,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(errorMessage(t, result, "errors.generic"));
        return;
      }

      toast.success(t("review.thankYou"));
      setReviewForm((prev) => ({ ...prev, text: "" }));

      const mine = await fetch("/api/reviews/mine")
        .then((res) => res.json())
        .catch(() => ({}));
      setMyReviews(Array.isArray(mine.reviews) ? mine.reviews : []);
      setEligibleCourses(
        Array.isArray(mine.eligibleCourses) ? mine.eligibleCourses : []
      );
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setSubmittingReview(false);
    }
  };
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
            { label: t("dashboard.classesTaken"), value: String(completedCount) },
            { label: t("dashboard.pendingTrials"), value: String(pending.length) },
            { label: t("dashboard.courseStat"), value: latestCourse },
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

        {/* Course progress */}
        <motion.div
          variants={staggerItem}
          className="mt-8 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10"
        >
          <h2 className="font-hind-siliguri text-lg font-bold text-primary">
            {t("progress.title")}
          </h2>
          <p className="mt-0.5 text-sm text-primary/60">
            {t("progress.subtitle")}
          </p>

          {progressDocs.length === 0 ? (
            <p className="mt-5 rounded-xl bg-secondary p-6 text-center text-sm text-primary/60">
              {t("progress.noCourses")}
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {progressDocs.map((doc) => {
                const percent =
                  doc.totalLessons > 0
                    ? Math.min(
                        100,
                        Math.round((doc.lessonsCompleted / doc.totalLessons) * 100)
                      )
                    : 0;
                return (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-primary/10 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-hind-siliguri font-bold text-primary">
                        {courseName(doc.course)}
                      </span>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {t("progress.status." + doc.status)}
                      </span>
                    </div>

                    {doc.totalLessons > 0 ? (
                      <div className="mt-3 h-2 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    ) : null}

                    <p className="mt-2 text-xs text-primary/60">
                      {t("progress.lessons")}: {doc.lessonsCompleted}/
                      {doc.totalLessons}
                    </p>

                    {doc.currentLesson ? (
                      <p className="mt-2 break-words text-xs text-primary/60">
                        <span className="font-semibold text-primary/80">
                          {t("progress.currentLesson")}:
                        </span>{" "}
                        {doc.currentLesson}
                      </p>
                    ) : null}

                    {doc.lastAssessment ? (
                      <p className="mt-1 break-words text-xs text-primary/50">
                        <span className="font-semibold text-primary/80">
                          {t("progress.lastAssessment")}:
                        </span>{" "}
                        {formatDate(doc.lastAssessment)}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Reviews */}
        <motion.div
          variants={staggerItem}
          className="mt-8 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10"
        >
          <h2 className="font-hind-siliguri text-lg font-bold text-primary">
            {t("review.title")}
          </h2>
          <p className="mt-0.5 text-sm text-primary/60">
            {t("review.subtitle")}
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            {/* Write a review */}
            <div className="rounded-xl bg-secondary p-5">
              <h3 className="text-sm font-bold text-primary">
                {t("review.write")}
              </h3>

              {availableReviewCourses.length === 0 ? (
                <p className="mt-3 text-sm text-primary/60">
                  {t("review.notEligible")}
                </p>
              ) : (
                <form onSubmit={submitReview} className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="review-course"
                      className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                    >
                      {t("booking.courseLabel")}
                    </label>
                    <select
                      id="review-course"
                      value={
                        availableReviewCourses.includes(reviewForm.course)
                          ? reviewForm.course
                          : availableReviewCourses[0]
                      }
                      onChange={(event) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          course: event.target.value,
                        }))
                      }
                      className={`${styles.input} appearance-none`}
                    >
                      {availableReviewCourses.map((course) => (
                        <option key={course} value={course}>
                          {courseName(course)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary/60">
                      {t("review.yourRating")}
                    </span>
                    <div
                      className="flex gap-1 text-xl"
                      role="radiogroup"
                      aria-label={t("review.yourRating")}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={reviewForm.rating === value}
                          aria-label={`${value}`}
                          onClick={() =>
                            setReviewForm((prev) => ({ ...prev, rating: value }))
                          }
                          className={`transition ${
                            value <= reviewForm.rating
                              ? "text-accent"
                              : "text-primary/25 hover:text-primary/50"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="review-text"
                      className="text-xs font-semibold uppercase tracking-wide text-primary/60"
                    >
                      {t("review.yourReview")}
                    </label>
                    <textarea
                      id="review-text"
                      rows={3}
                      maxLength={500}
                      value={reviewForm.text}
                      onChange={(event) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          text: event.target.value,
                        }))
                      }
                      placeholder={t("review.placeholder")}
                      className={styles.input}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className={`${styles.btnAccent} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {submittingReview
                      ? t("review.submitting")
                      : t("review.submit")}
                  </button>
                </form>
              )}
            </div>

            {/* My reviews */}
            <div className="rounded-xl border border-primary/10 p-5">
              {myReviews.length === 0 ? (
                <p className="text-sm text-primary/60">{t("review.empty")}</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {myReviews.map((review) => (
                    <li key={review.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          {courseName(review.course)}
                        </span>
                        <span className="text-sm text-accent">
                          {"★".repeat(review.rating)}
                          <span className="text-primary/30">
                            {"★".repeat(5 - review.rating)}
                          </span>
                        </span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary/70">
                          {review.status === "pending"
                            ? t("review.moderationPending")
                            : review.status === "approved"
                              ? t("review.moderationApproved")
                              : t("review.moderationRejected")}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-primary/60">
                        &ldquo;{review.text}&rdquo;
                      </p>
                      {review.status === "pending" && (
                        <p className="mt-1 text-[11px] text-primary/40">
                          {t("review.pending")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>

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
