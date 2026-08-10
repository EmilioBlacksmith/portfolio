"use client";

import { useEffect, useState, type ReactNode } from "react";

export function ScrollScrim({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color] duration-300 ${
        scrolled ? "border-steel/30 bg-ink/85" : "border-transparent bg-ink/70"
      }`}
    >
      {children}
    </header>
  );
}
