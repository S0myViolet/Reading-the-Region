"use client";

/**
 * The entry point changes meaning by mode. Simple: Today — a daily
 * brief (what moved, three priorities, the review queue, movement on
 * the watchlist, and one or two present-day actions). Advanced: the
 * Intelligence Overview command center, rendered in place so the
 * toggle preserves context.
 */

import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { ConfidenceBadge, TerritoryStatusBadge } from "@/components/badges";
import { useAppMode } from "@/components/ViewMode";
import { indicatorOverdue } from "@/lib/derived";
import { signalStage } from "@/lib/pipeline";
import OverviewCommandCenter from "./overview/page";
import {
  FIND_VERDICT_WORDS,
  TREND_WORDS,
  dailyBrief,
  doNowActions,
  findVerdict,
  firstSentence,
  movementSinceLastCheck,
  todayPicks,
  todaysQueue,
  type QueueItem,
} from "@/lib/simple";
import {
  useHydrated,
  useIntelligenceStore,
  type IntelligenceData,
} from "@/lib/store";
import {
  CONFIDENCE_LABELS,
  type ConfidenceLevel,
  type FutureTerritory,
  type MonitoringIndicator,
} from "@/lib/types";

const openLink =
  "text-[12.5px] font-medium text-accent-ink underline-offset-2 hover:underline";
const quietLink = "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Confidence as words; DoNowAction carries the level as a plain string. */
function confidenceInWords(level: string): string {
  return (CONFIDENCE_LABELS as Record<string, string>)[level] ?? level;
}

function PickCard({
  kicker,
  title,
  badge,
  actionLabel,
  href,
  children,
}: {
  kicker: string;
  title: string;
  badge?: React.ReactNode;
  actionLabel: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col gap-2 p-5">
      <p className="text-[11px] text-ink-faint">{kicker}</p>
      <p className="text-[14.5px] font-medium leading-snug text-ink">{title}</p>
      {children}
      {badge ? <div className="flex flex-wrap items-center gap-2">{badge}</div> : null}
      <div className="mt-auto pt-2">
        <Link href={href} className={openLink}>
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

function QueueRow({
  item,
  verdictWord,
  confidence,
}: {
  item: QueueItem;
  verdictWord?: string;
  confidence?: ConfidenceLevel;
}) {
  const keepFind = useIntelligenceStore((s) => s.keepFind);
  const setObservationStatus = useIntelligenceStore((s) => s.setObservationStatus);

  return (
    <div className="list-row">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink">{item.title}</p>
        <span className="flex shrink-0 items-baseline gap-4 text-[12px]">
          {verdictWord ? (
            <span className="text-[11.5px] text-ink-faint">{verdictWord}</span>
          ) : null}
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
              <button
                onClick={() =>
                  setObservationStatus(
                    item.id,
                    "needs_more_evidence",
                    "Marked as needing more proof from the Today queue.",
                  )
                }
                className="text-ink-faint underline-offset-2 hover:text-ink-soft"
              >
                Need more proof
              </button>
            </>
          ) : null}
          {confidence ? <ConfidenceBadge level={confidence} /> : null}
          <Link
            href={item.href}
            className="font-medium text-accent-ink underline-offset-2 hover:underline"
          >
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

function MovementRow({
  indicator,
  territory,
}: {
  indicator: MonitoringIndicator;
  territory: FutureTerritory | null;
}) {
  return (
    <div className="list-row">
      <Link href="/watchlist" className="block min-w-0">
        <p className="truncate text-[13.5px] font-medium text-ink hover:text-accent-ink">
          {indicator.name}
        </p>
      </Link>
      <p className="mt-1 text-[12px] text-ink-faint">
        {firstSentence(indicator.currentStatus)}
        {" · Last checked "}
        {formatDate(indicator.dateLastChecked)}
        {territory ? (
          <>
            {" · Watching "}
            <Link
              href={`/territories/${territory.id}`}
              className="underline-offset-2 hover:text-ink-soft hover:underline"
            >
              {territory.name}
            </Link>
          </>
        ) : null}
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

  const brief = useMemo(() => dailyBrief(data), [data]);
  const picks = useMemo(() => todayPicks(data), [data]);
  const queue = useMemo(() => todaysQueue(data, keptFindIds), [data, keptFindIds]);

  const queueRows = useMemo(
    () =>
      queue.map((item) => {
        if (item.kind === "find") {
          const obs = data.observations.find((o) => o.id === item.id);
          return {
            item,
            verdictWord: obs ? FIND_VERDICT_WORDS[findVerdict(obs)] : undefined,
            confidence: undefined as ConfidenceLevel | undefined,
          };
        }
        const signal = data.signals.find((s) => s.id === item.id);
        return {
          item,
          verdictWord: undefined as string | undefined,
          confidence: signal?.confidence,
        };
      }),
    [queue, data],
  );

  const movementGroups = useMemo(() => {
    const movement = movementSinceLastCheck(data, (i) => indicatorOverdue(i));
    return [
      { key: "stronger", heading: TREND_WORDS.strengthening, items: movement.stronger },
      { key: "weaker", heading: TREND_WORDS.weakening, items: movement.weaker },
      { key: "attention", heading: "Needs attention", items: movement.needsAttention },
    ].filter((group) => group.items.length > 0);
  }, [data]);

  const actions = useMemo(() => doNowActions(data, 2), [data]);

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
      <PageHeader
        title="Today in the Region"
        description="A daily brief on what is moving, what needs review, and what may matter next."
      />
      <WalkthroughPanel pageId="today" />

      <section aria-label="Daily brief" className="mb-10">
        <p className="max-w-2xl text-[14px] leading-relaxed text-ink-soft">{brief}</p>
      </section>

      <section aria-label="Today's picks" className="mb-10 grid gap-4 sm:grid-cols-3">
        {picks.signal ? (
          <PickCard
            kicker="Signal worth attention"
            title={picks.signal.title}
            badge={
              <>
                <ConfidenceBadge level={picks.signal.confidence} />
                <PipelineStageBadge stage={signalStage(picks.signal)} />
              </>
            }
            actionLabel="Open"
            href={`/signals/${picks.signal.id}`}
          >
            <p className="line-clamp-3 text-[12.5px] leading-relaxed text-ink-soft">
              {firstSentence(
                picks.signal.description.trim() || picks.signal.whyItMatters.trim(),
              )}
            </p>
          </PickCard>
        ) : null}
        {picks.contradiction ? (
          <PickCard
            kicker="Tension shaping futures"
            title={picks.contradiction.name}
            actionLabel="Explore"
            href={`/contradictions/${picks.contradiction.id}`}
          >
            <div className="flex flex-col gap-1.5">
              <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-faint">
                One side — {firstSentence(picks.contradiction.sideA)}
              </p>
              <p className="line-clamp-2 text-[12px] leading-relaxed text-ink-faint">
                The other — {firstSentence(picks.contradiction.sideB)}
              </p>
              <p className="line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                Why it matters — {firstSentence(picks.contradiction.underlyingTension)}
              </p>
            </div>
          </PickCard>
        ) : null}
        {picks.territory ? (
          <PickCard
            kicker="Direction to watch"
            title={picks.territory.name}
            badge={<TerritoryStatusBadge status={picks.territory.monitoringStatus} />}
            actionLabel="Watch"
            href={`/territories/${picks.territory.id}`}
          >
            <p className="line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
              {picks.territory.oneLineDefinition}
            </p>
          </PickCard>
        ) : null}
      </section>

      <section aria-label="Your review queue" className="mb-10">
        <h2 className="text-[15px] font-medium text-ink">Your review queue</h2>
        {queueRows.length === 0 ? (
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
            {queueRows.map(({ item, verdictWord, confidence }) => (
              <QueueRow
                key={item.id}
                item={item}
                verdictWord={verdictWord}
                confidence={confidence}
              />
            ))}
          </div>
        )}
      </section>

      {movementGroups.length > 0 ? (
        <section aria-label="Movement since last check" className="mb-10">
          <h2 className="text-[15px] font-medium text-ink">Movement since last check</h2>
          {movementGroups.map((group) => (
            <div key={group.key} className="mt-4">
              <h3 className="text-[12px] font-medium text-ink-soft">{group.heading}</h3>
              <div>
                {group.items.map((indicator) => (
                  <MovementRow
                    key={indicator.id}
                    indicator={indicator}
                    territory={
                      data.territories.find((t) => t.id === indicator.territoryId) ?? null
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {actions.length > 0 ? (
        <section aria-label="Do now" className="mb-10">
          <h2 className="text-[15px] font-medium text-ink">Do now</h2>
          <div className="mt-1">
            {actions.map((action) => (
              <Link key={action.id} href="/decisions" className="group list-row py-5">
                <p className="text-[11px] text-ink-faint">For {action.who}</p>
                <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-ink group-hover:text-accent-ink">
                  {action.what}
                </p>
                <div className="mt-1.5 flex items-baseline justify-between gap-6">
                  <p className="text-[12px] text-ink-faint">Why now — {action.whyNow}</p>
                  <span className="shrink-0 text-[11.5px] text-ink-faint">
                    {confidenceInWords(action.confidence)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

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
