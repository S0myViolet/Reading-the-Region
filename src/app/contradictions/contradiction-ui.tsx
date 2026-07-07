"use client";

/**
 * Shared helpers for the Contradictions route family (/contradictions,
 * /contradictions/new, /contradictions/[id]). Page-local by design — nothing
 * here is imported outside src/app/contradictions/.
 *
 * The central discipline of this layer: contradictions are not errors. They
 * are sites of strategic intelligence — two valid forces pulling in opposite
 * directions — and both sides must stay evidence-linked to signals.
 */

import { Pill } from "@/components/badges";
import type {
  Contradiction,
  ContradictionScores,
  ContradictionType,
  Score,
} from "@/lib/types";
import {
  CONTRADICTION_SCORE_LABELS,
  CONTRADICTION_TYPE_LABELS,
} from "@/lib/types";

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

/** Contradiction type shown as a pill in the reserved tension tone. */
export function ContradictionTypePill({ type }: { type: ContradictionType }) {
  return <Pill tone="tension">{CONTRADICTION_TYPE_LABELS[type]}</Pill>;
}

/** Short mono labels for the five contradiction scoring dimensions. */
export const SCORE_CHIP_LABELS: Record<keyof ContradictionScores, string> = {
  tensionStrength: "Tension",
  strategicRichness: "Richness",
  evidenceBalance: "Balance",
  futureImpact: "Impact",
  emotionalCharge: "Charge",
};

const SCORE_CHIP_KEYS = Object.keys(SCORE_CHIP_LABELS) as Array<
  keyof ContradictionScores
>;

/** Compact mono score chips, e.g. “Tension 4 · Richness 5 · Balance 3”. */
export function ContradictionScoreChips({
  scores,
}: {
  scores: ContradictionScores;
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {SCORE_CHIP_KEYS.map((k) => (
        <span
          key={k}
          title={`${CONTRADICTION_SCORE_LABELS[k]} — ${scores[k]}/5`}
          className="border border-line bg-surface px-1.5 py-px font-mono text-[10.5px] tracking-wide text-ink-soft rounded-[2px]"
        >
          {SCORE_CHIP_LABELS[k]} {scores[k]}
        </span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export type ContradictionSort = "tension" | "impact" | "richness" | "newest";

export const CONTRADICTION_SORT_OPTIONS: Array<{
  value: ContradictionSort;
  label: string;
}> = [
  { value: "tension", label: "By tension strength" },
  { value: "impact", label: "By future impact" },
  { value: "richness", label: "By strategic richness" },
  { value: "newest", label: "Newest first" },
];

export function sortContradictions(
  list: Contradiction[],
  sort: ContradictionSort,
): Contradiction[] {
  const byNewest = (a: Contradiction, b: Contradiction) =>
    b.createdAt.localeCompare(a.createdAt);
  const copy = [...list];
  switch (sort) {
    case "tension":
      return copy.sort(
        (a, b) =>
          b.scores.tensionStrength - a.scores.tensionStrength || byNewest(a, b),
      );
    case "impact":
      return copy.sort(
        (a, b) => b.scores.futureImpact - a.scores.futureImpact || byNewest(a, b),
      );
    case "richness":
      return copy.sort(
        (a, b) =>
          b.scores.strategicRichness - a.scores.strategicRichness ||
          byNewest(a, b),
      );
    case "newest":
      return copy.sort(byNewest);
  }
}

// ---------------------------------------------------------------------------
// Scoring defaults
// ---------------------------------------------------------------------------

/** Generic 1–5 rubric for the five contradiction scoring dimensions. */
export const GENERIC_SCORE_RUBRIC: Record<Score, string> = {
  1: "Very weak",
  2: "Weak",
  3: "Moderate",
  4: "Strong",
  5: "Very strong",
};

/** Low starting point for the create form — every dimension must be judged. */
export const DEFAULT_CONTRADICTION_SCORES: ContradictionScores = {
  tensionStrength: 2,
  strategicRichness: 2,
  evidenceBalance: 2,
  futureImpact: 2,
  emotionalCharge: 2,
};

/** Cast helper: ContradictionScores → indexable record for the generic ScoreGrid. */
export function contradictionScoresRecord(
  scores: ContradictionScores,
): Record<keyof ContradictionScores, Score> {
  return scores as Record<keyof ContradictionScores, Score>;
}
