"use client";

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

function formatHour(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:00`;
}

/** "Aug 23, 14:00 UTC" for a date that may be on a different day than today. */
function formatStamp(iso: string): string {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
  return `${day}, ${formatHour(iso)} UTC`;
}

function tooltipFor(bucket: Bucket): string {
  if (bucket.total === 0 || bucket.ratio === null) {
    return `${formatStamp(bucket.start)} — no data`;
  }
  const pct = Math.round((bucket.ratio ?? 0) * 100);
  const suffix =
    bucket.avgResponseMs === null ? "" : `, ${bucket.avgResponseMs} ms avg`;
  return `${formatStamp(bucket.start)} — ${pct}% up (${bucket.up}/${bucket.total})${suffix}`;
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

      <pre
        aria-hidden="true"
        className={`mt-3 flex w-full font-mono leading-none select-none ${
          compact ? "text-[10px]" : "text-xs sm:text-sm"
        }`}
      >
        {buckets.map((bucket, i) => (
          <span
            key={i}
            title={tooltipFor(bucket)}
            className={`flex-1 cursor-help overflow-hidden text-center ${toneFor(
              bucket
            )} hover:brightness-150`}
          >
            {glyphFor(bucket)}
          </span>
        ))}
      </pre>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-faint">
        <span>{buckets.length > 0 ? formatHour(buckets[0].start) : ""}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-emerald-400">{GLYPH_UP} {t("legendUp")}</span>
          <span className="text-amber-300">{GLYPH_PARTIAL} {t("legendPartial")}</span>
          <span className="text-red-400">{GLYPH_DOWN} {t("legendDown")}</span>
          <span className="text-white/30">{GLYPH_EMPTY} {t("legendEmpty")}</span>
        </span>
        <span>
          {buckets.length > 0
            ? `${formatHour(buckets[buckets.length - 1].start)} UTC`
            : ""}
        </span>
      </div>
    </div>
  );
}
