"use client";

/**
 * Evidence compression — the system's core promise made visible: every
 * layer reduces noise while increasing meaning. Counts are computed live
 * from the store, never hardcoded, so the funnel is always backed by
 * actual records.
 *
 * Full form (Advanced Overview, Methodology):
 *   324 sources → 203 observations → 91 signals → 16 cluster maps → …
 * Compact form (Simple mode, detail pages):
 *   "Backed by 42 signals from 186 sources across 7 sectors."
 */

import Link from "next/link";
import { useMemo } from "react";
import { numberWord } from "@/lib/simple";
import type { IntelligenceData } from "@/lib/store";
import type { Signal, Source } from "@/lib/types";

interface Stage {
  label: string;
  count: number;
  href: string;
}

export function compressionStages(d: IntelligenceData): Stage[] {
  return [
    { label: "sources scanned", count: d.sources.length, href: "/sources" },
    { label: "observations extracted", count: d.observations.length, href: "/observations" },
    { label: "signals", count: d.signals.length, href: "/signals" },
    { label: "cluster maps", count: d.clusters.length, href: "/clusters" },
    { label: "patterns", count: d.patterns.length, href: "/patterns" },
    { label: "drivers", count: d.drivers.length, href: "/drivers" },
    { label: "future territories", count: d.territories.length, href: "/territories" },
    { label: "scenarios", count: d.scenarios.length, href: "/scenarios" },
    { label: "implications", count: d.implications.length, href: "/implications" },
    { label: "indicators", count: d.indicators.length, href: "/monitoring" },
  ];
}

/**
 * Quiet intelligence-status line for the Simple briefing: the funnel down
 * to territories with the candidate/valid split, plain faint text — a
 * status murmur, not a KPI row. Counts are live.
 */
export function EvidenceStatusLine({ data }: { data: IntelligenceData }) {
  const valid = data.signals.filter((s) => s.reviewStatus === "validated").length;
  const parts = [
    `${data.sources.length} sources scanned.`,
    `${valid} signals kept.`,
    `${data.clusters.length} clusters formed.`,
    `${data.patterns.length} patterns detected.`,
    `${data.territories.length} future direction${data.territories.length === 1 ? "" : "s"} taking shape.`,
  ];
  return (
    <p className="mt-2 max-w-2xl text-[11.5px] leading-relaxed text-ink-faint">
      {parts.join(" ")}
    </p>
  );
}

/** The full funnel, one quiet line that wraps. Advanced register. */
export function EvidenceCompressionSummary({ data }: { data: IntelligenceData }) {
  const stages = useMemo(() => compressionStages(data), [data]);
  return (
    <p className="max-w-3xl text-[12.5px] leading-relaxed text-ink-soft">
      {stages.map((s, i) => (
        <span key={s.label} className="whitespace-nowrap">
          {i > 0 ? <span className="px-1.5 text-line-strong">→</span> : null}
          <Link href={s.href} className="hover:text-accent-ink">
            <span className="font-mono">{s.count}</span> {s.label}
          </Link>
        </span>
      ))}
    </p>
  );
}

/**
 * Simple-register backing line for a set of signals:
 * "Backed by twelve signals from nine sources across five sectors."
 */
export function evidenceBackingLine(signals: Signal[], sources: Source[]): string {
  const srcIds = new Set(signals.flatMap((s) => s.sourceIds));
  const linked = sources.filter((s) => srcIds.has(s.id));
  const sectors = new Set(signals.flatMap((s) => s.sectors));
  if (signals.length === 0) return "No signal evidence attached yet.";
  return `Backed by ${numberWord(signals.length)} signal${signals.length === 1 ? "" : "s"} from ${numberWord(linked.length)} source${linked.length === 1 ? "" : "s"} across ${numberWord(sectors.size)} sector${sectors.size === 1 ? "" : "s"}.`;
}

export function EvidenceBackingLine({
  signals,
  sources,
}: {
  signals: Signal[];
  sources: Source[];
}) {
  return (
    <p className="text-[12px] text-ink-faint">{evidenceBackingLine(signals, sources)}</p>
  );
}
