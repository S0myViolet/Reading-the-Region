"use client";

/**
 * Background live-scan sync. Mounted once in the app shell; renders nothing.
 *
 * While the app is open it (1) pulls the accumulated live-scan records from
 * the server and merges the new ones into the store, and (2) asks the server
 * to run a fresh scan — the server itself enforces the configured minimum
 * interval, so this is safe to call often. Failures are silent: the platform
 * works fully offline, live scan is an addition, never a dependency.
 */

import { useEffect, useState } from "react";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import type { Observation, Source } from "@/lib/types";

const POLL_MS = 30 * 60 * 1000; // re-check twice an hour while the app is open

interface LiveScanPayload {
  sources?: Source[];
  observations?: Observation[];
}

async function syncOnce(
  importLiveRecords: (s: Source[], o: Observation[]) => number,
): Promise<void> {
  // Merge whatever previous scans collected…
  const current = await fetch("/api/live-scan", { cache: "no-store" });
  if (current.ok) {
    const data = (await current.json()) as LiveScanPayload;
    importLiveRecords(data.sources ?? [], data.observations ?? []);
  }
  // …then let the server run a scan if one is due (it enforces the interval).
  const run = await fetch("/api/live-scan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  if (run.ok) {
    const data = (await run.json()) as LiveScanPayload;
    importLiveRecords(data.sources ?? [], data.observations ?? []);
  }
}

export function LiveScanSync() {
  const hydrated = useHydrated();
  const enabled = useIntelligenceStore((s) => s.liveScanEnabled);
  const importLiveRecords = useIntelligenceStore((s) => s.importLiveRecords);

  useEffect(() => {
    if (!hydrated || !enabled) return;
    const tick = () => {
      syncOnce(importLiveRecords).catch(() => {
        /* offline or scan API unavailable — the app works without it */
      });
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [hydrated, enabled, importLiveRecords]);

  return null;
}

// ---------------------------------------------------------------------------
// Visible status line — Scan Inbox (advanced) and Settings
// ---------------------------------------------------------------------------

interface LiveScanStatusData {
  enabled: boolean;
  feedCount: number;
  feedNames: string[];
  minMinutesBetweenScans: number;
  lastScanAt: string | null;
  lastResult: {
    ranAt: string;
    itemsSeen: number;
    itemsAdded: number;
    feedErrors: Array<{ feed: string; error: string }>;
  } | null;
}

function agoWords(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/**
 * Quiet live-scan readout with a "Scan now" action. `detailed` adds the feed
 * list and error notes for the Settings page; the inbox uses the short form.
 */
export function LiveScanStatus({ detailed = false }: { detailed?: boolean }) {
  const hydrated = useHydrated();
  const clientEnabled = useIntelligenceStore((s) => s.liveScanEnabled);
  const setLiveScanEnabled = useIntelligenceStore((s) => s.setLiveScanEnabled);
  const importLiveRecords = useIntelligenceStore((s) => s.importLiveRecords);
  const [status, setStatus] = useState<LiveScanStatusData | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [unreachable, setUnreachable] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/live-scan", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as LiveScanStatusData & LiveScanPayload;
      setStatus(data);
      setUnreachable(false);
      importLiveRecords(data.sources ?? [], data.observations ?? []);
    } catch {
      setUnreachable(true);
    }
  };

  useEffect(() => {
    if (hydrated) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) return null;

  const scanNow = async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/live-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as LiveScanPayload & {
        result: LiveScanStatusData["lastResult"];
      };
      const added = importLiveRecords(data.sources ?? [], data.observations ?? []);
      const errors = data.result?.feedErrors?.length ?? 0;
      setNote(
        added > 0
          ? `${added} new item${added === 1 ? "" : "s"} added to the Scan Inbox.`
          : errors > 0
            ? "No new items — some feeds could not be reached."
            : "No new items since the last scan.",
      );
      await refresh();
    } catch {
      setNote("Scan failed — check the connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const linkClass =
    "text-[12px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink disabled:opacity-50";

  return (
    <div className={detailed ? "space-y-3" : undefined}>
      <p className="text-[12px] text-ink-faint">
        {unreachable ? (
          "Live scan is unavailable right now — the app keeps working with the material already here."
        ) : !clientEnabled ? (
          "Live scan is paused — new material is not being pulled in."
        ) : status?.lastScanAt ? (
          <>
            Live scan ran {agoWords(status.lastScanAt)}
            {status.lastResult ? (
              <>
                {" "}
                · {status.lastResult.itemsAdded} new item
                {status.lastResult.itemsAdded === 1 ? "" : "s"}
              </>
            ) : null}
            {" · "}
          </>
        ) : (
          <>Live scan has not run yet. </>
        )}
        {!unreachable && clientEnabled ? (
          <button type="button" onClick={scanNow} disabled={busy} className={linkClass}>
            {busy ? "Scanning…" : "Scan now"}
          </button>
        ) : null}
        {note ? <span className="ml-2 text-ink-soft">{note}</span> : null}
      </p>

      {detailed ? (
        <>
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            While the app is open it checks the configured feeds every{" "}
            {status ? Math.round(status.minMinutesBetweenScans / 60) : 6} hours and adds
            anything new to the Scan Inbox as unreviewed material. Nothing is scored or
            promoted automatically — every item still earns its place through triage.
          </p>
          <p className="text-[12.5px]">
            <button
              type="button"
              onClick={() => setLiveScanEnabled(!clientEnabled)}
              className={linkClass}
            >
              {clientEnabled ? "Pause live scan" : "Resume live scan"}
            </button>
          </p>
          {status && status.feedNames.length > 0 ? (
            <div>
              <p className="mb-1 text-[11px] text-ink-faint">
                Feeds ({status.feedCount}) — edit scan.feeds.json in the project folder to
                change them
              </p>
              <ul className="space-y-0.5">
                {status.feedNames.map((n) => (
                  <li key={n} className="text-[12px] text-ink-soft">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {status?.lastResult && status.lastResult.feedErrors.length > 0 ? (
            <div>
              <p className="mb-1 text-[11px] text-caution">
                Feeds that failed on the last scan
              </p>
              <ul className="space-y-0.5">
                {status.lastResult.feedErrors.map((e) => (
                  <li key={e.feed} className="text-[12px] text-ink-faint">
                    {e.feed} — {e.error}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
