"use client";

/**
 * Local sections for the Futures page (Simple Mode). Page-local by design —
 * nothing here is imported outside src/app/futures/.
 *
 * Futures is a simple surface over the engine's upper layers: clusters and
 * validated patterns become "stories", contradictions become "tensions",
 * territories and drivers become "possibilities" and the "forces" behind
 * them, and scenarios stay possible future worlds. The reader never needs
 * the methodology vocabulary — links lead to the detail routes where deeper
 * analysis lives.
 *
 * Simple-language discipline: derived sentences from @/lib/explain are used
 * wherever possible, but sanitized locally where they carry methodology
 * words (driver, pattern, territory) or digit counts, both banned in
 * Simple Mode UI.
 */

import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { TerritoryStatusBadge } from "@/components/badges";
import {
  explainContradiction,
  explainScenarioEvidence,
  explainTerritoryStatus,
} from "@/lib/explain";
import { capitalize, firstSentence, numberWord } from "@/lib/simple";
import type {
  Cluster,
  ConfidenceLevel,
  Contradiction,
  Driver,
  FutureTerritory,
  Pattern,
  Scenario,
  ScenarioHorizon,
  ScenarioType,
} from "@/lib/types";
import { CONFIDENCE_LABELS } from "@/lib/types";

// ---------------------------------------------------------------------------
// Plain-language helpers
// ---------------------------------------------------------------------------

/** Digit counts inside derived sentences, rewritten as words. */
function plainCounts(text: string): string {
  return text.replace(/\b\d+\b/g, (m) => numberWord(parseInt(m, 10)));
}

function signalCountWords(n: number): string {
  return `${numberWord(n)} signal${n === 1 ? "" : "s"}`;
}

/**
 * The plain status reading from explainTerritoryStatus — the sentence after
 * the evidence-footing preamble — with methodology vocabulary translated
 * into Simple Mode words.
 */
function directionStatusSentence(t: FutureTerritory): string {
  const full = explainTerritoryStatus(t);
  const parts = full.split(". ");
  const status = parts.length > 1 ? parts.slice(1).join(". ") : full;
  return capitalize(
    plainCounts(status)
      .replace(/\b(?:the|this) territory\b/gi, "this direction")
      .replace(/\bterritory\b/gi, "direction")
      .replace(/\bdrivers?\b/g, (m) => (m.endsWith("s") ? "driving forces" : "driving force"))
      .replace(/\bpatterns?\b/g, (m) => (m.endsWith("s") ? "repeated shifts" : "repeated shift")),
  );
}

/** Evidence line for a scenario, counts in words and no methodology labels. */
function scenarioEvidenceLine(s: Scenario): string {
  return plainCounts(firstSentence(explainScenarioEvidence(s)))
    .replace(/\bdrivers\b/g, "driving forces")
    .replace(/\bdriver\b/g, "driving force");
}

const SCENARIO_VIEW_WORDS: Record<ScenarioType, string> = {
  optimistic: "An optimistic view",
  pessimistic: "A pessimistic view",
  conservative: "A conservative view",
  transformational: "A transformational view",
  wildcard: "A wildcard view",
};

const HORIZON_WORDS: Record<ScenarioHorizon, string> = {
  near: "the next 1–2 years",
  mid: "the next 3–5 years",
  long: "the next 5–10 years",
};

const HORIZON_ORDER: Record<ScenarioHorizon, number> = { near: 0, mid: 1, long: 2 };

function scenarioFraming(s: Scenario): string {
  return `${SCENARIO_VIEW_WORDS[s.scenarioType]} of ${HORIZON_WORDS[s.horizon]}`;
}

const exploreLink =
  "text-[12px] font-medium text-accent underline-offset-2 hover:text-accent-ink hover:underline";

// ---------------------------------------------------------------------------
// Stories — emerging narratives forming from multiple signals
// ---------------------------------------------------------------------------

interface Story {
  key: string;
  href: string;
  name: string;
  whyItMatters: string;
  signalCount: number;
  confidence: ConfidenceLevel;
  established: boolean;
  tensionName: string | null;
}

export function StoriesSection({
  clusters,
  patterns,
  contradictions,
}: {
  clusters: Cluster[];
  patterns: Pattern[];
  contradictions: Contradiction[];
}) {
  const firstTensionName = (ids: string[]): string | null => {
    for (const id of ids) {
      const match = contradictions.find((c) => c.id === id);
      if (match) return match.name;
    }
    return null;
  };

  const stories: Story[] = [
    ...clusters
      .filter((c) => c.status !== "dissolved")
      .map((c) => ({
        key: c.id,
        href: `/clusters/${c.id}`,
        name: c.name,
        whyItMatters: firstSentence(c.clusterStatement),
        signalCount: c.signalIds.length,
        confidence: c.confidence,
        established: c.status === "valid",
        tensionName: firstTensionName(c.contradictionIds),
      })),
    ...patterns
      .filter((p) => p.validationStatus === "validated")
      .map((p) => ({
        key: p.id,
        href: `/patterns/${p.id}`,
        name: p.name,
        whyItMatters: firstSentence(p.strategicMeaning),
        signalCount: p.keySignalIds.length,
        confidence: p.confidence,
        established: true,
        tensionName: firstTensionName(p.contradictionIds),
      })),
  ].sort(
    (a, b) =>
      Number(b.established) - Number(a.established) || b.signalCount - a.signalCount,
  );

  if (stories.length === 0) {
    return (
      <EmptyState message="No stories have formed yet. Stories appear when several signals share an underlying logic — keep reviewing New Finds." />
    );
  }

  return (
    <section aria-label="Emerging stories">
      {stories.map((story) => (
        <article key={story.key} className="border-b border-line py-6 last:border-b-0">
          <h2 className="max-w-2xl text-[15px] font-medium leading-snug text-ink">
            <Link href={story.href} className="hover:text-accent-ink">
              {story.name}
            </Link>
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">Why it matters — </span>
            {story.whyItMatters}
          </p>
          <p className="mt-2 text-[12px] text-ink-faint">
            Built on {signalCountWords(story.signalCount)} ·{" "}
            {CONFIDENCE_LABELS[story.confidence]}
            {story.tensionName ? <> · Main tension: {story.tensionName}</> : null}
          </p>
          <p className="mt-2.5">
            <Link href={story.href} className={exploreLink}>
              Explore story
            </Link>
          </p>
        </article>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tensions — contradictions shaping the future
// ---------------------------------------------------------------------------

export function TensionsSection({
  contradictions,
  territories,
  scenarios,
}: {
  contradictions: Contradiction[];
  territories: FutureTerritory[];
  scenarios: Scenario[];
}) {
  const ordered = [...contradictions].sort(
    (a, b) =>
      b.scores.tensionStrength + b.scores.futureImpact -
      (a.scores.tensionStrength + a.scores.futureImpact),
  );

  if (ordered.length === 0) {
    return (
      <EmptyState message="No tensions surfaced yet. Tensions appear when credible evidence pulls in two directions at once — they usually mark where the future is still being decided." />
    );
  }

  return (
    <section aria-label="Tensions shaping the future">
      {ordered.map((c) => {
        const shapes = [
          ...territories.filter((t) => t.contradictionIds.includes(c.id)).map((t) => t.name),
          ...scenarios
            .filter((s) => s.shapingContradictionIds.includes(c.id))
            .map((s) => s.title),
        ];
        return (
          <article key={c.id} className="border-b border-line py-6 last:border-b-0">
            <h2 className="max-w-2xl text-[15px] font-medium leading-snug text-ink">
              <Link href={`/contradictions/${c.id}`} className="hover:text-accent-ink">
                {c.name}
              </Link>
            </h2>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft line-clamp-2">
              {explainContradiction(c)}
            </p>
            {shapes.length > 0 ? (
              <p className="mt-2 text-[12px] text-ink-faint">Shapes: {shapes.join(" · ")}</p>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Possibilities — future directions, and the forces behind them
// ---------------------------------------------------------------------------

export function PossibilitiesSection({
  territories,
  drivers,
}: {
  territories: FutureTerritory[];
  drivers: Driver[];
}) {
  const rank = (t: FutureTerritory) =>
    (t.monitoringStatus === "strengthening" ? 2 : t.monitoringStatus === "mutating" ? 1 : 0) +
    t.evidenceStrength;
  const ordered = [...territories].sort((a, b) => rank(b) - rank(a));

  const forces = [...drivers].sort(
    (a, b) =>
      Number(b.status === "validated") - Number(a.status === "validated") ||
      b.scores.explanatoryPower - a.scores.explanatoryPower,
  );

  if (ordered.length === 0 && forces.length === 0) {
    return (
      <EmptyState message="No future directions have been mapped yet. Directions appear when several stories and tensions converge on the same larger shift — they take time to earn their place." />
    );
  }

  return (
    <>
      {ordered.length === 0 ? (
        <p className="max-w-2xl py-4 text-[13px] leading-relaxed text-ink-soft">
          No future directions have been mapped yet. Directions appear when several
          stories and tensions converge on the same larger shift.
        </p>
      ) : (
        <section aria-label="Future directions">
          {ordered.map((t) => (
            <article key={t.id} className="border-b border-line py-6 last:border-b-0">
              <h2 className="max-w-2xl text-[15px] font-medium leading-snug text-ink">
                <Link href={`/territories/${t.id}`} className="hover:text-accent-ink">
                  {t.name}
                </Link>
              </h2>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
                {t.oneLineDefinition}
              </p>
              <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-ink-faint">
                <TerritoryStatusBadge status={t.monitoringStatus} />{" "}
                {directionStatusSentence(t)}
              </p>
              <p className="mt-2.5">
                <Link href={`/territories/${t.id}`} className={exploreLink}>
                  Explore
                </Link>
              </p>
            </article>
          ))}
        </section>
      )}

      {forces.length > 0 ? (
        <section aria-label="Forces behind these directions" className="mt-12 max-w-2xl">
          <h2 className="text-[13px] font-medium text-ink">Forces behind these directions</h2>
          <p className="mt-1 text-[12px] text-ink-faint">
            Deeper currents of change pushing several of these directions at once.
          </p>
          <ul className="mt-2">
            {forces.map((d) => (
              <li key={d.id} className="border-b border-line py-3.5 last:border-b-0">
                <p className="text-[13px] leading-snug">
                  <Link
                    href={`/drivers/${d.id}`}
                    className="font-medium text-ink hover:text-accent-ink"
                  >
                    {d.name}
                  </Link>
                  {d.status === "hypothesis" ? (
                    <span className="text-[11.5px] text-ink-faint"> · still being tested</span>
                  ) : null}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                  {firstSentence(d.driverStatement)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Scenarios — possible future worlds, grouped by direction
// ---------------------------------------------------------------------------

export function ScenariosSection({
  scenarios,
  territories,
}: {
  scenarios: Scenario[];
  territories: FutureTerritory[];
}) {
  if (scenarios.length === 0) {
    return (
      <EmptyState message="No future worlds have been written yet. They appear once a possibility is well-enough evidenced to explore how the next few years could unfold." />
    );
  }

  const byHorizon = (a: Scenario, b: Scenario) =>
    HORIZON_ORDER[a.horizon] - HORIZON_ORDER[b.horizon] || a.title.localeCompare(b.title);

  const groups: Array<{ key: string; heading: string; items: Scenario[] }> = [];
  for (const t of territories) {
    const items = scenarios.filter((s) => s.territoryId === t.id).sort(byHorizon);
    if (items.length > 0) groups.push({ key: t.id, heading: t.name, items });
  }
  const groupedIds = new Set(groups.flatMap((g) => g.items.map((s) => s.id)));
  const rest = scenarios.filter((s) => !groupedIds.has(s.id)).sort(byHorizon);
  if (rest.length > 0) groups.push({ key: "other", heading: "Other possible worlds", items: rest });

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.heading}>
          <h2 className="text-[13px] font-medium text-ink">{g.heading}</h2>
          <div>
            {g.items.map((s) => (
              <article key={s.id} className="border-b border-line py-5 last:border-b-0">
                <h3 className="max-w-2xl text-[14px] font-medium leading-snug text-ink">
                  <Link href={`/scenarios/${s.id}`} className="hover:text-accent-ink">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-faint">{scenarioFraming(s)}</p>
                <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
                  {firstSentence(s.corePremise)}
                </p>
                <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-ink-faint">
                  {scenarioEvidenceLine(s)}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
