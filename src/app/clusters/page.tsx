"use client";

/**
 * Signal Clusters — signals grouped by shared underlying logic, never by
 * topic. Validity is computed live against the cluster thresholds
 * (8 signals, 3 independent sources, 2 sectors, 2 actor types, 1
 * contradiction, plus score minimums); the stored status is never trusted
 * on its own.
 *
 * Visibility layers: the simple view keeps each card to the name, unifying
 * question, a one-sentence status and the signal count in words. Check
 * counts, confidence, contradiction counts and sector readouts open in
 * Analyst view, along with the fuller filters.
 */

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ConfidenceBadge, IdChip } from "@/components/badges";
import { SectorTags } from "@/components/tags";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateCluster, type ValidationResult } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type { Cluster, Sector, Signal } from "@/lib/types";
import { SECTOR_LABELS } from "@/lib/types";
import {
  BAD_CLUSTER_NAMES,
  ClusterValidityPill,
  GOOD_CLUSTER_NAMES,
  btnPrimary,
  countInWords,
  deriveClusterFacts,
  shortClusterStatus,
  signalsOfCluster,
  type DerivedClusterFacts,
} from "./cluster-ui";

type StatusFilter = "all" | "valid" | "candidate";

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All",
  valid: "Valid",
  candidate: "Candidates",
};

function ClustersHeader() {
  return (
    <PageHeader
      overline="Connect & Synthesize"
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

function NamingDisciplineCard() {
  return (
    <section className="card mb-5">
      <header className="border-b border-line px-4 py-2.5">
        <h2 className="overline-label">Naming discipline — logic, not topic</h2>
      </header>
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3">
          <p className="overline-label mb-1.5 text-tension">Topics, not clusters</p>
          <ul className="space-y-1">
            {BAD_CLUSTER_NAMES.map((n) => (
              <li key={n} className="text-[13px] text-ink-faint line-through">
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11.5px] text-ink-faint">
            A topic word groups by surface subject. It carries no claim, so it can
            never be tested against evidence.
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="overline-label mb-1.5 text-accent-ink">
            Shared logic, stated as a sentence
          </p>
          <ul className="space-y-1.5">
            {GOOD_CLUSTER_NAMES.map((n) => (
              <li key={n} className="text-[12.5px] leading-snug text-ink-soft">
                {n}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11.5px] text-ink-faint">
            A logic statement names the underlying movement the signals share — it
            can be questioned, contradicted, and validated.
          </p>
        </div>
      </div>
    </section>
  );
}

function ClusterCard({
  cluster,
  result,
  linked,
  facts,
}: {
  cluster: Cluster;
  result: ValidationResult;
  linked: Signal[];
  facts: DerivedClusterFacts;
}) {
  return (
    <article className="card px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-2xl">
          <p className="overline-label mb-0.5">
            Cluster · <IdChip id={cluster.id} />
          </p>
          <h3 className="font-display text-[17px] leading-snug text-ink">
            <Link
              href={`/clusters/${cluster.id}`}
              className="hover:text-accent-ink hover:underline"
            >
              {cluster.name}
            </Link>
          </h3>
          <p className="mt-1 text-[12.5px] italic text-ink-soft">
            {cluster.unifyingQuestion}
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
            {shortClusterStatus(result)} Groups {countInWords(linked.length)} signal
            {linked.length === 1 ? "" : "s"}.
          </p>
        </div>
        <ViewGate min="analyst">
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <ClusterValidityPill result={result} />
            <span
              className="font-mono text-[11px] text-ink-faint"
              title={`${result.passedCount} of ${result.totalCount} validation checks passed`}
            >
              {result.passedCount}/{result.totalCount} checks
            </span>
          </div>
        </ViewGate>
      </div>

      <ViewGate min="analyst">
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-2.5">
          <span className="font-mono text-[11.5px] text-ink-soft">
            {linked.length} signal{linked.length === 1 ? "" : "s"}
          </span>
          <span className="font-mono text-[11.5px] text-ink-soft">
            {cluster.contradictionIds.length} contradiction
            {cluster.contradictionIds.length === 1 ? "" : "s"}
          </span>
          <ConfidenceBadge level={cluster.confidence} />
          {facts.sectors.length > 0 ? (
            <SectorTags sectors={facts.sectors} />
          ) : (
            <span className="text-[11px] text-ink-faint">
              No sectors yet — link signals to derive them
            </span>
          )}
        </div>
      </ViewGate>
    </article>
  );
}

export default function ClustersPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const clusters = useIntelligenceStore((s) => s.clusters);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  if (!hydrated) {
    return (
      <>
        <ClustersHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const rows = [...clusters]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((cluster) => {
      const result = validateCluster(cluster, signals, sources);
      const linked = signalsOfCluster(cluster, signals);
      const facts = deriveClusterFacts(linked);
      return { cluster, result, linked, facts };
    });

  const sectorsPresent = [...new Set(rows.flatMap((r) => r.facts.sectors))];

  // The sector filter is an Analyst-view control — it never silently narrows
  // the list while the control itself is hidden in the simple view.
  const sectorFilterActive = mode !== "simple" && sectorFilter !== "all";

  const filtered = rows.filter((r) => {
    if (statusFilter === "valid" && !r.result.valid) return false;
    if (statusFilter === "candidate" && r.result.valid) return false;
    if (sectorFilterActive && !r.facts.sectors.includes(sectorFilter as Sector))
      return false;
    return true;
  });

  return (
    <>
      <ClustersHeader />
      <WalkthroughPanel pageId="clusters" />
      <NamingDisciplineCard />

      {rows.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="overline-label">Status</span>
            <div
              role="radiogroup"
              aria-label="Filter clusters by status"
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
              <span className="overline-label">Sector</span>
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="border border-line bg-surface px-2 py-1 text-[12px] text-ink rounded-[2px] focus:border-accent focus:outline-none"
              >
                <option value="all">All sectors</option>
                {sectorsPresent.map((s) => (
                  <option key={s} value={s}>
                    {SECTOR_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </ViewGate>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="mb-3">
          <DepthHint>
            Validation check counts, confidence, contradictions and sector detail
          </DepthHint>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          message="No valid clusters yet. A cluster requires at least 8 signals, 3 independent sources, 2 sectors, 2 actor types, and at least one contradiction. Start by connecting related signals in the Signal Library."
          actionLabel="Open the Signal Library"
          actionHref="/signals"
        />
      ) : filtered.length === 0 ? (
        <p className="text-[12px] text-ink-faint">
          No clusters match the current filters. Reset the status
          {mode !== "simple" ? " or sector" : ""} filter to see all{" "}
          {countInWords(rows.length)} cluster{rows.length === 1 ? "" : "s"}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ClusterCard
              key={r.cluster.id}
              cluster={r.cluster}
              result={r.result}
              linked={r.linked}
              facts={r.facts}
            />
          ))}
        </div>
      )}
    </>
  );
}
