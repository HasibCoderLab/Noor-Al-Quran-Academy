"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { auth } from "../../lib/auth";
import { errorMessage } from "../../lib/apiError";
import PasswordInput from "../../components/auth/PasswordInput";

function ResetPasswordContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const hasLink = Boolean(token && email);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password.length < 8) {
      toast.error(t("validation.passwordMin"));
      return;
    }
    if (form.password !== form.confirm) {
      toast.error(t("validation.passwordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await auth.resetPassword({
        token,
        email,
        password: form.password,
      });
      if (result.ok) {
        setDone(true);
        toast.success(t("auth.resetSuccess"));
      } else {
        toast.error(errorMessage(t, result, "errors.invalidToken"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={slideFromBottom}
        initial="hidden"
        animate="visible"
        className={`${styles.container} relative z-10`}
      >
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-primary/10">
            {!hasLink ? (
              <>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl leading-none">🔑</span>
                  <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
                    {t("auth.resetInvalidTitle")}
                  </h1>
                  <p className="mt-2 text-sm text-primary/60">
                    {t("auth.resetInvalidBody")}
                  </p>
                </div>
                <Link
                  href="/forgot-password"
                  className={`${styles.btnPrimary} mt-6 inline-flex w-full`}
                >
                  {t("auth.requestNewLink")}
                </Link>
              </>
            ) : done ? (
              <>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl leading-none">✅</span>
                  <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
                    {t("auth.resetSuccessTitle")}
                  </h1>
                  <p className="mt-2 text-sm text-primary/60">
                    {t("auth.resetSuccess")}
                  </p>
                </div>
                <Link
                  href="/login"
                  className={`${styles.btnPrimary} mt-6 inline-flex w-full`}
                >
                  {t("auth.login")}
                </Link>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center">
                  <span className="text-3xl leading-none">🌙</span>
                  <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
                    {t("auth.resetTitle")}
                  </h1>
                  <p className="mt-1 text-sm text-primary/60">
                    {t("auth.resetSubtitle")}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <PasswordInput
                      id="password"
                      label={t("auth.newPassword")}
                      value={form.password}
                      onChange={set("password")}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <PasswordInput
                      id="confirm"
                      label={t("auth.confirmPassword")}
                      value={form.confirm}
                      onChange={set("confirm")}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                    {form.confirm &&
                      (form.password === form.confirm ? (
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
                    {submitting ? t("auth.sending") : t("auth.resetSubmit")}
                  </button>
                </form>

                <div className="mt-6 border-t border-primary/10 pt-5 text-center text-sm text-primary/60">
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:text-accent"
                  >
                    {t("auth.forgotBackToLogin")}
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-primary/40">
            {SITE.shortName}
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
