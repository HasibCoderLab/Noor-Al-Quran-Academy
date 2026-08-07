"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import { auth } from "../../lib/auth";
import SocialLogin from "../../components/auth/SocialLogin";

const handleOAuth = (provider) => {
  console.log(`${provider} OAuth`);
};

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirm: "",
  country: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const result = auth.register({
        name: form.name,
        email: form.email,
        password: form.password,
        country: form.country,
      });
      setSubmitting(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Account created. Welcome, ${result.user.name.split(" ")[0]}!`);
      router.push("/dashboard");
    }, 400);
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
                Create your account
              </h1>
              <p className="mt-1 text-sm text-primary/60">
                Join {SITE.name} and start learning the Quran
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-primary">
                  Full name
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

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-primary">
                  Email
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

              <div className="flex flex-col gap-1.5">
                <label htmlFor="country" className="text-sm font-semibold text-primary">
                  Country
                </label>
                <select
                  id="country"
                  value={form.country}
                  onChange={set("country")}
                  className={`${styles.input} appearance-none`}
                >
                  <option value="">Select country</option>
                  {SITE.targetCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-primary">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 6 characters"
                  className={styles.input}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="text-sm font-semibold text-primary">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Repeat your password"
                  className={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`${styles.btnPrimary} mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {submitting ? "Creating account…" : "Register"}
              </button>
            </form>

            <div className="mt-7">
              <SocialLogin
                onGoogle={() => handleOAuth("Google")}
                onFacebook={() => handleOAuth("Facebook")}
                onApple={() => handleOAuth("Apple")}
              />
            </div>

            <div className="mt-6 border-t border-primary/10 pt-5 text-center text-sm text-primary/60">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:text-accent">
                Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
