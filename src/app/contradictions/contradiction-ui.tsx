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

/** Linked-object counts for the simple list card, in words. */
export function contradictionEvidenceCounts(c: Contradiction): string {
  const a = c.sideASignalIds.length;
  const b = c.sideBSignalIds.length;
  if (a === 0 && b === 0) {
    return "No signals are linked to either side yet — both sides need evidence before this tension carries weight.";
  }
  return `Evidence-linked to ${countInWords(a, "signal")} on Side A and ${countInWords(b, "signal")} on Side B.`;
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

// ---------------------------------------------------------------------------
// Score readings — a score is never shown as a bare number. The wording is
// derived from the score value alone: 1–2 low, 3 moderate, 4–5 strong.
// ---------------------------------------------------------------------------

export type ScoreBand = "low" | "moderate" | "strong";

export function scoreBand(score: Score): ScoreBand {
  return score <= 2 ? "low" : score === 3 ? "moderate" : "strong";
}

const CONTRADICTION_SCORE_READINGS: Record<
  keyof ContradictionScores,
  Record<ScoreBand, string>
> = {
  tensionStrength: {
    low: "the pull between the two sides is judged faint — one side may simply win",
    moderate: "the two sides pull against each other, though not yet hard",
    strong: "both sides are well-evidenced and pulling hard",
  },
  strategicRichness: {
    low: "judged to open few strategic questions so far",
    moderate: "opens some strategic questions worth watching",
    strong: "opens rich strategic questions for whoever must act on it",
  },
  evidenceBalance: {
    low: "the evidence is lopsided — one side is under-scanned",
    moderate: "the evidence leans to one side, but both sides are represented",
    strong: "both sides rest on comparably strong evidence",
  },
  futureImpact: {
    low: "how this resolves is judged unlikely to reshape much",
    moderate: "how this resolves will matter within its sectors",
    strong: "how this resolves will shape futures across the region",
  },
  emotionalCharge: {
    low: "judged to carry little emotional weight for those inside it",
    moderate: "carries real emotional weight for those inside it",
    strong: "deeply felt — identity and belonging are in play",
  },
};

/** One-sentence reading of a contradiction score, derived from its value. */
export function contradictionScoreReading(
  dim: keyof ContradictionScores,
  score: Score,
): string {
  return `${CONTRADICTION_SCORE_READINGS[dim][scoreBand(score)]}.`;
}
