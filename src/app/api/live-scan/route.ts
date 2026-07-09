/**
 * Live scan API.
 *
 * GET  — current accumulated live-scan state (config summary, last result,
 *        all sources and observations collected so far). Read-only.
 * POST — run a scan. The server enforces the configured minimum interval;
 *        pass {"force": true} to run immediately (the "Scan now" button).
 */

import { NextResponse } from "next/server";
import {
  readConfig,
  readRefreshLog,
  readState,
  runScan,
} from "@/lib/livescan/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = readConfig();
  const state = readState();
  return NextResponse.json({
    enabled: config.enabled,
    feedCount: config.feeds.length,
    feedNames: config.feeds.map((f) => f.name),
    minMinutesBetweenScans: config.minMinutesBetweenScans,
    lastScanAt: state.lastScanAt,
    lastResult: state.lastResult,
    refreshLog: readRefreshLog().slice(0, 10),
    sources: state.sources,
    observations: state.observations,
  });
}

export async function POST(request: Request) {
  let force = false;
  try {
    const body = (await request.json()) as { force?: boolean };
    force = body?.force === true;
  } catch {
    // empty body — treat as a routine (non-forced) scan request
  }
  const { skipped, result, state } = await runScan(force);
  return NextResponse.json({
    skipped,
    result,
    lastScanAt: state.lastScanAt,
    refreshLog: readRefreshLog().slice(0, 10),
    sources: state.sources,
    observations: state.observations,
  });
}
