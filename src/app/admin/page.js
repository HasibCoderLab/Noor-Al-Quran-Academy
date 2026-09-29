"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  GraduationCap,
  Mail,
  MessageSquare,
  Phone,
  Search,
  ShieldAlert,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { scaleFade } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const PAGE_SIZE = 20;

const courseName = (id) =>
  COURSES.find((course) => course.id === id)?.name || id || "—";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-red-100 text-red-600",
};

const initialFilters = { status: "", search: "", page: 1 };

function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || "bg-secondary text-primary/70"
      }`}
    >
      {label || status}
    </span>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <motion.div
      variants={scaleFade}
      initial="hidden"
      animate="visible"
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-hind-siliguri text-3xl font-bold text-primary">
            {value}
          </p>
          <p className="mt-0.5 text-sm text-primary/60">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, tone, onConfirm, onClose }) {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={scaleFade}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="font-hind-siliguri text-lg font-bold text-primary">
          {title}
        </h3>
        <p className="mt-2 text-sm text-primary/70">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`${styles.btnGhost} flex-1`}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${
              tone === "danger"
                ? "inline-flex flex-1 items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                : `${styles.btnPrimary} flex-1`
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BookingDetailModal({ booking, onClose }) {
  const { t } = useTranslation();
  if (!booking) return null;

  const details = [
    { icon: <UserRound className="h-4 w-4" />, label: t("common.student"), value: booking.name },
    { icon: <Mail className="h-4 w-4" />, label: t("common.email"), value: booking.email },
    { icon: <Phone className="h-4 w-4" />, label: t("common.whatsapp"), value: booking.whatsapp },
    { icon: <Globe className="h-4 w-4" />, label: t("common.country"), value: booking.country || "—" },
    { icon: <GraduationCap className="h-4 w-4" />, label: t("common.course"), value: courseName(booking.course) },
    { icon: <Clock className="h-4 w-4" />, label: t("admin.detail.preferredTime"), value: `${booking.time || "—"} ${booking.day ? `(${booking.day})` : ""} ${t("common.dhakaTime")}` },
    { icon: <Clock className="h-4 w-4" />, label: t("common.duration"), value: t("common.min", { count: booking.duration || 30 }) },
    { icon: <ShieldAlert className="h-4 w-4" />, label: t("common.status"), value: t("booking.status." + booking.status) },
  ];

  return (
    <motion.div
      variants={scaleFade}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("admin.detail.title")}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-hind-siliguri text-lg font-bold text-primary">
              {t("admin.detail.title")}
            </h3>
            <p className="mt-0.5 text-xs text-primary/50">
              {t("admin.detail.created", { date: formatDateTime(booking.createdAt) })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="rounded-full p-2 text-primary/60 transition hover:bg-secondary hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          {details.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl bg-secondary p-3.5"
            >
              <span className="mt-0.5 shrink-0 text-primary/50">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/50">
                  {item.label}
                </p>
                <p className="mt-0.5 break-words text-sm font-semibold text-primary">
                  {item.value}
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3 rounded-xl bg-secondary p-3.5">
            <span className="mt-0.5 shrink-0 text-primary/50">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/50">
                {t("common.message")}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-primary">
                {booking.message || "—"}
              </p>
            </div>
          </div>

          {booking.user && (
            <div className="flex items-start gap-3 rounded-xl bg-accent/10 p-3.5 ring-1 ring-accent/30">
              <span className="mt-0.5 shrink-0 text-accent">
                <UserRound className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {t("admin.detail.registeredAccount")}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-primary">
                  {booking.user.name || "—"}
                </p>
                <p className="break-all text-xs text-primary/60">
                  {booking.user.email || "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BookingRow({ booking, onView, onAction }) {
  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {booking.status === "pending" && (
        <button
          type="button"
          onClick={() => onAction("confirm")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
        >
          <Check className="h-3.5 w-3.5" />
          {t("admin.action.confirm")}
        </button>
      )}
      {(booking.status === "pending" || booking.status === "confirmed") && (
        <button
          type="button"
          onClick={() => onAction("cancel")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" />
          {t("admin.action.reject")}
        </button>
      )}
      {booking.status === "confirmed" && (
        <button
          type="button"
          onClick={() => onAction("complete")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-secondary"
        >
          <Check className="h-3.5 w-3.5" />
          {t("admin.action.complete")}
        </button>
      )}
      <button
        type="button"
        onClick={onView}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary/60 transition hover:bg-secondary hover:text-primary"
      >
        {t("admin.action.view")}
      </button>
    </div>
  );

  return (
    <tr className="border-b border-primary/5 last:border-0 hover:bg-secondary/50">
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-primary">{booking.name}</span>
          <span className="break-all text-xs text-primary/50">{booking.email}</span>
          <span className="text-xs text-primary/50">{booking.whatsapp}</span>
        </div>
      </td>
      <td className="hidden px-4 py-4 text-sm text-primary/70 lg:table-cell">
        {booking.country || "—"}
      </td>
      <td className="hidden px-4 py-4 text-sm font-semibold text-primary md:table-cell">
        {courseName(booking.course)}
      </td>
      <td className="hidden px-4 py-4 text-sm text-primary/70 md:table-cell">
        {booking.time || "—"}
        {booking.day ? <span className="block text-xs text-primary/40">{booking.day}</span> : null}
      </td>
      <td className="hidden px-4 py-4 text-sm text-primary/70 sm:table-cell">
        {booking.duration} min
      </td>
      <td className="hidden px-4 py-4 text-xs text-primary/50 sm:table-cell">
        {formatDate(booking.createdAt)}
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex flex-col items-start gap-2">
          <StatusBadge status={booking.status} label={t("booking.status." + booking.status)} />
          {controls}
        </div>
      </td>
    </tr>
  );
}

function BookingCard({ booking, onView, onAction }) {
  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      {booking.status === "pending" && (
        <button
          type="button"
          onClick={() => onAction("confirm")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
        >
          <Check className="h-3.5 w-3.5" />
          {t("admin.action.confirm")}
        </button>
      )}
      {(booking.status === "pending" || booking.status === "confirmed") && (
        <button
          type="button"
          onClick={() => onAction("cancel")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" />
          {t("admin.action.reject")}
        </button>
      )}
      {booking.status === "confirmed" && (
        <button
          type="button"
          onClick={() => onAction("complete")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-secondary"
        >
          <Check className="h-3.5 w-3.5" />
          {t("admin.action.complete")}
        </button>
      )}
      <button
        type="button"
        onClick={onView}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary/60 transition hover:bg-secondary hover:text-primary"
      >
        {t("admin.action.view")}
      </button>
    </div>
  );

  return (
    <li className="rounded-2xl border border-primary/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-primary">{booking.name}</p>
          <p className="break-all text-xs text-primary/50">{booking.email}</p>
          <p className="text-xs text-primary/50">{booking.whatsapp}</p>
        </div>
        <StatusBadge status={booking.status} label={t("booking.status." + booking.status)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-primary/60">
        <span className="font-semibold text-primary">{courseName(booking.course)}</span>
        <span>{booking.duration} min</span>
        <span>{booking.time || "—"} Dhaka</span>
        {booking.country ? <span>{booking.country}</span> : null}
        <span>{formatDate(booking.createdAt)}</span>
      </div>
      <div className="mt-3">{controls}</div>
    </li>
  );
}

export default function AdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [acting, setActing] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const isAdmin = user?.role === "admin";

  const loadOverview = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/overview");
      const data = await response.json().catch(() => ({}));
      if (response.ok) setOverview(data.overview);
    } catch {
      setOverview(null);
    }
  }, []);

  const loadBookings = useCallback(async (current) => {
    setLoadingList(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (current.status) params.set("status", current.status);
      if (current.search) params.set("search", current.search);
      params.set("page", String(current.page));
      params.set("pageSize", String(PAGE_SIZE));

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      const data = await response.json().catch(() => ({}));

      if (response.status === 403 || response.status === 401) {
        setError(t("admin.error.unauthorized"));
        setBookings([]);
        setTotal(0);
        return;
      }
      if (!response.ok) {
        setError(data.error || t("admin.error.loadFailed"));
        setBookings([]);
        setTotal(0);
        return;
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setError(t("errors.network"));
      setBookings([]);
      setTotal(0);
    } finally {
      setLoadingList(false);
    }
  }, [t]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      return;
    }
    loadOverview();
    loadBookings(filters);
  }, [isLoading, user, router, loadOverview, loadBookings, filters]);

  const applyFilters = (patch) => {
    const next = { ...filters, ...patch, page: patch.page || 1 };
    setFilters(next);
    loadBookings(next);
  };

  const runAction = async (bookingId, status) => {
    if (acting) return;
    setActing(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t("admin.error.updateFailed"));
      }
      await loadBookings();
      await loadOverview();
      setDetail(null);
    } catch (err) {
      setError(err.message || t("admin.error.updateFailed"));
    } finally {
      setActing(false);
      setPendingAction(null);
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-secondary pt-16">
        <p className="text-sm text-primary/60">{t("common.loading")}</p>
      </section>
    );
  }

  if (user && !isAdmin) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
        <div className="pattern-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-md px-4 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </span>
          <h1 className="font-hind-siliguri mt-6 text-2xl font-bold text-primary">
            {t("admin.accessDenied")}
          </h1>
          <p className="mt-2 text-sm text-primary/60">
            {t("admin.accessDeniedBody")}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard" className={styles.btnPrimary}>
              {t("admin.goToDashboard")}
            </Link>
            <Link href="/" className={styles.btnGhost}>
              {t("nav.home")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-secondary pt-16">
        <p className="text-sm text-primary/60">{t("common.redirecting")}</p>
      </section>
    );
  }

  const statCards = [
    { key: "students", label: t("admin.totalStudents"), value: overview?.totalStudents ?? 0, icon: <Users className="h-5 w-5" /> },
    { key: "pending", label: t("admin.pendingTrials"), value: overview?.pending ?? 0, icon: <Clock className="h-5 w-5" /> },
    { key: "confirmed", label: t("admin.confirmedClasses"), value: overview?.confirmed ?? 0, icon: <Check className="h-5 w-5" /> },
    { key: "completed", label: t("admin.completedClasses"), value: overview?.completed ?? 0, icon: <GraduationCap className="h-5 w-5" /> },
  ];

  const confirmMeta = {
    confirm: {
      title: t("admin.dialog.confirmTitle"),
      message: t("admin.dialog.confirmBody", { name: pendingAction?.name }),
      confirmLabel: t("admin.action.confirm"),
      tone: "primary",
    },
    cancel: {
      title: t("admin.dialog.cancelTitle"),
      message: t("admin.dialog.cancelBody", { name: pendingAction?.name }),
      confirmLabel: t("admin.action.reject"),
      tone: "danger",
    },
    complete: {
      title: t("admin.dialog.completeTitle"),
      message: t("admin.dialog.completeBody", { name: pendingAction?.name }),
      confirmLabel: t("admin.action.complete"),
      tone: "primary",
    },
  }[pendingAction?.nextStatus || ""];

  return (
    <section className="relative min-h-screen overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <div className={`${styles.container} relative z-10`}>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className={styles.badgeGold}>{t("admin.badge")}</span>
            <h1 className="font-hind-siliguri mt-3 text-2xl font-bold text-primary sm:text-3xl">
              {t("admin.title")}
            </h1>
            <p className="mt-1 text-sm text-primary/60">
              {t("admin.subtitle")}
            </p>
          </div>
          <Link href="/dashboard" className={styles.btnGhost}>
            {t("admin.backToDashboard")}
          </Link>
        </div>

        {/* Overview cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <StatCard
              key={stat.key}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>

        {/* Booking management */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10 sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-hind-siliguri text-lg font-bold text-primary">
                {t("admin.trialRequests")}
              </h2>
              <p className="mt-0.5 text-sm text-primary/60">
                {t("common.requestCount", { count: total })}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyFilters({ search: searchInput.trim() });
                  }}
                  placeholder={t("admin.searchPlaceholder")}
                  aria-label={t("admin.searchAria")}
                  className={`${styles.input} w-full ps-10 sm:w-64`}
                />
              </div>
              <button
                type="button"
                onClick={() => applyFilters({ search: searchInput.trim() })}
                className={styles.btnPrimary}
              >
                {t("common.search")}
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { value: "", label: t("common.all") },
              ...STATUSES.map((status) => ({
                value: status,
                label: t("booking.status." + status),
              })),
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => applyFilters({ status: tab.value })}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  filters.status === tab.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-secondary text-primary/70 hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error state */}
          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loadingList && !error ? (
            <div className="mt-6 flex flex-col gap-3">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-secondary"
                />
              ))}
            </div>
          ) : null}

          {/* Empty state */}
          {!loadingList && !error && bookings.length === 0 ? (
            <div className="mt-6 rounded-xl bg-secondary p-10 text-center">
              <p className="text-3xl">🌙</p>
              <p className="mt-3 text-sm font-semibold text-primary/70">
                {filters.status || filters.search
                  ? t("admin.emptyFiltered")
                  : t("admin.empty")}
              </p>
              <p className="mt-1 text-xs text-primary/50">
                {filters.status || filters.search
                  ? t("admin.emptyFilteredHint")
                  : t("admin.emptyHint")}
              </p>
            </div>
          ) : null}

          {/* Bookings list */}
          {!loadingList && !error && bookings.length > 0 ? (
            <>
              <div className="mt-6 hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-start">
                  <thead>
                    <tr className="border-b border-primary/10 text-start text-xs font-bold uppercase tracking-wider text-primary/50">
                      <th className="px-4 py-3 text-start">{t("admin.table.student")}</th>
                      <th className="hidden px-4 py-3 text-start lg:table-cell">{t("admin.table.country")}</th>
                      <th className="hidden px-4 py-3 text-start md:table-cell">{t("admin.table.course")}</th>
                      <th className="hidden px-4 py-3 text-start md:table-cell">{t("admin.table.preferredTime")}</th>
                      <th className="hidden px-4 py-3 text-start sm:table-cell">{t("admin.table.duration")}</th>
                      <th className="hidden px-4 py-3 text-start sm:table-cell">{t("admin.table.created")}</th>
                      <th className="px-4 py-3 text-start">{t("admin.table.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        onView={() => setDetail(booking)}
                        onAction={(nextStatus) =>
                          setPendingAction({ id: booking.id, name: booking.name, nextStatus })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="mt-4 flex flex-col gap-3 md:hidden">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onView={() => setDetail(booking)}
                    onAction={(nextStatus) =>
                      setPendingAction({ id: booking.id, name: booking.name, nextStatus })
                    }
                  />
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-primary/10 pt-5">
                  <button
                    type="button"
                    disabled={filters.page <= 1}
                    onClick={() => applyFilters({ page: filters.page - 1 })}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-primary transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("common.previous")}
                  </button>
                  <span className="text-sm text-primary/60">
                    {t("common.pageOf", { page: filters.page, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    disabled={filters.page >= totalPages}
                    onClick={() => applyFilters({ page: filters.page + 1 })}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-primary transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("common.next")}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {detail && <BookingDetailModal booking={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmMeta && (
          <ConfirmDialog
            title={confirmMeta.title}
            message={confirmMeta.message}
            confirmLabel={confirmMeta.confirmLabel}
            tone={confirmMeta.tone}
            onClose={() => setPendingAction(null)}
            onConfirm={() => runAction(pendingAction.id, pendingAction.nextStatus)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
