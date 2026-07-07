"use client";

/**
 * Create a cluster candidate. Saving never asserts validity: every new
 * cluster is stored as a candidate with a draft review status, and validity
 * is computed live against the cluster thresholds on its detail page.
 * Selected signals are linked bidirectionally — the cluster records the
 * signal ids and each signal records the cluster id.
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
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
  btnSecondary,
  topicNameWarning,
} from "../cluster-ui";

const SCORE_KEYS = Object.keys(CLUSTER_SCORE_LABELS) as Array<keyof ClusterScores>;
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];

function NewClusterHeader() {
  return (
    <PageHeader
      overline="Connect & Synthesize"
      title="Create cluster candidate"
      description="Group signals by shared underlying logic, never by topic. Saving creates a candidate — validity is computed against the thresholds (8 signals, 3 independent sources, 2 sectors, 2 actor types, 1 contradiction), never asserted at creation."
    />
  );
}

export default function NewClusterPage() {
  const router = useRouter();
  const hydrated = useHydrated();
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
      reviewStatus: "draft",
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

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Signal Clusters", href: "/clusters" },
          { label: "New cluster candidate" },
        ]}
      />
      <NewClusterHeader />

      <div className="max-w-3xl space-y-5">
        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Shared logic</h2>
          </header>
          <div className="space-y-4 px-4 py-4">
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
              <p className="border-l-2 border-caution bg-caution-soft px-2.5 py-1.5 text-[12px] text-caution rounded-[2px]">
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
        </section>

        <section className="card">
          <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Linked signals</h2>
            <span
              className={`font-mono text-[11.5px] ${
                signalIds.length >= CLUSTER_THRESHOLDS.minSignals
                  ? "text-accent-ink"
                  : "text-ink-faint"
              }`}
            >
              {signalIds.length}/{CLUSTER_THRESHOLDS.minSignals} minimum
            </span>
          </header>
          <div className="px-4 py-4">
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
                <p className="mt-3 border-t border-line pt-3 text-[11.5px] text-ink-faint">
                  Selected signals are linked bidirectionally — each records this
                  cluster on its own page. Validation needs at least{" "}
                  {CLUSTER_THRESHOLDS.minSignals} signals across{" "}
                  {CLUSTER_THRESHOLDS.minSectors} sectors and{" "}
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
          </div>
        </section>

        <section className="card">
          <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Linked contradictions</h2>
            <span
              className={`font-mono text-[11.5px] ${
                contradictionIds.length >= CLUSTER_THRESHOLDS.minContradictions
                  ? "text-accent-ink"
                  : "text-ink-faint"
              }`}
            >
              {contradictionIds.length}/{CLUSTER_THRESHOLDS.minContradictions} minimum
            </span>
          </header>
          <div className="px-4 py-4">
            {contradictions.length > 0 ? (
              <>
                <CheckboxList<string>
                  columns={1}
                  options={contradictions.map((c) => ({
                    value: c.id,
                    label: `${c.id} · ${c.name} — ${CONTRADICTION_TYPE_LABELS[c.contradictionType]}`,
                  }))}
                  selected={contradictionIds}
                  onChange={setContradictionIds}
                />
                <p className="mt-3 border-t border-line pt-3 text-[11.5px] text-ink-faint">
                  A cluster without tension is usually under-scanned. Validation
                  requires at least one linked contradiction.
                </p>
              </>
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
          </div>
        </section>

        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Cluster scores — nine dimensions</h2>
          </header>
          <div className="space-y-4 px-4 py-4">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SCORE_KEYS.map((k) => (
                <ScorePicker
                  key={k}
                  label={CLUSTER_SCORE_LABELS[k]}
                  value={scores[k]}
                  rubric={GENERIC_SCORE_RUBRIC}
                  onChange={(v: Score) => setScores((prev) => ({ ...prev, [k]: v }))}
                />
              ))}
            </div>
            <p className="border-t border-line pt-3 text-[11.5px] text-ink-faint">
              Validation benchmarks: breadth ≥ {CLUSTER_THRESHOLDS.minBreadth}, depth
              ≥ {CLUSTER_THRESHOLDS.minDepth}, coherence ≥{" "}
              {CLUSTER_THRESHOLDS.minCoherence}, strategic relevance ≥{" "}
              {CLUSTER_THRESHOLDS.minStrategicRelevance}. Score honestly — high
              scores do not validate a cluster whose evidence thresholds fail.
            </p>
          </div>
        </section>

        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Confidence</h2>
          </header>
          <div className="px-4 py-4">
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
          </div>
        </section>

        {errors.length > 0 ? (
          <div className="card border-l-2 border-l-tension px-4 py-3">
            <p className="overline-label mb-1 text-tension">Cannot save yet</p>
            <ul className="list-disc space-y-0.5 pl-4 text-[12.5px] text-ink-soft">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center gap-2 pb-4">
          <button type="button" onClick={handleSave} className={btnPrimary}>
            Save cluster candidate
          </button>
          <Link href="/clusters" className={btnSecondary}>
            Cancel
          </Link>
          <p className="ml-2 text-[11.5px] text-ink-faint">
            Saved as a candidate — validity is computed on the detail page.
          </p>
        </div>
      </div>
    </>
  );
}
