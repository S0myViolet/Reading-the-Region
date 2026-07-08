"use client";

/**
 * Signal Clusters — signals grouped by shared underlying logic, never by
 * topic. Validity is computed live against the cluster thresholds
 * (8 signals, 3 independent sources, 2 sectors, 2 actor types, 1
 * contradiction, plus score minimums); the stored status is never trusted
 * on its own.
 *
 * Two registers. The simple view keeps the calm list rows: one primary
 * line, one plain-language status line. The advanced view renders the
 * clusters as a grid of quiet map tiles — name, unifying question, a live
 * evidence line (signals · sources · sectors), computed validity in plain
 * words, and the linked tension when one exists. Valid maps sort first,
 * then by evidence weight.
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
import { validateCluster, type ValidationResult } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type { Cluster, Contradiction, Sector, Signal } from "@/lib/types";
import { SECTOR_LABELS } from "@/lib/types";
import {
  btnPrimary,
  countInWords,
  deriveClusterFacts,
  shortClusterStatus,
  signalsOfCluster,
  type DerivedClusterFacts,
} from "./cluster-ui";

type StatusFilter = "all" | "valid" | "candidate";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "valid", label: "Valid" },
  { value: "candidate", label: "Candidates" },
];

interface ClusterRowData {
  cluster: Cluster;
  result: ValidationResult;
  linked: Signal[];
  facts: DerivedClusterFacts;
  sourceCount: number;
  tension: string | null;
}

function ClustersHeader() {
  return (
    <PageHeader
      title="Cluster Maps"
      description={DEFINITIONS.cluster}
      actions={
        <Link href="/clusters/new" className={btnPrimary}>
          Create cluster candidate
        </Link>
      }
    />
  );
}

/** Simple view — unchanged calm list row: one primary line, one status line. */
function ClusterRow({
  cluster,
  result,
  linked,
}: {
  cluster: Cluster;
  result: ValidationResult;
  linked: Signal[];
}) {
  return (
    <Link href={`/clusters/${cluster.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {cluster.name}
        </p>
        {result.valid ? (
          <span className="shrink-0">
            <Pill
              tone="accent"
              title={`${result.passedCount} of ${result.totalCount} validation checks passed`}
            >
              Valid cluster
            </Pill>
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[12px] text-ink-faint">
        {shortClusterStatus(result)} Groups {countInWords(linked.length)} signal
        {linked.length === 1 ? "" : "s"}.
      </p>
    </Link>
  );
}

/**
 * Advanced view — one cluster-map tile. Quiet by design: no shadows, no
 * colour flood; accent appears only on the two words a cluster has earned.
 * All figures are computed live from resolved members, never stored counts.
 */
function ClusterMapCard({ row }: { row: ClusterRowData }) {
  const { cluster, result, linked, facts, sourceCount, tension } = row;
  return (
    <Link
      href={`/clusters/${cluster.id}`}
      className="card group flex flex-col p-5 transition-colors hover:border-line-strong"
    >
      <p className="text-[14px] font-medium leading-snug text-ink group-hover:text-accent-ink">
        {cluster.name}
      </p>
      {cluster.unifyingQuestion.trim() ? (
        <p className="mt-1.5 line-clamp-2 text-[12px] italic leading-relaxed text-ink-faint">
          {cluster.unifyingQuestion}
        </p>
      ) : null}
      <div className="mt-auto pt-4">
        <p className="font-mono text-[11px] text-ink-faint">
          {linked.length} signal{linked.length === 1 ? "" : "s"} · {sourceCount}{" "}
          source{sourceCount === 1 ? "" : "s"} · {facts.sectors.length} sector
          {facts.sectors.length === 1 ? "" : "s"}
        </p>
        <p className="mt-1.5 text-[12px]">
          {result.valid ? (
            <span className="font-medium text-accent-ink">Valid cluster</span>
          ) : (
            <span className="text-ink-faint">
              Candidate — passes {result.passedCount} of {result.totalCount}{" "}
              checks
            </span>
          )}
        </p>
        {tension ? (
          <p className="mt-1 truncate text-[12px] text-ink-faint">
            Tension: {tension}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function ClustersPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const clusters = useIntelligenceStore((s) => s.clusters);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const rows: ClusterRowData[] = useMemo(
    () =>
      [...clusters]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((cluster) => {
          const result = validateCluster(cluster, signals, sources);
          const linked = signalsOfCluster(cluster, signals);
          const facts = deriveClusterFacts(linked);
          const memberSourceIds = new Set(linked.flatMap((s) => s.sourceIds));
          const sourceCount = sources.filter((src) =>
            memberSourceIds.has(src.id),
          ).length;
          const tension =
            cluster.contradictionIds
              .map((cid) => contradictions.find((c) => c.id === cid))
              .find((c): c is Contradiction => Boolean(c))?.name ?? null;
          return { cluster, result, linked, facts, sourceCount, tension };
        }),
    [clusters, signals, sources, contradictions],
  );

  if (!hydrated) {
    return (
      <>
        <ClustersHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const sectorsPresent = [...new Set(rows.flatMap((r) => r.facts.sectors))];

  // The sector filter is an Analyst-view control — it never silently narrows
  // the list while the control itself is hidden in the simple view.
  const sectorFilterActive = mode !== "simple" && sectorFilter !== "all";

  const q = query.trim().toLowerCase();
  const filtered = rows.filter((r) => {
    if (statusFilter === "valid" && !r.result.valid) return false;
    if (statusFilter === "candidate" && r.result.valid) return false;
    if (sectorFilterActive && !r.facts.sectors.includes(sectorFilter as Sector))
      return false;
    if (
      q &&
      !`${r.cluster.name} ${r.cluster.unifyingQuestion} ${r.cluster.clusterStatement}`
        .toLowerCase()
        .includes(q)
    )
      return false;
    return true;
  });

  // Grid order: earned validity first, then evidence weight (signal count).
  const gridRows = [...filtered].sort((a, b) => {
    if (a.result.valid !== b.result.valid) return a.result.valid ? -1 : 1;
    return b.linked.length - a.linked.length;
  });

  const validCount = rows.filter((r) => r.result.valid).length;
  const advanced = mode !== "simple";

  return (
    <>
      <ClustersHeader />
      <WalkthroughPanel pageId="clusters" />

      {advanced && rows.length > 0 ? (
        <p className="mb-6 text-[12px] text-ink-faint">
          {capitalize(countInWords(rows.length))} map
          {rows.length === 1 ? "" : "s"} drawn from the scan — groups share
          underlying logic, not topic.
        </p>
      ) : null}

      <ControlBar
        more={
          advanced && sectorsPresent.length > 0 ? (
            <ControlSelect
              label="Sector"
              value={sectorFilter}
              onChange={setSectorFilter}
              options={[
                { value: "all", label: "All sectors" },
                ...sectorsPresent.map((s) => ({ value: s, label: SECTOR_LABELS[s] })),
              ]}
            />
          ) : undefined
        }
        right={
          rows.length > 0 ? (
            <span className="text-[12px] text-ink-faint">
              {validCount} of {rows.length} valid
            </span>
          ) : null
        }
      >
        <ControlSearch value={query} onChange={setQuery} placeholder="Search clusters…" />
        <ControlSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          options={STATUS_OPTIONS}
        />
      </ControlBar>

      {rows.length === 0 ? (
        <EmptyState
          message="No valid clusters yet. A cluster requires at least 8 signals, 3 independent sources, 2 sectors, 2 actor types, and at least one contradiction. Start by connecting related signals in the Signal Library."
          actionLabel="Open the Signal Library"
          actionHref="/signals"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          message={`Nothing matches the current filters. Reset the search or status${
            advanced ? " and sector" : ""
          } filters to see all ${countInWords(rows.length)} cluster${
            rows.length === 1 ? "" : "s"
          }, or create a new candidate from related signals.`}
          actionLabel="Create cluster candidate"
          actionHref="/clusters/new"
        />
      ) : advanced ? (
        <section
          aria-label="Cluster maps"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {gridRows.map((r) => (
            <ClusterMapCard key={r.cluster.id} row={r} />
          ))}
        </section>
      ) : (
        <section aria-label="Signal clusters">
          {filtered.map((r) => (
            <ClusterRow
              key={r.cluster.id}
              cluster={r.cluster}
              result={r.result}
              linked={r.linked}
            />
          ))}
        </section>
      )}
    </>
  );
}
