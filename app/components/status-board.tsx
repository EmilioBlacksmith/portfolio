"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { StatusReport } from "@/lib/status";
import type { HistoryReport } from "@/lib/status-history";
import { UptimeBar } from "./uptime-bar";

const REFRESH_MS = 30_000;

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

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center gap-3 border p-5 ${
          operational
            ? "border-emerald-400/30 bg-emerald-400/5"
            : "border-red-400/30 bg-red-400/5"
        }`}
      >
        <StatusDot up={operational} />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-bone">
          {operational ? t("operational") : t("degraded")}
        </p>
      </div>

      <ul className="space-y-3">
        {report.services.map((service) => {
          const up = service.status === "up";
          const serviceHistory = history.services.find(
            (h) => h.id === service.id
          );
          return (
            <li key={service.id} className="border border-white/10 bg-panel/50 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
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
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-faint">
                    {t("response")} {service.responseTimeMs} ms
                    {service.httpStatus ? ` · HTTP ${service.httpStatus}` : ""}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-2 border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
                    up
                      ? "border-emerald-400/30 text-emerald-400"
                      : "border-red-400/30 text-red-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      up ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  {up ? t("up") : t("down")}
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

      <p className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-faint">
        <span>
          {t("lastChecked")} {report.checkedAt.slice(11, 19)} UTC
        </span>
        <span>{refreshing ? t("refreshing") : t("autoRefresh")}</span>
      </p>
    </div>
  );
}
