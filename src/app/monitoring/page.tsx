"use client";

/**
 * Monitoring — the layer that prevents foresight from becoming static.
 *
 * Every future territory and driver is watched through leading indicators
 * checked on a declared cadence. The page shows the trend distribution,
 * which checks are overdue, and lets analysts record checks — the living
 * part of the system.
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { indicatorOverdue } from "@/lib/derived";
import { modeAtLeast } from "@/lib/viewMode";
import { DEFINITIONS } from "@/lib/copy";
import type {
  IndicatorTrend,
  IndicatorType,
  MonitoringCadence,
  MonitoringIndicator,
} from "@/lib/types";
import {
  CADENCE_LABELS,
  INDICATOR_TREND_LABELS,
  INDICATOR_TYPE_LABELS,
} from "@/lib/types";
import {
  AddIndicatorForm,
  CadenceStrip,
  MonitoringIndicatorCard,
  MonitoringQuestionsCard,
  type LinkedRef,
} from "./monitoring-ui";

type FilterKey = IndicatorTrend | "overdue";

const TREND_ORDER: IndicatorTrend[] = [
  "strengthening",
  "weakening",
  "stable",
  "contradictory",
];

function MonitoringHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <PageHeader
      overline="Apply & Monitor"
      title="Monitoring"
      description={DEFINITIONS.indicator}
      actions={actions}
    />
  );
}

function LoadingState() {
  return (
    <>
      <MonitoringHeader />
      <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
    </>
  );
}

/** One summary tile: count of indicators in a trend (or overdue), click to filter. */
function StatusTile({
  label,
  count,
  active,
  cautionary,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  cautionary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[3px] border px-3 py-2.5 text-left ${
        active
          ? "border-accent bg-accent-soft"
          : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      <span
        className={`block font-mono text-[22px] leading-none ${
          cautionary && count > 0 ? "text-caution" : "text-ink"
        }`}
      >
        {count}
      </span>
      <span className="overline-label mt-1.5 block">{label}</span>
    </button>
  );
}

interface IndicatorGroup {
  key: string;
  heading: string;
  territoryId: string | null;
  items: MonitoringIndicator[];
}

function MonitoringContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const mode = useViewMode();
  const analyst = modeAtLeast(mode, "analyst");
  const indicators = useIntelligenceStore((s) => s.indicators);
  const territories = useIntelligenceStore((s) => s.territories);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const signals = useIntelligenceStore((s) => s.signals);

  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<FilterKey | null>(() =>
    searchParams.get("overdue") === "1" ? "overdue" : null,
  );
  const [territoryFilter, setTerritoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<IndicatorType | "">("");
  const [cadenceFilter, setCadenceFilter] = useState<MonitoringCadence | "">("");

  if (!hydrated) return <LoadingState />;

  // --- summary counts ------------------------------------------------------
  const trendCounts: Record<IndicatorTrend, number> = {
    strengthening: 0,
    weakening: 0,
    stable: 0,
    contradictory: 0,
  };
  for (const i of indicators) trendCounts[i.trend] += 1;
  const overdueCount = indicators.filter((i) => indicatorOverdue(i)).length;

  // --- filtering -----------------------------------------------------------
  const knownTerritoryIds = new Set(territories.map((t) => t.id));
  const matchesTerritory = (i: MonitoringIndicator) =>
    territoryFilter === "" ||
    (territoryFilter === "unattached"
      ? i.territoryId === null || !knownTerritoryIds.has(i.territoryId)
      : i.territoryId === territoryFilter);

  const visible = indicators.filter(
    (i) =>
      (filter === null ||
        (filter === "overdue" ? indicatorOverdue(i) : i.trend === filter)) &&
      matchesTerritory(i) &&
      (typeFilter === "" || i.indicatorType === typeFilter) &&
      (cadenceFilter === "" || i.cadence === cadenceFilter),
  );

  const activeFilterLabels: string[] = [];
  if (filter !== null)
    activeFilterLabels.push(
      filter === "overdue" ? "Overdue" : INDICATOR_TREND_LABELS[filter],
    );
  if (territoryFilter !== "")
    activeFilterLabels.push(
      territoryFilter === "unattached"
        ? "No territory linkage"
        : (territories.find((t) => t.id === territoryFilter)?.name ??
            territoryFilter),
    );
  if (typeFilter !== "") activeFilterLabels.push(INDICATOR_TYPE_LABELS[typeFilter]);
  if (cadenceFilter !== "") activeFilterLabels.push(CADENCE_LABELS[cadenceFilter]);
  const anyFilterActive = activeFilterLabels.length > 0;

  const clearFilters = () => {
    setFilter(null);
    setTerritoryFilter("");
    setTypeFilter("");
    setCadenceFilter("");
  };

  // --- grouping by linked territory ---------------------------------------
  const byLastChecked = (a: MonitoringIndicator, b: MonitoringIndicator) =>
    a.dateLastChecked.localeCompare(b.dateLastChecked);

  const groups: IndicatorGroup[] = [];
  for (const t of territories) {
    const items = visible.filter((i) => i.territoryId === t.id).sort(byLastChecked);
    if (items.length > 0)
      groups.push({ key: t.id, heading: t.name, territoryId: t.id, items });
  }
  const unattached = visible
    .filter((i) => i.territoryId === null || !knownTerritoryIds.has(i.territoryId))
    .sort(byLastChecked);
  if (unattached.length > 0)
    groups.push({
      key: "unattached",
      heading: "Unattached indicators",
      territoryId: null,
      items: unattached,
    });

  // --- link resolution for the cards ---------------------------------------
  const territoryRef = (id: string | null): LinkedRef | null =>
    id === null
      ? null
      : { id, title: territories.find((t) => t.id === id)?.name ?? id };
  const driverRef = (id: string | null): LinkedRef | null =>
    id === null ? null : { id, title: drivers.find((d) => d.id === id)?.name ?? id };
  const signalRef = (id: string | null): LinkedRef | null =>
    id === null ? null : { id, title: signals.find((s) => s.id === id)?.title ?? id };

  return (
    <>
      <MonitoringHeader
        actions={
          <button
            type="button"
            onClick={() => setAdding((a) => !a)}
            className={
              adding
                ? "rounded-[2px] border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft hover:border-line-strong"
                : "rounded-[2px] border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink"
            }
          >
            {adding ? "Close form" : "Add indicator"}
          </button>
        }
      />
      <WalkthroughPanel pageId="monitoring" />

      {adding ? <AddIndicatorForm onClose={() => setAdding(false)} /> : null}

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TREND_ORDER.map((t) => (
          <StatusTile
            key={t}
            label={INDICATOR_TREND_LABELS[t]}
            count={trendCounts[t]}
            active={filter === t}
            onClick={() => setFilter((f) => (f === t ? null : t))}
          />
        ))}
        <StatusTile
          label="Overdue"
          count={overdueCount}
          active={filter === "overdue"}
          cautionary
          onClick={() => setFilter((f) => (f === "overdue" ? null : "overdue"))}
        />
      </div>

      <MonitoringQuestionsCard />
      <CadenceStrip />

      {filter !== null ? (
        <p className="mb-4 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-faint">
          Showing {visible.length} of {indicators.length} indicator
          {indicators.length === 1 ? "" : "s"} — filter: {filterLabel}.
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
          >
            Clear filter
          </button>
        </p>
      ) : null}

      {indicators.length === 0 ? (
        <EmptyState
          message="No monitoring indicators yet. Add leading indicators to track whether a future territory is strengthening, weakening, mutating, or being contradicted."
          actionLabel="Open Future Territories"
          actionHref="/territories"
        />
      ) : visible.length === 0 ? (
        <div className="card px-5 py-6 text-center">
          <p className="text-[12.5px] text-ink-soft">
            No indicators match this filter.
          </p>
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="mt-3 rounded-[2px] border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft hover:border-line-strong"
          >
            Clear filter
          </button>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="mb-6">
            <header className="mb-2 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-1.5">
              <div>
                <p className="overline-label">
                  {g.territoryId !== null ? (
                    <>
                      Future territory ·{" "}
                      <span className="font-mono normal-case">{g.territoryId}</span>
                    </>
                  ) : (
                    "No territory linkage"
                  )}
                </p>
                <h2 className="font-display text-[17px] leading-snug text-ink">
                  {g.territoryId !== null ? (
                    <Link
                      href={`/territories/${g.territoryId}`}
                      className="hover:text-accent-ink hover:underline"
                    >
                      {g.heading}
                    </Link>
                  ) : (
                    g.heading
                  )}
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-faint">
                {g.items.length} indicator{g.items.length === 1 ? "" : "s"}
              </span>
            </header>
            <div className="space-y-3">
              {g.items.map((i) => (
                <MonitoringIndicatorCard
                  key={i.id}
                  indicator={i}
                  territory={territoryRef(i.territoryId)}
                  driver={driverRef(i.driverId)}
                  signal={signalRef(i.signalId)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MonitoringContent />
    </Suspense>
  );
}
