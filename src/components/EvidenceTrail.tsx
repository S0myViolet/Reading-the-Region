import Link from "next/link";
import { STAGE_LABELS, type PipelineStage } from "@/lib/pipeline";

export interface TrailStep {
  stage: PipelineStage;
  title: string;
  href?: string;
}

/**
 * The evidence chain behind a conclusion, rendered as a quiet vertical
 * trail from the top of the pyramid back down to sources:
 *
 *   Strategic Implication → Scenario → Future Territory → Driver →
 *   Pattern → Cluster → Signal → Source
 *
 * Pass the steps that exist; the trail renders them in given order and
 * never invents links. A conclusion whose trail is short is visibly short —
 * that is the point.
 */
export function EvidenceTrail({ steps }: { steps: TrailStep[] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="space-y-1.5 border-l border-line pl-4">
      {steps.map((step, i) => (
        <li key={`${step.stage}-${step.title}-${i}`} className="text-[12px] leading-snug">
          <span className="mr-2 text-[10.5px] text-ink-faint">
            {STAGE_LABELS[step.stage]}
          </span>
          {step.href ? (
            <Link
              href={step.href}
              className="text-ink-soft underline-offset-2 hover:text-accent-ink hover:underline"
            >
              {step.title}
            </Link>
          ) : (
            <span className="text-ink-soft">{step.title}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
