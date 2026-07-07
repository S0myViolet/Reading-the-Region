import type { ZoomAnalysis } from "@/lib/types";
import { ProvenanceBadge } from "./badges";

const LEVELS: Array<{
  n: number;
  question: string;
  note: string;
  key: keyof Pick<ZoomAnalysis, "whatHappened" | "behaviourChanged" | "systemChanged" | "futurePlausible">;
}> = [
  {
    n: 1,
    question: "What happened?",
    note: "The factual event.",
    key: "whatHappened",
  },
  {
    n: 2,
    question: "What behaviour changed?",
    note: "What people, institutions, brands, or systems may be starting to do differently.",
    key: "behaviourChanged",
  },
  {
    n: 3,
    question: "What system changed?",
    note: "The larger system the behaviour connects to — identity, tourism, finance, urban life, trust, culture.",
    key: "systemChanged",
  },
  {
    n: 4,
    question: "What future becomes more plausible?",
    note: "Not a prediction. A possible direction suggested by the signal.",
    key: "futurePlausible",
  },
];

/**
 * The four-level zooming method, rendered as a strict ladder. Level 4 carries
 * a speculation flag when evidence is weak — the jump from event to future is
 * never presented without the intermediate levels.
 */
export function ZoomingPanel({ zoom }: { zoom: ZoomAnalysis }) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Zooming method — event to future, one level at a time</h3>
      </header>
      <ol className="divide-y divide-line">
        {LEVELS.map((level) => (
          <li key={level.n} className="px-4 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[12px] font-semibold text-ink">
                <span className="font-mono text-ink-faint">L{level.n}</span> {level.question}
              </p>
              {level.n === 1 ? (
                <ProvenanceBadge label="sourced_fact" />
              ) : level.n === 4 ? (
                <ProvenanceBadge
                  label={zoom.futureIsSpeculative ? "speculative_possibility" : "human_interpretation"}
                />
              ) : (
                <ProvenanceBadge label="human_interpretation" />
              )}
            </div>
            <p className="mt-0.5 text-[10.5px] text-ink-faint">{level.note}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{zoom[level.key]}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
