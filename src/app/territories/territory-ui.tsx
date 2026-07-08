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

import type { CheckRowData } from "@/components/connect";
import { explainTerritoryStatus } from "@/lib/explain";
import { firstSentence } from "@/lib/simple";
import type { ValidationResult } from "@/lib/validation";
import type {
  Contradiction,
  FutureTerritory,
  Scenario,
  ScenarioHorizon,
  Score,
  TerritoryMonitoringStatus,
} from "@/lib/types";

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

// ---------------------------------------------------------------------------
// Advanced-view helpers — movement tones, sentence work, checks, scenarios
// ---------------------------------------------------------------------------

type StatusTone = "accent" | "caution" | "tension" | "neutral";

/**
 * Tone for the one-word movement reading. Accent is earned by strengthening
 * evidence only; everything uncertain stays caution or neutral.
 */
export const STATUS_TONES: Record<TerritoryMonitoringStatus, StatusTone> = {
  strengthening: "accent",
  weakening: "caution",
  mutating: "neutral",
  contradicted: "tension",
  needs_more_evidence: "caution",
  dormant: "neutral",
};

const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  accent: "text-accent-ink",
  caution: "text-caution",
  tension: "text-tension",
  neutral: "text-ink-soft",
};

/** Text class for the movement word on list rows. */
export function statusToneClass(status: TerritoryMonitoringStatus): string {
  return STATUS_TONE_CLASSES[STATUS_TONES[status]];
}

/** Split prose into trimmed sentences, for rendering long fields as bullets. */
export function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  const parts = matches ?? (text.trim() ? [text] : []);
  return parts.map((s) => s.trim()).filter(Boolean);
}

/** Remove quiet record-id parentheticals like "(DRV-001, PAT-002)" from prose. */
export function stripIdParens(text: string): string {
  return text
    .replace(/\s*\([A-Z]{3}-\d+(?:,\s*[A-Z]{3}-\d+)*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** The list row's grounding line, with live counts written out. */
export function backedByLine(t: FutureTerritory): string {
  return `Backed by ${countInWords(t.driverIds.length, "driver")}, ${countInWords(
    t.patternIds.length,
    "pattern",
  )}, and ${countInWords(t.representativeSignalIds.length, "representative signal")}.`;
}

/**
 * The territory linkage checks as requirement / current / threshold rows.
 * Pass/fail comes from validateTerritory so the two views can never disagree;
 * the check order here mirrors src/lib/validation.ts.
 */
export function territoryCheckRows(
  t: FutureTerritory,
  result: ValidationResult,
): CheckRowData[] {
  const passed = (i: number, fallback: boolean) => result.checks[i]?.passed ?? fallback;
  return [
    {
      requirement: "Rests on at least two converging drivers",
      current: countInWords(t.driverIds.length, "driver"),
      threshold: "2 or more",
      passed: passed(0, t.driverIds.length >= 2),
      explanation:
        "A territory is where separate forces meet. One driver alone is a driver story, not a direction of change.",
    },
    {
      requirement: "Connected to at least one pattern",
      current: countInWords(t.patternIds.length, "pattern"),
      threshold: "1 or more",
      passed: passed(1, t.patternIds.length >= 1),
      explanation:
        "Patterns are the repeated movements the drivers explain. Without one, the territory floats above the evidence.",
    },
    {
      requirement: "Acknowledges at least one contradiction",
      current: countInWords(t.contradictionIds.length, "contradiction"),
      threshold: "1 or more",
      passed: passed(2, t.contradictionIds.length >= 1),
      explanation:
        "The territory must name what could prove it wrong. A direction with no acknowledged tension reads as a prediction.",
    },
    {
      requirement: "Shows at least three representative signals",
      current: countInWords(t.representativeSignalIds.length, "representative signal"),
      threshold: "3 or more",
      passed: passed(3, t.representativeSignalIds.length >= 3),
      explanation:
        "Present-day evidence must show the direction already forming. A future with no present is a wish.",
    },
    {
      requirement: "Tracked by at least one leading indicator",
      current: countInWords(t.leadingIndicatorIds.length, "leading indicator"),
      threshold: "1 or more",
      passed: passed(4, t.leadingIndicatorIds.length >= 1),
      explanation:
        "Indicators are how the territory gets proved right or wrong over time. Without them it can only be asserted.",
    },
  ];
}

/** Plain readings for the 1–5 evidence score, honest about what it is not. */
const EVIDENCE_SCORE_READINGS: Record<Score, string> = {
  1: "Closer to assertion than evidence — treat this as a sketch to test, not a finding.",
  2: "Early and thin — the direction is visible, but little independent evidence supports it yet.",
  3: "Credible with clear gaps — plausible, not proven.",
  4: "Broad and independent, though the future itself remains unproven.",
  5: "Broad, independent and consistent — still a direction, not a certainty.",
};

/** The evidence-strength score paired with a plain reading and live counts. */
export function evidenceStrengthReading(t: FutureTerritory): string {
  return `${EVIDENCE_SCORE_READINGS[t.evidenceStrength]} It rests on ${countInWords(
    t.driverIds.length,
    "driver",
  )}, ${countInWords(t.patternIds.length, "pattern")} and ${countInWords(
    t.representativeSignalIds.length,
    "representative signal",
  )}.`;
}

/** Scenario horizons in plain words: "Conservative scenario, 3 to 5 years". */
export const HORIZON_PLAIN: Record<ScenarioHorizon, string> = {
  near: "1 to 2 years",
  mid: "3 to 5 years",
  long: "5 to 10 years",
};

/** Quality-check tally for a scenario card, counted from the real booleans. */
export function scenarioQualityLine(s: Scenario): string {
  const values = Object.values(s.qualityChecks);
  return `${values.filter(Boolean).length} of ${values.length} quality checks passed`;
}

/**
 * An honest "this could change if…" line built from the contradiction's own
 * escalation field — never invented. Returns null when the field is empty.
 */
export function couldChangeIfLine(c: Contradiction): string | null {
  const s = firstSentence(c.possibleEscalation.trim()).trim();
  if (!s) return null;
  return `This could change if, for example, ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
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
