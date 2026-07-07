import type { Score, SignalScores } from "@/lib/types";
import { SCORE_DIMENSION_LABELS, SCORE_RUBRICS } from "@/lib/types";

/** Five-notch score bar with rubric anchor as tooltip. */
export function ScoreBar({
  value,
  label,
  rubric,
}: {
  value: Score;
  label: string;
  rubric?: string;
}) {
  return (
    <div className="flex items-center gap-2" title={rubric ? `${value}/5 — ${rubric}` : `${value}/5`}>
      <span className="w-40 shrink-0 text-[11.5px] text-ink-soft">{label}</span>
      <span className="flex gap-[3px]">
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <span
            key={n}
            className={`h-[8px] w-[18px] rounded-[2px] ${
              n <= value ? "bg-accent" : "bg-surface-muted"
            }`}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] text-ink-faint">{value}/5</span>
    </div>
  );
}

/** The nine-dimension signal scoring panel with rubric anchors. */
export function SignalScorePanel({ scores }: { scores: SignalScores }) {
  const keys = Object.keys(SCORE_DIMENSION_LABELS) as Array<keyof SignalScores>;
  return (
    <div className="space-y-1.5">
      {keys.map((k) => (
        <ScoreBar
          key={k}
          value={scores[k]}
          label={SCORE_DIMENSION_LABELS[k]}
          rubric={SCORE_RUBRICS[k][scores[k]]}
        />
      ))}
    </div>
  );
}

/** Generic score grid for cluster / driver / contradiction score sets. */
export function ScoreGrid<T extends Record<string, Score>>({
  scores,
  labels,
}: {
  scores: T;
  labels: Record<keyof T & string, string>;
}) {
  return (
    <div className="space-y-1.5">
      {(Object.keys(labels) as Array<keyof T & string>).map((k) => (
        <ScoreBar key={k} value={scores[k]} label={labels[k]} />
      ))}
    </div>
  );
}
