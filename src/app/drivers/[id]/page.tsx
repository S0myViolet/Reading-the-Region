"use client";

/**
 * Driver detail — one underlying force, its statement and what it explains.
 * Status is always computed from the evidence via validateDriver; the stored
 * status is never presented on its own, and a weak driver is never shown as
 * validated.
 *
 * The left column reads as an article: small headings, prose and whitespace,
 * no card boxes. Visibility layers: the simple view leads with the driver
 * statement, then what it explains, a plain-language status sentence,
 * confidence with its reason, the tensions that could contradict it, and a
 * next step. Analyst view opens the tabbed workspace — scores read as
 * sentences, validation checklist, effect chains as an indented ladder,
 * evidence links, leading indicators with trends, and review controls.
 * Methodology view adds the validation thresholds against this driver's
 * actuals and the audit trail. The relationship trail is visible in every
 * mode.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { ContradictionPanel, NoContradictionNote } from "@/components/ContradictionPanel";
import { EntityLink, RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { ScoreBar } from "@/components/ScorePanel";
import { ConfidenceBadge, ProvenanceBadge, TrendBadge } from "@/components/badges";
import { SystemTags } from "@/components/tags";
import { Field, Select, TextArea } from "@/components/form";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateDriver, type ValidationResult } from "@/lib/validation";
import {
  explainConfidenceGeneric,
  explainContradiction,
  explainDriverStatus,
} from "@/lib/explain";
import type {
  ConfidenceLevel,
  Contradiction,
  Driver,
  DriverScores,
  MonitoringIndicator,
  ReviewStatus,
  Signal,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  DRIVER_SCORE_LABELS,
  DRIVER_THRESHOLDS,
  REVIEW_STATUS_LABELS,
} from "@/lib/types";
import {
  DriverStanding,
  RecomputedNote,
  btnPrimary,
  driverEvidenceNote,
  driverNextStep,
  driverScoreReading,
  fmtDate,
  signalsOfDriver,
  statusDisagrees,
  textLink,
} from "../driver-ui";

/** How many signal links show in the relationship trail before capping. */
const TRAIL_SIGNAL_CAP = 8;
/** How many signal links show on the Evidence tab before collapsing. */
const EVIDENCE_SIGNAL_COLLAPSE = 10;

const DRIVER_SCORE_KEYS = Object.keys(DRIVER_SCORE_LABELS) as Array<
  keyof DriverScores
>;

/** Small article heading, with room for an inline provenance marker. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
      {children}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Overview — the simple layer. Rendered flat in simple view and as the
// Overview tab in Analyst view (where its gated sections open up).
// ---------------------------------------------------------------------------

function OverviewContent({
  driver,
  result,
  linkedContradictions,
}: {
  driver: Driver;
  result: ValidationResult;
  linkedContradictions: Contradiction[];
}) {
  return (
    <article className="max-w-2xl space-y-8">
      <section>
        <SectionHeading>Driver statement</SectionHeading>
        {driver.driverStatement.trim() ? (
          <blockquote className="mt-2 border-l-2 border-l-accent pl-4 font-display text-[17px] italic leading-relaxed text-ink">
            {driver.driverStatement}
          </blockquote>
        ) : (
          <p className="mt-1.5 text-[12px] text-ink-faint">
            No driver statement recorded yet. A driver must explain, not
            describe — state the force and mechanism that would produce the
            patterns this driver claims to explain.
          </p>
        )}
      </section>

      <section>
        <SectionHeading>
          What it explains
          <ViewGate min="methodology">
            <ProvenanceBadge label="human_interpretation" />
          </ViewGate>
        </SectionHeading>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {driver.whatItExplains.trim() ? (
            driver.whatItExplains
          ) : (
            <span className="text-[12px] text-ink-faint">
              Not recorded yet. Name the patterns this force accounts for — a
              driver that explains only one pattern is usually a restatement of
              that pattern.
            </span>
          )}
        </p>
      </section>

      <section>
        <SectionHeading>Where this driver stands</SectionHeading>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {explainDriverStatus(driver, result)}
        </p>
      </section>

      <section>
        <SectionHeading>Confidence</SectionHeading>
        <div className="mt-1.5">
          <ConfidenceBadge level={driver.confidence} />
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {explainConfidenceGeneric(driver.confidence, driverEvidenceNote(driver))}
        </p>
      </section>

      <section>
        <SectionHeading>What could contradict it</SectionHeading>
        <div className="mt-2">
          {linkedContradictions.length > 0 ? (
            <ul className="space-y-4">
              {linkedContradictions.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/contradictions/${c.id}`}
                    className="text-[12.5px] font-medium text-ink hover:text-accent-ink hover:underline"
                  >
                    {c.name}
                  </Link>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                    {explainContradiction(c)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <NoContradictionNote />
          )}
        </div>
      </section>

      <section>
        <SectionHeading>Next step</SectionHeading>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          {driverNextStep(result)}
        </p>
      </section>

      <DepthHint>
        Scoring, effect chains, possible futures, evidence links and validation
        detail
      </DepthHint>

      <ViewGate min="analyst">
        <div className="space-y-8">
          <section>
            <SectionHeading>
              Possible futures — if this force continues
            </SectionHeading>
            {driver.possibleFutures.length > 0 ? (
              <ul className="mt-2 space-y-2.5">
                {driver.possibleFutures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <ViewGate min="methodology">
                      <span className="shrink-0 pt-px">
                        <ProvenanceBadge label="speculative_possibility" />
                      </span>
                    </ViewGate>
                    <span className="text-[13px] leading-relaxed text-ink-soft">{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-[12px] text-ink-faint">
                No possible futures articulated yet. A validated driver must
                produce plausible future scenarios — if none can be stated, the
                explanation is not yet doing any work.
              </p>
            )}
          </section>

          <section>
            <SectionHeading>Systems affected</SectionHeading>
            <div className="mt-2">
              {driver.systemsAffected.length > 0 ? (
                <SystemTags systems={driver.systemsAffected} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No systems recorded yet. A structural force should touch at
                  least one named system.
                </span>
              )}
            </div>
          </section>
        </div>
      </ViewGate>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Validation tab (analyst) — checklist plus the ten scores read as sentences;
// methodology adds the thresholds against this driver's actuals.
// ---------------------------------------------------------------------------

function ThresholdsSection({
  driver,
  driverSignals,
}: {
  driver: Driver;
  driverSignals: Signal[];
}) {
  const t = DRIVER_THRESHOLDS;
  const sectorCount = new Set(driverSignals.flatMap((s) => s.sectors)).size;
  const rows: Array<{ label: string; required: string; actual: number }> = [
    {
      label: "Patterns explained",
      required: `≥ ${t.minPatterns}`,
      actual: driver.patternIds.length,
    },
    {
      label: "Signals connected",
      required: `≥ ${t.minSignals}`,
      actual: driver.signalIds.length,
    },
    {
      label: "Sectors represented (from linked signals)",
      required: `≥ ${t.minSectors}`,
      actual: sectorCount,
    },
    {
      label: "Independent sources",
      required: `≥ ${t.minIndependentSources}`,
      actual: driver.independentSourceCount,
    },
    {
      label: "Contradictions linked",
      required: `≥ ${t.minContradictions}`,
      actual: driver.contradictionIds.length,
    },
    {
      label: "Possible futures articulated",
      required: "≥ 1",
      actual: driver.possibleFutures.length,
    },
    {
      label: "Leading indicators attached",
      required: "≥ 1",
      actual: driver.leadingIndicatorIds.length,
    },
  ];
  const met = (row: { required: string; actual: number }) =>
    row.actual >= Number(row.required.replace("≥", "").trim());

  return (
    <section>
      <SectionHeading>
        Validation thresholds — this driver against the rulebook
      </SectionHeading>
      <div className="mt-3 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Required</th>
              <th>This driver</th>
              <th>Met</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className="font-mono">{row.required}</td>
                <td className="font-mono">{row.actual}</td>
                <td className={met(row) ? "text-accent-ink" : "text-caution"}>
                  {met(row) ? "Met" : "Not met"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11.5px] text-ink-faint">
        A driver is only validated when every criterion passes against live
        evidence. Scores record judgement; these thresholds record evidence.
      </p>
    </section>
  );
}

function ValidationTab({
  driver,
  driverSignals,
  result,
}: {
  driver: Driver;
  driverSignals: Signal[];
  result: ValidationResult;
}) {
  return (
    <div className="max-w-2xl space-y-8">
      <ValidationChecklist
        result={result}
        title="Driver validation threshold"
        passedLabel="Validated driver"
        failedLabel="Driver hypothesis"
      />
      <section>
        <SectionHeading>Scores, read</SectionHeading>
        <div className="mt-3 space-y-3.5">
          {DRIVER_SCORE_KEYS.map((k) => (
            <div key={k}>
              <ScoreBar value={driver.scores[k]} label={DRIVER_SCORE_LABELS[k]} />
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                {driverScoreReading(k, driver.scores[k])}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11.5px] text-ink-faint">
          Scores are analyst judgements against the 1–5 rubric; the checklist
          above records what the evidence itself supports.
        </p>
      </section>
      <ViewGate min="methodology">
        <ThresholdsSection driver={driver} driverSignals={driverSignals} />
      </ViewGate>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Systems tab — effect chains as an indented ladder: each further order of
// effect steps in from a hairline rail and carries less certainty.
// ---------------------------------------------------------------------------

function LadderStep({
  indent,
  label,
  children,
}: {
  indent: 0 | 1 | 2;
  label: string;
  children: React.ReactNode;
}) {
  const indentClass =
    indent === 0 ? "" : indent === 1 ? "ml-5 border-l border-line pl-5" : "ml-12 border-l border-line pl-5";
  return (
    <div className={indentClass}>
      <p className="text-[11px] text-ink-faint">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SystemsTab({ driver }: { driver: Driver }) {
  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-[11.5px] leading-relaxed text-ink-faint">
        These effect chains are inferred by the analyst from the driver's
        logic — they are interpretation, not sourced facts. Each further order
        of effect carries less certainty than the one before it.
        <ViewGate min="methodology">
          <span className="ml-2">
            <ProvenanceBadge label="human_interpretation" />
          </span>
        </ViewGate>
      </p>

      <LadderStep indent={0} label="First order — the force itself">
        <p className="text-[13px] leading-relaxed text-ink">
          {driver.driverStatement.trim()
            ? driver.driverStatement
            : "No driver statement recorded yet — the chain has nothing to hang from."}
        </p>
      </LadderStep>

      <LadderStep
        indent={1}
        label="Second-order effects — what changes because of the first change"
      >
        {driver.secondOrderEffects.length > 0 ? (
          <ul className="space-y-2">
            {driver.secondOrderEffects.map((e) => (
              <li key={e} className="text-[13px] leading-relaxed text-ink-soft">
                {e}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No second-order effects traced yet. Ask: if this force holds, what
            changes because of the first change?
          </p>
        )}
      </LadderStep>

      <LadderStep
        indent={2}
        label="Third-order effects — the least certain consequences"
      >
        {driver.thirdOrderEffects.length > 0 ? (
          <ul className="space-y-2">
            {driver.thirdOrderEffects.map((e) => (
              <li key={e} className="text-[13px] leading-relaxed text-ink-soft">
                {e}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No third-order effects traced yet. These are the least certain
            consequences — trace them, then look for early evidence.
          </p>
        )}
      </LadderStep>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence tab
// ---------------------------------------------------------------------------

function EvidenceTab({
  driver,
  driverSignals,
  driverPatterns,
  driverIndicators,
}: {
  driver: Driver;
  driverSignals: Signal[];
  driverPatterns: Array<{ id: string; name: string }>;
  driverIndicators: MonitoringIndicator[];
}) {
  const [showAllSignals, setShowAllSignals] = useState(false);
  const minSources = DRIVER_THRESHOLDS.minIndependentSources;
  const collapsed =
    !showAllSignals && driverSignals.length > EVIDENCE_SIGNAL_COLLAPSE;
  const visibleSignals = collapsed
    ? driverSignals.slice(0, EVIDENCE_SIGNAL_COLLAPSE)
    : driverSignals;

  return (
    <div className="space-y-8">
      <section>
        <SectionHeading>Independent sources</SectionHeading>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          Evidence drawn from{" "}
          <span className="font-mono text-ink">{driver.independentSourceCount}</span>{" "}
          independent source{driver.independentSourceCount === 1 ? "" : "s"}.{" "}
          <span
            className={`text-[11.5px] ${
              driver.independentSourceCount >= minSources
                ? "text-accent-ink"
                : "text-caution"
            }`}
          >
            Validation needs at least {minSources}.
          </span>
        </p>
      </section>

      <section>
        <SectionHeading>
          Patterns this driver explains
          <span className="font-normal text-ink-faint">{driverPatterns.length}</span>
        </SectionHeading>
        <div className="mt-2">
          {driverPatterns.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {driverPatterns.map((p) => (
                <EntityLink key={p.id} kind="pattern" id={p.id} title={p.name} />
              ))}
            </div>
          ) : (
            <p className="text-[11.5px] text-ink-faint">
              No patterns connected yet. A driver earns its status by explaining
              several patterns — without them it is a guess, not an explanation.
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeading>
          Signals connected
          <span className="font-normal text-ink-faint">{driverSignals.length}</span>
        </SectionHeading>
        <div className="mt-2">
          {driverSignals.length > 0 ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {visibleSignals.map((s) => (
                  <EntityLink key={s.id} kind="signal" id={s.id} title={s.title} />
                ))}
              </div>
              {driverSignals.length > EVIDENCE_SIGNAL_COLLAPSE ? (
                <button
                  type="button"
                  className={`mt-3 ${textLink}`}
                  onClick={() => setShowAllSignals((v) => !v)}
                >
                  {collapsed
                    ? `Show all ${driverSignals.length} signals`
                    : "Show fewer signals"}
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-[11.5px] text-ink-faint">
              No signals connected yet. The explanatory claim must trace down to
              present-day evidence — link the signals the driver accounts for.
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeading>
          Leading indicators
          <span className="font-normal text-ink-faint">{driverIndicators.length}</span>
        </SectionHeading>
        <div className="mt-2">
          {driverIndicators.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {driverIndicators.map((i) => (
                <div key={i.id} className="space-y-1">
                  <EntityLink kind="indicator" id={i.id} title={i.name} />
                  <TrendBadge trend={i.trend} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11.5px] text-ink-faint">
              No leading indicators attached yet. Without indicators the driver
              cannot be monitored — define what should be watched if this force
              is real.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab (analyst); the audit trail opens in Methodology view.
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ driver }: { driver: Driver }) {
  const updateDriver = useIntelligenceStore((s) => s.updateDriver);
  const [notes, setNotes] = useState(driver.humanNotes);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <SectionHeading>Human review</SectionHeading>
        <div className="mt-3 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Review status"
              hint="A review decision about the record — separate from the computed validation status."
            >
              <Select
                value={driver.reviewStatus}
                onChange={(e) =>
                  updateDriver(driver.id, {
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
              hint="How much weight this explanation should carry in territories and scenarios."
            >
              <Select
                value={driver.confidence}
                onChange={(e) =>
                  updateDriver(driver.id, {
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
          <Field
            label="Human notes"
            hint="Interpretation, doubts, rival explanations, and the evidence that would settle them."
          >
            <TextArea
              rows={5}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
            />
          </Field>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                updateDriver(driver.id, { humanNotes: notes });
                setSaved(true);
              }}
            >
              Save notes
            </button>
            {saved ? (
              <span className="text-[11.5px] text-accent-ink">Notes saved.</span>
            ) : null}
          </div>
        </div>
      </section>
      <ViewGate min="methodology">
        <section>
          <SectionHeading>Audit trail</SectionHeading>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-faint">
            Record <span className="font-mono">{driver.id}</span> · Created{" "}
            {fmtDate(driver.createdAt)} · Last updated {fmtDate(driver.updatedAt)} ·
            Review status: {REVIEW_STATUS_LABELS[driver.reviewStatus]} · Stored
            status: {driver.status === "validated" ? "validated" : "hypothesis"}{" "}
            (the displayed status is always recomputed from evidence)
          </p>
        </section>
      </ViewGate>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const mode = useViewMode();
  const drivers = useIntelligenceStore((s) => s.drivers);
  const signals = useIntelligenceStore((s) => s.signals);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const indicators = useIntelligenceStore((s) => s.indicators);
  const territories = useIntelligenceStore((s) => s.territories);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Drivers", href: "/drivers" }]} />
        <PageHeader title="Driver" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const id = typeof params.id === "string" ? params.id : "";
  const driver = drivers.find((d) => d.id === id);

  if (!driver) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Drivers", href: "/drivers" }, { label: "Not found" }]}
        />
        <PageHeader title="Driver not found" />
        <EmptyState
          message={`No driver carries the id “${id}”. It may have been created in a different browser (the intelligence base is stored locally) or the id may be mistyped. Browse the driver list to find the record you need.`}
          actionLabel="Back to Drivers"
          actionHref="/drivers"
        />
      </>
    );
  }

  const result = validateDriver(driver, signals);
  const recomputed = statusDisagrees(driver, result);
  const driverSignals = signalsOfDriver(driver, signals);
  const linkedPatterns = patterns.filter((p) => driver.patternIds.includes(p.id));
  const linkedContradictions = contradictions.filter((c) =>
    driver.contradictionIds.includes(c.id),
  );
  const linkedIndicators = indicators.filter((i) =>
    driver.leadingIndicatorIds.includes(i.id),
  );
  // Reverse lookup: territories rest on drivers, so the link lives on the
  // territory record, not here.
  const linkedTerritories = territories.filter((t) =>
    t.driverIds.includes(driver.id),
  );
  const trailSignals = driverSignals.slice(0, TRAIL_SIGNAL_CAP);
  const trailSignalOverflow = driverSignals.length - trailSignals.length;

  const crumbs: Array<{ label: string; href?: string }> = [
    { label: "Drivers", href: "/drivers" },
    { label: driver.name },
  ];
  if (linkedTerritories.length > 0) {
    crumbs.push({
      label: `Future territory: ${linkedTerritories[0].name}`,
      href: `/territories/${linkedTerritories[0].id}`,
    });
  }

  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Patterns explained",
      kind: "pattern",
      items: linkedPatterns.map((p) => ({ id: p.id, title: p.name })),
      emptyNote:
        "No patterns connected yet — a driver must explain repeated movements, not stand alone.",
    },
    {
      heading:
        trailSignalOverflow > 0
          ? `Signals — first ${TRAIL_SIGNAL_CAP} of ${driverSignals.length}; the rest are on the Evidence tab`
          : "Signals",
      kind: "signal",
      items: trailSignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No signals connected yet — the explanation has no evidence beneath it.",
    },
    {
      heading: "Contradictions",
      kind: "contradiction",
      items: linkedContradictions.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No contradictions linked. A force without opposition is usually under-scanned.",
    },
    {
      heading: "Leading indicators",
      kind: "indicator",
      items: linkedIndicators.map((i) => ({ id: i.id, title: i.name })),
      emptyNote:
        "No leading indicators attached — without them this driver cannot be monitored.",
    },
    {
      heading: "Future territories",
      kind: "territory",
      items: linkedTerritories.map((t) => ({ id: t.id, title: t.name })),
      emptyNote:
        "No territory rests on this driver yet. Territories form where several drivers converge.",
    },
  ];

  const overview = (
    <OverviewContent
      driver={driver}
      result={result}
      linkedContradictions={linkedContradictions}
    />
  );

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={driver.name}
        actions={
          <ViewGate min="analyst">
            <div className="flex flex-col items-end gap-1">
              <DriverStanding result={result} />
              {recomputed ? <RecomputedNote /> : null}
            </div>
          </ViewGate>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
        <div>
          {mode === "simple" ? (
            overview
          ) : (
            <Tabs
              tabs={[
                {
                  id: "overview",
                  label: "Overview",
                  content: overview,
                },
                {
                  id: "validation",
                  label: "Validation",
                  content: (
                    <ValidationTab
                      driver={driver}
                      driverSignals={driverSignals}
                      result={result}
                    />
                  ),
                },
                {
                  id: "systems",
                  label: "Systems",
                  content: <SystemsTab driver={driver} />,
                },
                {
                  id: "evidence",
                  label: "Evidence",
                  content: (
                    <EvidenceTab
                      driver={driver}
                      driverSignals={driverSignals}
                      driverPatterns={linkedPatterns.map((p) => ({
                        id: p.id,
                        name: p.name,
                      }))}
                      driverIndicators={linkedIndicators}
                    />
                  ),
                },
                {
                  id: "contradictions",
                  label: `Contradictions (${linkedContradictions.length})`,
                  content:
                    linkedContradictions.length > 0 ? (
                      <div className="max-w-2xl space-y-8">
                        {linkedContradictions.map((c) => (
                          <ContradictionPanel key={c.id} contradiction={c} />
                        ))}
                      </div>
                    ) : (
                      <NoContradictionNote />
                    ),
                },
                {
                  id: "review",
                  label: "Review",
                  content: <ReviewTab driver={driver} />,
                },
              ]}
            />
          )}
        </div>

        <aside className="mt-10 space-y-8 lg:mt-0">
          <RelatedObjectsPanel groups={relatedGroups} />
          <ViewGate min="analyst">
            <BiasCheckPanel />
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
