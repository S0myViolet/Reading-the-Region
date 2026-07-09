"use client";

/**
 * Signal Library — the core evidence base of the platform. Every signal is
 * present-day evidence suggesting a future possibility; nothing here is a
 * trend. Layout has exactly four layers: header, one control bar, the signal
 * list, and the collapsed page guide.
 *
 * Simple view (the default product) renders insight cards: title, labeled
 * micro-lines (what happened / why it matters / what it may point to), one
 * quiet meta line in words, and a quiet action row (Open / Save / Dismiss).
 * Filters shrink to search, sector, country and a Saved toggle, and
 * dismissed signals drop out of the list.
 * Analyst view keeps the full filter set, sort, and the list/table toggle;
 * methodology adds nothing extra here.
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
import { ConfidenceBadge, ReviewStatusBadge, SignalStrengthBadge } from "@/components/badges";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { Age, FreshnessWord } from "@/components/freshness";
import { RefreshBar } from "@/components/RefreshControls";
import { useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { checkedReading, signalEvidenceAt, signalStaleReason } from "@/lib/freshness";
import { signalStage } from "@/lib/pipeline";
import { zoomComplete } from "@/lib/validation";
import { evidenceWords, firstSentence } from "@/lib/simple";
import { DEFINITIONS } from "@/lib/copy";
import type {
  ActorType,
  ConfidenceLevel,
  ReviewStatus,
  Sector,
  Signal,
  SignalStrength,
  SystemAffected,
  TimeHorizon,
} from "@/lib/types";
import {
  ACTOR_TYPE_LABELS,
  CONFIDENCE_LABELS,
  REVIEW_STATUS_LABELS,
  SECTOR_LABELS,
  SIGNAL_STRENGTH_LABELS,
  SYSTEM_LABELS,
  TIME_HORIZON_LABELS,
} from "@/lib/types";
import { ScoreChips, btnPrimary, fmtDate, optionsFrom } from "./signal-ui";

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface Filters {
  country: string;
  sector: "" | Sector;
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
  /** Simple view only: signals the user saved to their watchlist. */
  savedOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  country: "",
  sector: "",
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
  savedOnly: false,
};

/** Simple view hides what the user (or an analyst) has already dismissed. */
const DISMISSED_STATUSES: ReviewStatus[] = ["archived_noise", "rejected"];

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

/** Prepend an "Any" choice to an enum option list for a ControlSelect. */
function withAny<T extends string>(
  anyLabel: string,
  options: Array<{ value: T; label: string }>,
): Array<{ value: string; label: string }> {
  return [{ value: "", label: anyLabel }, ...options];
}

const MIN_SCORE_OPTIONS = [
  { value: "1", label: "Any" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5" },
];

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

/** Strength only earns space on a row when it says something actionable. */
const MEANINGFUL_STRENGTHS: SignalStrength[] = ["weak", "contradictory", "established"];

function SignalRow({ signal }: { signal: Signal }) {
  // Freshness reading, from real fields only: the signal's own evidence date
  // and its honest checked/updated timestamp (see lib/freshness).
  const evidenceAt = signalEvidenceAt(signal);
  const checked = checkedReading(signal);
  const staleReason = signalStaleReason(signal);
  return (
    <Link href={`/signals/${signal.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {signal.title}
        </p>
        <span className="flex shrink-0 items-center gap-2">
          <PipelineStageBadge stage={signalStage(signal)} />
          {MEANINGFUL_STRENGTHS.includes(signal.signalStrength) ? (
            <SignalStrengthBadge strength={signal.signalStrength} />
          ) : null}
        </span>
      </div>
      <p className="mt-1 max-w-2xl truncate text-[12.5px] text-ink-soft">
        <span className="text-ink-faint">What happened</span>
        {" — "}
        {firstSentence(signal.description)}
      </p>
      <p className="mt-0.5 text-[12px] text-ink-faint">
        {[
          CONFIDENCE_LABELS[signal.confidence],
          evidenceWords(signal, signal.sourceIds.length),
          signal.country,
        ].join(" · ")}
      </p>
      <p className="mt-0.5 text-[11.5px] text-ink-faint">
        <FreshnessWord date={evidenceAt} />
        {" · "}
        <Age iso={evidenceAt} prefix="latest evidence" />
        {" · "}
        {signal.sourceIds.length} source{signal.sourceIds.length === 1 ? "" : "s"}
        {" · "}
        <Age iso={checked.date} prefix={checked.verb} />
        {staleReason ? (
          <>
            {" · "}
            <span className="text-caution" title={staleReason}>
              Needs a check
            </span>
          </>
        ) : null}
      </p>
    </Link>
  );
}

/** Labeled micro-line for a simple card: faint inline prefix, one sentence. */
function CardLine({
  label,
  text,
  clamp = false,
}: {
  label: string;
  text: string;
  clamp?: boolean;
}) {
  return (
    <p
      className={`mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft${
        clamp ? " line-clamp-2" : ""
      }`}
    >
      <span className="text-[11.5px] text-ink-faint">{label}</span>
      {" — "}
      {text}
    </p>
  );
}

/**
 * Simple-view insight card, readable in under ten seconds: title, then
 * labeled micro-lines (what happened, why it matters, what it may point
 * to), one quiet meta line in words, and three quiet actions. No ids, no
 * scores, no badges.
 */
function SimpleSignalCard({ signal }: { signal: Signal }) {
  const savedSignalIds = useIntelligenceStore((s) => s.savedSignalIds);
  const toggleSavedSignal = useIntelligenceStore((s) => s.toggleSavedSignal);
  const updateSignal = useIntelligenceStore((s) => s.updateSignal);
  const saved = savedSignalIds.includes(signal.id);

  function handleDismiss() {
    if (window.confirm("Dismiss this signal as noise?")) {
      updateSignal(signal.id, { reviewStatus: "archived_noise" });
    }
  }

  return (
    <article className="list-row py-6">
      <Link
        href={`/signals/${signal.id}`}
        className="text-[14.5px] font-medium leading-snug text-ink hover:text-accent-ink"
      >
        {signal.title}
      </Link>
      <CardLine label="What happened" text={firstSentence(signal.description)} />
      <CardLine label="Why it matters" text={firstSentence(signal.whyItMatters)} />
      {signal.zoom.futurePlausible.trim() ? (
        <CardLine
          label="May point to"
          text={firstSentence(signal.zoom.futurePlausible)}
          clamp
        />
      ) : null}
      <p className="mt-2 text-[12px] text-ink-faint">
        {[
          CONFIDENCE_LABELS[signal.confidence],
          evidenceWords(signal, signal.sourceIds.length),
          signal.country,
        ].join(" · ")}
      </p>
      <p className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px]">
        <Link
          href={`/signals/${signal.id}`}
          className="text-accent-ink underline-offset-2 hover:underline"
        >
          Open
        </Link>
        <button
          type="button"
          onClick={() => toggleSavedSignal(signal.id)}
          className={saved ? "text-accent-ink" : "text-ink-soft hover:text-ink"}
        >
          {saved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-ink-soft hover:text-ink"
        >
          Dismiss
        </button>
      </p>
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
              <th>Signal</th>
              <th>Strength</th>
              <th>Confidence</th>
              <th>N / M / E / S</th>
              <th>Review</th>
              <th>Observed</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s) => (
              <tr key={s.id}>
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
                  <span className="flex flex-wrap items-center gap-1.5">
                    <ReviewStatusBadge status={s.reviewStatus} />
                    <PipelineStageBadge stage={signalStage(s)} />
                  </span>
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
  const mode = useViewMode();
  const simple = mode === "simple";
  const searchParams = useSearchParams();
  const signals = useIntelligenceStore((s) => s.signals);
  const savedSignalIds = useIntelligenceStore((s) => s.savedSignalIds);

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
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "table">("list");
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const countryOptions = useMemo(
    () => [
      { value: "", label: "All countries" },
      ...Array.from(new Set(signals.map((s) => s.country)))
        .sort()
        .map((c) => ({ value: c, label: c })),
    ],
    [signals],
  );
  const tagOptions = useMemo(
    () => [
      { value: "", label: "Any tag" },
      ...Array.from(new Set(signals.flatMap((s) => s.tags)))
        .sort()
        .map((t) => ({ value: t, label: t })),
    ],
    [signals],
  );

  const filtered = useMemo(() => {
    const f = filters;
    const q = query.trim().toLowerCase();
    return signals.filter((s) => {
      if (q && !`${s.title} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(q))
        return false;
      if (f.country && s.country !== f.country) return false;
      if (f.sector && !s.sectors.includes(f.sector)) return false;
      if (simple) {
        // Simple view: dismissed signals drop out, and only the quiet
        // filters (search, sector, country, saved) apply.
        if (DISMISSED_STATUSES.includes(s.reviewStatus)) return false;
        if (f.savedOnly && !savedSignalIds.includes(s.id)) return false;
        return true;
      }
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
      if (f.tag && !s.tags.includes(f.tag)) return false;
      if (f.attentionNovelty && !(s.scores.novelty >= 4 && s.confidence === "low"))
        return false;
      if (f.unclustered && s.clusterIds.length !== 0) return false;
      if (f.zoomIncomplete && zoomComplete(s).valid) return false;
      return true;
    });
  }, [signals, filters, query, simple, savedSignalIds]);

  const sorted = useMemo(
    () => sortSignals(filtered, simple ? "recent" : sortKey),
    [filtered, sortKey, simple],
  );

  if (!hydrated) {
    return (
      <>
        <SignalsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const activeCount = countActiveFilters(filters);
  const isFiltered = simple
    ? query.trim().length > 0 ||
      filters.sector !== "" ||
      filters.country !== "" ||
      filters.savedOnly
    : activeCount > 0 || query.trim().length > 0;
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
      label: "Unclustered",
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
      {!simple ? <RefreshBar /> : null}

      {simple ? (
        <ControlBar
          right={
            isFiltered ? (
              <>
                <span className="text-[12px] text-ink-faint">
                  {sorted.length} {sorted.length === 1 ? "matches" : "match"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ ...DEFAULT_FILTERS });
                    setQuery("");
                  }}
                  className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
                >
                  Reset
                </button>
              </>
            ) : null
          }
        >
          <ControlSearch value={query} onChange={setQuery} placeholder="Search signals…" />
          <ControlSelect
            label="Sector"
            value={filters.sector}
            onChange={(v) => set("sector", v as Filters["sector"])}
            options={withAny("All sectors", optionsFrom(SECTOR_LABELS))}
          />
          <ControlSelect
            label="Country"
            value={filters.country}
            onChange={(v) => set("country", v)}
            options={countryOptions}
          />
          <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink-soft">
            <input
              type="checkbox"
              className="accent-[#29513f]"
              checked={filters.savedOnly}
              onChange={() => set("savedOnly", !filters.savedOnly)}
            />
            Saved
          </label>
        </ControlBar>
      ) : (
      <ControlBar
        more={
          <>
            <ControlSelect
              label="Country"
              value={filters.country}
              onChange={(v) => set("country", v)}
              options={countryOptions}
            />
            <ControlSelect
              label="Strength"
              value={filters.strength}
              onChange={(v) => set("strength", v as Filters["strength"])}
              options={withAny("Any strength", optionsFrom(SIGNAL_STRENGTH_LABELS))}
            />
            <ControlSelect
              label="Horizon"
              value={filters.horizon}
              onChange={(v) => set("horizon", v as Filters["horizon"])}
              options={withAny("Any horizon", optionsFrom(TIME_HORIZON_LABELS))}
            />
            <ControlSelect
              label="Novelty"
              value={String(filters.minNovelty)}
              onChange={(v) => set("minNovelty", Number(v))}
              options={MIN_SCORE_OPTIONS}
            />
            <ControlSelect
              label="Momentum"
              value={String(filters.minMomentum)}
              onChange={(v) => set("minMomentum", Number(v))}
              options={MIN_SCORE_OPTIONS}
            />
            <ControlSelect
              label="Evidence"
              value={String(filters.minEvidence)}
              onChange={(v) => set("minEvidence", Number(v))}
              options={MIN_SCORE_OPTIONS}
            />
            <ControlSelect
              label="Strategic"
              value={String(filters.minStrategic)}
              onChange={(v) => set("minStrategic", Number(v))}
              options={MIN_SCORE_OPTIONS}
            />
            <ControlSelect
              label="System"
              value={filters.system}
              onChange={(v) => set("system", v as Filters["system"])}
              options={withAny("Any system", optionsFrom(SYSTEM_LABELS))}
            />
            <ControlSelect
              label="Actor"
              value={filters.actorType}
              onChange={(v) => set("actorType", v as Filters["actorType"])}
              options={withAny("Any actor", optionsFrom(ACTOR_TYPE_LABELS))}
            />
            <ControlSelect
              label="Review"
              value={filters.review}
              onChange={(v) => set("review", v as Filters["review"])}
              options={withAny("Any status", optionsFrom(REVIEW_STATUS_LABELS))}
            />
            <ControlSelect
              label="Tag"
              value={filters.tag}
              onChange={(v) => set("tag", v)}
              options={tagOptions}
            />
            {specialToggles.map((t) => (
              <label
                key={t.key}
                title={t.title}
                className="flex cursor-pointer items-center gap-1.5 text-[12px] text-ink-faint hover:text-ink-soft"
              >
                <input
                  type="checkbox"
                  className="accent-[#29513f]"
                  checked={filters[t.key]}
                  onChange={() => set(t.key, !filters[t.key])}
                />
                {t.label}
              </label>
            ))}
          </>
        }
        right={
          <>
            {isFiltered ? (
              <>
                <span className="text-[12px] text-ink-faint">
                  {sorted.length} of {signals.length} match
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ ...DEFAULT_FILTERS });
                    setQuery("");
                  }}
                  className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
                >
                  Reset
                </button>
              </>
            ) : null}
            <span className="flex items-center gap-2 text-[12px]">
              {(
                [
                  { key: "list", label: "List" },
                  { key: "table", label: "Table" },
                ] as const
              ).map((v) => (
                <button
                  key={v.key}
                  type="button"
                  aria-pressed={view === v.key}
                  onClick={() => setView(v.key)}
                  className={
                    view === v.key ? "text-ink" : "text-ink-faint hover:text-ink-soft"
                  }
                >
                  {v.label}
                </button>
              ))}
            </span>
          </>
        }
      >
        <ControlSearch value={query} onChange={setQuery} placeholder="Search signals…" />
        <ControlSelect
          label="Sector"
          value={filters.sector}
          onChange={(v) => set("sector", v as Filters["sector"])}
          options={withAny("All sectors", optionsFrom(SECTOR_LABELS))}
        />
        <ControlSelect
          label="Confidence"
          value={filters.confidence}
          onChange={(v) => set("confidence", v as Filters["confidence"])}
          options={withAny("Any", optionsFrom(CONFIDENCE_LABELS))}
        />
        <ControlSelect
          label="Sort"
          value={sortKey}
          onChange={(v) => setSortKey(v as SortKey)}
          options={SORT_OPTIONS}
        />
      </ControlBar>
      )}

      {signals.length === 0 ? (
        <EmptyState
          message={
            simple
              ? "There are no signals yet. A signal is present-day evidence that suggests a future possibility — add one with the capture form, or keep promising finds in New Finds so they can be developed."
              : "The Signal Library is empty. Signals are present-day evidence suggesting future possibilities — they enter the library either by promoting observations that pass the promotion checklist in the Scan Inbox, or through the guided capture form, which walks through sourcing, classification, scoring, and the mandatory zooming ladder."
          }
          actionLabel="Add the first signal"
          actionHref="/signals/new"
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          message={
            simple
              ? "No signals match. Clear the search, turn off Saved, or choose a different sector or country."
              : "No signals match the current filters. The library holds signals outside this slice — relax one filter at a time (score minimums narrow results fastest), or reset the filters to see the full evidence base."
          }
        />
      ) : !simple && view === "table" ? (
        <SignalsTable signals={sorted} />
      ) : simple ? (
        <section aria-label="Signals">
          {sorted.map((s) => (
            <SimpleSignalCard key={s.id} signal={s} />
          ))}
        </section>
      ) : (
        <section aria-label="Signals">
          {sorted.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </section>
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
