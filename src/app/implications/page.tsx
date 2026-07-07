"use client";

/**
 * Strategic Implications — where foresight becomes useful. Each implication
 * answers: what should we do differently because this future may be forming?
 * A single page: filterable expandable cards plus a creation form; every
 * implication is anchored to a territory or scenario and evidence-linked back
 * down the pyramid.
 */

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { modeAtLeast } from "@/lib/viewMode";
import { DEFINITIONS } from "@/lib/copy";
import type {
  ConfidenceLevel,
  Driver,
  ImplicationAudience,
  ImplicationType,
  Sector,
  Signal,
  TimeHorizon,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  IMPLICATION_AUDIENCE_LABELS,
  IMPLICATION_TYPE_LABELS,
  SECTOR_LABELS,
  TIME_HORIZON_LABELS,
} from "@/lib/types";
import { ImplicationCard, ImplicationForm } from "./implication-ui";

const SECTOR_OPTIONS = Object.keys(SECTOR_LABELS) as Sector[];
const AUDIENCE_OPTIONS = Object.keys(
  IMPLICATION_AUDIENCE_LABELS,
) as ImplicationAudience[];
const TYPE_OPTIONS = Object.keys(IMPLICATION_TYPE_LABELS) as ImplicationType[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];
const HORIZON_OPTIONS = Object.keys(TIME_HORIZON_LABELS) as TimeHorizon[];

interface Filters {
  sector: Sector | "";
  audience: ImplicationAudience | "";
  type: ImplicationType | "";
  territoryId: string;
  scenarioId: string;
  confidence: ConfidenceLevel | "";
  horizon: TimeHorizon | "";
}

const NO_FILTERS: Filters = {
  sector: "",
  audience: "",
  type: "",
  territoryId: "",
  scenarioId: "",
  confidence: "",
  horizon: "",
};

function ImplicationsHeader({
  formOpen,
  onToggleForm,
}: {
  formOpen: boolean;
  onToggleForm: () => void;
}) {
  return (
    <PageHeader
      overline="Apply & Monitor"
      title="Strategic Implications"
      description={DEFINITIONS.implication}
      actions={
        <button
          type="button"
          onClick={onToggleForm}
          className={
            formOpen
              ? "border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong"
              : "border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
          }
        >
          {formOpen ? "Close form" : "Add implication"}
        </button>
      }
    />
  );
}

/**
 * Methodology view: the traceability rule that governs this layer, spelled
 * out where the implications are read.
 */
function TraceabilityCard() {
  return (
    <section className="card mb-5">
      <header className="border-b border-line px-4 py-2.5">
        <h2 className="overline-label">Traceability rule</h2>
      </header>
      <div className="px-4 py-3">
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Every implication must trace back down the pyramid: it is anchored to a
          future territory or scenario, and it cites the evidence signals or
          drivers that make that future plausible. An implication without an
          anchor answers no question; an implication without evidence links is an
          opinion. The grounding checklist on each card applies this rule — an
          implication that fails it stays flagged as needing grounding and should
          not drive decisions until evidence is linked.
        </p>
      </div>
    </section>
  );
}

export default function ImplicationsPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const analyst = modeAtLeast(mode, "analyst");
  const implications = useIntelligenceStore((s) => s.implications);
  const territories = useIntelligenceStore((s) => s.territories);
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const signals = useIntelligenceStore((s) => s.signals);
  const drivers = useIntelligenceStore((s) => s.drivers);

  const [formOpen, setFormOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const territoryById = useMemo(
    () => new Map(territories.map((t) => [t.id, t] as const)),
    [territories],
  );
  const scenarioById = useMemo(
    () => new Map(scenarios.map((s) => [s.id, s] as const)),
    [scenarios],
  );
  const signalById = useMemo(
    () => new Map(signals.map((s) => [s.id, s] as const)),
    [signals],
  );
  const driverById = useMemo(
    () => new Map(drivers.map((d) => [d.id, d] as const)),
    [drivers],
  );

  const filtered = useMemo(
    () =>
      implications.filter(
        (i) =>
          (!filters.sector || i.sectors.includes(filters.sector)) &&
          (!filters.audience || i.audiences.includes(filters.audience)) &&
          (!filters.type || i.implicationType === filters.type) &&
          (!filters.territoryId || i.territoryId === filters.territoryId) &&
          (!filters.scenarioId || i.scenarioId === filters.scenarioId) &&
          (!filters.confidence || i.confidence === filters.confidence) &&
          (!filters.horizon || i.timeHorizon === filters.horizon),
      ),
    [implications, filters],
  );

  const filtersActive = useMemo(
    () => Object.values(filters).some((v) => v !== ""),
    [filters],
  );

  const setFilter = (patch: Partial<Filters>) =>
    setFilters((f) => ({ ...f, ...patch }));

  if (!hydrated) {
    return (
      <>
        <ImplicationsHeader formOpen={false} onToggleForm={() => {}} />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  return (
    <>
      <ImplicationsHeader
        formOpen={formOpen}
        onToggleForm={() => setFormOpen((o) => !o)}
      />
      <WalkthroughPanel pageId="implications" />
      <div className="mb-4">
        <DepthHint>
          Grounding checks, opportunity and risk detail, and review status
        </DepthHint>
      </div>
      <ViewGate min="methodology">
        <TraceabilityCard />
      </ViewGate>

      {formOpen ? <ImplicationForm onClose={() => setFormOpen(false)} /> : null}

      {implications.length === 0 ? (
        <EmptyState
          message="No strategic implications yet. Implications translate territories and scenarios into present-day choices — create them once a future territory is evidenced."
          actionLabel="Open Future Territories"
          actionHref="/territories"
        />
      ) : (
        <>
          <section className="card mb-4">
            <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <h2 className="overline-label">Filter implications</h2>
              {filtersActive ? (
                <button
                  type="button"
                  onClick={() => setFilters(NO_FILTERS)}
                  className="text-[11px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                >
                  Reset filters
                </button>
              ) : null}
            </header>
            <div
              className={`grid gap-3 px-4 py-3 sm:grid-cols-2 ${
                analyst ? "lg:grid-cols-4" : "lg:grid-cols-3"
              }`}
            >
              <Field label="Audience">
                <Select
                  value={filters.audience}
                  onChange={(e) =>
                    setFilter({
                      audience: e.target.value as ImplicationAudience | "",
                    })
                  }
                >
                  <option value="">All audiences</option>
                  {AUDIENCE_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {IMPLICATION_AUDIENCE_LABELS[a]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Sector">
                <Select
                  value={filters.sector}
                  onChange={(e) =>
                    setFilter({ sector: e.target.value as Sector | "" })
                  }
                >
                  <option value="">All sectors</option>
                  {SECTOR_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {SECTOR_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Confidence">
                <Select
                  value={filters.confidence}
                  onChange={(e) =>
                    setFilter({
                      confidence: e.target.value as ConfidenceLevel | "",
                    })
                  }
                >
                  <option value="">All confidence levels</option>
                  {CONFIDENCE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {CONFIDENCE_LABELS[c]}
                    </option>
                  ))}
                </Select>
              </Field>
              {analyst ? (
                <>
                  <Field label="Implication type">
                    <Select
                      value={filters.type}
                      onChange={(e) =>
                        setFilter({ type: e.target.value as ImplicationType | "" })
                      }
                    >
                      <option value="">All types</option>
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {IMPLICATION_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Future territory">
                    <Select
                      value={filters.territoryId}
                      onChange={(e) => setFilter({ territoryId: e.target.value })}
                    >
                      <option value="">All territories</option>
                      {territories.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.id} · {t.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Scenario">
                    <Select
                      value={filters.scenarioId}
                      onChange={(e) => setFilter({ scenarioId: e.target.value })}
                    >
                      <option value="">All scenarios</option>
                      {scenarios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} · {s.title}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Time horizon">
                    <Select
                      value={filters.horizon}
                      onChange={(e) =>
                        setFilter({ horizon: e.target.value as TimeHorizon | "" })
                      }
                    >
                      <option value="">All horizons</option>
                      {HORIZON_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {TIME_HORIZON_LABELS[h]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </>
              ) : null}
            </div>
          </section>

          <p className="mb-3 text-[11.5px] text-ink-faint">
            Showing {filtered.length} of {implications.length} implication
            {implications.length === 1 ? "" : "s"}.
          </p>

          {filtered.length === 0 ? (
            <div className="card px-6 py-8 text-center">
              <p className="text-[13px] text-ink-soft">
                No implications match the current filters.
              </p>
              <button
                type="button"
                onClick={() => setFilters(NO_FILTERS)}
                className="mt-3 border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((imp) => (
                <ImplicationCard
                  key={imp.id}
                  implication={imp}
                  territory={
                    imp.territoryId
                      ? (territoryById.get(imp.territoryId) ?? null)
                      : null
                  }
                  scenario={
                    imp.scenarioId
                      ? (scenarioById.get(imp.scenarioId) ?? null)
                      : null
                  }
                  evidenceSignals={imp.evidenceSignalIds
                    .map((id) => signalById.get(id))
                    .filter((s): s is Signal => Boolean(s))}
                  evidenceDrivers={imp.evidenceDriverIds
                    .map((id) => driverById.get(id))
                    .filter((d): d is Driver => Boolean(d))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
