"use client";

/**
 * Scenarios — plausible future worlds built from the evolution of a future
 * territory under different conditions. Strategic thought experiments, not
 * predictions. Grouped by the territory each scenario evolves from.
 *
 * Visibility layers: the simple reading shows each scenario's title, type and
 * horizon in words, its premise, and a one-line evidence sentence. Analyst
 * view adds quality-test pass counts, assumption load, review columns and the
 * filters.
 */

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { useViewMode, ViewGate } from "@/components/ViewMode";
import { IdChip } from "@/components/badges";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { scenarioAssumptionHeavy } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type {
  FutureTerritory,
  Scenario,
  ScenarioHorizon,
  ScenarioType,
} from "@/lib/types";
import { SCENARIO_HORIZON_LABELS, SCENARIO_TYPE_LABELS } from "@/lib/types";
import { ScenarioCard } from "./scenario-ui";

const HORIZON_ORDER: Record<ScenarioHorizon, number> = { near: 0, mid: 1, long: 2 };

function sortScenarios(list: Scenario[]): Scenario[] {
  return [...list].sort(
    (a, b) =>
      HORIZON_ORDER[a.horizon] - HORIZON_ORDER[b.horizon] ||
      a.title.localeCompare(b.title),
  );
}

function ScenariosHeader() {
  return (
    <PageHeader
      overline="Interpret & Imagine"
      title="Scenarios"
      description={DEFINITIONS.scenario}
    />
  );
}

function TerritoryGroup({
  territory,
  scenarios,
}: {
  territory: FutureTerritory;
  scenarios: Scenario[];
}) {
  return (
    <section>
      <header className="mb-2.5 border-b border-line pb-2">
        <p className="overline-label">
          Future territory · <IdChip id={territory.id} />
        </p>
        <h2 className="font-display text-[18px] leading-snug text-ink">
          <Link
            href={`/territories/${territory.id}`}
            className="hover:text-accent-ink hover:underline"
          >
            {territory.name}
          </Link>
        </h2>
        <p className="mt-0.5 text-[11.5px] text-ink-faint">
          {scenarios.length} scenario{scenarios.length === 1 ? "" : "s"} built on
          this territory.
        </p>
      </header>
      <div className="space-y-3">
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>
    </section>
  );
}

function OrphanGroup({ scenarios }: { scenarios: Scenario[] }) {
  return (
    <section>
      <header className="mb-2.5 border-b border-line pb-2">
        <p className="overline-label">Future territory</p>
        <h2 className="font-display text-[18px] leading-snug text-ink">
          Territory not found
        </h2>
        <p className="mt-0.5 text-[11.5px] text-ink-faint">
          These scenarios reference a territory that no longer exists in the
          intelligence base. Re-anchor them to a territory — a scenario without
          one cannot be evidence-linked.
        </p>
      </header>
      <div className="space-y-3">
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>
    </section>
  );
}

const TYPE_OPTIONS = Object.keys(SCENARIO_TYPE_LABELS) as ScenarioType[];
const HORIZON_OPTIONS = Object.keys(SCENARIO_HORIZON_LABELS) as ScenarioHorizon[];

type EvidenceLoadFilter = "all" | "assumption_heavy" | "evidence_grounded";

export default function ScenariosPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const territories = useIntelligenceStore((s) => s.territories);
  const [typeFilter, setTypeFilter] = useState<ScenarioType | "all">("all");
  const [horizonFilter, setHorizonFilter] = useState<ScenarioHorizon | "all">("all");
  const [loadFilter, setLoadFilter] = useState<EvidenceLoadFilter>("all");

  if (!hydrated) {
    return (
      <>
        <ScenariosHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  // Filters are an analyst affordance; the simple reading always shows everything.
  const filtered =
    mode === "simple"
      ? scenarios
      : scenarios.filter(
          (s) =>
            (typeFilter === "all" || s.scenarioType === typeFilter) &&
            (horizonFilter === "all" || s.horizon === horizonFilter) &&
            (loadFilter === "all" ||
              (loadFilter === "assumption_heavy") === scenarioAssumptionHeavy(s)),
        );

  const territoryIds = new Set(territories.map((t) => t.id));
  const groups = territories
    .map((t) => ({
      territory: t,
      scenarios: sortScenarios(filtered.filter((s) => s.territoryId === t.id)),
    }))
    .filter((g) => g.scenarios.length > 0);
  const orphans = sortScenarios(
    filtered.filter((s) => !territoryIds.has(s.territoryId)),
  );

  return (
    <>
      <ScenariosHeader />
      <WalkthroughPanel pageId="scenarios" />

      {scenarios.length === 0 ? (
        <EmptyState
          message="No scenarios yet. Create a future territory first, then use its drivers and contradictions to generate plausible future worlds."
          actionLabel="Open Future Territories"
          actionHref="/territories"
        />
      ) : (
        <>
          <ViewGate min="analyst">
            <div className="card mb-5">
              <header className="border-b border-line px-4 py-2.5">
                <h3 className="overline-label">Filter scenarios</h3>
              </header>
              <div className="grid gap-4 px-4 py-3 sm:grid-cols-3">
                <Field label="Scenario type">
                  <Select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value as ScenarioType | "all")
                    }
                  >
                    <option value="all">All types</option>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {SCENARIO_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Horizon">
                  <Select
                    value={horizonFilter}
                    onChange={(e) =>
                      setHorizonFilter(e.target.value as ScenarioHorizon | "all")
                    }
                  >
                    <option value="all">All horizons</option>
                    {HORIZON_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {SCENARIO_HORIZON_LABELS[h]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Evidence load">
                  <Select
                    value={loadFilter}
                    onChange={(e) =>
                      setLoadFilter(e.target.value as EvidenceLoadFilter)
                    }
                  >
                    <option value="all">All scenarios</option>
                    <option value="assumption_heavy">Assumption-heavy only</option>
                    <option value="evidence_grounded">Evidence-grounded only</option>
                  </Select>
                </Field>
              </div>
            </div>
          </ViewGate>

          {filtered.length === 0 ? (
            <p className="text-[12px] text-ink-faint">
              No scenarios match the current filters. Widen the type, horizon or
              evidence-load filter to see the full set.
            </p>
          ) : (
            <div className="space-y-8">
              {groups.map((g) => (
                <TerritoryGroup
                  key={g.territory.id}
                  territory={g.territory}
                  scenarios={g.scenarios}
                />
              ))}
              {orphans.length > 0 ? <OrphanGroup scenarios={orphans} /> : null}
            </div>
          )}
        </>
      )}
    </>
  );
}
