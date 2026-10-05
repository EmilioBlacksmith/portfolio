import { runChecks } from "./status";
import { appendSample, toSample } from "./status-history";

/**
 * In-process status sampler.
 *
 * Starts with the Node.js server (see `instrumentation.ts`) and records a
 * status sample every 15 minutes, writing into the same history store the
 * `/status` page reads. This replaces the previous GitHub Actions cron, whose
 * `schedule` trigger is best-effort and frequently delayed or skipped.
 *
 * It runs inside the web process, so it cannot observe a full container
 * outage — but it needs no second Railway service, no scheduler secret, and no
 * external HTTP hop. Set `STATUS_SCHEDULER=0` to disable it (e.g. on extra
 * replicas to avoid double-recording).
 */

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;
/** Short delay so the server is fully up before the first sample. */
const START_DELAY_MS = 10_000;
const MIN_INTERVAL_MS = 60_000;

type SchedulerGlobal = typeof globalThis & {
  __statusSchedulerStarted?: boolean;
};

function intervalMs(): number {
  const raw = Number(process.env.STATUS_INTERVAL_MS);
  return Number.isFinite(raw) && raw >= MIN_INTERVAL_MS
    ? raw
    : DEFAULT_INTERVAL_MS;
}

async function tick(): Promise<void> {
  try {
    const report = await runChecks();
    const result = appendSample(toSample(report));
    if (result.ok) {
      console.log(
        `[status-scheduler] recorded ${report.status} at ${report.checkedAt}`
      );
    } else {
      console.error(
        `[status-scheduler] sample not persisted (${result.code}): ${result.message}`
      );
    }
  } catch (error) {
    // A failed check must never take down the web server.
    console.error("[status-scheduler] check failed:", error);
  }
}

export function startStatusScheduler(): void {
  const g = globalThis as SchedulerGlobal;
  if (g.__statusSchedulerStarted) return;
  if (process.env.STATUS_SCHEDULER === "0") return;
  g.__statusSchedulerStarted = true;

  const ms = intervalMs();
  console.log(
    `[status-scheduler] sampling every ${Math.round(ms / 60_000)} min`
  );

  // First sample shortly after boot, then a fixed interval.
  const initial = setTimeout(() => void tick(), START_DELAY_MS);
  initial.unref?.();

  const loop = setInterval(() => void tick(), ms);
  loop.unref?.();
}
