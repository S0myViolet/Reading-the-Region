import type { ValidationResult } from "@/lib/validation";

/**
 * Renders a validation result as an explicit pass/fail checklist. Used for
 * cluster thresholds, pattern tests, driver thresholds, territory linkage,
 * scenario quality, and implication evidence rules.
 */
export function ValidationChecklist({
  result,
  title,
  passedLabel = "All checks passed",
  failedLabel = "Below threshold",
}: {
  result: ValidationResult;
  title: string;
  passedLabel?: string;
  failedLabel?: string;
}) {
  return (
    <section className="card">
      <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h3 className="overline-label">{title}</h3>
        <span
          className={`px-1.5 py-px text-[10.5px] font-medium rounded-[2px] border ${
            result.valid
              ? "bg-accent-soft text-accent-ink border-accent/30"
              : "bg-caution-soft text-caution border-caution/30"
          }`}
        >
          {result.valid ? passedLabel : failedLabel} · {result.passedCount}/{result.totalCount}
        </span>
      </header>
      <ul className="divide-y divide-line">
        {result.checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2.5 px-4 py-2">
            <span
              aria-hidden
              className={`mt-[3px] inline-block h-3 w-3 shrink-0 rounded-[1px] border text-center text-[9px] leading-[11px] font-bold ${
                c.passed
                  ? "border-accent bg-accent text-white"
                  : "border-line-strong bg-surface text-transparent"
              }`}
            >
              ✓
            </span>
            <span>
              <span className={`text-[12.5px] ${c.passed ? "text-ink" : "text-ink-soft"}`}>
                {c.label}
              </span>
              <span className="block text-[11.5px] text-ink-faint">{c.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
