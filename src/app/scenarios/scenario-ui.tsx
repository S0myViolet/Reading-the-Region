"use client";

/**
 * Shared helpers for the Scenarios route family (/scenarios, /scenarios/[id]).
 * Page-local by design — nothing here is imported outside src/app/scenarios/.
 *
 * The central discipline of this layer: a scenario is a plausible future
 * world built from the evolution of a future territory under different
 * conditions — a strategic thought experiment, not a prediction. Its nine
 * quality checks are analyst judgements recorded on the record; they are
 * surfaced honestly, alongside the assumption load, never hidden.
 */

import Link from "next/link";
import { IdChip } from "@/components/badges";
import { ViewGate } from "@/components/ViewMode";
import { explainScenarioEvidence } from "@/lib/explain";
import { firstSentence } from "@/lib/simple";
import { scenarioAssumptionHeavy } from "@/lib/validation";
import type { Scenario, ScenarioHorizon, ScenarioQualityChecks } from "@/lib/types";
import {
  SCENARIO_HORIZON_LABELS,
  SCENARIO_QUALITY_LABELS,
  SCENARIO_TYPE_LABELS,
} from "@/lib/types";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Plain-word vocabularies
// ---------------------------------------------------------------------------

/** The horizon in plain words for running copy: "3 to 5 years". */
export const SCENARIO_HORIZON_PLAIN: Record<ScenarioHorizon, string> = {
  near: "1 to 2 years",
  mid: "3 to 5 years",
  long: "5 to 10 years",
};

// ---------------------------------------------------------------------------
// Quality checks — the nine analyst-recorded booleans
// ---------------------------------------------------------------------------

export const QUALITY_KEYS = Object.keys(
  SCENARIO_QUALITY_LABELS,
) as Array<keyof ScenarioQualityChecks>;

export const QUALITY_TEST_TOTAL = QUALITY_KEYS.length;

/** Below this many passing checks, the list row flags the scenario for quality review. */
export const QUALITY_REVIEW_THRESHOLD = 7;

export function qualityPassCount(checks: ScenarioQualityChecks): number {
  return QUALITY_KEYS.filter((k) => checks[k]).length;
}

/** One plain-English line on what each quality check means for a reader. */
export const SCENARIO_QUALITY_MEANINGS: Record<keyof ScenarioQualityChecks, string> = {
  plausible: "Could realistically develop from today's evidence.",
  internallyCoherent: "The pieces of this world fit together without contradiction.",
  evidenceLinked: "Backed by linked signals, patterns and drivers, not imagination.",
  strategicallyRelevant: "Would change real decisions if it developed.",
  differentiated: "Meaningfully different from the other scenarios in its territory.",
  notOptimisticFantasy: "Not just the future everyone hopes for.",
  notPureDystopia: "Not just the future everyone fears.",
  connectedToTodaysSignals: "Starts from things already observable, not a blank slate.",
  usefulForDecisions: "An analyst could act on it, monitor it, and revisit it.",
};

/**
 * What each of the nine quality checks actually asks — the rubric behind the
 * pass/fail booleans, spelled out in Methodology view.
 */
export const QUALITY_DETAILS: Record<keyof ScenarioQualityChecks, string> = {
  plausible:
    "Could realistically develop from today's evidence — a possibility, not a fantasy.",
  internallyCoherent:
    "People, institutions, technologies, and policies fit together as one consistent world.",
  evidenceLinked:
    "Anchored to supporting signals, patterns, and drivers rather than pure imagination.",
  strategicallyRelevant:
    "Illuminates decisions that organizations in the region actually face.",
  differentiated:
    "Meaningfully distinct from the other scenarios built on this territory.",
  notOptimisticFantasy:
    "Optimism is earned by evidence, not asserted — frictions and losers are present.",
  notPureDystopia:
    "Difficulty is examined without collapsing into a single worst case.",
  connectedToTodaysSignals:
    "Traces back to present-day evidence in the signal base, with early signs to watch.",
  usefulForDecisions:
    "Produces concrete strategic questions and implications, not only atmosphere.",
};

// ---------------------------------------------------------------------------
// Readable text — sentence splitting for short paragraphs
// ---------------------------------------------------------------------------

/** Split running prose into sentences (best effort, punctuation-based). */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Break a dense paragraph into short readable chunks of at most
 * `perParagraph` sentences each. Empty input gives an empty array.
 */
export function shortParagraphs(text: string, perParagraph = 2): string[] {
  const sentences = splitSentences(text);
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += perParagraph) {
    out.push(sentences.slice(i, i + perParagraph).join(" "));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Evidence honesty, first sentence — for list rows
// ---------------------------------------------------------------------------

/** The link-count sentence of explainScenarioEvidence, for the one-line list reading. */
export function evidenceFirstSentence(scenario: Scenario): string {
  const full = explainScenarioEvidence(scenario);
  const idx = full.indexOf(". ");
  return idx === -1 ? full : full.slice(0, idx + 1);
}

// ---------------------------------------------------------------------------
// List rows — the calm .list-row idiom, one per mode
// ---------------------------------------------------------------------------

/**
 * One scenario as a quiet list row: title as the primary line, then type,
 * horizon and the first evidence sentence as faint metadata. The right side
 * carries nothing unless the scenario is assumption-heavy — that caution is
 * the only thing worth interrupting a scan for. Analyst view folds the
 * quality-check count into the metadata line as words.
 */
export function ScenarioRow({ scenario }: { scenario: Scenario }) {
  const assumptionHeavy = scenarioAssumptionHeavy(scenario);
  const qualityPassed = qualityPassCount(scenario.qualityChecks);

  return (
    <Link href={`/scenarios/${scenario.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {scenario.title.trim() ? scenario.title : "Untitled scenario"}
        </p>
        {assumptionHeavy ? (
          <span
            className="shrink-0 text-[11.5px] text-caution"
            title="Assumptions currently outnumber evidence links — treat this scenario as exploratory until stronger evidence is attached."
          >
            assumption-heavy
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
        {SCENARIO_TYPE_LABELS[scenario.scenarioType]} ·{" "}
        {SCENARIO_HORIZON_LABELS[scenario.horizon]} ·{" "}
        {evidenceFirstSentence(scenario)}
        <ViewGate min="analyst">
          {" "}
          <span
            className={
              qualityPassed < QUALITY_REVIEW_THRESHOLD ? "text-caution" : undefined
            }
          >
            {qualityPassed}/{QUALITY_TEST_TOTAL} quality tests
            {qualityPassed < QUALITY_REVIEW_THRESHOLD ? " — review quality" : ""}.
          </span>
        </ViewGate>
      </p>
    </Link>
  );
}

/** Faint inline label for the labelled lines inside a list row. */
function RowLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-faint">{children} — </span>;
}

/**
 * The advanced list row: plain English first — core idea, what makes it
 * different, quality status, key uncertainty — with the id and link counts
 * as small secondary metadata at the bottom.
 */
export function ScenarioRowAdvanced({ scenario }: { scenario: Scenario }) {
  const assumptionHeavy = scenarioAssumptionHeavy(scenario);
  const passed = qualityPassCount(scenario.qualityChecks);
  const allPass = passed === QUALITY_TEST_TOTAL;
  const keyUncertainty = scenario.strategicQuestions[0];

  return (
    <Link href={`/scenarios/${scenario.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {scenario.title.trim() ? scenario.title : "Untitled scenario"}
        </p>
        {assumptionHeavy ? (
          <span
            className="shrink-0 text-[11.5px] text-caution"
            title="Assumptions currently outnumber evidence links — treat this scenario as exploratory until stronger evidence is attached."
          >
            assumption-heavy
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-[12px] text-ink-faint">
        {SCENARIO_TYPE_LABELS[scenario.scenarioType]} scenario,{" "}
        {SCENARIO_HORIZON_PLAIN[scenario.horizon]}
      </p>
      <div className="mt-1.5 max-w-2xl space-y-1">
        {scenario.corePremise.trim() ? (
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            <RowLabel>Core idea</RowLabel>
            {firstSentence(scenario.corePremise)}
          </p>
        ) : null}
        {scenario.differentiator?.trim() ? (
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            <RowLabel>What makes it different</RowLabel>
            {scenario.differentiator}
          </p>
        ) : null}
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          <RowLabel>Quality status</RowLabel>
          <span className={allPass ? "text-accent-ink" : undefined}>
            {passed} of {QUALITY_TEST_TOTAL} checks passed
          </span>
        </p>
        {keyUncertainty ? (
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            <RowLabel>Key uncertainty</RowLabel>
            {keyUncertainty}
          </p>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] text-ink-faint">
        <IdChip id={scenario.id} /> · {evidenceFirstSentence(scenario)}
      </p>
    </Link>
  );
}
