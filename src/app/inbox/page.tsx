"use client";

/**
 * Scan Inbox — where raw observations enter before becoming signals.
 * An observation is not a signal: it earns promotion only through the
 * promotion checklist (minimum 3 of 9 criteria).
 */

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { IdChip, SourceCredibilityBadge } from "@/components/badges";
import { SectorTags } from "@/components/tags";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { promotionCriteriaMet } from "@/lib/validation";
import type { Observation, ObservationStatus } from "@/lib/types";
import {
  OBSERVATION_STATUS_LABELS,
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";
import { ObservationStatusPill, btnPrimary, fmtDate } from "./observation-ui";

type FilterKey =
  | "all"
  | "unreviewed"
  | "promoted"
  | "archived_noise"
  | "needs_more_evidence"
  | "duplicate";

const STATUS_FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "unreviewed", label: OBSERVATION_STATUS_LABELS.unreviewed },
  { key: "promoted", label: OBSERVATION_STATUS_LABELS.promoted },
  { key: "archived_noise", label: OBSERVATION_STATUS_LABELS.archived_noise },
  { key: "needs_more_evidence", label: OBSERVATION_STATUS_LABELS.needs_more_evidence },
  { key: "duplicate", label: OBSERVATION_STATUS_LABELS.duplicate },
];

function isFilterKey(v: string | null): v is FilterKey {
  return STATUS_FILTERS.some((f) => f.key === v);
}

function InboxHeader() {
  return (
    <PageHeader
      overline="Scan & Classify"
      title="Scan Inbox"
      description="Raw observations captured during scanning. Nothing here is a signal yet — each observation is triaged and promoted only if it passes at least 3 of 9 promotion criteria."
      actions={
        <Link href="/inbox/new" className={btnPrimary}>
          Add observation
        </Link>
      }
    />
  );
}

function ObservationRow({ obs }: { obs: Observation }) {
  const sources = useIntelligenceStore((s) => s.sources);
  const source = obs.sourceId
    ? sources.find((s) => s.id === obs.sourceId) ?? null
    : null;
  const met = promotionCriteriaMet(obs);
  const total = PROMOTION_CRITERIA.length;

  return (
    <tr>
      <td>
        <Link
          href={`/inbox/${obs.id}`}
          className="text-[13px] font-medium text-ink hover:text-accent-ink hover:underline"
        >
          {obs.title}
        </Link>
        <div className="mt-0.5">
          <IdChip id={obs.id} />
        </div>
      </td>
      <td>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[12.5px] text-ink-soft">{obs.sourceName}</span>
          {source ? <SourceCredibilityBadge score={source.credibility} /> : null}
        </div>
        <p className="mt-0.5 text-[11px] text-ink-faint">
          {SOURCE_TYPE_LABELS[obs.sourceType]}
        </p>
      </td>
      <td className="whitespace-nowrap text-[12.5px] text-ink-soft">
        {fmtDate(obs.dateObserved)}
      </td>
      <td className="text-[12.5px] text-ink-soft">
        {obs.country}
        {obs.city ? <span className="text-ink-faint"> · {obs.city}</span> : null}
      </td>
      <td>
        {obs.sectors.length > 0 ? (
          <SectorTags sectors={obs.sectors} />
        ) : (
          <span className="text-[11px] text-ink-faint">Unclassified</span>
        )}
      </td>
      <td>
        <span
          className={`font-mono text-[11.5px] whitespace-nowrap ${
            met >= PROMOTION_MIN_CRITERIA ? "text-accent-ink" : "text-ink-faint"
          }`}
          title={`${met} of ${total} promotion criteria met — minimum ${PROMOTION_MIN_CRITERIA} to promote`}
        >
          {met}/{total} criteria
        </span>
      </td>
      <td>
        <ObservationStatusPill status={obs.status} />
        {obs.status === "promoted" && obs.promotedSignalId ? (
          <Link
            href={`/signals/${obs.promotedSignalId}`}
            className="mt-1 block text-[10.5px] text-accent-ink hover:underline"
          >
            Signal · <span className="font-mono">{obs.promotedSignalId}</span>
          </Link>
        ) : null}
      </td>
    </tr>
  );
}

function InboxContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const observations = useIntelligenceStore((s) => s.observations);

  if (!hydrated) {
    return (
      <>
        <InboxHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const statusParam = searchParams.get("status");
  const active: FilterKey = isFilterKey(statusParam) ? statusParam : "all";

  const countFor = (key: FilterKey) =>
    key === "all"
      ? observations.length
      : observations.filter((o) => o.status === key).length;

  const filtered =
    active === "all"
      ? observations
      : observations.filter((o) => o.status === (active as ObservationStatus));
  const rows = [...filtered].sort((a, b) =>
    b.dateObserved.localeCompare(a.dateObserved),
  );

  return (
    <>
      <InboxHeader />
      <WalkthroughPanel pageId="inbox" />

      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/inbox" : `/inbox?status=${f.key}`}
            className={`border px-2.5 py-1 text-[11.5px] rounded-[2px] ${
              active === f.key
                ? "border-accent bg-accent-soft font-medium text-accent-ink"
                : "border-line bg-surface text-ink-soft hover:border-line-strong"
            }`}
          >
            {f.label}{" "}
            <span className="font-mono text-[10.5px] text-ink-faint">
              {countFor(f.key)}
            </span>
          </Link>
        ))}
      </nav>

      {observations.length === 0 ? (
        <EmptyState
          message="The Scan Inbox is empty. Scanning starts here: capture raw material — an article, a policy change, a launch, an observed behaviour — before judging it. An observation is not yet a signal; it is promoted only after passing at least 3 of the 9 promotion criteria in triage."
          actionLabel="Add observation"
          actionHref="/inbox/new"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          message={`No observations currently carry the status “${
            active === "all" ? "All" : OBSERVATION_STATUS_LABELS[active as ObservationStatus]
          }”. Statuses are triage decisions made on each observation's detail page — review unreviewed observations, or capture new raw material from scanning.`}
          actionLabel="Add observation"
          actionHref="/inbox/new"
        />
      ) : (
        <section className="card">
          <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="overline-label">
              {rows.length} observation{rows.length === 1 ? "" : "s"}
            </h2>
            <p className="text-[11px] text-ink-faint">
              Promotion requires at least {PROMOTION_MIN_CRITERIA} of{" "}
              {PROMOTION_CRITERIA.length} criteria
            </p>
          </header>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Observation</th>
                  <th>Source</th>
                  <th>Observed</th>
                  <th>Geography</th>
                  <th>Sectors</th>
                  <th>Promotion</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <ObservationRow key={o.id} obs={o} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <>
          <InboxHeader />
          <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
        </>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
