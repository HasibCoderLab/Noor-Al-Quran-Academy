"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { errorMessage } from "../../lib/apiError";
import PasswordInput from "../../components/auth/PasswordInput";
import { PasswordStrength } from "../../components/auth/PasswordStrength";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirm: "",
  country: "",
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error(t("validation.nameRequired"));
      return;
    }
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
      const response = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        country: form.country,
      });

      if (!response.ok) {
        toast.error(errorMessage(t, response, "auth.registerFailed"));
        return;
      }

      toast.success(
        t("auth.accountCreated", { name: response.user.name.split(" ")[0] })
      );
      if (response.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(response.user.email)}`);
      } else {
        router.push("/login");
      }
    } catch {
      toast.error(t("errors.network"));
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
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl leading-none">🌙</span>
              <h1 className="font-hind-siliguri mt-4 text-2xl font-bold text-primary">
                {t("auth.createAccount")}
              </h1>
              <p className="mt-1 text-sm text-primary/60">
                {t("auth.registerSubtitle", { app: SITE.name })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-primary">
                  {t("common.fullName")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Ahmed Rahman"
                  autoComplete="name"
                  className={styles.input}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-primary">
                  {t("common.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={styles.input}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="country" className="text-sm font-semibold text-primary">
                  {t("common.country")}
                </label>
                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={set("country")}
                  className={`${styles.input} appearance-none`}
                >
                  <option value="">{t("booking.selectCountry")}</option>
                  {SITE.targetCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <PasswordInput
                  id="password"
                  label={t("auth.password")}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <PasswordStrength password={form.password} />
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
                className={`${styles.btnPrimary} mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {submitting ? t("auth.creatingAccount") : t("auth.register")}
              </button>
            </form>

            <div className="mt-6 border-t border-primary/10 pt-5 text-center text-sm text-primary/60">
              {t("auth.haveAccount")}{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-accent">
                {t("nav.login")}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
