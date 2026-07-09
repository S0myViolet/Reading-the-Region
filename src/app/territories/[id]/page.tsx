"use client";

/**
 * Future territory detail — one strategic direction of change.
 *
 * Every register answers the same five questions: what is happening, why it
 * matters, what future it points to, what could prove it wrong, and what to
 * watch next. The simple reading answers them as one article. The advanced
 * tabs answer them with full depth — plain English first, then the linkage
 * checks, evidence strength, sector implications, structured tensions,
 * scenario cards, monitoring and review controls — with the evidence trail
 * kept compact in the right rail. Methodology view adds the convergence
 * rulebook and the audit trail. Territories always require human review —
 * the layer sits too close to strategy to be trusted unreviewed.
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
import {
  RelatedObjectsPanel,
  type RelatedGroup,
} from "@/components/EntityLink";
import { EvidenceBackingLine } from "@/components/EvidenceCompression";
import {
  ConnectBlock,
  IncompleteNote,
  RelationshipTrail,
  ScoreExplanationRow,
  ShowAllList,
  StatusStrip,
  TensionBlock,
  ValidationCheckRows,
  type TrailGroup,
} from "@/components/connect";
import {
  IdChip,
  ProvenanceBadge,
  SignalStrengthBadge,
  TerritoryStatusBadge,
  TrendBadge,
} from "@/components/badges";
import { Field, Select } from "@/components/form";
import { Age } from "@/components/freshness";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { signalEvidenceAt, territoryEvidenceWindow } from "@/lib/freshness";
import { signalStage } from "@/lib/pipeline";
import {
  clusterPlainMeaning,
  explainContradiction,
  explainTerritoryStatus,
  patternPlainMeaning,
} from "@/lib/explain";
import { firstSentence } from "@/lib/simple";
import { validateTerritory, type ValidationResult } from "@/lib/validation";
import type {
  Cluster,
  ConfidenceLevel,
  Contradiction,
  Driver,
  FutureTerritory,
  MonitoringIndicator,
  Pattern,
  PatternValidationStatus,
  ReviewStatus,
  Scenario,
  Signal,
  Source,
} from "@/lib/types";
import {
  CADENCE_LABELS,
  CONFIDENCE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  INDICATOR_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  SCENARIO_TYPE_LABELS,
  SECTOR_LABELS,
  TERRITORY_MONITORING_LABELS,
} from "@/lib/types";
import {
  couldChangeIfLine,
  countInWords,
  evidenceStrengthReading,
  fmtDate,
  latestEvidenceStripItem,
  HORIZON_PLAIN,
  MONITORING_STATUS_EXPLANATIONS,
  scenarioQualityLine,
  splitSentences,
  STATUS_TONES,
  stripIdParens,
  territoryCheckRows,
  territoryNextStep,
} from "../territory-ui";

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

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-ink-soft">{children}</p>;
}

function FaintNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-relaxed text-ink-faint">{children}</p>;
}

/** A plain list under a faint label — the calm replacement for boxed lists. */
function PlainList({
  label,
  items,
  emptyNote,
}: {
  label: string;
  items: string[];
  emptyNote: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11.5px] text-ink-faint">{label}</p>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="text-[13px] leading-relaxed text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] leading-relaxed text-ink-faint">{emptyNote}</p>
      )}
    </div>
  );
}

/** Faint-labelled sentence: "Label — text." */
function LabelledLine({ label, text }: { label: string; text: string }) {
  return (
    <p className="text-[12.5px] leading-relaxed text-ink-soft">
      <span className="text-ink-faint">{label} — </span>
      {text}
    </p>
  );
}

/**
 * Linked record names as a quiet mid-dot list. Driver and pattern names are
 * sentence-shaped, so they are listed rather than folded into a sentence.
 */
function NameLinks({
  items,
}: {
  items: Array<{ id: string; name: string; href: string }>;
}) {
  return (
    <>
      {items.map((it, i) => (
        <span key={it.id}>
          {i > 0 ? " · " : null}
          <Link
            href={it.href}
            className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
          >
            {it.name}
          </Link>
        </span>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Simple reading — the default view, byte-for-byte the calm article
// ---------------------------------------------------------------------------

/** Linked contradictions as readable sentences; the absence is explicit. */
function ContradictionSentences({ items }: { items: Contradiction[] }) {
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

function SimpleReading({
  territory,
  linkedContradictions,
  representativeSignals,
  sources,
}: {
  territory: FutureTerritory;
  linkedContradictions: Contradiction[];
  representativeSignals: Signal[];
  sources: Source[];
}) {
  return (
    <div className="max-w-2xl space-y-8">
      <Section title="One-line definition">
        {territory.oneLineDefinition.trim() ? (
          <p className="font-display text-[17px] italic leading-relaxed text-ink">
            {territory.oneLineDefinition}
          </p>
        ) : (
          <FaintNote>
            No one-line definition recorded yet. A territory that cannot be
            stated in a single sentence is not yet a territory — it is a pile
            of adjacent observations.
          </FaintNote>
        )}
      </Section>

      <Section
        title="Why it is emerging"
        aside={
          <ViewGate min="methodology">
            <ProvenanceBadge label="sourced_interpretation" />
          </ViewGate>
        }
      >
        {territory.whyEmerging.trim() ? (
          <Prose>{territory.whyEmerging}</Prose>
        ) : (
          <FaintNote>
            Not recorded yet. State which drivers converge here and why their
            convergence produces this direction rather than another.
          </FaintNote>
        )}
      </Section>

      <Section title="Where it stands">
        <Prose>
          <TerritoryStatusBadge status={territory.monitoringStatus} />{" "}
          {explainTerritoryStatus(territory)}
        </Prose>
        <div className="mt-1.5">
          <EvidenceBackingLine signals={representativeSignals} sources={sources} />
        </div>
      </Section>

      <Section title="What it changes">
        {territory.whatItChanges.trim() ? (
          <Prose>{territory.whatItChanges}</Prose>
        ) : (
          <FaintNote>
            Not recorded yet. Name the systems, behaviours, and markets this
            direction of change restructures.
          </FaintNote>
        )}
      </Section>

      <Section title="Who it affects">
        {territory.whoItAffects.length > 0 ? (
          <Prose>{territory.whoItAffects.join(" · ")}</Prose>
        ) : (
          <FaintNote>
            No affected groups recorded yet. A territory that affects no one in
            particular is a buzzword, not a direction of change.
          </FaintNote>
        )}
      </Section>

      <Section title="If this territory strengthens">
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <PlainList
            label="Opportunities"
            items={territory.opportunities}
            emptyNote="No opportunities recorded yet. Trace what becomes possible or valuable if this direction continues."
          />
          <PlainList
            label="Risks"
            items={territory.risks}
            emptyNote="No risks recorded yet. Every meaningful direction of change puts something at risk — if nothing comes to mind, the territory is under-examined."
          />
        </div>
      </Section>

      <Section title="What could contradict it">
        <ContradictionSentences items={linkedContradictions} />
      </Section>

      <Section title="Next step">
        <Prose>{territoryNextStep(territory)}</Prose>
      </Section>

      <DepthHint>
        Linkage checks, evidence strength, sector implications and review controls
      </DepthHint>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview tab (advanced) — plain English first, uncertainty explicit
// ---------------------------------------------------------------------------

function AdvancedOverview({
  territory,
  linkedDrivers,
  linkedPatterns,
  linkedContradictions,
  linkedIndicators,
}: {
  territory: FutureTerritory;
  linkedDrivers: Driver[];
  linkedPatterns: Pattern[];
  linkedContradictions: Contradiction[];
  linkedIndicators: MonitoringIndicator[];
}) {
  // whyEmerging tightened to one short paragraph: the first two sentences
  // (record-id parentheticals removed) plus the drivers and patterns named
  // as links. The full reasoning stays behind a quiet disclosure.
  const whySentences = splitSentences(stripIdParens(territory.whyEmerging));
  const whyLead = whySentences.slice(0, 2).join(" ");
  const whyRest = whySentences.slice(2).join(" ");
  const changeBullets = splitSentences(territory.whatItChanges);
  const watchIndicators = linkedIndicators.slice(0, 5);

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        {territory.oneLineDefinition.trim() ? (
          <p className="font-display text-[17px] italic leading-relaxed text-ink">
            {territory.oneLineDefinition}
          </p>
        ) : (
          <FaintNote>
            No one-line definition recorded yet. A territory that cannot be
            stated in a single sentence is not yet a territory — it is a pile
            of adjacent observations.
          </FaintNote>
        )}
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">
          A direction the region could move toward — plausible, not proven.
        </p>
      </section>

      <ConnectBlock heading="Why this future is becoming visible">
        {territory.whyEmerging.trim() ? (
          <>
            <p>{whyLead}</p>
            {linkedDrivers.length > 0 ? (
              <p className="mt-1.5 text-[12.5px] leading-relaxed">
                <span className="text-ink-faint">The forces behind it — </span>
                <NameLinks
                  items={linkedDrivers.map((d) => ({
                    id: d.id,
                    name: d.name,
                    href: `/drivers/${d.id}`,
                  }))}
                />
              </p>
            ) : null}
            {linkedPatterns.length > 0 ? (
              <p className="mt-1 text-[12.5px] leading-relaxed">
                <span className="text-ink-faint">Seen through the patterns — </span>
                <NameLinks
                  items={linkedPatterns.map((p) => ({
                    id: p.id,
                    name: p.name,
                    href: `/patterns/${p.id}`,
                  }))}
                />
              </p>
            ) : null}
            {whyRest ? (
              <details className="mt-1.5">
                <summary className="cursor-pointer list-none text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft">
                  Show the full reasoning
                </summary>
                <p className="mt-1.5">{whyRest}</p>
              </details>
            ) : null}
          </>
        ) : (
          <FaintNote>
            Not recorded yet. State which drivers converge here and why their
            convergence produces this direction rather than another.
          </FaintNote>
        )}
      </ConnectBlock>

      <ConnectBlock heading="What changes if this future grows">
        {changeBullets.length > 0 ? (
          <ul className="space-y-1.5">
            {changeBullets.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : (
          <FaintNote>
            Not recorded yet. Name the systems, behaviours, and markets this
            direction of change restructures.
          </FaintNote>
        )}
        {territory.whoItAffects.length > 0 ? (
          <div className="mt-4">
            <p className="mb-1.5 text-[11.5px] text-ink-faint">Who feels it first</p>
            <div className="space-y-1.5">
              <ShowAllList
                previewCount={4}
                noun="groups"
                items={territory.whoItAffects.map((w) => (
                  <p key={w} className="text-[13px] leading-relaxed text-ink-soft">
                    {w}
                  </p>
                ))}
              />
            </div>
          </div>
        ) : null}
      </ConnectBlock>

      <ConnectBlock heading="What could challenge it">
        {linkedContradictions.length > 0 ? (
          <div className="space-y-4">
            {linkedContradictions.map((c) => {
              const changeLine = couldChangeIfLine(c);
              return (
                <div key={c.id}>
                  <p>
                    <Link
                      href={`/contradictions/${c.id}`}
                      className="font-medium text-ink hover:text-accent-ink hover:underline"
                    >
                      {c.name}
                    </Link>
                    {" — "}
                    {firstSentence(c.underlyingTension.trim() || c.sideA)}
                  </p>
                  {changeLine ? (
                    <p className="mt-1 text-[12px] leading-relaxed">{changeLine}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <IncompleteNote
            missing="No contradiction linked to this territory yet."
            whyItMatters="A direction with nothing pulling against it has not been tested — it reads as a prediction."
            nextStep="Record the strongest evidence that cuts against this future and link it here."
          />
        )}
      </ConnectBlock>

      <ConnectBlock heading="What to watch">
        {watchIndicators.length > 0 ? (
          <>
            <ul className="space-y-1.5">
              {watchIndicators.map((ind) => (
                <li key={ind.id}>
                  <Link
                    href="/monitoring"
                    className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
                  >
                    {ind.name}
                  </Link>
                </li>
              ))}
            </ul>
            {linkedIndicators.length > watchIndicators.length ? (
              <p className="mt-1.5 text-[12px] text-ink-faint">
                And {linkedIndicators.length - watchIndicators.length} more on
                the Monitoring tab.
              </p>
            ) : null}
          </>
        ) : (
          <p>
            No leading indicators attached yet. Until they exist, this future
            can only be asserted, not tracked.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="If this future strengthens">
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          <PlainList
            label="Opportunities"
            items={territory.opportunities}
            emptyNote="No opportunities recorded yet. Trace what becomes possible or valuable if this direction continues."
          />
          <PlainList
            label="Risks"
            items={territory.risks}
            emptyNote="No risks recorded yet. Every meaningful direction of change puts something at risk — if nothing comes to mind, the territory is under-examined."
          />
        </div>
      </ConnectBlock>

      <ConnectBlock heading="Next step">
        <p>{territoryNextStep(territory)}</p>
      </ConnectBlock>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence & linkage tab (advanced) — why this territory is grounded
// ---------------------------------------------------------------------------

const PATTERN_STATUS_WORDS: Record<PatternValidationStatus, string> = {
  hypothesis: "Hypothesis",
  partially_validated: "Partially validated",
  validated: "Validated",
};

/** One linked record as name + quiet metadata + one plain sentence. */
function LinkedRecordRow({
  href,
  id,
  name,
  meta,
  sentence,
}: {
  href: string;
  id: string;
  name: string;
  meta?: string;
  sentence: string;
}) {
  return (
    <div className="py-2.5 first:pt-0 last:pb-0">
      <p className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
        <Link
          href={href}
          className="font-medium text-ink hover:text-accent-ink hover:underline"
        >
          {name}
        </Link>
        <IdChip id={id} />
        {meta ? <span className="text-[11px] text-ink-faint">{meta}</span> : null}
      </p>
      <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{sentence}</p>
    </div>
  );
}

function EvidenceTab({
  territory,
  result,
  linkedDrivers,
  linkedPatterns,
  linkedClusters,
  representativeSignals,
}: {
  territory: FutureTerritory;
  result: ValidationResult;
  linkedDrivers: Driver[];
  linkedPatterns: Pattern[];
  linkedClusters: Cluster[];
  representativeSignals: Signal[];
}) {
  return (
    <div className="max-w-2xl space-y-8">
      <p className="text-[12px] leading-relaxed text-ink-faint">
        Why this territory is grounded: the records beneath it, and the checks
        it must pass before anyone treats it as more than an idea.
      </p>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Drivers behind this ({linkedDrivers.length})
        </h3>
        {linkedDrivers.length > 0 ? (
          <div className="divide-y divide-line">
            {linkedDrivers.map((d) => (
              <LinkedRecordRow
                key={d.id}
                href={`/drivers/${d.id}`}
                id={d.id}
                name={d.name}
                meta={`${d.status === "validated" ? "Validated driver" : "Driver hypothesis"} · ${CONFIDENCE_LABELS[d.confidence]}`}
                sentence={firstSentence(d.driverStatement)}
              />
            ))}
          </div>
        ) : (
          <FaintNote>
            No drivers connected. A territory must rest on at least two
            converging drivers — without them it is a theme, not a territory.
          </FaintNote>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Patterns behind this ({linkedPatterns.length})
        </h3>
        {linkedPatterns.length > 0 ? (
          <div className="divide-y divide-line">
            {linkedPatterns.map((p) => (
              <LinkedRecordRow
                key={p.id}
                href={`/patterns/${p.id}`}
                id={p.id}
                name={p.name}
                meta={`${PATTERN_STATUS_WORDS[p.validationStatus]} · ${CONFIDENCE_LABELS[p.confidence]}`}
                sentence={patternPlainMeaning(p)}
              />
            ))}
          </div>
        ) : (
          <FaintNote>
            No patterns connected. The repeated movements that the
            territory&rsquo;s drivers explain should be linked here.
          </FaintNote>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Key clusters ({linkedClusters.length})
        </h3>
        {linkedClusters.length > 0 ? (
          <div className="divide-y divide-line">
            <ShowAllList
              previewCount={6}
              noun="clusters"
              items={linkedClusters.map((c) => (
                <LinkedRecordRow
                  key={c.id}
                  href={`/clusters/${c.id}`}
                  id={c.id}
                  name={c.name}
                  sentence={clusterPlainMeaning(c)}
                />
              ))}
            />
          </div>
        ) : (
          <FaintNote>
            No clusters linked. Clusters show where the territory&rsquo;s
            evidence groups by shared logic.
          </FaintNote>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Representative signals ({representativeSignals.length})
        </h3>
        {representativeSignals.length > 0 ? (
          <div className="divide-y divide-line">
            <ShowAllList
              previewCount={6}
              noun="signals"
              items={representativeSignals.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5 first:pt-0"
                >
                  <Link
                    href={`/signals/${s.id}`}
                    className="min-w-0 text-[12.5px] leading-snug text-ink hover:text-accent-ink hover:underline"
                  >
                    {s.title}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <SignalStrengthBadge strength={s.signalStrength} />
                    <span className="text-[11px] text-ink-faint">{s.country}</span>
                    <span className="text-[11px] text-ink-faint">
                      <Age prefix="evidence" iso={signalEvidenceAt(s)} />
                    </span>
                  </span>
                </div>
              ))}
            />
          </div>
        ) : (
          <FaintNote>
            No representative signals attached. Pick the present-day evidence
            that best shows this direction already forming.
          </FaintNote>
        )}
      </section>

      <section>
        <ScoreExplanationRow
          label="Evidence strength"
          score={territory.evidenceStrength}
          explanation={evidenceStrengthReading(territory)}
        />
      </section>

      <section>
        <h3 className="mb-1 text-[13px] font-medium text-ink">
          Checks before treating this as a grounded future territory
        </h3>
        <p className="mb-3 text-[12px] text-ink-faint">
          {result.passedCount} of {result.totalCount} checks currently pass.
          Each check keeps this layer tied to evidence rather than conviction.
        </p>
        <ValidationCheckRows checks={territoryCheckRows(territory, result)} />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sector implications tab (advanced)
// ---------------------------------------------------------------------------

function SectorImplicationsTab({ territory }: { territory: FutureTerritory }) {
  if (territory.sectorImplications.length === 0) {
    return (
      <IncompleteNote
        missing="No sector implications recorded yet."
        whyItMatters="A territory earns its multi-sector claim by saying what it changes for each sector it touches."
        nextStep="Add a note per sector as the evidence allows — what changes, why it matters, and one concrete example decision."
      />
    );
  }
  return (
    <div className="max-w-2xl space-y-3">
      <div className="divide-y divide-line">
        {territory.sectorImplications.map((si) => (
          <div key={si.sector} className="py-4 first:pt-0 last:pb-0">
            <p className="text-[13px] font-medium text-ink">
              {SECTOR_LABELS[si.sector]}
            </p>
            <div className="mt-1.5 space-y-1.5">
              <LabelledLine label="What changes" text={si.note} />
              {si.whyItMatters?.trim() ? (
                <LabelledLine label="Why it matters" text={si.whyItMatters} />
              ) : (
                <p className="text-[12px] leading-relaxed text-ink-faint">
                  Why it matters — not recorded yet for this sector.
                </p>
              )}
              {si.exampleDecision?.trim() ? (
                <LabelledLine label="Example decision" text={si.exampleDecision} />
              ) : (
                <p className="text-[12px] leading-relaxed text-ink-faint">
                  Example decision — not recorded yet. Add one concrete decision
                  this note suggests.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11.5px] text-ink-faint">
        Sector notes are interpretations of the territory, not validated
        implications. Formal, evidence-linked recommendations live in Strategic
        Implications.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scenarios tab (advanced)
// ---------------------------------------------------------------------------

function ScenariosTab({
  result,
  linkedScenarios,
}: {
  result: ValidationResult;
  linkedScenarios: Scenario[];
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-[11.5px] text-ink-faint">
        Scenarios explore how this territory evolves under different conditions.
        They are structured possibilities anchored to this territory&rsquo;s evidence
        — not forecasts of it.
      </p>
      {linkedScenarios.length > 0 ? (
        <div className="space-y-6">
          {linkedScenarios.map((s) => (
            <section
              key={s.id}
              className="border-b border-line pb-6 last:border-b-0 last:pb-0"
            >
              <h3 className="font-display text-[15px] text-ink">
                <Link href={`/scenarios/${s.id}`} className="hover:text-accent-ink">
                  {s.title}
                </Link>
              </h3>
              <p className="mt-0.5 text-[11.5px] text-ink-faint">
                {SCENARIO_TYPE_LABELS[s.scenarioType]} scenario,{" "}
                {HORIZON_PLAIN[s.horizon]} · {scenarioQualityLine(s)}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {firstSentence(s.corePremise)}
              </p>
              {s.differentiator?.trim() ? (
                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                  <span className="text-ink-faint">How it differs — </span>
                  {s.differentiator}
                </p>
              ) : (
                <p className="mt-1 text-[12px] text-ink-faint">
                  How it differs from its sibling scenarios is not recorded yet.
                </p>
              )}
            </section>
          ))}
        </div>
      ) : result.valid ? (
        <section>
          <h3 className="mb-1.5 text-[13px] font-medium text-accent-ink">
            Ready for scenarios
          </h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            No scenarios explore this territory yet, but its linkage
            requirements are met — it is grounded enough to imagine forward.
            Build a set of differentiated scenarios from the{" "}
            <Link
              href="/scenarios"
              className="text-ink underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
            >
              Scenarios page
            </Link>
            , anchored to this territory.
          </p>
        </section>
      ) : (
        <section>
          <h3 className="mb-1.5 text-[13px] font-medium text-caution">
            Not ready for scenarios
          </h3>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            This territory meets {result.passedCount} of {result.totalCount}{" "}
            linkage requirements. Scenarios built on a weakly grounded territory
            repeat its gaps — strengthen the driver, pattern, signal,
            contradiction, and indicator links on the Evidence &amp; linkage tab
            first.
          </p>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monitoring tab (advanced)
// ---------------------------------------------------------------------------

function MonitoringTab({
  territory,
  linkedIndicators,
}: {
  territory: FutureTerritory;
  linkedIndicators: MonitoringIndicator[];
}) {
  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
        These indicators tell us whether this future territory is getting
        stronger, weaker, or more complicated.
      </p>

      <section>
        <h3 className="mb-1.5 text-[13px] font-medium text-ink">Monitoring status</h3>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          <TerritoryStatusBadge status={territory.monitoringStatus} />{" "}
          {TERRITORY_MONITORING_LABELS[territory.monitoringStatus]} —{" "}
          {MONITORING_STATUS_EXPLANATIONS[territory.monitoringStatus]}
        </p>
      </section>

      {linkedIndicators.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Type</th>
                <th>Trend</th>
                <th>Last checked</th>
                <th>Cadence</th>
              </tr>
            </thead>
            <tbody>
              {linkedIndicators.map((ind) => (
                <tr key={ind.id}>
                  <td>
                    <Link
                      href="/monitoring"
                      className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                    >
                      {ind.name}
                    </Link>{" "}
                    <IdChip id={ind.id} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {INDICATOR_TYPE_LABELS[ind.indicatorType]}
                  </td>
                  <td>
                    <TrendBadge trend={ind.trend} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {fmtDate(ind.dateLastChecked)}{" "}
                    <span className="text-[11px] text-ink-faint">
                      (<Age iso={ind.dateLastChecked} />)
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {CADENCE_LABELS[ind.cadence]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[12px] text-ink-faint">
          No indicators attached yet. Add leading indicators before treating
          this territory as active.
        </p>
      )}

      <p className="text-[11.5px] text-ink-faint">
        Indicators are managed on the{" "}
        <Link
          href="/monitoring"
          className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
        >
          Monitoring
        </Link>{" "}
        page. A territory without checked indicators drifts into assertion.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab (advanced)
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ territory }: { territory: FutureTerritory }) {
  const updateTerritory = useIntelligenceStore((s) => s.updateTerritory);

  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-[12px] leading-relaxed text-ink-faint">
        Use this to record analyst judgement. These notes do not overwrite the
        evidence. Territories always require human review — this layer sits too
        close to strategy to be trusted unreviewed.
      </p>
      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">Human review</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Review status"
            hint="The human decision about this record — separate from the computed linkage checks."
          >
            <Select
              value={territory.reviewStatus}
              onChange={(e) =>
                updateTerritory(territory.id, {
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
            hint="How much trust to place in this territory when scenarios and implications build on it."
          >
            <Select
              value={territory.confidence}
              onChange={(e) =>
                updateTerritory(territory.id, {
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
          Created {fmtDate(territory.createdAt)} · Last updated{" "}
          {fmtDate(territory.updatedAt)}
        </p>
      </ViewGate>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Methodology tab (methodology only) — the convergence rulebook
// ---------------------------------------------------------------------------

function MethodologyTab({
  territory,
  result,
}: {
  territory: FutureTerritory;
  result: ValidationResult;
}) {
  const rows = territoryCheckRows(territory, result);

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h3 className="mb-1.5 text-[13px] font-medium text-ink">
          The convergence rule
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          A territory is treated as grounded only while every rule below holds.
          The rules are thresholds computed from the record&rsquo;s actual
          links, not judgements.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Threshold</th>
                <th>Currently</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.requirement}>
                  <td className="text-[12px]">{r.requirement}</td>
                  <td className="whitespace-nowrap font-mono text-[11.5px]">
                    {r.threshold}
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {r.current}
                  </td>
                  <td
                    className={`whitespace-nowrap text-[11.5px] ${
                      r.passed ? "text-accent-ink" : "text-caution"
                    }`}
                  >
                    {r.passed ? "Met" : "Not met"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Why each rule exists
        </h3>
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.requirement} className="text-[12px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">{r.requirement}.</span>{" "}
              {r.explanation}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">
          Standing rules of this layer
        </h3>
        <ul className="space-y-2 text-[12px] leading-relaxed text-ink-soft">
          <li>
            <span className="font-medium text-ink">Not a prediction.</span> A
            territory is a possible direction, held only while its evidence
            holds.
          </li>
          <li>
            <span className="font-medium text-ink">Human review is mandatory.</span>{" "}
            This layer sits directly beneath scenarios and strategy — no
            territory is treated as settled without a named reviewer&rsquo;s
            judgement.
          </li>
          <li>
            <span className="font-medium text-ink">The name must carry the meaning.</span>{" "}
            Simple, memorable, explanatory, grounded, multi-sector — see the
            naming reference on the territory list.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-[13px] font-medium text-ink">Audit trail</h3>
        <dl className="max-w-sm space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Record id</dt>
            <dd>
              <IdChip id={territory.id} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Created</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(territory.createdAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Last updated</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(territory.updatedAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Review status</dt>
            <dd className="text-[12px] text-ink-soft">
              {REVIEW_STATUS_LABELS[territory.reviewStatus]}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] text-ink-faint">Confidence</dt>
            <dd className="text-[12px] text-ink-soft">
              {CONFIDENCE_LABELS[territory.confidence]}
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

export default function TerritoryDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const mode = useViewMode();
  const territories = useIntelligenceStore((s) => s.territories);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const implications = useIntelligenceStore((s) => s.implications);
  const indicators = useIntelligenceStore((s) => s.indicators);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Future Territories", href: "/territories" }]} />
        <PageHeader title="Future territory" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const id = typeof params.id === "string" ? params.id : "";
  const territory = territories.find((t) => t.id === id);

  if (!territory) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Future Territories", href: "/territories" },
            { label: "Not found" },
          ]}
        />
        <PageHeader title="Territory not found" />
        <EmptyState
          message={`No future territory carries the id “${id}”. It may have been created in a different browser (the intelligence base is stored locally) or the id may be mistyped. Browse the territory list to find the record you need.`}
          actionLabel="Back to Future Territories"
          actionHref="/territories"
        />
      </>
    );
  }

  const result = validateTerritory(territory);

  const linkedDrivers = drivers.filter((d) => territory.driverIds.includes(d.id));
  const linkedPatterns = patterns.filter((p) => territory.patternIds.includes(p.id));
  const linkedClusters = clusters.filter((c) => territory.clusterIds.includes(c.id));
  const representativeSignals = signals.filter((s) =>
    territory.representativeSignalIds.includes(s.id),
  );
  const linkedContradictions = contradictions.filter((c) =>
    territory.contradictionIds.includes(c.id),
  );
  // Scenarios connect in both directions: the territory stores scenarioIds and
  // every scenario stores its territoryId — take the union so neither link is lost.
  const linkedScenarios = scenarios.filter(
    (s) => territory.scenarioIds.includes(s.id) || s.territoryId === territory.id,
  );
  // Reverse lookup: implications point at territories, not the other way round.
  const linkedImplications = implications.filter(
    (i) => i.territoryId === territory.id,
  );
  const linkedIndicators = indicators.filter(
    (i) =>
      territory.leadingIndicatorIds.includes(i.id) || i.territoryId === territory.id,
  );

  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Drivers",
      kind: "driver",
      items: linkedDrivers.map((d) => ({ id: d.id, title: d.name })),
      emptyNote:
        "No drivers connected — a territory must rest on converging drivers.",
    },
    {
      heading: "Patterns",
      kind: "pattern",
      items: linkedPatterns.map((p) => ({ id: p.id, title: p.name })),
      emptyNote: "No patterns connected yet.",
    },
    {
      heading: "Clusters",
      kind: "cluster",
      items: linkedClusters.map((c) => ({ id: c.id, title: c.name })),
      emptyNote: "No clusters linked yet.",
    },
    {
      heading: "Representative signals",
      kind: "signal",
      items: representativeSignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No representative signals attached yet.",
    },
    {
      heading: "Contradictions",
      kind: "contradiction",
      items: linkedContradictions.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No contradictions linked. A territory without acknowledged tension reads as a prediction.",
    },
    {
      heading: "Scenarios",
      kind: "scenario",
      items: linkedScenarios.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No scenarios explore this territory yet.",
    },
    {
      heading: "Implications",
      kind: "implication",
      items: linkedImplications.map((i) => ({
        id: i.id,
        title: i.implication.length > 80 ? `${i.implication.slice(0, 80)}…` : i.implication,
      })),
      emptyNote: "No strategic implications derived from this territory yet.",
    },
    {
      heading: "Monitoring indicators",
      kind: "indicator",
      items: linkedIndicators.map((i) => ({ id: i.id, title: i.name })),
      emptyNote:
        "No indicators attached — without them this territory cannot be tracked.",
    },
  ];

  // Right-rail evidence trail (advanced): every linked record grouped by
  // layer with live counts in the labels, compact by default. Steps come only
  // from records this territory actually links to — never invented.
  const trailGroups: TrailGroup[] = [
    {
      label: `Drivers (${linkedDrivers.length})`,
      steps: linkedDrivers.map((d) => ({
        stage: "driver" as const,
        title: d.name,
        href: `/drivers/${d.id}`,
      })),
    },
    {
      label: `Patterns (${linkedPatterns.length})`,
      steps: linkedPatterns.map((p) => ({
        stage: "pattern" as const,
        title: p.name,
        href: `/patterns/${p.id}`,
      })),
    },
    {
      label: `Clusters (${linkedClusters.length})`,
      previewCount: 5,
      steps: linkedClusters.map((c) => ({
        stage: "cluster" as const,
        title: c.name,
        href: `/clusters/${c.id}`,
      })),
    },
    {
      label: `Signals (${representativeSignals.length})`,
      previewCount: 5,
      steps: representativeSignals.map((s) => ({
        stage: signalStage(s),
        title: s.title,
        href: `/signals/${s.id}`,
      })),
    },
    {
      label: `Contradictions (${linkedContradictions.length})`,
      steps: linkedContradictions.map((c) => ({
        stage: "contradiction" as const,
        title: c.name,
        href: `/contradictions/${c.id}`,
      })),
    },
    {
      label: `Scenarios (${linkedScenarios.length})`,
      steps: linkedScenarios.map((s) => ({
        stage: "scenario" as const,
        title: s.title,
        href: `/scenarios/${s.id}`,
      })),
    },
    {
      label: `Implications (${linkedImplications.length})`,
      steps: linkedImplications.map((i) => ({
        stage: "implication" as const,
        title: i.implication.length > 80 ? `${i.implication.slice(0, 80)}…` : i.implication,
        href: "/implications",
      })),
    },
    {
      label: `Monitoring indicators (${linkedIndicators.length})`,
      previewCount: 5,
      steps: linkedIndicators.map((i) => ({
        stage: "indicator" as const,
        title: i.name,
        href: "/monitoring",
      })),
    },
  ];
  const trailHasSteps = trailGroups.some((g) => g.steps.length > 0);

  const simpleReading = (
    <SimpleReading
      territory={territory}
      linkedContradictions={linkedContradictions}
      representativeSignals={representativeSignals}
      sources={sources}
    />
  );

  const analystTabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <AdvancedOverview
          territory={territory}
          linkedDrivers={linkedDrivers}
          linkedPatterns={linkedPatterns}
          linkedContradictions={linkedContradictions}
          linkedIndicators={linkedIndicators}
        />
      ),
    },
    {
      id: "evidence",
      label: "Evidence & linkage",
      content: (
        <EvidenceTab
          territory={territory}
          result={result}
          linkedDrivers={linkedDrivers}
          linkedPatterns={linkedPatterns}
          linkedClusters={linkedClusters}
          representativeSignals={representativeSignals}
        />
      ),
    },
    {
      id: "sectors",
      label: `Sector implications (${territory.sectorImplications.length})`,
      content: <SectorImplicationsTab territory={territory} />,
    },
    {
      id: "contradictions",
      label: `Contradictions (${linkedContradictions.length})`,
      content:
        linkedContradictions.length > 0 ? (
          <div className="space-y-8">
            {linkedContradictions.map((c) => (
              <TensionBlock
                key={c.id}
                name={c.name}
                href={`/contradictions/${c.id}`}
                typeLabel={`Contradiction · ${CONTRADICTION_TYPE_LABELS[c.contradictionType]}`}
                sideA={{ claim: c.sideA, support: c.evidenceSideA }}
                sideB={{ claim: c.sideB, support: c.evidenceSideB }}
                rows={[
                  {
                    label: "Why this tension matters",
                    text: firstSentence(
                      c.underlyingTension.trim() || c.strategicImplication,
                    ),
                  },
                  {
                    label: "What to watch",
                    text: firstSentence(
                      c.possibleEscalation.trim() || c.scenarioRelevance,
                    ),
                  },
                ].filter((r) => r.text.trim())}
              />
            ))}
            <p className="text-[11.5px] text-ink-faint">
              A territory that ignores its contradictions becomes a prediction.
            </p>
          </div>
        ) : (
          <IncompleteNote
            missing="No contradiction linked to this territory yet."
            whyItMatters="A territory without acknowledged tension reads as a prediction."
            nextStep="Find the strongest evidence that cuts against this direction and record it as a contradiction."
          />
        ),
    },
    {
      id: "scenarios",
      label: `Scenarios (${linkedScenarios.length})`,
      content: <ScenariosTab result={result} linkedScenarios={linkedScenarios} />,
    },
    {
      id: "monitoring",
      label: `Monitoring (${linkedIndicators.length})`,
      content: (
        <MonitoringTab territory={territory} linkedIndicators={linkedIndicators} />
      ),
    },
    {
      id: "review",
      label: "Review",
      content: <ReviewTab territory={territory} />,
    },
  ];

  const tabs =
    mode === "methodology"
      ? [
          ...analystTabs,
          {
            id: "methodology",
            label: "Methodology",
            content: <MethodologyTab territory={territory} result={result} />,
          },
        ]
      : analystTabs;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Future Territories", href: "/territories" },
          { label: territory.name },
        ]}
      />
      <PageHeader title={territory.name} actions={<PipelineStageBadge stage="territory" />} />
      {mode !== "simple" ? (
        <div className="-mt-5 mb-8">
          <StatusStrip
            items={[
              { text: "Future Territory" },
              {
                text: TERRITORY_MONITORING_LABELS[territory.monitoringStatus],
                tone: STATUS_TONES[territory.monitoringStatus],
              },
              { text: CONFIDENCE_LABELS[territory.confidence] },
              latestEvidenceStripItem(
                territoryEvidenceWindow(territory, signals, indicators).latest,
              ),
              linkedContradictions.length > 0
                ? {
                    text: `${countInWords(linkedContradictions.length, "contradiction")} acknowledged`,
                  }
                : {
                    text: "No contradiction acknowledged yet",
                    tone: "caution" as const,
                  },
            ]}
          />
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>{mode === "simple" ? simpleReading : <Tabs tabs={tabs} />}</div>

        <aside className="mt-10 space-y-8 lg:mt-0">
          {mode === "simple" ? (
            <RelatedObjectsPanel groups={relatedGroups} />
          ) : (
            <>
              {trailHasSteps ? (
                <section>
                  <h2 className="mb-3 text-[13px] font-medium text-ink">
                    Evidence trail
                  </h2>
                  <RelationshipTrail
                    groups={trailGroups}
                    expandLabel="Show the full evidence trail"
                  />
                </section>
              ) : (
                <IncompleteNote
                  missing="No linked records yet."
                  whyItMatters="A territory only exists through the drivers, patterns and signals beneath it."
                  nextStep="Link the converging drivers first, then the patterns and signals that show them."
                />
              )}
              <BiasCheckPanel
                extraQuestions={[
                  "Is this territory broad enough to hold multiple sectors, and specific enough to be meaningful?",
                  "Would this name survive a client meeting without a slide of caveats?",
                ]}
              />
            </>
          )}
        </aside>
      </div>
    </>
  );
}
