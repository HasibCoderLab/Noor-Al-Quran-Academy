"use client";

import { useState } from "react";

const getInitials = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function getAvatarSource(user) {
  if (!user) return "";
  return user.avatar || user.image || user.picture || "";
}

export default function Avatar({ user, size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);
  const src = getAvatarSource(user);
  const showImage = Boolean(src) && !imgError;

  const base = `inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden ${
    SIZES[size] || SIZES.md
  } ${className}`;

  if (showImage) {
    return (
      <img
        src={src}
        alt={user?.name || "User avatar"}
        onError={() => setImgError(true)}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${base} bg-gradient-to-br from-primary via-emerald-800 to-primary font-bold text-accent ring-1 ring-accent/40`}
    >
      {getInitials(user?.name)}
    </span>
  );
}
