"use client";

/**
 * Patterns — repeated behaviours, movements, or system responses appearing
 * across several clusters. Stronger than a cluster because a pattern is not
 * confined to one topic. Validation status is computed live against the four
 * pattern tests (breadth, depth, persistence, coherence); the stored status
 * is never trusted on its own.
 *
 * Layout has exactly four layers: header, one control bar, the pattern
 * list, and the collapsed page guide. Each row is one primary line (the
 * pattern name) and one plain-language status line; accent appears only on
 * patterns that have earned validation.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/badges";
import {
  ControlBar,
  ControlSearch,
  ControlSelect,
} from "@/components/ControlBar";
import { useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validatePattern, type ValidationResult } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type { Pattern, PatternType, Signal } from "@/lib/types";
import { PATTERN_TYPE_LABELS } from "@/lib/types";
import {
  countInWords,
  shortPatternStatus,
  signalsOfPattern,
} from "./pattern-ui";

type StatusFilter = "all" | "validated" | "hypothesis";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "validated", label: "Validated" },
  { value: "hypothesis", label: "Not yet validated" },
];

function PatternsHeader() {
  return <PageHeader title="Patterns" description={DEFINITIONS.pattern} />;
}

function PatternRow({
  pattern,
  result,
  linkedSignals,
}: {
  pattern: Pattern;
  result: ValidationResult;
  linkedSignals: Signal[];
}) {
  const clusterCount = pattern.clusterIds.length;
  return (
    <Link href={`/patterns/${pattern.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {pattern.name}
        </p>
        {result.valid ? (
          <span className="shrink-0">
            <Pill
              tone="accent"
              title={`${result.passedCount} of ${result.totalCount} pattern tests passed`}
            >
              Validated
            </Pill>
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] text-ink-faint">
        {PATTERN_TYPE_LABELS[pattern.patternType]} · {shortPatternStatus(result)}{" "}
        Draws on {countInWords(clusterCount)} cluster
        {clusterCount === 1 ? "" : "s"} and {countInWords(linkedSignals.length)} key
        signal{linkedSignals.length === 1 ? "" : "s"}.
      </p>
    </Link>
  );
}

export default function PatternsPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const patterns = useIntelligenceStore((s) => s.patterns);
  const signals = useIntelligenceStore((s) => s.signals);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const rows = useMemo(
    () =>
      [...patterns]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((pattern) => ({
          pattern,
          result: validatePattern(pattern, signals),
          linkedSignals: signalsOfPattern(pattern, signals),
        })),
    [patterns, signals],
  );

  if (!hydrated) {
    return (
      <>
        <PatternsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const typesPresent = [...new Set(rows.map((r) => r.pattern.patternType))];

  // The type filter is an Analyst-view control — it never silently narrows
  // the list while the control itself is hidden in the simple view.
  const typeFilterActive = mode !== "simple" && typeFilter !== "all";

  const q = query.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (statusFilter === "validated" && !r.result.valid) return false;
    if (statusFilter === "hypothesis" && r.result.valid) return false;
    if (typeFilterActive && r.pattern.patternType !== (typeFilter as PatternType))
      return false;
    if (
      q &&
      !`${r.pattern.name} ${r.pattern.patternStatement}`.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  const validatedCount = rows.filter((r) => r.result.valid).length;

  return (
    <>
      <PatternsHeader />
      <WalkthroughPanel pageId="patterns" />

      <ControlBar
        more={
          mode !== "simple" && typesPresent.length > 0 ? (
            <ControlSelect
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "All types" },
                ...typesPresent.map((t) => ({
                  value: t,
                  label: PATTERN_TYPE_LABELS[t],
                })),
              ]}
            />
          ) : undefined
        }
        right={
          rows.length > 0 ? (
            <span className="text-[12px] text-ink-faint">
              {validatedCount} of {rows.length} validated
            </span>
          ) : null
        }
      >
        <ControlSearch value={query} onChange={setQuery} placeholder="Search patterns…" />
        <ControlSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          options={STATUS_OPTIONS}
        />
      </ControlBar>

      {rows.length === 0 ? (
        <EmptyState
          message="No patterns yet. A pattern emerges when the same movement repeats across at least 3 sectors, 5 independent sources, and 6 months of evidence. Build and validate clusters first."
          actionLabel="Open Signal Clusters"
          actionHref="/clusters"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          message={`Nothing matches the current filters. Reset the search or status${
            mode !== "simple" ? " and type" : ""
          } filters to see all ${countInWords(rows.length)} pattern${
            rows.length === 1 ? "" : "s"
          }. Patterns are promoted from repeated cluster logic, not created directly.`}
          actionLabel="Open Signal Clusters"
          actionHref="/clusters"
        />
      ) : (
        <section aria-label="Patterns">
          {filtered.map((r) => (
            <PatternRow
              key={r.pattern.id}
              pattern={r.pattern}
              result={r.result}
              linkedSignals={r.linkedSignals}
            />
          ))}
        </section>
      )}
    </>
  );
}
