/**
 * Next.js instrumentation hook — runs once when a Node.js server instance
 * boots. Used to start the in-process status sampler so `/status` history is
 * recorded every 15 minutes without an external cron.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { startStatusScheduler } = await import("./lib/status-scheduler");
  startStatusScheduler();
}
