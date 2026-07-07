"use client";

/**
 * Future Territories — larger strategic directions of change created by the
 * convergence of multiple drivers. A territory is not a trend, theme,
 * category, campaign idea, prediction, or buzzword; it appears here only
 * after drivers, patterns, clusters, signals, and contradictions exist
 * beneath it.
 *
 * Visibility layers: the simple reading shows each territory's name,
 * definition, status in plain language (badge never alone) and what it rests
 * on in words. Analyst view adds evidence-strength chips, scenario readiness,
 * review columns and the naming discipline.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ScoreBar } from "@/components/ScorePanel";
import { ViewGate } from "@/components/ViewMode";
import {
  ConfidenceBadge,
  IdChip,
  ReviewStatusBadge,
  TerritoryStatusBadge,
} from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { DEFINITIONS } from "@/lib/copy";
import type { FutureTerritory } from "@/lib/types";
import {
  countInWords,
  EvidenceStrengthChip,
  ScenarioReadinessPill,
  territoryStatusSentence,
} from "./territory-ui";

function TerritoriesHeader() {
  return (
    <PageHeader
      overline="Interpret & Imagine"
      title="Future Territories"
      description={DEFINITIONS.territory}
    />
  );
}

const NAME_QUALITIES: Array<{ quality: string; detail: string }> = [
  { quality: "Simple", detail: "one idea, said once" },
  { quality: "Memorable", detail: "survives a week without the slide" },
  { quality: "Explanatory", detail: "the name itself states the direction of change" },
  { quality: "Grounded", detail: "traceable to the drivers and evidence beneath it" },
  { quality: "Multi-sector", detail: "holds implications across several sectors" },
];

const EXAMPLE_NAMES: string[] = [
  "The Authoring Region",
  "Human Scarcity in an Age of Synthetic Abundance",
  "The Permanent Gulf",
  "Lifestyle Infrastructure",
  "Trust After Automation",
  "Regional Culture as Strategic Capital",
];

const NAME_WARNINGS: Array<{ label: string; detail: string }> = [
  {
    label: "Generic",
    detail:
      "“Digital Transformation”, “The Future of Retail” — names that could sit on any market anywhere say nothing about this region.",
  },
  {
    label: "Trendy",
    detail:
      "Buzzwords date fast. A territory named after this year's vocabulary will read as expired before its evidence does.",
  },
  {
    label: "Poetic but empty",
    detail:
      "A beautiful phrase that cannot be explained back in one sentence is decoration, not direction.",
  },
  {
    label: "Consultancy language",
    detail:
      "“Leveraging synergies”, “holistic ecosystem plays” — language built to impress rather than to explain undermines the evidence beneath it.",
  },
];

/** Naming discipline for this layer, stated before the list. */
function NamingRulesCard() {
  return (
    <section className="card mb-5">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Naming a territory — the name must carry the meaning</h3>
      </header>
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3">
          <p className="overline-label mb-1.5 text-accent-ink">A strong name is</p>
          <ul className="space-y-1">
            {NAME_QUALITIES.map((q) => (
              <li key={q.quality} className="text-[12.5px] text-ink-soft">
                <span className="font-medium text-ink">{q.quality}</span>
                <span className="text-ink-faint"> — {q.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-4 py-3">
          <p className="overline-label mb-1.5 text-caution">Avoid</p>
          <ul className="space-y-1.5">
            {NAME_WARNINGS.map((w) => (
              <li key={w.label} className="text-[11.5px] leading-relaxed text-ink-faint">
                <span className="text-[12.5px] font-medium text-ink-soft">{w.label}.</span>{" "}
                {w.detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-3">
        <p className="overline-label mb-1.5">Reference names that pass the test</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {EXAMPLE_NAMES.map((n) => (
            <li key={n} className="font-display text-[14px] italic text-ink">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TerritoryCard({ territory }: { territory: FutureTerritory }) {
  return (
    <article className="card px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-2xl">
          <p className="overline-label mb-0.5">
            Future territory · <IdChip id={territory.id} />
          </p>
          <h3 className="font-display text-[20px] leading-snug text-ink">
            <Link
              href={`/territories/${territory.id}`}
              className="hover:text-accent-ink hover:underline"
            >
              {territory.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
            {territory.oneLineDefinition.trim() ? (
              territory.oneLineDefinition
            ) : (
              <span className="text-[12px] text-ink-faint">
                No one-line definition recorded yet — a territory that cannot be
                defined in a sentence is not yet a territory.
              </span>
            )}
          </p>
        </div>
        <ViewGate min="analyst">
          <div className="flex shrink-0 flex-col items-end gap-1">
            <ScenarioReadinessPill readiness={territory.scenarioReadiness} />
            <ConfidenceBadge level={territory.confidence} />
            <ReviewStatusBadge status={territory.reviewStatus} />
          </div>
        </ViewGate>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <TerritoryStatusBadge status={territory.monitoringStatus} />
        <span className="text-[12px] leading-relaxed text-ink-soft">
          {territoryStatusSentence(territory)}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-ink-soft">
        Rests on {countInWords(territory.driverIds.length, "driver")} and{" "}
        {countInWords(territory.patternIds.length, "pattern")}.
      </p>

      <ViewGate min="analyst">
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-2.5">
          <ScoreBar value={territory.evidenceStrength} label="Evidence strength" />
          <EvidenceStrengthChip value={territory.evidenceStrength} />
          <span className="font-mono text-[11.5px] text-ink-soft">
            {territory.driverIds.length} driver{territory.driverIds.length === 1 ? "" : "s"}
          </span>
          <span className="font-mono text-[11.5px] text-ink-soft">
            {territory.patternIds.length} pattern{territory.patternIds.length === 1 ? "" : "s"}
          </span>
          <span className="font-mono text-[11.5px] text-ink-soft">
            {territory.contradictionIds.length} contradiction
            {territory.contradictionIds.length === 1 ? "" : "s"}
          </span>
        </div>
      </ViewGate>
    </article>
  );
}

export default function TerritoriesPage() {
  const hydrated = useHydrated();
  const territories = useIntelligenceStore((s) => s.territories);

  if (!hydrated) {
    return (
      <>
        <TerritoriesHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const ordered = [...territories].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  return (
    <>
      <TerritoriesHeader />
      <WalkthroughPanel pageId="territories" />
      <ViewGate min="analyst">
        <NamingRulesCard />
      </ViewGate>

      {ordered.length === 0 ? (
        <EmptyState
          message="No future territories yet. Territories should only be created after multiple drivers converge — develop and evidence your drivers first."
          actionLabel="Open Drivers"
          actionHref="/drivers"
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((t) => (
            <TerritoryCard key={t.id} territory={t} />
          ))}
        </div>
      )}
    </>
  );
}
