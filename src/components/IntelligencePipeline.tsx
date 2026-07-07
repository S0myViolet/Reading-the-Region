import Link from "next/link";
import { PIPELINE_STAGES } from "@/lib/copy";

/**
 * The intelligence pipeline ribbon: Observation → Signal → Cluster → Pattern
 * → Driver → Future Territory → Scenario → Implication → Monitor, with live
 * counts at each stage. Each layer reduces noise and increases meaning.
 */
export function IntelligencePipeline({
  counts,
  compact = false,
}: {
  counts: Record<string, number>;
  compact?: boolean;
}) {
  return (
    <div className="card overflow-x-auto">
      <div className="flex min-w-max items-stretch">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-stretch">
            {i > 0 ? (
              <span
                aria-hidden
                className="flex items-center px-1 text-ink-faint text-[13px] select-none"
              >
                →
              </span>
            ) : null}
            <Link
              href={stage.route}
              className={`flex flex-col justify-center border-l border-line first:border-l-0 hover:bg-surface-muted ${
                compact ? "px-3 py-2" : "px-4 py-3"
              }`}
            >
              <span className="font-mono text-[17px] leading-none text-ink">
                {counts[stage.key] ?? 0}
              </span>
              <span className="overline-label mt-1">{stage.label}</span>
            </Link>
          </div>
        ))}
      </div>
      {!compact ? (
        <p className="border-t border-line px-4 py-1.5 text-[11px] text-ink-faint">
          Each layer reduces noise while increasing meaning. Counts show activity, not conclusions.
        </p>
      ) : null}
    </div>
  );
}
