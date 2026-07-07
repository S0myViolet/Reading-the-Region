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

/** Signals actually resolvable from the driver's linked signal ids. */
export function signalsOfDriver(driver: Driver, signals: Signal[]): Signal[] {
  return signals.filter((s) => driver.signalIds.includes(s.id));
}

/** Cast helper: DriverScores → indexable record for the generic ScoreGrid. */
export function driverScoresRecord(
  scores: DriverScores,
): Record<keyof DriverScores, Score> {
  return scores as Record<keyof DriverScores, Score>;
}

/**
 * Status pill computed from the live ValidationResult — never from the
 * stored status alone. "Validated driver" appears only when all seven
 * criteria pass; otherwise the driver is shown as a hypothesis with its
 * criteria count stated.
 */
export function DriverStatusPill({ result }: { result: ValidationResult }) {
  return (
    <Pill
      tone={result.valid ? "accent" : "caution"}
      title={`${result.passedCount} of ${result.totalCount} driver validation criteria met`}
    >
      {result.valid
        ? "Validated driver"
        : `Driver hypothesis — ${result.passedCount}/${result.totalCount} criteria`}
    </Pill>
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
