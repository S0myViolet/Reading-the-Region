"use client";

/**
 * Names the pipeline stage a record belongs to, in the register of the
 * current mode: friendly language in Simple mode ("Signal worth attention"),
 * the methodology's own names in Advanced mode ("Stage: Signal Candidate").
 */

import {
  STAGE_LABELS,
  STAGE_LABELS_SIMPLE,
  type PipelineStage,
} from "@/lib/pipeline";
import { useViewMode } from "./ViewMode";

export function PipelineStageBadge({ stage }: { stage: PipelineStage }) {
  const mode = useViewMode();
  if (mode === "simple") {
    return <span className="text-[11px] text-ink-faint">{STAGE_LABELS_SIMPLE[stage]}</span>;
  }
  return (
    <span className="rounded-[4px] bg-surface-muted px-1.5 py-px text-[11px] text-ink-soft">
      Stage: {STAGE_LABELS[stage]}
    </span>
  );
}
