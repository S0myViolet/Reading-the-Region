"use client";

/**
 * Explore topic page — everything the platform currently knows about one
 * question, place or theme, gathered through the signal layer and written
 * in plain language. Short sections, whitespace over boxes; only sections
 * with content are rendered.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { ViewGate } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { findTopic, topicContent, type ExploreTopic } from "@/lib/explore";
import { explainContradiction } from "@/lib/explain";
import { firstSentence, numberWord, TREND_WORDS } from "@/lib/simple";
import { CONFIDENCE_LABELS, type Signal } from "@/lib/types";

const MAX_SIGNALS = 6;

function topicDescription(topic: ExploreTopic): string {
  if (topic.kind === "place") return `What is changing in ${topic.title}.`;
  return topic.hint;
}

function signalWeight(s: Signal): number {
  return s.scores.strategicRelevance + s.scores.novelty + s.scores.momentum;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-[13px] font-medium text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function ExploreTopicPage() {
  const params = useParams<{ slug: string }>();
  const hydrated = useHydrated();
  const data = useIntelligenceStore();

  const slug = typeof params?.slug === "string" ? params.slug : "";
  const topic = findTopic(slug);

  if (!topic) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Explore", href: "/explore" }, { label: "Unknown topic" }]}
        />
        <PageHeader
          title="Topic not found"
          description="Nothing in the Explore index matches this address."
        />
        <p className="text-[12.5px]">
          <Link
            href="/explore"
            className="text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Back to Explore
          </Link>
        </p>
      </>
    );
  }

  const header = (
    <>
      <Breadcrumbs
        items={[{ label: "Explore", href: "/explore" }, { label: topic.title }]}
      />
      <PageHeader title={topic.title} description={topicDescription(topic)} />
      {topic.plainSummary ? (
        <p className="-mt-4 mb-8 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          <span className="text-ink-faint">In plain English — </span>
          {topic.plainSummary}
        </p>
      ) : null}
    </>
  );

  if (!hydrated) {
    return (
      <>
        {header}
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const content = topicContent(topic, data);
  const isEmpty =
    content.signals.length === 0 &&
    content.clusters.length === 0 &&
    content.contradictions.length === 0 &&
    content.indicators.length === 0 &&
    content.implications.length === 0;

  if (isEmpty) {
    return (
      <>
        {header}
        <p className="max-w-xl text-[13px] leading-relaxed text-ink-soft">
          Nothing gathered under this topic yet. The picture will fill in as
          scanning continues.
        </p>
        <p className="mt-3 text-[12.5px]">
          <Link
            href="/explore"
            className="text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Browse other topics
          </Link>
        </p>
      </>
    );
  }

  const shownSignals = [...content.signals]
    .sort((a, b) => signalWeight(b) - signalWeight(a))
    .slice(0, MAX_SIGNALS);
  const moreSignals = content.signals.length - shownSignals.length;

  // First three unique open questions recorded across the matched signals
  // (advanced mode only — rendered behind the analyst gate below).
  const openQuestions: string[] = [];
  const seenQuestions = new Set<string>();
  for (const s of content.signals) {
    for (const q of s.openQuestions) {
      const key = q.trim().toLowerCase();
      if (!key || seenQuestions.has(key)) continue;
      seenQuestions.add(key);
      openQuestions.push(q.trim());
      if (openQuestions.length === 3) break;
    }
    if (openQuestions.length === 3) break;
  }

  return (
    <>
      {header}

      {content.signals.length > 0 ? (
        <Section title="Key signals">
          <div>
            {shownSignals.map((s) => (
              <Link key={s.id} href={`/signals/${s.id}`} className="list-row group">
                <p className="truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                  {s.title}
                </p>
                <p className="mt-1 text-[12px] text-ink-faint">
                  {[firstSentence(s.whyItMatters), CONFIDENCE_LABELS[s.confidence]]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </Link>
            ))}
          </div>
          {moreSignals > 0 ? (
            <Link
              href="/signals"
              className="mt-2 inline-block text-[11.5px] text-ink-faint hover:text-ink-soft"
            >
              and {numberWord(moreSignals)} more in Signals
            </Link>
          ) : null}
        </Section>
      ) : null}

      {content.clusters.length > 0 ? (
        <Section title="Emerging stories">
          <div>
            {content.clusters.map((c) => (
              <Link key={c.id} href={`/clusters/${c.id}`} className="list-row group">
                <p className="truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                  {c.name}
                </p>
                <p className="mt-1 text-[12px] text-ink-faint">
                  {firstSentence(c.clusterStatement)}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {content.contradictions.length > 0 ? (
        <Section title="Tensions">
          <div>
            {content.contradictions.map((c) => (
              <Link
                key={c.id}
                href={`/contradictions/${c.id}`}
                className="list-row group"
              >
                <p className="truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                  {c.name}
                </p>
                <p className="mt-1 line-clamp-2 max-w-2xl text-[12px] leading-relaxed text-ink-faint">
                  {explainContradiction(c)}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {content.indicators.length > 0 ? (
        <Section title="On the watchlist">
          <div>
            {content.indicators.map((i) => (
              <Link key={i.id} href="/watchlist" className="list-row group">
                <div className="flex items-baseline justify-between gap-6">
                  <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                    {i.name}
                  </p>
                  <span className="shrink-0 text-[11.5px] text-ink-faint">
                    {TREND_WORDS[i.trend]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {content.implications.length > 0 ? (
        <Section title="What this could mean">
          <div>
            {content.implications.map((imp) => (
              <Link key={imp.id} href="/decisions" className="list-row group">
                <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft group-hover:text-ink">
                  {firstSentence(imp.implication)}
                </p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <ViewGate min="analyst">
        <Section title="Open questions">
          {openQuestions.length > 0 ? (
            <ul className="mt-1 space-y-1.5">
              {openQuestions.map((q) => (
                <li
                  key={q}
                  className="max-w-2xl text-[13px] leading-relaxed text-ink-soft"
                >
                  {q}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[12.5px] text-ink-faint">
              No open questions recorded for this topic yet.
            </p>
          )}
        </Section>
      </ViewGate>
    </>
  );
}
