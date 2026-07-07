"use client";

/**
 * Contradiction detail — one tension between two valid forces.
 *
 * Visibility layers: the simple view reads top to bottom — the tension as one
 * sentence, the underlying question, who gains and loses, the strategic
 * reading, the evidence for each side, and a next step. Analyst view adds the
 * five explained scores, possible trajectories, full evidence text and review
 * controls; Methodology view adds the contradiction-type taxonomy and the
 * audit trail. The relationship trail is visible in every mode.
 */

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { EntityLink, RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { ScoreBar } from "@/components/ScorePanel";
import { IdChip, ProvenanceBadge, ReviewStatusBadge } from "@/components/badges";
import { Field, Select } from "@/components/form";
import { DepthHint, ViewGate } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { explainContradiction } from "@/lib/explain";
import type { Contradiction, ContradictionScores, ReviewStatus, Signal } from "@/lib/types";
import {
  CONTRADICTION_SCORE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  type ContradictionType,
} from "@/lib/types";
import {
  ContradictionTypePill,
  contradictionScoreReading,
  fmtDate,
} from "../contradiction-ui";

const SCORE_KEYS = Object.keys(CONTRADICTION_SCORE_LABELS) as Array<
  keyof ContradictionScores
>;
const TYPE_KEYS = Object.keys(CONTRADICTION_TYPE_LABELS) as ContradictionType[];

// ---------------------------------------------------------------------------
// Evidence per side — calm columns in every mode; the full evidence text
// opens in Analyst view.
// ---------------------------------------------------------------------------

function SideEvidenceCard({
  side,
  statement,
  evidenceText,
  signalIds,
  signals,
}: {
  side: "A" | "B";
  statement: string;
  evidenceText: string;
  signalIds: string[];
  signals: Signal[];
}) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Evidence for Side {side}</h3>
      </header>
      <div className="px-4 py-3">
        <p className="mb-2 text-[13px] leading-relaxed text-ink">{statement}</p>
        <ViewGate min="analyst">
          {evidenceText.trim() ? (
            <p className="mb-2 border-l-2 border-l-line pl-2.5 text-[12px] leading-relaxed text-ink-soft">
              {evidenceText}
            </p>
          ) : (
            <p className="mb-2 text-[11.5px] text-ink-faint">
              No evidence summary written for Side {side} yet.
            </p>
          )}
        </ViewGate>
        {signalIds.length > 0 ? (
          <div className="grid gap-1.5">
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
          <p className="text-[11.5px] text-ink-faint">
            No supporting signals linked to Side {side} yet. A contradiction stays
            defensible only while both sides remain evidence-linked — connect
            signals from the Signal Library.
          </p>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Text sections
// ---------------------------------------------------------------------------

function BodyText({ text, emptyNote }: { text: string; emptyNote: string }) {
  return text.trim() ? (
    <p className="text-[13px] leading-relaxed text-ink-soft">{text}</p>
  ) : (
    <p className="text-[12px] text-ink-faint">{emptyNote}</p>
  );
}

function StakesCard({ contradiction }: { contradiction: Contradiction }) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Stakes — who gains, who loses</h3>
      </header>
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3">
          <p className="overline-label mb-1">Who benefits</p>
          <BodyText
            text={contradiction.whoBenefits}
            emptyNote="Not recorded yet — map who gains if this tension persists."
          />
        </div>
        <div className="px-4 py-3">
          <p className="overline-label mb-1">Who loses</p>
          <BodyText
            text={contradiction.whoLoses}
            emptyNote="Not recorded yet — map who is exposed if this tension persists."
          />
        </div>
      </div>
    </section>
  );
}

function TrajectoriesCards({ contradiction }: { contradiction: Contradiction }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section className="card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Possible resolution</h3>
          <ViewGate min="methodology">
            <ProvenanceBadge label="speculative_possibility" />
          </ViewGate>
        </header>
        <div className="px-4 py-3">
          <BodyText
            text={contradiction.possibleResolution}
            emptyNote="No resolution path sketched yet."
          />
        </div>
      </section>
      <section className="card">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Possible escalation</h3>
          <ViewGate min="methodology">
            <ProvenanceBadge label="speculative_possibility" />
          </ViewGate>
        </header>
        <div className="px-4 py-3">
          <BodyText
            text={contradiction.possibleEscalation}
            emptyNote="No escalation path sketched yet."
          />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scores — each dimension paired with a reading derived from its value
// ---------------------------------------------------------------------------

function ExplainedScoresCard({ contradiction }: { contradiction: Contradiction }) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Contradiction scores — five dimensions</h3>
      </header>
      <div className="space-y-3 px-4 py-3">
        {SCORE_KEYS.map((k) => (
          <div key={k}>
            <ScoreBar
              value={contradiction.scores[k]}
              label={CONTRADICTION_SCORE_LABELS[k]}
            />
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
              {contradictionScoreReading(k, contradiction.scores[k])}
            </p>
          </div>
        ))}
        <p className="border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
          Scores are analyst judgements against the 1–5 rubric. Low evidence
          balance means one side is under-scanned — strengthen the weaker side
          before drawing conclusions from this tension.
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Review (analyst) and audit trail (methodology)
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];

function ReviewCard({ contradiction }: { contradiction: Contradiction }) {
  const updateContradiction = useIntelligenceStore((s) => s.updateContradiction);
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Human review</h3>
      </header>
      <div className="px-4 py-4">
        <div className="max-w-xs">
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
      </div>
    </section>
  );
}

function TaxonomyCard({ contradiction }: { contradiction: Contradiction }) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Contradiction-type taxonomy</h3>
      </header>
      <div className="px-4 py-3">
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          This record is classified as{" "}
          <span className="font-medium text-ink">
            {CONTRADICTION_TYPE_LABELS[contradiction.contradictionType]}
          </span>
          , one of the nine recurring tension families the platform tracks.
          Typing every tension against the same taxonomy lets recurring
          families be compared across sectors and over time.
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
      </div>
    </section>
  );
}

function AuditTrailCard({ contradiction }: { contradiction: Contradiction }) {
  return (
    <section className="card px-4 py-3">
      <p className="overline-label mb-1">Audit trail</p>
      <p className="text-[11.5px] leading-relaxed text-ink-faint">
        Record <span className="font-mono">{contradiction.id}</span> · Created{" "}
        {fmtDate(contradiction.createdAt)} · Last updated{" "}
        {fmtDate(contradiction.updatedAt)} · Review status:{" "}
        {REVIEW_STATUS_LABELS[contradiction.reviewStatus]}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContradictionDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
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
        <PageHeader overline="Connect & Synthesize" title="Contradiction" />
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
        <PageHeader overline="Connect & Synthesize" title="Contradiction not found" />
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
      <PageHeader
        overline={`Connect & Synthesize · ${contradiction.id}`}
        title={contradiction.name}
        description={explainContradiction(contradiction)}
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <ContradictionTypePill type={contradiction.contradictionType} />
            <ViewGate min="analyst">
              <ReviewStatusBadge status={contradiction.reviewStatus} />
            </ViewGate>
          </div>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="space-y-4">
          <section className="card px-4 py-3">
            <p className="overline-label mb-1">The underlying tension</p>
            <BodyText
              text={contradiction.underlyingTension}
              emptyNote="Not recorded yet — name the deeper question both forces are answering differently."
            />
          </section>

          <StakesCard contradiction={contradiction} />

          <section className="card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
              <h3 className="overline-label">Strategic implication</h3>
              <ViewGate min="methodology">
                <ProvenanceBadge label="human_interpretation" />
              </ViewGate>
            </header>
            <div className="px-4 py-3">
              <BodyText
                text={contradiction.strategicImplication}
                emptyNote="No strategic reading recorded yet — what should be watched or decided differently because this tension exists?"
              />
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <SideEvidenceCard
              side="A"
              statement={contradiction.sideA}
              evidenceText={contradiction.evidenceSideA}
              signalIds={contradiction.sideASignalIds}
              signals={signals}
            />
            <SideEvidenceCard
              side="B"
              statement={contradiction.sideB}
              evidenceText={contradiction.evidenceSideB}
              signalIds={contradiction.sideBSignalIds}
              signals={signals}
            />
          </div>

          <section className="card px-4 py-3">
            <p className="overline-label mb-1">Next step</p>
            <p className="text-[13px] leading-relaxed text-ink-soft">{nextStep}</p>
          </section>

          <DepthHint>Scoring, possible trajectories and review detail</DepthHint>

          <ViewGate min="analyst">
            <div className="space-y-4">
              <ExplainedScoresCard contradiction={contradiction} />
              <TrajectoriesCards contradiction={contradiction} />
              <section className="card">
                <header className="border-b border-line px-4 py-2.5">
                  <h3 className="overline-label">Scenario relevance</h3>
                </header>
                <div className="px-4 py-3">
                  <BodyText
                    text={contradiction.scenarioRelevance}
                    emptyNote="Not recorded yet — strong contradictions usually become the axes along which scenarios diverge."
                  />
                </div>
              </section>
              <ReviewCard contradiction={contradiction} />
            </div>
          </ViewGate>

          <ViewGate min="methodology">
            <div className="space-y-4">
              <TaxonomyCard contradiction={contradiction} />
              <AuditTrailCard contradiction={contradiction} />
            </div>
          </ViewGate>
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <ViewGate min="analyst">
            <div className="card flex flex-wrap items-center gap-1.5 px-4 py-2.5">
              <ReviewStatusBadge status={contradiction.reviewStatus} />
              <IdChip id={contradiction.id} />
            </div>
          </ViewGate>
          <RelatedObjectsPanel groups={relatedGroups} />
        </aside>
      </div>
    </>
  );
}
