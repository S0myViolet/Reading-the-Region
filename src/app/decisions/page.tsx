"use client";

/**
 * Decisions — what all of this means for action, now.
 *
 * The simple-mode reading of the implication layer: each takeaway leads with
 * its point, carries one clear "Do now" line, and hides its evidence behind
 * a quiet disclosure. Opportunities, risks and the questions worth asking
 * follow as plain lists. No methodology vocabulary anywhere on this page —
 * the advanced /implications section carries that detail.
 */

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { firstSentence } from "@/lib/simple";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import type {
  ConfidenceLevel,
  FutureTerritory,
  Scenario,
  Signal,
  StrategicImplication,
  TimeHorizon,
} from "@/lib/types";
import { IMPLICATION_AUDIENCE_LABELS } from "@/lib/types";

// ---------------------------------------------------------------------------
// Plain words for the meta line
// ---------------------------------------------------------------------------

const HORIZON_WORDS: Record<TimeHorizon, string> = {
  immediate: "already happening",
  near_term: "within the next two years",
  mid_term: "three to five years out",
  long_term: "five to ten years out",
  distant: "ten or more years away",
};

const CONFIDENCE_WORDS: Record<ConfidenceLevel, string> = {
  low: "early, low confidence",
  medium: "reasonably confident",
  high: "high confidence",
};

function joinWords(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * Simple Mode never shows entity ids. Analyst-written prose sometimes cites
 * them inline ("(SIG-003)"); strip them here — the evidence disclosure links
 * to the same objects by name.
 */
const ID_TOKEN = /(?:OBS|SRC|SIG|CLU|PAT|CON|DRV|TER|SCN|IMP|IND)-\d+(?:['’]s)?/g;

function stripIds(text: string): string {
  return text
    .replace(ID_TOKEN, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;:)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function audienceWords(imp: StrategicImplication): string {
  if (imp.audiences.length === 0) return "For anyone acting in the region";
  const words = imp.audiences.map((a) =>
    IMPLICATION_AUDIENCE_LABELS[a].toLowerCase(),
  );
  return `For ${joinWords(words)}`;
}

/** Implications shown on this page — quietly leave out discarded ones. */
function isLive(imp: StrategicImplication): boolean {
  return !["rejected", "archived_noise", "duplicate"].includes(imp.reviewStatus);
}

// ---------------------------------------------------------------------------
// One takeaway entry
// ---------------------------------------------------------------------------

function TakeawayEntry({
  imp,
  signals,
  territory,
  scenario,
}: {
  imp: StrategicImplication;
  signals: Signal[];
  territory: FutureTerritory | null;
  scenario: Scenario | null;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const hasEvidence = signals.length > 0 || territory !== null || scenario !== null;

  return (
    <div className="list-row py-6">
      <p className="max-w-2xl text-[14px] font-medium leading-snug text-ink">
        {firstSentence(stripIds(imp.implication))}
      </p>
      <p className="mt-2 line-clamp-2 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
        {stripIds(imp.whyItMatters)}
      </p>
      <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink">
        <span className="font-medium text-accent-ink">Do now</span>
        <span className="text-ink-faint"> — </span>
        <span className="font-medium">
          {firstSentence(stripIds(imp.recommendedAction))}
        </span>
      </p>
      <p className="mt-2 text-[11.5px] text-ink-faint">
        {audienceWords(imp)} · {HORIZON_WORDS[imp.timeHorizon]} ·{" "}
        {CONFIDENCE_WORDS[imp.confidence]}
      </p>

      {hasEvidence ? (
        <div className="mt-3">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            aria-expanded={showEvidence}
            className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
          >
            {showEvidence ? "Hide evidence" : "Show evidence"}
          </button>
          {showEvidence ? (
            <ul className="mt-2 space-y-1.5">
              {signals.map((s) => (
                <li key={s.id} className="text-[12px] leading-relaxed">
                  <Link
                    href={`/signals/${s.id}`}
                    className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
              {territory ? (
                <li className="text-[12px] leading-relaxed">
                  <Link
                    href={`/territories/${territory.id}`}
                    className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                  >
                    {territory.name}
                  </Link>
                  <span className="text-ink-faint"> · the direction behind this</span>
                </li>
              ) : null}
              {scenario ? (
                <li className="text-[12px] leading-relaxed">
                  <Link
                    href={`/scenarios/${scenario.id}`}
                    className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                  >
                    {scenario.title}
                  </Link>
                  <span className="text-ink-faint"> · the future story behind this</span>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function DecisionsHeader() {
  return (
    <PageHeader
      title="Decisions"
      description="What all of this means for action, now."
    />
  );
}

export default function DecisionsPage() {
  const hydrated = useHydrated();
  const implications = useIntelligenceStore((s) => s.implications);
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const signals = useIntelligenceStore((s) => s.signals);
  const territories = useIntelligenceStore((s) => s.territories);

  if (!hydrated) {
    return (
      <>
        <DecisionsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const takeaways = implications.filter(isLive);
  const opportunities = takeaways
    .filter((i) => i.opportunity.trim().length > 0)
    .map((i) => ({ id: i.id, text: firstSentence(stripIds(i.opportunity)) }));
  const risks = takeaways
    .filter((i) => i.risk.trim().length > 0)
    .map((i) => ({ id: i.id, text: firstSentence(stripIds(i.risk)) }));
  const questions = scenarios
    .filter((sc) => !["rejected", "archived_noise", "duplicate"].includes(sc.reviewStatus))
    .flatMap((sc) =>
      sc.strategicQuestions.map((q, idx) => ({
        key: `${sc.id}-${idx}`,
        question: q,
        scenario: sc,
      })),
    );

  const nothingYet =
    takeaways.length === 0 &&
    opportunities.length === 0 &&
    risks.length === 0 &&
    questions.length === 0;

  return (
    <>
      <DecisionsHeader />
      <WalkthroughPanel pageId="decisions" />

      {nothingYet ? (
        <p className="max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
          No takeaways yet. They appear here once the futures on the{" "}
          <Link
            href="/futures"
            className="underline decoration-line-strong underline-offset-2 hover:text-ink"
          >
            Futures page
          </Link>{" "}
          are turned into recommendations.
        </p>
      ) : null}

      {takeaways.length > 0 ? (
        <section aria-label="What this means" className="mb-12">
          <h2 className="text-[15px] font-medium text-ink">What this means</h2>
          <div className="mt-1">
            {takeaways.map((imp) => (
              <TakeawayEntry
                key={imp.id}
                imp={imp}
                signals={imp.evidenceSignalIds
                  .map((id) => signals.find((s) => s.id === id))
                  .filter((s): s is Signal => s !== undefined)}
                territory={
                  territories.find((t) => t.id === imp.territoryId) ?? null
                }
                scenario={scenarios.find((sc) => sc.id === imp.scenarioId) ?? null}
              />
            ))}
          </div>
        </section>
      ) : null}

      {opportunities.length > 0 ? (
        <section aria-label="Opportunities" className="mb-12">
          <h2 className="text-[15px] font-medium text-ink">Opportunities</h2>
          <ul className="mt-3 max-w-2xl space-y-2.5">
            {opportunities.map((o) => (
              <li key={o.id} className="text-[12.5px] leading-relaxed text-ink-soft">
                {o.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {risks.length > 0 ? (
        <section aria-label="Risks" className="mb-12">
          <h2 className="text-[15px] font-medium text-ink">Risks</h2>
          <ul className="mt-3 max-w-2xl space-y-2.5">
            {risks.map((r) => (
              <li key={r.id} className="text-[12.5px] leading-relaxed text-ink-soft">
                {r.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {questions.length > 0 ? (
        <section aria-label="Questions to ask" className="mb-12">
          <h2 className="text-[15px] font-medium text-ink">Questions to ask</h2>
          <ul className="mt-3 max-w-2xl space-y-2.5">
            {questions.map((q) => (
              <li key={q.key} className="text-[12.5px] leading-relaxed text-ink-soft">
                {q.question}{" "}
                <Link
                  href={`/scenarios/${q.scenario.id}`}
                  className="whitespace-nowrap text-[11.5px] text-ink-faint underline-offset-2 hover:text-ink-soft hover:underline"
                >
                  from {q.scenario.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
