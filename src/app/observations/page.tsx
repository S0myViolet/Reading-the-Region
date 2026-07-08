"use client";

/**
 * Observation Library — every raw observation the system has captured,
 * regardless of triage outcome: unreviewed, promoted, archived as noise,
 * held for evidence, duplicate, split, or merged. The Scan Inbox is the
 * triage queue; this is the historical record beneath the signal base,
 * kept so every filtering decision stays auditable.
 *
 * Advanced-register reference page: it renders the same comparison table
 * in every mode and does not appear in the simple navigation.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import {
  ControlBar,
  ControlSearch,
  ControlSelect,
} from "@/components/ControlBar";
import { DemoTag, IdChip, SourceCredibilityBadge } from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import type { Observation, ObservationStatus, Signal, Source } from "@/lib/types";
import { OBSERVATION_STATUS_LABELS } from "@/lib/types";
import { ObservationStatusPill, fmtDate } from "../inbox/observation-ui";

type StatusFilter = "all" | ObservationStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  ...(Object.entries(OBSERVATION_STATUS_LABELS) as Array<[ObservationStatus, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
];

/** First words of a triage rationale — enough to recall the decision. */
function firstWords(text: string, count = 9): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= count) return text.trim();
  return `${words.slice(0, count).join(" ")}…`;
}

function LibraryHeader() {
  return (
    <PageHeader
      title="Observation Library"
      description="Every raw observation the system has captured — the historical record beneath the signal base."
    />
  );
}

function OutcomeCell({
  obs,
  signal,
}: {
  obs: Observation;
  signal: Signal | null;
}) {
  if (obs.status === "promoted" && obs.promotedSignalId) {
    return (
      <Link
        href={`/signals/${obs.promotedSignalId}`}
        className="text-[12px] text-accent-ink hover:underline"
      >
        {signal?.title ?? "Promoted signal"}{" "}
        <span className="font-mono text-[10.5px]">{obs.promotedSignalId}</span>
      </Link>
    );
  }
  if (obs.status === "unreviewed") {
    return <span className="text-[11.5px] text-ink-faint">Awaiting triage in the inbox</span>;
  }
  if (obs.triageRationale) {
    return (
      <span className="text-[11.5px] text-ink-faint" title={obs.triageRationale}>
        {firstWords(obs.triageRationale)}
      </span>
    );
  }
  return <span className="text-[11.5px] text-ink-faint">No rationale recorded</span>;
}

function ObservationTableRow({
  obs,
  source,
  signal,
}: {
  obs: Observation;
  source: Source | null;
  signal: Signal | null;
}) {
  return (
    <tr>
      <td>
        <Link
          href={`/inbox/${obs.id}`}
          className="text-[13px] font-medium text-ink hover:text-accent-ink hover:underline"
        >
          {obs.title}
        </Link>
        <p className="mt-0.5">
          <IdChip id={obs.id} />
        </p>
      </td>
      <td>
        <div className="flex flex-wrap items-center gap-1.5">
          {source ? (
            <Link
              href={`/sources/${source.id}`}
              className="text-[12.5px] text-ink-soft hover:text-accent-ink hover:underline"
            >
              {source.name}
            </Link>
          ) : (
            <span className="text-[12.5px] text-ink-soft">{obs.sourceName}</span>
          )}
          {source ? <SourceCredibilityBadge score={source.credibility} /> : null}
          {source?.isDemo ? <DemoTag /> : null}
        </div>
        {!source ? (
          <p className="mt-0.5 text-[10.5px] text-ink-faint">quick capture</p>
        ) : null}
      </td>
      <td className="whitespace-nowrap text-[12.5px] text-ink-soft">
        {fmtDate(obs.dateObserved)}
      </td>
      <td className="text-[12.5px] text-ink-soft">
        {obs.country}
        {obs.city ? ` · ${obs.city}` : ""}
      </td>
      <td>
        <ObservationStatusPill status={obs.status} />
      </td>
      <td>
        <OutcomeCell obs={obs} signal={signal} />
      </td>
    </tr>
  );
}

export default function ObservationLibraryPage() {
  const hydrated = useHydrated();
  const observations = useIntelligenceStore((s) => s.observations);
  const sources = useIntelligenceStore((s) => s.sources);
  const signals = useIntelligenceStore((s) => s.signals);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const sourceOptions = useMemo(() => {
    const names = [...new Set(observations.map((o) => o.sourceName))].sort();
    return [
      { value: "all", label: "All sources" },
      ...names.map((n) => ({ value: n, label: n })),
    ];
  }, [observations]);

  const sourceById = useMemo(
    () => new Map(sources.map((s) => [s.id, s])),
    [sources],
  );
  const signalById = useMemo(
    () => new Map(signals.map((s) => [s.id, s])),
    [signals],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return observations
      .filter((o) => {
        if (status !== "all" && o.status !== status) return false;
        if (sourceFilter !== "all" && o.sourceName !== sourceFilter) return false;
        if (q && !`${o.title} ${o.description}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.dateObserved.localeCompare(a.dateObserved));
  }, [observations, status, sourceFilter, query]);

  if (!hydrated) {
    return (
      <>
        <LibraryHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  return (
    <>
      <LibraryHeader />

      <ControlBar
        right={
          <span className="text-[12px] text-ink-faint">
            {rows.length} of {observations.length} observation
            {observations.length === 1 ? "" : "s"}
          </span>
        }
      >
        <ControlSearch
          value={query}
          onChange={setQuery}
          placeholder="Search observations…"
        />
        <ControlSelect
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as StatusFilter)}
          options={STATUS_OPTIONS}
        />
        <ControlSelect
          label="Source"
          value={sourceFilter}
          onChange={setSourceFilter}
          options={sourceOptions}
        />
      </ControlBar>

      {observations.length === 0 ? (
        <EmptyState
          message="The Observation Library is empty. Every observation captured in the Scan Inbox is recorded here permanently — promoted, archived as noise, or held for evidence — so triage decisions stay auditable. Capture the first raw observation to start the record."
          actionLabel="Add observation"
          actionHref="/inbox/new"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          message="No observations match the current filters. The library keeps every observation regardless of triage outcome — clear the search, status, or source filter to see the full historical record."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Observation</th>
                <th>Source</th>
                <th>Observed</th>
                <th>Geography</th>
                <th>Status</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <ObservationTableRow
                  key={o.id}
                  obs={o}
                  source={o.sourceId ? sourceById.get(o.sourceId) ?? null : null}
                  signal={
                    o.promotedSignalId
                      ? signalById.get(o.promotedSignalId) ?? null
                      : null
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-[11.5px] text-ink-faint">
        Triage happens in the{" "}
        <Link
          href="/inbox"
          className="underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
        >
          Scan Inbox
        </Link>
        ; the library never loses a record, whatever the outcome.
      </p>
    </>
  );
}
