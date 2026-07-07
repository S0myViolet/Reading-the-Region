"use client";

/**
 * Shared helpers for the Signal Library route family (/signals,
 * /signals/[id], /signals/new). Page-local by design — nothing here is
 * imported outside src/app/signals/.
 */

import type { ConfidenceLevel, Region, SignalScores } from "@/lib/types";
import { SCORE_DIMENSION_LABELS, SCORE_RUBRICS } from "@/lib/types";

export const btnPrimary =
  "border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink";
export const btnSecondary =
  "border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong";

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** The Region union, in display order, for forms and filters. */
export const REGION_OPTIONS: Region[] = [
  "GCC",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Egypt",
  "Levant",
  "North Africa",
  "MENA-wide",
  "Global with regional significance",
];

/** Build Select/CheckboxList options from an enum label map. */
export function optionsFrom<T extends string>(
  labels: Record<T, string>,
): Array<{ value: T; label: string }> {
  return (Object.keys(labels) as T[]).map((v) => ({ value: v, label: labels[v] }));
}

export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseTags(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Confidence logic used across the signal layer. Confidence describes how
 * far the interpretation can be trusted, not how interesting the signal is.
 */
export const CONFIDENCE_EXPLANATIONS: Record<ConfidenceLevel, string> = {
  low: "A single or weak source, little repetition, or an interpretation running ahead of the evidence. Low-confidence signals with high novelty are queued for human review before use.",
  medium:
    "At least one credible source and a grounded interpretation, but limited independent corroboration so far. Usable with care; strengthen before building on it.",
  high: "Multiple independent credible sources point the same way and the interpretation stays close to the evidence. Safe to connect into clusters and patterns.",
};

/**
 * Tags that trigger human review regardless of scores — sensitive subject
 * matter must not move through the pipeline on autopilot.
 */
export const SENSITIVE_TAG_TERMS: string[] = [
  "politic",
  "religio",
  "sectarian",
  "royal",
  "monarch",
  "gender",
  "protest",
  "sanction",
  "military",
  "conflict",
  "security",
  "censorship",
  "human rights",
  "minority",
];

export function sensitiveTags(tags: string[]): string[] {
  return tags.filter((t) =>
    SENSITIVE_TAG_TERMS.some((term) => t.toLowerCase().includes(term)),
  );
}

/**
 * Compact mono score chips for the four headline dimensions, e.g.
 * "N4 M3 E2 S5". The full rubric anchor appears as a tooltip. The evidence
 * chip turns amber when evidence is weak (≤ 2).
 */
export function ScoreChips({ scores }: { scores: SignalScores }) {
  const chips: Array<{ letter: string; key: keyof SignalScores }> = [
    { letter: "N", key: "novelty" },
    { letter: "M", key: "momentum" },
    { letter: "E", key: "evidence" },
    { letter: "S", key: "strategicRelevance" },
  ];
  return (
    <span className="inline-flex gap-1 font-mono text-[10.5px]">
      {chips.map(({ letter, key }) => {
        const weakEvidence = key === "evidence" && scores[key] <= 2;
        return (
          <span
            key={key}
            title={`${SCORE_DIMENSION_LABELS[key]} ${scores[key]}/5 — ${SCORE_RUBRICS[key][scores[key]]}`}
            className={`border px-1 py-px rounded-[2px] ${
              weakEvidence
                ? "border-caution/30 bg-caution-soft text-caution"
                : "border-line bg-surface-muted text-ink-soft"
            }`}
          >
            {letter}
            {scores[key]}
          </span>
        );
      })}
    </span>
  );
}

/**
 * The six questions a reader should ask of any signal, in reading order.
 * Shown in the "How to read this signal" panel when Guided Mode is on.
 */
export const SIGNAL_READING_GUIDE: Array<{ q: string; note: string }> = [
  {
    q: "What happened?",
    note: "Start from the factual event only — what is recorded, dated, and sourced. Nothing interpretive belongs here.",
  },
  {
    q: "What behaviour changed?",
    note: "What people, institutions, brands, or systems may be starting to do differently, grounded in the event itself.",
  },
  {
    q: "What system changed?",
    note: "The larger system the behaviour connects to — identity, tourism, finance, urban life, trust, culture.",
  },
  {
    q: "What future becomes more plausible?",
    note: "A possible direction, not a prediction. Weigh it against the evidence score and the speculation flag.",
  },
  {
    q: "What could contradict this?",
    note: "Check the linked contradictions before accepting the reading — unopposed conclusions invite overconfidence.",
  },
  {
    q: "What should happen next?",
    note: "Connect it to related signals or a cluster candidate, monitor it, strengthen its evidence, or archive it.",
  },
];
