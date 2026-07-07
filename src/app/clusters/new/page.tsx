"use client";

/**
 * Create a cluster candidate. Saving never asserts validity: every new
 * cluster is stored as a candidate with a draft review status, and validity
 * is computed live against the cluster thresholds on its detail page.
 * Selected signals are linked bidirectionally — the cluster records the
 * signal ids and each signal records the cluster id.
 *
 * Visibility layers: creation works in every view. The simple view leads
 * with the capture fields and folds the nine-dimension scoring behind a
 * disclosure — candidacy is validated against the thresholds automatically,
 * and a cluster saved without touching the scores is flagged as needing
 * human review so unscored work is never silently treated as judged.
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { useViewMode } from "@/components/ViewMode";
import {
  CheckboxList,
  Field,
  ScorePicker,
  Select,
  TextArea,
  TextInput,
} from "@/components/form";
import { nextId, useHydrated, useIntelligenceStore } from "@/lib/store";
import type { ClusterScores, ConfidenceLevel, Score } from "@/lib/types";
import {
  CLUSTER_SCORE_LABELS,
  CLUSTER_THRESHOLDS,
  CONFIDENCE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  SIGNAL_STRENGTH_LABELS,
} from "@/lib/types";
import {
  DEFAULT_CLUSTER_SCORES,
  GENERIC_SCORE_RUBRIC,
  btnPrimary,
  textLink,
  topicNameWarning,
} from "../cluster-ui";

const SCORE_KEYS = Object.keys(CLUSTER_SCORE_LABELS) as Array<keyof ClusterScores>;
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function NewClusterHeader() {
  return (
    <PageHeader
      title="Create cluster candidate"
      description="Group signals by shared underlying logic, never by topic. Saving creates a candidate — validity is computed against the thresholds (8 signals, 3 independent sources, 2 sectors, 2 actor types, 1 contradiction), never asserted at creation."
    />
  );
}

/** Quiet form section: small heading and optional meta, no box. */
function FormSection({
  heading,
  description,
  meta,
  children,
}: {
  heading: string;
  description?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-[13px] font-medium text-ink">{heading}</h2>
          {description ? (
            <p className="mt-0.5 text-[12px] text-ink-faint">{description}</p>
          ) : null}
        </div>
        {meta ? <div className="shrink-0">{meta}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function NewClusterPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const mode = useViewMode();
  const clusters = useIntelligenceStore((s) => s.clusters);
  const signals = useIntelligenceStore((s) => s.signals);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const addCluster = useIntelligenceStore((s) => s.addCluster);
  const updateSignal = useIntelligenceStore((s) => s.updateSignal);

  const [name, setName] = useState("");
  const [unifyingQuestion, setUnifyingQuestion] = useState("");
  const [clusterStatement, setClusterStatement] = useState("");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [signalIds, setSignalIds] = useState<string[]>([]);
  const [contradictionIds, setContradictionIds] = useState<string[]>([]);
  const [scores, setScores] = useState<ClusterScores>(DEFAULT_CLUSTER_SCORES);
  const [scoresTouched, setScoresTouched] = useState(false);
  const [confidence, setConfidence] = useState<ConfidenceLevel>("low");
  const [errors, setErrors] = useState<string[]>([]);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Signal Clusters", href: "/clusters" },
            { label: "New cluster candidate" },
          ]}
        />
        <NewClusterHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const nameWarning = topicNameWarning(name);
  const simple = mode === "simple";

  function setScore(k: keyof ClusterScores, v: Score) {
    setScores((prev) => ({ ...prev, [k]: v }));
    setScoresTouched(true);
  }

  function handleSave() {
    const errs: string[] = [];
    if (!name.trim())
      errs.push("Name is required — a sentence expressing the shared logic.");
    if (!unifyingQuestion.trim())
      errs.push("Unifying question is required — a cluster is organised around one question.");
    if (!clusterStatement.trim()) errs.push("Cluster statement is required.");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const clusterId = nextId("CLU", clusters);

    addCluster({
      id: clusterId,
      name: name.trim(),
      unifyingQuestion: unifyingQuestion.trim(),
      clusterStatement: clusterStatement.trim(),
      signalIds,
      contradictionIds,
      evidenceSummary: evidenceSummary.trim(),
      scores,
      possiblePatternIds: [],
      possibleDriverIds: [],
      confidence,
      // Validity is computed, never asserted at creation.
      status: "candidate",
      // A cluster saved with untouched default scores has not been judged on
      // the nine dimensions yet — flag it so unscored work reaches a human.
      reviewStatus: scoresTouched ? "draft" : "needs_human_review",
      humanNotes: "",
      createdAt: now,
      updatedAt: now,
    });

    // Bidirectional link: each selected signal records the cluster id.
    for (const sigId of signalIds) {
      const sig = signals.find((s) => s.id === sigId);
      if (sig && !sig.clusterIds.includes(clusterId)) {
        updateSignal(sigId, { clusterIds: [...sig.clusterIds, clusterId] });
      }
    }

    router.push(`/clusters/${clusterId}`);
  }

  const scoringFields = (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {SCORE_KEYS.map((k) => (
          <ScorePicker
            key={k}
            label={CLUSTER_SCORE_LABELS[k]}
            value={scores[k]}
            rubric={GENERIC_SCORE_RUBRIC}
            onChange={(v: Score) => setScore(k, v)}
          />
        ))}
      </div>
      <p className="text-[11.5px] text-ink-faint">
        Validation benchmarks: breadth ≥ {CLUSTER_THRESHOLDS.minBreadth}, depth
        ≥ {CLUSTER_THRESHOLDS.minDepth}, coherence ≥{" "}
        {CLUSTER_THRESHOLDS.minCoherence}, strategic relevance ≥{" "}
        {CLUSTER_THRESHOLDS.minStrategicRelevance}. Score honestly — high
        scores do not validate a cluster whose evidence thresholds fail.
      </p>
    </div>
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Signal Clusters", href: "/clusters" },
          { label: "New cluster candidate" },
        ]}
      />
      <NewClusterHeader />

      <div className="max-w-2xl space-y-10">
        {simple ? (
          <p className="text-[12.5px] leading-relaxed text-ink-faint">
            Capture the shared logic and its evidence — that is all a candidate
            needs. Candidacy is validated against the thresholds automatically,
            and the nine-dimension scoring can be completed later in Analyst
            view. A candidate saved without scoring is flagged for human review.
          </p>
        ) : null}

        <FormSection heading="Shared logic">
          <div className="space-y-4">
            <Field
              label="Name"
              required
              hint="A sentence expressing the shared underlying logic — e.g. “Destinations are becoming lifestyle ecosystems rather than visit-based attractions.”"
            >
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What underlying movement do these signals share?"
              />
            </Field>
            {nameWarning ? (
              <p className="border-l-2 border-caution/60 pl-3 text-[12px] text-caution">
                {nameWarning}
              </p>
            ) : null}
            <Field
              label="Unifying question"
              required
              hint="The one question the cluster is organised around."
            >
              <TextInput
                value={unifyingQuestion}
                onChange={(e) => setUnifyingQuestion(e.target.value)}
                placeholder="e.g. What happens when residency stops being temporary?"
              />
            </Field>
            <Field
              label="Cluster statement"
              required
              hint="The claim the evidence currently supports, stated plainly."
            >
              <TextArea
                rows={3}
                value={clusterStatement}
                onChange={(e) => setClusterStatement(e.target.value)}
              />
            </Field>
            <Field
              label="Evidence summary"
              hint="What the linked signals show together — and where they disagree."
            >
              <TextArea
                rows={3}
                value={evidenceSummary}
                onChange={(e) => setEvidenceSummary(e.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          heading="Linked signals"
          description="Selected signals are linked bidirectionally — each records this cluster on its own page."
          meta={
            <span
              className={`font-mono text-[11.5px] ${
                signalIds.length >= CLUSTER_THRESHOLDS.minSignals
                  ? "text-accent-ink"
                  : "text-ink-faint"
              }`}
            >
              {signalIds.length}/{CLUSTER_THRESHOLDS.minSignals} minimum
            </span>
          }
        >
          {signals.length > 0 ? (
            <>
              <CheckboxList<string>
                columns={1}
                options={signals.map((s) => ({
                  value: s.id,
                  label: `${s.id} · ${s.title} — ${SIGNAL_STRENGTH_LABELS[s.signalStrength]}`,
                }))}
                selected={signalIds}
                onChange={setSignalIds}
              />
              <p className="mt-3 text-[11.5px] text-ink-faint">
                Validation needs at least {CLUSTER_THRESHOLDS.minSignals} signals
                across {CLUSTER_THRESHOLDS.minSectors} sectors and{" "}
                {CLUSTER_THRESHOLDS.minActorTypes} actor types, from{" "}
                {CLUSTER_THRESHOLDS.minIndependentSources} independent sources.
              </p>
            </>
          ) : (
            <p className="text-[12px] text-ink-faint">
              No signals exist yet. A cluster only exists through its evidence —
              promote observations into signals first, then return here.{" "}
              <Link href="/signals" className="text-accent-ink underline">
                Open the Signal Library
              </Link>
              .
            </p>
          )}
        </FormSection>

        <FormSection
          heading="Linked contradictions"
          description="A cluster without tension is usually under-scanned — validation requires at least one."
          meta={
            <span
              className={`font-mono text-[11.5px] ${
                contradictionIds.length >= CLUSTER_THRESHOLDS.minContradictions
                  ? "text-accent-ink"
                  : "text-ink-faint"
              }`}
            >
              {contradictionIds.length}/{CLUSTER_THRESHOLDS.minContradictions} minimum
            </span>
          }
        >
          {contradictions.length > 0 ? (
            <CheckboxList<string>
              columns={1}
              options={contradictions.map((c) => ({
                value: c.id,
                label: `${c.id} · ${c.name} — ${CONTRADICTION_TYPE_LABELS[c.contradictionType]}`,
              }))}
              selected={contradictionIds}
              onChange={setContradictionIds}
            />
          ) : (
            <p className="text-[12px] text-ink-faint">
              No contradictions recorded yet. A cluster cannot validate without at
              least one identified tension —{" "}
              <Link href="/contradictions" className="text-accent-ink underline">
                record contradictions
              </Link>{" "}
              as you find opposing evidence.
            </p>
          )}
        </FormSection>

        {simple ? (
          <details>
            <summary className="cursor-pointer list-none">
              <span className="text-[13px] font-medium text-ink-soft hover:text-ink">
                Scoring (optional now — analyst work)
              </span>
              <span className="mt-0.5 block text-[12px] text-ink-faint">
                Nine 1–5 judgements that support validation. Leave them for
                Analyst view if you prefer — the candidate saves either way.
              </span>
            </summary>
            <div className="mt-4">{scoringFields}</div>
          </details>
        ) : (
          <FormSection heading="Cluster scores — nine dimensions">
            {scoringFields}
          </FormSection>
        )}

        <FormSection heading="Confidence">
          <Field
            label="Confidence"
            hint="How much weight this grouping should carry. New candidates usually start low."
          >
            <Select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
            >
              {CONFIDENCE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CONFIDENCE_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
        </FormSection>

        {errors.length > 0 ? (
          <div className="border-l-2 border-tension/60 pl-3">
            <p className="text-[12px] font-medium text-tension">Cannot save yet</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12.5px] text-ink-soft">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center gap-4 pb-4">
          <button type="button" onClick={handleSave} className={btnPrimary}>
            Save cluster candidate
          </button>
          <Link href="/clusters" className={textLink}>
            Cancel
          </Link>
          <p className="text-[11.5px] text-ink-faint">
            Saved as a candidate — validity is computed on the detail page.
            {scoresTouched
              ? ""
              : " Unscored candidates are flagged as needing human review."}
          </p>
        </div>
      </div>
    </>
  );
}
