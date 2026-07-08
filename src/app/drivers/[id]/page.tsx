"use client";

/**
 * Driver detail — one underlying force, its statement and what it explains.
 * Status is always computed from the evidence via validateDriver; the stored
 * status is never presented on its own, and a weak driver is never shown as
 * validated.
 *
 * The page answers five questions in order, plain English first: what is
 * this force, why it matters, what could weaken it, what to watch next —
 * then the full depth (live validation checks, score readings, effect
 * chains, evidence links, structured tensions, review controls). The simple
 * view keeps its original article layout untouched. Analyst view opens the
 * tabbed workspace with a status strip under the title; Methodology view
 * adds the threshold table and the audit trail. The evidence trail sits in
 * the right rail — top links by default, the full trail on request.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { NoContradictionNote } from "@/components/ContradictionPanel";
import { EntityLink, RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import {
  ConnectBlock,
  IncompleteNote,
  RelationshipTrail,
  ShowAllList,
  StatusStrip,
  TensionBlock,
  ValidationCheckRows,
  type TrailGroup,
} from "@/components/connect";
import { ScoreBar } from "@/components/ScorePanel";
import {
  ConfidenceBadge,
  ProvenanceBadge,
  SignalStrengthBadge,
  TrendBadge,
} from "@/components/badges";
import { SystemTags } from "@/components/tags";
import { Field, Select, TextArea } from "@/components/form";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { signalStage } from "@/lib/pipeline";
import { validateDriver, type ValidationResult } from "@/lib/validation";
import {
  explainConfidenceGeneric,
  explainContradiction,
  explainDriverStatus,
  patternPlainMeaning,
} from "@/lib/explain";
import { firstSentence } from "@/lib/simple";
import type {
  ConfidenceLevel,
  Contradiction,
  Driver,
  DriverScores,
  MonitoringIndicator,
  Pattern,
  ReviewStatus,
  Signal,
  Source,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  DRIVER_SCORE_LABELS,
  DRIVER_THRESHOLDS,
  REVIEW_STATUS_LABELS,
} from "@/lib/types";
import {
  RecomputedNote,
  btnPrimary,
  driverCheckRows,
  driverEvidenceNote,
  driverMissingPhrases,
  driverNextStep,
  driverScoreReading,
  driverStatusStripItems,
  driverWhyItMatters,
  firstOrderEffectSentence,
  fmtDate,
  mainContradictionOfDriver,
  signalsOfDriver,
  sourcesOfDriver,
  statementLead,
  statusDisagrees,
  strengthenSidesSentence,
  systemsTouchedLine,
  whatItExplainsParas,
} from "../driver-ui";

/** How many signal links show in the simple-view relationship trail. */
const TRAIL_SIGNAL_CAP = 8;
/** How many signals the Evidence tab shows before the show-all control. */
const EVIDENCE_SIGNAL_PREVIEW = 8;
/** How many steps each main sidebar trail group shows by default. */
const SIDEBAR_PREVIEW = 5;

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

const disclosureSummary =
  "cursor-pointer list-none text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft";

// ---------------------------------------------------------------------------
// Simple view — unchanged article layout: statement, what it explains,
// standing, confidence, tensions, next step.
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
    </article>
  );
}

// ---------------------------------------------------------------------------
// Overview tab (analyst) — plain English first: what the force is, why it
// matters, what could weaken it, what to watch next. Depth follows.
// ---------------------------------------------------------------------------

function AdvancedOverviewTab({
  driver,
  result,
  driverSignals,
  mainContradiction,
  otherContradictionCount,
  linkedIndicators,
}: {
  driver: Driver;
  result: ValidationResult;
  driverSignals: Signal[];
  mainContradiction: Contradiction | null;
  otherContradictionCount: number;
  linkedIndicators: MonitoringIndicator[];
}) {
  const { lead, rest } = statementLead(driver);
  const whyParas = driverWhyItMatters(driver, driverSignals);
  const explainsParas = whatItExplainsParas(driver);
  const watchList = linkedIndicators.slice(0, 4);

  return (
    <div className="max-w-2xl space-y-8">
      <ConnectBlock heading="What is this force?">
        {lead ? (
          <>
            <p>{lead}</p>
            {rest ? (
              <details className="mt-1.5">
                <summary className={disclosureSummary}>
                  Show the full statement
                </summary>
                <p className="mt-1.5">{rest}</p>
              </details>
            ) : null}
          </>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No driver statement recorded yet. A driver must explain, not
            describe — state the force that would produce the patterns it
            claims to explain.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Why it matters">
        {whyParas.length > 0 ? (
          <div className="space-y-1.5">
            {whyParas.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-ink-faint">
            Not recorded yet. Say who has to act differently if this force is
            real — without that, the driver is trivia.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="What could weaken it">
        {mainContradiction ? (
          <>
            <p>{explainContradiction(mainContradiction)}</p>
            <p className="mt-1.5">
              {firstSentence(
                mainContradiction.underlyingTension.trim() ||
                  mainContradiction.strategicImplication,
              )}{" "}
              <Link
                href={`/contradictions/${mainContradiction.id}`}
                className="whitespace-nowrap text-[12px] underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
              >
                Open this tension
              </Link>
            </p>
            {otherContradictionCount > 0 ? (
              <p className="mt-1.5 text-[12px] text-ink-faint">
                {otherContradictionCount} more tension
                {otherContradictionCount === 1 ? " sits" : "s sit"} on the
                Contradictions tab.
              </p>
            ) : null}
          </>
        ) : (
          <IncompleteNote
            missing="No contradiction is linked to this driver yet."
            whyItMatters="A force nobody has argued against has not been tested."
            nextStep="Look for evidence that cuts against this explanation and link it as a contradiction."
          />
        )}
      </ConnectBlock>

      <ConnectBlock heading="What to watch next">
        {watchList.length > 0 ? (
          <ul className="space-y-1.5">
            {watchList.map((i) => (
              <li key={i.id}>
                <Link
                  href="/monitoring"
                  className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                >
                  {i.name}
                </Link>
                <span className="text-ink-faint"> — {firstSentence(i.description)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No leading indicators are attached yet, so there is nothing to
            watch. Decide what should move first if this force is real, then
            track it in Monitoring.
          </p>
        )}
      </ConnectBlock>

      <div className="space-y-8 border-t border-line pt-6">
        <ConnectBlock heading="What it explains">
          {explainsParas.length > 0 ? (
            <>
              <ViewGate min="methodology">
                <p className="mb-1.5">
                  <ProvenanceBadge label="human_interpretation" />
                </p>
              </ViewGate>
              <div className="space-y-1.5">
                {explainsParas.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[12px] text-ink-faint">
              Not recorded yet. Name the patterns this force accounts for — a
              driver that explains only one pattern is usually a restatement of
              that pattern.
            </p>
          )}
        </ConnectBlock>

        <ConnectBlock heading="Confidence">
          <div className="mb-1.5">
            <ConfidenceBadge level={driver.confidence} />
          </div>
          <p>
            {explainConfidenceGeneric(driver.confidence, driverEvidenceNote(driver))}
          </p>
        </ConnectBlock>

        <ConnectBlock heading="Possible futures — if this force continues">
          {driver.possibleFutures.length > 0 ? (
            <>
              <p className="mb-1.5 text-[12px] text-ink-faint">
                These are plausible directions, not predictions.
              </p>
              <ul className="space-y-2">
                {driver.possibleFutures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <ViewGate min="methodology">
                      <span className="shrink-0 pt-px">
                        <ProvenanceBadge label="speculative_possibility" />
                      </span>
                    </ViewGate>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[12px] text-ink-faint">
              No possible futures articulated yet. A validated driver must
              produce plausible future scenarios — if none can be stated, the
              explanation is not yet doing any work.
            </p>
          )}
        </ConnectBlock>

        <ConnectBlock heading="Systems affected">
          {driver.systemsAffected.length > 0 ? (
            <SystemTags systems={driver.systemsAffected} />
          ) : (
            <p className="text-[12px] text-ink-faint">
              No systems recorded yet. A structural force should touch at least
              one named system.
            </p>
          )}
        </ConnectBlock>

        <ConnectBlock heading="Next step">
          <p>{driverNextStep(result)}</p>
        </ConnectBlock>

        <BiasCheckPanel />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation tab (analyst) — the live checks as requirement/current/threshold
// rows with the reason each requirement exists, then the scores read against
// the rubric; methodology adds the threshold table.
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
  recomputed,
}: {
  driver: Driver;
  driverSignals: Signal[];
  result: ValidationResult;
  recomputed: boolean;
}) {
  const missing = driverMissingPhrases(driver, driverSignals, result);
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <SectionHeading>
          Checks before treating this as a real driver
        </SectionHeading>
        <p className="mt-1.5 text-[13.5px]">
          {result.valid ? (
            <span className="font-medium text-accent-ink">Validated driver</span>
          ) : (
            <span className="font-medium text-ink">Still a hypothesis</span>
          )}
          <span className="text-ink-soft">
            {" "}
            · {result.passedCount} of {result.totalCount} checks passed
          </span>
          {recomputed ? (
            <>
              {" "}
              <RecomputedNote />
            </>
          ) : null}
        </p>
        <div className="mt-4 border-t border-line pt-3">
          <ValidationCheckRows
            checks={driverCheckRows(driver, driverSignals, result)}
          />
        </div>
        {!result.valid && missing.length > 0 ? (
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">What is missing — </span>
            {missing.join("; ")}.
          </p>
        ) : null}
      </section>
      <section>
        <SectionHeading>Scores, read against the rubric</SectionHeading>
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
          Scores are analyst judgements against the 1–5 rubric; the checks
          above record what the evidence itself supports.
        </p>
      </section>
      <ViewGate min="methodology">
        <ThresholdsSection driver={driver} driverSignals={driverSignals} />
      </ViewGate>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Systems tab — effect chain as an indented ladder, each level labelled with
// what it means in plain words. Each further order carries less certainty.
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
  const firstOrder = firstOrderEffectSentence(driver);
  const systemsLine = systemsTouchedLine(driver);
  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-[11.5px] leading-relaxed text-ink-faint">
        These effect chains are inferred by the analyst from the driver&apos;s
        logic — they are interpretation, not sourced facts. Each further order
        of effect carries less certainty than the one before it.
        <ViewGate min="methodology">
          <span className="ml-2">
            <ProvenanceBadge label="human_interpretation" />
          </span>
        </ViewGate>
      </p>

      <LadderStep
        indent={0}
        label="First-order effect — what the driver directly changes"
      >
        {firstOrder || systemsLine ? (
          <>
            {firstOrder ? (
              <p className="text-[13px] leading-relaxed text-ink">{firstOrder}</p>
            ) : null}
            {systemsLine ? (
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                {systemsLine}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-[12px] text-ink-faint">
            Nothing is recorded yet about what this driver directly changes —
            the chain has nothing to hang from.
          </p>
        )}
      </LadderStep>

      <LadderStep
        indent={1}
        label="Second-order effects — what changes because of that"
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
        label="Third-order effects — what may happen later"
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
// Evidence tab — grouped: patterns with their plain meaning, signals behind a
// show-all control, an honest paragraph on sources, and the indicators.
// ---------------------------------------------------------------------------

function EvidenceTab({
  driver,
  driverSignals,
  driverPatterns,
  driverSources,
  driverIndicators,
}: {
  driver: Driver;
  driverSignals: Signal[];
  driverPatterns: Pattern[];
  driverSources: Source[];
  driverIndicators: MonitoringIndicator[];
}) {
  const minSources = DRIVER_THRESHOLDS.minIndependentSources;
  const recorded = driver.independentSourceCount;
  const reachable = driverSources.length;

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <SectionHeading>
          Patterns explained
          <span className="font-normal text-ink-faint">{driverPatterns.length}</span>
        </SectionHeading>
        <div className="mt-2">
          {driverPatterns.length > 0 ? (
            <ul className="space-y-3">
              {driverPatterns.map((p) => (
                <li key={p.id}>
                  <EntityLink kind="pattern" id={p.id} title={p.name} />
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                    {patternPlainMeaning(p)}
                  </p>
                </li>
              ))}
            </ul>
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
            <div className="space-y-1.5">
              <ShowAllList
                previewCount={EVIDENCE_SIGNAL_PREVIEW}
                noun="signals"
                items={driverSignals.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 py-0.5"
                  >
                    <EntityLink kind="signal" id={s.id} title={s.title} />
                    <span className="flex shrink-0 items-center gap-2">
                      <SignalStrengthBadge strength={s.signalStrength} />
                      <span className="text-[11px] text-ink-faint">{s.country}</span>
                    </span>
                  </div>
                ))}
              />
            </div>
          ) : (
            <p className="text-[11.5px] text-ink-faint">
              No signals connected yet. The explanatory claim must trace down to
              present-day evidence — link the signals the driver accounts for.
            </p>
          )}
        </div>
      </section>

      <ConnectBlock heading="Independent sources">
        <p>
          The record states{" "}
          <span className="font-mono text-ink">{recorded}</span> independent
          source{recorded === 1 ? "" : "s"}.{" "}
          <span
            className={`text-[11.5px] ${
              recorded >= minSources ? "text-accent-ink" : "text-caution"
            }`}
          >
            Validation needs at least {minSources}.
          </span>
        </p>
        {reachable > 0 ? (
          reachable === recorded ? (
            <p className="mt-1.5">
              The signals linked here reach the same {reachable} distinct source
              record{reachable === 1 ? "" : "s"}, so the recorded count matches
              the evidence that can be checked.
            </p>
          ) : (
            <p className="mt-1.5">
              The signals linked here currently reach {reachable} distinct
              source record{reachable === 1 ? "" : "s"} — the recorded count and
              the reachable records disagree, so check which is out of date
              before relying on the number.
            </p>
          )
        ) : (
          <p className="mt-1.5">
            No source records are reachable through the linked signals yet, so
            the recorded count cannot be checked against actual records.
          </p>
        )}
      </ConnectBlock>

      <section>
        <SectionHeading>
          Leading indicators
          <span className="font-normal text-ink-faint">{driverIndicators.length}</span>
        </SectionHeading>
        <div className="mt-2">
          {driverIndicators.length > 0 ? (
            <ul className="space-y-2">
              {driverIndicators.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
                >
                  <Link
                    href="/monitoring"
                    className="text-[12.5px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                  >
                    {i.name}
                  </Link>
                  <TrendBadge trend={i.trend} />
                </li>
              ))}
            </ul>
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
        <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
          Use this to record analyst judgement. These notes do not overwrite
          the evidence.
        </p>
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
              hint="How much trust to place in this explanation when territories and scenarios build on it."
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
  const sources = useIntelligenceStore((s) => s.sources);
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

  const simple = mode === "simple";
  const result = validateDriver(driver, signals);
  const recomputed = statusDisagrees(driver, result);
  const driverSignals = signalsOfDriver(driver, signals);
  const driverSources = sourcesOfDriver(driverSignals, sources);
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
  const mainContradiction = mainContradictionOfDriver(driver, contradictions);
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

  // Simple-view relationship trail — unchanged.
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

  // Advanced-view evidence trail — top links per group by default, the full
  // trail on request. Steps come only from records this driver links to.
  const topTrailSignals = [...driverSignals].sort(
    (a, b) =>
      b.scores.strategicRelevance - a.scores.strategicRelevance ||
      b.scores.evidence - a.scores.evidence,
  );
  const topTrailSources = [...driverSources].sort(
    (a, b) => b.credibility - a.credibility,
  );
  const trailGroups: TrailGroup[] = [
    {
      label: `Patterns (${linkedPatterns.length})`,
      previewCount: SIDEBAR_PREVIEW,
      steps: linkedPatterns.map((p) => ({
        stage: "pattern" as const,
        title: p.name,
        href: `/patterns/${p.id}`,
      })),
    },
    {
      label: `Signals (${driverSignals.length})`,
      previewCount: SIDEBAR_PREVIEW,
      steps: topTrailSignals.map((s) => ({
        stage: signalStage(s),
        title: s.title,
        href: `/signals/${s.id}`,
      })),
    },
    {
      label: `Sources (${driverSources.length})`,
      previewCount: SIDEBAR_PREVIEW,
      steps: topTrailSources.map((src) => ({
        stage: "source" as const,
        title: src.name,
        href: `/sources/${src.id}`,
      })),
    },
    {
      label: `Contradictions (${linkedContradictions.length})`,
      steps: linkedContradictions.map((c) => ({
        stage: "contradiction" as const,
        title: c.name,
        href: `/contradictions/${c.id}`,
      })),
    },
    {
      label: `Future territories (${linkedTerritories.length})`,
      steps: linkedTerritories.map((t) => ({
        stage: "territory" as const,
        title: t.name,
        href: `/territories/${t.id}`,
      })),
    },
    {
      label: `Monitoring indicators (${linkedIndicators.length})`,
      previewCount: SIDEBAR_PREVIEW,
      steps: linkedIndicators.map((i) => ({
        stage: "indicator" as const,
        title: i.name,
        href: "/monitoring",
      })),
    },
  ];
  const trailHasSteps = trailGroups.some((g) => g.steps.length > 0);

  const stripItems = driverStatusStripItems(driver, result);
  if (recomputed) stripItems.push({ text: "status recomputed from evidence" });

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={driver.name}
        actions={<PipelineStageBadge stage="driver" />}
      />
      {simple ? null : (
        <div className="-mt-5 mb-8">
          <StatusStrip items={stripItems} />
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
        <div>
          {simple ? (
            <OverviewContent
              driver={driver}
              result={result}
              linkedContradictions={linkedContradictions}
            />
          ) : (
            <Tabs
              tabs={[
                {
                  id: "overview",
                  label: "Overview",
                  content: (
                    <AdvancedOverviewTab
                      driver={driver}
                      result={result}
                      driverSignals={driverSignals}
                      mainContradiction={mainContradiction}
                      otherContradictionCount={Math.max(
                        0,
                        linkedContradictions.length - 1,
                      )}
                      linkedIndicators={linkedIndicators}
                    />
                  ),
                },
                {
                  id: "validation",
                  label: "Validation",
                  content: (
                    <ValidationTab
                      driver={driver}
                      driverSignals={driverSignals}
                      result={result}
                      recomputed={recomputed}
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
                      driverPatterns={linkedPatterns}
                      driverSources={driverSources}
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
                          <TensionBlock
                            key={c.id}
                            name={c.name}
                            href={`/contradictions/${c.id}`}
                            typeLabel={`Contradiction · ${CONTRADICTION_TYPE_LABELS[c.contradictionType]}`}
                            sideA={{ claim: c.sideA, support: c.evidenceSideA }}
                            sideB={{ claim: c.sideB, support: c.evidenceSideB }}
                            rows={[
                              {
                                label: "Why the tension matters",
                                text: firstSentence(
                                  c.underlyingTension.trim() ||
                                    c.strategicImplication,
                                ),
                              },
                              {
                                label: "What would strengthen each side",
                                text: strengthenSidesSentence(c),
                              },
                            ]}
                          />
                        ))}
                      </div>
                    ) : (
                      <IncompleteNote
                        missing="No contradiction linked yet."
                        whyItMatters="A force nobody has argued against has not been tested."
                        nextStep="Look for evidence that cuts against this driver before treating it as validated."
                      />
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
          {simple ? (
            <RelatedObjectsPanel groups={relatedGroups} />
          ) : trailHasSteps ? (
            <section>
              <h2 className="mb-3 text-[13px] font-medium text-ink">
                Evidence trail
              </h2>
              <RelationshipTrail
                groups={trailGroups}
                expandLabel="Show the full evidence trail"
              />
            </section>
          ) : (
            <IncompleteNote
              missing="No linked records yet."
              whyItMatters="A driver only exists through the patterns and signals it explains."
              nextStep="Link the patterns this force explains, then the signals beneath them."
            />
          )}
        </aside>
      </div>
    </>
  );
}
