"use client";

/**
 * Shared helpers for the Scenarios route family (/scenarios, /scenarios/[id]).
 * Page-local by design — nothing here is imported outside src/app/scenarios/.
 *
 * The central discipline of this layer: a scenario is a plausible future
 * world built from the evolution of a future territory under different
 * conditions — a strategic thought experiment, not a prediction. Its nine
 * quality tests are analyst judgements recorded on the record; they are
 * surfaced honestly, alongside the assumption load, never hidden.
 */

import Link from "next/link";
import { ViewGate } from "@/components/ViewMode";
import { explainScenarioEvidence } from "@/lib/explain";
import { scenarioAssumptionHeavy, type ValidationResult } from "@/lib/validation";
import type { Scenario, ScenarioQualityChecks } from "@/lib/types";
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
// Quality tests — the nine analyst-recorded booleans, rendered as a checklist
// ---------------------------------------------------------------------------

export const QUALITY_KEYS = Object.keys(
  SCENARIO_QUALITY_LABELS,
) as Array<keyof ScenarioQualityChecks>;

export const QUALITY_TEST_TOTAL = QUALITY_KEYS.length;

/** Below this many passing tests, the list row flags the scenario for quality review. */
export const QUALITY_REVIEW_THRESHOLD = 7;

export function qualityPassCount(checks: ScenarioQualityChecks): number {
  return QUALITY_KEYS.filter((k) => checks[k]).length;
}

/**
 * What each of the nine quality tests actually asks — the rubric behind the
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

/**
 * Map the nine quality booleans into a ValidationResult-shaped object so
 * ValidationChecklist can render them with the standard pass/fail styling.
 * These are analyst judgements, not computed thresholds.
 */
export function qualityChecklistResult(checks: ScenarioQualityChecks): ValidationResult {
  const list = QUALITY_KEYS.map((k) => ({
    label: SCENARIO_QUALITY_LABELS[k],
    passed: checks[k],
    detail: QUALITY_DETAILS[k],
  }));
  const passedCount = list.filter((c) => c.passed).length;
  return {
    valid: passedCount === list.length,
    checks: list,
    passedCount,
    totalCount: list.length,
  };
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
// List row — the calm .list-row idiom
// ---------------------------------------------------------------------------

/**
 * One scenario as a quiet list row: title as the primary line, then type,
 * horizon and the first evidence sentence as faint metadata. The right side
 * carries nothing unless the scenario is assumption-heavy — that caution is
 * the only thing worth interrupting a scan for. Analyst view folds the
 * quality-test count into the metadata line as words.
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
