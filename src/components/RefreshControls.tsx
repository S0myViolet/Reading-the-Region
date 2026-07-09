"use client";

/**
 * The global refresh control and page freshness meta line.
 *
 * "Refresh" runs the live scan (the server enforces feed etiquette), merges
 * anything new into the workspace, counts what is now stale, and reports the
 * outcome in plain words. Every number shown is a real count — when nothing
 * changed, it says so.
 */

import { useState } from "react";
import { indicatorOverdue } from "@/lib/derived";
import {
  relativeAge,
  signalStaleReason,
} from "@/lib/freshness";
import { useHydrated, useIntelligenceStore, type RefreshOutcome } from "@/lib/store";
import type { Observation, Source } from "@/lib/types";

interface RefreshLogEntry {
  refreshId: string;
  completedAt: string;
  status: string;
  feedsChecked: number;
  newObservations: number;
  failedFeeds: number;
}

interface RunResponse {
  skipped: string | null;
  result: {
    itemsSeen: number;
    itemsAdded: number;
    feedErrors: Array<{ feed: string; error: string }>;
  } | null;
  refreshLog?: RefreshLogEntry[];
  sources?: Source[];
  observations?: Observation[];
}

const quietLink =
  "text-[12px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink disabled:opacity-60";

/**
 * Meta line + Refresh button + dismissible summary panel. Drop directly
 * under a page's header; it is the same everywhere so users learn it once.
 */
export function RefreshBar() {
  const hydrated = useHydrated();
  const lastRefresh = useIntelligenceStore((s) => s.lastRefresh);
  const setLastRefresh = useIntelligenceStore((s) => s.setLastRefresh);
  const importLiveRecords = useIntelligenceStore((s) => s.importLiveRecords);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const observations = useIntelligenceStore((s) => s.observations);
  const indicators = useIntelligenceStore((s) => s.indicators);

  const [running, setRunning] = useState(false);
  const [panel, setPanel] = useState<RefreshOutcome | null>(null);
  const [log, setLog] = useState<RefreshLogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);

  if (!hydrated) return null;

  const staleSignals = signals.filter((s) => signalStaleReason(s) !== null).length;
  const overdue = indicators.filter((i) => indicatorOverdue(i)).length;
  const waitingReview = observations.filter(
    (o) => o.origin === "live_scan" && o.status === "unreviewed",
  ).length;

  const run = async () => {
    setRunning(true);
    const startedOk = lastRefresh?.ok ? lastRefresh.at : (lastRefresh?.lastSuccessAt ?? null);
    try {
      const res = await fetch("/api/live-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as RunResponse;
      importLiveRecords(data.sources ?? [], data.observations ?? []);
      if (data.refreshLog) setLog(data.refreshLog);
      const outcome: RefreshOutcome = {
        at: new Date().toISOString(),
        ok: true,
        feedsChecked:
          data.refreshLog?.[0]?.feedsChecked ?? (data.result ? 1 : 0),
        newObservations: data.result?.itemsAdded ?? 0,
        failedFeeds: data.result?.feedErrors.length ?? 0,
        staleFound: staleSignals + overdue,
        lastSuccessAt: new Date().toISOString(),
      };
      setLastRefresh(outcome);
      setPanel(outcome);
    } catch {
      const outcome: RefreshOutcome = {
        at: new Date().toISOString(),
        ok: false,
        feedsChecked: 0,
        newObservations: 0,
        failedFeeds: 0,
        staleFound: staleSignals + overdue,
        lastSuccessAt: startedOk,
      };
      setLastRefresh(outcome);
      setPanel(outcome);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="-mt-3 mb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-[12px] text-ink-faint">
          {lastRefresh ? (
            lastRefresh.ok ? (
              <>
                Last refreshed {relativeAge(lastRefresh.at)} ·{" "}
                {lastRefresh.feedsChecked} feed
                {lastRefresh.feedsChecked === 1 ? "" : "s"} checked ·{" "}
                {sources.length} sources in the base
                {waitingReview > 0
                  ? ` · ${waitingReview} new item${waitingReview === 1 ? "" : "s"} waiting for review`
                  : ""}
              </>
            ) : (
              <span className="text-caution">
                Refresh failed
                {lastRefresh.lastSuccessAt
                  ? ` — last successful refresh ${relativeAge(lastRefresh.lastSuccessAt)}`
                  : " — no successful refresh yet in this session"}
                .
              </span>
            )
          ) : (
            <>
              Not refreshed in this session yet · {sources.length} sources in the base
              {waitingReview > 0
                ? ` · ${waitingReview} item${waitingReview === 1 ? "" : "s"} waiting for review`
                : ""}
            </>
          )}
        </p>
        <button type="button" onClick={run} disabled={running} className={quietLink}>
          {running ? "Checking for new evidence…" : "Refresh"}
        </button>
      </div>

      {panel ? (
        <div className="mt-3 max-w-2xl border-l-2 border-line-strong pl-4">
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-[12.5px] font-medium text-ink">
              {panel.ok ? "Refresh complete" : "Refresh failed"}
            </p>
            <button
              type="button"
              onClick={() => {
                setPanel(null);
                setShowLog(false);
              }}
              className={quietLink}
            >
              Dismiss
            </button>
          </div>
          {panel.ok ? (
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              Checked {panel.feedsChecked} feed
              {panel.feedsChecked === 1 ? "" : "s"}.{" "}
              {panel.newObservations > 0
                ? `${panel.newObservations} new observation${panel.newObservations === 1 ? "" : "s"} added to the Scan Inbox.`
                : "No new evidence found."}{" "}
              {panel.failedFeeds > 0
                ? `${panel.failedFeeds} feed check${panel.failedFeeds === 1 ? "" : "s"} failed.`
                : ""}{" "}
              {panel.staleFound > 0
                ? `${panel.staleFound} item${panel.staleFound === 1 ? " needs" : "s need"} a check (stale evidence or overdue indicators).`
                : "Nothing in the base is overdue for a check."}
            </p>
          ) : (
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              The scan service could not be reached. The workspace is unchanged
              {panel.lastSuccessAt
                ? `; the last successful refresh was ${relativeAge(panel.lastSuccessAt)}.`
                : "."}
            </p>
          )}
          {log.length > 0 ? (
            <p className="mt-1.5">
              <button
                type="button"
                onClick={() => setShowLog(!showLog)}
                className={quietLink}
              >
                {showLog ? "Hide refresh log" : "Last refresh details"}
              </button>
            </p>
          ) : null}
          {showLog ? (
            <ul className="mt-2 space-y-1">
              {log.slice(0, 6).map((e) => (
                <li key={e.refreshId} className="font-mono text-[11px] text-ink-faint">
                  {relativeAge(e.completedAt)} · {e.status} · {e.feedsChecked} feeds ·{" "}
                  {e.newObservations} new · {e.failedFeeds} failed
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
