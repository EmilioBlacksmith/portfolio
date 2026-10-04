import fs from "node:fs";
import path from "node:path";
import type { CheckResult, StatusReport } from "./status";

/**
 * Uptime history persistence.
 *
 * Samples are appended to a JSON file on a persistent volume (Railway mounts
 * one at /data). When no writable data dir is configured — e.g. local dev or a
 * fresh volume — reads return an empty history and the page degrades to a
 * "no data yet" state rather than failing.
 */

const HISTORY_DIR =
  process.env.STATUS_DATA_DIR ??
  (process.env.RAILWAY_VOLUME_MOUNT_PATH ||
    (process.env.NODE_ENV === "production" ? "/data" : "./.data"));

const HISTORY_FILE = path.join(HISTORY_DIR, "status-history.json");

/** Keep ~30 days of hourly samples. */
const MAX_SAMPLES = 24 * 30;
/** Buckets shown in the ASCII bar. */
export const BAR_BUCKETS = 48;

export type Sample = {
  t: string;
  services: { id: string; status: "up" | "down"; responseTimeMs: number }[];
};

export type HistoryFile = {
  updatedAt: string;
  samples: Sample[];
};

export function toSample(report: StatusReport): Sample {
  return {
    t: report.checkedAt,
    services: report.services.map((s: CheckResult) => ({
      id: s.id,
      status: s.status,
      responseTimeMs: s.responseTimeMs,
    })),
  };
}

function readHistory(): HistoryFile {
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf8");
    const parsed = JSON.parse(raw) as HistoryFile;
    if (!Array.isArray(parsed.samples)) return { updatedAt: "", samples: [] };
    return parsed;
  } catch {
    return { updatedAt: "", samples: [] };
  }
}

/**
 * Append a sample. Persistence is best-effort: a read-only or missing volume
 * must never break the status page.
 */
export function appendSample(sample: Sample): boolean {
  const history = readHistory();
  history.samples.push(sample);
  history.samples = history.samples.slice(-MAX_SAMPLES);
  history.updatedAt = sample.t;

  try {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
    // Write to a temp file then rename for atomicity.
    const tmp = `${HISTORY_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(history));
    fs.renameSync(tmp, HISTORY_FILE);
    return true;
  } catch (error) {
    // Best effort: never throw into a request handler, but make it visible.
    console.error(
      `[status-history] failed to write ${HISTORY_FILE}`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/** Where history is stored, for diagnostics. */
export function historyLocation(): { dir: string; file: string } {
  return { dir: HISTORY_DIR, file: HISTORY_FILE };
}

export type Bucket = {
  /** ISO start of the bucket. */
  start: string;
  up: number;
  total: number;
  /** up / total, or null when the bucket has no samples. */
  ratio: number | null;
  avgResponseMs: number | null;
};

export type ServiceHistory = {
  id: string;
  buckets: Bucket[];
  samples: number;
  uptime: number | null;
  avgResponseMs: number | null;
};

export type HistoryReport = {
  updatedAt: string;
  bucketMs: number;
  services: ServiceHistory[];
};

const HOUR_MS = 60 * 60 * 1000;

/**
 * Bucket samples into a fixed-width window ending "now". Returns oldest → newest
 * so the bar reads left-to-right in chronological order.
 */
export function getHistory(
  serviceIds: string[],
  buckets = BAR_BUCKETS,
  bucketMs = HOUR_MS,
  now = Date.now()
): HistoryReport {
  const history = readHistory();
  const windowStart = now - (buckets - 1) * bucketMs;

  return {
    updatedAt: history.updatedAt,
    bucketMs,
    services: serviceIds.map((id) => {
      const grid: Bucket[] = Array.from({ length: buckets }, (_, i) => ({
        start: new Date(windowStart + i * bucketMs).toISOString(),
        up: 0,
        total: 0,
        ratio: null,
        avgResponseMs: null,
      }));

      const times: number[] = [];

      for (const sample of history.samples) {
        const svc = sample.services.find((s) => s.id === id);
        if (!svc) continue;
        const at = new Date(sample.t).getTime();
        const index = Math.floor((at - windowStart) / bucketMs);
        if (index < 0 || index >= buckets) continue;

        const bucket = grid[index];
        bucket.total += 1;
        if (svc.status === "up") bucket.up += 1;
        if (typeof svc.responseTimeMs === "number") times.push(svc.responseTimeMs);
      }

      for (const bucket of grid) {
        if (bucket.total > 0) bucket.ratio = bucket.up / bucket.total;
      }

      const totalSamples = grid.reduce((n, b) => n + b.total, 0);
      const upSamples = grid.reduce((n, b) => n + b.up, 0);
      const responseTimes = history.samples
        .filter((s) => s.services.some((svc) => svc.id === id))
        .map((s) => s.services.find((svc) => svc.id === id)?.responseTimeMs)
        .filter((n): n is number => typeof n === "number");

      return {
        id,
        buckets: grid,
        samples: totalSamples,
        uptime: totalSamples > 0 ? upSamples / totalSamples : null,
        avgResponseMs:
          responseTimes.length > 0
            ? Math.round(
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
              )
            : null,
      };
    }),
  };
}
