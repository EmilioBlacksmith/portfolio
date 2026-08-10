"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LANGS = ["en", "es"] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div
      className="flex items-center gap-1 font-mono text-[11px] tracking-[0.12em] select-none"
      role="group"
      aria-label={t("language")}
    >
      {LANGS.map((lang, i) => (
        <span key={lang} className="flex items-center gap-1">
          {i > 0 && <span className="text-faint">/</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: lang })}
            aria-pressed={locale === lang}
            className={`px-1 py-2 transition-colors ${
              locale === lang
                ? "text-steel"
                : "text-faint hover:text-bone focus-visible:text-bone"
            }`}
          >
            {lang.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
