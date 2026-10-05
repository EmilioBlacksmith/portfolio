"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import type { Bucket, ServiceHistory } from "@/lib/status-history";

/** Full block = all up, light shade = partial, blank = outage, dot = no data. */
const GLYPH_UP = "█";
const GLYPH_PARTIAL = "▒";
const GLYPH_DOWN = "░";
const GLYPH_EMPTY = "·";

function glyphFor(bucket: Bucket): string {
  if (bucket.total === 0 || bucket.ratio === null) return GLYPH_EMPTY;
  if (bucket.ratio >= 1) return GLYPH_UP;
  if (bucket.ratio <= 0) return GLYPH_DOWN;
  return GLYPH_PARTIAL;
}

function toneFor(bucket: Bucket): string {
  if (bucket.total === 0 || bucket.ratio === null) return "text-white/15";
  if (bucket.ratio <= 0) return "text-red-400";
  if (bucket.ratio < 1) return "text-amber-300";
  return "text-emerald-400";
}

/** UTC time label (HH:MM), for the server-rendered axis fallback. */
function formatSlotUtc(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(
    d.getUTCMinutes()
  ).padStart(2, "0")}`;
}

const emptySubscribe = () => () => {};

/**
 * The visitor's timezone, or null during SSR/first render. useSyncExternalStore
 * returns the server snapshot (null) for hydration and the client snapshot
 * afterwards, which avoids both a hydration mismatch and a setState-in-effect.
 */
function useClientTimeZone(): string | null {
  return useSyncExternalStore(
    emptySubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    () => null
  );
}

function useLocalFormat() {
  const zone = useClientTimeZone();

  const hour = useCallback(
    (iso: string): string | null => {
      if (!zone) return null;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return null;
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: zone,
      }).format(d);
    },
    [zone]
  );

  const stamp = useCallback(
    (iso: string): string | null => {
      if (!zone) return null;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return null;
      const formatted = new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: zone,
      }).format(d);
      return `${formatted} ${zone}`;
    },
    [zone]
  );

  return { zone, hour, stamp };
}

function tooltipFor(
  bucket: Bucket,
  fmt: ReturnType<typeof useLocalFormat>
): string {
  const when =
    fmt.stamp(bucket.start) ?? `${formatSlotUtc(bucket.start)} UTC`;
  if (bucket.total === 0 || bucket.ratio === null) {
    return `${when} — no data`;
  }
  const pct = Math.round((bucket.ratio ?? 0) * 100);
  const suffix =
    bucket.avgResponseMs === null ? "" : `, ${bucket.avgResponseMs} ms avg`;
  return `${when} — ${pct}% up (${bucket.up}/${bucket.total})${suffix}`;
}

export function UptimeBar({
  history,
  compact = false,
}: {
  history: ServiceHistory;
  compact?: boolean;
}) {
  const t = useTranslations("status");
  const buckets = history.buckets;
  const [active, setActive] = useState<number | null>(null);
  const fmt = useLocalFormat();
  const first = buckets.length > 0 ? buckets[0].start : null;
  const last = buckets.length > 0 ? buckets[buckets.length - 1].start : null;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-faint">
          <span>
            {t("uptime")}{" "}
            <span
              className={
                history.uptime === null
                  ? "text-faint"
                  : history.uptime >= 0.99
                    ? "text-emerald-400"
                    : history.uptime >= 0.9
                      ? "text-amber-300"
                      : "text-red-400"
              }
            >
              {history.uptime === null
                ? "—"
                : `${(history.uptime * 100).toFixed(1)}%`}
            </span>
          </span>
          <span>
            {t("avgResponse")}{" "}
            {history.avgResponseMs === null ? "—" : `${history.avgResponseMs} ms`}
          </span>
          <span>
            {t("samples")} {history.samples}
          </span>
        </div>
      </div>

      <div className="relative mt-3">
        <div
          className={`flex w-full font-mono leading-none ${
            compact ? "text-[10px]" : "text-xs sm:text-sm"
          }`}
        >
          {buckets.map((bucket, i) => (
            <button
              key={i}
              type="button"
              aria-label={tooltipFor(bucket, fmt)}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`flex-1 cursor-help overflow-hidden text-center ${toneFor(
                bucket
              )} hover:brightness-150 focus-visible:brightness-150 focus-visible:outline-none`}
            >
              {glyphFor(bucket)}
            </button>
          ))}
        </div>

        {active !== null && buckets[active] && (
          <div
            role="tooltip"
            style={{
              left: `${((active + 0.5) / buckets.length) * 100}%`,
            }}
            className="pointer-events-none absolute -top-1 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-white/15 bg-ink/95 px-3 py-1.5 font-mono text-[10px] tracking-wider text-bone shadow-lg shadow-black/40"
          >
            {tooltipFor(buckets[active], fmt)}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-faint">
        <span>
          {first ? (fmt.hour(first) ?? `${formatSlotUtc(first)} UTC`) : ""}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-emerald-400">{GLYPH_UP} {t("legendUp")}</span>
          <span className="text-amber-300">{GLYPH_PARTIAL} {t("legendPartial")}</span>
          <span className="text-red-400">{GLYPH_DOWN} {t("legendDown")}</span>
          <span className="text-white/30">{GLYPH_EMPTY} {t("legendEmpty")}</span>
        </span>
        <span>
          {last ? (fmt.hour(last) ?? `${formatSlotUtc(last)} UTC`) : ""}
        </span>
      </div>
    </div>
  );
}
