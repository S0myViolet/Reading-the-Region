"use client";

/**
 * Future territory detail — one strategic direction of change, its definition
 * and emergence logic, the full evidence linkage down the pyramid (drivers,
 * patterns, clusters, representative signals), sector implications, the
 * contradictions it must hold, the scenarios that explore it, the leading
 * indicators that keep it honest, and review controls. Territories always
 * require human review — the layer sits too close to strategy to be trusted
 * unreviewed.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import {
  ContradictionPanel,
  NoContradictionNote,
} from "@/components/ContradictionPanel";
import {
  EntityLink,
  RelatedObjectsPanel,
  type RelatedGroup,
} from "@/components/EntityLink";
import { ScoreBar } from "@/components/ScorePanel";
import {
  ConfidenceBadge,
  IdChip,
  Pill,
  ProvenanceBadge,
  ReviewStatusBadge,
  TerritoryStatusBadge,
  TrendBadge,
} from "@/components/badges";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateTerritory, type ValidationResult } from "@/lib/validation";
import type {
  ConfidenceLevel,
  FutureTerritory,
  MonitoringIndicator,
  ReviewStatus,
  Scenario,
} from "@/lib/types";
import {
  CADENCE_LABELS,
  CONFIDENCE_LABELS,
  INDICATOR_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  SECTOR_LABELS,
  TERRITORY_MONITORING_LABELS,
} from "@/lib/types";
import {
  MONITORING_STATUS_EXPLANATIONS,
  ScenarioReadinessPill,
  fmtDate,
} from "../territory-ui";

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function ListSection({
  title,
  items,
  emptyNote,
  tone,
}: {
  title: string;
  items: string[];
  emptyNote: string;
  tone?: "tension" | "accent";
}) {
  return (
    <section
      className={`card ${
        tone === "tension"
          ? "border-l-2 border-l-tension"
          : tone === "accent"
            ? "border-l-2 border-l-accent"
            : ""
      }`}
    >
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">{title}</h3>
      </header>
      {items.length > 0 ? (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item} className="px-4 py-2.5 text-[13px] leading-relaxed text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-[12px] text-ink-faint">{emptyNote}</p>
      )}
    </section>
  );
}

function OverviewTab({ territory }: { territory: FutureTerritory }) {
  return (
    <div className="space-y-4">
      <section className="card px-4 py-4">
        <p className="overline-label mb-2">One-line definition</p>
        {territory.oneLineDefinition.trim() ? (
          <blockquote className="border-l-2 border-l-accent pl-4 font-display text-[18px] italic leading-relaxed text-ink">
            {territory.oneLineDefinition}
          </blockquote>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No one-line definition recorded yet. A territory that cannot be
            stated in a single sentence is not yet a territory — it is a pile
            of adjacent observations.
          </p>
        )}
      </section>

      <section className="card px-4 py-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="overline-label">Why it is emerging</p>
          <ProvenanceBadge label="sourced_interpretation" />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {territory.whyEmerging.trim() ? (
            territory.whyEmerging
          ) : (
            <span className="text-[12px] text-ink-faint">
              Not recorded yet. State which drivers converge here and why their
              convergence produces this direction rather than another.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">What it changes</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {territory.whatItChanges.trim() ? (
            territory.whatItChanges
          ) : (
            <span className="text-[12px] text-ink-faint">
              Not recorded yet. Name the systems, behaviours, and markets this
              direction of change restructures.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">Who it affects</p>
        {territory.whoItAffects.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {territory.whoItAffects.map((who) => (
              <Pill key={who}>{who}</Pill>
            ))}
          </div>
        ) : (
          <span className="text-[11.5px] text-ink-faint">
            No affected groups recorded yet. A territory that affects no one in
            particular is a buzzword, not a direction of change.
          </span>
        )}
      </section>

      <ListSection
        title="Risks — if this territory strengthens"
        items={territory.risks}
        emptyNote="No risks recorded yet. Every meaningful direction of change puts something at risk — if nothing comes to mind, the territory is under-examined."
        tone="tension"
      />
      <ListSection
        title="Opportunities — if this territory strengthens"
        items={territory.opportunities}
        emptyNote="No opportunities recorded yet. Trace what becomes possible or valuable if this direction continues."
        tone="accent"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence & linkage tab
// ---------------------------------------------------------------------------

function LinkGrid({
  heading,
  kind,
  items,
  emptyNote,
}: {
  heading: string;
  kind: RelatedGroup["kind"];
  items: Array<{ id: string; title: string }>;
  emptyNote: string;
}) {
  return (
    <section>
      <p className="overline-label mb-2">
        {heading} ({items.length})
      </p>
      {items.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <EntityLink key={item.id} kind={kind} id={item.id} title={item.title} />
          ))}
        </div>
      ) : (
        <p className="text-[11.5px] text-ink-faint">{emptyNote}</p>
      )}
    </section>
  );
}

function EvidenceTab({
  territory,
  result,
  linkedDrivers,
  linkedPatterns,
  linkedClusters,
  representativeSignals,
}: {
  territory: FutureTerritory;
  result: ValidationResult;
  linkedDrivers: Array<{ id: string; title: string }>;
  linkedPatterns: Array<{ id: string; title: string }>;
  linkedClusters: Array<{ id: string; title: string }>;
  representativeSignals: Array<{ id: string; title: string }>;
}) {
  return (
    <div className="space-y-5">
      <ValidationChecklist
        result={result}
        title="Territory linkage requirements"
        passedLabel="Grounded"
        failedLabel="Insufficiently grounded"
      />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <ScoreBar value={territory.evidenceStrength} label="Evidence strength" />
      </div>
      <LinkGrid
        heading="Drivers behind it"
        kind="driver"
        items={linkedDrivers}
        emptyNote="No drivers connected. A territory must rest on at least two converging drivers — without them it is a theme, not a territory."
      />
      <LinkGrid
        heading="Patterns behind it"
        kind="pattern"
        items={linkedPatterns}
        emptyNote="No patterns connected. The repeated movements that the territory's drivers explain should be linked here."
      />
      <LinkGrid
        heading="Key signal clusters"
        kind="cluster"
        items={linkedClusters}
        emptyNote="No clusters linked. Clusters show where the territory's evidence groups by shared logic."
      />
      <LinkGrid
        heading="Representative signals"
        kind="signal"
        items={representativeSignals}
        emptyNote="No representative signals attached. Pick the present-day evidence that best shows this direction already forming."
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sector implications tab
// ---------------------------------------------------------------------------

function SectorImplicationsTab({ territory }: { territory: FutureTerritory }) {
  if (territory.sectorImplications.length === 0) {
    return (
      <p className="text-[12px] text-ink-faint">
        No sector implications recorded yet. A territory earns its multi-sector
        claim by stating what it means for each sector it touches — add notes
        per sector as the evidence allows.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sector</th>
              <th>Implication note</th>
            </tr>
          </thead>
          <tbody>
            {territory.sectorImplications.map((si) => (
              <tr key={si.sector}>
                <td className="whitespace-nowrap text-[12.5px] text-ink">
                  {SECTOR_LABELS[si.sector]}
                </td>
                <td className="text-[12.5px] leading-relaxed text-ink-soft">{si.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11.5px] text-ink-faint">
        Sector notes are interpretations of the territory, not validated
        implications. Formal, evidence-linked recommendations live in Strategic
        Implications.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scenarios tab
// ---------------------------------------------------------------------------

function ScenariosTab({
  territory,
  result,
  linkedScenarios,
}: {
  territory: FutureTerritory;
  result: ValidationResult;
  linkedScenarios: Scenario[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-[11.5px] text-ink-faint">
        Scenarios explore how this territory evolves under different conditions.
        They are structured possibilities anchored to this territory's evidence
        — not forecasts of it.
      </p>
      {linkedScenarios.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {linkedScenarios.map((s) => (
            <EntityLink key={s.id} kind="scenario" id={s.id} title={s.title} />
          ))}
        </div>
      ) : result.valid ? (
        <div className="card px-4 py-4">
          <p className="overline-label mb-1 text-accent-ink">Ready for scenarios</p>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            No scenarios explore this territory yet, but its linkage
            requirements are met — it is grounded enough to imagine forward.
            Build a set of differentiated scenarios from the Scenarios page,
            anchored to this territory.
          </p>
          <Link
            href="/scenarios"
            className="mt-3 inline-block border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
          >
            Open Scenarios
          </Link>
        </div>
      ) : (
        <div className="card border-l-2 border-l-caution px-4 py-4">
          <p className="overline-label mb-1 text-caution">Not ready for scenarios</p>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            This territory meets {result.passedCount} of {result.totalCount}{" "}
            linkage requirements. Scenarios built on an insufficiently grounded
            territory inherit its weakness — strengthen the driver, pattern,
            signal, contradiction, and indicator links on the Evidence &
            linkage tab first.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monitoring tab
// ---------------------------------------------------------------------------

function MonitoringTab({
  territory,
  linkedIndicators,
}: {
  territory: FutureTerritory;
  linkedIndicators: MonitoringIndicator[];
}) {
  return (
    <div className="space-y-4">
      <section className="card px-4 py-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="overline-label">Monitoring status</p>
          <TerritoryStatusBadge status={territory.monitoringStatus} />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {TERRITORY_MONITORING_LABELS[territory.monitoringStatus]} —{" "}
          {MONITORING_STATUS_EXPLANATIONS[territory.monitoringStatus]}
        </p>
      </section>

      {linkedIndicators.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Type</th>
                <th>Trend</th>
                <th>Last checked</th>
                <th>Cadence</th>
              </tr>
            </thead>
            <tbody>
              {linkedIndicators.map((ind) => (
                <tr key={ind.id}>
                  <td>
                    <Link
                      href="/monitoring"
                      className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                    >
                      {ind.name}
                    </Link>{" "}
                    <IdChip id={ind.id} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {INDICATOR_TYPE_LABELS[ind.indicatorType]}
                  </td>
                  <td>
                    <TrendBadge trend={ind.trend} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {fmtDate(ind.dateLastChecked)}
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {CADENCE_LABELS[ind.cadence]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border border-dashed border-line-strong px-3 py-2 text-[12px] text-ink-faint rounded-[2px]">
          Add leading indicators before treating this territory as active.
        </p>
      )}

      <p className="text-[11.5px] text-ink-faint">
        Indicators are managed on the{" "}
        <Link href="/monitoring" className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink">
          Monitoring
        </Link>{" "}
        page. A territory without checked indicators drifts into assertion.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ territory }: { territory: FutureTerritory }) {
  const updateTerritory = useIntelligenceStore((s) => s.updateTerritory);

  return (
    <div className="max-w-2xl space-y-4">
      <p className="border border-dashed border-line-strong px-3 py-2 text-[12px] text-ink-soft rounded-[2px]">
        Territories always require human review. This layer sits directly
        beneath scenarios and strategy — no territory should anchor decisions
        on stored status alone, and none should be treated as settled without
        a named reviewer's judgement.
      </p>
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Human review</h3>
        </header>
        <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
          <Field
            label="Review status"
            hint="The human decision about this record — separate from the computed linkage checks."
          >
            <Select
              value={territory.reviewStatus}
              onChange={(e) =>
                updateTerritory(territory.id, {
                  reviewStatus: e.target.value as ReviewStatus,
                })
              }
            >
              {REVIEW_STATUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {REVIEW_STATUS_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Confidence"
            hint="How much weight this territory should carry in scenarios and implications."
          >
            <Select
              value={territory.confidence}
              onChange={(e) =>
                updateTerritory(territory.id, {
                  confidence: e.target.value as ConfidenceLevel,
                })
              }
            >
              {CONFIDENCE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CONFIDENCE_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>
      <p className="text-[11.5px] text-ink-faint">
        Created {fmtDate(territory.createdAt)} · Last updated{" "}
        {fmtDate(territory.updatedAt)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TerritoryDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const territories = useIntelligenceStore((s) => s.territories);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const signals = useIntelligenceStore((s) => s.signals);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const implications = useIntelligenceStore((s) => s.implications);
  const indicators = useIntelligenceStore((s) => s.indicators);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Future Territories", href: "/territories" }]} />
        <PageHeader overline="Interpret & Imagine" title="Future territory" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const id = typeof params.id === "string" ? params.id : "";
  const territory = territories.find((t) => t.id === id);

  if (!territory) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Future Territories", href: "/territories" },
            { label: "Not found" },
          ]}
        />
        <PageHeader overline="Interpret & Imagine" title="Territory not found" />
        <EmptyState
          message={`No future territory carries the id “${id}”. It may have been created in a different browser (the intelligence base is stored locally) or the id may be mistyped. Browse the territory list to find the record you need.`}
          actionLabel="Back to Future Territories"
          actionHref="/territories"
        />
      </>
    );
  }

  const result = validateTerritory(territory);

  const linkedDrivers = drivers.filter((d) => territory.driverIds.includes(d.id));
  const linkedPatterns = patterns.filter((p) => territory.patternIds.includes(p.id));
  const linkedClusters = clusters.filter((c) => territory.clusterIds.includes(c.id));
  const representativeSignals = signals.filter((s) =>
    territory.representativeSignalIds.includes(s.id),
  );
  const linkedContradictions = contradictions.filter((c) =>
    territory.contradictionIds.includes(c.id),
  );
  // Scenarios connect in both directions: the territory stores scenarioIds and
  // every scenario stores its territoryId — take the union so neither link is lost.
  const linkedScenarios = scenarios.filter(
    (s) => territory.scenarioIds.includes(s.id) || s.territoryId === territory.id,
  );
  // Reverse lookup: implications point at territories, not the other way round.
  const linkedImplications = implications.filter(
    (i) => i.territoryId === territory.id,
  );
  const linkedIndicators = indicators.filter(
    (i) =>
      territory.leadingIndicatorIds.includes(i.id) || i.territoryId === territory.id,
  );

  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Drivers",
      kind: "driver",
      items: linkedDrivers.map((d) => ({ id: d.id, title: d.name })),
      emptyNote:
        "No drivers connected — a territory must rest on converging drivers.",
    },
    {
      heading: "Patterns",
      kind: "pattern",
      items: linkedPatterns.map((p) => ({ id: p.id, title: p.name })),
      emptyNote: "No patterns connected yet.",
    },
    {
      heading: "Clusters",
      kind: "cluster",
      items: linkedClusters.map((c) => ({ id: c.id, title: c.name })),
      emptyNote: "No clusters linked yet.",
    },
    {
      heading: "Representative signals",
      kind: "signal",
      items: representativeSignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No representative signals attached yet.",
    },
    {
      heading: "Contradictions",
      kind: "contradiction",
      items: linkedContradictions.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No contradictions linked. A territory without acknowledged tension reads as a prediction.",
    },
    {
      heading: "Scenarios",
      kind: "scenario",
      items: linkedScenarios.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No scenarios explore this territory yet.",
    },
    {
      heading: "Implications",
      kind: "implication",
      items: linkedImplications.map((i) => ({
        id: i.id,
        title: i.implication.length > 80 ? `${i.implication.slice(0, 80)}…` : i.implication,
      })),
      emptyNote: "No strategic implications derived from this territory yet.",
    },
    {
      heading: "Monitoring indicators",
      kind: "indicator",
      items: linkedIndicators.map((i) => ({ id: i.id, title: i.name })),
      emptyNote:
        "No indicators attached — without them this territory cannot be tracked.",
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Future Territories", href: "/territories" },
          { label: territory.name },
        ]}
      />
      <PageHeader
        overline={`Interpret & Imagine · ${territory.id}`}
        title={territory.name}
        actions={
          <div className="flex flex-col items-end gap-1">
            <TerritoryStatusBadge status={territory.monitoringStatus} />
            <ReviewStatusBadge status={territory.reviewStatus} />
            <ScenarioReadinessPill readiness={territory.scenarioReadiness} />
          </div>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>
          <Tabs
            tabs={[
              {
                id: "overview",
                label: "Overview",
                content: <OverviewTab territory={territory} />,
              },
              {
                id: "evidence",
                label: "Evidence & linkage",
                content: (
                  <EvidenceTab
                    territory={territory}
                    result={result}
                    linkedDrivers={linkedDrivers.map((d) => ({
                      id: d.id,
                      title: d.name,
                    }))}
                    linkedPatterns={linkedPatterns.map((p) => ({
                      id: p.id,
                      title: p.name,
                    }))}
                    linkedClusters={linkedClusters.map((c) => ({
                      id: c.id,
                      title: c.name,
                    }))}
                    representativeSignals={representativeSignals.map((s) => ({
                      id: s.id,
                      title: s.title,
                    }))}
                  />
                ),
              },
              {
                id: "sectors",
                label: `Sector implications (${territory.sectorImplications.length})`,
                content: <SectorImplicationsTab territory={territory} />,
              },
              {
                id: "contradictions",
                label: `Contradictions (${linkedContradictions.length})`,
                content: (
                  <div className="space-y-4">
                    {linkedContradictions.length > 0 ? (
                      linkedContradictions.map((c) => (
                        <ContradictionPanel key={c.id} contradiction={c} />
                      ))
                    ) : (
                      <NoContradictionNote />
                    )}
                    <p className="text-[11.5px] text-ink-faint">
                      A territory that ignores its contradictions becomes a
                      prediction.
                    </p>
                  </div>
                ),
              },
              {
                id: "scenarios",
                label: `Scenarios (${linkedScenarios.length})`,
                content: (
                  <ScenariosTab
                    territory={territory}
                    result={result}
                    linkedScenarios={linkedScenarios}
                  />
                ),
              },
              {
                id: "monitoring",
                label: `Monitoring (${linkedIndicators.length})`,
                content: (
                  <MonitoringTab
                    territory={territory}
                    linkedIndicators={linkedIndicators}
                  />
                ),
              },
              {
                id: "review",
                label: "Review",
                content: <ReviewTab territory={territory} />,
              },
            ]}
          />
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <div className="card flex flex-wrap items-center gap-1.5 px-4 py-2.5">
            <TerritoryStatusBadge status={territory.monitoringStatus} />
            <ScenarioReadinessPill readiness={territory.scenarioReadiness} />
            <ConfidenceBadge level={territory.confidence} />
            <ReviewStatusBadge status={territory.reviewStatus} />
            <IdChip id={territory.id} />
          </div>
          <RelatedObjectsPanel groups={relatedGroups} />
          <BiasCheckPanel
            extraQuestions={[
              "Is this territory broad enough to hold multiple sectors, and specific enough to be meaningful?",
              "Would this name survive a client meeting without a slide of caveats?",
            ]}
          />
        </aside>
      </div>
    </>
  );
}
