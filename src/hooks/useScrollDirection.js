"use client";

import { useEffect, useRef, useState } from "react";

const THRESHOLD = 8;

export function useScrollDirection() {
  const [scrollDir, setScrollDir] = useState("up");
  const [isAtTop, setIsAtTop] = useState(true);

  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);
  const rafId = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        const y = window.scrollY;
        const delta = y - lastY.current;
        lastY.current = y;

        setIsAtTop(y <= 0);

        if (Math.abs(delta) < THRESHOLD) return;

        setScrollDir(delta > 0 ? "down" : "up");
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return { scrollDir, isAtTop };
}
