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
 * with the relationship trail visible in every mode. Analyst view adds world
 * conditions, winners and losers, early signs, strategic questions, the nine
 * quality tests, evidence link tables and review controls. Methodology view
 * adds the evidence-linkage checklist, the quality-test rubric spelled out,
 * and the audit trail.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { DepthHint, useViewMode, ViewGate } from "@/components/ViewMode";
import { NoContradictionNote } from "@/components/ContradictionPanel";
import {
  EntityLink,
  RelatedObjectsPanel,
  type RelatedGroup,
} from "@/components/EntityLink";
import {
  ConfidenceBadge,
  IdChip,
  Pill,
  ProvenanceBadge,
  ReviewStatusBadge,
} from "@/components/badges";
import { PlainTags } from "@/components/tags";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { explainContradiction, explainScenarioEvidence } from "@/lib/explain";
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
  PatternValidationStatus,
  ReviewStatus,
  Scenario,
  Signal,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
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
  qualityChecklistResult,
} from "../scenario-ui";

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
// Simple reading — the default view, and the Overview tab in deeper views
// ---------------------------------------------------------------------------

/** Shaping contradictions as readable sentences; the absence is explicit. */
function ShapingContradictions({ items }: { items: Contradiction[] }) {
  return (
    <section className="card border-l-2 border-l-tension">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">What shapes it</h3>
      </header>
      {items.length > 0 ? (
        <ul className="divide-y divide-line">
          {items.map((c) => (
            <li key={c.id} className="px-4 py-2.5 text-[13px] leading-relaxed text-ink-soft">
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
      ) : (
        <div className="px-4 py-3">
          <NoContradictionNote />
        </div>
      )}
    </section>
  );
}

/**
 * Declared assumptions with their provenance labels rendered as words.
 * This stays in the simple reading: labelling speculation is a reader-facing
 * duty, not analyst depth.
 */
function AssumptionsSection({ scenario }: { scenario: Scenario }) {
  return (
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
      <p className="border-t border-line px-4 py-2 text-[11.5px] text-ink-faint">
        Anything not linked to evidence is an assumption, and assumptions are
        the first thing to monitor.
      </p>
    </section>
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

      <section
        className={`card px-4 py-3 ${assumptionHeavy ? "border-l-2 border-l-caution" : ""}`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="overline-label">Evidence honesty</p>
          {assumptionHeavy ? <Pill tone="caution">Assumption-heavy</Pill> : null}
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {explainScenarioEvidence(scenario)}
        </p>
      </section>

      <ShapingContradictions items={shapingContradictions} />

      <AssumptionsSection scenario={scenario} />

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Next step</p>
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
      </section>

      <DepthHint>
        World conditions, winners and losers, quality tests and evidence links
      </DepthHint>
    </div>
  );
}

// ---------------------------------------------------------------------------
// World conditions tab (analyst)
// ---------------------------------------------------------------------------

function ConditionsTab({ scenario }: { scenario: Scenario }) {
  return (
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
  );
}

// ---------------------------------------------------------------------------
// Consequences tab (analyst)
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
// Evidence tab (analyst) — link tables back down the pyramid
// ---------------------------------------------------------------------------

const PATTERN_STATUS_WORDS: Record<PatternValidationStatus, string> = {
  hypothesis: "Hypothesis",
  partially_validated: "Partially validated",
  validated: "Validated",
};

function SignalLinkTable({ signals }: { signals: Signal[] }) {
  return (
    <section>
      <p className="overline-label mb-2">Supporting signals ({signals.length})</p>
      {signals.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Signal</th>
                <th>Strength</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link
                      href={`/signals/${s.id}`}
                      className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                    >
                      {s.title}
                    </Link>{" "}
                    <IdChip id={s.id} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {SIGNAL_STRENGTH_LABELS[s.signalStrength]}
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {CONFIDENCE_LABELS[s.confidence]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[11.5px] text-ink-faint">
          No supporting signals linked yet. A scenario must trace back to
          present-day evidence.
        </p>
      )}
    </section>
  );
}

function PatternLinkTable({ patterns }: { patterns: Pattern[] }) {
  return (
    <section>
      <p className="overline-label mb-2">Supporting patterns ({patterns.length})</p>
      {patterns.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Validation status</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link
                      href={`/patterns/${p.id}`}
                      className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                    >
                      {p.name}
                    </Link>{" "}
                    <IdChip id={p.id} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {PATTERN_STATUS_WORDS[p.validationStatus]}
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {CONFIDENCE_LABELS[p.confidence]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[11.5px] text-ink-faint">No supporting patterns linked yet.</p>
      )}
    </section>
  );
}

function DriverLinkTable({ drivers }: { drivers: Driver[] }) {
  return (
    <section>
      <p className="overline-label mb-2">Supporting drivers ({drivers.length})</p>
      {drivers.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Status</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link
                      href={`/drivers/${d.id}`}
                      className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                    >
                      {d.name}
                    </Link>{" "}
                    <IdChip id={d.id} />
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {d.status === "validated" ? "Validated driver" : "Driver hypothesis"}
                  </td>
                  <td className="whitespace-nowrap text-[12px] text-ink-soft">
                    {CONFIDENCE_LABELS[d.confidence]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[11.5px] text-ink-faint">
          No supporting drivers linked yet. The forces that would push the
          territory into this world are unstated.
        </p>
      )}
    </section>
  );
}

function EvidenceTab({
  supportingSignals,
  supportingPatterns,
  supportingDrivers,
  shapingContradictions,
}: {
  supportingSignals: Signal[];
  supportingPatterns: Pattern[];
  supportingDrivers: Driver[];
  shapingContradictions: Contradiction[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-[11.5px] text-ink-faint">
        Claims in this scenario that are not supported by the links below are
        labelled as assumptions on the Overview.
      </p>

      <SignalLinkTable signals={supportingSignals} />
      <PatternLinkTable patterns={supportingPatterns} />
      <DriverLinkTable drivers={supportingDrivers} />

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
// Quality tests tab (analyst)
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
// Review tab (analyst)
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
// Methodology tab (methodology only)
// ---------------------------------------------------------------------------

function MethodologyTab({
  scenario,
  result,
}: {
  scenario: Scenario;
  result: ValidationResult;
}) {
  return (
    <div className="space-y-4">
      <ValidationChecklist
        result={result}
        title="Evidence linkage rules"
        passedLabel="Evidence-linked"
        failedLabel="Insufficiently linked"
      />

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">The quality-test rubric</h3>
        </header>
        <p className="px-4 pt-3 text-[13px] leading-relaxed text-ink-soft">
          Each of the nine tests is an analyst judgement recorded on the
          scenario. This is what each test asks before it may be marked as
          passed:
        </p>
        <ul className="mt-2 divide-y divide-line">
          {QUALITY_KEYS.map((k) => (
            <li key={k} className="px-4 py-2.5">
              <p className="text-[12.5px] font-medium text-ink">
                {SCENARIO_QUALITY_LABELS[k]}
              </p>
              <p className="text-[11.5px] leading-relaxed text-ink-faint">
                {QUALITY_DETAILS[k]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Audit trail</h3>
        </header>
        <dl className="divide-y divide-line">
          <div className="flex items-baseline justify-between gap-3 px-4 py-2">
            <dt className="text-[12px] text-ink-faint">Record id</dt>
            <dd>
              <IdChip id={scenario.id} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 px-4 py-2">
            <dt className="text-[12px] text-ink-faint">Created</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(scenario.createdAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 px-4 py-2">
            <dt className="text-[12px] text-ink-faint">Last updated</dt>
            <dd className="text-[12px] text-ink-soft">{fmtDate(scenario.updatedAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 px-4 py-2">
            <dt className="text-[12px] text-ink-faint">Review status</dt>
            <dd className="text-[12px] text-ink-soft">
              {REVIEW_STATUS_LABELS[scenario.reviewStatus]}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 px-4 py-2">
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

  const simpleReading = (
    <SimpleReading
      scenario={scenario}
      assumptionHeavy={assumptionHeavy}
      shapingContradictions={shapingContradictions}
    />
  );

  const analystTabs = [
    {
      id: "overview",
      label: "Overview",
      content: simpleReading,
    },
    {
      id: "conditions",
      label: "World conditions",
      content: <ConditionsTab scenario={scenario} />,
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
          supportingSignals={supportingSignals}
          supportingPatterns={supportingPatterns}
          supportingDrivers={supportingDrivers}
          shapingContradictions={shapingContradictions}
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
            <ViewGate min="analyst">
              <ConfidenceBadge level={scenario.confidence} />
              <ReviewStatusBadge status={scenario.reviewStatus} />
            </ViewGate>
          </div>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>{mode === "simple" ? simpleReading : <Tabs tabs={tabs} />}</div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <RelatedObjectsPanel groups={relatedGroups} />
          <ViewGate min="analyst">
            <BiasCheckPanel
              extraQuestions={[
                "Is this a scenario or a prediction in disguise?",
                "Would a different, equally plausible world contradict this one?",
              ]}
            />
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
