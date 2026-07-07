import type { ValidationResult } from "@/lib/validation";

/**
 * Renders a validation result as an explicit pass/fail checklist. Used for
 * cluster thresholds, pattern tests, driver thresholds, territory linkage,
 * scenario quality, and implication evidence rules. Quiet by design — the
 * verdict line and per-check marks carry the information without boxing.
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
    <section>
      <header className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="text-[13px] font-medium text-ink">{title}</h3>
        <span
          className={`text-[11.5px] ${result.valid ? "text-accent-ink" : "text-caution"}`}
        >
          {result.valid ? passedLabel : failedLabel} · {result.passedCount}/{result.totalCount}
        </span>
      </header>
      <ul className="space-y-2 border-l border-line pl-4">
        {result.checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className={`mt-[5px] inline-block h-[7px] w-[7px] shrink-0 rounded-full ${
                c.passed ? "bg-accent" : "border border-line-strong bg-transparent"
              }`}
            />
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
