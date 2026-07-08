"use client";

/**
 * Contradiction detail — one tension between two valid forces. A
 * contradiction is not an error: both sides are valid evidence, and the page
 * keeps them side by side rather than resolving them.
 *
 * Two registers. The simple view reads top to bottom as a short article: the
 * tension as one sentence, the underlying question, who gains and loses, the
 * strategic reading, the evidence for each side, and a next step. The
 * advanced view (analyst and methodology depths) restructures the same
 * material into labelled blocks: the two sides as balanced columns with
 * their signals and an honest evidence-strength line, the underlying
 * tension, why it matters, what to watch, the five scores read as sentences,
 * the two speculative trajectories, and review. Methodology depth adds the
 * type taxonomy and the audit trail. The header (title plus the one-sentence
 * plain summary) and the review controls are shared by both registers.
 */

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { EmptyState } from "@/components/EmptyState";
import { EntityLink, RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import {
  ConnectBlock,
  IncompleteNote,
  RelationshipTrail,
  ScoreExplanationRow,
  type TrailGroup,
} from "@/components/connect";
import { ReviewStatusBadge } from "@/components/badges";
import { Field, Select } from "@/components/form";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { signalStage } from "@/lib/pipeline";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { explainContradiction } from "@/lib/explain";
import type { Contradiction, ContradictionScores, ReviewStatus, Signal } from "@/lib/types";
import {
  CONTRADICTION_SCORE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  ENTITY_ROUTES,
  REVIEW_STATUS_LABELS,
  type ContradictionType,
} from "@/lib/types";
import {
  contradictionScoreReading,
  fmtDate,
  sideEvidenceStrength,
} from "../contradiction-ui";

const SCORE_KEYS = Object.keys(CONTRADICTION_SCORE_LABELS) as Array<
  keyof ContradictionScores
>;
const TYPE_KEYS = Object.keys(CONTRADICTION_TYPE_LABELS) as ContradictionType[];

// ---------------------------------------------------------------------------
// Article primitives — headings and prose, no boxes
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
      {children}
    </h2>
  );
}

function BodyText({ text, emptyNote }: { text: string; emptyNote: string }) {
  return text.trim() ? (
    <p className="text-[13px] leading-relaxed text-ink-soft">{text}</p>
  ) : (
    <p className="text-[12px] text-ink-faint">{emptyNote}</p>
  );
}

// ---------------------------------------------------------------------------
// Simple register: evidence per side — two quiet columns, faint labels
// ---------------------------------------------------------------------------

function SideEvidence({
  side,
  statement,
  signalIds,
  signals,
}: {
  side: "A" | "B";
  statement: string;
  signalIds: string[];
  signals: Signal[];
}) {
  return (
    <div>
      <p className="text-[11px] text-ink-faint">{side === "A" ? "One side" : "The other"}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink">{statement}</p>
      {signalIds.length > 0 ? (
        <div className="mt-2 grid gap-1.5">
          {signalIds.map((sid) => {
            const sig = signals.find((s) => s.id === sid);
            return sig ? (
              <EntityLink key={sid} kind="signal" id={sid} title={sig.title} />
            ) : (
              <p key={sid} className="font-mono text-[11px] text-ink-faint">
                {sid} — not found in the signal library
              </p>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-[11.5px] text-ink-faint">
          No supporting signals linked to Side {side} yet. A contradiction stays
          defensible only while both sides remain evidence-linked — connect
          signals from the Signal Library.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Advanced register: one side as a balanced column — claim, what supports it,
// linked signals, and an honest evidence-strength line
// ---------------------------------------------------------------------------

function SideColumn({
  label,
  claim,
  evidenceText,
  signalIds,
  signals,
}: {
  label: string;
  claim: string;
  evidenceText: string;
  signalIds: string[];
  signals: Signal[];
}) {
  const resolved = signalIds
    .map((sid) => signals.find((s) => s.id === sid))
    .filter((s): s is Signal => Boolean(s));
  const missing = signalIds.filter((sid) => !signals.some((s) => s.id === sid));
  const strength = sideEvidenceStrength(resolved);

  return (
    <div>
      <p className="text-[11px] text-ink-faint">{label}</p>
      <p className="mt-1 text-[13px] leading-snug text-ink">{claim}</p>

      <p className="mt-2.5 text-[11px] text-ink-faint">What supports this</p>
      {evidenceText.trim() ? (
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          {evidenceText}
        </p>
      ) : (
        <p className="mt-1 text-[11.5px] text-ink-faint">
          No written evidence summary for this side yet — record what supports
          it, or the claim stands on assertion alone.
        </p>
      )}

      {resolved.length > 0 || missing.length > 0 ? (
        <div className="mt-2 grid gap-1.5">
          {resolved.map((sig) => (
            <EntityLink key={sig.id} kind="signal" id={sig.id} title={sig.title} />
          ))}
          {missing.map((sid) => (
            <p key={sid} className="font-mono text-[11px] text-ink-faint">
              {sid} — not found in the signal library
            </p>
          ))}
        </div>
      ) : null}

      {strength ? (
        <p className="mt-2 font-mono text-[11px] text-ink-faint">{strength}</p>
      ) : (
        <p className="mt-2 text-[11.5px] text-ink-faint">
          No signals linked to this side yet — its evidence lives in the text
          above.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Speculative sections — labelled as plausible paths, never forecasts
// ---------------------------------------------------------------------------

function SpeculativeBlock({
  heading,
  text,
  missing,
  whyItMatters,
  nextStep,
}: {
  heading: string;
  text: string;
  missing: string;
  whyItMatters: string;
  nextStep: string;
}) {
  return (
    <ConnectBlock heading={heading}>
      <p className="text-[11px] text-ink-faint">
        Speculative — a plausible path, not a forecast.
      </p>
      {text.trim() ? (
        <p className="mt-1.5">{text}</p>
      ) : (
        <div className="mt-1.5">
          <IncompleteNote
            missing={missing}
            whyItMatters={whyItMatters}
            nextStep={nextStep}
          />
        </div>
      )}
    </ConnectBlock>
  );
}

// ---------------------------------------------------------------------------
// Review — status, a judgement prompt, and the save control (both registers)
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];

function ReviewSection({ contradiction }: { contradiction: Contradiction }) {
  const updateContradiction = useIntelligenceStore((s) => s.updateContradiction);
  return (
    <section>
      <SectionHeading>Human review</SectionHeading>
      <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-ink-soft">
        Current status:{" "}
        <span className="font-medium text-ink">
          {REVIEW_STATUS_LABELS[contradiction.reviewStatus]}
        </span>
        . A contradiction is not an error — before validating, ask whether both
        sides are still true at the same time, and what new evidence would
        collapse one of them.
      </p>
      <div className="mt-3 max-w-xs">
        <Field
          label="Review status"
          hint="A review decision about this record — a contradiction can itself be validated as a real tension."
        >
          <Select
            value={contradiction.reviewStatus}
            onChange={(e) =>
              updateContradiction(contradiction.id, {
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
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContradictionDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const advanced = useViewMode() !== "simple";
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const signals = useIntelligenceStore((s) => s.signals);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const territories = useIntelligenceStore((s) => s.territories);
  const scenarios = useIntelligenceStore((s) => s.scenarios);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Contradictions", href: "/contradictions" }]} />
        <PageHeader title="Contradiction" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const id = typeof params.id === "string" ? params.id : "";
  const contradiction = contradictions.find((c) => c.id === id);

  if (!contradiction) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Contradictions", href: "/contradictions" },
            { label: "Not found" },
          ]}
        />
        <PageHeader title="Contradiction not found" />
        <EmptyState
          message={`No contradiction carries the id “${id}”. It may have been created in a different browser (the intelligence base is stored locally) or the id may be mistyped. Browse the contradiction list to find the record you need.`}
          actionLabel="Back to Contradictions"
          actionHref="/contradictions"
        />
      </>
    );
  }

  const sideASignals = contradiction.sideASignalIds
    .map((sid) => signals.find((s) => s.id === sid))
    .filter((s): s is Signal => Boolean(s));
  const sideBSignals = contradiction.sideBSignalIds
    .map((sid) => signals.find((s) => s.id === sid))
    .filter((s): s is Signal => Boolean(s));

  // Reverse lookups — every layer that declares this tension as shaping it.
  const linkedClusters = clusters.filter((c) => c.contradictionIds.includes(id));
  const linkedPatterns = patterns.filter((p) => p.contradictionIds.includes(id));
  const linkedDrivers = drivers.filter((d) => d.contradictionIds.includes(id));
  const linkedTerritories = territories.filter((t) =>
    t.contradictionIds.includes(id),
  );
  const linkedScenarios = scenarios.filter((s) =>
    s.shapingContradictionIds.includes(id),
  );

  // Simple register right rail — grouped entity links with honest empty notes.
  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Side A signals",
      kind: "signal",
      items: sideASignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No signals supporting Side A yet.",
    },
    {
      heading: "Side B signals",
      kind: "signal",
      items: sideBSignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No signals supporting Side B yet.",
    },
    {
      heading: "Clusters",
      kind: "cluster",
      items: linkedClusters.map((c) => ({ id: c.id, title: c.name })),
      emptyNote: "No cluster has linked this tension yet.",
    },
    {
      heading: "Patterns",
      kind: "pattern",
      items: linkedPatterns.map((p) => ({ id: p.id, title: p.name })),
      emptyNote: "No pattern has linked this tension yet.",
    },
    {
      heading: "Drivers",
      kind: "driver",
      items: linkedDrivers.map((d) => ({ id: d.id, title: d.name })),
      emptyNote: "No driver has linked this tension yet.",
    },
    {
      heading: "Future territories",
      kind: "territory",
      items: linkedTerritories.map((t) => ({ id: t.id, title: t.name })),
      emptyNote: "No future territory acknowledges this tension yet.",
    },
    {
      heading: "Scenarios",
      kind: "scenario",
      items: linkedScenarios.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No scenario is shaped by this tension yet.",
    },
  ];

  // Advanced register right rail — the same links as a compact trail.
  const trailGroups: TrailGroup[] = [
    {
      label: "Signals — one side",
      previewCount: 3,
      steps: sideASignals.map((s) => ({
        stage: signalStage(s),
        title: s.title,
        href: `${ENTITY_ROUTES.signal}/${s.id}`,
      })),
    },
    {
      label: "Signals — the other side",
      previewCount: 3,
      steps: sideBSignals.map((s) => ({
        stage: signalStage(s),
        title: s.title,
        href: `${ENTITY_ROUTES.signal}/${s.id}`,
      })),
    },
    {
      label: "Clusters holding this tension",
      previewCount: 3,
      steps: linkedClusters.map((c) => ({
        stage: "cluster" as const,
        title: c.name,
        href: `${ENTITY_ROUTES.cluster}/${c.id}`,
      })),
    },
    {
      label: "Patterns holding this tension",
      previewCount: 3,
      steps: linkedPatterns.map((p) => ({
        stage: "pattern" as const,
        title: p.name,
        href: `${ENTITY_ROUTES.pattern}/${p.id}`,
      })),
    },
    {
      label: "Drivers drawing on this tension",
      previewCount: 3,
      steps: linkedDrivers.map((d) => ({
        stage: "driver" as const,
        title: d.name,
        href: `${ENTITY_ROUTES.driver}/${d.id}`,
      })),
    },
    {
      label: "Future territories",
      previewCount: 3,
      steps: linkedTerritories.map((t) => ({
        stage: "territory" as const,
        title: t.name,
        href: `${ENTITY_ROUTES.territory}/${t.id}`,
      })),
    },
    {
      label: "Scenarios shaped by this tension",
      previewCount: 3,
      steps: linkedScenarios.map((s) => ({
        stage: "scenario" as const,
        title: s.title,
        href: `${ENTITY_ROUTES.scenario}/${s.id}`,
      })),
    },
  ];
  const trailHasLinks = trailGroups.some((g) => g.steps.length > 0);

  // Evidence balance: the score reading, plus an honest clause when the two
  // sides' linked-signal counts differ.
  const aCount = sideASignals.length;
  const bCount = sideBSignals.length;
  let balanceExplanation = contradictionScoreReading(
    "evidenceBalance",
    contradiction.scores.evidenceBalance,
  );
  if (aCount !== bCount) {
    const leader = aCount > bCount ? "One side" : "The other side";
    balanceExplanation += ` ${leader} currently has more linked evidence (${Math.max(aCount, bCount)} signal${Math.max(aCount, bCount) === 1 ? "" : "s"} to ${Math.min(aCount, bCount)}).`;
  }

  const nextStep = contradiction.scenarioRelevance.trim()
    ? `Feed this tension into scenario work: ${contradiction.scenarioRelevance}`
    : "Connect this tension to the clusters, drivers and scenarios it should shape — an unconnected contradiction does no strategic work.";

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Contradictions", href: "/contradictions" },
          { label: contradiction.name },
        ]}
      />
      {/* Title plus the one-sentence plain summary of the tension. */}
      <PageHeader
        title={contradiction.name}
        description={explainContradiction(contradiction)}
        actions={
          <div className="flex flex-col items-end gap-1">
            <PipelineStageBadge stage="contradiction" />
            <span className="text-[11.5px] text-tension">
              Contradiction ·{" "}
              {CONTRADICTION_TYPE_LABELS[contradiction.contradictionType]}
            </span>
            <ViewGate min="analyst">
              <ReviewStatusBadge status={contradiction.reviewStatus} />
            </ViewGate>
          </div>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10">
        {advanced ? (
          <article className="max-w-2xl space-y-8">
            <section>
              <SectionHeading>The two sides</SectionHeading>
              <div className="mt-3 border-l-2 border-tension/50 pl-4">
                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  <SideColumn
                    label="One side"
                    claim={contradiction.sideA}
                    evidenceText={contradiction.evidenceSideA}
                    signalIds={contradiction.sideASignalIds}
                    signals={signals}
                  />
                  <SideColumn
                    label="The other side"
                    claim={contradiction.sideB}
                    evidenceText={contradiction.evidenceSideB}
                    signalIds={contradiction.sideBSignalIds}
                    signals={signals}
                  />
                </div>
              </div>
            </section>

            <ConnectBlock heading="Underlying tension">
              {contradiction.underlyingTension.trim() ? (
                <p>{contradiction.underlyingTension}</p>
              ) : (
                <IncompleteNote
                  missing="The underlying tension has not been written yet."
                  whyItMatters="Without the deeper question, the two sides read as a disagreement rather than a tension worth tracking."
                  nextStep="Name the question both sides are answering differently, then record it here."
                />
              )}
            </ConnectBlock>

            <ConnectBlock heading="Why the tension matters">
              {contradiction.strategicImplication.trim() ||
              contradiction.whoBenefits.trim() ||
              contradiction.whoLoses.trim() ? (
                <>
                  {contradiction.strategicImplication.trim() ? (
                    <p>{contradiction.strategicImplication}</p>
                  ) : null}
                  <div className="mt-2 space-y-1.5">
                    {contradiction.whoBenefits.trim() ? (
                      <p className="text-[12px] leading-relaxed text-ink-soft">
                        <span className="text-ink-faint">Who benefits — </span>
                        {contradiction.whoBenefits}
                      </p>
                    ) : null}
                    {contradiction.whoLoses.trim() ? (
                      <p className="text-[12px] leading-relaxed text-ink-soft">
                        <span className="text-ink-faint">Who is exposed — </span>
                        {contradiction.whoLoses}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <IncompleteNote
                  missing="No strategic reading, and no map of who gains or is exposed."
                  whyItMatters="A tension nobody has read strategically changes no decision — it just sits in the record."
                  nextStep="Write what should be watched or decided differently because this tension exists, and who gains or is exposed while it persists."
                />
              )}
            </ConnectBlock>

            <ConnectBlock heading="What to watch">
              {contradiction.scenarioRelevance.trim() ? (
                <p>{contradiction.scenarioRelevance}</p>
              ) : (
                <IncompleteNote
                  missing="No scenario relevance recorded for this tension yet."
                  whyItMatters="Strong contradictions usually become the axes along which scenarios diverge — an unplaced tension shapes no future."
                  nextStep="Note which scenarios this tension should split, or what to check next before it earns a place in scenario work."
                />
              )}
            </ConnectBlock>

            <ConnectBlock heading="Scores">
              <div className="divide-y divide-line">
                {SCORE_KEYS.map((k) => (
                  <ScoreExplanationRow
                    key={k}
                    label={CONTRADICTION_SCORE_LABELS[k]}
                    score={contradiction.scores[k]}
                    explanation={
                      k === "evidenceBalance"
                        ? balanceExplanation
                        : contradictionScoreReading(k, contradiction.scores[k])
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-ink-faint">
                Scores are analyst judgements against the 1–5 rubric, not
                measurements. Low evidence balance means one side is
                under-scanned — strengthen the weaker side before drawing
                conclusions from this tension.
              </p>
            </ConnectBlock>

            <SpeculativeBlock
              heading="Possible resolution"
              text={contradiction.possibleResolution}
              missing="No resolution path sketched yet."
              whyItMatters="Without a sketched resolution there is nothing to test the tension against — no way to notice it easing."
              nextStep="Sketch one plausible way the two sides could settle, and what would have to be true for it."
            />

            <SpeculativeBlock
              heading="Possible escalation"
              text={contradiction.possibleEscalation}
              missing="No escalation path sketched yet."
              whyItMatters="Escalations are where tensions bite — without one sketched, nothing warns that this is sharpening."
              nextStep="Sketch one plausible way this tension could sharpen, and the early signs it is happening."
            />

            <ReviewSection contradiction={contradiction} />

            <ViewGate min="methodology">
              <div className="space-y-8">
                <section>
                  <SectionHeading>Contradiction-type taxonomy</SectionHeading>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                    This record is classified as{" "}
                    <span className="font-medium text-ink">
                      {CONTRADICTION_TYPE_LABELS[contradiction.contradictionType]}
                    </span>
                    , one of the nine recurring tension families the platform
                    tracks. Typing every tension against the same taxonomy lets
                    recurring families be compared across sectors and over time.
                  </p>
                  <ul className="mt-2.5 grid gap-1 sm:grid-cols-2">
                    {TYPE_KEYS.map((t) => (
                      <li
                        key={t}
                        className={`text-[11.5px] ${
                          t === contradiction.contradictionType
                            ? "font-medium text-tension"
                            : "text-ink-faint"
                        }`}
                      >
                        {CONTRADICTION_TYPE_LABELS[t]}
                        {t === contradiction.contradictionType ? " — this record" : ""}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <SectionHeading>Audit trail</SectionHeading>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-faint">
                    Record <span className="font-mono">{contradiction.id}</span> ·
                    Created {fmtDate(contradiction.createdAt)} · Last updated{" "}
                    {fmtDate(contradiction.updatedAt)} · Review status:{" "}
                    {REVIEW_STATUS_LABELS[contradiction.reviewStatus]}
                  </p>
                </section>
              </div>
            </ViewGate>
          </article>
        ) : (
          <article className="max-w-2xl space-y-8">
            <section>
              <SectionHeading>The underlying tension</SectionHeading>
              <div className="mt-1.5">
                <BodyText
                  text={contradiction.underlyingTension}
                  emptyNote="Not recorded yet — name the deeper question both forces are answering differently."
                />
              </div>
            </section>

            <section>
              <SectionHeading>Who gains, who loses</SectionHeading>
              <div className="mt-3 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] text-ink-faint">Who benefits</p>
                  <div className="mt-1">
                    <BodyText
                      text={contradiction.whoBenefits}
                      emptyNote="Not recorded yet — map who gains if this tension persists."
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-ink-faint">Who loses</p>
                  <div className="mt-1">
                    <BodyText
                      text={contradiction.whoLoses}
                      emptyNote="Not recorded yet — map who is exposed if this tension persists."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionHeading>Strategic implication</SectionHeading>
              <div className="mt-1.5">
                <BodyText
                  text={contradiction.strategicImplication}
                  emptyNote="No strategic reading recorded yet — what should be watched or decided differently because this tension exists?"
                />
              </div>
            </section>

            <section>
              <SectionHeading>The evidence, side by side</SectionHeading>
              <div className="mt-3 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                <SideEvidence
                  side="A"
                  statement={contradiction.sideA}
                  signalIds={contradiction.sideASignalIds}
                  signals={signals}
                />
                <SideEvidence
                  side="B"
                  statement={contradiction.sideB}
                  signalIds={contradiction.sideBSignalIds}
                  signals={signals}
                />
              </div>
            </section>

            <section>
              <SectionHeading>What to watch</SectionHeading>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {nextStep}
              </p>
            </section>

            <DepthHint>Scoring, possible trajectories and review detail</DepthHint>
          </article>
        )}

        <aside className="mt-10 lg:mt-0">
          {advanced ? (
            <section>
              <h3 className="mb-3 text-[13px] font-medium text-ink">
                Relationship trail
              </h3>
              {trailHasLinks ? (
                <RelationshipTrail groups={trailGroups} />
              ) : (
                <IncompleteNote
                  missing="No records are linked to this tension yet."
                  whyItMatters="An unconnected contradiction does no strategic work — nothing downstream is forced to answer it."
                  nextStep="Link the signals behind each side, then connect the clusters and patterns this tension should unsettle."
                />
              )}
            </section>
          ) : (
            <RelatedObjectsPanel groups={relatedGroups} />
          )}
        </aside>
      </div>
    </>
  );
}
