/**
 * Freshness — the platform-wide rules for evidence age.
 *
 * One principle: every age shown to the user derives from a real timestamp
 * on a real record. "Checked" is only said when a check actually happened
 * (lastCheckedAt / dateLastChecked); otherwise the honest verb is "updated"
 * or "added". Old evidence is allowed everywhere — it just must look old.
 */

import type {
  Cluster,
  Contradiction,
  Driver,
  FutureTerritory,
  MonitoringIndicator,
  Observation,
  Pattern,
  Scenario,
  Signal,
  Source,
  StrategicImplication,
} from "./types";

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Relative age per the platform rules:
 * <1h "12m ago" · <24h "4h ago" · <7d "3d ago" · <31d "2w ago" ·
 * <90d "2mo ago" · <365d "5mo ago" · older: the actual month and year.
 */
export function relativeAge(iso: string, now: number = Date.now()): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "date unknown";
  const diff = Math.max(0, now - t);
  if (diff < HOUR) return `${Math.max(1, Math.round(diff / MINUTE))}m ago`;
  if (diff < DAY) return `${Math.round(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.round(diff / DAY)}d ago`;
  if (diff < 31 * DAY) return `${Math.round(diff / (7 * DAY))}w ago`;
  if (diff < 365 * DAY) return `${Math.max(1, Math.round(diff / (30 * DAY)))}mo ago`;
  return new Date(t).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** Full date for tooltips and detail pages. */
export function fullDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "date unknown";
  return new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Freshness status
// ---------------------------------------------------------------------------

export type Freshness = "fresh" | "recent" | "aging" | "stale" | "archived";

export const FRESHNESS_LABELS: Record<Freshness, string> = {
  fresh: "Fresh",
  recent: "Recent",
  aging: "Aging",
  stale: "Stale",
  archived: "Historical",
};

/** One plain sentence per status — used in tooltips and legends. */
export const FRESHNESS_MEANINGS: Record<Freshness, string> = {
  fresh: "Updated in the last 24 hours.",
  recent: "Updated in the last 7 days.",
  aging: "Updated in the last 30 days.",
  stale: "Older than 30 days — check it before relying on it.",
  archived: "Older than 90 days — still usable as background, but not news.",
};

export function freshnessOf(
  iso: string | null | undefined,
  now: number = Date.now(),
): Freshness {
  if (!iso) return "stale";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "stale";
  const diff = now - t;
  if (diff < DAY) return "fresh";
  if (diff < 7 * DAY) return "recent";
  if (diff < 31 * DAY) return "aging";
  if (diff < 90 * DAY) return "stale";
  return "archived";
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

export function newestDate(dates: Array<string | null | undefined>): string | null {
  let best: string | null = null;
  for (const d of dates) {
    if (!d || Number.isNaN(Date.parse(d))) continue;
    if (!best || Date.parse(d) > Date.parse(best)) best = d;
  }
  return best;
}

export function oldestDate(dates: Array<string | null | undefined>): string | null {
  let best: string | null = null;
  for (const d of dates) {
    if (!d || Number.isNaN(Date.parse(d))) continue;
    if (!best || Date.parse(d) < Date.parse(best)) best = d;
  }
  return best;
}

/**
 * The honest "when was this looked at" reading for a record: a real check
 * if one was recorded, otherwise the last edit — with the matching verb.
 */
export function checkedReading(rec: {
  lastCheckedAt?: string;
  updatedAt: string;
}): { date: string; verb: "checked" | "updated" } {
  return rec.lastCheckedAt
    ? { date: rec.lastCheckedAt, verb: "checked" }
    : { date: rec.updatedAt, verb: "updated" };
}

// ---------------------------------------------------------------------------
// Evidence windows — latest / oldest evidence behind a record, derived live
// ---------------------------------------------------------------------------

export interface EvidenceWindow {
  latest: string | null;
  oldest: string | null;
}

/** A signal's own evidence date: the observation date (event date if later). */
export function signalEvidenceAt(signal: Signal): string {
  return newestDate([signal.dateObserved, signal.eventDate]) ?? signal.dateObserved;
}

export function windowFromSignals(
  signalIds: string[],
  signals: Signal[],
): EvidenceWindow {
  const dates = signals
    .filter((s) => signalIds.includes(s.id))
    .map((s) => signalEvidenceAt(s));
  return { latest: newestDate(dates), oldest: oldestDate(dates) };
}

export function clusterEvidenceWindow(cluster: Cluster, signals: Signal[]): EvidenceWindow {
  return windowFromSignals(cluster.signalIds, signals);
}

export function patternEvidenceWindow(pattern: Pattern, signals: Signal[]): EvidenceWindow {
  const w = windowFromSignals(pattern.keySignalIds, signals);
  return {
    latest: newestDate([w.latest, pattern.latestEvidenceDate]),
    oldest: oldestDate([w.oldest, pattern.firstEvidenceDate]),
  };
}

export function contradictionEvidenceWindows(
  c: Contradiction,
  signals: Signal[],
): { sideA: EvidenceWindow; sideB: EvidenceWindow } {
  return {
    sideA: windowFromSignals(c.sideASignalIds, signals),
    sideB: windowFromSignals(c.sideBSignalIds, signals),
  };
}

export function driverEvidenceWindow(driver: Driver, signals: Signal[]): EvidenceWindow {
  return windowFromSignals(driver.signalIds, signals);
}

export function territoryEvidenceWindow(
  t: FutureTerritory,
  signals: Signal[],
  indicators: MonitoringIndicator[],
): EvidenceWindow {
  const w = windowFromSignals(t.representativeSignalIds, signals);
  const indicatorDates = indicators
    .filter((i) => i.territoryId === t.id)
    .map((i) => i.dateLastChecked);
  return { latest: newestDate([w.latest, ...indicatorDates]), oldest: w.oldest };
}

export function scenarioEvidenceWindow(sc: Scenario, signals: Signal[]): EvidenceWindow {
  return windowFromSignals(sc.supportingSignalIds, signals);
}

export function implicationEvidenceWindow(
  imp: StrategicImplication,
  signals: Signal[],
): EvidenceWindow {
  return windowFromSignals(imp.evidenceSignalIds, signals);
}

/** An observation's evidence date: when it was observed (event date if later). */
export function observationEvidenceAt(obs: Observation): string {
  return newestDate([obs.dateObserved, obs.eventDate]) ?? obs.dateObserved;
}

/** A source's most recent activity: latest check, fetch, or the day it was added. */
export function sourceActivityAt(src: Source): string {
  return (
    newestDate([src.lastCheckedAt, src.lastSuccessfulFetchAt, src.dateAdded]) ??
    src.dateAdded
  );
}

// ---------------------------------------------------------------------------
// Stale reasons — one plain sentence, or null when the record is not stale
// ---------------------------------------------------------------------------

const STALE_MS = 31 * DAY;

function olderThan(iso: string | null | undefined, ms: number, now: number): boolean {
  if (!iso) return true;
  const t = Date.parse(iso);
  return Number.isNaN(t) || now - t > ms;
}

export function signalStaleReason(signal: Signal, now: number = Date.now()): string | null {
  const checked = signal.lastCheckedAt ?? signal.updatedAt;
  if (olderThan(checked, STALE_MS, now) && olderThan(signalEvidenceAt(signal), STALE_MS, now))
    return `No evidence checked in over a month — newest evidence ${relativeAge(signalEvidenceAt(signal), now)}.`;
  if (signal.confidence === "high" && olderThan(signalEvidenceAt(signal), 90 * DAY, now))
    return `High confidence resting on evidence from ${relativeAge(signalEvidenceAt(signal), now)} — review before relying on it.`;
  return null;
}

export function clusterStaleReason(
  cluster: Cluster,
  signals: Signal[],
  now: number = Date.now(),
): string | null {
  const w = clusterEvidenceWindow(cluster, signals);
  if (olderThan(w.latest, 60 * DAY, now))
    return `No member signal has moved in over two months — newest evidence ${w.latest ? relativeAge(w.latest, now) : "unknown"}.`;
  return null;
}

export function patternStaleReason(
  pattern: Pattern,
  signals: Signal[],
  now: number = Date.now(),
): string | null {
  const w = patternEvidenceWindow(pattern, signals);
  if (olderThan(w.latest, 90 * DAY, now))
    return `Pattern claims a live movement but its newest evidence is ${w.latest ? relativeAge(w.latest, now) : "unknown"}.`;
  return null;
}

export function indicatorOverdueDays(
  ind: MonitoringIndicator,
  cadenceDays: number,
  now: number = Date.now(),
): number {
  const due = Date.parse(ind.dateLastChecked) + cadenceDays * DAY;
  return Math.max(0, Math.floor((now - due) / DAY));
}
