"use client";

/**
 * Signal Library — the core evidence base of the platform. Every signal is
 * present-day evidence suggesting a future possibility; nothing here is a
 * trend. The library supports dense filtering, card and table views, and
 * cross-links into clusters, contradictions, and the rest of the pipeline.
 */

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import {
  ConfidenceBadge,
  IdChip,
  ReviewStatusBadge,
  SignalStrengthBadge,
} from "@/components/badges";
import { SectorTags } from "@/components/tags";
import { Select, TextInput } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { zoomComplete } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type {
  ActorType,
  ConfidenceLevel,
  ReviewStatus,
  Sector,
  Signal,
  SignalStrength,
  Source,
  SourceType,
  SystemAffected,
  TimeHorizon,
} from "@/lib/types";
import {
  ACTOR_TYPE_LABELS,
  CONFIDENCE_LABELS,
  REVIEW_STATUS_LABELS,
  SECTOR_LABELS,
  SIGNAL_STRENGTH_LABELS,
  SOURCE_TYPE_LABELS,
  SYSTEM_LABELS,
  TIME_HORIZON_LABELS,
  TIME_HORIZON_SHORT,
} from "@/lib/types";
import { ScoreChips, btnPrimary, fmtDate, optionsFrom } from "./signal-ui";

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface Filters {
  country: string;
  city: string;
  sector: "" | Sector;
  sourceType: "" | SourceType;
  minCredibility: number;
  strength: "" | SignalStrength;
  confidence: "" | ConfidenceLevel;
  horizon: "" | TimeHorizon;
  minNovelty: number;
  minMomentum: number;
  minEvidence: number;
  minStrategic: number;
  system: "" | SystemAffected;
  actorType: "" | ActorType;
  review: "" | ReviewStatus;
  tag: string;
  /** Worth attention: novelty ≥ 4 and low confidence. */
  attentionNovelty: boolean;
  /** Signals not yet linked to any cluster. */
  unclustered: boolean;
  /** Signals whose zooming ladder is incomplete. */
  zoomIncomplete: boolean;
}

const DEFAULT_FILTERS: Filters = {
  country: "",
  city: "",
  sector: "",
  sourceType: "",
  minCredibility: 1,
  strength: "",
  confidence: "",
  horizon: "",
  minNovelty: 1,
  minMomentum: 1,
  minEvidence: 1,
  minStrategic: 1,
  system: "",
  actorType: "",
  review: "",
  tag: "",
  attentionNovelty: false,
  unclustered: false,
  zoomIncomplete: false,
};

function isSector(v: string | null): v is Sector {
  return v !== null && v in SECTOR_LABELS;
}

function isReviewStatus(v: string | null): v is ReviewStatus {
  return v !== null && v in REVIEW_STATUS_LABELS;
}

function countActiveFilters(f: Filters): number {
  let n = 0;
  (Object.keys(DEFAULT_FILTERS) as Array<keyof Filters>).forEach((k) => {
    if (f[k] !== DEFAULT_FILTERS[k]) n += 1;
  });
  return n;
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

type SortKey =
  | "novelty"
  | "momentum"
  | "evidence"
  | "strategic"
  | "contradiction"
  | "recent"
  | "oldest"
  | "low_confidence"
  | "needs_review";

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest" },
  { value: "novelty", label: "Highest novelty" },
  { value: "momentum", label: "Highest momentum" },
  { value: "evidence", label: "Highest evidence" },
  { value: "strategic", label: "Highest strategic relevance" },
  { value: "contradiction", label: "Highest contradiction value" },
  { value: "low_confidence", label: "Lowest confidence first" },
  { value: "needs_review", label: "Needs review first" },
];

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = { low: 0, medium: 1, high: 2 };
const NEEDS_REVIEW: ReviewStatus[] = ["needs_human_review", "ai_suggested", "needs_evidence"];

function sortSignals(list: Signal[], key: SortKey): Signal[] {
  const byRecent = (a: Signal, b: Signal) => b.dateObserved.localeCompare(a.dateObserved);
  const sorted = [...list];
  switch (key) {
    case "novelty":
      return sorted.sort((a, b) => b.scores.novelty - a.scores.novelty || byRecent(a, b));
    case "momentum":
      return sorted.sort((a, b) => b.scores.momentum - a.scores.momentum || byRecent(a, b));
    case "evidence":
      return sorted.sort((a, b) => b.scores.evidence - a.scores.evidence || byRecent(a, b));
    case "strategic":
      return sorted.sort(
        (a, b) => b.scores.strategicRelevance - a.scores.strategicRelevance || byRecent(a, b),
      );
    case "contradiction":
      // Tension-rich signals first; signals without any contradiction sort last.
      return sorted.sort(
        (a, b) => b.contradictionIds.length - a.contradictionIds.length || byRecent(a, b),
      );
    case "oldest":
      return sorted.sort((a, b) => a.dateObserved.localeCompare(b.dateObserved));
    case "low_confidence":
      return sorted.sort(
        (a, b) => CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence] || byRecent(a, b),
      );
    case "needs_review":
      return sorted.sort((a, b) => {
        const ra = NEEDS_REVIEW.includes(a.reviewStatus) ? 0 : 1;
        const rb = NEEDS_REVIEW.includes(b.reviewStatus) ? 0 : 1;
        return ra - rb || byRecent(a, b);
      });
    case "recent":
    default:
      return sorted.sort(byRecent);
  }
}

// ---------------------------------------------------------------------------
// Presentation pieces
// ---------------------------------------------------------------------------

function SignalsHeader() {
  return (
    <PageHeader
      overline="Scan & Classify"
      title="Signal Library"
      description={DEFINITIONS.signal}
      actions={
        <Link href="/signals/new" className={btnPrimary}>
          Add signal
        </Link>
      }
    />
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-medium uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </span>
      <span className="mt-0.5 block">{children}</span>
    </label>
  );
}

const MIN_SCORE_CHOICES = [
  { value: 1, label: "Any" },
  { value: 2, label: "2 or more" },
  { value: 3, label: "3 or more" },
  { value: 4, label: "4 or more" },
  { value: 5, label: "5 only" },
];

function MinScoreSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {MIN_SCORE_CHOICES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </Select>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  return (
    <article className="card flex flex-col px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <IdChip id={signal.id} />
        <span className="text-[10.5px] text-ink-faint">{fmtDate(signal.dateObserved)}</span>
      </div>
      <Link
        href={`/signals/${signal.id}`}
        className="mt-1 font-display text-[15px] leading-snug text-ink hover:text-accent-ink hover:underline"
      >
        {signal.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">
        {signal.description}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <SignalStrengthBadge strength={signal.signalStrength} />
        <ConfidenceBadge level={signal.confidence} />
        <ReviewStatusBadge status={signal.reviewStatus} />
        <ScoreChips scores={signal.scores} />
      </div>
      {signal.sectors.length > 0 ? (
        <div className="mt-2">
          <SectorTags sectors={signal.sectors} />
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-2 text-[11px] text-ink-faint">
        <span>
          {signal.country}
          {signal.city ? ` · ${signal.city}` : ""}
        </span>
        <span
          className="font-mono"
          title={TIME_HORIZON_LABELS[signal.timeHorizon]}
        >
          {TIME_HORIZON_SHORT[signal.timeHorizon]}
        </span>
        <span title="Linked clusters and contradictions">
          {signal.clusterIds.length} cluster{signal.clusterIds.length === 1 ? "" : "s"} ·{" "}
          {signal.contradictionIds.length} contradiction
          {signal.contradictionIds.length === 1 ? "" : "s"}
        </span>
      </div>
    </article>
  );
}

function SignalsTable({ signals }: { signals: Signal[] }) {
  return (
    <section className="card">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Signal</th>
              <th>Strength</th>
              <th>Confidence</th>
              <th>N / M / E / S</th>
              <th>Sectors</th>
              <th>Geography</th>
              <th>Horizon</th>
              <th>Review</th>
              <th>Observed</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
              <tr key={s.id}>
                <td>
                  <IdChip id={s.id} />
                </td>
                <td>
                  <Link
                    href={`/signals/${s.id}`}
                    className="text-[13px] font-medium text-ink hover:text-accent-ink hover:underline"
                  >
                    {s.title}
                  </Link>
                </td>
                <td>
                  <SignalStrengthBadge strength={s.signalStrength} />
                </td>
                <td>
                  <ConfidenceBadge level={s.confidence} />
                </td>
                <td>
                  <ScoreChips scores={s.scores} />
                </td>
                <td>
                  {s.sectors.length > 0 ? (
                    <SectorTags sectors={s.sectors} />
                  ) : (
                    <span className="text-[11px] text-ink-faint">Unclassified</span>
                  )}
                </td>
                <td className="text-[12.5px] text-ink-soft">
                  {s.country}
                  {s.city ? <span className="text-ink-faint"> · {s.city}</span> : null}
                </td>
                <td>
                  <span
                    className="font-mono text-[11.5px] text-ink-soft whitespace-nowrap"
                    title={TIME_HORIZON_LABELS[s.timeHorizon]}
                  >
                    {TIME_HORIZON_SHORT[s.timeHorizon]}
                  </span>
                </td>
                <td>
                  <ReviewStatusBadge status={s.reviewStatus} />
                </td>
                <td className="whitespace-nowrap text-[12.5px] text-ink-soft">
                  {fmtDate(s.dateObserved)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

function SignalsContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);

  const [filters, setFilters] = useState<Filters>(() => {
    const sectorParam = searchParams.get("sector");
    const reviewParam = searchParams.get("review");
    return {
      ...DEFAULT_FILTERS,
      sector: isSector(sectorParam) ? sectorParam : "",
      review: isReviewStatus(reviewParam) ? reviewParam : "",
      attentionNovelty: searchParams.get("attention") === "novelty",
      unclustered: searchParams.get("unclustered") === "1",
      zoomIncomplete: searchParams.get("zoom") === "incomplete",
    };
  });
  const [filtersOpen, setFiltersOpen] = useState<boolean>(
    () => countActiveFilters(filters) > 0,
  );
  const [view, setView] = useState<"cards" | "table">("cards");
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const sourceById = useMemo(() => {
    const map = new Map<string, Source>();
    sources.forEach((s) => map.set(s.id, s));
    return map;
  }, [sources]);

  const countryOptions = useMemo(
    () => Array.from(new Set(signals.map((s) => s.country))).sort(),
    [signals],
  );
  const cityOptions = useMemo(
    () =>
      Array.from(
        new Set(signals.map((s) => s.city).filter((c): c is string => Boolean(c))),
      ).sort(),
    [signals],
  );

  const filtered = useMemo(() => {
    const f = filters;
    const tagQuery = f.tag.trim().toLowerCase();
    return signals.filter((s) => {
      if (f.country && s.country !== f.country) return false;
      if (f.city && (s.city ?? "") !== f.city) return false;
      if (f.sector && !s.sectors.includes(f.sector)) return false;
      const linked = s.sourceIds
        .map((id) => sourceById.get(id))
        .filter((src): src is Source => Boolean(src));
      if (f.sourceType && !linked.some((src) => src.sourceType === f.sourceType))
        return false;
      if (f.minCredibility > 1 && !linked.some((src) => src.credibility >= f.minCredibility))
        return false;
      if (f.strength && s.signalStrength !== f.strength) return false;
      if (f.confidence && s.confidence !== f.confidence) return false;
      if (f.horizon && s.timeHorizon !== f.horizon) return false;
      if (s.scores.novelty < f.minNovelty) return false;
      if (s.scores.momentum < f.minMomentum) return false;
      if (s.scores.evidence < f.minEvidence) return false;
      if (s.scores.strategicRelevance < f.minStrategic) return false;
      if (f.system && !s.systemsAffected.includes(f.system)) return false;
      if (f.actorType && !s.actorTypes.includes(f.actorType)) return false;
      if (f.review && s.reviewStatus !== f.review) return false;
      if (tagQuery && !s.tags.some((t) => t.toLowerCase().includes(tagQuery))) return false;
      if (f.attentionNovelty && !(s.scores.novelty >= 4 && s.confidence === "low"))
        return false;
      if (f.unclustered && s.clusterIds.length !== 0) return false;
      if (f.zoomIncomplete && zoomComplete(s).valid) return false;
      return true;
    });
  }, [signals, sourceById, filters]);

  const sorted = useMemo(() => sortSignals(filtered, sortKey), [filtered, sortKey]);

  if (!hydrated) {
    return (
      <>
        <SignalsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const activeCount = countActiveFilters(filters);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const specialToggles: Array<{
    key: "attentionNovelty" | "unclustered" | "zoomIncomplete";
    label: string;
    title: string;
  }> = [
    {
      key: "attentionNovelty",
      label: "Worth attention",
      title: "Novelty ≥ 4 with low confidence — potentially important but weakly evidenced",
    },
    {
      key: "unclustered",
      label: "Unclustered only",
      title: "Signals not yet connected to any cluster candidate",
    },
    {
      key: "zoomIncomplete",
      label: "Zooming incomplete",
      title: "Signals whose mandatory four-level zooming ladder is not complete",
    },
  ];

  return (
    <>
      <SignalsHeader />
      <WalkthroughPanel pageId="signals" />

      {/* Filter bar */}
      <section className="card mb-4">
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="overline-label hover:text-accent-ink"
          >
            {filtersOpen ? "▾" : "▸"} Filters
            {activeCount > 0 ? (
              <span className="ml-1.5 font-mono text-[10.5px] text-accent-ink normal-case">
                {activeCount} active
              </span>
            ) : null}
          </button>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
            >
              Reset all filters
            </button>
          ) : null}
        </header>
        {filtersOpen ? (
          <div className="border-t border-line px-4 py-3">
            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
              <FilterField label="Country">
                <Select
                  value={filters.country}
                  onChange={(e) => set("country", e.target.value)}
                >
                  <option value="">Any</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="City">
                <Select value={filters.city} onChange={(e) => set("city", e.target.value)}>
                  <option value="">Any</option>
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Sector">
                <Select
                  value={filters.sector}
                  onChange={(e) => set("sector", e.target.value as Filters["sector"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(SECTOR_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Source type">
                <Select
                  value={filters.sourceType}
                  onChange={(e) => set("sourceType", e.target.value as Filters["sourceType"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(SOURCE_TYPE_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Min source credibility">
                <MinScoreSelect
                  value={filters.minCredibility}
                  onChange={(v) => set("minCredibility", v)}
                />
              </FilterField>
              <FilterField label="Signal strength">
                <Select
                  value={filters.strength}
                  onChange={(e) => set("strength", e.target.value as Filters["strength"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(SIGNAL_STRENGTH_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Confidence">
                <Select
                  value={filters.confidence}
                  onChange={(e) => set("confidence", e.target.value as Filters["confidence"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(CONFIDENCE_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Time horizon">
                <Select
                  value={filters.horizon}
                  onChange={(e) => set("horizon", e.target.value as Filters["horizon"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(TIME_HORIZON_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Min novelty">
                <MinScoreSelect
                  value={filters.minNovelty}
                  onChange={(v) => set("minNovelty", v)}
                />
              </FilterField>
              <FilterField label="Min momentum">
                <MinScoreSelect
                  value={filters.minMomentum}
                  onChange={(v) => set("minMomentum", v)}
                />
              </FilterField>
              <FilterField label="Min evidence">
                <MinScoreSelect
                  value={filters.minEvidence}
                  onChange={(v) => set("minEvidence", v)}
                />
              </FilterField>
              <FilterField label="Min strategic relevance">
                <MinScoreSelect
                  value={filters.minStrategic}
                  onChange={(v) => set("minStrategic", v)}
                />
              </FilterField>
              <FilterField label="System affected">
                <Select
                  value={filters.system}
                  onChange={(e) => set("system", e.target.value as Filters["system"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(SYSTEM_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Actor type">
                <Select
                  value={filters.actorType}
                  onChange={(e) => set("actorType", e.target.value as Filters["actorType"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(ACTOR_TYPE_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Review status">
                <Select
                  value={filters.review}
                  onChange={(e) => set("review", e.target.value as Filters["review"])}
                >
                  <option value="">Any</option>
                  {optionsFrom(REVIEW_STATUS_LABELS).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FilterField>
              <FilterField label="Tag contains">
                <TextInput
                  value={filters.tag}
                  onChange={(e) => set("tag", e.target.value)}
                  placeholder="e.g. heritage"
                />
              </FilterField>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
              {specialToggles.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  title={t.title}
                  onClick={() => set(t.key, !filters[t.key])}
                  className={`border px-2.5 py-1 text-[11.5px] rounded-[2px] ${
                    filters[t.key]
                      ? "border-accent bg-accent-soft font-medium text-accent-ink"
                      : "border-line bg-surface text-ink-soft hover:border-line-strong"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Toolbar: count, sort, view */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11.5px] text-ink-faint">
          <span className="font-mono">{sorted.length}</span> of{" "}
          <span className="font-mono">{signals.length}</span> signals match
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-ink-faint">
            Sort
            <Select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="w-auto"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex overflow-hidden rounded-[2px] border border-line">
            {(
              [
                { key: "cards", label: "Cards" },
                { key: "table", label: "Table" },
              ] as const
            ).map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setView(v.key)}
                className={`px-2.5 py-1 text-[11.5px] ${
                  view === v.key
                    ? "bg-accent-soft font-medium text-accent-ink"
                    : "bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {signals.length === 0 ? (
        <EmptyState
          message="The Signal Library is empty. Signals are present-day evidence suggesting future possibilities — they enter the library either by promoting observations that pass the promotion checklist in the Scan Inbox, or through the guided capture form, which walks through sourcing, classification, scoring, and the mandatory zooming ladder."
          actionLabel="Add the first signal"
          actionHref="/signals/new"
        />
      ) : sorted.length === 0 ? (
        <>
          <EmptyState message="No signals match the current filters. The library holds signals outside this slice — relax one filter at a time (score minimums and source credibility narrow results fastest), or reset all filters to see the full evidence base." />
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              className="text-[12px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:text-ink"
            >
              Reset all filters
            </button>
          </div>
        </>
      ) : view === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      ) : (
        <SignalsTable signals={sorted} />
      )}
    </>
  );
}

export default function SignalsPage() {
  return (
    <Suspense
      fallback={
        <>
          <SignalsHeader />
          <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
        </>
      }
    >
      <SignalsContent />
    </Suspense>
  );
}
