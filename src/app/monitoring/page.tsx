"use client";

/**
 * Monitoring — the layer that prevents foresight from becoming static.
 *
 * Every future territory and driver is watched through leading indicators
 * checked on a declared cadence. Calm layout: header, plain trend figures
 * (which double as filters), one control bar, and the indicator list grouped
 * by territory. Analyst machinery sits behind row disclosure.
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { ControlBar, ControlSelect } from "@/components/ControlBar";
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
  CadenceRhythm,
  MonitoringIndicatorRow,
  MonitoringQuestions,
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

/** One plain figure: count of indicators in a trend (or overdue), click to filter. */
function StatusFigure({
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
    <button type="button" onClick={onClick} aria-pressed={active} className="text-left">
      <span
        className={`block font-mono text-[20px] leading-none ${
          cautionary && count > 0
            ? "text-caution"
            : active
              ? "text-accent-ink"
              : "text-ink"
        }`}
      >
        {count}
      </span>
      <span
        className={`mt-1.5 block text-[11px] ${
          active
            ? "text-ink underline decoration-line-strong underline-offset-4"
            : "text-ink-faint"
        }`}
      >
        {label}
      </span>
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

  const anyFilterActive =
    filter !== null ||
    territoryFilter !== "" ||
    typeFilter !== "" ||
    cadenceFilter !== "";

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

  // --- link resolution for the rows ----------------------------------------
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
          <ViewGate min="analyst">
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              className={
                adding
                  ? "rounded-[4px] bg-surface-muted px-3.5 py-1.5 text-[12.5px] text-ink-soft hover:text-ink"
                  : "rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink"
              }
            >
              {adding ? "Close form" : "Add indicator"}
            </button>
          </ViewGate>
        }
      />
      {analyst ? (
        <p className="-mt-6 mb-8 max-w-2xl text-[12px] text-ink-faint">
          Is each watched territory strengthening, weakening, mutating, or
          being contradicted?
        </p>
      ) : null}
      <WalkthroughPanel pageId="monitoring" />

      {analyst && adding ? (
        <AddIndicatorForm onClose={() => setAdding(false)} />
      ) : null}

      <div className="mb-8 flex flex-wrap items-start gap-x-10 gap-y-4">
        {TREND_ORDER.map((t) => (
          <StatusFigure
            key={t}
            label={INDICATOR_TREND_LABELS[t]}
            count={trendCounts[t]}
            active={filter === t}
            onClick={() => setFilter((f) => (f === t ? null : t))}
          />
        ))}
        <StatusFigure
          label="Overdue"
          count={overdueCount}
          active={filter === "overdue"}
          cautionary
          onClick={() => setFilter((f) => (f === "overdue" ? null : "overdue"))}
        />
      </div>

      <ControlBar
        right={
          anyFilterActive ? (
            <>
              <span className="text-[12px] text-ink-faint">
                {visible.length} of {indicators.length}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
              >
                Clear
              </button>
            </>
          ) : null
        }
        more={
          <>
            <ControlSelect
              label="Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as IndicatorType | "")}
              options={[
                { value: "", label: "All types" },
                ...(Object.keys(INDICATOR_TYPE_LABELS) as IndicatorType[]).map(
                  (t) => ({ value: t, label: INDICATOR_TYPE_LABELS[t] }),
                ),
              ]}
            />
            <ControlSelect
              label="Cadence"
              value={cadenceFilter}
              onChange={(v) => setCadenceFilter(v as MonitoringCadence | "")}
              options={[
                { value: "", label: "All cadences" },
                ...(Object.keys(CADENCE_LABELS) as MonitoringCadence[]).map(
                  (c) => ({ value: c, label: CADENCE_LABELS[c] }),
                ),
              ]}
            />
          </>
        }
      >
        <ControlSelect
          label="Trend"
          value={filter ?? "all"}
          onChange={(v) => setFilter(v === "all" ? null : (v as FilterKey))}
          options={[
            { value: "all", label: "All trends" },
            ...TREND_ORDER.map((t) => ({
              value: t,
              label: INDICATOR_TREND_LABELS[t],
            })),
            { value: "overdue", label: "Overdue" },
          ]}
        />
        <ControlSelect
          label="Territory"
          value={territoryFilter}
          onChange={setTerritoryFilter}
          options={[
            { value: "", label: "All territories" },
            ...territories.map((t) => ({ value: t.id, label: t.name })),
            { value: "unattached", label: "No territory linkage" },
          ]}
        />
      </ControlBar>

      {indicators.length === 0 ? (
        <EmptyState
          message="No monitoring indicators yet. Add leading indicators to track whether a future territory is strengthening, weakening, mutating, or being contradicted."
          actionLabel="Open Future Territories"
          actionHref="/territories"
        />
      ) : visible.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-[13px] text-ink-soft">
            No indicators match the current filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 text-[12.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:text-ink"
          >
            Clear filters
          </button>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="mb-10" aria-label={g.heading}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[13px] font-medium text-ink">
                {g.territoryId !== null ? (
                  <Link
                    href={`/territories/${g.territoryId}`}
                    className="hover:text-accent-ink"
                  >
                    {g.heading}
                  </Link>
                ) : (
                  g.heading
                )}
              </h2>
              <span className="text-[11.5px] text-ink-faint">
                {g.items.length} indicator{g.items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div>
              {g.items.map((i) => (
                <MonitoringIndicatorRow
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

      <div className="mt-6">
        <DepthHint>
          Indicator classification, evidence detail and check recording
        </DepthHint>
      </div>

      <ViewGate min="analyst">
        <MonitoringQuestions />
      </ViewGate>
      <ViewGate min="methodology">
        <CadenceRhythm />
      </ViewGate>
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
