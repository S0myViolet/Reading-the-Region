"use client";

/**
 * Cluster detail — one cluster candidate or valid cluster, with its unifying
 * question, linked signals, live validation against the cluster thresholds,
 * contradictions, and review controls. Validity is always computed from the
 * evidence; the stored status is never presented on its own.
 *
 * Visibility layers: the simple view reads as prose — statement, status in
 * plain language, evidence summary, what could contradict it, next step —
 * with the relationship trail alongside. Analyst view opens the full tabs
 * (validation checklist, nine-dimension scores, per-signal table, review
 * controls); Methodology view adds the threshold table and audit trail.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { ContradictionPanel, NoContradictionNote } from "@/components/ContradictionPanel";
import { EntityLink, RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { ScoreGrid } from "@/components/ScorePanel";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import {
  ConfidenceBadge,
  IdChip,
  ReviewStatusBadge,
  SignalStrengthBadge,
} from "@/components/badges";
import { PlainTags, SectorTags, SystemTags } from "@/components/tags";
import { Field, Select, TextArea } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateCluster, type ValidationResult } from "@/lib/validation";
import {
  explainClusterStatus,
  explainContradiction,
  nextStepForCluster,
} from "@/lib/explain";
import type {
  Cluster,
  ConfidenceLevel,
  Contradiction,
  ReviewStatus,
  Signal,
} from "@/lib/types";
import {
  ACTOR_TYPE_LABELS,
  CLUSTER_SCORE_LABELS,
  CLUSTER_THRESHOLDS,
  CONFIDENCE_LABELS,
  REVIEW_STATUS_LABELS,
} from "@/lib/types";
import {
  ClusterValidityPill,
  btnPrimary,
  clusterScoresRecord,
  deriveClusterFacts,
  fmtDate,
  signalsOfCluster,
} from "../cluster-ui";

// ---------------------------------------------------------------------------
// Simple view — the cluster as readable prose, depth on demand
// ---------------------------------------------------------------------------

function SimpleView({
  cluster,
  result,
  linkedContradictions,
}: {
  cluster: Cluster;
  result: ValidationResult;
  linkedContradictions: Contradiction[];
}) {
  return (
    <div className="space-y-4">
      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Cluster statement</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {cluster.clusterStatement.trim() ? (
            cluster.clusterStatement
          ) : (
            <span className="text-[12px] text-ink-faint">
              No cluster statement recorded yet.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">Status</p>
        <div className="mb-1.5">
          <ClusterValidityPill result={result} />
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {explainClusterStatus(cluster, result)}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Evidence summary</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {cluster.evidenceSummary.trim() ? (
            cluster.evidenceSummary
          ) : (
            <span className="text-[12px] text-ink-faint">
              No evidence summary recorded yet. Summarise what the linked signals
              show — and where they disagree.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1.5">What could contradict this</p>
        {linkedContradictions.length > 0 ? (
          <ul className="space-y-2">
            {linkedContradictions.map((c) => (
              <li key={c.id} className="text-[13px] leading-relaxed text-ink-soft">
                {explainContradiction(c)}{" "}
                <Link
                  href={`/contradictions/${c.id}`}
                  className="whitespace-nowrap text-[11.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:decoration-accent"
                >
                  View {c.id}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <NoContradictionNote />
        )}
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Next step</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {nextStepForCluster(cluster, result)}
        </p>
      </section>

      <DepthHint>
        Validation checks, nine-dimension scores, per-signal detail and review
        controls
      </DepthHint>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview tab (analyst)
// ---------------------------------------------------------------------------

function OverviewTab({
  cluster,
  clusterSignals,
}: {
  cluster: Cluster;
  clusterSignals: Signal[];
}) {
  const facts = deriveClusterFacts(clusterSignals);
  return (
    <div className="space-y-4">
      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Unifying question</p>
        <p className="text-[14px] italic leading-relaxed text-ink">
          {cluster.unifyingQuestion.trim() ? (
            cluster.unifyingQuestion
          ) : (
            <span className="not-italic text-[12px] text-ink-faint">
              No unifying question recorded. A cluster is organised around one
              question, not a topic — add it in Review.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Cluster statement</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {cluster.clusterStatement.trim() ? (
            cluster.clusterStatement
          ) : (
            <span className="text-[12px] text-ink-faint">
              No cluster statement recorded yet.
            </span>
          )}
        </p>
      </section>

      <section className="card px-4 py-3">
        <p className="overline-label mb-1">Evidence summary</p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {cluster.evidenceSummary.trim() ? (
            cluster.evidenceSummary
          ) : (
            <span className="text-[12px] text-ink-faint">
              No evidence summary recorded yet. Summarise what the linked signals
              show — and where they disagree.
            </span>
          )}
        </p>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">
            Derived from linked signals — not asserted
          </h3>
        </header>
        <dl className="space-y-3 px-4 py-3">
          <div>
            <dt className="overline-label mb-1">Sectors involved</dt>
            <dd>
              {facts.sectors.length > 0 ? (
                <SectorTags sectors={facts.sectors} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No sectors yet — link signals to derive them.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Geographies</dt>
            <dd>
              {facts.countries.length > 0 ? (
                <PlainTags tags={facts.countries} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No geographies yet — link signals to derive them.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Actor types</dt>
            <dd>
              {facts.actorTypes.length > 0 ? (
                <PlainTags tags={facts.actorTypes.map((a) => ACTOR_TYPE_LABELS[a])} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No actor types yet — link signals to derive them.
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="overline-label mb-1">Systems affected</dt>
            <dd>
              {facts.systems.length > 0 ? (
                <SystemTags systems={facts.systems} />
              ) : (
                <span className="text-[11.5px] text-ink-faint">
                  No systems yet — link signals to derive them.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <BiasCheckPanel />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Signals tab (analyst) — linked signals with per-signal scores
// ---------------------------------------------------------------------------

function SignalsTab({ clusterSignals }: { clusterSignals: Signal[] }) {
  if (clusterSignals.length === 0) {
    return (
      <EmptyState
        message={`This cluster has no linked signals yet. A cluster only exists through its evidence — it needs at least ${CLUSTER_THRESHOLDS.minSignals} signals sharing one underlying logic. Connect signals from the Signal Library.`}
        actionLabel="Open the Signal Library"
        actionHref="/signals"
      />
    );
  }
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Signal</th>
              <th>Strength</th>
              <th>Confidence</th>
              <th>Evidence</th>
              <th>Strategic relevance</th>
              <th>Momentum</th>
            </tr>
          </thead>
          <tbody>
            {clusterSignals.map((s) => (
              <tr key={s.id}>
                <td>
                  <EntityLink kind="signal" id={s.id} title={s.title} />
                </td>
                <td>
                  <SignalStrengthBadge strength={s.signalStrength} />
                </td>
                <td>
                  <ConfidenceBadge level={s.confidence} />
                </td>
                <td className="font-mono text-[11.5px]">{s.scores.evidence}/5</td>
                <td className="font-mono text-[11.5px]">
                  {s.scores.strategicRelevance}/5
                </td>
                <td className="font-mono text-[11.5px]">{s.scores.momentum}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11.5px] text-ink-faint">
        Per-signal scores are the analyst judgements recorded on each signal —
        open a signal for its full scoring panel and rubric anchors.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation tab (analyst)
// ---------------------------------------------------------------------------

function ValidationTab({
  cluster,
  result,
}: {
  cluster: Cluster;
  result: ValidationResult;
}) {
  const t = CLUSTER_THRESHOLDS;
  return (
    <div className="space-y-4">
      <ValidationChecklist
        result={result}
        title="Cluster validation thresholds"
        passedLabel="Valid cluster"
        failedLabel="Candidate — not yet valid"
      />
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Cluster scores — nine dimensions</h3>
        </header>
        <div className="px-4 py-3">
          <ScoreGrid
            scores={clusterScoresRecord(cluster.scores)}
            labels={CLUSTER_SCORE_LABELS}
          />
          <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
            Validation benchmarks: breadth ≥ {t.minBreadth}, depth ≥ {t.minDepth},
            coherence ≥ {t.minCoherence}, strategic relevance ≥{" "}
            {t.minStrategicRelevance}. Scores are analyst judgements against the
            1–5 rubric — they support validation, they do not replace the evidence
            thresholds.
          </p>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Methodology tab — thresholds spelled out + audit trail
// ---------------------------------------------------------------------------

function MethodologyTab({
  cluster,
  result,
}: {
  cluster: Cluster;
  result: ValidationResult;
}) {
  const t = CLUSTER_THRESHOLDS;
  const thresholdRows: Array<[string, string]> = [
    ["Minimum linked signals", String(t.minSignals)],
    ["Minimum independent sources across linked signals", String(t.minIndependentSources)],
    ["Minimum sectors represented", String(t.minSectors)],
    ["Minimum actor types represented", String(t.minActorTypes)],
    ["Minimum linked contradictions", String(t.minContradictions)],
    ["Minimum breadth score", `${t.minBreadth}/5`],
    ["Minimum depth score", `${t.minDepth}/5`],
    ["Minimum coherence score", `${t.minCoherence}/5`],
    ["Minimum strategic relevance score", `${t.minStrategicRelevance}/5`],
  ];
  return (
    <div className="space-y-4">
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Cluster validation thresholds</h3>
        </header>
        <div className="overflow-x-auto px-4 py-3">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {thresholdRows.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="font-mono text-[11.5px]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
            A cluster is valid only when every requirement passes, plus a clear
            unifying question. The score minimums support validation; they never
            override the evidence thresholds. This cluster currently passes{" "}
            {result.passedCount} of {result.totalCount} checks.
          </p>
        </div>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Audit trail</h3>
        </header>
        <dl className="space-y-2.5 px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Record id</dt>
            <dd>
              <IdChip id={cluster.id} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Created</dt>
            <dd className="text-[12.5px] text-ink">{fmtDate(cluster.createdAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Last updated</dt>
            <dd className="text-[12.5px] text-ink">{fmtDate(cluster.updatedAt)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Review status</dt>
            <dd>
              <ReviewStatusBadge status={cluster.reviewStatus} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Stored status field</dt>
            <dd className="font-mono text-[11.5px] text-ink-soft">{cluster.status}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="overline-label">Computed from evidence</dt>
            <dd className="font-mono text-[11.5px] text-ink-soft">
              {result.valid ? "valid" : "candidate"} · {result.passedCount}/
              {result.totalCount} checks
            </dd>
          </div>
        </dl>
        <p className="border-t border-line px-4 py-2.5 text-[11.5px] text-ink-faint">
          Review status is a human decision recorded in the Review tab. It is
          stored separately from computed validity and never overrides it.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab (analyst)
// ---------------------------------------------------------------------------

const REVIEW_STATUS_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function ReviewTab({ cluster }: { cluster: Cluster }) {
  const updateCluster = useIntelligenceStore((s) => s.updateCluster);
  const [notes, setNotes] = useState(cluster.humanNotes);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-2xl space-y-4">
      <section className="card">
        <header className="border-b border-line px-4 py-2.5">
          <h3 className="overline-label">Human review</h3>
        </header>
        <div className="space-y-4 px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Review status"
              hint="A review decision about the record — separate from computed validity."
            >
              <Select
                value={cluster.reviewStatus}
                onChange={(e) =>
                  updateCluster(cluster.id, {
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
              hint="How much weight the cluster interpretation should carry."
            >
              <Select
                value={cluster.confidence}
                onChange={(e) =>
                  updateCluster(cluster.id, {
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
          <Field
            label="Human notes"
            hint="Interpretation, doubts, and next evidence to look for."
          >
            <TextArea
              rows={5}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
            />
          </Field>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                updateCluster(cluster.id, { humanNotes: notes });
                setSaved(true);
              }}
            >
              Save notes
            </button>
            {saved ? (
              <span className="text-[11.5px] text-accent-ink">Notes saved.</span>
            ) : null}
          </div>
        </div>
      </section>
      <p className="text-[11.5px] text-ink-faint">
        Created {fmtDate(cluster.createdAt)} · Last updated {fmtDate(cluster.updatedAt)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right column — relationship trail + candidate guidance
// ---------------------------------------------------------------------------

function CandidateGuidanceCard({ result }: { result: ValidationResult }) {
  const failing = result.checks.filter((c) => !c.passed);
  return (
    <section className="card border-l-2 border-l-caution">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">What this cluster still needs</h3>
      </header>
      <div className="px-4 py-3">
        <p className="text-[12.5px] text-ink-soft">
          This cluster is still a candidate. Add more evidence before validating.
        </p>
        <ul className="mt-2 space-y-1.5">
          {failing.map((c) => (
            <li key={c.label} className="border-l-2 border-caution/40 pl-2.5">
              <p className="text-[12px] font-medium text-ink">{c.label}</p>
              <p className="text-[11.5px] text-ink-faint">{c.detail}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/signals"
          className="mt-3 inline-block text-[11.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:decoration-accent"
        >
          Find related signals in the Signal Library
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClusterDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrated = useHydrated();
  const mode = useViewMode();
  const clusters = useIntelligenceStore((s) => s.clusters);
  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const drivers = useIntelligenceStore((s) => s.drivers);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Signal Clusters", href: "/clusters" }]} />
        <PageHeader overline="Connect & Synthesize" title="Cluster" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const id = typeof params.id === "string" ? params.id : "";
  const cluster = clusters.find((c) => c.id === id);

  if (!cluster) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Signal Clusters", href: "/clusters" },
            { label: "Not found" },
          ]}
        />
        <PageHeader overline="Connect & Synthesize" title="Cluster not found" />
        <EmptyState
          message={`No cluster carries the id “${id}”. It may have been created in a different browser (the intelligence base is stored locally) or the id may be mistyped. Browse the cluster list to find the record you need.`}
          actionLabel="Back to Signal Clusters"
          actionHref="/clusters"
        />
      </>
    );
  }

  const result = validateCluster(cluster, signals, sources);
  const clusterSignals = signalsOfCluster(cluster, signals);
  const linkedContradictions = contradictions.filter((c) =>
    cluster.contradictionIds.includes(c.id),
  );
  const linkedPatterns = patterns.filter((p) =>
    cluster.possiblePatternIds.includes(p.id),
  );
  const linkedDrivers = drivers.filter((d) =>
    cluster.possibleDriverIds.includes(d.id),
  );
  const simple = mode === "simple";

  const crumbs: Array<{ label: string; href?: string }> = [
    { label: "Signal Clusters", href: "/clusters" },
    { label: cluster.name },
  ];
  if (linkedPatterns.length > 0) {
    crumbs.push({
      label: `Possible pattern: ${linkedPatterns[0].name}`,
      href: `/patterns/${linkedPatterns[0].id}`,
    });
  }

  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Signals",
      kind: "signal",
      items: clusterSignals.map((s) => ({ id: s.id, title: s.title })),
      emptyNote: "No linked signals yet — a cluster only exists through its evidence.",
    },
    {
      heading: "Contradictions",
      kind: "contradiction",
      items: linkedContradictions.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No contradictions linked. A cluster without tension is usually under-scanned.",
    },
    {
      heading: "Possible patterns",
      kind: "pattern",
      items: linkedPatterns.map((p) => ({ id: p.id, title: p.name })),
      emptyNote: "No pattern connections yet — patterns emerge from repeated cluster logic.",
    },
    {
      heading: "Possible drivers",
      kind: "driver",
      items: linkedDrivers.map((d) => ({ id: d.id, title: d.name })),
      emptyNote: "No driver hypotheses connected yet.",
    },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: <OverviewTab cluster={cluster} clusterSignals={clusterSignals} />,
    },
    {
      id: "signals",
      label: `Signals (${clusterSignals.length})`,
      content: <SignalsTab clusterSignals={clusterSignals} />,
    },
    {
      id: "validation",
      label: "Validation",
      content: <ValidationTab cluster={cluster} result={result} />,
    },
    {
      id: "contradictions",
      label: `Contradictions (${linkedContradictions.length})`,
      content:
        linkedContradictions.length > 0 ? (
          <div className="space-y-4">
            {linkedContradictions.map((c) => (
              <ContradictionPanel key={c.id} contradiction={c} />
            ))}
          </div>
        ) : (
          <NoContradictionNote />
        ),
    },
    {
      id: "review",
      label: "Review",
      content: <ReviewTab cluster={cluster} />,
    },
  ];
  if (mode === "methodology") {
    tabs.push({
      id: "methodology",
      label: "Methodology",
      content: <MethodologyTab cluster={cluster} result={result} />,
    });
  }

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader
        overline={`Connect & Synthesize · ${cluster.id}`}
        title={cluster.name}
        description={
          simple && cluster.unifyingQuestion.trim()
            ? cluster.unifyingQuestion
            : undefined
        }
        actions={
          simple ? undefined : (
            <div className="flex flex-col items-end gap-1">
              <ClusterValidityPill result={result} />
              <span className="font-mono text-[11px] text-ink-faint">
                {result.passedCount}/{result.totalCount} checks passed
              </span>
            </div>
          )
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div>
          {simple ? (
            <SimpleView
              cluster={cluster}
              result={result}
              linkedContradictions={linkedContradictions}
            />
          ) : (
            <Tabs tabs={tabs} />
          )}
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <ViewGate min="analyst">
            <div className="card flex flex-wrap items-center gap-1.5 px-4 py-2.5">
              <ReviewStatusBadge status={cluster.reviewStatus} />
              <ConfidenceBadge level={cluster.confidence} />
              <IdChip id={cluster.id} />
            </div>
          </ViewGate>
          <RelatedObjectsPanel groups={relatedGroups} />
          <ViewGate min="analyst">
            {!result.valid ? <CandidateGuidanceCard result={result} /> : null}
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
