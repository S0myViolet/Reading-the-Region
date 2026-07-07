"use client";

/**
 * Scan Inbox — where raw observations enter before becoming signals.
 * An observation is not a signal: it earns promotion only through the
 * promotion checklist (minimum 3 of 9 criteria).
 *
 * Layout has exactly four layers: header, one control bar, the observation
 * list, and the collapsed page guide. The list is the visual focus.
 */

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import {
  ControlBar,
  ControlSearch,
  ControlSelect,
} from "@/components/ControlBar";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { promotionCriteriaMet } from "@/lib/validation";
import type { Observation, ObservationStatus } from "@/lib/types";
import {
  OBSERVATION_STATUS_LABELS,
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
} from "@/lib/types";
import { ObservationStatusPill, btnPrimary, fmtDate } from "./observation-ui";

type FilterKey =
  | "all"
  | "unreviewed"
  | "promoted"
  | "archived_noise"
  | "needs_more_evidence"
  | "duplicate";

const STATUS_OPTIONS: Array<{ value: FilterKey; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "unreviewed", label: OBSERVATION_STATUS_LABELS.unreviewed },
  { value: "promoted", label: OBSERVATION_STATUS_LABELS.promoted },
  { value: "archived_noise", label: OBSERVATION_STATUS_LABELS.archived_noise },
  { value: "needs_more_evidence", label: OBSERVATION_STATUS_LABELS.needs_more_evidence },
  { value: "duplicate", label: OBSERVATION_STATUS_LABELS.duplicate },
];

type SortKey = "newest" | "oldest" | "readiness";

function isFilterKey(v: string | null): v is FilterKey {
  return STATUS_OPTIONS.some((f) => f.value === v);
}

function InboxHeader() {
  return (
    <PageHeader
      title="Scan Inbox"
      description="Review raw observations before promoting them into signals."
      actions={
        <Link href="/inbox/new" className={btnPrimary}>
          Add observation
        </Link>
      }
    />
  );
}

function ObservationRow({ obs }: { obs: Observation }) {
  const met = promotionCriteriaMet(obs);
  const ready = met >= PROMOTION_MIN_CRITERIA;

  return (
    <Link href={`/inbox/${obs.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {obs.title}
        </p>
        <span className="flex shrink-0 items-baseline gap-4">
          <span
            className={`text-[11.5px] ${ready ? "text-accent-ink" : "text-ink-faint"}`}
            title={`${met} of ${PROMOTION_CRITERIA.length} promotion criteria met — minimum ${PROMOTION_MIN_CRITERIA} to promote`}
          >
            {met}/{PROMOTION_CRITERIA.length}
          </span>
          <ObservationStatusPill status={obs.status} />
        </span>
      </div>
      <p className="mt-1 text-[12px] text-ink-faint">
        {obs.sourceName} · {fmtDate(obs.dateObserved)}
        {obs.status === "promoted" && obs.promotedSignalId ? (
          <span className="text-accent-ink"> · promoted to {obs.promotedSignalId}</span>
        ) : null}
      </p>
    </Link>
  );
}

function InboxContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const observations = useIntelligenceStore((s) => s.observations);

  const statusParam = searchParams.get("status");
  const [status, setStatus] = useState<FilterKey>(
    isFilterKey(statusParam) ? statusParam : "all",
  );
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const sourceOptions = useMemo(() => {
    const names = [...new Set(observations.map((o) => o.sourceName))].sort();
    return [
      { value: "all", label: "All sources" },
      ...names.map((n) => ({ value: n, label: n })),
    ];
  }, [observations]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = observations.filter((o) => {
      if (status !== "all" && o.status !== (status as ObservationStatus)) return false;
      if (sourceFilter !== "all" && o.sourceName !== sourceFilter) return false;
      if (q && !`${o.title} ${o.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "oldest") return a.dateObserved.localeCompare(b.dateObserved);
      if (sort === "readiness") return promotionCriteriaMet(b) - promotionCriteriaMet(a);
      return b.dateObserved.localeCompare(a.dateObserved);
    });
  }, [observations, status, sourceFilter, query, sort]);

  if (!hydrated) {
    return (
      <>
        <InboxHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const unreviewed = observations.filter((o) => o.status === "unreviewed").length;

  return (
    <>
      <InboxHeader />
      <WalkthroughPanel pageId="inbox" />

      <ControlBar
        right={
          unreviewed > 0 ? (
            <span className="text-[12px] text-ink-faint">
              {unreviewed} awaiting review
            </span>
          ) : null
        }
      >
        <ControlSearch value={query} onChange={setQuery} placeholder="Search observations…" />
        <ControlSelect
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as FilterKey)}
          options={STATUS_OPTIONS}
        />
        <ControlSelect
          label="Source"
          value={sourceFilter}
          onChange={setSourceFilter}
          options={sourceOptions}
        />
        <ControlSelect
          label="Sort"
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "readiness", label: "Closest to promotion" },
          ]}
        />
      </ControlBar>

      {observations.length === 0 ? (
        <EmptyState
          message="The Scan Inbox is empty. Scanning starts here: capture raw material — an article, a policy change, a launch, an observed behaviour — before judging it. An observation is not yet a signal; it is promoted only after passing at least 3 of the 9 promotion criteria in triage."
          actionLabel="Add observation"
          actionHref="/inbox/new"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          message="Nothing matches the current filters. Statuses are triage decisions made on each observation's detail page — review unreviewed observations, or capture new raw material from scanning."
          actionLabel="Add observation"
          actionHref="/inbox/new"
        />
      ) : (
        <section aria-label="Observations">
          {rows.map((o) => (
            <ObservationRow key={o.id} obs={o} />
          ))}
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
