"use client";

/**
 * Pattern detail — one repeated movement across clusters, with its statement,
 * strategic meaning, live validation against the four pattern tests, the
 * optional stronger threshold, evidence links, contradictions, and review
 * controls. Validation status is always computed from the evidence; the
 * stored validationStatus is never presented on its own.
 *
 * Visibility layers: the simple view reads as one article — statement,
 * validation status in plain language, strategic meaning, what could
 * contradict it, next step — separated by whitespace, not boxes. Analyst
 * view opens the full tabs: an at-a-glance overview that says what supports
 * the pattern and what could weaken it, the four tests as
 * requirement/current/threshold rows, the evidence base with per-signal
 * reasons, structured tensions, and review controls. Methodology view adds
 * the threshold table, the persistence arithmetic and the audit trail as
 * plain definition lines.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { NoContradictionNote } from "@/components/ContradictionPanel";
import { EntityLink } from "@/components/EntityLink";
import { evidenceBackingLine } from "@/components/EvidenceCompression";
import {
  AtAGlance,
  ConnectBlock,
  IncompleteNote,
  RelationshipTrail,
  TensionBlock,
  ValidationCheckRows,
  type TrailGroup,
} from "@/components/connect";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import {
  ConfidenceBadge,
  Pill,
  ProvenanceBadge,
  SignalStrengthBadge,
} from "@/components/badges";
import { Field, Select, TextArea } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { signalStage } from "@/lib/pipeline";
import {
  monthsBetween,
  patternStrongThreshold,
  validateCluster,
  validatePattern,
  type ValidationResult,
} from "@/lib/validation";
import {
  clusterPlainMeaning,
  explainContradiction,
  explainPatternStatus,
  patternPlainMeaning,
} from "@/lib/explain";
import { firstSentence } from "@/lib/simple";
import type {
  Cluster,
  ConfidenceLevel,
  Contradiction,
  Driver,
  Pattern,
  ReviewStatus,
  Signal,
  Source,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  PATTERN_THRESHOLDS,
  PATTERN_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  SECTOR_LABELS,
} from "@/lib/types";
import {
  PatternValidationPill,
  RecomputedNote,
  advancedNextStep,
  biasNotesInRecord,
  biasTagNote,
  btnPrimary,
  contradictionEffectOnPattern,
  derivePatternFacts,
  evidenceLeadInSentence,
  evidenceWindowLabel,
  failingTestSentences,
  findCheck,
  fmtDate,
  geographyConcentrationNote,
  independentSourceFigure,
  linkedSourcesOfPattern,
  mainTensionOfPattern,
  nextStepForPattern,
  patternCheckRows,
  patternWeaknesses,
  signalsOfPattern,
  sourceMixSummary,
  splitSentences,
  statusDisagrees,
  whySignalBelongs,
} from "../pattern-ui";

/** Cluster record plus its own live validation result, for the Evidence tab. */
interface ClusterEntry {
  cluster: Cluster;
  result: ValidationResult;
}

function MissingNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-ink-faint">{children}</p>;
}

function PatternStatement({ pattern }: { pattern: Pattern }) {
  return pattern.patternStatement.trim() ? (
    <p className="font-display text-[17px] italic leading-relaxed text-ink">
      {pattern.patternStatement}
    </p>
  ) : (
    <MissingNote>
      No pattern statement recorded yet. A pattern must be explainable as one
      clear movement in a single statement — without it, the coherence test
      cannot pass.
    </MissingNote>
  );
}

// ---------------------------------------------------------------------------
// Simple view — the pattern as one readable article, depth on demand
// ---------------------------------------------------------------------------

/** A labelled plain block: faint inline label, then the sentence(s). */
function PlainBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
      <span className="text-ink-faint">{label} — </span>
      {children}
    </p>
  );
}

function SimpleView({
  pattern,
  result,
  linkedContradictions,
  patternSignals,
  sources,
  recomputed,
}: {
  pattern: Pattern;
  result: ValidationResult;
  linkedContradictions: Contradiction[];
  patternSignals: Signal[];
  sources: Source[];
  recomputed: boolean;
}) {
  // The statement leads with the movement in one sentence, then says where
  // it shows up (ending in a "We see this across …" sentence). Split it so
  // the title never carries the whole argument.
  const statement = pattern.patternStatement.trim();
  const lead = statement ? firstSentence(statement) : "";
  const remainder = statement.slice(lead.length).trim();
  const whereWeSeeIt =
    remainder ||
    (pattern.evidenceSummary.trim() ? firstSentence(pattern.evidenceSummary) : "");

  return (
    <div className="space-y-5">
      {statement ? (
        <p className="max-w-2xl text-[14px] leading-relaxed text-ink">
          <span className="text-ink-faint">The pattern — </span>
          {lead}
        </p>
      ) : (
        <MissingNote>
          No pattern statement recorded yet. A pattern must be explainable as
          one clear movement in a single statement — without it, the coherence
          test cannot pass.
        </MissingNote>
      )}

      {whereWeSeeIt ? (
        <PlainBlock label="Where we see it">{whereWeSeeIt}</PlainBlock>
      ) : null}

      {pattern.strategicMeaning.trim() ? (
        <PlainBlock label="Why it matters">
          {firstSentence(pattern.strategicMeaning)}
        </PlainBlock>
      ) : (
        <MissingNote>
          No strategic meaning recorded yet. State what this movement means
          for decisions — interpretation, clearly labelled as such.
        </MissingNote>
      )}

      {linkedContradictions.length > 0 ? (
        <div className="max-w-2xl space-y-1.5">
          {linkedContradictions.slice(0, 2).map((c, i) => (
            <p key={c.id} className="text-[13px] leading-relaxed text-ink-soft">
              {i === 0 ? (
                <span className="text-ink-faint">What could challenge it — </span>
              ) : null}
              {explainContradiction(c)}{" "}
              <Link
                href={`/contradictions/${c.id}`}
                className="whitespace-nowrap text-[11.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:decoration-accent"
              >
                Explore this tension
              </Link>
            </p>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl">
          <p className="text-[13px] leading-relaxed text-ink-faint">
            What could challenge it —
          </p>
          <NoContradictionNote />
        </div>
      )}

      <div className="max-w-2xl">
        <PlainBlock label="Evidence">
          {evidenceBackingLine(patternSignals, sources)}
        </PlainBlock>
        {patternSignals.length > 0 ? (
          <details className="mt-1">
            <summary className="cursor-pointer list-none text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft">
              Show evidence
            </summary>
            <ul className="mt-2 space-y-1.5">
              {patternSignals.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/signals/${s.id}`}
                    className="text-[12.5px] leading-relaxed text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>

      <div className="max-w-2xl space-y-1.5 pt-1">
        <p className="text-[12px] leading-relaxed text-ink-faint">
          {explainPatternStatus(pattern, result)}
          {recomputed ? (
            <>
              {" "}
              <RecomputedNote />
            </>
          ) : null}
        </p>
        <p className="text-[12px] leading-relaxed text-ink-faint">
          Next step — {nextStepForPattern(result)}
        </p>
      </div>

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
  result,
  patternSignals,
  linkedSources,
  linkedClusters,
  linkedDrivers,
  mainTension,
}: {
  pattern: Pattern;
  result: ValidationResult;
  patternSignals: Signal[];
  linkedSources: Source[];
  linkedClusters: Cluster[];
  linkedDrivers: Driver[];
  mainTension: Contradiction | null;
}) {
  const facts = derivePatternFacts(patternSignals);
  const sourceFigure = independentSourceFigure(pattern, patternSignals, linkedSources);
  const weaknesses = patternWeaknesses(pattern, result, patternSignals, linkedSources);

  // Strategic meaning trimmed to its essentials: the first sentences carry
  // the reading; the rest stays available behind a quiet disclosure.
  const meaningSentences = splitSentences(pattern.strategicMeaning);
  const meaningLead = meaningSentences.slice(0, 3).join(" ");
  const meaningRest = meaningSentences.slice(3).join(" ");

  return (
    <div className="space-y-8">
      <section className="max-w-2xl">
        <h2 className="mb-3 text-[13px] font-medium text-ink">Pattern at a glance</h2>
        <AtAGlance
          items={[
            {
              label: "Status",
              value: result.valid ? (
                <span className="text-accent-ink">Validated</span>
              ) : (
                `Hypothesis — passes ${result.passedCount} of ${result.totalCount} tests`
              ),
            },
            { label: "Type", value: PATTERN_TYPE_LABELS[pattern.patternType] },
            {
              label: "Clusters",
              value: <span className="font-mono">{linkedClusters.length}</span>,
            },
            {
              label: "Key signals",
              value: <span className="font-mono">{patternSignals.length}</span>,
            },
            {
              label: "Independent sources",
              value: <span className="font-mono">{sourceFigure}</span>,
            },
            { label: "Evidence window", value: evidenceWindowLabel(pattern) },
            { label: "Confidence", value: CONFIDENCE_LABELS[pattern.confidence] },
            {
              label: "Main tension",
              value: mainTension ? (
                <Link
                  href={`/contradictions/${mainTension.id}`}
                  className="hover:text-accent-ink"
                >
                  {mainTension.name}
                </Link>
              ) : (
                "None linked yet"
              ),
            },
          ]}
        />
      </section>

      <ConnectBlock heading="Pattern statement">
        <PatternStatement pattern={pattern} />
      </ConnectBlock>

      <ConnectBlock heading="Plain meaning">
        <p>{patternPlainMeaning(pattern)}</p>
      </ConnectBlock>

      <ConnectBlock heading="Strategic meaning">
        {pattern.strategicMeaning.trim() ? (
          <>
            <p className="mb-1.5">
              <ProvenanceBadge label="human_interpretation" />
            </p>
            <p>{meaningLead}</p>
            {meaningRest ? (
              <details className="mt-1.5">
                <summary className="cursor-pointer list-none text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft">
                  Show the full reading
                </summary>
                <p className="mt-1.5">{meaningRest}</p>
              </details>
            ) : null}
          </>
        ) : (
          <MissingNote>
            No strategic meaning recorded yet. State what this movement means
            for decisions — interpretation, clearly labelled as such.
          </MissingNote>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Evidence summary">
        {pattern.evidenceSummary.trim() ? (
          <p>{pattern.evidenceSummary}</p>
        ) : (
          <MissingNote>
            No evidence summary recorded yet. Summarise what the key signals
            and clusters show — and where they disagree.
          </MissingNote>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Where it appears">
        {patternSignals.length === 0 && linkedClusters.length === 0 ? (
          <MissingNote>
            No key signals or clusters linked yet, so the pattern cannot be
            placed anywhere. Link the evidence that shows the movement.
          </MissingNote>
        ) : (
          <div className="space-y-1">
            <p>
              <span className="text-ink-faint">Sectors — </span>
              {facts.sectors.length > 0
                ? facts.sectors.map((s) => SECTOR_LABELS[s]).join(" · ")
                : "none yet; link key signals to place the movement"}
            </p>
            <p>
              <span className="text-ink-faint">Countries — </span>
              {facts.countries.length > 0
                ? facts.countries.join(" · ")
                : "none yet; link key signals to place the movement"}
            </p>
            <p>
              <span className="text-ink-faint">Clusters — </span>
              {linkedClusters.length > 0 ? (
                linkedClusters.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 ? " · " : null}
                    <Link
                      href={`/clusters/${c.id}`}
                      className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                    >
                      {c.name}
                    </Link>
                  </span>
                ))
              ) : (
                <span>none linked yet</span>
              )}
            </p>
          </div>
        )}
      </ConnectBlock>

      <ConnectBlock heading="What could weaken it">
        {weaknesses.length > 0 ? (
          <ul className="space-y-1.5">
            {weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : (
          <p>
            No test is failing and no concentration stands out in the linked
            evidence. That is not proof — keep looking for cases that cut
            against the movement.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Possible driver">
        {linkedDrivers.length > 0 ? (
          <p>
            A deeper force may explain this movement:{" "}
            {linkedDrivers.map((d, i) => (
              <span key={d.id}>
                {i > 0 ? (i === linkedDrivers.length - 1 ? " and " : ", ") : null}
                <Link
                  href={`/drivers/${d.id}`}
                  className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                >
                  {d.name}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : (
          <p>
            No driver linked yet — the movement has not been traced to a
            deeper force.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Next step">
        <p>{advancedNextStep(pattern, result, patternSignals)}</p>
      </ConnectBlock>
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
  patternSignals,
  recomputed,
}: {
  pattern: Pattern;
  result: ValidationResult;
  strongResult: ValidationResult;
  patternSignals: Signal[];
  recomputed: boolean;
}) {
  const months = monthsBetween(pattern.firstEvidenceDate, pattern.latestEvidenceDate);
  const minMonths = PATTERN_THRESHOLDS.minMonthsPersistence;
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <p className="text-[13.5px]">
          {result.valid ? (
            <span className="font-medium text-accent-ink">Validated</span>
          ) : (
            <span className="font-medium text-ink">Hypothesis</span>
          )}
          <span className="text-ink-soft">
            {" "}
            · {result.passedCount} of {result.totalCount} tests passed
          </span>
          {recomputed ? (
            <>
              {" "}
              <RecomputedNote />
            </>
          ) : null}
        </p>
        <div className="mt-4 border-t border-line pt-3">
          <ValidationCheckRows checks={patternCheckRows(pattern, result, patternSignals)} />
        </div>
      </section>
      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">Evidence window</h3>
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
      <section>
        <ValidationChecklist
          result={strongResult}
          title="Optional stronger threshold"
          passedLabel="Strong pattern"
          failedLabel="Below strong threshold"
        />
        <p className="mt-3 text-[11.5px] text-ink-faint">
          The stronger threshold is optional — failing it does not invalidate
          the pattern. Passing it marks a movement broad and deep enough to
          anchor a driver hypothesis.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence tab (analyst)
// ---------------------------------------------------------------------------

function EvidenceTab({
  pattern,
  result,
  patternSignals,
  linkedSources,
  clusterEntries,
}: {
  pattern: Pattern;
  result: ValidationResult;
  patternSignals: Signal[];
  linkedSources: Source[];
  clusterEntries: ClusterEntry[];
}) {
  const minSources = PATTERN_THRESHOLDS.minIndependentSources;
  const mix = sourceMixSummary(linkedSources);
  const derivedCount = linkedSources.length;
  const storedCount = pattern.independentSourceCount;

  // What is still missing: the failing tests plus any geographic
  // concentration; when nothing fails, the honest gap is counter-evidence.
  const gaps = [
    ...failingTestSentences(result),
    geographyConcentrationNote(patternSignals),
  ].filter((x): x is string => Boolean(x));

  // Source limitations: bias tags on the linked sources plus any bias
  // caveats already written into the record.
  const limitations = [biasTagNote(linkedSources), ...biasNotesInRecord(pattern)].filter(
    (x): x is string => Boolean(x),
  );

  return (
    <div className="space-y-8">
      <ConnectBlock heading="Independent sources">
        {mix ? (
          <>
            <p>
              {mix}{" "}
              <span className="font-mono text-[11.5px] text-ink-faint">
                (depth test needs ≥ {minSources})
              </span>
            </p>
            {derivedCount !== storedCount ? (
              <p className="mt-1.5 text-[12px] text-ink-faint">
                The depth test uses the recorded count of {storedCount}{" "}
                independent source{storedCount === 1 ? "" : "s"}; the key
                signals currently linked resolve to {derivedCount} source
                record{derivedCount === 1 ? "" : "s"}.
              </p>
            ) : null}
          </>
        ) : (
          <p>
            The record states {storedCount} independent source
            {storedCount === 1 ? "" : "s"}, but no source records are reachable
            through the key signals yet — link the signals that show this
            movement so the sources can be checked.
          </p>
        )}
      </ConnectBlock>

      <section>
        <h3 className="mb-1 text-[13px] font-medium text-ink">
          Key signals ({patternSignals.length})
        </h3>
        <p className="mb-3 max-w-2xl text-[12px] leading-relaxed text-ink-soft">
          {evidenceLeadInSentence(patternSignals)}
        </p>
        {patternSignals.length > 0 ? (
          <ul className="max-w-2xl divide-y divide-line">
            {patternSignals.map((s) => (
              <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <EntityLink kind="signal" id={s.id} title={s.title} />
                  <span className="flex shrink-0 items-center gap-2">
                    <SignalStrengthBadge strength={s.signalStrength} />
                    <ConfidenceBadge level={s.confidence} />
                    <span className="text-[11px] text-ink-faint">{s.country}</span>
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink-soft">
                  <span className="text-ink-faint">Why it belongs here — </span>
                  {whySignalBelongs(s)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-faint">
            No key signals linked yet. A pattern only exists through repeated
            evidence — connect the signals that show the same movement.
          </p>
        )}
      </section>

      <section className="max-w-2xl">
        <h3 className="mb-3 text-[13px] font-medium text-ink">
          Which clusters created this pattern ({clusterEntries.length})
        </h3>
        {clusterEntries.length > 0 ? (
          <div className="space-y-4">
            {clusterEntries.map(({ cluster, result: cr }) => (
              <div key={cluster.id}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <EntityLink kind="cluster" id={cluster.id} title={cluster.name} />
                  {cr.valid ? (
                    <Pill
                      tone="accent"
                      title={`${cr.passedCount} of ${cr.totalCount} cluster validation checks passed`}
                    >
                      Valid cluster
                    </Pill>
                  ) : (
                    <span className="text-[11px] text-ink-faint">
                      Candidate — {cr.passedCount}/{cr.totalCount} checks
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                  {clusterPlainMeaning(cluster)}
                </p>
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

      <ConnectBlock heading="What is still missing">
        {gaps.length > 0 ? (
          <ul className="space-y-1.5">
            {gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        ) : (
          <p>
            No test is failing right now. The gap to watch is counter-evidence
            — cases that cut against the movement — and time: the window must
            keep extending as new evidence arrives.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Source limitations">
        {limitations.length > 0 ? (
          <ul className="space-y-1.5">
            {limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        ) : (
          <p>
            No bias tags are recorded on the linked sources and no bias caveat
            is written into the record. Absence of a recorded bias is not
            absence of bias — ask who benefits from each source&apos;s story.
          </p>
        )}
      </ConnectBlock>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Methodology tab — thresholds spelled out, persistence arithmetic, audit trail
// ---------------------------------------------------------------------------

function AuditLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-52 shrink-0 text-[11.5px] text-ink-faint">{label}</dt>
      <dd className="text-[12.5px] text-ink-soft">{value}</dd>
    </div>
  );
}

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
    <div className="max-w-2xl space-y-8">
      <ConnectBlock heading="What a pattern is">
        <p>
          A pattern is a repeated movement across several clusters. It should
          not be created from one cluster or one sector alone, and it is only
          validated when the four tests below all pass.
        </p>
      </ConnectBlock>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">The four tests</h3>
        <ul className="max-w-2xl space-y-1.5 text-[12.5px] leading-relaxed text-ink-soft">
          <li>
            Breadth — the movement must appear in at least {t.minSectors}{" "}
            sectors. A movement confined to one sector is a sector story, not a
            pattern.
          </li>
          <li>
            Depth — at least {t.minIndependentSources} independent sources must
            support it. This stops one loud source from looking like a
            region-wide movement.
          </li>
          <li>
            Persistence — the evidence must span at least{" "}
            {t.minMonthsPersistence} months. This separates a durable movement
            from a news cycle.
          </li>
          <li>
            Coherence — the pattern must be sayable as one clear movement in a
            single statement. If it cannot, it is probably two patterns.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">
          Pattern validation thresholds
        </h3>
        <div className="overflow-x-auto">
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
        </div>
        <p className="mt-3 text-[11.5px] text-ink-faint">
          A pattern is validated only when breadth, depth, persistence and
          coherence all pass. The strong-pattern rows are optional — they mark
          an unusually broad movement, they do not gate validation. This
          pattern currently passes {result.passedCount} of {result.totalCount}{" "}
          tests.
        </p>
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Persistence arithmetic
        </h3>
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

      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">Audit trail</h3>
        <dl className="space-y-2">
          <AuditLine
            label="Record id"
            value={<span className="font-mono text-[11.5px]">{pattern.id}</span>}
          />
          <AuditLine label="Created" value={fmtDate(pattern.createdAt)} />
          <AuditLine label="Last updated" value={fmtDate(pattern.updatedAt)} />
          <AuditLine
            label="Review status"
            value={REVIEW_STATUS_LABELS[pattern.reviewStatus]}
          />
          <AuditLine
            label="Stored validation status"
            value={
              <span className="font-mono text-[11.5px]">
                {pattern.validationStatus}
              </span>
            }
          />
          <AuditLine
            label="Computed from evidence"
            value={
              <span className="font-mono text-[11.5px]">
                {result.valid ? "validated" : "not validated"} · {result.passedCount}/
                {result.totalCount} tests
              </span>
            }
          />
        </dl>
        <p className="mt-3 text-[11.5px] text-ink-faint">
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

function ReviewTab({
  pattern,
  result,
  patternSignals,
}: {
  pattern: Pattern;
  result: ValidationResult;
  patternSignals: Signal[];
}) {
  const updatePattern = useIntelligenceStore((s) => s.updatePattern);
  const [notes, setNotes] = useState(pattern.humanNotes);
  const [saved, setSaved] = useState(false);

  // Open questions recorded on the key signals themselves — real analyst
  // questions attached to the evidence, not generated prompts.
  const openQuestions = [
    ...new Set(patternSignals.flatMap((s) => s.openQuestions)),
  ].slice(0, 4);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h3 className="text-[13px] font-medium text-ink">Human review</h3>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          Human judgment, recorded here, is kept separate from the computed
          validation status and never overrides it.
        </p>
      </div>
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
          hint="How much trust to place in this reading when it informs decisions."
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
          placeholder="What feels solid? What is uncertain? What source bias might distort the reading? What would make this pattern weaker?"
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

      <div className="border-t border-line pt-4">
        <h4 className="text-[12.5px] font-medium text-ink">
          Open questions from the key signals
        </h4>
        {openQuestions.length > 0 ? (
          <ul className="mt-1.5 space-y-1">
            {openQuestions.map((q) => (
              <li key={q} className="text-[12px] leading-relaxed text-ink-soft">
                {q}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[12px] text-ink-faint">
            No open questions recorded on the key signals yet.
          </p>
        )}
      </div>

      <p className="text-[12px] leading-relaxed text-ink-soft">
        <span className="text-ink-faint">What to check next — </span>
        {advancedNextStep(pattern, result, patternSignals)}
      </p>

      <div className="border-t border-line pt-4">
        <h4 className="mb-2 text-[12.5px] font-medium text-ink">Audit trail</h4>
        <dl className="space-y-2">
          <AuditLine
            label="Record id"
            value={<span className="font-mono text-[11.5px]">{pattern.id}</span>}
          />
          <AuditLine label="Created" value={fmtDate(pattern.createdAt)} />
          <AuditLine label="Last updated" value={fmtDate(pattern.updatedAt)} />
          <AuditLine
            label="Computed from evidence"
            value={
              <span className="font-mono text-[11.5px]">
                {result.valid ? "validated" : "not validated"} ·{" "}
                {result.passedCount}/{result.totalCount} tests
              </span>
            }
          />
        </dl>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right rail — persistence guidance as a quiet aside, not a box
// ---------------------------------------------------------------------------

function PersistenceGuidance({
  pattern,
  result,
}: {
  pattern: Pattern;
  result: ValidationResult;
}) {
  const breadthPassed = findCheck(result, "Breadth test")?.passed ?? false;
  const months = monthsBetween(pattern.firstEvidenceDate, pattern.latestEvidenceDate);
  return (
    <aside className="border-l-2 border-caution/40 pl-4">
      <h3 className="text-[13px] font-medium text-ink">
        Persistence not yet demonstrated
      </h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
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
    </aside>
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
        <PageHeader title="Pattern" />
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
        <PageHeader title="Pattern not found" />
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

  const linkedSources = linkedSourcesOfPattern(patternSignals, sources);
  const mainTension = mainTensionOfPattern(pattern, contradictions);

  const clusterEntries: ClusterEntry[] = linkedClusters.map((c) => ({
    cluster: c,
    result: validateCluster(c, signals, sources),
  }));

  // Right-rail relationship trail — top links first, everything else behind
  // the expand control. Steps come only from records this pattern links to.
  const topSignals = [...patternSignals].sort(
    (a, b) =>
      b.scores.strategicRelevance - a.scores.strategicRelevance ||
      b.scores.evidence - a.scores.evidence,
  );
  const topSources = [...linkedSources].sort((a, b) => b.credibility - a.credibility);
  const trailGroups: TrailGroup[] = [
    {
      label: "Top signals",
      previewCount: 3,
      steps: topSignals.map((s) => ({
        stage: signalStage(s),
        title: s.title,
        href: `/signals/${s.id}`,
      })),
    },
    {
      label: "Top sources",
      previewCount: 3,
      steps: topSources.map((src) => ({
        stage: "source" as const,
        title: src.name,
        href: `/sources/${src.id}`,
      })),
    },
    {
      label: "Built from clusters",
      steps: linkedClusters.map((c) => ({
        stage: "cluster" as const,
        title: c.name,
        href: `/clusters/${c.id}`,
      })),
    },
    {
      label: "Possible drivers",
      steps: linkedDrivers.map((d) => ({
        stage: "driver" as const,
        title: d.name,
        href: `/drivers/${d.id}`,
      })),
    },
  ];
  const trailHasSteps = trailGroups.some((g) => g.steps.length > 0);

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

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <OverviewTab
          pattern={pattern}
          result={result}
          patternSignals={patternSignals}
          linkedSources={linkedSources}
          linkedClusters={linkedClusters}
          linkedDrivers={linkedDrivers}
          mainTension={mainTension}
        />
      ),
    },
    {
      id: "validation",
      label: "Validation",
      content: (
        <ValidationTab
          pattern={pattern}
          result={result}
          strongResult={strongResult}
          patternSignals={patternSignals}
          recomputed={recomputed}
        />
      ),
    },
    {
      id: "evidence",
      label: "Evidence",
      content: (
        <EvidenceTab
          pattern={pattern}
          result={result}
          patternSignals={patternSignals}
          linkedSources={linkedSources}
          clusterEntries={clusterEntries}
        />
      ),
    },
    {
      id: "contradictions",
      label: `Contradictions (${linkedContradictions.length})`,
      content:
        linkedContradictions.length > 0 ? (
          <div className="space-y-8">
            {linkedContradictions.map((c) => (
              <TensionBlock
                key={c.id}
                name={c.name}
                href={`/contradictions/${c.id}`}
                typeLabel={`Contradiction · ${CONTRADICTION_TYPE_LABELS[c.contradictionType]}`}
                sideA={{ claim: c.sideA, support: c.evidenceSideA }}
                sideB={{ claim: c.sideB, support: c.evidenceSideB }}
                rows={[
                  {
                    label: "Why it matters",
                    text: firstSentence(
                      c.underlyingTension.trim() || c.strategicImplication,
                    ),
                  },
                  {
                    label: "Effect on this pattern",
                    text: contradictionEffectOnPattern(c, pattern),
                  },
                ]}
              />
            ))}
          </div>
        ) : (
          <IncompleteNote
            missing="No contradiction linked yet."
            whyItMatters="A pattern nobody has argued against has not been tested."
            nextStep="Look for evidence that cuts against this movement before connecting it to a driver."
          />
        ),
    },
    {
      id: "review",
      label: "Review",
      content: (
        <ReviewTab pattern={pattern} result={result} patternSignals={patternSignals} />
      ),
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
        title={pattern.name}
        description={PATTERN_TYPE_LABELS[pattern.patternType]}
        actions={
          <>
            <PipelineStageBadge stage="pattern" />
            {simple ? null : (
              <div className="flex flex-col items-end gap-1">
                <PatternValidationPill result={result} />
                {recomputed ? <RecomputedNote /> : null}
              </div>
            )}
          </>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>
          {simple ? (
            <SimpleView
              pattern={pattern}
              result={result}
              linkedContradictions={linkedContradictions}
              patternSignals={patternSignals}
              sources={sources}
              recomputed={recomputed}
            />
          ) : (
            <Tabs tabs={tabs} />
          )}
        </div>

        {/* In simple mode the Show evidence disclosure covers the trail
            plainly, so the right rail stays analyst-and-up. */}
        <aside className="mt-10 space-y-8 lg:mt-0">
          <ViewGate min="analyst">
            {trailHasSteps ? (
              <section>
                <h2 className="mb-3 text-[13px] font-medium text-ink">
                  Relationship trail
                </h2>
                <RelationshipTrail groups={trailGroups} />
              </section>
            ) : (
              <IncompleteNote
                missing="No linked records yet."
                whyItMatters="A pattern only exists through the clusters and signals that show the movement."
                nextStep="Link the clusters this pattern repeats across, then the key signals inside them."
              />
            )}
            {persistenceFailed ? (
              <PersistenceGuidance pattern={pattern} result={result} />
            ) : null}
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
