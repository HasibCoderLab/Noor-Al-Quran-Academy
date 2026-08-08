"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Camera,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { SITE, COURSES } from "../../data/siteData";
import { styles } from "../../styles/commonStyles";
import { staggerContainer, staggerItem } from "../../lib/animations";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/ui/Avatar";

const courseName = (id) =>
  COURSES.find((course) => course.id === id)?.name || id || "—";

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", country: "", whatsapp: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    setForm({
      name: user.name || "",
      country: user.country || "",
      whatsapp: user.whatsapp || "",
    });
    setAvatarUrl(user.avatar || "");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    fetch("/api/bookings")
      .then((response) => response.json().catch(() => ({})))
      .then((data) => {
        if (active) setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      })
      .catch(() => {
        if (active) setBookings([]);
      });
    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading || !user) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-secondary pt-16">
        <p className="text-sm text-primary/60">Loading…</p>
      </section>
    );
  }

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateUser({
        name: form.name.trim(),
        country: form.country.trim(),
        whatsapp: form.whatsapp.trim(),
        avatar: avatarUrl.trim(),
      });
      if (!result.ok) {
        toast.error(result.error || "Could not update profile. Please try again.");
        return;
      }
      toast.success("Profile updated successfully.");
      setEditOpen(false);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      name: user.name || "",
      country: user.country || "",
      whatsapp: user.whatsapp || "",
    });
    setAvatarUrl(user.avatar || "");
    setEditOpen(false);
  };

  const latestBooking = bookings[0];
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed" || booking.status === "completed"
  ).length;

  const infoItem = (icon, label, value, emptyHint) => (
    <div className="flex items-start gap-3 rounded-xl bg-secondary p-4">
      <span className="mt-0.5 shrink-0 text-primary/50">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary/50">
          {label}
        </p>
        <p
          className={`mt-0.5 break-words text-sm font-semibold ${
            value ? "text-primary" : "text-primary/40 italic"
          }`}
        >
          {value || emptyHint || "—"}
        </p>
      </div>
    </div>
  );

  const sectionCard = "rounded-2xl bg-white p-7 shadow-sm ring-1 ring-primary/10";

  return (
    <section className="relative overflow-hidden bg-secondary pb-20 pt-28 lg:pt-32">
      <div className="pattern-overlay" aria-hidden="true" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={`${styles.container} relative z-10`}
      >
        <div className="mx-auto w-full max-w-4xl">
          {/* Profile hero */}
          <motion.div
            variants={staggerItem}
            className="relative overflow-hidden rounded-3xl bg-primary p-8 text-white shadow-xl sm:p-10"
          >
            <div className="pattern-overlay" aria-hidden="true" />
            <div className="relative z-10 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8 sm:text-start">
              <div className="relative shrink-0">
                <Avatar user={user} size="lg" className="ring-2 ring-accent/60" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-start">
                <h1 className="font-hind-siliguri text-2xl font-bold sm:text-3xl">
                  {user.name}
                </h1>
                <p className="mt-1.5 break-all text-sm text-white/75">
                  {user.email}
                </p>
                {user.country && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/75">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {user.country}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {user.role && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent capitalize ring-1 ring-accent/40">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {user.role}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-white/15">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Member since {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Back to Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Personal information */}
          <motion.div variants={staggerItem} className={`${sectionCard} mt-8`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-hind-siliguri text-lg font-bold text-primary">
                  Personal Information
                </h2>
                <p className="mt-0.5 text-sm text-primary/60">
                  Your basic details used across the academy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen((prev) => !prev)}
                className={`${styles.btnGhost} inline-flex items-center gap-2`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                {editOpen ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {editOpen ? (
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="profile-name"
                      className="text-sm font-semibold text-primary"
                    >
                      Full name
                    </label>
                    <input
                      id="profile-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="e.g. Ahmed Rahman"
                      autoComplete="name"
                      className={styles.input}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="profile-country"
                        className="text-sm font-semibold text-primary"
                      >
                        Country
                      </label>
                      <select
                        id="profile-country"
                        name="country"
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
                      <label
                        htmlFor="profile-whatsapp"
                        className="text-sm font-semibold text-primary"
                      >
                        WhatsApp number
                      </label>
                      <input
                        id="profile-whatsapp"
                        name="whatsapp"
                        type="text"
                        value={form.whatsapp}
                        onChange={set("whatsapp")}
                        placeholder="+8801XXXXXXXXX"
                        autoComplete="tel"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="profile-avatar"
                      className="text-sm font-semibold text-primary"
                    >
                      Profile image URL
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary/50">
                        <Camera className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <input
                        id="profile-avatar"
                        name="avatar"
                        type="url"
                        value={avatarUrl}
                        onChange={(event) => setAvatarUrl(event.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className={styles.input}
                      />
                    </div>
                    <p className="text-xs text-primary/50">
                      Paste a link to an image (e.g. a Google profile photo).
                      Leave empty to use your initials.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`${styles.btnPrimary} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className={styles.btnGhost}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {infoItem(
                  <UserRound className="h-5 w-5" />,
                  "Full name",
                  user.name
                )}
                {infoItem(<Mail className="h-5 w-5" />, "Email", user.email)}
                {infoItem(
                  <MapPin className="h-5 w-5" />,
                  "Country",
                  user.country,
                  "Not set"
                )}
                {infoItem(
                  <MessageCircle className="h-5 w-5" />,
                  "WhatsApp",
                  user.whatsapp,
                  "Not set"
                )}
              </div>
            )}
          </motion.div>

          {/* Learning information */}
          <motion.div variants={staggerItem} className={`${sectionCard} mt-6`}>
            <h2 className="font-hind-siliguri text-lg font-bold text-primary">
              Learning Information
            </h2>
            <p className="mt-0.5 text-sm text-primary/60">
              Your trial requests and academy progress.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {infoItem(
                <BookOpen className="h-5 w-5" />,
                "Course",
                latestBooking ? courseName(latestBooking.course) : "",
                "Not selected yet"
              )}
              {infoItem(
                <GraduationCap className="h-5 w-5" />,
                "Trial Status",
                latestBooking
                  ? latestBooking.status.charAt(0).toUpperCase() +
                    latestBooking.status.slice(1)
                  : "",
                "No trial booked yet"
              )}
              {infoItem(
                <Calendar className="h-5 w-5" />,
                "Classes Taken",
                confirmedCount > 0 ? String(confirmedCount) : "",
                confirmedCount > 0 ? "" : "No completed classes yet"
              )}
              {infoItem(
                <Calendar className="h-5 w-5" />,
                "Next Class",
                latestBooking && latestBooking.time
                  ? `${courseName(latestBooking.course)} · ${latestBooking.day || "TBA"} ${
                      latestBooking.time
                    }`
                  : "",
                "No class scheduled"
              )}
            </div>
          </motion.div>

          {/* Account & security */}
          <motion.div variants={staggerItem} className={`${sectionCard} mt-6`}>
            <h2 className="font-hind-siliguri text-lg font-bold text-primary">
              Account & Security
            </h2>
            <p className="mt-0.5 text-sm text-primary/60">
              Keep your account safe.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {infoItem(
                <Mail className="h-5 w-5" />,
                "Email",
                user.email
              )}
              {infoItem(
                <KeyRound className="h-5 w-5" />,
                "Password",
                "••••••••",
                ""
              )}
              {infoItem(
                <ShieldCheck className="h-5 w-5" />,
                "Session",
                "Active",
                ""
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-secondary p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">
                  Change Password
                </p>
                <p className="mt-0.5 text-xs text-primary/60">
                  Password changes are not available yet.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary/50"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Coming soon
              </button>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={staggerItem}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:justify-between"
          >
            <Link
              href="/free-trial"
              className={`${styles.btnAccent} inline-flex items-center gap-2`}
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Book a Free Trial
            </Link>
            <Link
              href="/"
              className={`${styles.btnGhost} inline-flex items-center gap-2`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Homepage
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
