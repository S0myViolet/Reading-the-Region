"use client";

/**
 * Intelligence Overview — the command center.
 *
 * Reads the whole intelligence base and surfaces: layer counts, the pipeline,
 * what needs attention today, signals worth attention, emerging
 * contradictions, strengthening territories, the noise filter, and the
 * management center (system health). All data is derived client-side from the
 * persisted store, so the page is hydration-gated.
 *
 * Calm idiom: plain sections separated by whitespace and type hierarchy —
 * no stat cards, no boxed dashboards. "What needs attention today" is the
 * landing point after the numbers.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { TerritoryStatusBadge } from "@/components/badges";
import { ContradictionPanel } from "@/components/ContradictionPanel";
import { EmptyState } from "@/components/EmptyState";
import { IntelligencePipeline } from "@/components/IntelligencePipeline";
import { PageHeader } from "@/components/PageHeader";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { RECOMMENDED_WORKFLOW } from "@/lib/copy";
import {
  contradictionsEmerging,
  guidanceTasks,
  managementCenter,
  noiseArchive,
  pipelineCounts,
  signalsNeedingReview,
  signalsWorthAttention,
  strengtheningTerritories,
  type ManagementItem,
} from "@/lib/derived";
import { scoreHeadline } from "@/lib/explain";
import { useHydrated, useIntelligenceStore, type IntelligenceData } from "@/lib/store";
import { CONFIDENCE_LABELS, OBSERVATION_STATUS_LABELS } from "@/lib/types";

// ---------------------------------------------------------------------------
// Local presentational helpers
// ---------------------------------------------------------------------------

function formatDate(x: string): string {
  return new Date(x).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Plain figure: mono number over a small faint label. A quiet link, no box. */
function StatFigure({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="group block">
      <span className="block font-mono text-[20px] leading-none text-ink group-hover:text-accent-ink">
        {value}
      </span>
      <span className="mt-1.5 block text-[11px] leading-snug text-ink-faint group-hover:text-ink-soft">
        {label}
      </span>
    </Link>
  );
}

/** Section = heading + optional one-line faint caption + content. No card. */
function Section({
  title,
  caption,
  href,
  linkLabel,
  small = false,
  children,
}: {
  title: string;
  caption?: string;
  href?: string;
  linkLabel?: string;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="max-w-2xl">
          <h2 className={`${small ? "text-[13px]" : "text-[15px]"} font-medium text-ink`}>
            {title}
          </h2>
          {caption ? <p className="mt-0.5 text-[12px] text-ink-faint">{caption}</p> : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 text-[12px] text-ink-faint underline-offset-2 hover:text-accent-ink hover:underline"
          >
            {linkLabel ?? "View all"}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Quiet management group: heading + count inline, then up to 3 plain links. */
function ManagementGroup({ item }: { item: ManagementItem }) {
  if (item.count === 0) {
    return (
      <p className="text-[12px] text-ink-faint" title={item.detail}>
        {item.title} · 0
      </p>
    );
  }
  return (
    <div title={item.detail}>
      <p className="text-[13px] text-ink">
        <Link href={item.href} className="font-medium hover:text-accent-ink">
          {item.title}
        </Link>
        <span className="text-ink-faint"> · {item.count}</span>
      </p>
      <ul className="mt-1.5 space-y-1">
        {item.items.slice(0, 3).map((it) => (
          <li key={it.id} className="truncate text-[12.5px] leading-snug">
            <Link href={it.href} className="text-ink-soft hover:text-accent-ink hover:underline">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const hydrated = useHydrated();
  const viewMode = useViewMode();
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
  const [workflowOpen, setWorkflowOpen] = useState(false);

  const data: IntelligenceData = useMemo(
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

  const derived = useMemo(() => {
    const needsReviewStatuses = ["needs_human_review", "ai_suggested", "needs_evidence"];
    return {
      pipeline: pipelineCounts(data),
      tasks: guidanceTasks(data),
      attention: signalsWorthAttention(data).slice(0, 6),
      emerging: contradictionsEmerging(data).slice(0, 2),
      strengthening: strengtheningTerritories(data),
      noise: noiseArchive(data),
      management: managementCenter(data),
      needingReview: signalsNeedingReview(data),
      validatedSignals: data.signals.filter((s) => s.reviewStatus === "validated").length,
      weakInReview: data.signals.filter(
        (s) => s.signalStrength === "weak" && needsReviewStatuses.includes(s.reviewStatus),
      ).length,
      activeClusters: data.clusters.filter((c) => c.status !== "dissolved").length,
      validatedPatterns: data.patterns.filter((p) => p.validationStatus === "validated").length,
      candidateDrivers: data.drivers.filter((d) => d.status === "hypothesis").length,
      strengtheningIndicators: data.indicators.filter((i) => i.trend === "strengthening").length,
    };
  }, [data]);

  if (!hydrated) {
    return (
      <>
        <PageHeader
          title="Intelligence Overview"
          description="The health of the whole intelligence system: what is moving, what needs review, and where evidence is weak."
        />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const stats: Array<{ label: string; value: number; href: string }> = [
    { label: "Observations", value: data.observations.length, href: "/inbox" },
    { label: "Validated signals", value: derived.validatedSignals, href: "/signals" },
    { label: "Weak signals in review", value: derived.weakInReview, href: "/signals" },
    { label: "Active clusters", value: derived.activeClusters, href: "/clusters" },
    { label: "Validated patterns", value: derived.validatedPatterns, href: "/patterns" },
    { label: "Contradictions", value: data.contradictions.length, href: "/contradictions" },
    { label: "Candidate drivers", value: derived.candidateDrivers, href: "/drivers" },
    { label: "Future territories", value: data.territories.length, href: "/territories" },
    { label: "Scenarios", value: data.scenarios.length, href: "/scenarios" },
    { label: "Strategic implications", value: data.implications.length, href: "/implications" },
    {
      label: "Indicators strengthening",
      value: derived.strengtheningIndicators,
      href: "/monitoring",
    },
    {
      label: "Awaiting human review",
      value: derived.needingReview.length,
      href: "/signals?review=needs_human_review",
    },
  ];

  return (
    <>
      <PageHeader
        title="Intelligence Overview"
        description="The health of the whole intelligence system: what is moving, what needs review, and where evidence is weak."
      />
      <WalkthroughPanel pageId="overview" />

      {/* Stat strip: plain figures, no boxes ------------------------------- */}
      <div className="mb-12 flex flex-wrap gap-x-10 gap-y-6">
        {stats.map((s) => (
          <StatFigure key={s.label} label={s.label} value={s.value} href={s.href} />
        ))}
      </div>

      {/* Pipeline ----------------------------------------------------------- */}
      <Section title="Intelligence pipeline" small>
        <IntelligencePipeline counts={derived.pipeline} />
      </Section>

      {/* What needs attention today ----------------------------------------- */}
      <Section
        title="What needs attention today"
        caption="Task-based guidance derived from the current state of the base."
      >
        {derived.tasks.length > 0 ? (
          <div>
            {derived.tasks.map((t) => (
              <Link key={t.href + t.text} href={t.href} className="list-row group">
                <p className="text-[13.5px] font-medium leading-snug text-ink group-hover:text-accent-ink">
                  {t.text}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
            The system is current: no unreviewed observations, no items awaiting review, and no
            overdue indicators. Keep to the re-scanning cadence — weekly for the Scan Inbox and
            weak signals, monthly for clusters and patterns, quarterly for drivers and
            territories.
          </p>
        )}
      </Section>

      {/* Signals worth attention -------------------------------------------- */}
      <Section
        title="Signals Worth Attention"
        caption="High novelty, low confidence, high strategic relevance — early material that could matter."
        href="/signals"
        linkLabel="Open the Signal Library"
      >
        {derived.attention.length > 0 ? (
          <div>
            {derived.attention.map((s) => (
              <Link key={s.id} href={`/signals/${s.id}`} className="list-row group">
                <p className="truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                  {s.title}
                </p>
                <p className="mt-1 text-[12px] text-ink-faint">
                  {scoreHeadline("novelty", s.scores.novelty)} ·{" "}
                  {scoreHeadline("strategicRelevance", s.scores.strategicRelevance)} ·{" "}
                  {CONFIDENCE_LABELS[s.confidence]}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No signal currently combines high novelty with low confidence and high strategic relevance. This section surfaces early material that could matter before it is well evidenced — promote observations from the Scan Inbox and score them in the Signal Library to populate it."
            actionLabel="Open the Signal Library"
            actionHref="/signals"
          />
        )}
      </Section>

      {/* Contradictions emerging -------------------------------------------- */}
      <Section
        title="Contradictions Emerging"
        caption="Ranked by tension strength × future impact. Contradictions are strategic material, not errors."
        href="/contradictions"
        linkLabel="View all contradictions"
      >
        {derived.emerging.length > 0 ? (
          <div className="space-y-8">
            {derived.emerging.map((c) => (
              <ContradictionPanel key={c.id} contradiction={c} linked />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No contradictions have been logged yet. Foresight without opposing evidence is under-scanned — when two valid forces pull in different directions across your signals, record the tension as a contradiction."
            actionLabel="Open Contradictions"
            actionHref="/contradictions"
          />
        )}
      </Section>

      {/* Strengthening territories ------------------------------------------ */}
      <Section
        title="Recently Strengthening Territories"
        caption="Territories whose leading indicators are trending upward."
        href="/territories"
        linkLabel="View all territories"
      >
        {derived.strengthening.length > 0 ? (
          <div>
            {derived.strengthening.map(({ territory, indicators: linked, strengthening }) => (
              <Link
                key={territory.id}
                href={`/territories/${territory.id}`}
                className="list-row group"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                    {territory.name}
                  </p>
                  <span className="shrink-0">
                    <TerritoryStatusBadge status={territory.monitoringStatus} />
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-ink-faint">
                  {strengthening.length} of {linked.length} indicators strengthening
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No territory is currently strengthening. A territory appears here when its leading monitoring indicators trend upward — check and update indicators on the Monitoring page to keep territory status honest."
            actionLabel="Open Monitoring"
            actionHref="/monitoring"
          />
        )}
      </Section>

      {viewMode === "simple" ? (
        <div className="mb-12">
          <DepthHint>System health, the noise archive and management queries</DepthHint>
        </div>
      ) : null}

      <ViewGate min="analyst">
        {/* Noise filter ------------------------------------------------------ */}
        <Section
          title="Noise Filter"
          caption="Noise filtering is auditable, not silent — every archived or duplicate observation keeps its triage rationale."
          href="/inbox?status=archived_noise"
          linkLabel="View in Scan Inbox"
          small
        >
          {derived.noise.length > 0 ? (
            <div>
              {derived.noise.map((o) => (
                <Link key={o.id} href={`/inbox/${o.id}`} className="list-row group">
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                      {o.title}
                    </p>
                    <span className="shrink-0 text-[11.5px] text-ink-faint">
                      {OBSERVATION_STATUS_LABELS[o.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                    {o.triageRationale ??
                      "No rationale recorded — add one so the archive stays auditable."}{" "}
                    · {formatDate(o.dateObserved)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              message="Nothing has been archived as noise yet. When you archive an observation or mark it as a duplicate in the Scan Inbox, it is kept here with its triage rationale so the filtering decision can be audited later."
              actionLabel="Open the Scan Inbox"
              actionHref="/inbox"
            />
          )}
        </Section>

        {/* Management center -------------------------------------------------- */}
        <Section
          title="Management Center — system health"
          caption="Where the base is weak, unreviewed, or below threshold. Work these queues to keep conclusions defensible."
          small
        >
          <div className="grid items-start gap-x-10 gap-y-7 md:grid-cols-2">
            {derived.management.map((item) => (
              <ManagementGroup key={item.title} item={item} />
            ))}
          </div>
        </Section>
      </ViewGate>

      {/* Recommended workflow ------------------------------------------------ */}
      <section className="mb-10">
        <button
          onClick={() => setWorkflowOpen((o) => !o)}
          aria-expanded={workflowOpen}
          className="text-[13px] font-medium text-ink hover:text-accent-ink"
        >
          {workflowOpen ? "▾" : "▸"} Recommended workflow · {RECOMMENDED_WORKFLOW.length} steps
        </button>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          From raw observation to monitored foresight.
        </p>
        {workflowOpen ? (
          <ol className="mt-4 max-w-2xl list-decimal space-y-2.5 pl-6 marker:text-[11.5px] marker:text-ink-faint">
            {RECOMMENDED_WORKFLOW.map((w) => (
              <li key={w.step} className="text-[12.5px] leading-relaxed">
                <span className="font-medium text-ink">{w.title}</span>
                <span className="text-ink-faint"> — {w.detail}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </>
  );
}
