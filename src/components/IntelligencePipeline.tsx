import Link from "next/link";
import { PIPELINE_STAGES } from "@/lib/copy";

/**
 * The intelligence pipeline: Observation → Signal → Cluster → Pattern →
 * Driver → Future Territory → Scenario → Implication → Monitor, with live
 * counts at each stage. Rendered as an open flow — no box; whitespace and
 * the arrows carry the structure.
 */
export function IntelligencePipeline({
  counts,
  compact = false,
}: {
  counts: Record<string, number>;
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-baseline">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-baseline">
            {i > 0 ? (
              <span
                aria-hidden
                className="select-none px-2.5 text-[12px] text-line-strong"
              >
                →
              </span>
            ) : null}
            <Link href={stage.route} className="group flex flex-col">
              <span
                className={`font-mono leading-none text-ink group-hover:text-accent-ink ${
                  compact ? "text-[15px]" : "text-[19px]"
                }`}
              >
                {counts[stage.key] ?? 0}
              </span>
              <span className="mt-1 text-[10.5px] text-ink-faint group-hover:text-ink-soft">
                {stage.label}
              </span>
            </Link>
          </div>
        ))}
      </div>
      {!compact ? (
        <p className="mt-3 text-[11px] text-ink-faint">
          Each layer reduces noise while increasing meaning. Counts show activity, not conclusions.
        </p>
      ) : null}
    </div>
  );
}
