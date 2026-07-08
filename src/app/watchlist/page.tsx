"use client";

/**
 * Watchlist — the things you are tracking, and which way they are moving.
 *
 * Personal and simple: saved signals first, then everything the platform
 * tracks, grouped by direction in plain words. The group heading carries the
 * direction, so rows stay quiet — a name, one explaining sentence, what it
 * tracks, and a gentle nudge when a check is due.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { indicatorOverdue } from "@/lib/derived";
import { explainIndicator } from "@/lib/explain";
import { firstSentence, TREND_WORDS, watchlistGroups } from "@/lib/simple";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import type { MonitoringIndicator, Signal } from "@/lib/types";

const quietAction =
  "text-[12px] text-ink-faint underline-offset-2 hover:text-ink-soft";

// ---------------------------------------------------------------------------
// Saved signals
// ---------------------------------------------------------------------------

function SavedSignalRow({ signal }: { signal: Signal }) {
  const toggleSavedSignal = useIntelligenceStore((s) => s.toggleSavedSignal);

  return (
    <div className="list-row">
      <div className="flex items-baseline justify-between gap-6">
        <Link
          href={`/signals/${signal.id}`}
          className="min-w-0 truncate text-[13.5px] font-medium text-ink underline-offset-2 hover:text-accent-ink"
        >
          {signal.title}
        </Link>
        <button
          onClick={() => toggleSavedSignal(signal.id)}
          className={`shrink-0 ${quietAction}`}
        >
          Remove
        </button>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
        {firstSentence(signal.whyItMatters)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tracked developments, grouped by direction
// ---------------------------------------------------------------------------

function tracksLink(
  ind: MonitoringIndicator,
  lookups: {
    territoryName: (id: string | null) => { name: string; href: string } | null;
    driverName: (id: string | null) => { name: string; href: string } | null;
    signalName: (id: string | null) => { name: string; href: string } | null;
  },
): { name: string; href: string } | null {
  return (
    lookups.territoryName(ind.territoryId) ??
    lookups.driverName(ind.driverId) ??
    lookups.signalName(ind.signalId)
  );
}

function IndicatorRow({
  ind,
  tracks,
}: {
  ind: MonitoringIndicator;
  tracks: { name: string; href: string } | null;
}) {
  const updateIndicator = useIntelligenceStore((s) => s.updateIndicator);
  const overdue = indicatorOverdue(ind);

  return (
    <div className="list-row">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink">
          {ind.name}
        </p>
        <span className="flex shrink-0 items-baseline gap-4">
          {overdue ? (
            <span className="text-[11.5px] text-caution">check due</span>
          ) : null}
          <button
            onClick={() =>
              updateIndicator(ind.id, {
                dateLastChecked: new Date().toISOString().slice(0, 10),
              })
            }
            className={quietAction}
          >
            Checked today
          </button>
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
        {firstSentence(explainIndicator(ind))}
        {tracks ? (
          <>
            {" · Tracks "}
            <Link
              href={tracks.href}
              className="underline-offset-2 hover:text-ink-soft hover:underline"
            >
              {tracks.name}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function WatchlistHeader() {
  return (
    <PageHeader
      title="Watchlist"
      description="The things you are tracking, and which way they are moving."
    />
  );
}

/** Group order and plain-words headings; the heading carries the direction. */
const GROUPS = [
  { key: "strengthening", heading: TREND_WORDS.strengthening },
  { key: "weakening", heading: TREND_WORDS.weakening },
  { key: "unclear", heading: TREND_WORDS.contradictory },
  { key: "steady", heading: TREND_WORDS.stable },
] as const;

export default function WatchlistPage() {
  const hydrated = useHydrated();
  const signals = useIntelligenceStore((s) => s.signals);
  const indicators = useIntelligenceStore((s) => s.indicators);
  const territories = useIntelligenceStore((s) => s.territories);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const savedSignalIds = useIntelligenceStore((s) => s.savedSignalIds);

  if (!hydrated) {
    return (
      <>
        <WatchlistHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const savedSignals = savedSignalIds
    .map((id) => signals.find((s) => s.id === id))
    .filter((s): s is Signal => s !== undefined);

  const groups = watchlistGroups(indicators);

  const lookups = {
    territoryName: (id: string | null) => {
      const t = id ? territories.find((x) => x.id === id) : undefined;
      return t ? { name: t.name, href: `/territories/${t.id}` } : null;
    },
    driverName: (id: string | null) => {
      const d = id ? drivers.find((x) => x.id === id) : undefined;
      return d ? { name: d.name, href: `/drivers/${d.id}` } : null;
    },
    signalName: (id: string | null) => {
      const s = id ? signals.find((x) => x.id === id) : undefined;
      return s ? { name: s.title, href: `/signals/${s.id}` } : null;
    },
  };

  return (
    <>
      <WatchlistHeader />
      <WalkthroughPanel pageId="watchlist" />

      <section aria-label="Watching now" className="mb-12">
        <h2 className="text-[15px] font-medium text-ink">Watching now</h2>
        {savedSignals.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-ink-faint">
            Save signals you care about and they will appear here.
          </p>
        ) : (
          <div className="mt-1">
            {savedSignals.map((s) => (
              <SavedSignalRow key={s.id} signal={s} />
            ))}
          </div>
        )}
      </section>

      {indicators.length === 0 ? (
        <p className="max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
          Nothing is being tracked yet. Watch a future from the{" "}
          <Link
            href="/futures"
            className="underline decoration-line-strong underline-offset-2 hover:text-ink"
          >
            Futures page
          </Link>
          , or save signals you care about.
        </p>
      ) : (
        GROUPS.map(({ key, heading }) =>
          groups[key].length > 0 ? (
            <section key={key} aria-label={heading} className="mb-12">
              <h2 className="text-[15px] font-medium text-ink">{heading}</h2>
              <div className="mt-1">
                {groups[key].map((ind) => (
                  <IndicatorRow
                    key={ind.id}
                    ind={ind}
                    tracks={tracksLink(ind, lookups)}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )
      )}
    </>
  );
}
