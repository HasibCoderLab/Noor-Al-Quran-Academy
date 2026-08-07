"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "#1B4332",
          color: "#D4AF37",
        },
      }}
    />
  );
}
