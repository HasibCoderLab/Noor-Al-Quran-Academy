"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Loader2, Plus, RefreshCw, Trash2, Ban, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { styles } from "../../styles/commonStyles";
import { errorMessage } from "../../lib/apiError";

const DURATIONS = [30, 45, 60];

function toLocalDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const stateStyles = {
  available: "bg-emerald-100 text-emerald-700",
  booked: "bg-primary/10 text-primary",
  blocked: "bg-amber-100 text-amber-700",
};

export default function AvailabilityManager() {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState(() => toLocalDateValue(new Date()));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ time: "09:00", duration: "30" });

  const loadSlots = useCallback(async (targetDate) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/availability?from=${encodeURIComponent(targetDate)}&to=${encodeURIComponent(targetDate)}`
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) setSlots(Array.isArray(data.slots) ? data.slots : []);
      else toast.error(errorMessage(t, data, "admin.error.loadFailed"));
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSlots(date);
  }, [date, loadSlots]);

  const handleAdd = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          times: [form.time],
          duration: Number(form.duration),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(t("admin.availability.created"));
        setSlots(data.slots || []);
      } else {
        toast.error(errorMessage(t, data, "admin.error.updateFailed"));
      }
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/availability/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: date, days: 7 }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(t("admin.availability.created"));
        loadSlots(date);
      } else {
        toast.error(errorMessage(t, data, "admin.error.updateFailed"));
      }
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const handleToggleBlock = async (slot) => {
    const nextStatus = slot.status === "blocked" ? "available" : "blocked";
    setBusy(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slot.id, status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(
          nextStatus === "blocked"
            ? t("admin.availability.blocked")
            : t("admin.availability.created")
        );
        loadSlots(date);
      } else {
        toast.error(errorMessage(t, data, "admin.error.updateFailed"));
      }
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (slot) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/availability/${slot.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(t("admin.availability.deleted"));
        setSlots((prev) => prev.filter((item) => item.id !== slot.id));
      } else {
        toast.error(errorMessage(t, data, "admin.error.updateFailed"));
      }
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setBusy(false);
    }
  };

  const displayDate = (() => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${date}T12:00:00`));
    } catch {
      return date;
    }
  })();

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-primary/10 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-hind-siliguri text-lg font-bold text-primary">
            {t("admin.availability.title")}
          </h2>
          <p className="mt-0.5 text-sm text-primary/60">
            {t("admin.availability.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Calendar className="h-4 w-4 text-primary/50" aria-hidden="true" />
            <input
              type="date"
              value={date}
              min={toLocalDateValue(new Date())}
              onChange={(event) => setDate(event.target.value)}
              className={`${styles.input} w-auto`}
              aria-label={t("admin.availability.date")}
            />
          </label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t("admin.availability.generate")}
          </button>
        </div>
      </div>

      {/* Add slot */}
      <form
        onSubmit={handleAdd}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl bg-secondary p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slot-time" className="text-xs font-semibold uppercase tracking-wide text-primary/60">
            {t("admin.availability.time")}
          </label>
          <input
            id="slot-time"
            type="time"
            value={form.time}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, time: event.target.value }))
            }
            className={`${styles.input} w-auto`}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slot-duration" className="text-xs font-semibold uppercase tracking-wide text-primary/60">
            {t("admin.availability.duration")}
          </label>
          <select
            id="slot-duration"
            value={form.duration}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, duration: event.target.value }))
            }
            className={`${styles.input} w-auto appearance-none`}
          >
            {DURATIONS.map((duration) => (
              <option key={duration} value={String(duration)}>
                {duration} min
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className={`${styles.btnPrimary} inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("admin.availability.add")}
        </button>
      </form>

      {/* Slot list */}
      <p className="mt-5 text-sm font-semibold text-primary">{displayDate}</p>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-primary/60">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t("common.loading")}
        </div>
      ) : slots.length === 0 ? (
        <p className="mt-4 rounded-xl bg-secondary p-6 text-center text-sm text-primary/60">
          {t("admin.availability.empty")}
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-4"
            >
              <div className="min-w-0">
                <p className="font-hind-siliguri text-base font-bold text-primary">
                  {slot.time}
                  <span className="ms-2 text-xs font-semibold text-primary/50">
                    {slot.duration} min
                  </span>
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    stateStyles[slot.status] || stateStyles.available
                  }`}
                >
                  {t(`admin.availability.state.${slot.status}`)}
                </span>
                {slot.booking && (
                  <p className="mt-1 truncate text-xs text-primary/60">
                    {slot.booking.name}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {slot.status !== "booked" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(slot)}
                      disabled={busy}
                      title={
                        slot.status === "blocked"
                          ? t("admin.availability.unblock")
                          : t("admin.availability.block")
                      }
                      aria-label={
                        slot.status === "blocked"
                          ? t("admin.availability.unblock")
                          : t("admin.availability.block")
                      }
                      className="rounded-lg p-2 text-primary/50 transition hover:bg-white hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {slot.status === "blocked" ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(slot)}
                      disabled={busy}
                      title={t("admin.availability.remove")}
                      aria-label={t("admin.availability.remove")}
                      className="rounded-lg p-2 text-primary/50 transition hover:bg-white hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
