"use client";

/**
 * Scenarios — plausible future worlds built from the evolution of a future
 * territory under different conditions. Strategic thought experiments, not
 * predictions. Grouped by the territory each scenario evolves from, with the
 * quality-test pass count and assumption load stated on every card.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { IdChip } from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { DEFINITIONS } from "@/lib/copy";
import type { FutureTerritory, Scenario, ScenarioHorizon } from "@/lib/types";
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

export default function ScenariosPage() {
  const hydrated = useHydrated();
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const territories = useIntelligenceStore((s) => s.territories);

  if (!hydrated) {
    return (
      <>
        <ScenariosHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const territoryIds = new Set(territories.map((t) => t.id));
  const groups = territories
    .map((t) => ({
      territory: t,
      scenarios: sortScenarios(scenarios.filter((s) => s.territoryId === t.id)),
    }))
    .filter((g) => g.scenarios.length > 0);
  const orphans = sortScenarios(
    scenarios.filter((s) => !territoryIds.has(s.territoryId)),
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
  );
}
