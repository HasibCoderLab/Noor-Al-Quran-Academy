"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { styles } from "../../styles/commonStyles";
import { auth } from "../../lib/auth";
import { errorMessage } from "../../lib/apiError";
import PasswordInput from "../auth/PasswordInput";

const initialForm = { current: "", next: "", confirm: "" };

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.next.length < 8) {
      toast.error(t("validation.passwordMin"));
      return;
    }
    if (form.next !== form.confirm) {
      toast.error(t("validation.passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await auth.changePassword({
        currentPassword: form.current,
        newPassword: form.next,
      });
      if (!result.ok) {
        toast.error(errorMessage(t, result, "errors.generic"));
        return;
      }
      toast.success(t("auth.changePasswordSuccess"));
      setForm(initialForm);
      setOpen(false);
    } catch {
      toast.error(t("errors.network"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-secondary p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">
            {t("auth.changePassword")}
          </p>
          <p className="mt-0.5 text-xs text-primary/60">
            {t("auth.changePasswordHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          {t("auth.changePassword")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-4 rounded-xl bg-secondary p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">
          {t("auth.changePassword")}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-primary/50 hover:text-primary"
        >
          {t("common.cancel")}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          id="currentPassword"
          label={t("auth.currentPassword")}
          value={form.current}
          onChange={set("current")}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          id="newPassword"
          label={t("auth.newPassword")}
          value={form.next}
          onChange={set("next")}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <PasswordInput
          id="confirmPassword"
          label={t("auth.confirmPassword")}
          value={form.confirm}
          onChange={set("confirm")}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
        {form.confirm &&
          (form.next === form.confirm ? (
            <p className="text-xs font-semibold text-emerald-600">
              {t("auth.passwordsMatch")}
            </p>
          ) : (
            <p className="text-xs font-semibold text-red-500">
              {t("auth.passwordsNoMatch")}
            </p>
          ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${styles.btnPrimary} w-full disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {submitting ? t("common.saving") : t("auth.changePasswordSubmit")}
      </button>
    </form>
  );
}
