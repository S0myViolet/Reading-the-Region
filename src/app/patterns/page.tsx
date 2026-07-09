"use client";

/**
 * Patterns — repeated behaviours, movements, or system responses appearing
 * across several clusters. Stronger than a cluster because a pattern is not
 * confined to one topic. Validation status is computed live against the four
 * pattern tests (breadth, depth, persistence, coherence); the stored status
 * is never trusted on its own.
 *
 * Layout has exactly four layers: header, one control bar, the pattern
 * list, and the collapsed page guide. The simple view keeps each row to one
 * primary line and one plain status line. The advanced view adds the plain
 * meaning, the evidence base (live counts from the linked records), and the
 * main tension; accent appears only on patterns that have earned validation.
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
import { Age, FreshnessWord } from "@/components/freshness";
import { RefreshBar } from "@/components/RefreshControls";
import {
  checkedReading,
  patternEvidenceWindow,
  patternStaleReason,
  type EvidenceWindow,
} from "@/lib/freshness";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validatePattern, type ValidationResult } from "@/lib/validation";
import { patternPlainMeaning } from "@/lib/explain";
import { DEFINITIONS } from "@/lib/copy";
import type { Pattern, PatternType, Signal } from "@/lib/types";
import { PATTERN_TYPE_LABELS } from "@/lib/types";
import {
  countInWords,
  independentSourceFigure,
  mainTensionOfPattern,
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
  advanced,
  plainMeaning,
  sourceCount,
  mainTensionName,
  window,
  staleReason,
}: {
  pattern: Pattern;
  result: ValidationResult;
  linkedSignals: Signal[];
  advanced: boolean;
  plainMeaning: string;
  sourceCount: number;
  mainTensionName: string | null;
  /** Live evidence window from key signals plus recorded dates. */
  window: EvidenceWindow;
  /** One plain sentence when the pattern has gone stale, else null. */
  staleReason: string | null;
}) {
  const reading = checkedReading(pattern);
  const clusterCount = pattern.clusterIds.length;

  if (!advanced) {
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

  // Advanced row: name, plain meaning, type + earned status, then the
  // evidence base counted from the linked records and the main tension.
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
      <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
        {plainMeaning}
      </p>
      <p className="mt-1.5 text-[12px] text-ink-faint">
        {PATTERN_TYPE_LABELS[pattern.patternType]}
        {result.valid ? null : <> · {shortPatternStatus(result)}</>}
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-6">
        <p className="font-mono text-[11px] text-ink-faint">
          {clusterCount} cluster{clusterCount === 1 ? "" : "s"} ·{" "}
          {linkedSignals.length} key signal{linkedSignals.length === 1 ? "" : "s"} ·{" "}
          {sourceCount} independent source{sourceCount === 1 ? "" : "s"}
        </p>
        <span className="shrink-0 text-[11px] text-ink-faint underline-offset-2 group-hover:text-accent-ink group-hover:underline">
          Open pattern
        </span>
      </div>
      <p className="mt-1 text-[11.5px] text-ink-faint">
        <FreshnessWord date={window.latest} />
        {window.latest && window.oldest ? (
          <>
            {" · Evidence window "}
            <Age iso={window.oldest} />{" "}
            <span aria-hidden>→</span> <Age iso={window.latest} />
          </>
        ) : (
          <> · no dated evidence linked</>
        )}
        {" · "}
        <Age iso={reading.date} prefix={reading.verb} />
        {staleReason ? (
          <>
            {" · "}
            <span className="text-caution" title={staleReason}>
              Stale
            </span>
          </>
        ) : null}
      </p>
      {mainTensionName ? (
        <p className="mt-1 text-[12px] text-ink-faint">
          Main tension: {mainTensionName}
        </p>
      ) : null}
    </Link>
  );
}

export default function PatternsPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const patterns = useIntelligenceStore((s) => s.patterns);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const rows = useMemo(
    () =>
      [...patterns]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((pattern) => {
          const linkedSignals = signalsOfPattern(pattern, signals);
          return {
            pattern,
            result: validatePattern(pattern, signals),
            linkedSignals,
            plainMeaning: patternPlainMeaning(pattern),
            sourceCount: independentSourceFigure(pattern, linkedSignals, sources),
            mainTensionName:
              mainTensionOfPattern(pattern, contradictions)?.name ?? null,
            window: patternEvidenceWindow(pattern, signals),
            staleReason: patternStaleReason(pattern, signals),
          };
        }),
    [patterns, signals, sources, contradictions],
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

      {mode !== "simple" ? <RefreshBar /> : null}

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
              advanced={mode !== "simple"}
              plainMeaning={r.plainMeaning}
              sourceCount={r.sourceCount}
              mainTensionName={r.mainTensionName}
              window={r.window}
              staleReason={r.staleReason}
            />
          ))}
        </section>
      )}
    </>
  );
}
