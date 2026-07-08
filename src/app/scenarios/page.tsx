"use client";

/**
 * Scenarios — plausible future worlds built from the evolution of a future
 * territory under different conditions. Strategic thought experiments, not
 * predictions. Grouped by the territory each scenario evolves from.
 *
 * Calm layout: one control bar (type and horizon; the analyst-only
 * evidence-load filter sits behind "More filters"), then quiet list rows
 * grouped under their territory heading. The advanced rows lead with plain
 * English — core idea, what makes each scenario different, quality status,
 * key uncertainty — while ids and link counts stay small secondary metadata.
 * The simple reading keeps its original compact rows.
 */

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ControlBar, ControlSelect } from "@/components/ControlBar";
import { useViewMode } from "@/components/ViewMode";
import { IdChip } from "@/components/badges";
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
import { ScenarioRow, ScenarioRowAdvanced } from "./scenario-ui";

const HORIZON_ORDER: Record<ScenarioHorizon, number> = { near: 0, mid: 1, long: 2 };

function sortScenarios(list: Scenario[]): Scenario[] {
  return [...list].sort(
    (a, b) =>
      HORIZON_ORDER[a.horizon] - HORIZON_ORDER[b.horizon] ||
      a.title.localeCompare(b.title),
  );
}

function ScenariosHeader({ advanced }: { advanced: boolean }) {
  if (!advanced) {
    return (
      <PageHeader
        title="Scenarios"
        description={DEFINITIONS.scenario}
      />
    );
  }
  return (
    <>
      <PageHeader
        title="Scenarios"
        description="Plausible future worlds, not predictions."
      />
      <p className="-mt-5 mb-8 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
        Scenarios explore different ways a future territory could develop.
        They are useful because they show choices, risks, winners, losers,
        and early warning signs.
      </p>
    </>
  );
}

function GroupHeader({
  title,
  titleHref,
  meta,
}: {
  title: string;
  titleHref?: string;
  meta: React.ReactNode;
}) {
  return (
    <header>
      <h2 className="font-display text-[15.5px] leading-snug text-ink">
        {titleHref ? (
          <Link href={titleHref} className="hover:text-accent-ink">
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>
      <p className="mt-0.5 text-[12px] text-ink-faint">{meta}</p>
    </header>
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
    <section aria-label={territory.name}>
      <GroupHeader
        title={territory.name}
        titleHref={`/territories/${territory.id}`}
        meta={
          <>
            Future territory · <IdChip id={territory.id} /> · {scenarios.length}{" "}
            scenario{scenarios.length === 1 ? "" : "s"} built on it
          </>
        }
      />
      <div className="mt-1">
        {scenarios.map((s) => (
          <ScenarioRow key={s.id} scenario={s} />
        ))}
      </div>
    </section>
  );
}

/**
 * Advanced grouping: the territory leads with its name and one-line
 * definition, so a reader knows which future these scenarios explore before
 * reading any of them. The id stays quiet metadata.
 */
function TerritoryGroupAdvanced({
  territory,
  scenarios,
}: {
  territory: FutureTerritory;
  scenarios: Scenario[];
}) {
  return (
    <section aria-label={territory.name}>
      <header>
        <h2 className="font-display text-[16.5px] leading-snug text-ink">
          <Link href={`/territories/${territory.id}`} className="hover:text-accent-ink">
            {territory.name}
          </Link>
        </h2>
        {territory.oneLineDefinition.trim() ? (
          <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            {territory.oneLineDefinition}
          </p>
        ) : null}
        <p className="mt-1 text-[11px] text-ink-faint">
          {scenarios.length} scenario{scenarios.length === 1 ? "" : "s"} built on
          this territory · <IdChip id={territory.id} />
        </p>
      </header>
      <div className="mt-2">
        {scenarios.map((s) => (
          <ScenarioRowAdvanced key={s.id} scenario={s} />
        ))}
      </div>
    </section>
  );
}

function OrphanGroup({
  scenarios,
  advanced,
}: {
  scenarios: Scenario[];
  advanced: boolean;
}) {
  return (
    <section aria-label="Scenarios without a territory">
      <GroupHeader
        title="Territory not found"
        meta="These scenarios reference a territory that no longer exists in the intelligence base. Re-anchor them to a territory — a scenario without one cannot be evidence-linked."
      />
      <div className="mt-1">
        {scenarios.map((s) =>
          advanced ? (
            <ScenarioRowAdvanced key={s.id} scenario={s} />
          ) : (
            <ScenarioRow key={s.id} scenario={s} />
          ),
        )}
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

  const advanced = mode !== "simple";

  if (!hydrated) {
    return (
      <>
        <ScenariosHeader advanced={advanced} />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  // The evidence-load filter is an analyst affordance; it never silently
  // narrows the simple reading.
  const applyLoad = advanced;
  const filtered = scenarios.filter(
    (s) =>
      (typeFilter === "all" || s.scenarioType === typeFilter) &&
      (horizonFilter === "all" || s.horizon === horizonFilter) &&
      (!applyLoad ||
        loadFilter === "all" ||
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
      <ScenariosHeader advanced={advanced} />
      <WalkthroughPanel pageId="scenarios" />

      {scenarios.length === 0 ? (
        <EmptyState
          message="No scenarios yet. Create a future territory first, then use its drivers and contradictions to generate plausible future worlds."
          actionLabel="Open Future Territories"
          actionHref="/territories"
        />
      ) : (
        <>
          <ControlBar
            more={
              applyLoad ? (
                <ControlSelect
                  label="Evidence load"
                  value={loadFilter}
                  onChange={(v) => setLoadFilter(v as EvidenceLoadFilter)}
                  options={[
                    { value: "all", label: "All scenarios" },
                    { value: "assumption_heavy", label: "Assumption-heavy only" },
                    { value: "evidence_grounded", label: "Evidence-grounded only" },
                  ]}
                />
              ) : undefined
            }
          >
            <ControlSelect
              label="Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as ScenarioType | "all")}
              options={[
                { value: "all", label: "All types" },
                ...TYPE_OPTIONS.map((t) => ({
                  value: t,
                  label: SCENARIO_TYPE_LABELS[t],
                })),
              ]}
            />
            <ControlSelect
              label="Horizon"
              value={horizonFilter}
              onChange={(v) => setHorizonFilter(v as ScenarioHorizon | "all")}
              options={[
                { value: "all", label: "All horizons" },
                ...HORIZON_OPTIONS.map((h) => ({
                  value: h,
                  label: SCENARIO_HORIZON_LABELS[h],
                })),
              ]}
            />
          </ControlBar>

          {filtered.length === 0 ? (
            <p className="text-[12px] text-ink-faint">
              No scenarios match the current filters. Widen the type, horizon or
              evidence-load filter to see the full set.
            </p>
          ) : (
            <div className="space-y-10">
              {groups.map((g) =>
                advanced ? (
                  <TerritoryGroupAdvanced
                    key={g.territory.id}
                    territory={g.territory}
                    scenarios={g.scenarios}
                  />
                ) : (
                  <TerritoryGroup
                    key={g.territory.id}
                    territory={g.territory}
                    scenarios={g.scenarios}
                  />
                ),
              )}
              {orphans.length > 0 ? (
                <OrphanGroup scenarios={orphans} advanced={advanced} />
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  );
}
