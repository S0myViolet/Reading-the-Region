"use client";

/**
 * Cluster detail — one cluster candidate or valid cluster, with its linked
 * signals, live validation against the cluster thresholds, contradictions,
 * and review controls. Validity is always computed from the evidence; the
 * stored status is never presented on its own.
 *
 * Visibility layers: the simple view reads as one article — statement,
 * status in plain language with its evidence backing line, evidence
 * summary, what could contradict it, next step — separated by whitespace,
 * not boxes. Analyst view opens the full tabs: an Overview that moves from
 * at-a-glance facts to plain meaning, what connects the signals, what the
 * cluster may suggest, what could weaken it, and the next step; scannable
 * signal rows with a per-signal reason for inclusion; a validation tab
 * with each threshold's current value and purpose; structured tension
 * blocks; and review controls. The right rail holds a short relationship
 * trail (top signals, top sources, patterns, drivers). Methodology view
 * adds the threshold table and audit trail as plain definition lines.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { NoContradictionNote } from "@/components/ContradictionPanel";
import { RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { ScoreGrid } from "@/components/ScorePanel";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { type TrailStep } from "@/components/EvidenceTrail";
import { EvidenceBackingLine } from "@/components/EvidenceCompression";
import {
  AtAGlance,
  ConnectBlock,
  IncompleteNote,
  RelationshipTrail,
  TensionBlock,
  ValidationCheckRows,
  type TrailGroup,
} from "@/components/connect";
import { STAGE_LABELS, signalStage } from "@/lib/pipeline";
import { PlainTags, SectorTags, SystemTags } from "@/components/tags";
import { Field, Select, TextArea } from "@/components/form";
import { Age } from "@/components/freshness";
import { clusterEvidenceWindow, signalEvidenceAt } from "@/lib/freshness";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateCluster, type ValidationResult } from "@/lib/validation";
import {
  clusterPlainMeaning,
  explainClusterStatus,
  explainContradiction,
  nextStepForCluster,
} from "@/lib/explain";
import type {
  Cluster,
  ConfidenceLevel,
  Contradiction,
  Pattern,
  ReviewStatus,
  Signal,
  Source,
} from "@/lib/types";
import {
  ACTOR_TYPE_LABELS,
  CLUSTER_SCORE_LABELS,
  CLUSTER_THRESHOLDS,
  CONFIDENCE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  SIGNAL_STRENGTH_LABELS,
} from "@/lib/types";
import {
  ClusterValidityPill,
  btnPrimary,
  buildClusterCheckRows,
  clusterScoresRecord,
  clusterStatusLine,
  clusterWeaknesses,
  deriveClusterFacts,
  dominantCountry,
  firstSentence,
  fmtDate,
  signalsOfCluster,
  whyIncluded,
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

/**
 * Follow-on lines for a tension block, taken only from fields the
 * contradiction actually records; an empty field contributes no row.
 */
function tensionRows(c: Contradiction): Array<{ label: string; text: string }> {
  const rows: Array<{ label: string; text: string }> = [];
  const why = c.strategicImplication.trim() || firstSentence(c.underlyingTension);
  if (why) rows.push({ label: "Why this matters", text: why });
  const watch =
    c.scenarioRelevance.trim() ||
    (c.possibleEscalation.trim()
      ? `If it escalates: ${firstSentence(c.possibleEscalation)}`
      : "");
  if (watch) rows.push({ label: "What to watch", text: watch });
  return rows;
}

// ---------------------------------------------------------------------------
// Simple view — the cluster as one readable article, depth on demand
// ---------------------------------------------------------------------------

function SimpleView({
  cluster,
  result,
  linkedContradictions,
  clusterSignals,
  sources,
}: {
  cluster: Cluster;
  result: ValidationResult;
  linkedContradictions: Contradiction[];
  clusterSignals: Signal[];
  sources: Source[];
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
        <div className="mt-2">
          <EvidenceBackingLine signals={clusterSignals} sources={sources} />
        </div>
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

function shortList(items: string[], max = 3): string {
  if (items.length <= max) return items.join(", ");
  return `${items.slice(0, max).join(", ")} +${items.length - max} more`;
}

const quietLink =
  "underline decoration-line-strong underline-offset-2 hover:text-ink";

function OverviewTab({
  cluster,
  result,
  clusterSignals,
  sources,
  linkedContradictions,
  linkedPatterns,
}: {
  cluster: Cluster;
  result: ValidationResult;
  clusterSignals: Signal[];
  sources: Source[];
  linkedContradictions: Contradiction[];
  linkedPatterns: Pattern[];
}) {
  const facts = deriveClusterFacts(clusterSignals);
  const linkedSourceIds = new Set(clusterSignals.flatMap((s) => s.sourceIds));
  const sourceCount = sources.filter((src) => linkedSourceIds.has(src.id)).length;
  const status = clusterStatusLine(cluster, result, clusterSignals.length);
  // Live evidence window from the member signals — never a stored figure.
  const evidenceWindow = clusterEvidenceWindow(cluster, clusterSignals);
  const weaknesses = clusterWeaknesses(cluster, result, clusterSignals);
  const dominant = dominantCountry(clusterSignals);

  // A more specific next step than the generic helper when the data
  // supports one: a geographically lopsided candidate needs outside
  // evidence more than anything else.
  const nextStep =
    !result.valid && dominant
      ? `Look for the same behaviour outside ${dominant}. Evidence from a second market would broaden the base and test whether this is a regional logic or a ${dominant} story.`
      : nextStepForCluster(cluster, result);

  return (
    <div className="space-y-8">
      <section className="max-w-2xl">
        <h3 className="mb-3 text-[13px] font-medium text-ink">
          Cluster at a glance
        </h3>
        <AtAGlance
          items={[
            {
              label: "Status",
              value: status.valid ? (
                <span className="font-medium text-accent-ink">{status.text}</span>
              ) : (
                status.text
              ),
            },
            { label: "Signals", value: clusterSignals.length },
            { label: "Sources", value: sourceCount },
            { label: "Sectors", value: facts.sectors.length },
            {
              label: "Latest evidence",
              value: evidenceWindow.latest ? (
                <Age iso={evidenceWindow.latest} />
              ) : (
                "No dated evidence yet"
              ),
            },
            {
              label: "Oldest evidence",
              value: evidenceWindow.oldest ? (
                <Age iso={evidenceWindow.oldest} />
              ) : (
                "No dated evidence yet"
              ),
            },
            {
              label: "Geographies",
              value:
                facts.countries.length > 0
                  ? shortList(facts.countries)
                  : "None yet",
            },
            { label: "Confidence", value: CONFIDENCE_LABELS[cluster.confidence] },
            {
              label: "Main tension",
              value: linkedContradictions[0]?.name ?? "None linked yet",
            },
          ]}
        />
      </section>

      <ConnectBlock heading="Plain meaning">
        <p>{clusterPlainMeaning(cluster)}</p>
      </ConnectBlock>

      <ConnectBlock heading="What connects the signals">
        {cluster.clusterStatement.trim() ? (
          <p>{cluster.clusterStatement}</p>
        ) : (
          <MissingNote>No cluster statement recorded yet.</MissingNote>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Evidence summary">
        {cluster.evidenceSummary.trim() ? (
          <p>{cluster.evidenceSummary}</p>
        ) : (
          <MissingNote>
            No evidence summary recorded yet. Summarise what the linked signals
            show — and where they disagree.
          </MissingNote>
        )}
      </ConnectBlock>

      <ConnectBlock heading="What this cluster may suggest">
        {linkedPatterns.length > 0 ? (
          <p>
            May feed the pattern{linkedPatterns.length === 1 ? "" : "s"}{" "}
            {linkedPatterns.map((p, i) => (
              <span key={p.id}>
                {i > 0 ? (i === linkedPatterns.length - 1 ? " and " : ", ") : ""}
                &ldquo;
                <Link href={`/patterns/${p.id}`} className={quietLink}>
                  {p.name}
                </Link>
                &rdquo;
              </span>
            ))}
            . A pattern forms when the same movement repeats across clusters,
            sectors and months — open the pattern to see how far this one has
            got.
          </p>
        ) : (
          <p>
            No pattern link yet. If this cluster&rsquo;s logic starts repeating
            in other clusters — across more sectors and over several months —
            it would feed a pattern. Nothing supports that step today.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="What could weaken it">
        {weaknesses.length > 0 ? (
          <ul className="space-y-1.5">
            {weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : (
          <p>
            Nothing in the checks or the recorded notes flags a weakness. The
            remaining risk is time — a cluster weakens when its evidence stops
            repeating, so recheck after the next scan.
          </p>
        )}
      </ConnectBlock>

      <ConnectBlock heading="Next step">
        <p>{nextStep}</p>
      </ConnectBlock>

      <section className="max-w-2xl">
        <h3 className="text-[13px] font-medium text-ink">What the evidence covers</h3>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          Sectors, geographies, actor types and systems are read from the
          linked signals — never asserted.
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
// Signals tab (analyst) — stacked rows: title and stage, quiet figures,
// then why the signal belongs in this group
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
      <ul className="divide-y divide-line">
        {clusterSignals.map((s) => (
          <li key={s.id} className="py-3.5 first:pt-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <Link
                href={`/signals/${s.id}`}
                className="text-[13px] font-medium leading-snug text-ink hover:text-accent-ink"
              >
                {s.title}
              </Link>
              <span className="text-[11px] text-ink-faint">
                Stage: {STAGE_LABELS[signalStage(s)]}
              </span>
              <span className="text-[11px] text-ink-faint">
                {SIGNAL_STRENGTH_LABELS[s.signalStrength]}
              </span>
              <span className="text-[11px] text-ink-faint">
                <Age iso={signalEvidenceAt(s)} prefix="evidence" />
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-ink-faint">
              {CONFIDENCE_LABELS[s.confidence]} · evidence {s.scores.evidence}/5
              · strategic relevance {s.scores.strategicRelevance}/5 · momentum{" "}
              {s.scores.momentum}/5 · {s.country}
            </p>
            <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-ink-soft">
              <span className="text-ink-faint">Why included — </span>
              {whyIncluded(s, clusterSignals)}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-[11.5px] text-ink-faint">
        Figures are the analyst judgements recorded on each signal — open a
        signal for its full scoring panel and rubric anchors.
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
  clusterSignals,
  sources,
}: {
  cluster: Cluster;
  result: ValidationResult;
  clusterSignals: Signal[];
  sources: Source[];
}) {
  const rows = buildClusterCheckRows(cluster, clusterSignals, sources);
  const failing = rows.filter((r) => !r.passed);

  // Evidence recency, computed live from the member signals' own dates.
  const evidenceWindow = clusterEvidenceWindow(cluster, clusterSignals);
  const now = Date.now();
  const recentCount = clusterSignals.filter(
    (s) => now - Date.parse(signalEvidenceAt(s)) <= 30 * 24 * 60 * 60 * 1000,
  ).length;

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <p className="text-[13px] text-ink">
          Validation status:{" "}
          {result.valid ? (
            <span className="font-medium text-accent-ink">Valid cluster</span>
          ) : (
            "Cluster candidate"
          )}{" "}
          · passes {result.passedCount} of {result.totalCount} checks
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          <span className="text-ink-faint">Evidence recency — </span>
          {evidenceWindow.latest ? (
            recentCount > 0 ? (
              <>
                newest member signal <Age iso={evidenceWindow.latest} />;{" "}
                {recentCount} of {clusterSignals.length} member signal
                {clusterSignals.length === 1 ? "" : "s"}{" "}
                {recentCount === 1 ? "is" : "are"} from the last 30 days.
              </>
            ) : (
              <>
                All member evidence is older than 30 days (newest{" "}
                <Age iso={evidenceWindow.latest} />) —{" "}
                {result.valid
                  ? "the cluster is valid but currently historical."
                  : "the evidence is currently historical, not live."}
              </>
            )
          ) : (
            <>no member signal carries a dated observation yet.</>
          )}
        </p>
        <p className="mt-1 text-[12px] text-ink-faint">
          Every value below is computed live from the linked records — the
          stored status is never trusted on its own.
        </p>
        <div className="mt-4">
          <ValidationCheckRows checks={rows} />
        </div>
        {failing.length > 0 ? (
          <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">What is missing — </span>
            {failing
              .map(
                (f) =>
                  `${f.requirement.charAt(0).toLowerCase()}${f.requirement.slice(1)} (current ${f.current}, needs ${f.threshold})`,
              )
              .join("; ")}
            .
          </p>
        ) : null}
      </section>
      <section>
        <h3 className="mb-3 text-[13px] font-medium text-ink">
          Cluster scores — nine dimensions
        </h3>
        <ScoreGrid
          scores={clusterScoresRecord(cluster.scores)}
          labels={CLUSTER_SCORE_LABELS}
        />
        <p className="mt-3 text-[11.5px] text-ink-faint">
          Analyst judgements on the 1–5 rubric. Four of them — breadth, depth,
          coherence and strategic relevance — have minimums in the checklist
          above; the rest inform review without gating validity.
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
          A cluster is valid when enough independent signals point to the same
          underlying logic. The thresholds stop one story, one outlet, or one
          sector from becoming a false pattern. This cluster currently passes{" "}
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
          This judgment is separate from the computed validation in the
          Validation tab — the checklist measures evidence; this records
          interpretation. Neither overrides the other.
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
          hint="How much trust to place in this reading of the evidence."
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
        hint="Interpretation, doubts, and the next evidence to look for."
      >
        <TextArea
          rows={5}
          value={notes}
          placeholder="Add the analyst judgment here: what feels solid, what is still uncertain, and what evidence should be checked next."
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

  // Relationship trail, assembled only from links that resolve in the
  // store. Top three per group by default; the toggle reveals the rest.
  // No step is ever invented; a thin trail stays visibly thin.
  const signalSteps: TrailStep[] = [...clusterSignals]
    .sort(
      (a, b) =>
        b.scores.strategicRelevance - a.scores.strategicRelevance ||
        b.scores.evidence - a.scores.evidence,
    )
    .map((s) => ({
      stage: signalStage(s),
      title: s.title,
      href: `/signals/${s.id}`,
    }));
  const linkedSourceIds = new Set(clusterSignals.flatMap((s) => s.sourceIds));
  const sourceSteps: TrailStep[] = sources
    .filter((src) => linkedSourceIds.has(src.id))
    .sort((a, b) => b.credibility - a.credibility)
    .map((src) => ({
      stage: "source" as const,
      title: src.name,
      href: `/sources/${src.id}`,
    }));
  const trailGroups: TrailGroup[] = [
    { label: "Top signals", steps: signalSteps, previewCount: 3 },
    { label: "Top sources", steps: sourceSteps, previewCount: 3 },
    {
      label: "Patterns this may feed",
      steps: linkedPatterns.map((p) => ({
        stage: "pattern" as const,
        title: p.name,
        href: `/patterns/${p.id}`,
      })),
      previewCount: 3,
    },
    {
      label: "Drivers",
      steps: linkedDrivers.map((d) => ({
        stage: "driver" as const,
        title: d.name,
        href: `/drivers/${d.id}`,
      })),
      previewCount: 3,
    },
  ];
  const trailHasSteps = trailGroups.some((g) => g.steps.length > 0);

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
      content: (
        <OverviewTab
          cluster={cluster}
          result={result}
          clusterSignals={clusterSignals}
          sources={sources}
          linkedContradictions={linkedContradictions}
          linkedPatterns={linkedPatterns}
        />
      ),
    },
    {
      id: "signals",
      label: `Signals (${clusterSignals.length})`,
      content: <SignalsTab clusterSignals={clusterSignals} />,
    },
    {
      id: "validation",
      label: "Validation",
      content: (
        <ValidationTab
          cluster={cluster}
          result={result}
          clusterSignals={clusterSignals}
          sources={sources}
        />
      ),
    },
    {
      id: "contradictions",
      label: `Contradictions (${linkedContradictions.length})`,
      content:
        linkedContradictions.length > 0 ? (
          <div className="max-w-2xl space-y-8">
            {linkedContradictions.map((c) => (
              <TensionBlock
                key={c.id}
                name={c.name}
                href={`/contradictions/${c.id}`}
                typeLabel={CONTRADICTION_TYPE_LABELS[c.contradictionType]}
                sideA={{
                  claim: c.sideA,
                  support: c.evidenceSideA.trim() || undefined,
                }}
                sideB={{
                  claim: c.sideB,
                  support: c.evidenceSideB.trim() || undefined,
                }}
                rows={tensionRows(c)}
              />
            ))}
          </div>
        ) : (
          <IncompleteNote
            missing="No contradiction linked yet."
            whyItMatters="A cluster nobody has argued against has not been tested — the reading may be one-sided."
            nextStep="Look for evidence that cuts against this group before using it in a pattern."
          />
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
              clusterSignals={clusterSignals}
              sources={sources}
            />
          ) : (
            <Tabs tabs={tabs} />
          )}
        </div>

        <aside className="mt-10 space-y-8 lg:mt-0">
          {simple ? (
            <RelatedObjectsPanel groups={relatedGroups} />
          ) : (
            <section>
              <h3 className="mb-3 text-[13px] font-medium text-ink">
                Relationship trail
              </h3>
              {trailHasSteps ? (
                <RelationshipTrail groups={trailGroups} />
              ) : (
                <p className="text-[11.5px] text-ink-faint">
                  No linked records yet. Connect signals from the Signal
                  Library to build this trail.
                </p>
              )}
            </section>
          )}
          <ViewGate min="analyst">
            {!result.valid ? <CandidateGuidance result={result} /> : null}
          </ViewGate>
        </aside>
      </div>
    </>
  );
}
