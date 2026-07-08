"use client";

/**
 * Strategic Implications — where foresight becomes useful. Each implication
 * answers: what should we do differently because this future may be forming?
 *
 * Calm layout: header, one control bar, editorial implication entries
 * separated by hairlines. The creation form and analyst detail stay quiet
 * and boxless; deep methodology sits at the foot of the page.
 */

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { ControlBar, ControlSelect } from "@/components/ControlBar";
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
import { ImplicationEntry, ImplicationForm, btnPrimary } from "./implication-ui";

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
      title="Strategic Implications"
      description={DEFINITIONS.implication}
      actions={
        <button
          type="button"
          onClick={onToggleForm}
          className={
            formOpen
              ? "rounded-[4px] bg-surface-muted px-3.5 py-1.5 text-[12.5px] text-ink-soft hover:text-ink"
              : btnPrimary
          }
        >
          {formOpen ? "Close form" : "Add implication"}
        </button>
      }
    />
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

      {formOpen ? <ImplicationForm onClose={() => setFormOpen(false)} /> : null}

      {implications.length === 0 ? (
        <EmptyState
          message="No strategic implications yet. Implications translate territories and scenarios into present-day choices — create them once a future territory is evidenced."
          actionLabel="Open Future Territories"
          actionHref="/territories"
        />
      ) : (
        <>
          <ControlBar
            right={
              filtersActive ? (
                <>
                  <span className="text-[12px] text-ink-faint">
                    {filtered.length} of {implications.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilters(NO_FILTERS)}
                    className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
                  >
                    Reset
                  </button>
                </>
              ) : null
            }
            more={
              analyst ? (
                <>
                  <ControlSelect
                    label="Type"
                    value={filters.type}
                    onChange={(v) =>
                      setFilter({ type: v as ImplicationType | "" })
                    }
                    options={[
                      { value: "", label: "All types" },
                      ...TYPE_OPTIONS.map((t) => ({
                        value: t,
                        label: IMPLICATION_TYPE_LABELS[t],
                      })),
                    ]}
                  />
                  <ControlSelect
                    label="Territory"
                    value={filters.territoryId}
                    onChange={(v) => setFilter({ territoryId: v })}
                    options={[
                      { value: "", label: "All territories" },
                      ...territories.map((t) => ({
                        value: t.id,
                        label: `${t.id} · ${t.name}`,
                      })),
                    ]}
                  />
                  <ControlSelect
                    label="Scenario"
                    value={filters.scenarioId}
                    onChange={(v) => setFilter({ scenarioId: v })}
                    options={[
                      { value: "", label: "All scenarios" },
                      ...scenarios.map((s) => ({
                        value: s.id,
                        label: `${s.id} · ${s.title}`,
                      })),
                    ]}
                  />
                  <ControlSelect
                    label="Horizon"
                    value={filters.horizon}
                    onChange={(v) =>
                      setFilter({ horizon: v as TimeHorizon | "" })
                    }
                    options={[
                      { value: "", label: "All horizons" },
                      ...HORIZON_OPTIONS.map((h) => ({
                        value: h,
                        label: TIME_HORIZON_LABELS[h],
                      })),
                    ]}
                  />
                </>
              ) : undefined
            }
          >
            <ControlSelect
              label="Audience"
              value={filters.audience}
              onChange={(v) =>
                setFilter({ audience: v as ImplicationAudience | "" })
              }
              options={[
                { value: "", label: "All audiences" },
                ...AUDIENCE_OPTIONS.map((a) => ({
                  value: a,
                  label: IMPLICATION_AUDIENCE_LABELS[a],
                })),
              ]}
            />
            <ControlSelect
              label="Sector"
              value={filters.sector}
              onChange={(v) => setFilter({ sector: v as Sector | "" })}
              options={[
                { value: "", label: "All sectors" },
                ...SECTOR_OPTIONS.map((s) => ({
                  value: s,
                  label: SECTOR_LABELS[s],
                })),
              ]}
            />
            <ControlSelect
              label="Confidence"
              value={filters.confidence}
              onChange={(v) =>
                setFilter({ confidence: v as ConfidenceLevel | "" })
              }
              options={[
                { value: "", label: "All confidence levels" },
                ...CONFIDENCE_OPTIONS.map((c) => ({
                  value: c,
                  label: CONFIDENCE_LABELS[c],
                })),
              ]}
            />
          </ControlBar>

          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[13px] text-ink-soft">
                No implications match the current filters.
              </p>
              <button
                type="button"
                onClick={() => setFilters(NO_FILTERS)}
                className="mt-4 text-[12.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:text-ink"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <section aria-label="Strategic implications">
              {filtered.map((imp) => (
                <ImplicationEntry
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
            </section>
          )}

          <div className="mt-8">
            <DepthHint>
              Grounding checks, opportunity and risk detail, and review status
            </DepthHint>
          </div>

          <ViewGate min="methodology">
            <section className="mt-10 max-w-2xl">
              <h2 className="text-[13px] font-medium text-ink">
                Traceability rule
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                Every implication must be anchored and evidenced: it names the
                future territory or scenario it responds to, and it cites the
                evidence signals or drivers that make that future plausible. An
                implication without an anchor answers no question; an
                implication without evidence links is an opinion. The grounding
                checks behind each entry apply this rule — an implication that
                fails them shows as needing more evidence and should not drive
                decisions until the links exist.
              </p>
            </section>
          </ViewGate>
        </>
      )}
    </>
  );
}
