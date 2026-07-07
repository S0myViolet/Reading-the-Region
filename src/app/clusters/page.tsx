"use client";

/**
 * Signal Clusters — signals grouped by shared underlying logic, never by
 * topic. Validity is computed live against the cluster thresholds
 * (8 signals, 3 independent sources, 2 sectors, 2 actor types, 1
 * contradiction, plus score minimums); the stored status is never trusted
 * on its own.
 *
 * Layout has exactly four layers: header, one control bar, the cluster
 * list, and the collapsed page guide. Each row is one primary line (the
 * shared-logic name) and one plain-language status line; accent appears
 * only on clusters that have earned validity.
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
import type { Cluster, Sector, Signal } from "@/lib/types";
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

function ClustersHeader() {
  return (
    <PageHeader
      title="Signal Clusters"
      description={DEFINITIONS.cluster}
      actions={
        <Link href="/clusters/new" className={btnPrimary}>
          Create cluster candidate
        </Link>
      }
    />
  );
}

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

export default function ClustersPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const clusters = useIntelligenceStore((s) => s.clusters);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const rows = useMemo(
    () =>
      [...clusters]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((cluster) => {
          const result = validateCluster(cluster, signals, sources);
          const linked = signalsOfCluster(cluster, signals);
          const facts: DerivedClusterFacts = deriveClusterFacts(linked);
          return { cluster, result, linked, facts };
        }),
    [clusters, signals, sources],
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

  const validCount = rows.filter((r) => r.result.valid).length;

  return (
    <>
      <ClustersHeader />
      <WalkthroughPanel pageId="clusters" />

      <ControlBar
        more={
          mode !== "simple" && sectorsPresent.length > 0 ? (
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
            mode !== "simple" ? " and sector" : ""
          } filters to see all ${countInWords(rows.length)} cluster${
            rows.length === 1 ? "" : "s"
          }, or create a new candidate from related signals.`}
          actionLabel="Create cluster candidate"
          actionHref="/clusters/new"
        />
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
