import { NextResponse } from "next/server";
import { runChecks } from "@/lib/status";
import { appendSample, historyLocation, toSample } from "@/lib/status-history";

export const dynamic = "force-dynamic";

/**
 * Records a status sample into the history log. Called by the hourly
 * `.github/workflows/status-check.yml` workflow.
 *
 * Protected by STATUS_CRON_SECRET (Bearer token). If the secret is unset the
 * route refuses to run, so a misconfigured deploy can't be written to.
 */
export async function POST(request: Request) {
  const secret = process.env.STATUS_CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "STATUS_CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const header = request.headers.get("authorization") ?? "";
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const report = await runChecks();
  const result = appendSample(toSample(report));

  return NextResponse.json(
    {
      recorded: result.ok,
      report,
      store: historyLocation().file,
      error: result.ok ? undefined : { code: result.code, message: result.message },
      note: result.ok
        ? undefined
        : "history store not writable — check the Railway volume mount path and that uid 1001 (nextjs) can write there.",
    },
    { status: result.ok ? 201 : 202 }
  );
}
