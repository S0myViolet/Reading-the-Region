import { BIAS_CHECK_QUESTIONS } from "@/lib/copy";

/**
 * Bias check area shown on major conclusion pages (patterns, drivers,
 * territories, scenarios, implications). The questions are prompts for the
 * analyst, not fields — the discipline is in asking them before concluding.
 */
export function BiasCheckPanel({ extraQuestions = [] }: { extraQuestions?: string[] }) {
  return (
    <section className="card border-l-2 border-l-caution">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Bias check — before relying on this conclusion</h3>
      </header>
      <ul className="space-y-1.5 px-4 py-3">
        {[...BIAS_CHECK_QUESTIONS, ...extraQuestions].map((q) => (
          <li key={q} className="flex gap-2 text-[12.5px] text-ink-soft">
            <span aria-hidden className="text-caution">
              ?
            </span>
            {q}
          </li>
        ))}
      </ul>
    </section>
  );
}
