"use client";

/**
 * Cluster detail — one cluster candidate or valid cluster, with its unifying
 * question, linked signals, live validation against the cluster thresholds,
 * contradictions, and review controls. Validity is always computed from the
 * evidence; the stored status is never presented on its own.
 *
 * Visibility layers: the simple view reads as one article — statement,
 * status in plain language, evidence summary, what could contradict it,
 * next step — separated by whitespace, not boxes. Analyst view opens the
 * full tabs (validation checklist, nine-dimension scores, per-signal table,
 * review controls); Methodology view adds the threshold table and audit
 * trail as plain definition lines.
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
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { ConfidenceBadge, SignalStrengthBadge } from "@/components/badges";
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

/** Article-style section: small heading, prose underneath, no box. */
function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-2xl">
      <h2 className="mb-2 text-[13px] font-medium text-ink">{heading}</h2>
      {children}
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-ink-soft">{children}</p>;
}

function MissingNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-ink-faint">{children}</p>;
}

// ---------------------------------------------------------------------------
// Simple view — the cluster as one readable article, depth on demand
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
    <div className="space-y-8">
      <Section heading="Cluster statement">
        {cluster.clusterStatement.trim() ? (
          <Prose>{cluster.clusterStatement}</Prose>
        ) : (
          <MissingNote>No cluster statement recorded yet.</MissingNote>
        )}
      </Section>

      <Section heading="Status">
        <div className="mb-1.5">
          <ClusterValidityPill result={result} />
        </div>
        <Prose>{explainClusterStatus(cluster, result)}</Prose>
      </Section>

      <Section heading="Evidence summary">
        {cluster.evidenceSummary.trim() ? (
          <Prose>{cluster.evidenceSummary}</Prose>
        ) : (
          <MissingNote>
            No evidence summary recorded yet. Summarise what the linked signals
            show — and where they disagree.
          </MissingNote>
        )}
      </Section>

      <Section heading="What could contradict this">
        {linkedContradictions.length > 0 ? (
          <ul className="space-y-2.5">
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
      </Section>

      <Section heading="Next step">
        <Prose>{nextStepForCluster(cluster, result)}</Prose>
      </Section>

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
    <div className="space-y-8">
      <Section heading="Unifying question">
        {cluster.unifyingQuestion.trim() ? (
          <p className="text-[14px] italic leading-relaxed text-ink">
            {cluster.unifyingQuestion}
          </p>
        ) : (
          <MissingNote>
            No unifying question recorded. A cluster is organised around one
            question, not a topic — add it in Review.
          </MissingNote>
        )}
      </Section>

      <Section heading="Cluster statement">
        {cluster.clusterStatement.trim() ? (
          <Prose>{cluster.clusterStatement}</Prose>
        ) : (
          <MissingNote>No cluster statement recorded yet.</MissingNote>
        )}
      </Section>

      <Section heading="Evidence summary">
        {cluster.evidenceSummary.trim() ? (
          <Prose>{cluster.evidenceSummary}</Prose>
        ) : (
          <MissingNote>
            No evidence summary recorded yet. Summarise what the linked signals
            show — and where they disagree.
          </MissingNote>
        )}
      </Section>

      <section className="max-w-2xl">
        <h2 className="text-[13px] font-medium text-ink">Derived from linked signals</h2>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          Sectors, geographies, actor types and systems come from the evidence —
          they are never asserted.
        </p>
        <dl className="mt-3 space-y-3.5">
          <div>
            <dt className="mb-1 text-[11px] text-ink-faint">Sectors involved</dt>
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
            <dt className="mb-1 text-[11px] text-ink-faint">Geographies</dt>
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
            <dt className="mb-1 text-[11px] text-ink-faint">Actor types</dt>
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
            <dt className="mb-1 text-[11px] text-ink-faint">Systems affected</dt>
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
    <div className="max-w-2xl space-y-8">
      <ValidationChecklist
        result={result}
        title="Cluster validation thresholds"
        passedLabel="Valid cluster"
        failedLabel="Candidate — not yet valid"
      />
      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">
          Cluster scores — nine dimensions
        </h3>
        <ScoreGrid
          scores={clusterScoresRecord(cluster.scores)}
          labels={CLUSTER_SCORE_LABELS}
        />
        <p className="mt-3 text-[11.5px] text-ink-faint">
          Validation benchmarks: breadth ≥ {t.minBreadth}, depth ≥ {t.minDepth},
          coherence ≥ {t.minCoherence}, strategic relevance ≥{" "}
          {t.minStrategicRelevance}. Scores are analyst judgements against the
          1–5 rubric — they support validation, they do not replace the evidence
          thresholds.
        </p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Methodology tab — thresholds spelled out + audit trail
// ---------------------------------------------------------------------------

function AuditLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-52 shrink-0 text-[11.5px] text-ink-faint">{label}</dt>
      <dd className="text-[12.5px] text-ink-soft">{value}</dd>
    </div>
  );
}

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
    <div className="max-w-2xl space-y-8">
      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">
          Cluster validation thresholds
        </h3>
        <div className="overflow-x-auto">
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
        </div>
        <p className="mt-3 text-[11.5px] text-ink-faint">
          A cluster is valid only when every requirement passes, plus a clear
          unifying question. The score minimums support validation; they never
          override the evidence thresholds. This cluster currently passes{" "}
          {result.passedCount} of {result.totalCount} checks.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">Audit trail</h3>
        <dl className="space-y-2">
          <AuditLine
            label="Record id"
            value={<span className="font-mono text-[11.5px]">{cluster.id}</span>}
          />
          <AuditLine label="Created" value={fmtDate(cluster.createdAt)} />
          <AuditLine label="Last updated" value={fmtDate(cluster.updatedAt)} />
          <AuditLine
            label="Review status"
            value={REVIEW_STATUS_LABELS[cluster.reviewStatus]}
          />
          <AuditLine
            label="Stored status field"
            value={<span className="font-mono text-[11.5px]">{cluster.status}</span>}
          />
          <AuditLine
            label="Computed from evidence"
            value={
              <span className="font-mono text-[11.5px]">
                {result.valid ? "valid" : "candidate"} · {result.passedCount}/
                {result.totalCount} checks
              </span>
            }
          />
        </dl>
        <p className="mt-3 text-[11.5px] text-ink-faint">
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
    <div className="max-w-2xl space-y-5">
      <div>
        <h3 className="text-[13px] font-medium text-ink">Human review</h3>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          Review decisions are stored separately from computed validity and
          never override it.
        </p>
      </div>
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
      <div className="flex items-center gap-3">
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
      <p className="text-[11.5px] text-ink-faint">
        Created {fmtDate(cluster.createdAt)} · Last updated {fmtDate(cluster.updatedAt)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right rail — candidate guidance as a quiet aside, not a box
// ---------------------------------------------------------------------------

function CandidateGuidance({ result }: { result: ValidationResult }) {
  const failing = result.checks.filter((c) => !c.passed);
  return (
    <aside className="border-l-2 border-caution/40 pl-4">
      <h3 className="text-[13px] font-medium text-ink">
        What this cluster still needs
      </h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
        This cluster is still a candidate. Add more evidence before validating.
      </p>
      <ul className="mt-2.5 space-y-2">
        {failing.map((c) => (
          <li key={c.label}>
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
    </aside>
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
        <PageHeader title="Cluster" />
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
        <PageHeader title="Cluster not found" />
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
          <div className="space-y-6">
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
        title={cluster.name}
        description={cluster.unifyingQuestion.trim() || undefined}
        actions={
          <>
            <PipelineStageBadge stage="cluster" />
            {simple ? null : <ClusterValidityPill result={result} />}
          </>
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

        <aside className="mt-10 space-y-8 lg:mt-0">
          <RelatedObjectsPanel groups={relatedGroups} />
          <ViewGate min="analyst">
            {!result.valid ? <CandidateGuidance result={result} /> : null}
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
