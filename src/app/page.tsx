"use client";

/**
 * The entry point changes meaning by mode. Simple: Today — a daily
 * briefing (three picks, review queue, quiet exits). Advanced: the
 * Intelligence Overview command center, rendered in place so the toggle
 * preserves context.
 */

import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { ConfidenceBadge, TerritoryStatusBadge } from "@/components/badges";
import { useAppMode } from "@/components/ViewMode";
import { explainContradiction } from "@/lib/explain";
import OverviewCommandCenter from "./overview/page";
import {
  firstSentence,
  todayPicks,
  todaySentence,
  todaysQueue,
  type QueueItem,
} from "@/lib/simple";
import {
  useHydrated,
  useIntelligenceStore,
  type IntelligenceData,
} from "@/lib/store";

const openLink =
  "text-[12.5px] font-medium text-accent-ink underline-offset-2 hover:underline";
const quietLink = "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink";

function PickCard({
  kicker,
  title,
  summary,
  badge,
  actionLabel,
  href,
}: {
  kicker: string;
  title: string;
  summary: string;
  badge?: React.ReactNode;
  actionLabel: string;
  href: string;
}) {
  return (
    <div className="card flex flex-col gap-2 p-5">
      <p className="text-[11px] text-ink-faint">{kicker}</p>
      <p className="text-[14.5px] font-medium leading-snug text-ink">{title}</p>
      <p className="line-clamp-3 text-[12.5px] leading-relaxed text-ink-soft">{summary}</p>
      {badge ? <div>{badge}</div> : null}
      <div className="mt-auto pt-2">
        <Link href={href} className={openLink}>
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  const keepFind = useIntelligenceStore((s) => s.keepFind);
  const setObservationStatus = useIntelligenceStore((s) => s.setObservationStatus);

  return (
    <div className="list-row">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink">{item.title}</p>
        <span className="flex shrink-0 items-baseline gap-4 text-[12px]">
          {item.kind === "find" ? (
            <>
              <button
                onClick={() => keepFind(item.id)}
                className="text-ink-faint underline-offset-2 hover:text-ink-soft"
              >
                Keep
              </button>
              <button
                onClick={() =>
                  setObservationStatus(
                    item.id,
                    "archived_noise",
                    "Dismissed during New Finds review.",
                  )
                }
                className="text-ink-faint underline-offset-2 hover:text-ink-soft"
              >
                Dismiss
              </button>
            </>
          ) : null}
          <Link href={item.href} className="font-medium text-accent-ink underline-offset-2 hover:underline">
            Open
          </Link>
        </span>
      </div>
      <p className="mt-1 truncate text-[12px] text-ink-faint">
        {firstSentence(item.whyItMatters)}
      </p>
    </div>
  );
}

export default function TodayPage() {
  const hydrated = useHydrated();
  const appMode = useAppMode();

  const observations = useIntelligenceStore((s) => s.observations);
  const sources = useIntelligenceStore((s) => s.sources);
  const signals = useIntelligenceStore((s) => s.signals);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const territories = useIntelligenceStore((s) => s.territories);
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const implications = useIntelligenceStore((s) => s.implications);
  const indicators = useIntelligenceStore((s) => s.indicators);
  const keptFindIds = useIntelligenceStore((s) => s.keptFindIds);

  const data = useMemo<IntelligenceData>(
    () => ({
      observations,
      sources,
      signals,
      clusters,
      patterns,
      contradictions,
      drivers,
      territories,
      scenarios,
      implications,
      indicators,
    }),
    [
      observations,
      sources,
      signals,
      clusters,
      patterns,
      contradictions,
      drivers,
      territories,
      scenarios,
      implications,
      indicators,
    ],
  );

  const picks = useMemo(() => todayPicks(data), [data]);
  const queue = useMemo(() => todaysQueue(data, keptFindIds), [data, keptFindIds]);

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Today in the Region" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  // Advanced mode: the same entry point is the intelligence command center.
  if (appMode === "advanced") {
    return <OverviewCommandCenter />;
  }

  return (
    <>
      <PageHeader title="Today in the Region" description={todaySentence(data)} />
      <WalkthroughPanel pageId="today" />

      <section aria-label="Today's picks" className="mb-10 grid gap-4 sm:grid-cols-3">
        {picks.signal ? (
          <PickCard
            kicker="Signal worth attention"
            title={picks.signal.title}
            summary={firstSentence(
              picks.signal.description.trim() || picks.signal.whyItMatters.trim(),
            )}
            badge={<ConfidenceBadge level={picks.signal.confidence} />}
            actionLabel="Open"
            href={`/signals/${picks.signal.id}`}
          />
        ) : null}
        {picks.contradiction ? (
          <PickCard
            kicker="Tension shaping futures"
            title={picks.contradiction.name}
            summary={explainContradiction(picks.contradiction)}
            actionLabel="Explore"
            href={`/contradictions/${picks.contradiction.id}`}
          />
        ) : null}
        {picks.territory ? (
          <PickCard
            kicker="Direction to watch"
            title={picks.territory.name}
            summary={picks.territory.oneLineDefinition}
            badge={<TerritoryStatusBadge status={picks.territory.monitoringStatus} />}
            actionLabel="Watch"
            href={`/territories/${picks.territory.id}`}
          />
        ) : null}
      </section>

      <section aria-label="Your review queue" className="mb-10">
        <h2 className="text-[15px] font-medium text-ink">Your review queue</h2>
        {queue.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-ink-soft">
            Nothing waiting today.{" "}
            <Link href="/explore" className={quietLink}>
              Explore what is changing
            </Link>
            , or{" "}
            <Link href="/watchlist" className={quietLink}>
              check your watchlist
            </Link>
            .
          </p>
        ) : (
          <div className="mt-2">
            {queue.map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <footer className="flex flex-wrap gap-x-8 gap-y-2">
        <Link href="/finds" className={quietLink}>
          Review finds
        </Link>
        <Link href="/watchlist" className={quietLink}>
          Open watchlist
        </Link>
        <Link href="/futures" className={quietLink}>
          Explore futures
        </Link>
      </footer>
    </>
  );
}
