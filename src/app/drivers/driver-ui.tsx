"use client";

/**
 * Shared helpers for the Drivers route family (/drivers, /drivers/[id]).
 * Page-local by design — nothing here is imported outside src/app/drivers/.
 *
 * The central discipline of this layer: a driver's status is always computed
 * live via validateDriver(driver, signals) against the seven validation
 * criteria. The stored status field is never trusted on its own — when it
 * disagrees with the computed result, the computed result wins and the
 * disagreement is stated. A weak driver is never presented as validated.
 */

import { Pill } from "@/components/badges";
import type { Driver, DriverScores, Score, Signal } from "@/lib/types";
import type { ValidationResult } from "@/lib/validation";

/** Calm primary button — the one filled action on a page. */
export const btnPrimary =
  "rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink";
/** Secondary actions are quiet text links, not bordered buttons. */
export const textLink =
  "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink hover:underline";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Signals actually resolvable from the driver's linked signal ids. */
export function signalsOfDriver(driver: Driver, signals: Signal[]): Signal[] {
  return signals.filter((s) => driver.signalIds.includes(s.id));
}

/**
 * Status pill computed from the live ValidationResult — never from the
 * stored status alone. Accent is reserved for the earned state: the pill
 * renders only when all seven criteria pass. A hypothesis carries no badge;
 * its standing is stated in the status sentence instead.
 */
export function ValidatedPill({ result }: { result: ValidationResult }) {
  if (!result.valid) return null;
  return (
    <Pill
      tone="accent"
      title={`${result.passedCount} of ${result.totalCount} driver validation criteria met`}
    >
      Validated driver
    </Pill>
  );
}

/**
 * Computed standing for the detail header: the accent pill when validated,
 * otherwise plain faint text — a hypothesis is a default state, not a
 * warning, so it carries no colour.
 */
export function DriverStanding({ result }: { result: ValidationResult }) {
  if (result.valid) return <ValidatedPill result={result} />;
  return (
    <span
      className="text-[11.5px] text-ink-faint"
      title="A driver is only validated when all seven criteria pass against live evidence"
    >
      Hypothesis — {result.passedCount}/{result.totalCount} criteria met
    </span>
  );
}

/**
 * True when the stored status disagrees with the computed result (stored
 * claims validated but the criteria fail, or the reverse). The UI must then
 * show the computed status with a recomputation note.
 */
export function statusDisagrees(driver: Driver, result: ValidationResult): boolean {
  return (driver.status === "validated") !== result.valid;
}

export function RecomputedNote() {
  return (
    <span className="text-[10.5px] text-ink-faint">status recomputed from evidence</span>
  );
}

// ---------------------------------------------------------------------------
// Counts in words (simple view never leads with bare numbers)
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

export function countInWords(n: number, singular: string, plural?: string): string {
  const word = n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
  return `${word} ${n === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Pattern/signal counts for the list row, in words. */
export function driverLinkCountsInWords(driver: Driver): string {
  return `Explains ${countInWords(driver.patternIds.length, "pattern")} · rests on ${countInWords(driver.signalIds.length, "signal")}.`;
}

/**
 * Evidence note for explainConfidenceGeneric — cites the driver's actual
 * counts: patterns connected, signals, independent sources.
 */
export function driverEvidenceNote(driver: Driver): string {
  return `this explanation currently rests on ${countInWords(driver.patternIds.length, "connected pattern")}, ${countInWords(driver.signalIds.length, "linked signal")} and ${countInWords(driver.independentSourceCount, "independent source")}.`;
}

// ---------------------------------------------------------------------------
// Next step — derived from the live validation result
// ---------------------------------------------------------------------------

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * One next-step sentence: the first failing validation check, or the
 * monitoring instruction once every criterion passes.
 */
export function driverNextStep(result: ValidationResult): string {
  if (result.valid) {
    return "Watch this driver's leading indicators — movement there is what confirms or weakens a validated explanation.";
  }
  const failing = result.checks.find((c) => !c.passed);
  if (!failing) {
    return "Review this driver's evidence links at the next weekly scan.";
  }
  return `Work on the first unmet criterion — ${lowerFirst(failing.label)}. Currently: ${lowerFirst(failing.detail)}`;
}

// ---------------------------------------------------------------------------
// Score readings — a score is never shown as a bare number. The wording is
// derived from the score value alone: 1–2 low, 3 moderate, 4–5 strong.
// ---------------------------------------------------------------------------

export type ScoreBand = "low" | "moderate" | "strong";

export function scoreBand(score: Score): ScoreBand {
  return score <= 2 ? "low" : score === 3 ? "moderate" : "strong";
}

const DRIVER_SCORE_READINGS: Record<keyof DriverScores, Record<ScoreBand, string>> = {
  explanatoryPower: {
    low: "judged to explain little more than the patterns already say",
    moderate: "judged to explain part of what its patterns show",
    strong: "judged to account for its patterns with a clear mechanism",
  },
  crossSectorStrength: {
    low: "its effects are judged visible in one sector at most",
    moderate: "its effects are judged visible in a few adjacent sectors",
    strong: "its effects are judged visible across many sectors",
  },
  evidenceStrength: {
    low: "the evidence beneath it is judged thin or anecdotal",
    moderate: "the evidence beneath it is judged credible but limited",
    strong: "the evidence beneath it is judged broad and credible",
  },
  persistence: {
    low: "judged possibly a short-lived episode rather than a lasting force",
    moderate: "judged to have held for a meaningful period",
    strong: "judged persistent, with no sign of fading",
  },
  reversibility: {
    low: "the ease of this force being undone is judged low",
    moderate: "the ease of this force being undone is judged moderate",
    strong: "the ease of this force being undone is judged high",
  },
  behaviouralImpact: {
    low: "judged to change little day-to-day behaviour so far",
    moderate: "judged to be changing some behaviour in visible ways",
    strong: "judged to be restructuring behaviour at scale",
  },
  structuralImpact: {
    low: "judged to leave systems and institutions largely untouched",
    moderate: "judged to be bending some systems and institutions",
    strong: "judged to be reshaping systems and institutions",
  },
  contradictionRichness: {
    low: "few tensions push back against it — possibly under-scanned",
    moderate: "some real tensions push back against it",
    strong: "it sits amid strong, well-evidenced tensions",
  },
  scenarioUsefulness: {
    low: "judged to give scenario work little to build on",
    moderate: "judged to give scenario work something to build on",
    strong: "judged a load-bearing input for scenario work",
  },
  strategicRelevance: {
    low: "judged to carry little strategic weight for now",
    moderate: "judged to carry strategic weight within some categories",
    strong: "judged to carry strategic weight across sectors",
  },
};

/** One-sentence reading of a driver score, derived from its value. */
export function driverScoreReading(dim: keyof DriverScores, score: Score): string {
  return `${DRIVER_SCORE_READINGS[dim][scoreBand(score)]}.`;
}

// ---------------------------------------------------------------------------
// Sorting and filtering
// ---------------------------------------------------------------------------

export type DriverSort = "updated" | "explanatory" | "evidence" | "patterns";

export const DRIVER_SORT_OPTIONS: Array<{ value: DriverSort; label: string }> = [
  { value: "updated", label: "Recently updated" },
  { value: "explanatory", label: "By explanatory power" },
  { value: "evidence", label: "By evidence strength" },
  { value: "patterns", label: "By patterns explained" },
];

export function sortDrivers(list: Driver[], sort: DriverSort): Driver[] {
  const byUpdated = (a: Driver, b: Driver) => b.updatedAt.localeCompare(a.updatedAt);
  const copy = [...list];
  switch (sort) {
    case "updated":
      return copy.sort(byUpdated);
    case "explanatory":
      return copy.sort(
        (a, b) =>
          b.scores.explanatoryPower - a.scores.explanatoryPower || byUpdated(a, b),
      );
    case "evidence":
      return copy.sort(
        (a, b) =>
          b.scores.evidenceStrength - a.scores.evidenceStrength || byUpdated(a, b),
      );
    case "patterns":
      return copy.sort(
        (a, b) => b.patternIds.length - a.patternIds.length || byUpdated(a, b),
      );
  }
}

export type DriverStatusFilter = "all" | "validated" | "hypothesis";

export const DRIVER_STATUS_FILTER_OPTIONS: Array<{
  value: DriverStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All drivers" },
  { value: "validated", label: "Validated (computed)" },
  { value: "hypothesis", label: "Hypotheses (computed)" },
];
