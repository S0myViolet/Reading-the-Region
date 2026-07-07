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
import {
  ConfidenceBadge,
  IdChip,
  Pill,
  ReviewStatusBadge,
} from "@/components/badges";
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

/** Below this many passing tests, the list card flags the scenario for quality review. */
export const QUALITY_REVIEW_THRESHOLD = 7;

export function qualityPassCount(checks: ScenarioQualityChecks): number {
  return QUALITY_KEYS.filter((k) => checks[k]).length;
}

const QUALITY_DETAILS: Record<keyof ScenarioQualityChecks, string> = {
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
// List card
// ---------------------------------------------------------------------------

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const qualityPassed = qualityPassCount(scenario.qualityChecks);
  const assumptionHeavy = scenarioAssumptionHeavy(scenario);
  const assumptionCount = scenario.assumptions.length;

  return (
    <article className="card px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-2xl">
          <p className="overline-label mb-0.5">
            Scenario · <IdChip id={scenario.id} />
          </p>
          <h3 className="font-display text-[17px] leading-snug text-ink">
            <Link
              href={`/scenarios/${scenario.id}`}
              className="hover:text-accent-ink hover:underline"
            >
              {scenario.title}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Pill tone="info">{SCENARIO_TYPE_LABELS[scenario.scenarioType]}</Pill>
            <Pill>{SCENARIO_HORIZON_LABELS[scenario.horizon]}</Pill>
          </div>
          <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
            {scenario.corePremise.trim() ? (
              scenario.corePremise
            ) : (
              <span className="text-[12px] text-ink-faint">
                No core premise recorded yet — a scenario needs one clear
                statement of the world it describes.
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ConfidenceBadge level={scenario.confidence} />
          <ReviewStatusBadge status={scenario.reviewStatus} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-2.5">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-[11.5px] text-ink-soft">
            {qualityPassed}/{QUALITY_TEST_TOTAL} quality tests
          </span>
          {qualityPassed < QUALITY_REVIEW_THRESHOLD ? (
            <Pill tone="caution">review quality</Pill>
          ) : null}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-[11.5px] text-ink-soft">
            {assumptionCount} assumption{assumptionCount === 1 ? "" : "s"}
          </span>
          {assumptionHeavy ? <Pill tone="caution">assumption-heavy</Pill> : null}
        </span>
      </div>
    </article>
  );
}
