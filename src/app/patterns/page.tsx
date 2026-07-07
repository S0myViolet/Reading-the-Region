"use client";

/**
 * Patterns — repeated behaviours, movements, or system responses appearing
 * across several clusters. Stronger than a cluster because a pattern is not
 * confined to one topic. Validation status is computed live against the four
 * pattern tests (breadth, depth, persistence, coherence); the stored status
 * is never trusted on its own.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ConfidenceBadge, IdChip, Pill } from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validatePattern } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type { Pattern, Signal } from "@/lib/types";
import { PATTERN_TYPE_LABELS } from "@/lib/types";
import {
  PatternTestChips,
  PatternValidationPill,
  RecomputedNote,
  signalsOfPattern,
  statusDisagrees,
} from "./pattern-ui";

function PatternsHeader() {
  return (
    <PageHeader
      overline="Connect & Synthesize"
      title="Patterns"
      description={DEFINITIONS.pattern}
    />
  );
}

function PatternCard({ pattern, signals }: { pattern: Pattern; signals: Signal[] }) {
  const result = validatePattern(pattern, signals);
  const linkedSignals = signalsOfPattern(pattern, signals);
  const recomputed = statusDisagrees(pattern, result);

  return (
    <article className="card px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-2xl">
          <p className="overline-label mb-0.5">
            Pattern · <IdChip id={pattern.id} />
          </p>
          <h3 className="font-display text-[17px] leading-snug text-ink">
            <Link
              href={`/patterns/${pattern.id}`}
              className="hover:text-accent-ink hover:underline"
            >
              {pattern.name}
            </Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Pill tone="info">{PATTERN_TYPE_LABELS[pattern.patternType]}</Pill>
            <ConfidenceBadge level={pattern.confidence} />
          </div>
          <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
            {pattern.patternStatement.trim() ? (
              pattern.patternStatement
            ) : (
              <span className="text-[12px] text-ink-faint">
                No pattern statement recorded yet — a pattern must be explainable
                as one clear movement in a single statement.
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <PatternValidationPill result={result} />
          {recomputed ? <RecomputedNote /> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-2.5">
        <PatternTestChips result={result} />
        <span className="font-mono text-[11.5px] text-ink-soft">
          {pattern.clusterIds.length} cluster{pattern.clusterIds.length === 1 ? "" : "s"}
        </span>
        <span className="font-mono text-[11.5px] text-ink-soft">
          {linkedSignals.length} key signal{linkedSignals.length === 1 ? "" : "s"}
        </span>
      </div>
    </article>
  );
}

export default function PatternsPage() {
  const hydrated = useHydrated();
  const patterns = useIntelligenceStore((s) => s.patterns);
  const signals = useIntelligenceStore((s) => s.signals);

  if (!hydrated) {
    return (
      <>
        <PatternsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const ordered = [...patterns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PatternsHeader />
      <WalkthroughPanel pageId="patterns" />

      {ordered.length === 0 ? (
        <EmptyState
          message="No patterns yet. A pattern emerges when the same movement repeats across at least 3 sectors, 5 independent sources, and 6 months of evidence. Build and validate clusters first."
          actionLabel="Open Signal Clusters"
          actionHref="/clusters"
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((p) => (
            <PatternCard key={p.id} pattern={p} signals={signals} />
          ))}
        </div>
      )}
    </>
  );
}
