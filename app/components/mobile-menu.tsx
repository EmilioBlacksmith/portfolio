"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { NAV } from "@/data/nav";

const DOTS = [
  { base: { x: 7, y: 6 }, open: { x: 5, y: 7 } },
  { base: { x: 17, y: 6 }, open: { x: 19, y: 7 } },
  { base: { x: 7, y: 12 }, open: { x: 10, y: 12 } },
  { base: { x: 17, y: 12 }, open: { x: 14, y: 12 } },
  { base: { x: 7, y: 18 }, open: { x: 5, y: 17 } },
  { base: { x: 17, y: 18 }, open: { x: 19, y: 17 } },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
      className="text-current"
    >
      {DOTS.map((dot, i) => {
        const p = open ? dot.open : dot.base;
        return (
          <circle
            key={i}
            cx={dot.base.x}
            cy={dot.base.y}
            r="2"
            fill="currentColor"
            className="transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${p.x - dot.base.x}px, ${p.y - dot.base.y}px)`,
            }}
          />
        );
      })}
    </svg>
  );
}

export function MobileMenu() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={t("menu")}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-panel/60 text-ash transition-colors hover:text-steel focus-visible:text-steel active:opacity-70"
      >
        <MenuIcon open={open} />
      </button>

      <div
        id="mobile-menu"
        className={`absolute top-full right-0 z-50 mt-2 w-72 origin-top-right rounded-lg border border-white/10 bg-panel/95 p-3 shadow-xl shadow-black/40 backdrop-blur-md transition-[opacity,transform] duration-200 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <p className="mb-2 flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] text-faint select-none">
          <span>~/nav</span>
          <span
            className="inline-block h-3 w-[7px] bg-faint animate-blink"
            aria-hidden="true"
          />
        </p>

        <nav aria-label={t("menu")} className="grid grid-cols-3 gap-2">
          {NAV.map((item) => (
            <a
              key={item.index}
              href={item.href}
              onClick={close}
              className="group flex flex-col items-center justify-center gap-1 rounded-md border border-white/10 bg-ink/60 px-1 py-3 text-center transition-colors hover:border-steel/50 hover:text-bone focus-visible:text-bone active:opacity-70"
            >
              <span className="font-mono text-[8px] text-faint transition-colors group-hover:text-steel/70">
                [{item.index}]
              </span>
              <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-ash uppercase transition-colors group-hover:text-bone">
                {t(item.key)}
              </span>
            </a>
          ))}
        </nav>

        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
            {t("language")}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
