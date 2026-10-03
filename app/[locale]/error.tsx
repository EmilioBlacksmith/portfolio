"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Surface the error in the browser console; hook up error tracking here.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        {t("meta")}
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-bone sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ash">
        {t("body")}
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[10px] text-faint">
          ref: {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-white/10 px-6 py-3 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone"
        >
          {t("cta")}
        </button>
        <Link
          href="/"
          className="border border-white/10 px-6 py-3 font-mono text-xs tracking-[0.15em] text-ash uppercase transition-colors hover:border-steel/50 hover:text-bone"
        >
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
