"use client";

/**
 * Scan Inbox — the evidence triage desk. The page answers one question for
 * each raw item: is this noise, an observation, a signal candidate, or a
 * valid signal? An observation is not a signal: it earns promotion only
 * through the promotion checklist (minimum 3 of 9 criteria), and it carries
 * no numeric scores — scoring happens at signal promotion.
 *
 * Layout has exactly four layers: header, one control bar, the observation
 * list, and the collapsed page guide. The list is the visual focus. Advanced
 * mode adds the triage read per row (suggested stage, one short source
 * quality note, checklist count); the simple rendering stays minimal — the
 * simple product covers this queue at /finds.
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
import { SourceCredibilityBadge } from "@/components/badges";
import { useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { promotionCriteriaMet } from "@/lib/validation";
import {
  suggestedStage,
  TRIAGE_LABELS,
  type TriageSuggestion,
} from "@/lib/pipeline";
import type { BiasTag, Observation, ObservationStatus, Source } from "@/lib/types";
import {
  BIAS_TAG_LABELS,
  OBSERVATION_STATUS_LABELS,
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
  SECTOR_LABELS,
} from "@/lib/types";
import {
  ObservationStatusPill,
  TriageSuggestionChip,
  btnPrimary,
  fmtDate,
} from "./observation-ui";

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

type TriageFilterKey = "all" | TriageSuggestion;

const TRIAGE_FILTER_OPTIONS: Array<{ value: TriageFilterKey; label: string }> = [
  { value: "all", label: "All suggestions" },
  { value: "signal_candidate", label: TRIAGE_LABELS.signal_candidate },
  { value: "observation", label: TRIAGE_LABELS.observation },
  { value: "noise", label: TRIAGE_LABELS.noise },
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

/** Bias label for mid-sentence use — acronyms and proper nouns keep their capital. */
function biasWords(tag: BiasTag): string {
  const label = BIAS_TAG_LABELS[tag];
  if (/^(?:[A-Z]{2}|Gulf|Western|Anti)/.test(label)) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/**
 * One short source-quality note per row. The credibility chip carries the
 * level, so the note carries only the caveat: the first bias tag to watch
 * for, or a quiet all-clear.
 */
function sourceQualityNote(source: Source | null): string {
  if (!source) return "Quick capture — source not yet assessed.";
  if (source.biasTags.length > 0) return `Watch for ${biasWords(source.biasTags[0])}.`;
  return "Solid for its type.";
}

function ObservationRow({
  obs,
  source,
  advanced,
}: {
  obs: Observation;
  source: Source | null;
  advanced: boolean;
}) {
  const met = promotionCriteriaMet(obs);
  const total = PROMOTION_CRITERIA.length;
  const ready = met >= PROMOTION_MIN_CRITERIA;

  const metaParts = [obs.sourceName, fmtDate(obs.dateObserved)];
  if (advanced) {
    metaParts.push(obs.city ? `${obs.country}, ${obs.city}` : obs.country);
    if (obs.sectors.length > 0) {
      metaParts.push(
        obs.sectors
          .slice(0, 2)
          .map((s) => SECTOR_LABELS[s])
          .join(", "),
      );
    }
  }

  return (
    <Link href={`/inbox/${obs.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {obs.title}
        </p>
        <span className="flex shrink-0 items-baseline gap-2.5">
          {advanced ? <TriageSuggestionChip suggestion={suggestedStage(obs)} /> : null}
          <ObservationStatusPill status={obs.status} />
        </span>
      </div>
      <p className="mt-1 text-[12px] text-ink-faint">
        {metaParts.join(" · ")}
        {obs.status === "promoted" && obs.promotedSignalId ? (
          <span className="text-accent-ink"> · promoted to {obs.promotedSignalId}</span>
        ) : null}
      </p>
      {advanced ? (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-faint">
          {source ? <SourceCredibilityBadge score={source.credibility} /> : null}
          <span>{sourceQualityNote(source)}</span>
          <span
            className={`ml-auto font-mono ${ready ? "text-accent-ink" : ""}`}
            title={`Minimum ${PROMOTION_MIN_CRITERIA} of ${total} promotion criteria to promote — the checklist is the promotion basis; numeric scoring happens at signal promotion`}
          >
            meets {met} of {total} criteria
          </span>
        </p>
      ) : null}
    </Link>
  );
}

function InboxContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const mode = useViewMode();
  const advanced = mode !== "simple";
  const observations = useIntelligenceStore((s) => s.observations);
  const sources = useIntelligenceStore((s) => s.sources);

  const statusParam = searchParams.get("status");
  const [status, setStatus] = useState<FilterKey>(
    isFilterKey(statusParam) ? statusParam : "all",
  );
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [triageFilter, setTriageFilter] = useState<TriageFilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");

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

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = observations.filter((o) => {
      if (status !== "all" && o.status !== (status as ObservationStatus)) return false;
      if (sourceFilter !== "all" && o.sourceName !== sourceFilter) return false;
      if (triageFilter !== "all" && suggestedStage(o) !== triageFilter) return false;
      if (q && !`${o.title} ${o.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "oldest") return a.dateObserved.localeCompare(b.dateObserved);
      if (sort === "readiness") return promotionCriteriaMet(b) - promotionCriteriaMet(a);
      return b.dateObserved.localeCompare(a.dateObserved);
    });
  }, [observations, status, sourceFilter, triageFilter, query, sort]);

  if (!hydrated) {
    return (
      <>
        <InboxHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const unreviewed = observations.filter((o) => o.status === "unreviewed").length;

  const sourceSelect = (
    <ControlSelect
      label="Source"
      value={sourceFilter}
      onChange={setSourceFilter}
      options={sourceOptions}
    />
  );

  return (
    <>
      <InboxHeader />
      {advanced ? (
        <p className="-mt-4 mb-6 text-[12.5px] text-ink-faint">
          Is this noise, an observation, a signal candidate, or a valid signal?
        </p>
      ) : null}
      <WalkthroughPanel pageId="inbox" />

      <ControlBar
        right={
          unreviewed > 0 ? (
            <span className="text-[12px] text-ink-faint">
              {unreviewed} awaiting review
            </span>
          ) : null
        }
        more={advanced ? sourceSelect : undefined}
      >
        <ControlSearch value={query} onChange={setQuery} placeholder="Search observations…" />
        <ControlSelect
          label="Status"
          value={status}
          onChange={(v) => setStatus(v as FilterKey)}
          options={STATUS_OPTIONS}
        />
        {advanced ? (
          <ControlSelect
            label="Suggested stage"
            value={triageFilter}
            onChange={(v) => setTriageFilter(v as TriageFilterKey)}
            options={TRIAGE_FILTER_OPTIONS}
          />
        ) : (
          sourceSelect
        )}
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
          message="Nothing matches the current filters. Statuses are triage decisions made on each observation's detail page, and the suggested stage is the engine's read of the promotion checklist — review unreviewed observations, or capture new raw material from scanning."
          actionLabel="Add observation"
          actionHref="/inbox/new"
        />
      ) : (
        <section aria-label="Observations">
          {rows.map((o) => (
            <ObservationRow
              key={o.id}
              obs={o}
              source={o.sourceId ? sourceById.get(o.sourceId) ?? null : null}
              advanced={advanced}
            />
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
