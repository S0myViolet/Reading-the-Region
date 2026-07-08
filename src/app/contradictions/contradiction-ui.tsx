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

import type {
  Contradiction,
  ContradictionScores,
  Score,
  Signal,
} from "@/lib/types";

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

/** First sentence of a text block — for one-line row summaries. */
export function firstSentence(text: string): string {
  const t = text.trim();
  const m = t.match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : t).trim();
}

/** Tension strength as a plain word, shown next to the n/5 figure. */
export const TENSION_STRENGTH_WORDS: Record<Score, string> = {
  1: "Very low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Very high",
};

/** Distinct signals linked across both sides of a contradiction. */
export function linkedSignalCount(c: Contradiction): number {
  return new Set([...c.sideASignalIds, ...c.sideBSignalIds]).size;
}

/**
 * One honest line on why a tension matters: the first sentence of the
 * strategic implication, falling back to the underlying tension. Empty
 * string when neither has been written.
 */
export function whyItMattersLine(c: Contradiction): string {
  const source = c.strategicImplication.trim() || c.underlyingTension.trim();
  return source ? firstSentence(source) : "";
}

/**
 * How strong one side's linked evidence is, computed from the resolved
 * signals' own evidence scores. Returns null when no signals are linked —
 * the caller says so in its own words.
 */
export function sideEvidenceStrength(sideSignals: Signal[]): string | null {
  const n = sideSignals.length;
  if (n === 0) return null;
  const scores = sideSignals.map((s) => s.scores.evidence);
  const lo = Math.min(...scores);
  const hi = Math.max(...scores);
  const range =
    lo === hi ? `evidence score ${lo} of 5` : `evidence scores ${lo}–${hi} of 5`;
  return `${n} signal${n === 1 ? "" : "s"} linked · ${range}`;
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
    low: "judged to touch feelings only lightly for those inside it",
    moderate: "emotionally loaded for those inside it",
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
