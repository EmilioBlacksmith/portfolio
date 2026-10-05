import fs from "node:fs";
import path from "node:path";
import type { CheckResult, StatusReport } from "./status";

/**
 * Uptime history persistence — append-only, rotated daily.
 *
 * Samples are recorded every 15 minutes by the in-process scheduler
 * (`lib/status-scheduler.ts`) as one JSON object per line in
 * `<HISTORY_DIR>/status-history/YYYY-MM-DD.ndjson`. Appending is O(1): a sample
 * is never written by reading and rewriting the whole log. Reads scan only the
 * daily files that overlap the requested window.
 *
 * Retention is lifetime, bounded by a byte budget (default 4 GB, override with
 * `STATUS_HISTORY_MAX_BYTES`). At ~96 samples/day this holds decades of history;
 * the budget is a safety valve so a runaway can never fill the volume.
 *
 * When no writable data dir is configured — local dev or a fresh volume — reads
 * return an empty history and the page degrades to a "no data yet" state rather
 * than failing.
 */

const HISTORY_DIR =
  process.env.STATUS_DATA_DIR ??
  (process.env.RAILWAY_VOLUME_MOUNT_PATH ||
    (process.env.NODE_ENV === "production" ? "/data" : "./.data"));

/** Daily log directory. */
const LOG_DIR = path.join(HISTORY_DIR, "status-history");
/** Legacy single-file store, migrated on first use. */
const LEGACY_FILE = path.join(HISTORY_DIR, "status-history.json");

/** Buckets shown in the ASCII bar (fixed width for every range). */
export const BAR_BUCKETS = 96;

const DEFAULT_MAX_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB

const FILE_RE = /^\d{4}-\d{2}-\d{2}\.ndjson$/;

export type Sample = {
  t: string;
  services: { id: string; status: "up" | "down"; responseTimeMs: number }[];
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

// ---------------------------------------------------------------------------
// Ranges
// ---------------------------------------------------------------------------

export const RANGES = ["24h", "7d", "30d", "1y", "all"] as const;
export type Range = (typeof RANGES)[number];

const RANGE_MS: Record<Exclude<Range, "all">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "1y": 365 * 24 * 60 * 60 * 1000,
};

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function fileFor(day: string): string {
  return path.join(LOG_DIR, `${day}.ndjson`);
}

let cachedBytes: number | null = null;
let migrated = false;

function dirBytes(): number {
  if (cachedBytes !== null) return cachedBytes;
  let total = 0;
  try {
    for (const name of fs.readdirSync(LOG_DIR)) {
      if (!FILE_RE.test(name)) continue;
      try {
        total += fs.statSync(path.join(LOG_DIR, name)).size;
      } catch {
        // ignore unreadable entries
      }
    }
  } catch {
    // dir may not exist yet
  }
  cachedBytes = total;
  return total;
}

function maxBytes(): number {
  const raw = Number(process.env.STATUS_HISTORY_MAX_BYTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_BYTES;
}

/** Delete oldest daily logs until the directory is back under budget. */
function pruneIfNeeded(): void {
  if (dirBytes() <= maxBytes()) return;
  let names: string[];
  try {
    names = fs
      .readdirSync(LOG_DIR)
      .filter((n) => FILE_RE.test(n))
      .sort();
  } catch {
    return;
  }
  for (const name of names) {
    if (dirBytes() <= maxBytes()) break;
    const full = path.join(LOG_DIR, name);
    try {
      const size = fs.statSync(full).size;
      fs.rmSync(full);
      cachedBytes = Math.max(0, (cachedBytes ?? 0) - size);
    } catch {
      // keep going; next append will retry
    }
  }
}

/**
 * Best-effort one-time migration of the legacy `status-history.json` array into
 * daily NDJSON files. The legacy file is renamed on success, so this runs once
 * and never duplicates samples.
 */
function migrateLegacyOnce(): void {
  if (migrated) return;
  migrated = true;

  let raw: string;
  try {
    raw = fs.readFileSync(LEGACY_FILE, "utf8");
  } catch {
    return; // nothing to migrate
  }

  try {
    const parsed = JSON.parse(raw) as { samples?: Sample[] };
    const samples = Array.isArray(parsed.samples) ? parsed.samples : [];
    const byDay = new Map<string, Sample[]>();
    for (const sample of samples) {
      if (!sample || typeof sample.t !== "string") continue;
      const day = dayKey(sample.t);
      const list = byDay.get(day);
      if (list) list.push(sample);
      else byDay.set(day, [sample]);
    }

    fs.mkdirSync(LOG_DIR, { recursive: true });
    for (const [day, list] of byDay) {
      const body = `${list.map((s) => JSON.stringify(s)).join("\n")}\n`;
      fs.appendFileSync(fileFor(day), body);
    }
    fs.renameSync(LEGACY_FILE, `${LEGACY_FILE}.migrated`);
    cachedBytes = null;
    console.log(
      `[status-history] migrated ${samples.length} legacy samples into ${byDay.size} daily logs`
    );
  } catch (error) {
    console.error(
      "[status-history] legacy migration failed:",
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Append a sample. Persistence is best-effort: a read-only or missing volume
 * must never break the status page.
 */
export function appendSample(sample: Sample): {
  ok: boolean;
  code?: string;
  message?: string;
} {
  migrateLegacyOnce();
  const line = `${JSON.stringify(sample)}\n`;
  const file = fileFor(dayKey(sample.t));

  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(file, line);
    if (cachedBytes !== null) cachedBytes += Buffer.byteLength(line);
    pruneIfNeeded();
    cache = null;
    return { ok: true };
  } catch (error) {
    // Best effort: never throw into a request handler, but surface the cause.
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as NodeJS.ErrnoException).code)
        : "UNKNOWN";
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[status-history] write failed (${code}) at ${file}: ${message}`
    );
    return { ok: false, code, message };
  }
}

/** Where history is stored, for diagnostics. */
export function historyLocation(): { dir: string; file: string } {
  return { dir: LOG_DIR, file: fileFor(dayKey(new Date().toISOString())) };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

function readSamples(sinceMs?: number): {
  samples: Sample[];
  updatedAt: string;
} {
  migrateLegacyOnce();

  let names: string[];
  try {
    names = fs
      .readdirSync(LOG_DIR)
      .filter((n) => FILE_RE.test(n))
      .sort();
  } catch {
    return { samples: [], updatedAt: "" };
  }

  if (typeof sinceMs === "number" && Number.isFinite(sinceMs)) {
    const sinceDay = dayKey(new Date(sinceMs).toISOString());
    names = names.filter((n) => n.slice(0, 10) >= sinceDay);
  }

  const samples: Sample[] = [];
  let updatedAt = "";
  for (const name of names) {
    let raw: string;
    try {
      raw = fs.readFileSync(path.join(LOG_DIR, name), "utf8");
    } catch {
      continue;
    }
    for (const line of raw.split("\n")) {
      if (!line) continue;
      try {
        const sample = JSON.parse(line) as Sample;
        samples.push(sample);
        if (typeof sample.t === "string" && sample.t > updatedAt) {
          updatedAt = sample.t;
        }
      } catch {
        // skip a corrupt line rather than dropping the whole day
      }
    }
  }

  return { samples, updatedAt };
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

export type RangeHistory = {
  range: Range;
  bucketMs: number;
  services: ServiceHistory[];
};

export type HistoryReport = {
  updatedAt: string;
  ranges: RangeHistory[];
};

function buildRange(
  serviceIds: string[],
  range: Range,
  samples: Sample[],
  now: number
): RangeHistory {
  const parsed = samples
    .map((s) => ({ sample: s, at: new Date(s.t).getTime() }))
    .filter(({ at }) => Number.isFinite(at));

  let windowStart: number;
  if (range === "all") {
    windowStart =
      parsed.length > 0
        ? parsed.reduce((min, p) => (p.at < min ? p.at : min), parsed[0].at)
        : now;
  } else {
    windowStart = now - RANGE_MS[range];
  }
  const windowEnd = now;
  const span = Math.max(1, windowEnd - windowStart);
  const bucketMs = span / BAR_BUCKETS;

  const inWindow = parsed.filter(
    ({ at }) => at >= windowStart && at <= windowEnd
  );

  const services: ServiceHistory[] = serviceIds.map((id) => {
    const grid: Bucket[] = Array.from({ length: BAR_BUCKETS }, (_, i) => ({
      start: new Date(windowStart + i * bucketMs).toISOString(),
      up: 0,
      total: 0,
      ratio: null,
      avgResponseMs: null,
    }));

    const times: number[] = [];
    let upSamples = 0;
    let totalSamples = 0;

    for (const { sample, at } of inWindow) {
      const svc = sample.services.find((s) => s.id === id);
      if (!svc) continue;
      const index = Math.min(
        BAR_BUCKETS - 1,
        Math.max(0, Math.floor((at - windowStart) / bucketMs))
      );
      const bucket = grid[index];
      bucket.total += 1;
      if (svc.status === "up") bucket.up += 1;
      if (typeof svc.responseTimeMs === "number") times.push(svc.responseTimeMs);
      totalSamples += 1;
      if (svc.status === "up") upSamples += 1;
    }

    for (const bucket of grid) {
      if (bucket.total > 0) bucket.ratio = bucket.up / bucket.total;
    }

    return {
      id,
      buckets: grid,
      samples: totalSamples,
      uptime: totalSamples > 0 ? upSamples / totalSamples : null,
      avgResponseMs:
        times.length > 0
          ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
          : null,
    };
  });

  return { range, bucketMs, services };
}

/**
 * Read cache. History only changes every 15 minutes, so re-parsing the daily
 * files on every request would be wasteful. Keyed by the requested service list
 * so a changed service roster recomputes instead of serving stale rows.
 */
const CACHE_TTL_MS = 60_000;
let cache: { at: number; ids: string; report: HistoryReport } | null = null;

export function getHistory(
  serviceIds: string[],
  ranges: readonly Range[] = RANGES,
  now = Date.now()
): HistoryReport {
  const ids = serviceIds.join(",");
  if (cache && cache.ids === ids && now - cache.at < CACHE_TTL_MS) {
    return cache.report;
  }

  const longest = Math.max(
    ...ranges.map((r) => (r === "all" ? Number.POSITIVE_INFINITY : RANGE_MS[r]))
  );
  const sinceMs = Number.isFinite(longest) ? now - longest : undefined;
  const { samples, updatedAt } = readSamples(sinceMs);

  const report: HistoryReport = {
    updatedAt,
    ranges: ranges.map((range) => buildRange(serviceIds, range, samples, now)),
  };
  cache = { at: now, ids, report };
  return report;
}
