"use client";

/**
 * Pattern detail — one repeated movement across clusters, with its statement,
 * strategic meaning, live validation against the four pattern tests, the
 * optional stronger threshold, evidence links, contradictions, and review
 * controls. Validation status is always computed from the evidence; the
 * stored validationStatus is never presented on its own.
 *
 * Visibility layers: the simple view reads as prose — statement, validation
 * status in plain language (which tests passed or failed), strategic
 * meaning, what could contradict it, next step — with the relationship trail
 * alongside. Analyst view opens the full tabs (four tests in detail, strong
 * threshold, key-signal table, cluster statuses, review controls);
 * Methodology view adds the threshold table, the persistence arithmetic and
 * the audit trail.
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
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import {
  ConfidenceBadge,
  IdChip,
  Pill,
  ProvenanceBadge,
  ReviewStatusBadge,
  SignalStrengthBadge,
} from "@/components/badges";
import { PlainTags, SectorTags, SystemTags } from "@/components/tags";
import { Field, Select, TextArea } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  monthsBetween,
  patternStrongThreshold,
  validateCluster,
  validatePattern,
  type ValidationResult,
} from "@/lib/validation";
import { explainContradiction, explainPatternStatus } from "@/lib/explain";
import type {
  ConfidenceLevel,
  Contradiction,
  Pattern,
  ReviewStatus,
  Signal,
} from "@/lib/types";
import {
  ACTOR_TYPE_LABELS,
  CONFIDENCE_LABELS,
  PATTERN_THRESHOLDS,
  PATTERN_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/types";
import {
  PatternValidationPill,
  RecomputedNote,
  btnPrimary,
  derivePatternFacts,
  findCheck,
  fmtDate,
  nextStepForPattern,
  signalsOfPattern,
  statusDisagrees,
} from "../pattern-ui";

/** Cluster link plus its own live validity, for the Evidence tab. */
interface LinkedClusterStatus {
  id: string;
  name: string;
  valid: boolean;
  passedCount: number;
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Simple view — the pattern as readable prose, depth on demand
// ---------------------------------------------------------------------------

function SimpleView({
  pattern,
  result,
  linkedContradictions,
  recomputed,
}: {
  pattern: Pattern;
  result: ValidationResult;
  linkedContradictions: Contradiction[];
  recomputed: boolean;
}) {
  return (
    <div className="space-y-4">
      <section className="card px-4 py-4">
        <p className="overline-label mb-2">Pattern statement</p>
        {pattern.patternStatement.trim() ? (
          <blockquote className="border-l-2 border-l-accent pl-4 font-display text-[17px] italic leading-relaxed text-ink">
            {pattern.patternStatement}
          </blockquote>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No pattern statement recorded yet. A pattern must be explainable as
            one clear movement in a single statement — without it, the coherence
            test cannot pass.
          </p>
        )}
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">Validation status</p>
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <PatternValidationPill result={result} />
          {recomputed ? <RecomputedNote /> : null}
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {explainPatternStatus(pattern, result)}
        </p>
      </section>

      <section className="card px-4 py-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="overline-label">Strategic meaning</p>
          <ProvenanceBadge label="human_interpretation" />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {pattern.strategicMeaning.trim() ? (
            pattern.strategicMeaning
          ) : (
            <span className="text-[12px] text-ink-faint">
              No strategic meaning recorded yet. State what this movement means
              for decisions — interpretation, clearly labelled as such.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">What could contradict this</p>
        {linkedContradictions.length > 0 ? (
          <ul className="space-y-2">
            {linkedContradictions.map((c) => (
              <li key={c.id} className="text-[13px] leading-relaxed text-ink-soft">
                {explainContradiction(c)}{" "}
                <Link
                  href={`/contradictions/${c.id}`}
                  className="whitespace-nowrap text-[11.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:decoration-accent"
                >
                  View {c.id}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <NoContradictionNote />
        )}
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Next step</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {nextStepForPattern(result)}
        </p>
      </section>

      <DepthHint>
        The four tests in detail, the strong-pattern threshold, key-signal and
        cluster evidence, and review controls
      </DepthHint>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview tab (analyst)
// ---------------------------------------------------------------------------

function OverviewTab({
  pattern,
  patternSignals,
}: {
  pattern: Pattern;
  patternSignals: Signal[];
}) {
  const facts = derivePatternFacts(patternSignals);
  return (
    <div className="space-y-4">
      <section className="card px-4 py-4">
        <p className="overline-label mb-2">Pattern statement</p>
        {pattern.patternStatement.trim() ? (
          <blockquote className="border-l-2 border-l-accent pl-4 font-display text-[17px] italic leading-relaxed text-ink">
            {pattern.patternStatement}
          </blockquote>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No pattern statement recorded yet. A pattern must be explainable as
            one clear movement in a single statement — without it, the coherence
            test cannot pass.
          </p>
        )}
      </section>

      <section className="card px-4 py-3">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="overline-label">Strategic meaning</p>
          <ProvenanceBadge label="human_interpretation" />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {pattern.strategicMeaning.trim() ? (
            pattern.strategicMeaning
          ) : (
            <span className="text-[12px] text-ink-faint">
              No strategic meaning recorded yet. State what this movement means
              for decisions — interpretation, clearly labelled as such.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Evidence summary</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {pattern.evidenceSummary.trim() ? (
            pattern.evidenceSummary
          ) : (
            <span className="text-[12px] text-ink-faint">
              No evidence summary recorded yet. Summarise what the key signals
              and clusters show — and where they disagree.
            </span>
          )}
        </p>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Derived from key signals — not asserted</h3>
        </header>
        <dl className="space-y-3 px-4 py-3">
          <div>
            <dt className="overline-label mb-1">Sectors involved</dt>
            <dd>
              {facts.sectors.length > 0 ? (
                <SectorTags sectors={facts.sectors} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No sectors yet — link key signals to derive them.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Geographies</dt>
            <dd>
              {facts.countries.length > 0 ? (
                <PlainTags tags={facts.countries} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No geographies yet — link key signals to derive them.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Actor types</dt>
            <dd>
              {facts.actorTypes.length > 0 ? (
                <PlainTags tags={facts.actorTypes.map((a) => ACTOR_TYPE_LABELS[a])} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No actor types yet — link key signals to derive them.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Systems affected</dt>
            <dd>
              {facts.systems.length > 0 ? (
                <SystemTags systems={facts.systems} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No systems yet — link key signals to derive them.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation tab (analyst)
// ---------------------------------------------------------------------------

function ValidationTab({
  pattern,
  result,
  strongResult,
}: {
  pattern: Pattern;
  result: ValidationResult;
  strongResult: ValidationResult;
}) {
  const months = monthsBetween(pattern.firstEvidenceDate, pattern.latestEvidenceDate);
  const minMonths = PATTERN_THRESHOLDS.minMonthsPersistence;
  return (
    <div className="space-y-4">
      <ValidationChecklist
        result={result}
        title="Pattern validation tests"
        passedLabel="Validated"
        failedLabel="Not yet validated"
      />
      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Evidence window</p>
        <p className="text-[13px] text-ink">
          {fmtDate(pattern.firstEvidenceDate)}{" "}
          <span aria-hidden className="text-ink-faint">
            →
          </span>{" "}
          {fmtDate(pattern.latestEvidenceDate)}{" "}
          <span
            className={`font-mono text-[11.5px] ${
              months >= minMonths ? "text-accent-ink" : "text-caution"
            }`}
          >
            ({months} month{months === 1 ? "" : "s"}, needs ≥ {minMonths})
          </span>
        </p>
        <p className="mt-1 text-[11.5px] text-ink-faint">
          The persistence test requires the same movement to hold across at
          least {minMonths} months of evidence, not a short burst of coverage.
        </p>
      </section>
      <ValidationChecklist
        result={strongResult}
        title="Optional stronger threshold"
        passedLabel="Strong pattern"
        failedLabel="Below strong threshold"
      />
      <p className="text-[11.5px] text-ink-faint">
        The stronger threshold is optional — failing it does not invalidate the
        pattern, but passing it marks a movement broad and deep enough to carry
        significant weight in driver hypotheses.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence tab (analyst)
// ---------------------------------------------------------------------------

function EvidenceTab({
  pattern,
  patternSignals,
  patternClusters,
}: {
  pattern: Pattern;
  patternSignals: Signal[];
  patternClusters: LinkedClusterStatus[];
}) {
  const minSources = PATTERN_THRESHOLDS.minIndependentSources;
  return (
    <div className="space-y-4">
      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Independent sources</p>
        <p className="text-[13px] text-ink">
          Supported by{" "}
          <span className="font-mono">{pattern.independentSourceCount}</span>{" "}
          independent source{pattern.independentSourceCount === 1 ? "" : "s"}{" "}
          <span
            className={`font-mono text-[11.5px] ${
              pattern.independentSourceCount >= minSources
                ? "text-accent-ink"
                : "text-caution"
            }`}
          >
            (depth test needs ≥ {minSources})
          </span>
        </p>
      </section>

      <section>
        <p className="overline-label mb-2">
          Key signals ({patternSignals.length})
        </p>
        {patternSignals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Strength</th>
                  <th>Confidence</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {patternSignals.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <EntityLink kind="signal" id={s.id} title={s.title} />
                    </td>
                    <td>
                      <SignalStrengthBadge strength={s.signalStrength} />
                    </td>
                    <td>
                      <ConfidenceBadge level={s.confidence} />
                    </td>
                    <td className="text-[12px] text-ink-soft">{s.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[11.5px] text-ink-faint">
            No key signals linked yet. A pattern only exists through repeated
            evidence — connect the signals that show the same movement.
          </p>
        )}
      </section>

      <section>
        <p className="overline-label mb-2">
          Clusters involved ({patternClusters.length})
        </p>
        {patternClusters.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {patternClusters.map((c) => (
              <div key={c.id}>
                <EntityLink kind="cluster" id={c.id} title={c.name} />
                <div className="mt-1 pl-0.5">
                  <Pill
                    tone={c.valid ? "accent" : "caution"}
                    title={`${c.passedCount} of ${c.totalCount} cluster validation checks passed`}
                  >
                    {c.valid
                      ? "Valid cluster"
                      : `Candidate — ${c.passedCount}/${c.totalCount} checks`}
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11.5px] text-ink-faint">
            No clusters linked yet. A pattern is stronger than a cluster because
            the same movement repeats across several of them.
          </p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Methodology tab — thresholds spelled out, persistence arithmetic, audit trail
// ---------------------------------------------------------------------------

function MethodologyTab({
  pattern,
  result,
}: {
  pattern: Pattern;
  result: ValidationResult;
}) {
  const t = PATTERN_THRESHOLDS;
  const months = monthsBetween(pattern.firstEvidenceDate, pattern.latestEvidenceDate);
  const thresholdRows: Array<[string, string]> = [
    ["Breadth test — minimum sectors", String(t.minSectors)],
    ["Depth test — minimum independent sources", String(t.minIndependentSources)],
    ["Persistence test — minimum months of evidence", String(t.minMonthsPersistence)],
    ["Coherence test — one clear movement in a single statement", "qualitative"],
    ["Strong pattern — minimum signals", String(t.strongMinSignals)],
    ["Strong pattern — minimum sectors", String(t.strongMinSectors)],
    ["Strong pattern — minimum geographies", String(t.strongMinGeographies)],
    ["Strong pattern — minimum actor types", String(t.strongMinActorTypes)],
  ];
  return (
    <div className="space-y-4">
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Pattern validation thresholds</h3>
        </header>
        <div className="overflow-x-auto px-4 py-3">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {thresholdRows.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="font-mono text-[11.5px]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
            A pattern is validated only when breadth, depth, persistence and
            coherence all pass. The strong-pattern rows are optional — they mark
            extra weight, they do not gate validation. This pattern currently
            passes {result.passedCount} of {result.totalCount} tests.
          </p>
        </div>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Persistence arithmetic</p>
        <p className="text-[13px] text-ink">
          First evidence {fmtDate(pattern.firstEvidenceDate)}{" "}
          <span aria-hidden className="text-ink-faint">
            →
          </span>{" "}
          latest evidence {fmtDate(pattern.latestEvidenceDate)}
        </p>
        <p className="mt-1 text-[11.5px] text-ink-faint">
          Persistence is measured as calendar months between the first and
          latest evidence dates: {months} month{months === 1 ? "" : "s"}{" "}
          (minimum {t.minMonthsPersistence}). Extending the window requires new
          evidence, not a new claim.
        </p>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Audit trail</h3>
        </header>
        <dl className="space-y-2.5 px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Record id</dt>
            <dd>
              <IdChip id={pattern.id} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Created</dt>
            <dd className="text-[12.5px] text-ink">{fmtDate(pattern.createdAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Last updated</dt>
            <dd className="text-[12.5px] text-ink">{fmtDate(pattern.updatedAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Review status</dt>
            <dd>
              <ReviewStatusBadge status={pattern.reviewStatus} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Stored validation status</dt>
            <dd className="font-mono text-[11.5px] text-ink-soft">
              {pattern.validationStatus}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Computed from evidence</dt>
            <dd className="font-mono text-[11.5px] text-ink-soft">
              {result.valid ? "validated" : "not validated"} · {result.passedCount}/
              {result.totalCount} tests
            </dd>
          </div>
        </dl>
        <p className="border-t border-line px-4 py-2.5 text-[11.5px] text-ink-faint">
          Review status is a human decision recorded in the Review tab. When the
          stored validation status disagrees with the computed result, the
          computed result wins and the disagreement is stated.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab (analyst)
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ pattern }: { pattern: Pattern }) {
  const updatePattern = useIntelligenceStore((s) => s.updatePattern);
  const [notes, setNotes] = useState(pattern.humanNotes);
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
                value={pattern.reviewStatus}
                onChange={(e) =>
                  updatePattern(pattern.id, {
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
              hint="How much weight the pattern interpretation should carry."
            >
              <Select
                value={pattern.confidence}
                onChange={(e) =>
                  updatePattern(pattern.id, {
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
            hint="Interpretation, doubts, and next evidence to look for."
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
                updatePattern(pattern.id, { humanNotes: notes });
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
        Created {fmtDate(pattern.createdAt)} · Last updated {fmtDate(pattern.updatedAt)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right column — persistence guidance
// ---------------------------------------------------------------------------

function PersistenceGuidanceCard({
  pattern,
  result,
}: {
  pattern: Pattern;
  result: ValidationResult;
}) {
  const breadthPassed = findCheck(result, "Breadth test")?.passed ?? false;
  const months = monthsBetween(pattern.firstEvidenceDate, pattern.latestEvidenceDate);
  return (
    <section className="card border-l-2 border-l-caution">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Persistence not yet demonstrated</h3>
      </header>
      <div className="px-4 py-3">
        <p className="text-[12.5px] text-ink-soft">
          {breadthPassed
            ? "This pattern has breadth but not enough time-based evidence."
            : "This pattern does not yet have enough time-based evidence."}
        </p>
        <p className="mt-1.5 text-[11.5px] text-ink-faint">
          The evidence window spans {months} month{months === 1 ? "" : "s"};
          the persistence test needs at least{" "}
          {PATTERN_THRESHOLDS.minMonthsPersistence}. Keep scanning and extend
          the window before treating this movement as validated.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PatternDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const mode = useViewMode();
  const patterns = useIntelligenceStore((s) => s.patterns);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const drivers = useIntelligenceStore((s) => s.drivers);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Patterns", href: "/patterns" }]} />
        <PageHeader overline="Connect & Synthesize" title="Pattern" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const id = typeof params.id === "string" ? params.id : "";
  const pattern = patterns.find((p) => p.id === id);

  if (!pattern) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Patterns", href: "/patterns" }, { label: "Not found" }]}
        />
        <PageHeader overline="Connect & Synthesize" title="Pattern not found" />
        <EmptyState
          message={`No pattern carries the id “${id}”. It may have been created in a different browser (the intelligence base is stored locally) or the id may be mistyped. Browse the pattern list to find the record you need.`}
          actionLabel="Back to Patterns"
          actionHref="/patterns"
        />
      </>
    );
  }

  const result = validatePattern(pattern, signals);
  const strongResult = patternStrongThreshold(pattern, signals);
  const patternSignals = signalsOfPattern(pattern, signals);
  const linkedClusters = clusters.filter((c) => pattern.clusterIds.includes(c.id));
  const linkedContradictions = contradictions.filter((c) =>
    pattern.contradictionIds.includes(c.id),
  );
  const linkedDrivers = drivers.filter((d) =>
    pattern.possibleDriverIds.includes(d.id),
  );
  const persistenceFailed = !(findCheck(result, "Persistence test")?.passed ?? false);
  const recomputed = statusDisagrees(pattern, result);
  const simple = mode === "simple";

  const clusterStatuses: LinkedClusterStatus[] = linkedClusters.map((c) => {
    const clusterResult = validateCluster(c, signals, sources);
    return {
      id: c.id,
      name: c.name,
      valid: clusterResult.valid,
      passedCount: clusterResult.passedCount,
      totalCount: clusterResult.totalCount,
    };
  });

  const crumbs: Array<{ label: string; href?: string }> = [
    { label: "Patterns", href: "/patterns" },
    { label: pattern.name },
  ];
  if (linkedDrivers.length > 0) {
    crumbs.push({
      label: `Possible driver: ${linkedDrivers[0].name}`,
      href: `/drivers/${linkedDrivers[0].id}`,
    });
  }

  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Clusters",
      kind: "cluster",
      items: linkedClusters.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No clusters linked yet — a pattern rests on repeated cluster logic.",
    },
    {
      heading: "Key signals",
      kind: "signal",
      items: patternSignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No key signals linked yet — a pattern only exists through its evidence.",
    },
    {
      heading: "Contradictions",
      kind: "contradiction",
      items: linkedContradictions.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No contradictions linked. A pattern without tension is usually under-scanned.",
    },
    {
      heading: "Possible drivers",
      kind: "driver",
      items: linkedDrivers.map((d) => ({ id: d.id, title: d.name })),
      emptyNote: "No driver hypotheses connected yet.",
    },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: <OverviewTab pattern={pattern} patternSignals={patternSignals} />,
    },
    {
      id: "validation",
      label: "Validation",
      content: (
        <ValidationTab
          pattern={pattern}
          result={result}
          strongResult={strongResult}
        />
      ),
    },
    {
      id: "evidence",
      label: "Evidence",
      content: (
        <EvidenceTab
          pattern={pattern}
          patternSignals={patternSignals}
          patternClusters={clusterStatuses}
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
      content: <ReviewTab pattern={pattern} />,
    },
  ];
  if (mode === "methodology") {
    tabs.push({
      id: "methodology",
      label: "Methodology",
      content: <MethodologyTab pattern={pattern} result={result} />,
    });
  }

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader
        overline={`Connect & Synthesize · ${pattern.id}`}
        title={pattern.name}
        actions={
          simple ? (
            <Pill tone="info">{PATTERN_TYPE_LABELS[pattern.patternType]}</Pill>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <PatternValidationPill result={result} />
              {recomputed ? <RecomputedNote /> : null}
              <span className="font-mono text-[11px] text-ink-faint">
                {result.passedCount}/{result.totalCount} tests passed
              </span>
            </div>
          )
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>
          {simple ? (
            <SimpleView
              pattern={pattern}
              result={result}
              linkedContradictions={linkedContradictions}
              recomputed={recomputed}
            />
          ) : (
            <Tabs tabs={tabs} />
          )}
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <ViewGate min="analyst">
            <div className="card flex flex-wrap items-center gap-1.5 px-4 py-2.5">
              <Pill tone="info">{PATTERN_TYPE_LABELS[pattern.patternType]}</Pill>
              <ReviewStatusBadge status={pattern.reviewStatus} />
              <ConfidenceBadge level={pattern.confidence} />
              <IdChip id={pattern.id} />
            </div>
          </ViewGate>
          <RelatedObjectsPanel groups={relatedGroups} />
          <ViewGate min="analyst">
            {persistenceFailed ? (
              <PersistenceGuidanceCard pattern={pattern} result={result} />
            ) : null}
            <BiasCheckPanel />
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
