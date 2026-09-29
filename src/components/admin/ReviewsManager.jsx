"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { styles } from "../../styles/commonStyles";
import { COURSES } from "../../data/siteData";
import { errorMessage } from "../../lib/apiError";

const FILTERS = ["pending", "approved", "rejected"];

const courseName = (id) =>
  COURSES.find((course) => course.id === id)?.name || id;

const statusLabelKey = {
  pending: "review.moderationPending",
  approved: "review.moderationApproved",
  rejected: "review.moderationRejected",
};

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};

export default function ReviewsManager() {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(
    async (currentFilter) => {
      setLoading(true);
      try {
        const query = currentFilter ? `?status=${currentFilter}` : "";
        const res = await fetch(`/api/admin/reviews${query}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        else toast.error(errorMessage(t, data, "errors.generic"));
      } catch {
        toast.error(t("errors.network"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const setStatus = async (id, status) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(errorMessage(t, data, "errors.generic"));
        return;
      }
      toast.success(
        t(status === "approved" ? "admin.reviews.approved" : "admin.reviews.rejected")
      );
      await load(filter);
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setBusyId("");
    }
  };

  const formatDate = (value) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return "";
    }
  };

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10 sm:p-7">
      <div>
        <h2 className="font-hind-siliguri text-lg font-bold text-primary">
          {t("admin.reviews.title")}
        </h2>
        <p className="mt-0.5 text-sm text-primary/60">
          {t("admin.reviews.subtitle")}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            filter === ""
              ? "bg-primary text-white shadow-sm"
              : "bg-secondary text-primary/70 hover:text-primary"
          }`}
        >
          {t("common.all")}
        </button>
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === value
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary text-primary/70 hover:text-primary"
            }`}
          >
            {t(statusLabelKey[value])}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-primary/60">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t("common.loading")}
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-6 rounded-xl bg-secondary p-8 text-center text-sm text-primary/60">
          {t("admin.reviews.empty")}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-primary/10 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-primary">
                      {review.name}
                    </span>
                    {review.country ? (
                      <span className="text-xs text-primary/50">
                        {review.country}
                      </span>
                    ) : null}
                    <span className="text-xs font-semibold text-accent">
                      {"★".repeat(review.rating)}
                      <span className="text-primary/30">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary/70">
                      {courseName(review.course)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        statusStyles[review.status] || "bg-secondary"
                      }`}
                    >
                      {t(statusLabelKey[review.status])}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-primary/75">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <p className="mt-1.5 text-xs text-primary/40">
                    {formatDate(review.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {review.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => setStatus(review.id, "approved")}
                      disabled={Boolean(busyId)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyId === review.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {t("admin.reviews.approve")}
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => setStatus(review.id, "rejected")}
                      disabled={Boolean(busyId)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyId === review.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {t("admin.reviews.reject")}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
