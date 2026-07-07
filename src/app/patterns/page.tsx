"use client";

/**
 * Patterns — repeated behaviours, movements, or system responses appearing
 * across several clusters. Stronger than a cluster because a pattern is not
 * confined to one topic. Validation status is computed live against the four
 * pattern tests (breadth, depth, persistence, coherence); the stored status
 * is never trusted on its own.
 *
 * Visibility layers: the simple view keeps each card to the name, type,
 * a two-line statement and a plain-language validation sentence. Test-pass
 * chips, counts, confidence and the type filter open in Analyst view.
 */

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ConfidenceBadge, IdChip, Pill } from "@/components/badges";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validatePattern } from "@/lib/validation";
import { explainPatternStatus } from "@/lib/explain";
import { DEFINITIONS } from "@/lib/copy";
import type { Pattern, PatternType, Signal } from "@/lib/types";
import { PATTERN_TYPE_LABELS } from "@/lib/types";
import {
  PatternTestChips,
  PatternValidationPill,
  RecomputedNote,
  signalsOfPattern,
  statusDisagrees,
} from "./pattern-ui";

type StatusFilter = "all" | "validated" | "hypothesis";

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All",
  validated: "Validated",
  hypothesis: "Not yet validated",
};

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
  const mode = useViewMode();
  const result = validatePattern(pattern, signals);
  const linkedSignals = signalsOfPattern(pattern, signals);
  const recomputed = statusDisagrees(pattern, result);
  const simple = mode === "simple";

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
            <ViewGate min="analyst">
              <ConfidenceBadge level={pattern.confidence} />
            </ViewGate>
          </div>
          <p
            className={`mt-2 text-[13px] leading-relaxed text-ink-soft ${
              simple ? "line-clamp-2" : "line-clamp-3"
            }`}
          >
            {pattern.patternStatement.trim() ? (
              pattern.patternStatement
            ) : (
              <span className="text-[12px] text-ink-faint">
                No pattern statement recorded yet — a pattern must be explainable
                as one clear movement in a single statement.
              </span>
            )}
          </p>
          {simple ? (
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
              {explainPatternStatus(pattern, result)}
            </p>
          ) : null}
        </div>
        <ViewGate min="analyst">
          <div className="flex shrink-0 flex-col items-end gap-1">
            <PatternValidationPill result={result} />
            {recomputed ? <RecomputedNote /> : null}
          </div>
        </ViewGate>
      </div>

      <ViewGate min="analyst">
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-2.5">
          <PatternTestChips result={result} />
          <span className="font-mono text-[11.5px] text-ink-soft">
            {pattern.clusterIds.length} cluster{pattern.clusterIds.length === 1 ? "" : "s"}
          </span>
          <span className="font-mono text-[11.5px] text-ink-soft">
            {linkedSignals.length} key signal{linkedSignals.length === 1 ? "" : "s"}
          </span>
        </div>
      </ViewGate>
    </article>
  );
}

export default function PatternsPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const patterns = useIntelligenceStore((s) => s.patterns);
  const signals = useIntelligenceStore((s) => s.signals);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  if (!hydrated) {
    return (
      <>
        <PatternsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const ordered = [...patterns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const typesPresent = [...new Set(ordered.map((p) => p.patternType))];

  // The type filter is an Analyst-view control — it never silently narrows
  // the list while the control itself is hidden in the simple view.
  const typeFilterActive = mode !== "simple" && typeFilter !== "all";

  const filtered = ordered.filter((p) => {
    const valid = validatePattern(p, signals).valid;
    if (statusFilter === "validated" && !valid) return false;
    if (statusFilter === "hypothesis" && valid) return false;
    if (typeFilterActive && p.patternType !== (typeFilter as PatternType))
      return false;
    return true;
  });

  return (
    <>
      <PatternsHeader />
      <WalkthroughPanel pageId="patterns" />

      {ordered.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="overline-label">Status</span>
            <div
              role="radiogroup"
              aria-label="Filter patterns by validation status"
              className="flex overflow-hidden rounded-[2px] border border-line"
            >
              {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  role="radio"
                  aria-checked={statusFilter === f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 text-[11.5px] ${
                    statusFilter === f
                      ? "bg-accent font-medium text-white"
                      : "bg-surface text-ink-soft hover:text-ink"
                  } ${f !== "all" ? "border-l border-line" : ""}`}
                >
                  {STATUS_FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          <ViewGate min="analyst">
            <label className="flex items-center gap-2">
              <span className="overline-label">Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-line bg-surface px-2 py-1 text-[12px] text-ink rounded-[2px] focus:border-accent focus:outline-none"
              >
                <option value="all">All types</option>
                {typesPresent.map((t) => (
                  <option key={t} value={t}>
                    {PATTERN_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
          </ViewGate>
        </div>
      ) : null}

      {ordered.length > 0 ? (
        <div className="mb-3">
          <DepthHint>
            Test-pass detail, confidence, evidence counts and the type filter
          </DepthHint>
        </div>
      ) : null}

      {ordered.length === 0 ? (
        <EmptyState
          message="No patterns yet. A pattern emerges when the same movement repeats across at least 3 sectors, 5 independent sources, and 6 months of evidence. Build and validate clusters first."
          actionLabel="Open Signal Clusters"
          actionHref="/clusters"
        />
      ) : filtered.length === 0 ? (
        <p className="text-[12px] text-ink-faint">
          No patterns match the current filters. Reset the status
          {mode !== "simple" ? " or type" : ""} filter to see all {ordered.length}{" "}
          pattern{ordered.length === 1 ? "" : "s"}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PatternCard key={p.id} pattern={p} signals={signals} />
          ))}
        </div>
      )}
    </>
  );
}
