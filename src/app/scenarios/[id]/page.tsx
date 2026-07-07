"use client";

/**
 * Scenario detail — one plausible future world evolved from a future
 * territory. Progressive disclosure: the world itself, its consequences, the
 * evidence linkage back down the pyramid, the declared assumptions (the
 * first thing to monitor), the nine quality tests, and review controls.
 * A scenario is presented as a structured possibility, never a prediction.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { NoContradictionNote } from "@/components/ContradictionPanel";
import {
  EntityLink,
  RelatedObjectsPanel,
  type RelatedGroup,
} from "@/components/EntityLink";
import {
  ConfidenceBadge,
  Pill,
  ProvenanceBadge,
  ReviewStatusBadge,
} from "@/components/badges";
import { PlainTags } from "@/components/tags";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  scenarioAssumptionHeavy,
  validateScenario,
  type ValidationResult,
} from "@/lib/validation";
import type {
  ConfidenceLevel,
  Contradiction,
  Driver,
  Pattern,
  ReviewStatus,
  Scenario,
  Signal,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  REVIEW_STATUS_LABELS,
  SCENARIO_HORIZON_LABELS,
  SCENARIO_TYPE_LABELS,
} from "@/lib/types";
import { fmtDate, qualityChecklistResult } from "../scenario-ui";

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function ProseOrNote({ text, note }: { text: string; note: string }) {
  if (text.trim()) {
    return <p className="text-[13px] leading-relaxed text-ink-soft">{text}</p>;
  }
  return <p className="text-[12px] text-ink-faint">{note}</p>;
}

function TextList({ items, emptyNote }: { items: string[]; emptyNote: string }) {
  if (items.length === 0) {
    return <p className="text-[11.5px] text-ink-faint">{emptyNote}</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-soft">
          <span aria-hidden className="text-ink-faint">
            –
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function TagListOrNote({ tags, emptyNote }: { tags: string[]; emptyNote: string }) {
  if (tags.length === 0) {
    return <span className="text-[11.5px] text-ink-faint">{emptyNote}</span>;
  }
  return <PlainTags tags={tags} />;
}

// ---------------------------------------------------------------------------
// The world tab
// ---------------------------------------------------------------------------

function WorldTab({ scenario }: { scenario: Scenario }) {
  return (
    <div className="space-y-4">
      <section className="card px-4 py-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="overline-label">Core premise</p>
          <ProvenanceBadge label="speculative_possibility" />
        </div>
        {scenario.corePremise.trim() ? (
          <blockquote className="border-l-2 border-l-accent pl-4 font-display text-[17px] italic leading-relaxed text-ink">
            {scenario.corePremise}
          </blockquote>
        ) : (
          <p className="text-[12px] text-ink-faint">
            No core premise recorded yet. A scenario needs one clear statement
            of the world it describes — the conditions under which the
            territory has evolved.
          </p>
        )}
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">What has changed</p>
        <ProseOrNote
          text={scenario.whatHasChanged}
          note="Not recorded yet. State what is different in this world compared with today — the change is what makes the thought experiment testable."
        />
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Behaviour in this world</h3>
        </header>
        <div className="grid divide-y divide-line lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <div className="px-4 py-3">
            <p className="overline-label mb-1">How people behave</p>
            <ProseOrNote
              text={scenario.howPeopleBehave}
              note="Not recorded yet — describe everyday behaviour, not attitudes."
            />
          </div>
          <div className="px-4 py-3">
            <p className="overline-label mb-1">How institutions behave</p>
            <ProseOrNote
              text={scenario.howInstitutionsBehave}
              note="Not recorded yet — governments, regulators, and public bodies."
            />
          </div>
          <div className="px-4 py-3">
            <p className="overline-label mb-1">How brands and organizations behave</p>
            <ProseOrNote
              text={scenario.howBrandsBehave}
              note="Not recorded yet — commercial and cultural organizations."
            />
          </div>
        </div>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Conditions of this world</h3>
        </header>
        <dl className="space-y-3 px-4 py-3">
          <div>
            <dt className="overline-label mb-1">Key technologies</dt>
            <dd>
              <TagListOrNote
                tags={scenario.keyTechnologies}
                emptyNote="No key technologies recorded yet."
              />
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Key policies</dt>
            <dd>
              <TagListOrNote
                tags={scenario.keyPolicies}
                emptyNote="No key policies recorded yet."
              />
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Key cultural shifts</dt>
            <dd>
              <TagListOrNote
                tags={scenario.keyCulturalShifts}
                emptyNote="No key cultural shifts recorded yet."
              />
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Consequences tab
// ---------------------------------------------------------------------------

function ConsequencesTab({ scenario }: { scenario: Scenario }) {
  return (
    <div className="space-y-4">
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Who gains, who loses</h3>
        </header>
        <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3">
            <p className="overline-label mb-1.5">Winners</p>
            <TextList
              items={scenario.winners}
              emptyNote="No winners identified yet — a world where nobody gains is usually under-thought."
            />
          </div>
          <div className="px-4 py-3">
            <p className="overline-label mb-1.5">Losers</p>
            <TextList
              items={scenario.losers}
              emptyNote="No losers identified yet — a world where nobody loses is usually optimistic fantasy."
            />
          </div>
        </div>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Risks and opportunities</h3>
        </header>
        <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3">
            <p className="overline-label mb-1.5">Risks</p>
            <TextList
              items={scenario.risks}
              emptyNote="No risks recorded yet for this world."
            />
          </div>
          <div className="px-4 py-3">
            <p className="overline-label mb-1.5">Opportunities</p>
            <TextList
              items={scenario.opportunities}
              emptyNote="No opportunities recorded yet for this world."
            />
          </div>
        </div>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">Strategic questions</p>
        <TextList
          items={scenario.strategicQuestions}
          emptyNote="No strategic questions recorded yet. A scenario earns its keep by sharpening the questions decision-makers must answer now."
        />
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">Early signs</p>
        <TextList
          items={scenario.earlySigns}
          emptyNote="No early signs recorded yet. Without them this scenario cannot be monitored — only believed or dismissed."
        />
        <p className="mt-2.5 border-t border-line pt-2 text-[11.5px] text-ink-faint">
          Watch for these in the{" "}
          <Link
            href="/inbox"
            className="underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
          >
            Scan Inbox
          </Link>
          . Early signs are how a scenario is monitored rather than believed.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Evidence tab
// ---------------------------------------------------------------------------

function EvidenceLinkGrid({
  heading,
  kind,
  items,
  emptyNote,
}: {
  heading: string;
  kind: RelatedGroup["kind"];
  items: Array<{ id: string; title: string }>;
  emptyNote: string;
}) {
  return (
    <section>
      <p className="overline-label mb-2">
        {heading} ({items.length})
      </p>
      {items.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((it) => (
            <EntityLink key={it.id} kind={kind} id={it.id} title={it.title} />
          ))}
        </div>
      ) : (
        <p className="text-[11.5px] text-ink-faint">{emptyNote}</p>
      )}
    </section>
  );
}

function EvidenceTab({
  result,
  supportingSignals,
  supportingPatterns,
  supportingDrivers,
  shapingContradictions,
}: {
  result: ValidationResult;
  supportingSignals: Signal[];
  supportingPatterns: Pattern[];
  supportingDrivers: Driver[];
  shapingContradictions: Contradiction[];
}) {
  return (
    <div className="space-y-4">
      <ValidationChecklist
        result={result}
        title="Evidence linkage"
        passedLabel="Evidence-linked"
        failedLabel="Insufficiently linked"
      />
      <p className="text-[11.5px] text-ink-faint">
        Claims in this scenario that are not supported by the links below are
        labelled as assumptions in the Assumptions tab.
      </p>

      <EvidenceLinkGrid
        heading="Supporting signals"
        kind="signal"
        items={supportingSignals.map((s) => ({ id: s.id, title: s.title }))}
        emptyNote="No supporting signals linked yet. A scenario must trace back to present-day evidence."
      />
      <EvidenceLinkGrid
        heading="Supporting patterns"
        kind="pattern"
        items={supportingPatterns.map((p) => ({ id: p.id, title: p.name }))}
        emptyNote="No supporting patterns linked yet."
      />
      <EvidenceLinkGrid
        heading="Supporting drivers"
        kind="driver"
        items={supportingDrivers.map((d) => ({ id: d.id, title: d.name }))}
        emptyNote="No supporting drivers linked yet. The forces that would push the territory into this world are unstated."
      />

      <section>
        <p className="overline-label mb-2">
          Shaping contradictions ({shapingContradictions.length})
        </p>
        {shapingContradictions.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {shapingContradictions.map((c) => (
              <EntityLink key={c.id} kind="contradiction" id={c.id} title={c.name} />
            ))}
          </div>
        ) : (
          <NoContradictionNote />
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assumptions tab
// ---------------------------------------------------------------------------

function AssumptionsTab({
  scenario,
  assumptionHeavy,
}: {
  scenario: Scenario;
  assumptionHeavy: boolean;
}) {
  return (
    <div className="space-y-4">
      {assumptionHeavy ? (
        <div className="card border-l-2 border-l-caution px-4 py-3">
          <p className="overline-label mb-1 text-caution">Assumption-heavy scenario</p>
          <p className="text-[12.5px] text-ink-soft">
            This scenario carries more assumptions than evidence links. Review
            assumptions and link stronger evidence before using this scenario
            for strategy.
          </p>
        </div>
      ) : null}

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">
            Declared assumptions ({scenario.assumptions.length})
          </h3>
        </header>
        {scenario.assumptions.length > 0 ? (
          <ul className="divide-y divide-line">
            {scenario.assumptions.map((a, i) => (
              <li
                key={`${i}-${a.text}`}
                className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5 px-4 py-2.5"
              >
                <p className="max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
                  {a.text}
                </p>
                <ProvenanceBadge label={a.label} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-3 text-[11.5px] text-ink-faint">
            No assumptions declared yet. Every scenario rests on assumptions —
            leaving them unstated does not remove them, it only hides them from
            review.
          </p>
        )}
      </section>

      <p className="border border-dashed border-line-strong px-3 py-2 text-[12px] text-ink-soft rounded-[2px]">
        Anything not linked to evidence is an assumption, and assumptions are
        the first thing to monitor.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quality tests tab
// ---------------------------------------------------------------------------

function QualityTab({ quality }: { quality: ValidationResult }) {
  return (
    <div className="space-y-3">
      <ValidationChecklist
        result={quality}
        title="Scenario quality tests"
        passedLabel="All tests passed"
        failedLabel="Quality tests failing"
      />
      <p className="text-[11.5px] text-ink-faint">
        These nine tests are analyst judgements recorded on the scenario, not
        computed thresholds. Re-run them whenever the evidence base or the
        sibling scenarios change.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ scenario }: { scenario: Scenario }) {
  const updateScenario = useIntelligenceStore((s) => s.updateScenario);

  return (
    <div className="max-w-2xl space-y-4">
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Human review</h3>
        </header>
        <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
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
            hint="How much weight this world should carry in strategy work — plausibility, not probability."
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
      <p className="text-[11.5px] text-ink-faint">
        Created {fmtDate(scenario.createdAt)} · Last updated{" "}
        {fmtDate(scenario.updatedAt)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ScenarioDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const territories = useIntelligenceStore((s) => s.territories);
  const signals = useIntelligenceStore((s) => s.signals);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const implications = useIntelligenceStore((s) => s.implications);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Future Territories", href: "/territories" },
            { label: "Scenario" },
          ]}
        />
        <PageHeader overline="Interpret & Imagine" title="Scenario" />
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
        <PageHeader overline="Interpret & Imagine" title="Scenario not found" />
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
  const quality = qualityChecklistResult(scenario.qualityChecks);
  const assumptionHeavy = scenarioAssumptionHeavy(scenario);

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
        overline={`Interpret & Imagine · ${scenario.id}`}
        title={scenario.title}
        actions={
          <div className="flex max-w-xs flex-wrap items-center justify-end gap-1.5">
            <Pill tone="info">{SCENARIO_TYPE_LABELS[scenario.scenarioType]}</Pill>
            <Pill>{SCENARIO_HORIZON_LABELS[scenario.horizon]}</Pill>
            <ConfidenceBadge level={scenario.confidence} />
            <ReviewStatusBadge status={scenario.reviewStatus} />
          </div>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>
          <Tabs
            tabs={[
              {
                id: "world",
                label: "The world",
                content: <WorldTab scenario={scenario} />,
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
                    result={result}
                    supportingSignals={supportingSignals}
                    supportingPatterns={supportingPatterns}
                    supportingDrivers={supportingDrivers}
                    shapingContradictions={shapingContradictions}
                  />
                ),
              },
              {
                id: "assumptions",
                label: `Assumptions (${scenario.assumptions.length})`,
                content: (
                  <AssumptionsTab
                    scenario={scenario}
                    assumptionHeavy={assumptionHeavy}
                  />
                ),
              },
              {
                id: "quality",
                label: `Quality tests (${quality.passedCount}/${quality.totalCount})`,
                content: <QualityTab quality={quality} />,
              },
              {
                id: "review",
                label: "Review",
                content: <ReviewTab scenario={scenario} />,
              },
            ]}
          />
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <RelatedObjectsPanel groups={relatedGroups} />
          <BiasCheckPanel
            extraQuestions={[
              "Is this a scenario or a prediction in disguise?",
              "Would a different, equally plausible world contradict this one?",
            ]}
          />
        </aside>
      </div>
    </>
  );
}
