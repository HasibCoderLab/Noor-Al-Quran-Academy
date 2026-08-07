"use client";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";

const Spinner = ({ className = "h-5 w-5" }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const buttonBase =
  "inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm";

const buttonStyles = {
  google: "border-primary/15 bg-white text-primary hover:bg-secondary",
  facebook: "border-primary/15 bg-white text-primary hover:bg-secondary",
  apple: "border-primary/15 bg-white text-primary hover:bg-secondary",
};

export default function SocialLogin({ onGoogle, onFacebook, onApple, loading = "" }) {
  const isBusy = Boolean(loading);

  const providers = [
    {
      id: "google",
      label: "Google",
      icon: <FcGoogle className="h-5 w-5" aria-hidden="true" />,
      onClick: onGoogle,
      // TODO:
      // Connect Google OAuth (Auth.js `signIn("google")` or custom /api/auth/google)
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: <FaFacebook className="h-5 w-5 text-[#1877F2]" aria-hidden="true" />,
      onClick: onFacebook,
      // TODO:
      // Connect Facebook OAuth (Auth.js `signIn("facebook")` or custom /api/auth/facebook)
    },
    {
      id: "apple",
      label: "Apple",
      icon: <FaApple className="h-5 w-5" aria-hidden="true" />,
      onClick: onApple,
      // TODO:
      // Connect Apple Sign In (Auth.js `signIn("apple")` or custom /api/auth/apple)
    },
  ];

  const handleClick = (provider) => (event) => {
    if (isBusy) return;
    if (provider.onClick) {
      provider.onClick(event);
    }
  };

  return (
    <div>
      {/* Divider */}
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-primary/10" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wider text-primary/50">
          or
        </span>
        <span className="h-px flex-1 bg-primary/10" aria-hidden="true" />
      </div>

      {/* Provider buttons */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {providers.map((provider) => {
          const isLoading = loading === provider.id;
          return (
            <button
              key={provider.id}
              type="button"
              disabled={isBusy}
              onClick={handleClick(provider)}
              aria-label={provider.label}
              className={`${buttonBase} ${buttonStyles[provider.id]}`}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                provider.icon
              )}
              <span className="hidden sm:inline">{provider.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
