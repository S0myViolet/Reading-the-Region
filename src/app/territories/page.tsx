"use client";

/**
 * Future Territories — larger strategic directions of change created by the
 * convergence of multiple drivers. A territory is not a trend, theme,
 * category, campaign idea, prediction, or buzzword; it appears here only
 * after drivers, patterns, clusters, signals, and contradictions exist
 * beneath it.
 *
 * Two registers, one dataset. The simple row is the calm editorial entry:
 * display name, one-line definition, one faint status line. The advanced row
 * answers the reader's five questions at a glance — what future this is, why
 * it is visible now (live counts), which way it is moving, what still
 * challenges it, and where to go deeper. The naming discipline folds into a
 * collapsed reference at the bottom, advanced view only.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { RefreshBar } from "@/components/RefreshControls";
import { Age, FreshnessLine } from "@/components/freshness";
import { useViewMode, ViewGate } from "@/components/ViewMode";
import { TerritoryStatusBadge } from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { DEFINITIONS } from "@/lib/copy";
import {
  checkedReading,
  newestDate,
  territoryEvidenceWindow,
} from "@/lib/freshness";
import type { Contradiction, FutureTerritory } from "@/lib/types";
import { TERRITORY_MONITORING_LABELS } from "@/lib/types";
import {
  backedByLine,
  countInWords,
  evidenceStrengthWords,
  READINESS_TITLES,
  READINESS_WORDS,
  statusToneClass,
  territoryStatusSentence,
} from "./territory-ui";

function TerritoriesHeader({ advanced }: { advanced: boolean }) {
  return (
    <PageHeader
      title="Future Territories"
      description={
        advanced
          ? "Larger directions of change created by converging drivers."
          : DEFINITIONS.territory
      }
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
      "Language built to impress rather than to explain undermines the evidence beneath it.",
  },
];

/**
 * Naming discipline for this layer — collapsed by default so the list stays
 * about the territories themselves. Advanced view only.
 */
function NamingDiscipline() {
  return (
    <details className="mt-14 max-w-2xl">
      <summary className="cursor-pointer list-none text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft">
        How territories are named
      </summary>

      <div className="mt-3">
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
      </div>
    </details>
  );
}

/**
 * Simple-register entry, unchanged from the calm redesign: display heading,
 * one-line definition, then a single faint line with the status badge, its
 * plain sentence, and what the territory rests on.
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

/**
 * Advanced entry: the one-line future, why it is visible now (live counts),
 * which way it is moving (accent tone earned by strengthening evidence only),
 * and the first contradiction still standing against it. Evidence ages are
 * computed live from the record's own dates: the newest indicator check, the
 * newest evidence behind the territory, and the record's own last edit
 * ("updated" — "checked" only if a real check was recorded).
 */
function AdvancedTerritoryEntry({
  territory,
  challengedBy,
  latestEvidence,
  latestIndicatorCheck,
}: {
  territory: FutureTerritory;
  challengedBy: Contradiction | null;
  latestEvidence: string | null;
  latestIndicatorCheck: string | null;
}) {
  const reading = checkedReading(territory);
  return (
    <Link href={`/territories/${territory.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <h2 className="min-w-0 truncate font-display text-[16px] leading-snug text-ink group-hover:text-accent-ink">
          {territory.name}
        </h2>
        <span
          className={`shrink-0 text-[11.5px] ${statusToneClass(territory.monitoringStatus)}`}
        >
          {TERRITORY_MONITORING_LABELS[territory.monitoringStatus]}
        </span>
      </div>

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

      <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-ink-faint">
        {backedByLine(territory)}{" "}
        {latestIndicatorCheck ? (
          <>
            Latest indicator{" "}
            <Age prefix="checked" iso={latestIndicatorCheck} />.{" "}
          </>
        ) : null}
        {challengedBy ? (
          <>Still challenged by {challengedBy.name}.</>
        ) : territory.contradictionIds.length === 0 ? (
          <>No contradiction acknowledged yet.</>
        ) : null}
      </p>

      <FreshnessLine
        className="mt-1.5 text-[11.5px] text-ink-faint"
        latest={latestEvidence}
        checkedAt={reading.date}
        checkedVerb={reading.verb}
      />

      <p className="mt-2 text-[11.5px] text-ink-faint">
        <span className="underline decoration-line-strong underline-offset-2 group-hover:text-ink-soft">
          Explore territory
        </span>
      </p>
    </Link>
  );
}

export default function TerritoriesPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const territories = useIntelligenceStore((s) => s.territories);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const signals = useIntelligenceStore((s) => s.signals);
  const indicators = useIntelligenceStore((s) => s.indicators);
  const advanced = mode !== "simple";

  if (!hydrated) {
    return (
      <>
        <TerritoriesHeader advanced={advanced} />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const ordered = [...territories].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  /** First linked contradiction that resolves to a real record — never invented. */
  const firstChallenge = (t: FutureTerritory): Contradiction | null => {
    for (const id of t.contradictionIds) {
      const found = contradictions.find((c) => c.id === id);
      if (found) return found;
    }
    return null;
  };

  /** Indicators of a territory — linked by id or pointing back at it. */
  const indicatorsOf = (t: FutureTerritory) =>
    indicators.filter(
      (i) => t.leadingIndicatorIds.includes(i.id) || i.territoryId === t.id,
    );

  return (
    <>
      <TerritoriesHeader advanced={advanced} />
      {advanced ? (
        <p className="-mt-5 mb-8 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
          A future territory is not a prediction. It is a possible direction the
          region could move toward if today&rsquo;s drivers keep strengthening.
        </p>
      ) : null}
      <WalkthroughPanel pageId="territories" />
      {advanced ? <RefreshBar /> : null}

      {ordered.length === 0 ? (
        <EmptyState
          message="No future territories yet. Territories should only be created after multiple drivers converge — develop and evidence your drivers first."
          actionLabel="Open Drivers"
          actionHref="/drivers"
        />
      ) : (
        <>
          <section aria-label="Future territories">
            {ordered.map((t) =>
              advanced ? (
                <AdvancedTerritoryEntry
                  key={t.id}
                  territory={t}
                  challengedBy={firstChallenge(t)}
                  latestEvidence={territoryEvidenceWindow(t, signals, indicators).latest}
                  latestIndicatorCheck={newestDate(
                    indicatorsOf(t).map((i) => i.dateLastChecked),
                  )}
                />
              ) : (
                <TerritoryEntry key={t.id} territory={t} />
              ),
            )}
          </section>
          {advanced ? <NamingDiscipline /> : null}
        </>
      )}
    </>
  );
}
