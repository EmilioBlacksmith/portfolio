import { NextResponse } from "next/server";
import { runChecks } from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await runChecks();
  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}
