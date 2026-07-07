import { BIAS_CHECK_QUESTIONS } from "@/lib/copy";

/**
 * Bias check area shown on major conclusion pages (patterns, drivers,
 * territories, scenarios, implications). The questions are prompts for the
 * analyst, not fields — the discipline is in asking them before concluding.
 */
export function BiasCheckPanel({ extraQuestions = [] }: { extraQuestions?: string[] }) {
  return (
    <section>
      <h3 className="mb-2 text-[13px] font-medium text-ink">
        Bias check — before relying on this conclusion
      </h3>
      <ul className="space-y-1.5 border-l border-caution/40 pl-4">
        {[...BIAS_CHECK_QUESTIONS, ...extraQuestions].map((q) => (
          <li key={q} className="text-[12.5px] leading-relaxed text-ink-soft">
            {q}
          </li>
        ))}
      </ul>
    </section>
  );
}
