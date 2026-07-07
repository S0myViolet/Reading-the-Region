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
  "border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink";
export const btnSecondary =
  "border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

/**
 * The four pattern tests in display order, mapped from the check labels
 * produced by validatePattern.
 */
const TEST_CHIP_ORDER: Array<{ checkLabel: string; short: string }> = [
  { checkLabel: "Breadth test", short: "Breadth" },
  { checkLabel: "Depth test", short: "Depth" },
  { checkLabel: "Persistence test", short: "Persistence" },
  { checkLabel: "Coherence test", short: "Coherence" },
];

export function findCheck(result: ValidationResult, label: string) {
  return result.checks.find((c) => c.label === label);
}

/** Compact pass/fail chips for the four pattern tests. */
export function PatternTestChips({ result }: { result: ValidationResult }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {TEST_CHIP_ORDER.map(({ checkLabel, short }) => {
        const check = findCheck(result, checkLabel);
        const passed = check?.passed ?? false;
        return (
          <span
            key={short}
            title={check ? `${check.label}: ${check.detail}` : short}
            className={`inline-flex items-center gap-1 border px-1.5 py-px text-[10.5px] font-medium rounded-[2px] ${
              passed
                ? "border-accent/30 bg-accent-soft text-accent-ink"
                : "border-caution/30 bg-caution-soft text-caution"
            }`}
          >
            <span aria-hidden className="font-bold">
              {passed ? "✓" : "✕"}
            </span>
            {short}
            <span className="sr-only">{passed ? " — passed" : " — failed"}</span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Validation status pill computed from the live ValidationResult — never
 * from the stored validationStatus alone. "Validated" appears only when all
 * four tests pass.
 */
export function PatternValidationPill({ result }: { result: ValidationResult }) {
  return (
    <Pill
      tone={result.valid ? "accent" : "caution"}
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
