"use client";

/**
 * Explained readouts — a score, confidence level, or status is never shown
 * as a bare number. Each readout pairs the value with a one-sentence,
 * data-derived reason from lib/explain.ts.
 */

import {
  evidenceQualityLine,
  explainSignalConfidence,
  explainSignalScore,
  scoreHeadline,
} from "@/lib/explain";
import type { Signal, SignalScores, Source } from "@/lib/types";
import { CONFIDENCE_LABELS } from "@/lib/types";
import { ConfidenceBadge } from "./badges";

/** e.g. "High strategic relevance" + why, for the simple view. */
export function ExplainedScore({
  dim,
  signal,
  sources,
}: {
  dim: keyof SignalScores;
  signal: Signal;
  sources: Source[];
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-ink">
          {scoreHeadline(dim, signal.scores[dim])}
        </span>
        <span className="font-mono text-[11px] text-ink-faint">
          {signal.scores[dim]}/5
        </span>
      </div>
      <p className="text-[12px] leading-relaxed text-ink-soft">
        {explainSignalScore(dim, signal, sources)}
      </p>
    </div>
  );
}

/** Confidence badge + the reason it is what it is. */
export function ExplainedConfidence({
  signal,
  sources,
}: {
  signal: Signal;
  sources: Source[];
}) {
  return (
    <div className="space-y-1">
      <ConfidenceBadge level={signal.confidence} />
      <p className="text-[12px] leading-relaxed text-ink-soft">
        {explainSignalConfidence(signal, sources)}
      </p>
    </div>
  );
}

/** One-line evidence-base summary for the simple view. */
export function EvidenceQualityLine({
  signal,
  sources,
}: {
  signal: Signal;
  sources: Source[];
}) {
  return (
    <p className="text-[12px] leading-relaxed text-ink-soft">
      <span className="overline-label mr-2">Evidence</span>
      {evidenceQualityLine(signal, sources)}
    </p>
  );
}

/** Generic value + reason row for non-signal objects. */
export function ExplainedValue({
  label,
  value,
  reason,
}: {
  label: string;
  value: React.ReactNode;
  reason: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="overline-label">{label}</span>
        <span className="text-[12px] font-medium text-ink">{value}</span>
      </div>
      <p className="text-[12px] leading-relaxed text-ink-soft">{reason}</p>
    </div>
  );
}

export { CONFIDENCE_LABELS };
