"use client";

/**
 * Future Territories — larger strategic directions of change created by the
 * convergence of multiple drivers. A territory is not a trend, theme,
 * category, campaign idea, prediction, or buzzword; it appears here only
 * after drivers, patterns, clusters, signals, and contradictions exist
 * beneath it.
 *
 * Calm layout: territories are few and important, so each renders as a
 * generous editorial entry — display name, one-line definition, then one
 * faint status line (badge + plain sentence, with analyst extras folded in
 * as words). The naming discipline sits quietly below the list, analyst-only.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ViewGate } from "@/components/ViewMode";
import { TerritoryStatusBadge } from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { DEFINITIONS } from "@/lib/copy";
import type { FutureTerritory } from "@/lib/types";
import {
  countInWords,
  evidenceStrengthWords,
  READINESS_TITLES,
  READINESS_WORDS,
  territoryStatusSentence,
} from "./territory-ui";

function TerritoriesHeader() {
  return (
    <PageHeader
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

/**
 * Naming discipline for this layer — a quiet reference section beneath the
 * list, analyst view only. Boxless: headings and faint text carry it.
 */
function NamingDiscipline() {
  return (
    <section className="mt-14 max-w-2xl">
      <h2 className="text-[13px] font-medium text-ink">
        Naming a territory — the name must carry the meaning
      </h2>

      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
        A strong name is{" "}
        {NAME_QUALITIES.map((q, i) => (
          <span key={q.quality}>
            {i > 0 ? "; " : ""}
            <span className="font-medium text-ink">{q.quality.toLowerCase()}</span>
            <span className="text-ink-faint"> ({q.detail})</span>
          </span>
        ))}
        .
      </p>

      <ul className="mt-4 space-y-2">
        {NAME_WARNINGS.map((w) => (
          <li key={w.label} className="text-[12px] leading-relaxed text-ink-faint">
            <span className="text-[12.5px] font-medium text-ink-soft">
              Avoid {w.label.toLowerCase()}.
            </span>{" "}
            {w.detail}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12px] text-ink-faint">
        Reference names that pass the test:{" "}
        {EXAMPLE_NAMES.map((n, i) => (
          <span key={n}>
            {i > 0 ? " · " : ""}
            <span className="font-display text-[13px] italic text-ink-soft">{n}</span>
          </span>
        ))}
      </p>
    </section>
  );
}

/**
 * One generous editorial entry per territory: display heading, one-line
 * definition, then a single faint line with the status badge, its plain
 * sentence, what the territory rests on, and — in analyst view — evidence
 * strength and scenario readiness as words.
 */
function TerritoryEntry({ territory }: { territory: FutureTerritory }) {
  return (
    <article className="border-b border-line py-7 last:border-b-0">
      <h2 className="font-display text-[16px] leading-snug text-ink">
        <Link
          href={`/territories/${territory.id}`}
          className="hover:text-accent-ink"
        >
          {territory.name}
        </Link>
      </h2>

      <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
        {territory.oneLineDefinition.trim() ? (
          territory.oneLineDefinition
        ) : (
          <span className="text-[12px] text-ink-faint">
            No one-line definition recorded yet — a territory that cannot be
            defined in a sentence is not yet a territory.
          </span>
        )}
      </p>

      <p className="mt-2.5 max-w-2xl text-[12px] leading-relaxed text-ink-faint">
        <TerritoryStatusBadge status={territory.monitoringStatus} />{" "}
        {territoryStatusSentence(territory)} Rests on{" "}
        {countInWords(territory.driverIds.length, "driver")} and{" "}
        {countInWords(territory.patternIds.length, "pattern")}.
        <ViewGate min="analyst">
          {" "}
          <span title={READINESS_TITLES[territory.scenarioReadiness]}>
            {evidenceStrengthWords(territory.evidenceStrength)} ·{" "}
            {READINESS_WORDS[territory.scenarioReadiness]} ·{" "}
            {countInWords(territory.contradictionIds.length, "contradiction")}{" "}
            acknowledged
          </span>
        </ViewGate>
      </p>
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

      {ordered.length === 0 ? (
        <EmptyState
          message="No future territories yet. Territories should only be created after multiple drivers converge — develop and evidence your drivers first."
          actionLabel="Open Drivers"
          actionHref="/drivers"
        />
      ) : (
        <>
          <section aria-label="Future territories">
            {ordered.map((t) => (
              <TerritoryEntry key={t.id} territory={t} />
            ))}
          </section>
          <ViewGate min="analyst">
            <NamingDiscipline />
          </ViewGate>
        </>
      )}
    </>
  );
}
