"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { SITE } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { slideFromBottom } from "../../lib/animations";
import SocialLogin from "../../components/auth/SocialLogin";
import PasswordInput from "../../components/auth/PasswordInput";
import { useAuth } from "../../context/AuthContext";

const handleOAuth = (provider) => {
  console.log(`${provider} OAuth`);
};

const DEMO_ACCOUNT = {
  email: "demo.student@noor-academy.test",
  password: "NoorDemo@2026!",
};

const isDemoMode = process.env.NODE_ENV !== "production";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const fillDemoAccount = () => {
    setForm({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password });
    toast.success("Demo account filled. Press Login to continue.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!response.ok) {
        toast.error(response.error || "Login failed. Please try again.");
        return;
      }

      toast.success(`Welcome back, ${response.user.name.split(" ")[0]}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Network error. Please try again.");
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
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-primary/60">
                Login to your {SITE.shortName} student account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-primary">
                  Email
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
                <PasswordInput
                  id="password"
                  label="Password"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toast.info("Password reset will be available soon.")}
                  className="text-sm font-semibold text-primary/60 transition hover:text-accent"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`${styles.btnPrimary} mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {submitting ? "Logging in…" : "Login"}
              </button>
            </form>

            {isDemoMode && (
              <div className="mt-5 rounded-xl border border-dashed border-accent/50 bg-accent/5 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  Demo Account
                </p>
                <p className="mt-1 break-all text-xs text-primary/70">
                  Email: {DEMO_ACCOUNT.email}
                </p>
                <p className="break-all text-xs text-primary/70">
                  Password: {DEMO_ACCOUNT.password}
                </p>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className={`${styles.btnAccent} mt-3 w-full`}
                >
                  Use Demo Account
                </button>
              </div>
            )}

            <div className="mt-7">
              <SocialLogin
                onGoogle={() => handleOAuth("Google")}
                onFacebook={() => handleOAuth("Facebook")}
                onApple={() => handleOAuth("Apple")}
              />
            </div>

            <div className="mt-6 border-t border-primary/10 pt-5 text-center text-sm text-primary/60">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:text-accent">
                Register free
              </Link>
            </div>

            <div className="mt-3 text-center">
              <Link href="/free-trial" className="text-xs font-semibold text-primary/50 hover:text-accent">
                No account needed — book a free trial class
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
