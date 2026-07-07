"use client";

/**
 * Contradiction detail — one tension between two valid forces, with the
 * evidence for each side, who gains and who loses, possible trajectories
 * (always labelled speculative), the strategic reading, five scoring
 * dimensions, and reverse lookups into every layer this tension shapes.
 */

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ContradictionPanel } from "@/components/ContradictionPanel";
import { EntityLink, RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { ScoreGrid } from "@/components/ScorePanel";
import { IdChip, ProvenanceBadge, ReviewStatusBadge } from "@/components/badges";
import { Field, Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import type { Contradiction, ReviewStatus, Signal } from "@/lib/types";
import {
  CONTRADICTION_SCORE_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/types";
import {
  ContradictionTypePill,
  contradictionScoresRecord,
  fmtDate,
} from "../contradiction-ui";

// ---------------------------------------------------------------------------
// Evidence per side
// ---------------------------------------------------------------------------

function SideEvidenceCard({
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
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Evidence for Side {side}</h3>
      </header>
      <div className="px-4 py-3">
        <p className="mb-2 text-[11.5px] text-ink-faint">{statement}</p>
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
          <ProvenanceBadge label="speculative_possibility" />
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
          <ProvenanceBadge label="speculative_possibility" />
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
// Review
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
        <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
          Created {fmtDate(contradiction.createdAt)} · Last updated{" "}
          {fmtDate(contradiction.updatedAt)}
        </p>
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
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <ContradictionTypePill type={contradiction.contradictionType} />
            <ReviewStatusBadge status={contradiction.reviewStatus} />
          </div>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="space-y-4">
          <ContradictionPanel contradiction={contradiction} linked={false} />

          <div className="grid gap-4 sm:grid-cols-2">
            <SideEvidenceCard
              side="A"
              statement={contradiction.sideA}
              signalIds={contradiction.sideASignalIds}
              signals={signals}
            />
            <SideEvidenceCard
              side="B"
              statement={contradiction.sideB}
              signalIds={contradiction.sideBSignalIds}
              signals={signals}
            />
          </div>

          <StakesCard contradiction={contradiction} />
          <TrajectoriesCards contradiction={contradiction} />

          <section className="card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
              <h3 className="overline-label">Strategic implication</h3>
              <ProvenanceBadge label="human_interpretation" />
            </header>
            <div className="px-4 py-3">
              <BodyText
                text={contradiction.strategicImplication}
                emptyNote="No strategic reading recorded yet — what should be watched or decided differently because this tension exists?"
              />
            </div>
          </section>

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

          <section className="card">
            <header className="border-b border-line px-4 py-2.5">
              <h3 className="overline-label">Contradiction scores — five dimensions</h3>
            </header>
            <div className="px-4 py-3">
              <ScoreGrid
                scores={contradictionScoresRecord(contradiction.scores)}
                labels={CONTRADICTION_SCORE_LABELS}
              />
              <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
                Scores are analyst judgements against the 1–5 rubric. Low evidence
                balance means one side is under-scanned — strengthen the weaker
                side before drawing conclusions from this tension.
              </p>
            </div>
          </section>

          <ReviewCard contradiction={contradiction} />
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <div className="card flex flex-wrap items-center gap-1.5 px-4 py-2.5">
            <ReviewStatusBadge status={contradiction.reviewStatus} />
            <IdChip id={contradiction.id} />
          </div>
          <RelatedObjectsPanel groups={relatedGroups} />
        </aside>
      </div>
    </>
  );
}
