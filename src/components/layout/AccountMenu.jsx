"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { scaleFade } from "../../lib/animations";

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const firstName = user.name.split(" ")[0];

  if (isDashboard) {
    return (
      <Link
        href="/profile"
        className="flex items-center gap-2 rounded-full p-1.5 transition hover:bg-secondary"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden text-sm font-semibold text-primary sm:inline">
          {firstName}
        </span>
      </Link>
    );
  }

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success("Logged out.");
    router.push("/");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-1.5 transition hover:bg-secondary"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden text-sm font-semibold text-primary sm:inline">
          {firstName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-primary/50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={scaleFade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            role="menu"
            className="absolute end-0 top-full mt-2 w-64 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-primary/10"
          >
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <Avatar user={user} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-primary">
                  {user.name}
                </p>
                <p className="truncate text-xs text-primary/60">{user.email}</p>
              </div>
            </div>

            <div className="my-2 h-px bg-primary/10" />

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary/80 transition hover:bg-secondary hover:text-primary"
            >
              <UserRound className="h-4 w-4 text-primary/50" />
              Profile
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary/80 transition hover:bg-secondary hover:text-primary"
            >
              <LayoutDashboard className="h-4 w-4 text-primary/50" />
              Dashboard
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary/80 transition hover:bg-secondary hover:text-primary"
              >
                <ShieldCheck className="h-4 w-4 text-primary/50" />
                Admin
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
