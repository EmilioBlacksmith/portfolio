"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import type { StatusReport } from "@/lib/status";
import type { HistoryReport, Range } from "@/lib/status-history";
import { UptimeBar, UptimeLegend, uptimeTone } from "./uptime-bar";

const REFRESH_MS = 30_000;

const emptySubscribe = () => () => {};

/** Visitor's timezone after hydration, null during SSR/first render. */
function useClientTimeZone(): string | null {
  return useSyncExternalStore(
    emptySubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    () => null
  );
}

/**
 * Formats an ISO timestamp in the visitor's local timezone. Returns null until
 * the timezone is known, so callers fall back to the server-rendered UTC slice
 * and hydration stays consistent.
 */
function useLocalTime(iso: string): string | null {
  const zone = useClientTimeZone();
  if (!zone) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: zone,
  }).format(d);
}

function StatusDot({ up }: { up: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {up && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          up ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
    </span>
  );
}

export function StatusBoard({
  initial,
  history,
}: {
  initial: StatusReport;
  history: HistoryReport;
}) {
  const t = useTranslations("status");
  const [report, setReport] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<Range>(history.ranges[0]?.range ?? "24h");
  const checkedAtLocal = useLocalTime(report.checkedAt);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setRefreshing(true);
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as StatusReport;
          if (!cancelled) setReport(data);
        }
      } catch {
        // keep the last known state
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const operational = report.status === "operational";
  const downCount = report.services.filter((s) => s.status !== "up").length;
  const activeRange =
    history.ranges.find((r) => r.range === range) ?? history.ranges[0];
  const allTimeUptime = (() => {
    const all = history.ranges.find((r) => r.range === "all");
    if (!all) return null;
    let up = 0;
    let total = 0;
    for (const s of all.services) {
      if (s.uptime === null) continue;
      up += s.uptime * s.samples;
      total += s.samples;
    }
    return total > 0 ? up / total : null;
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-bone">
          <StatusDot up={operational} />
          {operational
            ? t("operational")
            : t("servicesDown", { count: downCount })}
        </p>
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
          {t("lastChecked")}{" "}
          {checkedAtLocal ?? `${report.checkedAt.slice(11, 19)} UTC`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
        {history.ranges.map((r) => {
          const active = r.range === range;
          return (
            <button
              key={r.range}
              type="button"
              onClick={() => setRange(r.range)}
              aria-pressed={active}
              className={`border px-2.5 py-1 transition-colors ${
                active
                  ? "border-steel/40 bg-steel/10 text-steel"
                  : "border-white/10 text-faint hover:border-white/20 hover:text-bone"
              }`}
            >
              {r.range === "all" ? t("rangeAll") : r.range}
            </button>
          );
        })}
      </div>

      <ul className="space-y-3">
        {report.services.map((service) => {
          const up = service.status === "up";
          const serviceHistory = activeRange?.services.find(
            (h) => h.id === service.id
          );
          return (
            <li key={service.id} className="border border-white/10 bg-panel/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-base font-bold text-bone transition-colors hover:text-steel"
                  >
                    {service.name}
                  </a>
                  {service.description && (
                    <p className="mt-1 text-sm leading-relaxed text-ash">
                      {service.description}
                    </p>
                  )}
                </div>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      up ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  <span className={up ? "text-emerald-400" : "text-red-400"}>
                    {up ? t("up") : t("down")}
                  </span>
                  <span className="text-faint">· {service.responseTimeMs} ms</span>
                  {!up && service.httpStatus ? (
                    <span className="text-red-400/70">
                      · HTTP {service.httpStatus}
                    </span>
                  ) : null}
                </span>
              </div>

              {serviceHistory && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <UptimeBar history={serviceHistory} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
        <UptimeLegend />
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-faint">
          {allTimeUptime !== null && (
            <span>
              {t("allTime")}{" "}
              <span className={uptimeTone(allTimeUptime)}>
                {(allTimeUptime * 100).toFixed(1)}%
              </span>
            </span>
          )}
          <span>{refreshing ? t("refreshing") : t("liveRefresh")}</span>
        </span>
      </div>
    </div>
  );
}
