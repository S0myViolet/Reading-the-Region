"use client";

/**
 * Future territory detail — one strategic direction of change.
 *
 * Visibility layers: the simple reading gives the definition, why it is
 * emerging, its status in plain language (badge never alone), what it changes
 * and who it affects, opportunities and risks, what could contradict it, and
 * a next step — with the relationship trail visible in every mode. Analyst
 * view adds the linkage checklist, evidence-strength reading, sector
 * implication notes, per-driver and per-pattern statuses, scenarios,
 * monitoring and review controls. Methodology view adds the convergence rule
 * spelled out and the audit trail. Territories always require human review —
 * the layer sits too close to strategy to be trusted unreviewed.
 *
 * Calm layout: the left column reads as an article — small headings, prose,
 * whitespace instead of stacked cards. Cards survive only around tables.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { DepthHint, useViewMode, ViewGate } from "@/components/ViewMode";
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
  IdChip,
  ProvenanceBadge,
  TerritoryStatusBadge,
  TrendBadge,
} from "@/components/badges";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { explainContradiction, explainTerritoryStatus } from "@/lib/explain";
import { validateTerritory, type ValidationResult } from "@/lib/validation";
import type {
  ConfidenceLevel,
  Contradiction,
  Driver,
  FutureTerritory,
  MonitoringIndicator,
  Pattern,
  PatternValidationStatus,
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
  countInWords,
  EVIDENCE_STRENGTH_WORDS,
  MONITORING_STATUS_EXPLANATIONS,
  territoryNextStep,
  fmtDate,
} from "../territory-ui";

// ---------------------------------------------------------------------------
// Small building blocks — article sections, boxless
// ---------------------------------------------------------------------------

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <h2 className="text-[13px] font-medium text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-ink-soft">{children}</p>;
}

function FaintNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-relaxed text-ink-faint">{children}</p>;
}

/** A plain list under a faint label — the calm replacement for boxed lists. */
function PlainList({
  label,
  items,
  emptyNote,
}: {
  label: string;
  items: string[];
  emptyNote: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] text-ink-faint">{label}</p>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-[13px] leading-relaxed text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] leading-relaxed text-ink-faint">{emptyNote}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple reading — the default view, and the Overview tab in deeper views
// ---------------------------------------------------------------------------

/** Linked contradictions as readable sentences; the absence is explicit. */
function ContradictionSentences({ items }: { items: Contradiction[] }) {
  if (items.length === 0) return <NoContradictionNote />;
  return (
    <ul className="space-y-2.5">
      {items.map((c) => (
        <li key={c.id} className="text-[13px] leading-relaxed text-ink-soft">
          <Link
            href={`/contradictions/${c.id}`}
            className="font-medium text-ink hover:text-accent-ink hover:underline"
          >
            {c.name}
          </Link>
          {" — "}
          {explainContradiction(c)}
        </li>
      ))}
    </ul>
  );
}

function SimpleReading({
  territory,
  linkedContradictions,
}: {
  territory: FutureTerritory;
  linkedContradictions: Contradiction[];
}) {
  return (
    <div className="max-w-2xl space-y-8">
      <Section title="One-line definition">
        {territory.oneLineDefinition.trim() ? (
          <p className="font-display text-[17px] italic leading-relaxed text-ink">
            {territory.oneLineDefinition}
          </p>
        ) : (
          <FaintNote>
            No one-line definition recorded yet. A territory that cannot be
            stated in a single sentence is not yet a territory — it is a pile
            of adjacent observations.
          </FaintNote>
        )}
      </Section>

      <Section
        title="Why it is emerging"
        aside={
          <ViewGate min="methodology">
            <ProvenanceBadge label="sourced_interpretation" />
          </ViewGate>
        }
      >
        {territory.whyEmerging.trim() ? (
          <Prose>{territory.whyEmerging}</Prose>
        ) : (
          <FaintNote>
            Not recorded yet. State which drivers converge here and why their
            convergence produces this direction rather than another.
          </FaintNote>
        )}
      </Section>

      <Section title="Where it stands">
        <Prose>
          <TerritoryStatusBadge status={territory.monitoringStatus} />{" "}
          {explainTerritoryStatus(territory)}
        </Prose>
      </Section>

      <Section title="What it changes">
        {territory.whatItChanges.trim() ? (
          <Prose>{territory.whatItChanges}</Prose>
        ) : (
          <FaintNote>
            Not recorded yet. Name the systems, behaviours, and markets this
            direction of change restructures.
          </FaintNote>
        )}
      </Section>

      <Section title="Who it affects">
        {territory.whoItAffects.length > 0 ? (
          <Prose>{territory.whoItAffects.join(" · ")}</Prose>
        ) : (
          <FaintNote>
            No affected groups recorded yet. A territory that affects no one in
            particular is a buzzword, not a direction of change.
          </FaintNote>
        )}
      </Section>

      <Section title="If this territory strengthens">
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <PlainList
            label="Opportunities"
            items={territory.opportunities}
            emptyNote="No opportunities recorded yet. Trace what becomes possible or valuable if this direction continues."
          />
          <PlainList
            label="Risks"
            items={territory.risks}
            emptyNote="No risks recorded yet. Every meaningful direction of change puts something at risk — if nothing comes to mind, the territory is under-examined."
          />
        </div>
      </Section>

      <Section title="What could contradict it">
        <ContradictionSentences items={linkedContradictions} />
      </Section>

      <Section title="Next step">
        <Prose>{territoryNextStep(territory)}</Prose>
      </Section>

      <DepthHint>
        Linkage checks, evidence strength, sector implications and review controls
      </DepthHint>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence & linkage tab (analyst)
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
      <h3 className="mb-2 text-[13px] font-medium text-ink">
        {heading} ({items.length})
      </h3>
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

const PATTERN_STATUS_WORDS: Record<PatternValidationStatus, string> = {
  hypothesis: "Hypothesis",
  partially_validated: "Partially validated",
  validated: "Validated",
};

function DriverLinkTable({ drivers }: { drivers: Driver[] }) {
  return (
    <section>
      <h3 className="mb-2 text-[13px] font-medium text-ink">
        Drivers behind it ({drivers.length})
      </h3>
      {drivers.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Status</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link
                      href={`/drivers/${d.id}`}
                      className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                    >
                      {d.name}
                    </Link>{" "}
                    <IdChip id={d.id} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {d.status === "validated" ? "Validated driver" : "Driver hypothesis"}
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {CONFIDENCE_LABELS[d.confidence]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[11.5px] text-ink-faint">
          No drivers connected. A territory must rest on at least two converging
          drivers — without them it is a theme, not a territory.
        </p>
      )}
    </section>
  );
}

function PatternLinkTable({ patterns }: { patterns: Pattern[] }) {
  return (
    <section>
      <h3 className="mb-2 text-[13px] font-medium text-ink">
        Patterns behind it ({patterns.length})
      </h3>
      {patterns.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Validation status</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/patterns/${p.id}`}
                      className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                    >
                      {p.name}
                    </Link>{" "}
                    <IdChip id={p.id} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {PATTERN_STATUS_WORDS[p.validationStatus]}
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {CONFIDENCE_LABELS[p.confidence]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[11.5px] text-ink-faint">
          No patterns connected. The repeated movements that the territory&rsquo;s
          drivers explain should be linked here.
        </p>
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
  linkedDrivers: Driver[];
  linkedPatterns: Pattern[];
  linkedClusters: Array<{ id: string; title: string }>;
  representativeSignals: Array<{ id: string; title: string }>;
}) {
  return (
    <div className="space-y-7">
      <ValidationChecklist
        result={result}
        title="Territory linkage requirements"
        passedLabel="Grounded"
        failedLabel="Insufficiently grounded"
      />
      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">Evidence strength</h3>
        <ScoreBar value={territory.evidenceStrength} label="Evidence strength" />
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {EVIDENCE_STRENGTH_WORDS[territory.evidenceStrength]}.
        </p>
      </section>
      <DriverLinkTable drivers={linkedDrivers} />
      <PatternLinkTable patterns={linkedPatterns} />
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
// Sector implications tab (analyst)
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
// Scenarios tab (analyst)
// ---------------------------------------------------------------------------

function ScenariosTab({
  result,
  linkedScenarios,
}: {
  result: ValidationResult;
  linkedScenarios: Scenario[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-[11.5px] text-ink-faint">
        Scenarios explore how this territory evolves under different conditions.
        They are structured possibilities anchored to this territory&rsquo;s evidence
        — not forecasts of it.
      </p>
      {linkedScenarios.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {linkedScenarios.map((s) => (
            <EntityLink key={s.id} kind="scenario" id={s.id} title={s.title} />
          ))}
        </div>
      ) : result.valid ? (
        <section>
          <h3 className="mb-1.5 text-[13px] font-medium text-accent-ink">
            Ready for scenarios
          </h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            No scenarios explore this territory yet, but its linkage
            requirements are met — it is grounded enough to imagine forward.
            Build a set of differentiated scenarios from the{" "}
            <Link
              href="/scenarios"
              className="text-ink underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
            >
              Scenarios page
            </Link>
            , anchored to this territory.
          </p>
        </section>
      ) : (
        <section>
          <h3 className="mb-1.5 text-[13px] font-medium text-caution">
            Not ready for scenarios
          </h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            This territory meets {result.passedCount} of {result.totalCount}{" "}
            linkage requirements. Scenarios built on an insufficiently grounded
            territory inherit its weakness — strengthen the driver, pattern,
            signal, contradiction, and indicator links on the Evidence &amp;
            linkage tab first.
          </p>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monitoring tab (analyst)
// ---------------------------------------------------------------------------

function MonitoringTab({
  territory,
  linkedIndicators,
}: {
  territory: FutureTerritory;
  linkedIndicators: MonitoringIndicator[];
}) {
  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-1.5 text-[13px] font-medium text-ink">Monitoring status</h3>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          <TerritoryStatusBadge status={territory.monitoringStatus} />{" "}
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
        <p className="text-[12px] text-ink-faint">
          No indicators attached yet. Add leading indicators before treating
          this territory as active.
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
// Review tab (analyst)
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ territory }: { territory: FutureTerritory }) {
  const updateTerritory = useIntelligenceStore((s) => s.updateTerritory);

  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-[12px] leading-relaxed text-ink-faint">
        Territories always require human review. This layer sits directly
        beneath scenarios and strategy — no territory should anchor decisions
        on stored status alone, and none should be treated as settled without
        a named reviewer&rsquo;s judgement.
      </p>
      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">Human review</h3>
        <div className="grid gap-4 sm:grid-cols-2">
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
      <ViewGate min="methodology">
        <p className="text-[11.5px] text-ink-faint">
          Created {fmtDate(territory.createdAt)} · Last updated{" "}
          {fmtDate(territory.updatedAt)}
        </p>
      </ViewGate>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Methodology tab (methodology only)
// ---------------------------------------------------------------------------

function MethodologyTab({ territory }: { territory: FutureTerritory }) {
  const rules: Array<{ rule: string; now: string; why: string }> = [
    {
      rule: "At least two converging drivers",
      now: `${countInWords(territory.driverIds.length, "driver")} linked`,
      why: "A territory emerges from the convergence of multiple forces — a single driver is a driver, not a territory.",
    },
    {
      rule: "At least one pattern",
      now: `${countInWords(territory.patternIds.length, "pattern")} linked`,
      why: "The repeated movements that the drivers explain must be visible beneath the territory.",
    },
    {
      rule: "Contradiction-awareness — at least one linked contradiction",
      now: `${countInWords(territory.contradictionIds.length, "contradiction")} acknowledged`,
      why: "A territory that ignores its tensions becomes a prediction.",
    },
    {
      rule: "At least three representative signals",
      now: `${countInWords(territory.representativeSignalIds.length, "representative signal")} attached`,
      why: "Present-day evidence must show the direction already forming.",
    },
    {
      rule: "At least one leading indicator",
      now: `${countInWords(territory.leadingIndicatorIds.length, "leading indicator")} attached`,
      why: "Without indicators the territory cannot be tracked, only asserted.",
    },
  ];

  return (
    <div className="max-w-2xl space-y-7">
      <section>
        <h3 className="mb-1.5 text-[13px] font-medium text-ink">The convergence rule</h3>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          A future territory is only treated as grounded when every one of
          these requirements holds. The requirements are thresholds, not
          judgements — the Evidence &amp; linkage checklist computes them from
          the record&rsquo;s actual links.
        </p>
        <ul className="mt-3 space-y-2.5 border-l border-line pl-4">
          {rules.map((r) => (
            <li key={r.rule}>
              <p className="text-[12.5px] font-medium text-ink">
                {r.rule}
                <span className="ml-2 font-normal text-ink-faint">— currently {r.now}.</span>
              </p>
              <p className="text-[11.5px] leading-relaxed text-ink-faint">{r.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">Audit trail</h3>
        <dl className="max-w-sm space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Record id</dt>
            <dd>
              <IdChip id={territory.id} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Created</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(territory.createdAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Last updated</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(territory.updatedAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Review status</dt>
            <dd className="text-[12px] text-ink-soft">
              {REVIEW_STATUS_LABELS[territory.reviewStatus]}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Confidence</dt>
            <dd className="text-[12px] text-ink-soft">
              {CONFIDENCE_LABELS[territory.confidence]}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TerritoryDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const mode = useViewMode();
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
        <PageHeader title="Future territory" />
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
        <PageHeader title="Territory not found" />
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

  const simpleReading = (
    <SimpleReading territory={territory} linkedContradictions={linkedContradictions} />
  );

  const analystTabs = [
    {
      id: "overview",
      label: "Overview",
      content: simpleReading,
    },
    {
      id: "evidence",
      label: "Evidence & linkage",
      content: (
        <EvidenceTab
          territory={territory}
          result={result}
          linkedDrivers={linkedDrivers}
          linkedPatterns={linkedPatterns}
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
        <div className="space-y-6">
          {linkedContradictions.length > 0 ? (
            linkedContradictions.map((c) => (
              <ContradictionPanel key={c.id} contradiction={c} />
            ))
          ) : (
            <NoContradictionNote />
          )}
          <p className="text-[11.5px] text-ink-faint">
            A territory that ignores its contradictions becomes a prediction.
          </p>
        </div>
      ),
    },
    {
      id: "scenarios",
      label: `Scenarios (${linkedScenarios.length})`,
      content: <ScenariosTab result={result} linkedScenarios={linkedScenarios} />,
    },
    {
      id: "monitoring",
      label: `Monitoring (${linkedIndicators.length})`,
      content: (
        <MonitoringTab territory={territory} linkedIndicators={linkedIndicators} />
      ),
    },
    {
      id: "review",
      label: "Review",
      content: <ReviewTab territory={territory} />,
    },
  ];

  const tabs =
    mode === "methodology"
      ? [
          ...analystTabs,
          {
            id: "methodology",
            label: "Methodology",
            content: <MethodologyTab territory={territory} />,
          },
        ]
      : analystTabs;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Future Territories", href: "/territories" },
          { label: territory.name },
        ]}
      />
      <PageHeader title={territory.name} actions={<PipelineStageBadge stage="territory" />} />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>{mode === "simple" ? simpleReading : <Tabs tabs={tabs} />}</div>

        <aside className="mt-10 space-y-8 lg:mt-0">
          <RelatedObjectsPanel groups={relatedGroups} />
          <ViewGate min="analyst">
            <BiasCheckPanel
              extraQuestions={[
                "Is this territory broad enough to hold multiple sectors, and specific enough to be meaningful?",
                "Would this name survive a client meeting without a slide of caveats?",
              ]}
            />
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
