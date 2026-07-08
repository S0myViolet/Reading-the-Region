"use client";

/**
 * Overview — the advanced command center.
 *
 * An intelligence control room ordered by daily movement: the pipeline and
 * its headline figures, needs-attention triage (what is unsafe to rely on and
 * why), suggested tasks, recent movement between stages, contradictions, monitoring
 * movement, strengthening territories, then the analyst-gated noise filter
 * and system health queues. All data is derived client-side from the
 * persisted store, so the page is hydration-gated.
 *
 * Calm idiom: plain sections separated by whitespace and type hierarchy —
 * no stat cards, no boxed dashboards.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfidenceBadge, TerritoryStatusBadge, TrendBadge } from "@/components/badges";
import { ContradictionPanel } from "@/components/ContradictionPanel";
import { EmptyState } from "@/components/EmptyState";
import { EvidenceCompressionSummary } from "@/components/EvidenceCompression";
import { IntelligencePipeline } from "@/components/IntelligencePipeline";
import { PageHeader } from "@/components/PageHeader";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { RECOMMENDED_WORKFLOW } from "@/lib/copy";
import {
  contradictionsEmerging,
  evidenceTriage,
  guidanceTasks,
  indicatorOverdue,
  managementCenter,
  noiseArchive,
  pipelineCounts,
  recentStageMovements,
  signalsNeedingReview,
  strengtheningTerritories,
  type ManagementItem,
} from "@/lib/derived";
import { STAGE_LABELS, signalStage } from "@/lib/pipeline";
import { firstSentence } from "@/lib/simple";
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
function StageFigure({ label, value, href }: { label: string; value: number; href: string }) {
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
    const territoryNames = new Map(data.territories.map((t) => [t.id, t.name]));
    const monitoringMovement = data.indicators
      .map((indicator) => ({
        indicator,
        overdue: indicatorOverdue(indicator),
        territoryName: indicator.territoryId
          ? (territoryNames.get(indicator.territoryId) ?? null)
          : null,
      }))
      .filter((x) => x.indicator.trend !== "stable" || x.overdue)
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        return b.indicator.dateLastChecked.localeCompare(a.indicator.dateLastChecked);
      })
      .slice(0, 6);

    return {
      pipeline: pipelineCounts(data),
      triage: evidenceTriage(data),
      tasks: guidanceTasks(data),
      movements: recentStageMovements(data, 6),
      emerging: contradictionsEmerging(data).slice(0, 2),
      strengthening: strengtheningTerritories(data),
      noise: noiseArchive(data),
      management: managementCenter(data),
      needingReview: signalsNeedingReview(data).length,
      signalCandidates: data.signals.filter((s) => signalStage(s) === "signal_candidate").length,
      validSignals: data.signals.filter((s) => signalStage(s) === "valid_signal").length,
      indicatorsMoving: data.indicators.filter((i) => i.trend !== "stable").length,
      monitoringMovement,
    };
  }, [data]);

  if (!hydrated) {
    return (
      <>
        <PageHeader
          title="Overview"
          description="A clear view of what moved through the intelligence pipeline today."
        />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const figures: Array<{ label: string; value: number; href: string }> = [
    { label: "Sources scanned", value: data.sources.length, href: "/sources" },
    { label: "Observations captured", value: data.observations.length, href: "/observations" },
    { label: "Signal candidates", value: derived.signalCandidates, href: "/signals" },
    { label: "Valid signals", value: derived.validSignals, href: "/signals?review=validated" },
    {
      label: "Awaiting human review",
      value: derived.needingReview,
      href: "/signals?review=needs_human_review",
    },
    { label: "Indicators moving", value: derived.indicatorsMoving, href: "/monitoring" },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="A clear view of what moved through the intelligence pipeline today."
      />
      <WalkthroughPanel pageId="overview" />

      {/* 1 · Pipeline movement ---------------------------------------------- */}
      <Section title="Pipeline movement">
        <div className="mb-8 flex flex-wrap gap-x-10 gap-y-6">
          {figures.map((f) => (
            <StageFigure key={f.label} label={f.label} value={f.value} href={f.href} />
          ))}
        </div>
        {/* compact: the ribbon carries no caption of its own; the helper line
            below states the compression message once. */}
        <IntelligencePipeline counts={derived.pipeline} compact />
        <p className="mt-2 text-[11px] text-ink-faint">
          Each step reduces noise and increases meaning.
        </p>
      </Section>

      {/* 1b · Evidence base scale -------------------------------------------- */}
      <Section
        title="Evidence base scale"
        caption="Each count is a link into its library."
      >
        <EvidenceCompressionSummary data={data} />
        <p className="mt-2 text-[11px] text-ink-faint">
          Demonstration corpus · scan window May 2025 – June 2026 · all sources demo-flagged.
        </p>
      </Section>

      {/* 2 · Needs attention --------------------------------------------------- */}
      <Section
        title="Needs attention"
        caption="Signals it is not yet safe to rely on, grouped by the reason. A signal can appear under more than one lens."
        href="/signals"
        linkLabel="Open the Signal Library"
      >
        {derived.triage.length > 0 ? (
          <div className="space-y-8">
            {derived.triage.map((group) => (
              <div key={group.key}>
                <h3 className="text-[13px] font-medium text-ink">{group.title}</h3>
                <p className="mt-0.5 text-[12px] text-ink-faint">{group.caption}</p>
                <div className="mt-1">
                  {group.items.map(({ signal, reason }) => (
                    <div key={signal.id} className="list-row">
                      <div className="flex items-baseline justify-between gap-6">
                        <p className="min-w-0 truncate text-[13.5px] font-medium leading-snug">
                          <Link
                            href={`/signals/${signal.id}`}
                            className="text-ink hover:text-accent-ink"
                          >
                            {signal.title}
                          </Link>
                        </p>
                        <span className="flex shrink-0 items-baseline gap-2">
                          <PipelineStageBadge stage={signalStage(signal)} />
                          <ConfidenceBadge level={signal.confidence} />
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                        {reason}{" "}
                        <Link
                          href={`/signals/${signal.id}`}
                          className="whitespace-nowrap text-accent-ink underline-offset-2 hover:underline"
                        >
                          Review
                        </Link>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
            Nothing needs attention right now. No live signal is thin, out of date, weakly
            sourced, contradicted, or awaiting human review.
          </p>
        )}
      </Section>

      {/* 3 · Suggested tasks ---------------------------------------------------- */}
      <Section
        title="Suggested tasks"
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
            overdue indicators. Keep to the re-scanning cadence — inbox weekly, clusters and
            patterns monthly, drivers and territories quarterly.
          </p>
        )}
      </Section>

      {/* 4 · Recent movement through the pipeline ------------------------------ */}
      <Section
        title="Recent movement through the pipeline"
        caption="Ordered by last update — the store keeps no transition log, so this is recent movement, not today's."
      >
        {derived.movements.length > 0 ? (
          <div>
            {derived.movements.map((m) => (
              <Link
                key={`${m.fromStage}-${m.toStage}-${m.href}`}
                href={m.href}
                className="list-row group"
              >
                <p className="text-[11px] text-ink-faint">
                  {STAGE_LABELS[m.fromStage]} → {STAGE_LABELS[m.toStage]}
                </p>
                <p className="mt-0.5 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                  {m.title}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                  {m.basis} · {m.evidenceCount} evidence link
                  {m.evidenceCount === 1 ? "" : "s"} · {m.reviewNote}
                  {m.confidence ? ` · ${CONFIDENCE_LABELS[m.confidence]}` : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
            Nothing has moved between stages yet. Movement appears here when observations are
            promoted, signals are validated, or clusters, patterns and territories are formed.
          </p>
        )}
      </Section>

      {/* 5 · Contradictions found ---------------------------------------------- */}
      <Section
        title="Contradictions found"
        caption="Ranked by tension strength × future impact. Contradictions are strategic material, not errors."
        href="/contradictions"
        linkLabel="View all contradictions"
      >
        {derived.emerging.length > 0 ? (
          <div className="space-y-8">
            {derived.emerging.map((c) => (
              <div key={c.id}>
                <ContradictionPanel contradiction={c} linked />
                <p className="mt-2 pl-4 text-[12px] text-ink-faint">
                  Tension strength {c.scores.tensionStrength}/5 · evidence balance{" "}
                  {c.scores.evidenceBalance}/5 · future impact {c.scores.futureImpact}/5
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No contradictions have been logged yet. When two valid forces pull in different directions across your signals, record the tension as a contradiction."
            actionLabel="Open Contradictions"
            actionHref="/contradictions"
          />
        )}
      </Section>

      {/* 6 · Monitoring movement ------------------------------------------------ */}
      <Section
        title="Monitoring movement"
        caption="Indicators trending away from stable, or overdue for their scheduled check."
        href="/monitoring"
        linkLabel="Open Monitoring"
      >
        {derived.monitoringMovement.length > 0 ? (
          <div>
            {derived.monitoringMovement.map(({ indicator, overdue, territoryName }) => (
              <Link key={indicator.id} href="/monitoring" className="list-row group">
                <div className="flex items-baseline justify-between gap-6">
                  <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
                    {indicator.name}
                  </p>
                  <span className="shrink-0">
                    <TrendBadge trend={indicator.trend} />
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                  {firstSentence(indicator.currentStatus)} · Last checked{" "}
                  {formatDate(indicator.dateLastChecked)}
                  {overdue ? <span className="text-caution"> · check overdue</span> : null}
                  {territoryName ? ` · ${territoryName}` : ""}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Every indicator is currently stable and within its check cadence. Movement appears here when an indicator strengthens, weakens, turns contradictory, or goes past its scheduled check."
            actionLabel="Open Monitoring"
            actionHref="/monitoring"
          />
        )}
      </Section>

      {/* 7 · Strengthening territories ------------------------------------------ */}
      <Section
        title="Recently strengthening territories"
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
            message="No territory is currently strengthening. A territory appears here when its leading indicators trend upward — keep indicators current on the Monitoring page."
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
          title="Noise filter"
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
              message="Nothing has been archived as noise yet. Observations archived or marked duplicate in the Scan Inbox are kept here with their triage rationale."
              actionLabel="Open the Scan Inbox"
              actionHref="/inbox"
            />
          )}
        </Section>

        {/* System health ------------------------------------------------------ */}
        <Section
          title="System health"
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
