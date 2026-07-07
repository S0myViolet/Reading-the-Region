"use client";

/**
 * Driver detail — one underlying force, its statement and what it explains,
 * live validation against the seven driver criteria, the ten-dimension score
 * grid, inferred second- and third-order effect chains, evidence links,
 * contradictions, and review controls. Status is always computed from the
 * evidence; the stored status is never presented on its own, and a weak
 * driver is never shown as validated.
 */

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
import { ScoreGrid } from "@/components/ScorePanel";
import {
  ConfidenceBadge,
  IdChip,
  ProvenanceBadge,
  ReviewStatusBadge,
} from "@/components/badges";
import { SystemTags } from "@/components/tags";
import { Field, Select, TextArea } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateDriver, type ValidationResult } from "@/lib/validation";
import type { ConfidenceLevel, Driver, ReviewStatus, Signal } from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  DRIVER_SCORE_LABELS,
  DRIVER_THRESHOLDS,
  REVIEW_STATUS_LABELS,
} from "@/lib/types";
import {
  DriverStatusPill,
  RecomputedNote,
  btnPrimary,
  btnSecondary,
  driverScoresRecord,
  fmtDate,
  signalsOfDriver,
  statusDisagrees,
} from "../driver-ui";

/** How many signal links show in the relationship trail before capping. */
const TRAIL_SIGNAL_CAP = 8;
/** How many signal links show on the Evidence tab before collapsing. */
const EVIDENCE_SIGNAL_COLLAPSE = 10;

// ---------------------------------------------------------------------------
// Overview tab
// ---------------------------------------------------------------------------

function OverviewTab({ driver }: { driver: Driver }) {
  return (
    <div className="space-y-4">
      <section className="card px-4 py-4">
        <p className="overline-label mb-2">Driver statement</p>
        {driver.driverStatement.trim() ? (
          <blockquote className="border-l-2 border-l-accent pl-4 font-display text-[17px] italic leading-relaxed text-ink">
            {driver.driverStatement}
          </blockquote>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No driver statement recorded yet. A driver must explain, not
            describe — state the force and mechanism that would produce the
            patterns this driver claims to explain.
          </p>
        )}
      </section>

      <section className="card px-4 py-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="overline-label">What it explains</p>
          <ProvenanceBadge label="human_interpretation" />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
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

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">
            Possible futures — if this force continues
          </h3>
        </header>
        {driver.possibleFutures.length > 0 ? (
          <ul className="divide-y divide-line">
            {driver.possibleFutures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 px-4 py-2.5">
                <span className="shrink-0 pt-px">
                  <ProvenanceBadge label="speculative_possibility" />
                </span>
                <span className="text-[13px] leading-relaxed text-ink-soft">{f}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-3 text-[12px] text-ink-faint">
            No possible futures articulated yet. A validated driver must
            produce plausible future scenarios — if none can be stated, the
            explanation is not yet doing any work.
          </p>
        )}
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">Systems affected</p>
        {driver.systemsAffected.length > 0 ? (
          <SystemTags systems={driver.systemsAffected} />
        ) : (
          <span className="text-[11.5px] text-ink-faint">
            No systems recorded yet. A structural force should touch at least
            one named system.
          </span>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation tab
// ---------------------------------------------------------------------------

function ValidationTab({
  driver,
  result,
}: {
  driver: Driver;
  result: ValidationResult;
}) {
  const t = DRIVER_THRESHOLDS;
  return (
    <div className="space-y-4">
      <ValidationChecklist
        result={result}
        title="Driver validation threshold"
        passedLabel="Validated driver"
        failedLabel="Driver hypothesis"
      />
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Driver scores — ten dimensions</h3>
        </header>
        <div className="px-4 py-3">
          <ScoreGrid
            scores={driverScoresRecord(driver.scores)}
            labels={DRIVER_SCORE_LABELS}
          />
          <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
            Validation benchmarks: ≥ {t.minPatterns} patterns explained, ≥{" "}
            {t.minSignals} signals, ≥ {t.minSectors} sectors, ≥{" "}
            {t.minIndependentSources} independent sources, ≥{" "}
            {t.minContradictions} contradictions, plus articulated futures and
            leading indicators. Scores record judgement; the checklist above
            records evidence.
          </p>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Systems tab — inferred effect chains
// ---------------------------------------------------------------------------

function EffectChainSection({
  title,
  items,
  emptyNote,
}: {
  title: string;
  items: string[];
  emptyNote: string;
}) {
  return (
    <section className="card">
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <h3 className="overline-label">{title}</h3>
        <ProvenanceBadge label="human_interpretation" />
      </header>
      {items.length > 0 ? (
        <ul className="divide-y divide-line">
          {items.map((e) => (
            <li key={e} className="px-4 py-2.5 text-[13px] leading-relaxed text-ink-soft">
              {e}
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-[12px] text-ink-faint">{emptyNote}</p>
      )}
    </section>
  );
}

function SystemsTab({ driver }: { driver: Driver }) {
  return (
    <div className="space-y-4">
      <p className="text-[11.5px] text-ink-faint">
        These effect chains are inferred by the analyst from the driver's
        logic — they are interpretation, not sourced facts. Each further order
        of effect carries less certainty than the one before it.
      </p>
      <EffectChainSection
        title="Second-order effects — inferred chain"
        items={driver.secondOrderEffects}
        emptyNote="No second-order effects traced yet. Ask: if this force holds, what changes because of the first change?"
      />
      <EffectChainSection
        title="Third-order effects — inferred chain"
        items={driver.thirdOrderEffects}
        emptyNote="No third-order effects traced yet. These are the least certain consequences — trace them, then look for early evidence."
      />
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
}: {
  driver: Driver;
  driverSignals: Signal[];
  driverPatterns: Array<{ id: string; name: string }>;
}) {
  const [showAllSignals, setShowAllSignals] = useState(false);
  const minSources = DRIVER_THRESHOLDS.minIndependentSources;
  const collapsed =
    !showAllSignals && driverSignals.length > EVIDENCE_SIGNAL_COLLAPSE;
  const visibleSignals = collapsed
    ? driverSignals.slice(0, EVIDENCE_SIGNAL_COLLAPSE)
    : driverSignals;

  return (
    <div className="space-y-4">
      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Independent sources</p>
        <p className="text-[13px] text-ink">
          Evidence drawn from{" "}
          <span className="font-mono">{driver.independentSourceCount}</span>{" "}
          independent source{driver.independentSourceCount === 1 ? "" : "s"}{" "}
          <span
            className={`font-mono text-[11.5px] ${
              driver.independentSourceCount >= minSources
                ? "text-accent-ink"
                : "text-caution"
            }`}
          >
            (validation needs ≥ {minSources})
          </span>
        </p>
      </section>

      <section>
        <p className="overline-label mb-2">
          Patterns this driver explains ({driverPatterns.length})
        </p>
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
      </section>

      <section>
        <p className="overline-label mb-2">
          Signals connected ({driverSignals.length})
        </p>
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
                className={`mt-3 ${btnSecondary}`}
                onClick={() => setShowAllSignals((v) => !v)}
              >
                {collapsed
                  ? `Show all ${driverSignals.length} signals`
                  : "Collapse signal list"}
              </button>
            ) : null}
          </>
        ) : (
          <p className="text-[11.5px] text-ink-faint">
            No signals connected yet. The explanatory claim must trace down to
            present-day evidence — link the signals the driver accounts for.
          </p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ driver }: { driver: Driver }) {
  const updateDriver = useIntelligenceStore((s) => s.updateDriver);
  const [notes, setNotes] = useState(driver.humanNotes);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl space-y-4">
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Human review</h3>
        </header>
        <div className="space-y-4 px-4 py-4">
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
          <div className="flex items-center gap-2">
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
      <p className="text-[11.5px] text-ink-faint">
        Created {fmtDate(driver.createdAt)} · Last updated {fmtDate(driver.updatedAt)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right column — hypothesis guidance
// ---------------------------------------------------------------------------

function HypothesisGuidanceCard({ result }: { result: ValidationResult }) {
  const failing = result.checks.filter((c) => !c.passed);
  return (
    <section className="card border-l-2 border-l-caution">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Hypothesis discipline</h3>
      </header>
      <div className="px-4 py-3">
        <p className="text-[12.5px] text-ink-soft">
          This driver should remain a hypothesis. It meets{" "}
          {result.passedCount} of {result.totalCount} validation criteria — the
          following still fail:
        </p>
        <ul className="mt-2 space-y-1.5">
          {failing.map((c) => (
            <li key={c.label} className="flex gap-2 text-[11.5px] text-ink-faint">
              <span aria-hidden className="font-bold text-caution">
                ✕
              </span>
              <span>
                <span className="text-ink-soft">{c.label}</span> — {c.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
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
        <PageHeader overline="Interpret & Imagine" title="Driver" />
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
        <PageHeader overline="Interpret & Imagine" title="Driver not found" />
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
          ? `Signals — first ${TRAIL_SIGNAL_CAP} of ${driverSignals.length}`
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

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader
        overline={`Interpret & Imagine · ${driver.id}`}
        title={driver.name}
        actions={
          <div className="flex flex-col items-end gap-1">
            <DriverStatusPill result={result} />
            {recomputed ? <RecomputedNote /> : null}
            <span className="font-mono text-[11px] text-ink-faint">
              {result.passedCount}/{result.totalCount} criteria met
            </span>
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
                content: <OverviewTab driver={driver} />,
              },
              {
                id: "validation",
                label: "Validation",
                content: <ValidationTab driver={driver} result={result} />,
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
                  />
                ),
              },
              {
                id: "contradictions",
                label: `Contradictions (${linkedContradictions.length})`,
                content:
                  linkedContradictions.length > 0 ? (
                    <div className="space-y-4">
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
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <div className="card flex flex-wrap items-center gap-1.5 px-4 py-2.5">
            <DriverStatusPill result={result} />
            <ReviewStatusBadge status={driver.reviewStatus} />
            <ConfidenceBadge level={driver.confidence} />
            <IdChip id={driver.id} />
          </div>
          <RelatedObjectsPanel groups={relatedGroups} />
          {trailSignalOverflow > 0 ? (
            <p className="text-[11.5px] text-ink-faint">
              Signal links in the trail are capped at {TRAIL_SIGNAL_CAP} — and{" "}
              {trailSignalOverflow} more on the Evidence tab.
            </p>
          ) : null}
          {!result.valid ? <HypothesisGuidanceCard result={result} /> : null}
          <BiasCheckPanel />
        </aside>
      </div>
    </>
  );
}
