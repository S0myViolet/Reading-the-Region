"use client";

/**
 * Explore — browse what is changing, by question, place, or theme.
 *
 * This is a reading index, not a filter database: every entry is a door
 * into a topic page that gathers the relevant signals, stories, tensions
 * and watch items in plain language. Counts are computed only after
 * hydration so the static index renders identically on server and client.
 */

import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ViewGate } from "@/components/ViewMode";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  ALL_TOPICS,
  EXPLORE_PLACES,
  EXPLORE_QUESTIONS,
  EXPLORE_THEMES,
  topicContent,
  type ExploreTopic,
} from "@/lib/explore";
import { numberWord } from "@/lib/simple";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-[13px] font-medium text-ink">{children}</h2>;
}

// ---------------------------------------------------------------------------
// Discovery diagnostics (advanced mode only)
// ---------------------------------------------------------------------------

/** Per-topic health readings computed over the topic's matched evidence. */
interface TopicDiagnostics {
  topic: ExploreTopic;
  signalCount: number;
  /** Mean of the matched signals' evidence scores (1–5). */
  avgEvidence: number;
  /** Matched signals still rated weak. */
  weakCount: number;
  /** Matched signals with novelty >= 4 but low confidence. */
  highNoveltyLowConfidence: number;
  contradictionCount: number;
  /** Unique sectors across matched signals. */
  sectorSpread: number;
}

interface DiscoveryRow {
  slug: string;
  title: string;
  metric: string;
}

function DiscoveryList({
  title,
  caption,
  rows,
}: {
  title: string;
  caption: string;
  rows: DiscoveryRow[];
}) {
  return (
    <div>
      <h3 className="text-[13px] font-medium text-ink">{title}</h3>
      <p className="mt-0.5 text-[12px] text-ink-faint">{caption}</p>
      {rows.length > 0 ? (
        <div className="mt-2">
          {rows.map((r) => (
            <Link
              key={r.slug}
              href={`/explore/${r.slug}`}
              className="group flex items-baseline justify-between gap-6 py-[5px]"
            >
              <span className="min-w-0 truncate text-[13px] text-ink-soft group-hover:text-accent-ink">
                {r.title}
              </span>
              <span className="shrink-0 font-mono text-[11px] font-light text-ink-faint">
                {r.metric}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-ink-faint">
          No topic qualifies under this lens yet.
        </p>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const hydrated = useHydrated();
  const data = useIntelligenceStore();

  // Discovery diagnostics: computed once per data change, only after
  // hydration, so the server render and the first client render stay
  // identical (the section is analyst-gated and never renders pre-hydration).
  const discovery = useMemo(() => {
    if (!hydrated) return null;
    const diagnostics: TopicDiagnostics[] = ALL_TOPICS.map((topic) => {
      const content = topicContent(topic, data);
      const sectors = new Set<string>();
      let evidenceTotal = 0;
      let weakCount = 0;
      let earlyCount = 0;
      for (const s of content.signals) {
        evidenceTotal += s.scores.evidence;
        if (s.signalStrength === "weak") weakCount += 1;
        if (s.scores.novelty >= 4 && s.confidence === "low") earlyCount += 1;
        for (const sector of s.sectors) sectors.add(sector);
      }
      const signalCount = content.signals.length;
      return {
        topic,
        signalCount,
        avgEvidence: signalCount > 0 ? evidenceTotal / signalCount : 0,
        weakCount,
        highNoveltyLowConfidence: earlyCount,
        contradictionCount: content.contradictions.length,
        sectorSpread: sectors.size,
      };
    }).filter((d) => d.signalCount > 0);

    const row = (d: TopicDiagnostics, metric: string): DiscoveryRow => ({
      slug: d.topic.slug,
      title: d.topic.title,
      metric,
    });

    const underEvidenced = [...diagnostics]
      .sort(
        (a, b) => a.avgEvidence - b.avgEvidence || b.weakCount - a.weakCount,
      )
      .slice(0, 5)
      .map((d) =>
        row(
          d,
          `avg evidence ${d.avgEvidence.toFixed(1)}/5 across ${numberWord(d.signalCount)} signal${d.signalCount === 1 ? "" : "s"}`,
        ),
      );

    const earlyButUncertain = diagnostics
      .filter((d) => d.highNoveltyLowConfidence > 0)
      .sort((a, b) => b.highNoveltyLowConfidence - a.highNoveltyLowConfidence)
      .slice(0, 5)
      .map((d) =>
        row(
          d,
          `${numberWord(d.highNoveltyLowConfidence)} early signal${d.highNoveltyLowConfidence === 1 ? "" : "s"} that could matter`,
        ),
      );

    const contradictionDense = diagnostics
      .filter((d) => d.contradictionCount > 0)
      .sort((a, b) => b.contradictionCount - a.contradictionCount)
      .slice(0, 5)
      .map((d) =>
        row(
          d,
          d.contradictionCount === 1
            ? "one tension runs through this theme"
            : `${numberWord(d.contradictionCount)} tensions run through this theme`,
        ),
      );

    const crossSector = [...diagnostics]
      .sort((a, b) => b.sectorSpread - a.sectorSpread)
      .slice(0, 5)
      .map((d) =>
        row(
          d,
          `evidence spans ${numberWord(d.sectorSpread)} sector${d.sectorSpread === 1 ? "" : "s"}`,
        ),
      );

    return {
      hasTopics: diagnostics.length > 0,
      underEvidenced,
      earlyButUncertain,
      contradictionDense,
      crossSector,
    };
  }, [hydrated, data]);

  return (
    <>
      <PageHeader
        title="Explore"
        description="Browse what is changing — by question, place, or theme."
      />
      <WalkthroughPanel pageId="explore" />

      <section className="mb-10" aria-label="Browse by question">
        <SectionHeading>Browse by question</SectionHeading>
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {EXPLORE_QUESTIONS.map((topic) => {
            const count = hydrated ? topicContent(topic, data).signals.length : 0;
            return (
              <Link
                key={topic.slug}
                href={`/explore/${topic.slug}`}
                className="group -mx-3 rounded-[4px] px-3 py-3 transition-colors hover:bg-surface-muted"
              >
                <p className="text-[14px] font-medium leading-snug text-ink group-hover:text-accent-ink">
                  {topic.title}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-faint">
                  {topic.hint}
                  {hydrated && count > 0 ? (
                    <span>
                      {" "}
                      · {numberWord(count)} signal{count === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-10" aria-label="Browse by place">
        <SectionHeading>Browse by place</SectionHeading>
        <p className="flex max-w-2xl flex-wrap gap-x-6 gap-y-2">
          {EXPLORE_PLACES.map((topic) => (
            <Link
              key={topic.slug}
              href={`/explore/${topic.slug}`}
              title={topic.hint}
              className="text-[13.5px] text-ink-soft underline-offset-2 hover:text-accent-ink hover:underline"
            >
              {topic.title}
            </Link>
          ))}
        </p>
      </section>

      <section className="mb-10" aria-label="Browse by theme">
        <SectionHeading>Browse by theme</SectionHeading>
        <div className="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {EXPLORE_THEMES.map((topic) => (
            <Link
              key={topic.slug}
              href={`/explore/${topic.slug}`}
              title={topic.hint}
              className="text-[13px] text-ink-soft underline-offset-2 hover:text-accent-ink hover:underline"
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </section>

      <ViewGate min="analyst">
        {discovery ? (
          <section className="mb-10 mt-14" aria-label="Discovery">
            <h2 className="text-[15px] font-medium text-ink">
              Discovery — where the evidence base is thin, hot, or tense
            </h2>
            <p className="mt-1 max-w-2xl text-[12px] text-ink-faint">
              Four lenses over every Explore topic, computed from the signals,
              tensions and sectors gathered under each one.
            </p>
            {discovery.hasTopics ? (
              <div className="mt-7 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                <DiscoveryList
                  title="Under-evidenced"
                  caption="Topics resting on the thinnest evidence — conclusions here would be unsafe."
                  rows={discovery.underEvidenced}
                />
                <DiscoveryList
                  title="High novelty, low confidence"
                  caption="Topics carrying surprising signals that are not yet trusted — worth early attention."
                  rows={discovery.earlyButUncertain}
                />
                <DiscoveryList
                  title="Contradiction-dense"
                  caption="Topics where the evidence pulls in opposite directions — the richest ground for questions."
                  rows={discovery.contradictionDense}
                />
                <DiscoveryList
                  title="Cross-sector reach"
                  caption="Topics whose evidence reaches across the most sectors — candidates for systemic change."
                  rows={discovery.crossSector}
                />
              </div>
            ) : (
              <p className="mt-4 text-[12px] text-ink-faint">
                No topic has matched signals yet — the lenses fill in as
                scanning continues.
              </p>
            )}
          </section>
        ) : null}
      </ViewGate>
    </>
  );
}
