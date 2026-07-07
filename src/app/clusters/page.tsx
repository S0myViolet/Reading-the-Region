"use client";

/**
 * Signal Clusters — signals grouped by shared underlying logic, never by
 * topic. Validity is computed live against the cluster thresholds
 * (8 signals, 3 independent sources, 2 sectors, 2 actor types, 1
 * contradiction, plus score minimums); the stored status is never trusted
 * on its own.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ConfidenceBadge, IdChip } from "@/components/badges";
import { SectorTags } from "@/components/tags";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateCluster } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type { Cluster } from "@/lib/types";
import {
  BAD_CLUSTER_NAMES,
  ClusterValidityPill,
  GOOD_CLUSTER_NAMES,
  btnPrimary,
  deriveClusterFacts,
  signalsOfCluster,
} from "./cluster-ui";

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

function ClusterCard({ cluster }: { cluster: Cluster }) {
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);

  const result = validateCluster(cluster, signals, sources);
  const linked = signalsOfCluster(cluster, signals);
  const facts = deriveClusterFacts(linked);

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
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <ClusterValidityPill result={result} />
          <span
            className="font-mono text-[11px] text-ink-faint"
            title={`${result.passedCount} of ${result.totalCount} validation checks passed`}
          >
            {result.passedCount}/{result.totalCount} checks
          </span>
        </div>
      </div>

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
    </article>
  );
}

export default function ClustersPage() {
  const hydrated = useHydrated();
  const clusters = useIntelligenceStore((s) => s.clusters);

  if (!hydrated) {
    return (
      <>
        <ClustersHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const ordered = [...clusters].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  return (
    <>
      <ClustersHeader />
      <WalkthroughPanel pageId="clusters" />
      <NamingDisciplineCard />

      {ordered.length === 0 ? (
        <EmptyState
          message="No valid clusters yet. A cluster requires at least 8 signals, 3 independent sources, 2 sectors, 2 actor types, and at least one contradiction. Start by connecting related signals in the Signal Library."
          actionLabel="Open the Signal Library"
          actionHref="/signals"
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((c) => (
            <ClusterCard key={c.id} cluster={c} />
          ))}
        </div>
      )}
    </>
  );
}
