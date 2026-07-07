"use client";

/**
 * Shared helpers for the Future Territories route family
 * (/territories, /territories/[id]). Page-local by design — nothing here is
 * imported outside src/app/territories/.
 *
 * A future territory is a strategically meaningful direction of change
 * created by the convergence of multiple drivers. It is not a trend, a theme,
 * a category, a campaign idea, or a prediction — and this layer's UI keeps
 * that discipline visible: readiness for scenarios is stated plainly, and the
 * monitoring status always carries its plain-language meaning. In the calm
 * redesign the analyst extras fold into faint text as words, not chips.
 */

import { explainTerritoryStatus } from "@/lib/explain";
import type { FutureTerritory, Score, TerritoryMonitoringStatus } from "@/lib/types";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Readiness = FutureTerritory["scenarioReadiness"];

/** Scenario readiness in plain words, for folding into faint metadata lines. */
export const READINESS_WORDS: Record<Readiness, string> = {
  not_ready: "not ready for scenarios",
  ready: "ready for scenarios",
  scenarios_active: "scenarios active",
};

export const READINESS_TITLES: Record<Readiness, string> = {
  not_ready:
    "The territory's evidence base is not yet strong enough to explore scenarios from it.",
  ready:
    "The territory is sufficiently grounded to generate scenarios — none exist yet.",
  scenarios_active: "Scenarios are being developed from this territory.",
};

// ---------------------------------------------------------------------------
// Plain-language helpers for the visibility layers
// ---------------------------------------------------------------------------

const NUMBER_WORDS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

/** Small counts written out in words: "two drivers", "one pattern", "no indicators". */
export function countInWords(n: number, singular: string, plural?: string): string {
  const word = n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
  return `${word} ${n === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/**
 * The indicator-movement sentence from explainTerritoryStatus — the short
 * plain reading that sits next to the status badge on list entries. Falls
 * back to the full explanation if the sentence split ever fails.
 */
export function territoryStatusSentence(t: FutureTerritory): string {
  const full = explainTerritoryStatus(t);
  const parts = full.split(". ");
  return parts.length > 1 ? parts.slice(1).join(". ") : full;
}

/** The 1–5 evidence-strength score paired with words, for the analyst reading. */
export const EVIDENCE_STRENGTH_WORDS: Record<Score, string> = {
  1: "Very weak — closer to assertion than evidence",
  2: "Weak — early evidence with thin coverage",
  3: "Moderate — credible evidence with clear gaps",
  4: "Strong — multiple independent lines of evidence",
  5: "Very strong — broad, independent and consistent evidence",
};

const EVIDENCE_STRENGTH_SHORT: Record<Score, string> = {
  1: "very weak",
  2: "weak",
  3: "moderate",
  4: "strong",
  5: "very strong",
};

/** Evidence strength as faint words: the score never appears without its word. */
export function evidenceStrengthWords(value: Score): string {
  return `evidence ${value}/5, ${EVIDENCE_STRENGTH_SHORT[value]}`;
}

/**
 * Task-based next step for a territory. Order matters: a territory without
 * indicators cannot be tracked, so that gap always comes first.
 */
export function territoryNextStep(t: FutureTerritory): string {
  if (t.leadingIndicatorIds.length === 0) {
    return "Add leading indicators before this territory is treated as active — without them it cannot be tracked, only asserted.";
  }
  if (t.scenarioIds.length === 0) {
    return "Generate scenarios from this territory to explore how it could evolve under different conditions.";
  }
  return "Review its indicators at the monitoring cadence.";
}

/**
 * Plain-language meaning of each monitoring status, shown wherever the status
 * badge alone would leave the reader guessing what the evidence is doing.
 */
export const MONITORING_STATUS_EXPLANATIONS: Record<
  TerritoryMonitoringStatus,
  string
> = {
  strengthening:
    "Leading indicators are moving in the territory's direction — the evidence base is getting stronger.",
  weakening:
    "Leading indicators are moving against the territory — treat its conclusions with increasing caution.",
  mutating:
    "The direction of change is real but its shape is shifting — the territory's definition may need revision.",
  contradicted:
    "Recent evidence contradicts the territory's core claim — re-examine the drivers beneath it before using it.",
  needs_more_evidence:
    "The indicator base is too thin to judge the territory's trajectory — strengthen monitoring before relying on it.",
  dormant:
    "No meaningful indicator movement recently — the territory is parked, not proven or disproven.",
};
