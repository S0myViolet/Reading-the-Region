"use client";

/**
 * Record a contradiction — a tension between two valid but opposing forces.
 * Both sides are captured as statements with their own evidence and their own
 * supporting signals; the record is saved as a draft and each selected signal
 * is linked back to the contradiction bidirectionally.
 *
 * Visibility layers: the simple view shows the essential capture fields; the
 * five-dimension scoring completes in Analyst view. A record saved from the
 * simple view is flagged as needing human review until it is scored.
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
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { nextId, useHydrated, useIntelligenceStore } from "@/lib/store";
import type {
  ContradictionScores,
  ContradictionType,
  Score,
  Signal,
} from "@/lib/types";
import {
  CONTRADICTION_SCORE_LABELS,
  CONTRADICTION_TYPE_LABELS,
  SIGNAL_STRENGTH_LABELS,
} from "@/lib/types";
import {
  DEFAULT_CONTRADICTION_SCORES,
  GENERIC_SCORE_RUBRIC,
  btnPrimary,
  btnSecondary,
} from "../contradiction-ui";

const SCORE_KEYS = Object.keys(CONTRADICTION_SCORE_LABELS) as Array<
  keyof ContradictionScores
>;
const TYPE_OPTIONS = Object.keys(CONTRADICTION_TYPE_LABELS) as ContradictionType[];

function NewContradictionHeader() {
  return (
    <PageHeader
      overline="Connect & Synthesize"
      title="Record contradiction"
      description="Capture a tension between two valid but opposing forces. Both sides must be stated fairly and evidence-linked — a contradiction is a site of strategic intelligence, not an error to resolve away."
    />
  );
}

function signalOptions(signals: Signal[]) {
  return signals.map((s) => ({
    value: s.id,
    label: `${s.id} · ${s.title} — ${SIGNAL_STRENGTH_LABELS[s.signalStrength]}`,
  }));
}

function SideSection({
  side,
  statement,
  onStatement,
  evidence,
  onEvidence,
  signalIds,
  onSignalIds,
  signals,
}: {
  side: "A" | "B";
  statement: string;
  onStatement: (v: string) => void;
  evidence: string;
  onEvidence: (v: string) => void;
  signalIds: string[];
  onSignalIds: (v: string[]) => void;
  signals: Signal[];
}) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h2 className="overline-label">Side {side}</h2>
      </header>
      <div className="space-y-4 px-4 py-4">
        <Field
          label={`Side ${side} statement`}
          required
          hint="One valid force, stated plainly — not a strawman of the other side."
        >
          <TextInput
            value={statement}
            onChange={(e) => onStatement(e.target.value)}
            placeholder={`What is pulling in direction ${side}?`}
          />
        </Field>
        <Field
          label={`Evidence for Side ${side}`}
          hint="What the evidence for this side currently shows, in a sentence or two."
        >
          <TextArea
            rows={3}
            value={evidence}
            onChange={(e) => onEvidence(e.target.value)}
          />
        </Field>
        <Field
          label={`Supporting signals — Side ${side}`}
          hint="Signals whose evidence supports this side of the tension."
        >
          {signals.length > 0 ? (
            <CheckboxList<string>
              columns={1}
              options={signalOptions(signals)}
              selected={signalIds}
              onChange={onSignalIds}
            />
          ) : (
            <p className="text-[12px] text-ink-faint">
              No signals exist yet. A contradiction stays defensible only while
              both sides are evidence-linked —{" "}
              <Link href="/signals" className="text-accent-ink underline">
                build the Signal Library
              </Link>{" "}
              first, then return here.
            </p>
          )}
        </Field>
      </div>
    </section>
  );
}

export default function NewContradictionPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const mode = useViewMode();
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const signals = useIntelligenceStore((s) => s.signals);
  const addContradiction = useIntelligenceStore((s) => s.addContradiction);
  const updateSignal = useIntelligenceStore((s) => s.updateSignal);

  const [name, setName] = useState("");
  const [contradictionType, setContradictionType] =
    useState<ContradictionType>("adoption_vs_resistance");
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [evidenceSideA, setEvidenceSideA] = useState("");
  const [evidenceSideB, setEvidenceSideB] = useState("");
  const [sideASignalIds, setSideASignalIds] = useState<string[]>([]);
  const [sideBSignalIds, setSideBSignalIds] = useState<string[]>([]);
  const [underlyingTension, setUnderlyingTension] = useState("");
  const [whoBenefits, setWhoBenefits] = useState("");
  const [whoLoses, setWhoLoses] = useState("");
  const [possibleResolution, setPossibleResolution] = useState("");
  const [possibleEscalation, setPossibleEscalation] = useState("");
  const [strategicImplication, setStrategicImplication] = useState("");
  const [scenarioRelevance, setScenarioRelevance] = useState("");
  const [scores, setScores] = useState<ContradictionScores>(
    DEFAULT_CONTRADICTION_SCORES,
  );
  const [errors, setErrors] = useState<string[]>([]);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: "Contradictions", href: "/contradictions" },
            { label: "New contradiction" },
          ]}
        />
        <NewContradictionHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  function handleSave() {
    const errs: string[] = [];
    if (!name.trim())
      errs.push("Name is required — name the tension, e.g. “Speed of AI adoption vs slow institutional trust.”");
    if (!sideA.trim()) errs.push("Side A statement is required.");
    if (!sideB.trim()) errs.push("Side B statement is required.");
    if (!underlyingTension.trim())
      errs.push("Underlying tension is required — what deeper question the two forces disagree about.");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const contradictionId = nextId("CON", contradictions);

    addContradiction({
      id: contradictionId,
      name: name.trim(),
      contradictionType,
      sideA: sideA.trim(),
      sideB: sideB.trim(),
      evidenceSideA: evidenceSideA.trim(),
      evidenceSideB: evidenceSideB.trim(),
      sideASignalIds,
      sideBSignalIds,
      underlyingTension: underlyingTension.trim(),
      whoBenefits: whoBenefits.trim(),
      whoLoses: whoLoses.trim(),
      possibleResolution: possibleResolution.trim(),
      possibleEscalation: possibleEscalation.trim(),
      strategicImplication: strategicImplication.trim(),
      scenarioRelevance: scenarioRelevance.trim(),
      scores,
      reviewStatus: "draft",
      createdAt: now,
      updatedAt: now,
    });

    // Bidirectional link: every selected signal (either side) records the
    // contradiction id once.
    const linkedIds = [...new Set([...sideASignalIds, ...sideBSignalIds])];
    for (const sigId of linkedIds) {
      const sig = signals.find((s) => s.id === sigId);
      if (sig && !sig.contradictionIds.includes(contradictionId)) {
        updateSignal(sigId, {
          contradictionIds: [...sig.contradictionIds, contradictionId],
        });
      }
    }

    router.push(`/contradictions/${contradictionId}`);
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Contradictions", href: "/contradictions" },
          { label: "New contradiction" },
        ]}
      />
      <NewContradictionHeader />

      <div className="max-w-3xl space-y-5">
        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">The tension</h2>
          </header>
          <div className="space-y-4 px-4 py-4">
            <Field
              label="Name"
              required
              hint="Name the tension itself — e.g. “Hyper-modern skylines vs heritage revival investment.”"
            >
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What two forces are pulling against each other?"
              />
            </Field>
            <Field
              label="Contradiction type"
              hint="The recurring tension family this belongs to."
            >
              <Select
                value={contradictionType}
                onChange={(e) =>
                  setContradictionType(e.target.value as ContradictionType)
                }
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {CONTRADICTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Underlying tension"
              required
              hint="The deeper question both forces are answering differently."
            >
              <TextArea
                rows={2}
                value={underlyingTension}
                onChange={(e) => setUnderlyingTension(e.target.value)}
                placeholder="e.g. Can efficiency and cultural trust grow at the same speed?"
              />
            </Field>
          </div>
        </section>

        <SideSection
          side="A"
          statement={sideA}
          onStatement={setSideA}
          evidence={evidenceSideA}
          onEvidence={setEvidenceSideA}
          signalIds={sideASignalIds}
          onSignalIds={setSideASignalIds}
          signals={signals}
        />
        <SideSection
          side="B"
          statement={sideB}
          onStatement={setSideB}
          evidence={evidenceSideB}
          onEvidence={setEvidenceSideB}
          signalIds={sideBSignalIds}
          onSignalIds={setSideBSignalIds}
          signals={signals}
        />

        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Stakes</h2>
          </header>
          <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
            <Field label="Who benefits" hint="Who gains if this tension persists.">
              <TextArea
                rows={3}
                value={whoBenefits}
                onChange={(e) => setWhoBenefits(e.target.value)}
              />
            </Field>
            <Field label="Who loses" hint="Who is exposed if this tension persists.">
              <TextArea
                rows={3}
                value={whoLoses}
                onChange={(e) => setWhoLoses(e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">
              Possible trajectories — speculative by definition
            </h2>
          </header>
          <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
            <Field
              label="Possible resolution"
              hint="How the two forces could reconcile. Labelled a speculative possibility."
            >
              <TextArea
                rows={3}
                value={possibleResolution}
                onChange={(e) => setPossibleResolution(e.target.value)}
              />
            </Field>
            <Field
              label="Possible escalation"
              hint="How the tension could sharpen instead. Labelled a speculative possibility."
            >
              <TextArea
                rows={3}
                value={possibleEscalation}
                onChange={(e) => setPossibleEscalation(e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Strategic reading</h2>
          </header>
          <div className="space-y-4 px-4 py-4">
            <Field
              label="Strategic implication"
              hint="What should be watched or decided differently because this tension exists. Labelled human interpretation."
            >
              <TextArea
                rows={3}
                value={strategicImplication}
                onChange={(e) => setStrategicImplication(e.target.value)}
              />
            </Field>
            <Field
              label="Scenario relevance"
              hint="How this tension could become an axis along which scenarios diverge."
            >
              <TextArea
                rows={3}
                value={scenarioRelevance}
                onChange={(e) => setScenarioRelevance(e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="card">
          <header className="border-b border-line px-4 py-2.5">
            <h2 className="overline-label">Contradiction scores — five dimensions</h2>
          </header>
          <div className="space-y-4 px-4 py-4">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {SCORE_KEYS.map((k) => (
                <ScorePicker
                  key={k}
                  label={CONTRADICTION_SCORE_LABELS[k]}
                  value={scores[k]}
                  rubric={GENERIC_SCORE_RUBRIC}
                  onChange={(v: Score) => setScores((prev) => ({ ...prev, [k]: v }))}
                />
              ))}
            </div>
            <p className="border-t border-line pt-3 text-[11.5px] text-ink-faint">
              Score honestly. Low evidence balance means one side is under-scanned
              — strengthen the weaker side before drawing conclusions from this
              tension.
            </p>
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
            Save contradiction
          </button>
          <Link href="/contradictions" className={btnSecondary}>
            Cancel
          </Link>
          <p className="ml-2 text-[11.5px] text-ink-faint">
            Saved as a draft. Selected signals are linked back to this record.
          </p>
        </div>
      </div>
    </>
  );
}
