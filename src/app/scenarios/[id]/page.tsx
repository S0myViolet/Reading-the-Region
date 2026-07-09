"use client";

/**
 * Scenario detail — one plausible future world evolved from a future
 * territory. A scenario is presented as a structured possibility, never a
 * prediction.
 *
 * Visibility layers: the simple reading gives the premise, what has changed,
 * how people, institutions and brands behave, the evidence-honesty line
 * (including the assumption-heavy warning), the shaping contradictions as
 * sentences, the declared assumptions with their provenance labels (labelling
 * speculation is a reader-facing duty, not analyst depth), and a next step —
 * with the relationship trail visible in every mode. Analyst view opens the
 * tabs: a plain-English overview, what has to be true for this world to
 * develop, consequences, evidence links, the nine quality checks and review
 * controls. Methodology view adds the rulebook — evidence linkage rules, the
 * quality-test rubric, the assumptions rule, the scenario-vs-prediction rule
 * — and the audit trail.
 *
 * Calm layout: the left column reads as an article — small headings, short
 * paragraphs, whitespace instead of stacked cards.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { DepthHint, useViewMode, ViewGate } from "@/components/ViewMode";
import { NoContradictionNote } from "@/components/ContradictionPanel";
import { RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import {
  AtAGlance,
  ConnectBlock,
  IncompleteNote,
  RelationshipTrail,
  ShowAllList,
  StatusStrip,
  type TrailGroup,
} from "@/components/connect";
import { IdChip, Pill, ProvenanceBadge } from "@/components/badges";
import { Field, Select } from "@/components/form";
import { Age } from "@/components/freshness";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  checkedReading,
  fullDate,
  relativeAge,
  scenarioEvidenceWindow,
  signalEvidenceAt,
} from "@/lib/freshness";
import { signalStage } from "@/lib/pipeline";
import {
  explainContradiction,
  explainScenarioEvidence,
  patternPlainMeaning,
} from "@/lib/explain";
import { firstSentence } from "@/lib/simple";
import {
  scenarioAssumptionHeavy,
  validateScenario,
  type ValidationResult,
} from "@/lib/validation";
import type {
  ConfidenceLevel,
  Contradiction,
  Driver,
  FutureTerritory,
  Pattern,
  ReviewStatus,
  Scenario,
  ScenarioQualityChecks,
  Signal,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  PROVENANCE_LABELS,
  REVIEW_STATUS_LABELS,
  SCENARIO_HORIZON_LABELS,
  SCENARIO_QUALITY_LABELS,
  SCENARIO_TYPE_LABELS,
  SIGNAL_STRENGTH_LABELS,
} from "@/lib/types";
import {
  fmtDate,
  QUALITY_DETAILS,
  QUALITY_KEYS,
  QUALITY_TEST_TOTAL,
  qualityPassCount,
  SCENARIO_HORIZON_PLAIN,
  SCENARIO_QUALITY_MEANINGS,
  shortParagraphs,
} from "../scenario-ui";

// ---------------------------------------------------------------------------
// Small building blocks — article sections, boxless
// ---------------------------------------------------------------------------

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
        <h2 className="text-[13px] font-medium text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ProseOrNote({ text, note }: { text: string; note: string }) {
  if (text.trim()) {
    return <p className="text-[13px] leading-relaxed text-ink-soft">{text}</p>;
  }
  return <p className="text-[12px] leading-relaxed text-ink-faint">{note}</p>;
}

/** Dense prose broken into short paragraphs of one to two sentences. */
function ShortParagraphs({ text, note }: { text: string; note: string }) {
  const paragraphs = shortParagraphs(text);
  if (paragraphs.length === 0) {
    return <p className="text-[12px] leading-relaxed text-ink-faint">{note}</p>;
  }
  return (
    <div className="space-y-2">
      {paragraphs.map((p, i) => (
        <p key={`${i}-${p.slice(0, 24)}`} className="text-[13px] leading-relaxed text-ink-soft">
          {p}
        </p>
      ))}
    </div>
  );
}

/** A plain list under a faint label — the calm replacement for boxed lists. */
function PlainList({
  label,
  items,
  emptyNote,
}: {
  label?: string;
  items: string[];
  emptyNote: string;
}) {
  return (
    <div>
      {label ? <p className="mb-1.5 text-[11.5px] text-ink-faint">{label}</p> : null}
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((t, i) => (
            <li key={`${i}-${t}`} className="text-[13px] leading-relaxed text-ink-soft">
              {t}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] leading-relaxed text-ink-faint">{emptyNote}</p>
      )}
    </div>
  );
}

/** The early-signs sections always say where the watching happens. */
function MonitoringNote() {
  return (
    <p className="mt-2.5 text-[11.5px] text-ink-faint">
      Track these in{" "}
      <Link
        href="/monitoring"
        className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
      >
        Monitoring
      </Link>
      , and watch for them in the{" "}
      <Link
        href="/inbox"
        className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
      >
        Scan Inbox
      </Link>
      . Early signs are how a scenario is monitored rather than believed.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Simple reading — the default view for the simple product mode
// ---------------------------------------------------------------------------

/** Shaping contradictions as readable sentences; the absence is explicit. */
function ShapingContradictions({ items }: { items: Contradiction[] }) {
  if (items.length === 0) return <NoContradictionNote />;
  return (
    <ul className="space-y-2.5">
      {items.map((c) => (
        <li key={c.id} className="text-[13px] leading-relaxed text-ink-soft">
          <Link
            href={`/contradictions/${c.id}`}
            className="font-medium text-ink hover:text-accent-ink hover:underline"
          >
            {c.name}
          </Link>
          {" — "}
          {explainContradiction(c)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Declared assumptions as a plain list, each item ending with its provenance
 * label as faint italic text. This stays in the simple reading: labelling
 * speculation is a reader-facing duty, not analyst depth.
 */
function AssumptionsSection({ scenario }: { scenario: Scenario }) {
  return (
    <Section title={`Declared assumptions (${scenario.assumptions.length})`}>
      {scenario.assumptions.length > 0 ? (
        <ul className="space-y-2">
          {scenario.assumptions.map((a, i) => (
            <li
              key={`${i}-${a.text}`}
              className="text-[13px] leading-relaxed text-ink-soft"
            >
              {a.text}{" "}
              <span className="whitespace-nowrap text-[11.5px] italic text-ink-faint">
                — {PROVENANCE_LABELS[a.label].toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] leading-relaxed text-ink-faint">
          No assumptions declared yet. Every scenario rests on assumptions —
          leaving them unstated does not remove them, it only hides them from
          review.
        </p>
      )}
      <p className="mt-2.5 text-[11.5px] text-ink-faint">
        Anything not linked to evidence is an assumption, and assumptions are
        the first thing to monitor.
      </p>
    </Section>
  );
}

function BehaviourLine({
  label,
  text,
  note,
}: {
  label: string;
  text: string;
  note: string;
}) {
  return (
    <p className="text-[13px] leading-relaxed text-ink-soft">
      <span className="text-ink-faint">{label} — </span>
      {text.trim() ? text : <span className="text-[12px] text-ink-faint">{note}</span>}
    </p>
  );
}

function SimpleReading({
  scenario,
  assumptionHeavy,
  shapingContradictions,
}: {
  scenario: Scenario;
  assumptionHeavy: boolean;
  shapingContradictions: Contradiction[];
}) {
  return (
    <div className="max-w-2xl space-y-8">
      <Section
        title="What this future looks like"
        aside={<ProvenanceBadge label="speculative_possibility" />}
      >
        {scenario.corePremise.trim() ? (
          <p className="font-display text-[16.5px] italic leading-relaxed text-ink">
            {scenario.corePremise}
          </p>
        ) : (
          <p className="text-[12px] leading-relaxed text-ink-faint">
            No core premise recorded yet. A scenario needs one clear statement
            of the world it describes — the conditions under which the
            territory has evolved.
          </p>
        )}
      </Section>

      <Section title="What has changed">
        <ProseOrNote
          text={scenario.whatHasChanged}
          note="Not recorded yet. State what is different in this world compared with today — the change is what makes the thought experiment testable."
        />
      </Section>

      <Section title="Behaviour in this world">
        <div className="space-y-2.5">
          <BehaviourLine
            label="Who feels the change"
            text={scenario.howPeopleBehave}
            note="Not recorded yet — describe everyday behaviour, not attitudes."
          />
          <BehaviourLine
            label="How institutions respond"
            text={scenario.howInstitutionsBehave}
            note="Not recorded yet — governments, regulators, and public bodies."
          />
          <BehaviourLine
            label="How brands respond"
            text={scenario.howBrandsBehave}
            note="Not recorded yet — commercial and cultural organizations."
          />
        </div>
      </Section>

      <Section
        title="Evidence honesty"
        aside={assumptionHeavy ? <Pill tone="caution">Assumption-heavy</Pill> : undefined}
      >
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {explainScenarioEvidence(scenario)}
        </p>
      </Section>

      <Section title="What shapes it">
        <ShapingContradictions items={shapingContradictions} />
      </Section>

      <AssumptionsSection scenario={scenario} />

      <Section title="Next step">
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {assumptionHeavy ? (
            "Strengthen the evidence before this scenario informs strategy: link more supporting signals, patterns and drivers so evidence outweighs assumption."
          ) : (
            <>
              Translate this world into{" "}
              <Link
                href="/implications"
                className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
              >
                strategic implications
              </Link>{" "}
              — what should be done differently now if this future may be
              forming.
            </>
          )}
        </p>
      </Section>

      <DepthHint>
        What has to be true, winners and losers, quality checks and evidence links
      </DepthHint>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview tab (analyst) — plain English first, depth in the other tabs
// ---------------------------------------------------------------------------

function OverviewTab({
  scenario,
  territory,
  mainTension,
}: {
  scenario: Scenario;
  territory: FutureTerritory | undefined;
  mainTension: Contradiction | null;
}) {
  const questions = scenario.strategicQuestions;
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        {scenario.corePremise.trim() ? (
          <p className="font-display text-[17px] italic leading-relaxed text-ink">
            {scenario.corePremise}
          </p>
        ) : (
          <p className="text-[12px] leading-relaxed text-ink-faint">
            No core premise recorded yet. A scenario needs one clear statement
            of the world it describes.
          </p>
        )}
        <p className="mt-2 text-[11.5px] text-ink-faint">
          This is plausible, not proven. What it depends on is spelled out
          under “What has to be true”.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-[13px] font-medium text-ink">
          Scenario at a glance
        </h2>
        <AtAGlance
          items={[
            { label: "Time horizon", value: SCENARIO_HORIZON_PLAIN[scenario.horizon] },
            {
              label: "Scenario type",
              value: SCENARIO_TYPE_LABELS[scenario.scenarioType],
            },
            {
              label: "Territory",
              value: territory ? (
                <Link
                  href={`/territories/${territory.id}`}
                  className="hover:text-accent-ink"
                >
                  {territory.name}
                </Link>
              ) : (
                "Territory not found"
              ),
            },
            {
              label: "Main tension",
              value: mainTension ? (
                <Link
                  href={`/contradictions/${mainTension.id}`}
                  className="hover:text-accent-ink"
                >
                  {mainTension.name}
                </Link>
              ) : (
                "None linked"
              ),
            },
            {
              label: "Key risk",
              value: scenario.risks[0]
                ? firstSentence(scenario.risks[0])
                : "None recorded yet",
            },
            {
              label: "Key opportunity",
              value: scenario.opportunities[0]
                ? firstSentence(scenario.opportunities[0])
                : "None recorded yet",
            },
          ]}
        />
      </section>

      <ConnectBlock heading="What makes this scenario different">
        {scenario.differentiator?.trim() ? (
          <p>{scenario.differentiator}</p>
        ) : (
          <p className="text-[12px] text-ink-faint">
            Not recorded yet. One sentence should say how this scenario differs
            from the other scenarios built on its territory.
          </p>
        )}
      </ConnectBlock>

      <section>
        <h2 className="text-[13px] font-medium text-ink">What has to be true</h2>
        <p className="mb-3 mt-0.5 text-[11.5px] text-ink-faint">
          The short version — the full reasoning sits in the “What has to be
          true” tab.
        </p>
        <div className="space-y-4">
          <PlainList
            label="Technologies"
            items={scenario.keyTechnologies.map(firstSentence)}
            emptyNote="No key technologies recorded yet."
          />
          <PlainList
            label="Policies"
            items={scenario.keyPolicies.map(firstSentence)}
            emptyNote="No key policies recorded yet."
          />
          <PlainList
            label="Cultural shifts"
            items={scenario.keyCulturalShifts.map(firstSentence)}
            emptyNote="No key cultural shifts recorded yet."
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-ink">
          Who gains and who loses
        </h2>
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <PlainList
            label="Winners"
            items={scenario.winners.map(firstSentence)}
            emptyNote="No winners identified yet — a world where nobody gains is usually under-thought."
          />
          <PlainList
            label="Losers"
            items={scenario.losers.map(firstSentence)}
            emptyNote="No losers identified yet — a world where nobody loses is usually optimistic fantasy."
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-ink">
          Risks and opportunities
        </h2>
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <PlainList
            label="Risks"
            items={scenario.risks.map(firstSentence)}
            emptyNote="No risks recorded yet for this world."
          />
          <PlainList
            label="Opportunities"
            items={scenario.opportunities.map(firstSentence)}
            emptyNote="No opportunities recorded yet for this world."
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-ink">
          Strategic questions
        </h2>
        <PlainList
          items={questions.slice(0, 5)}
          emptyNote="No strategic questions recorded yet. A scenario earns its keep by sharpening the questions decision-makers must answer now."
        />
        {questions.length > 5 ? (
          <p className="mt-2 text-[11.5px] text-ink-faint">
            All {questions.length} questions are in the Consequences tab.
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-2.5 text-[13px] font-medium text-ink">
          Early signs to watch
        </h2>
        <PlainList
          items={scenario.earlySigns}
          emptyNote="No early signs recorded yet. Without them this scenario cannot be monitored — only believed or dismissed."
        />
        {scenario.earlySigns.length > 0 ? <MonitoringNote /> : null}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "What has to be true" tab (analyst) — the conditions of this world
// ---------------------------------------------------------------------------

function WhatHasToBeTrueTab({ scenario }: { scenario: Scenario }) {
  return (
    <div className="max-w-2xl space-y-8">
      <p className="text-[13px] leading-relaxed text-ink-soft">
        What has to be true for this world to develop.
      </p>

      <Section title="How this world looks">
        <ShortParagraphs
          text={scenario.whatHasChanged}
          note="Not recorded yet. State what is different in this world compared with today — the change is what makes the thought experiment testable."
        />
      </Section>

      <Section title="Technologies">
        <PlainList
          items={scenario.keyTechnologies}
          emptyNote="No key technologies recorded yet."
        />
      </Section>

      <Section title="Policies">
        <PlainList
          items={scenario.keyPolicies}
          emptyNote="No key policies recorded yet."
        />
      </Section>

      <Section title="Culture and behaviour">
        <PlainList
          items={scenario.keyCulturalShifts}
          emptyNote="No key cultural shifts recorded yet."
        />
        <div className="mt-3">
          <p className="mb-1.5 text-[11.5px] text-ink-faint">
            How people live in this world
          </p>
          <ShortParagraphs
            text={scenario.howPeopleBehave}
            note="Not recorded yet — describe everyday behaviour, not attitudes."
          />
        </div>
      </Section>

      <Section title="Business model shifts">
        <ShortParagraphs
          text={scenario.howBrandsBehave}
          note="Not recorded yet — how brands, retailers and other commercial operators change their offer in this world."
        />
      </Section>

      <Section title="Public-sector choices">
        <ShortParagraphs
          text={scenario.howInstitutionsBehave}
          note="Not recorded yet — governments, regulators, schools and public bodies."
        />
      </Section>

      <Section title={`Declared assumptions (${scenario.assumptions.length})`}>
        <p className="mb-2.5 text-[12px] leading-relaxed text-ink-soft">
          Assumptions are not evidence. They are the statements this world
          rests on that nothing in the evidence base yet supports.
        </p>
        {scenario.assumptions.length > 0 ? (
          <ul className="space-y-2.5">
            {scenario.assumptions.map((a, i) => (
              <li
                key={`${i}-${a.text}`}
                className="text-[13px] leading-relaxed text-ink-soft"
              >
                {a.text}{" "}
                <span className="ml-1 inline-block align-baseline">
                  <ProvenanceBadge label={a.label} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] leading-relaxed text-ink-faint">
            No assumptions declared yet. Every scenario rests on assumptions —
            leaving them unstated does not remove them, it only hides them from
            review.
          </p>
        )}
        <p className="mt-2.5 text-[11.5px] text-ink-faint">
          Anything not linked to evidence is an assumption, and assumptions are
          the first thing to monitor.
        </p>
        <p className="mt-2 text-[11.5px] text-ink-faint">
          <span title={fullDate(scenario.updatedAt)}>
            Assumptions last revisited {relativeAge(scenario.updatedAt)}
          </span>{" "}
          (the record&rsquo;s last update) — if supporting evidence has moved
          since, review them.
        </p>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Consequences tab (analyst)
// ---------------------------------------------------------------------------

function ConsequencesTab({ scenario }: { scenario: Scenario }) {
  return (
    <div className="max-w-2xl space-y-8">
      <Section title="Winners">
        <PlainList
          items={scenario.winners.map(firstSentence)}
          emptyNote="No winners identified yet — a world where nobody gains is usually under-thought."
        />
      </Section>

      <Section title="Losers">
        <PlainList
          items={scenario.losers.map(firstSentence)}
          emptyNote="No losers identified yet — a world where nobody loses is usually optimistic fantasy."
        />
      </Section>

      <Section title="Risks">
        <PlainList
          items={scenario.risks.map(firstSentence)}
          emptyNote="No risks recorded yet for this world."
        />
      </Section>

      <Section title="Opportunities">
        <PlainList
          items={scenario.opportunities.map(firstSentence)}
          emptyNote="No opportunities recorded yet for this world."
        />
      </Section>

      <Section title="Strategic questions">
        <PlainList
          items={scenario.strategicQuestions}
          emptyNote="No strategic questions recorded yet. A scenario earns its keep by sharpening the questions decision-makers must answer now."
        />
      </Section>

      <Section title="Early signs to watch">
        <PlainList
          items={scenario.earlySigns}
          emptyNote="No early signs recorded yet. Without them this scenario cannot be monitored — only believed or dismissed."
        />
        <MonitoringNote />
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence tab (analyst) — link lists back down the pyramid
// ---------------------------------------------------------------------------

function EvidenceTab({
  scenario,
  supportingSignals,
  supportingPatterns,
  supportingDrivers,
  shapingContradictions,
}: {
  scenario: Scenario;
  supportingSignals: Signal[];
  supportingPatterns: Pattern[];
  supportingDrivers: Driver[];
  shapingContradictions: Contradiction[];
}) {
  const signalRows = supportingSignals.map((s) => (
    <div
      key={s.id}
      className="flex items-baseline justify-between gap-6 py-2 first:pt-0"
    >
      <Link
        href={`/signals/${s.id}`}
        className="min-w-0 text-[12.5px] text-ink hover:text-accent-ink hover:underline"
      >
        {s.title}
      </Link>
      <span className="shrink-0 text-[11.5px] text-ink-faint">
        {SIGNAL_STRENGTH_LABELS[s.signalStrength]} · {s.country} ·{" "}
        <Age prefix="evidence" iso={signalEvidenceAt(s)} />
      </span>
    </div>
  ));

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          This does not prove the scenario will happen. It shows which
          present-day evidence makes the scenario plausible.
        </p>
        <p className="mt-1 text-[11.5px] text-ink-faint">
          {explainScenarioEvidence(scenario)}
        </p>
      </div>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Supporting signals ({supportingSignals.length})
        </h3>
        {supportingSignals.length > 0 ? (
          <div className="divide-y divide-line">
            <ShowAllList items={signalRows} previewCount={6} noun="signals" />
          </div>
        ) : (
          <p className="text-[11.5px] text-ink-faint">
            No supporting signals linked yet. A scenario must trace back to
            present-day evidence.
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Supporting patterns ({supportingPatterns.length})
        </h3>
        {supportingPatterns.length > 0 ? (
          <ul className="space-y-3">
            {supportingPatterns.map((p) => (
              <li key={p.id}>
                <p className="text-[12.5px]">
                  <Link
                    href={`/patterns/${p.id}`}
                    className="font-medium text-ink hover:text-accent-ink hover:underline"
                  >
                    {p.name}
                  </Link>{" "}
                  <IdChip id={p.id} />
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                  {patternPlainMeaning(p)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-faint">
            No supporting patterns linked yet.
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Supporting drivers ({supportingDrivers.length})
        </h3>
        {supportingDrivers.length > 0 ? (
          <ul className="space-y-3">
            {supportingDrivers.map((d) => (
              <li key={d.id}>
                <p className="text-[12.5px]">
                  <Link
                    href={`/drivers/${d.id}`}
                    className="font-medium text-ink hover:text-accent-ink hover:underline"
                  >
                    {d.name}
                  </Link>{" "}
                  <IdChip id={d.id} />
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                  {firstSentence(d.driverStatement)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-ink-faint">
            No supporting drivers linked yet. The forces that would push the
            territory into this world are unstated.
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Shaping contradictions ({shapingContradictions.length})
        </h3>
        {shapingContradictions.length > 0 ? (
          <ul className="space-y-3">
            {shapingContradictions.map((c) => (
              <li key={c.id}>
                <p className="text-[12.5px]">
                  <Link
                    href={`/contradictions/${c.id}`}
                    className="font-medium text-ink hover:text-accent-ink hover:underline"
                  >
                    {c.name}
                  </Link>{" "}
                  <IdChip id={c.id} />
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                  {explainContradiction(c)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <NoContradictionNote />
        )}
      </section>

      <p className="text-[11.5px] text-ink-faint">
        The full chain from this scenario back to its territory, drivers,
        patterns and signals sits in the “Evidence trail” panel beside this
        page.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quality check tab (analyst) — nine analyst judgements, honestly shown
// ---------------------------------------------------------------------------

function QualityTab({
  checks,
  updatedAt,
}: {
  checks: ScenarioQualityChecks;
  updatedAt: string;
}) {
  const passed = qualityPassCount(checks);
  const allPass = passed === QUALITY_TEST_TOTAL;
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-[13px] leading-relaxed text-ink-soft">
        These checks stop the scenario from becoming fantasy, hype, or a
        hidden prediction.
      </p>
      <p className="text-[12.5px] font-medium">
        <span className={allPass ? "text-accent-ink" : "text-ink"}>
          {passed} of {QUALITY_TEST_TOTAL} checks passed
        </span>
      </p>
      <p className="text-[11.5px] text-ink-faint">
        Tally counted live on this page ·{" "}
        <span title={fullDate(updatedAt)}>
          quality judgements recorded {relativeAge(updatedAt)}
        </span>{" "}
        (with the record&rsquo;s last update).
      </p>
      <ul className="divide-y divide-line border-t border-line">
        {QUALITY_KEYS.map((k) => (
          <li key={k} className="py-3">
            <div className="flex items-baseline justify-between gap-6">
              <p className="text-[12.5px] font-medium text-ink">
                {SCENARIO_QUALITY_LABELS[k]}
              </p>
              <span
                className={`shrink-0 text-[11.5px] ${
                  checks[k] ? "text-accent-ink" : "text-caution"
                }`}
              >
                {checks[k] ? "Pass" : "Not passed"}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
              {SCENARIO_QUALITY_MEANINGS[k]}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-[11.5px] text-ink-faint">
        These nine checks are analyst judgements recorded on the scenario, not
        computed thresholds. Re-run them whenever the evidence base or the
        sibling scenarios change.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab (analyst)
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ scenario }: { scenario: Scenario }) {
  const updateScenario = useIntelligenceStore((s) => s.updateScenario);

  return (
    <div className="max-w-2xl space-y-5">
      <section>
        <h3 className="text-[13px] font-medium text-ink">Human review</h3>
        <p className="mb-3 mt-0.5 text-[12px] text-ink-faint">
          Record human judgement here. Review notes are separate from the
          evidence base.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Review status"
            hint="A review decision about the record — a scenario is never marked validated as a prediction, only as a well-built possibility."
          >
            <Select
              value={scenario.reviewStatus}
              onChange={(e) =>
                updateScenario(scenario.id, {
                  reviewStatus: e.target.value as ReviewStatus,
                })
              }
            >
              {REVIEW_STATUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {REVIEW_STATUS_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Confidence"
            hint="How much trust to place in this possibility during strategy work — plausibility, not probability."
          >
            <Select
              value={scenario.confidence}
              onChange={(e) =>
                updateScenario(scenario.id, {
                  confidence: e.target.value as ConfidenceLevel,
                })
              }
            >
              {CONFIDENCE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CONFIDENCE_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>
      <ViewGate min="methodology">
        <p className="text-[11.5px] text-ink-faint">
          Created {fmtDate(scenario.createdAt)} · Last updated{" "}
          {fmtDate(scenario.updatedAt)}
        </p>
      </ViewGate>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Methodology tab (methodology only) — the rulebook, in four short sections
// ---------------------------------------------------------------------------

function RuleList({ rules }: { rules: string[] }) {
  return (
    <ul className="space-y-1.5">
      {rules.map((r) => (
        <li key={r} className="text-[12.5px] leading-relaxed text-ink-soft">
          {r}
        </li>
      ))}
    </ul>
  );
}

function MethodologyTab({
  scenario,
  result,
}: {
  scenario: Scenario;
  result: ValidationResult;
}) {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h3 className="text-[13px] font-medium text-ink">Evidence linkage rules</h3>
        <p className="mb-3 mt-0.5 text-[12px] leading-relaxed text-ink-soft">
          A scenario must stay traceable to the evidence base. Each rule is
          checked against this record.
        </p>
        <ul className="divide-y divide-line border-t border-line">
          {result.checks.map((c) => (
            <li key={c.label} className="py-2.5">
              <div className="flex items-baseline justify-between gap-6">
                <p className="text-[12.5px] font-medium text-ink">{c.label}</p>
                <span
                  className={`shrink-0 text-[11.5px] ${
                    c.passed ? "text-accent-ink" : "text-caution"
                  }`}
                >
                  {c.passed ? "Pass" : "Not yet"}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                {c.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-[13px] font-medium text-ink">Quality-test rubric</h3>
        <p className="mb-3 mt-0.5 text-[12px] leading-relaxed text-ink-soft">
          Nine analyst judgements recorded on the record. Each check asks one
          question before it may be marked as passed.
        </p>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>What it asks</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY_KEYS.map((k) => (
                <tr key={k}>
                  <td className="whitespace-nowrap text-[12px] text-ink">
                    {SCENARIO_QUALITY_LABELS[k]}
                  </td>
                  <td className="text-[12px] leading-relaxed text-ink-soft">
                    {QUALITY_DETAILS[k]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">Assumptions rule</h3>
        <RuleList
          rules={[
            "Anything not linked to evidence is an assumption. It must be declared, not implied.",
            "Every assumption is labelled — Hypothesis or Speculative possibility — so speculation is never dressed as fact.",
            "Assumptions stay visibly separate from evidence, and they are the first thing to monitor.",
            "When assumptions outnumber evidence links, the scenario is flagged assumption-heavy and treated as exploratory.",
          ]}
        />
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Scenario vs prediction rule
        </h3>
        <RuleList
          rules={[
            "A scenario is a structured possibility, never a forecast.",
            "Review may mark it as a well-built possibility; it is never validated as a prediction.",
            "Confidence records plausibility, not probability.",
            "Early signs make the scenario testable — it is monitored, not believed.",
          ]}
        />
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">Audit trail</h3>
        <dl className="max-w-sm space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Record id</dt>
            <dd>
              <IdChip id={scenario.id} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Created</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(scenario.createdAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Last updated</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(scenario.updatedAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Review status</dt>
            <dd className="text-[12px] text-ink-soft">
              {REVIEW_STATUS_LABELS[scenario.reviewStatus]}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Confidence</dt>
            <dd className="text-[12px] text-ink-soft">
              {CONFIDENCE_LABELS[scenario.confidence]}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ScenarioDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const mode = useViewMode();
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const territories = useIntelligenceStore((s) => s.territories);
  const signals = useIntelligenceStore((s) => s.signals);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const implications = useIntelligenceStore((s) => s.implications);
  const indicators = useIntelligenceStore((s) => s.indicators);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Future Territories", href: "/territories" },
            { label: "Scenario" },
          ]}
        />
        <PageHeader title="Scenario" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const id = typeof params.id === "string" ? params.id : "";
  const scenario = scenarios.find((s) => s.id === id);

  if (!scenario) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Future Territories", href: "/territories" },
            { label: "Scenarios", href: "/scenarios" },
            { label: "Not found" },
          ]}
        />
        <PageHeader title="Scenario not found" />
        <EmptyState
          message={`No scenario carries the id “${id}”. It may have been created in a different browser (the intelligence base is stored locally) or the id may be mistyped. Browse the scenario list to find the record you need.`}
          actionLabel="Back to Scenarios"
          actionHref="/scenarios"
        />
      </>
    );
  }

  const territory = territories.find((t) => t.id === scenario.territoryId);
  const result = validateScenario(scenario);
  const assumptionHeavy = scenarioAssumptionHeavy(scenario);
  const passedChecks = qualityPassCount(scenario.qualityChecks);
  const allChecksPass = passedChecks === QUALITY_TEST_TOTAL;
  const advanced = mode !== "simple";

  const supportingSignals = signals.filter((s) =>
    scenario.supportingSignalIds.includes(s.id),
  );
  const supportingPatterns = patterns.filter((p) =>
    scenario.supportingPatternIds.includes(p.id),
  );
  const supportingDrivers = drivers.filter((d) =>
    scenario.supportingDriverIds.includes(d.id),
  );
  const shapingContradictions = contradictions.filter((c) =>
    scenario.shapingContradictionIds.includes(c.id),
  );
  const derivedImplications = implications.filter(
    (i) => i.scenarioId === scenario.id,
  );
  const territoryIndicators = territory
    ? indicators.filter((i) => i.territoryId === territory.id)
    : [];
  const mainTension = shapingContradictions[0] ?? null;

  // Evidence trail, downward from this scenario's actual links — steps are
  // never invented, so a thinly evidenced scenario shows a visibly short trail.
  const trailGroups: TrailGroup[] = [
    {
      label: `Territory (${territory ? 1 : 0})`,
      steps: territory
        ? [
            {
              stage: "territory",
              title: territory.name,
              href: `/territories/${territory.id}`,
            },
          ]
        : [],
    },
    {
      label: `Drivers (${supportingDrivers.length})`,
      steps: supportingDrivers.map((d) => ({
        stage: "driver",
        title: d.name,
        href: `/drivers/${d.id}`,
      })),
    },
    {
      label: `Patterns (${supportingPatterns.length})`,
      steps: supportingPatterns.map((p) => ({
        stage: "pattern",
        title: p.name,
        href: `/patterns/${p.id}`,
      })),
    },
    {
      label: `Signals (${supportingSignals.length})`,
      previewCount: 5,
      steps: supportingSignals.map((s) => ({
        stage: signalStage(s),
        title: s.title,
        href: `/signals/${s.id}`,
      })),
    },
    {
      label: `Contradictions (${shapingContradictions.length})`,
      steps: shapingContradictions.map((c) => ({
        stage: "contradiction",
        title: c.name,
        href: `/contradictions/${c.id}`,
      })),
    },
    {
      label: `Monitoring indicators (${territoryIndicators.length})`,
      steps: territoryIndicators.map((i) => ({
        stage: "indicator",
        title: i.name,
        href: "/monitoring",
      })),
    },
    {
      label: `Implications (${derivedImplications.length})`,
      steps: derivedImplications.map((i) => ({
        stage: "implication",
        title: firstSentence(i.implication),
        href: "/implications",
      })),
    },
  ];
  const trailHasSteps = trailGroups.some((g) => g.steps.length > 0);

  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Future territory",
      kind: "territory",
      items: territory ? [{ id: territory.id, title: territory.name }] : [],
      emptyNote:
        "No territory found for this scenario — every scenario must evolve from a future territory.",
    },
    {
      heading: "Supporting drivers",
      kind: "driver",
      items: supportingDrivers.map((d) => ({ id: d.id, title: d.name })),
      emptyNote: "No supporting drivers linked yet.",
    },
    {
      heading: "Supporting patterns",
      kind: "pattern",
      items: supportingPatterns.map((p) => ({ id: p.id, title: p.name })),
      emptyNote: "No supporting patterns linked yet.",
    },
    {
      heading: "Supporting signals",
      kind: "signal",
      items: supportingSignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote:
        "No supporting signals linked yet — a scenario must trace back to present-day evidence.",
    },
    {
      heading: "Shaping contradictions",
      kind: "contradiction",
      items: shapingContradictions.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No contradictions shaping this world yet. Unopposed futures are usually under-scanned.",
    },
    {
      heading: "Implications",
      kind: "implication",
      items: derivedImplications.map((i) => ({
        id: i.id,
        title: i.implication.slice(0, 80),
      })),
      emptyNote: "No strategic implications derived from this scenario yet.",
    },
  ];

  const analystTabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <OverviewTab
          scenario={scenario}
          territory={territory}
          mainTension={mainTension}
        />
      ),
    },
    {
      id: "conditions",
      label: "What has to be true",
      content: <WhatHasToBeTrueTab scenario={scenario} />,
    },
    {
      id: "consequences",
      label: "Consequences",
      content: <ConsequencesTab scenario={scenario} />,
    },
    {
      id: "evidence",
      label: "Evidence",
      content: (
        <EvidenceTab
          scenario={scenario}
          supportingSignals={supportingSignals}
          supportingPatterns={supportingPatterns}
          supportingDrivers={supportingDrivers}
          shapingContradictions={shapingContradictions}
        />
      ),
    },
    {
      id: "quality",
      label: "Quality check",
      content: (
        <QualityTab
          checks={scenario.qualityChecks}
          updatedAt={scenario.updatedAt}
        />
      ),
    },
    {
      id: "review",
      label: "Review",
      content: <ReviewTab scenario={scenario} />,
    },
  ];

  const tabs =
    mode === "methodology"
      ? [
          ...analystTabs,
          {
            id: "methodology",
            label: "Methodology",
            content: <MethodologyTab scenario={scenario} result={result} />,
          },
        ]
      : analystTabs;

  const statusItems: Array<{
    text: string;
    tone?: "accent" | "caution" | "tension" | "neutral";
  }> = [
    { text: `${SCENARIO_TYPE_LABELS[scenario.scenarioType]} scenario` },
    { text: SCENARIO_HORIZON_PLAIN[scenario.horizon] },
    {
      text: `${passedChecks} of ${QUALITY_TEST_TOTAL} quality checks passed`,
      tone: allChecksPass ? "accent" : "neutral",
    },
    { text: "Speculative possibility", tone: "caution" },
  ];
  if (assumptionHeavy) {
    statusItems.push({ text: "Assumption-heavy", tone: "caution" });
  }
  // Freshness, from real fields computed live: the record's own last edit
  // ("updated" — "checked" only when a real check was recorded) and the
  // newest supporting signal's evidence date.
  const reading = checkedReading(scenario);
  statusItems.push({ text: `${reading.verb} ${relativeAge(reading.date)}` });
  const latestSupport = scenarioEvidenceWindow(scenario, signals).latest;
  statusItems.push(
    latestSupport
      ? { text: `latest supporting evidence ${relativeAge(latestSupport)}` }
      : { text: "no dated supporting evidence linked", tone: "caution" },
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Future Territories", href: "/territories" },
          territory
            ? { label: territory.name, href: `/territories/${territory.id}` }
            : { label: "Territory not found" },
          { label: "Scenario" },
        ]}
      />
      <PageHeader
        title={scenario.title}
        description={
          advanced
            ? undefined
            : `${SCENARIO_TYPE_LABELS[scenario.scenarioType]} scenario · ${SCENARIO_HORIZON_LABELS[scenario.horizon]}`
        }
        actions={<PipelineStageBadge stage="scenario" />}
      />
      {advanced ? (
        <div className="-mt-5 mb-8">
          <StatusStrip items={statusItems} />
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>
          {advanced ? (
            <Tabs tabs={tabs} />
          ) : (
            <SimpleReading
              scenario={scenario}
              assumptionHeavy={assumptionHeavy}
              shapingContradictions={shapingContradictions}
            />
          )}
        </div>

        <aside className="mt-10 space-y-8 lg:mt-0">
          {advanced ? (
            <>
              <section>
                <h2 className="mb-3 text-[13px] font-medium text-ink">
                  Evidence trail
                </h2>
                {trailHasSteps ? (
                  <RelationshipTrail
                    groups={trailGroups}
                    expandLabel="Show the full evidence trail"
                  />
                ) : (
                  <IncompleteNote
                    missing="No linked records yet."
                    whyItMatters="A scenario is only plausible through the territory, drivers, patterns and signals it links to."
                    nextStep="Link supporting evidence so this scenario can be traced and monitored."
                  />
                )}
              </section>
              <BiasCheckPanel
                extraQuestions={[
                  "Is this a scenario or a prediction in disguise?",
                  "Would a different, equally plausible world contradict this one?",
                ]}
              />
            </>
          ) : (
            <RelatedObjectsPanel groups={relatedGroups} />
          )}
        </aside>
      </div>
    </>
  );
}
