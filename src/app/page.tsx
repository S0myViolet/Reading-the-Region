"use client";

/**
 * Intelligence Overview — the command center.
 *
 * Reads the whole intelligence base and surfaces: layer counts, the pipeline,
 * what needs attention today, signals worth attention, emerging
 * contradictions, strengthening territories, the noise filter, and the
 * management center (system health). All data is derived client-side from the
 * persisted store, so the page is hydration-gated.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ConfidenceBadge,
  IdChip,
  Pill,
  SignalStrengthBadge,
  TerritoryStatusBadge,
} from "@/components/badges";
import { ContradictionPanel } from "@/components/ContradictionPanel";
import { EmptyState } from "@/components/EmptyState";
import { IntelligencePipeline } from "@/components/IntelligencePipeline";
import { PageHeader } from "@/components/PageHeader";
import { ScoreBar } from "@/components/ScorePanel";
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
import { useHydrated, useIntelligenceStore, type IntelligenceData } from "@/lib/store";
import { OBSERVATION_STATUS_LABELS, SCORE_RUBRICS } from "@/lib/types";

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

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card block px-3 py-2.5 hover:border-line-strong">
      <span className="block font-mono text-[19px] leading-none text-ink">{value}</span>
      <span className="overline-label mt-1.5 block leading-snug">{label}</span>
    </Link>
  );
}

function SectionHeading({
  title,
  caption,
  href,
  linkLabel,
}: {
  title: string;
  caption?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <div>
        <h2 className="overline-label">{title}</h2>
        {caption ? <p className="mt-0.5 text-[11.5px] text-ink-faint">{caption}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
        >
          {linkLabel ?? "View all"}
        </Link>
      ) : null}
    </div>
  );
}

function ManagementCard({ item }: { item: ManagementItem }) {
  const clear = item.count === 0;
  return (
    <div className={`card flex flex-col ${clear ? "opacity-70" : ""}`}>
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-2.5">
        <h3 className="text-[12.5px] font-medium leading-snug text-ink">{item.title}</h3>
        <span
          className={`font-mono text-[17px] leading-none ${clear ? "text-ink-faint" : "text-ink"}`}
        >
          {item.count}
        </span>
      </header>
      <div className="flex-1 px-4 py-2.5">
        <p className="text-[11.5px] leading-relaxed text-ink-faint">{item.detail}</p>
        {clear ? (
          <p className="mt-2 text-[11.5px] text-ink-faint">Clear — nothing pending here.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {item.items.map((it) => (
              <li key={it.id} className="truncate text-[12px] leading-snug">
                <Link href={it.href} className="text-ink-soft hover:text-accent-ink hover:underline">
                  <span className="font-mono text-[10.5px] text-ink-faint">{it.id}</span>{" "}
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <footer className="border-t border-line px-4 py-1.5">
        <Link
          href={item.href}
          className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
        >
          View
        </Link>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const hydrated = useHydrated();
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
      emerging: contradictionsEmerging(data).slice(0, 3),
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
          overline="Command"
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
        overline="Command"
        title="Intelligence Overview"
        description="The health of the whole intelligence system: what is moving, what needs review, and where evidence is weak."
      />
      <WalkthroughPanel pageId="overview" />

      {/* Stat strip ------------------------------------------------------- */}
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} href={s.href} />
        ))}
      </div>

      {/* Pipeline --------------------------------------------------------- */}
      <section className="mb-6">
        <SectionHeading
          title="Intelligence pipeline"
          caption="Evidence moves upward one layer at a time. Each layer reduces noise while increasing meaning."
        />
        <IntelligencePipeline counts={derived.pipeline} />
      </section>

      {/* What needs attention today --------------------------------------- */}
      <section className="mb-6">
        <SectionHeading
          title="What needs attention today"
          caption="Task-based guidance derived from the current state of the base."
        />
        <div className="card">
          {derived.tasks.length > 0 ? (
            <ul className="divide-y divide-line">
              {derived.tasks.map((t) => (
                <li key={t.href + t.text}>
                  <Link
                    href={t.href}
                    className="flex items-baseline justify-between gap-4 px-4 py-2.5 hover:bg-surface-muted"
                  >
                    <span className="text-[13px] text-ink-soft">{t.text}</span>
                    <span className="shrink-0 text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2">
                      Go
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-[13px] text-ink-soft">
              The system is current: no unreviewed observations, no items awaiting review, and no
              overdue indicators. Keep to the re-scanning cadence — weekly for the Scan Inbox and
              weak signals, monthly for clusters and patterns, quarterly for drivers and
              territories.
            </p>
          )}
        </div>
      </section>

      {/* Signals worth attention ------------------------------------------ */}
      <section className="mb-6">
        <SectionHeading
          title="Signals Worth Attention"
          caption="High novelty, low confidence, high strategic relevance — early material that could matter."
          href="/signals"
          linkLabel="Open the Signal Library"
        />
        {derived.attention.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {derived.attention.map((s) => (
              <article key={s.id} className="card flex flex-col">
                <header className="border-b border-line px-4 py-2.5">
                  <p className="overline-label mb-0.5">
                    Signal <IdChip id={s.id} />
                  </p>
                  <h3 className="text-[14px] font-medium leading-snug text-ink">
                    <Link href={`/signals/${s.id}`} className="hover:underline">
                      {s.title}
                    </Link>
                  </h3>
                </header>
                <div className="flex-1 px-4 py-2.5">
                  <p className="line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                    {s.description}
                  </p>
                  <div className="mt-2.5 space-y-1.5">
                    <ScoreBar
                      value={s.scores.novelty}
                      label="Novelty"
                      rubric={SCORE_RUBRICS.novelty[s.scores.novelty]}
                    />
                    <ScoreBar
                      value={s.scores.strategicRelevance}
                      label="Strategic relevance"
                      rubric={SCORE_RUBRICS.strategicRelevance[s.scores.strategicRelevance]}
                    />
                  </div>
                </div>
                <footer className="flex flex-wrap items-center gap-1.5 border-t border-line px-4 py-2">
                  <ConfidenceBadge level={s.confidence} />
                  <SignalStrengthBadge strength={s.signalStrength} />
                  <Link
                    href={`/signals/${s.id}`}
                    className="ml-auto text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                  >
                    Open signal
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No signal currently combines high novelty with low confidence and high strategic relevance. This section surfaces early material that could matter before it is well evidenced — promote observations from the Scan Inbox and score them in the Signal Library to populate it."
            actionLabel="Open the Signal Library"
            actionHref="/signals"
          />
        )}
      </section>

      {/* Contradictions emerging ------------------------------------------ */}
      <section className="mb-6">
        <SectionHeading
          title="Contradictions Emerging"
          caption="Ranked by tension strength × future impact. Contradictions are strategic material, not errors."
          href="/contradictions"
          linkLabel="View all contradictions"
        />
        {derived.emerging.length > 0 ? (
          <div className="space-y-3">
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
      </section>

      {/* Strengthening territories ---------------------------------------- */}
      <section className="mb-6">
        <SectionHeading
          title="Recently Strengthening Territories"
          caption="Territories whose leading indicators are trending upward."
          href="/territories"
          linkLabel="View all territories"
        />
        {derived.strengthening.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {derived.strengthening.map(({ territory, indicators: linked, strengthening }) => (
              <article key={territory.id} className="card px-4 py-3">
                <p className="overline-label mb-0.5">
                  Future territory <IdChip id={territory.id} />
                </p>
                <h3 className="text-[14px] font-medium leading-snug text-ink">
                  <Link href={`/territories/${territory.id}`} className="hover:underline">
                    {territory.name}
                  </Link>
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <TerritoryStatusBadge status={territory.monitoringStatus} />
                  <span className="text-[11.5px] text-ink-faint">
                    <span className="font-mono">{strengthening.length}</span> of{" "}
                    <span className="font-mono">{linked.length}</span> indicators strengthening
                  </span>
                </div>
                <Link
                  href={`/territories/${territory.id}`}
                  className="mt-2 inline-block text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                >
                  Open territory
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No territory is currently strengthening. A territory appears here when its leading monitoring indicators trend upward — check and update indicators on the Monitoring page to keep territory status honest."
            actionLabel="Open Monitoring"
            actionHref="/monitoring"
          />
        )}
      </section>

      {/* Noise filter ------------------------------------------------------ */}
      <section className="mb-6">
        <SectionHeading
          title="Noise Filter"
          caption="Noise filtering is auditable, not silent — every archived or duplicate observation keeps its triage rationale."
          href="/inbox?status=archived_noise"
          linkLabel="View in Scan Inbox"
        />
        {derived.noise.length > 0 ? (
          <div className="card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Observation</th>
                  <th>Status</th>
                  <th>Why this was not promoted</th>
                  <th>Observed</th>
                </tr>
              </thead>
              <tbody>
                {derived.noise.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <IdChip id={o.id} />
                    </td>
                    <td>
                      <Link
                        href={`/inbox/${o.id}`}
                        className="text-ink hover:text-accent-ink hover:underline"
                      >
                        {o.title}
                      </Link>
                    </td>
                    <td>
                      <Pill tone="neutral">{OBSERVATION_STATUS_LABELS[o.status]}</Pill>
                    </td>
                    <td className="text-[12.5px] text-ink-soft">
                      {o.triageRationale ?? (
                        <span className="text-ink-faint">
                          No rationale recorded — add one so the archive stays auditable.
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-[12px] text-ink-faint">
                      {formatDate(o.dateObserved)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            message="Nothing has been archived as noise yet. When you archive an observation or mark it as a duplicate in the Scan Inbox, it is kept here with its triage rationale so the filtering decision can be audited later."
            actionLabel="Open the Scan Inbox"
            actionHref="/inbox"
          />
        )}
      </section>

      {/* Management center -------------------------------------------------- */}
      <section className="mb-6">
        <SectionHeading
          title="Management Center — system health"
          caption="Where the base is weak, unreviewed, or below threshold. Work these queues to keep conclusions defensible."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {derived.management.map((item) => (
            <ManagementCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      {/* Recommended workflow ----------------------------------------------- */}
      <section className="mb-6">
        <div className="card">
          <header className="flex items-center justify-between px-4 py-2.5">
            <button
              onClick={() => setWorkflowOpen((o) => !o)}
              className="overline-label hover:text-accent-ink"
              aria-expanded={workflowOpen}
            >
              {workflowOpen ? "▾" : "▸"} Recommended workflow — {RECOMMENDED_WORKFLOW.length} steps
            </button>
            <span className="text-[11px] text-ink-faint">
              From raw observation to monitored foresight
            </span>
          </header>
          {workflowOpen ? (
            <ol className="divide-y divide-line border-t border-line">
              {RECOMMENDED_WORKFLOW.map((w) => (
                <li key={w.step} className="flex items-baseline gap-3 px-4 py-2">
                  <span className="w-6 shrink-0 text-right font-mono text-[11.5px] text-ink-faint">
                    {w.step}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-medium text-ink">{w.title}</p>
                    <p className="text-[11.5px] text-ink-faint">{w.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>
    </>
  );
}
