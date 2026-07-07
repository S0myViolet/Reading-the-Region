"use client";

/**
 * Shared helpers for the Patterns route family (/patterns, /patterns/[id]).
 * Page-local by design — nothing here is imported outside src/app/patterns/.
 *
 * The central discipline of this layer: a pattern's validation status is
 * always computed live via validatePattern(pattern, signals). The stored
 * validationStatus field is never trusted on its own — when it disagrees
 * with the computed result, the computed result wins and the disagreement
 * is stated.
 */

import { Pill } from "@/components/badges";
import type {
  ActorType,
  Pattern,
  Sector,
  Signal,
  SystemAffected,
} from "@/lib/types";
import type { ValidationResult } from "@/lib/validation";

export const btnPrimary =
  "bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white rounded-[4px] hover:bg-accent-ink";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SMALL_NUMBER_WORDS = [
  "zero",
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
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

/** Small counts written out in words for the simple reading view. */
export function countInWords(n: number): string {
  return n >= 0 && n < SMALL_NUMBER_WORDS.length ? SMALL_NUMBER_WORDS[n] : String(n);
}

/**
 * Short one-sentence status for list rows, derived from the live
 * ValidationResult — never from the stored validationStatus alone.
 */
export function shortPatternStatus(result: ValidationResult): string {
  return result.valid
    ? `Validated — passes all ${countInWords(result.totalCount)} tests.`
    : `Hypothesis — passes ${countInWords(result.passedCount)} of ${countInWords(result.totalCount)} tests.`;
}

/** Signals actually resolvable from the pattern's key signal ids. */
export function signalsOfPattern(pattern: Pattern, signals: Signal[]): Signal[] {
  return signals.filter((s) => pattern.keySignalIds.includes(s.id));
}

/** Sectors, geographies, actor types, and systems derived from key signals. */
export interface DerivedPatternFacts {
  sectors: Sector[];
  countries: string[];
  actorTypes: ActorType[];
  systems: SystemAffected[];
}

export function derivePatternFacts(patternSignals: Signal[]): DerivedPatternFacts {
  return {
    sectors: [...new Set(patternSignals.flatMap((s) => s.sectors))],
    countries: [...new Set(patternSignals.map((s) => s.country).filter(Boolean))],
    actorTypes: [...new Set(patternSignals.flatMap((s) => s.actorTypes))],
    systems: [...new Set(patternSignals.flatMap((s) => s.systemsAffected))],
  };
}

export function findCheck(result: ValidationResult, label: string) {
  return result.checks.find((c) => c.label === label);
}

/**
 * Validation status readout computed from the live ValidationResult — never
 * from the stored validationStatus alone. Accent is reserved for earned
 * validation; a hypothesis is the default state and stays quiet plain text.
 */
export function PatternValidationPill({ result }: { result: ValidationResult }) {
  return (
    <Pill
      tone={result.valid ? "accent" : "neutral"}
      title={`${result.passedCount} of ${result.totalCount} pattern tests passed`}
    >
      {result.valid
        ? "Validated"
        : `Hypothesis — ${result.passedCount}/${result.totalCount} tests passed`}
    </Pill>
  );
}

/**
 * True when the stored validationStatus disagrees with the computed result
 * (stored claims validated but the tests fail, or the reverse). The UI must
 * then show the computed status with a recomputation note.
 */
export function statusDisagrees(pattern: Pattern, result: ValidationResult): boolean {
  return (pattern.validationStatus === "validated") !== result.valid;
}

export function RecomputedNote() {
  return (
    <span className="text-[10.5px] text-ink-faint">status recomputed from evidence</span>
  );
}

/**
 * Task-based next step from the live validation result: name the first
 * failing test while the pattern is a hypothesis; once validated, move up
 * the pyramid.
 */
export function nextStepForPattern(result: ValidationResult): string {
  if (result.valid) return "Connect this pattern to possible drivers.";
  const failing = result.checks.find((c) => !c.passed);
  if (failing) {
    return `Not yet validated — the ${failing.label.toLowerCase()} is failing. ${failing.detail}`;
  }
  return "Review the pattern statement and evidence window before validation.";
}
