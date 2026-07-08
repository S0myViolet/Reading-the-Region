"use client";

/**
 * Add signal — an eight-step guided wizard, not a flat form. The steps follow
 * the method: source the event, classify it, state why it matters, score it
 * against the rubrics, climb the mandatory zooming ladder (no jump from event
 * to future), declare contradictions and assumptions, connect relationships,
 * then review and save. Low-confidence high-novelty signals and sensitive
 * tags are routed to human review automatically.
 *
 * The wizard is analyst work, so it only renders in Analyst or Methodology
 * view. Simple view shows a calm explainer that routes capture through the
 * Scan Inbox — or switches into Analyst view on demand, keeping any
 * ?fromObservation= promotion context intact.
 */

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import {
  ConfidenceBadge,
  IdChip,
  ReviewStatusBadge,
  SignalStrengthBadge,
} from "@/components/badges";
import {
  CheckboxList,
  Field,
  ScorePicker,
  Select,
  TextArea,
  TextInput,
} from "@/components/form";
import { useViewMode } from "@/components/ViewMode";
import { nextId, useHydrated, useIntelligenceStore } from "@/lib/store";
import { useViewModeStore } from "@/lib/viewMode";
import {
  canPromoteObservation,
  promotionCriteriaMet,
  zoomComplete,
} from "@/lib/validation";
import type {
  ActorType,
  ConfidenceLevel,
  Region,
  ReviewStatus,
  Score,
  Sector,
  Signal,
  SignalScores,
  SignalStrength,
  Source,
  SourceRole,
  SourceType,
  SystemAffected,
  TimeHorizon,
  TypeOfChange,
} from "@/lib/types";
import {
  ACTOR_TYPE_LABELS,
  CONFIDENCE_LABELS,
  CREDIBILITY_LABELS,
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
  SCORE_DIMENSION_LABELS,
  SCORE_RUBRICS,
  SECTOR_LABELS,
  SIGNAL_STRENGTH_LABELS,
  SOURCE_ROLE_LABELS,
  SOURCE_TYPE_LABELS,
  SYSTEM_LABELS,
  TIME_HORIZON_LABELS,
  TYPE_OF_CHANGE_LABELS,
} from "@/lib/types";
import {
  CONFIDENCE_EXPLANATIONS,
  REGION_OPTIONS,
  btnPrimary,
  btnSecondary,
  btnText,
  fmtDate,
  optionsFrom,
  parseTags,
  sensitiveTags,
  splitLines,
} from "../signal-ui";

// ---------------------------------------------------------------------------
// Wizard state
// ---------------------------------------------------------------------------

const ZOOM_MIN = 20;

const STEP_TITLES = [
  "Source & event details",
  "Geography & sector",
  "Signal description",
  "Scoring",
  "Zooming method",
  "Contradictions & assumptions",
  "Related signals & clusters",
  "Review & save",
];

interface WizardForm {
  sourceIds: string[];
  title: string;
  description: string;
  dateObserved: string;
  eventDate: string;
  region: Region;
  country: string;
  city: string;
  sectors: Sector[];
  subsector: string;
  actorTypes: ActorType[];
  primaryActor: string;
  typeOfChange: TypeOfChange[];
  systemsAffected: SystemAffected[];
  whyItMatters: string;
  implicationsText: string;
  tagsText: string;
  scores: SignalScores;
  signalStrength: SignalStrength;
  timeHorizon: TimeHorizon;
  confidence: ConfidenceLevel;
  whatHappened: string;
  behaviourChanged: string;
  systemChanged: string;
  futurePlausible: string;
  futureIsSpeculative: boolean;
  assumptionsText: string;
  openQuestionsText: string;
  contradictionIds: string[];
  relatedSignalIds: string[];
  clusterIds: string[];
}

const DEFAULT_SCORES: SignalScores = {
  novelty: 3,
  momentum: 3,
  evidence: 3,
  strategicRelevance: 3,
  behaviouralImpact: 3,
  emotionalImpact: 3,
  structuralImpact: 3,
  crossSectorRelevance: 3,
  geographicRelevance: 3,
};

function defaultForm(): WizardForm {
  return {
    sourceIds: [],
    title: "",
    description: "",
    dateObserved: new Date().toISOString().slice(0, 10),
    eventDate: "",
    region: "MENA-wide",
    country: "",
    city: "",
    sectors: [],
    subsector: "",
    actorTypes: [],
    primaryActor: "",
    typeOfChange: [],
    systemsAffected: [],
    whyItMatters: "",
    implicationsText: "",
    tagsText: "",
    scores: { ...DEFAULT_SCORES },
    signalStrength: "weak",
    timeHorizon: "near_term",
    confidence: "low",
    whatHappened: "",
    behaviourChanged: "",
    systemChanged: "",
    futurePlausible: "",
    futureIsSpeculative: false,
    assumptionsText: "",
    openQuestionsText: "",
    contradictionIds: [],
    relatedSignalIds: [],
    clusterIds: [],
  };
}

const CONFIDENCE_ORDER: ConfidenceLevel[] = ["low", "medium", "high"];

// ---------------------------------------------------------------------------
// Small presentation helpers
// ---------------------------------------------------------------------------

function NewSignalHeader({ simple = false }: { simple?: boolean }) {
  return (
    <PageHeader
      title="Add signal"
      description={
        simple
          ? "Signals enter the library either by promoting observations from the Scan Inbox or through the analyst capture wizard."
          : "An eight-step guided capture: source the event, classify it, state why it matters, score it against the rubrics, climb the mandatory zooming ladder, declare contradictions and assumptions, connect relationships, then review and save."
      }
    />
  );
}

/**
 * Simple-view landing: signal creation is analyst work, so the wizard stays
 * closed and the primary path routes capture through the Scan Inbox. The
 * mode switch is client state only, so any ?fromObservation= parameter (and
 * the prefilled promotion form behind it) survives the change untouched.
 */
function SimpleCaptureExplainer({ fromObservation }: { fromObservation: string | null }) {
  const setMode = useViewModeStore((s) => s.setMode);
  return (
    <section className="max-w-2xl">
      <h3 className="text-[13px] font-medium text-ink">Before you add a signal</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Creating a signal is analyst work: each one is scored against the nine rubric
        dimensions and read through the mandatory four-level zooming method before it can
        be used as evidence. The usual starting point is simpler — capture what
        you noticed as an observation in the Scan Inbox, and promote it to a signal once it
        earns its place.
      </p>
      {fromObservation ? (
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
          You arrived here promoting observation <IdChip id={fromObservation} />. Continuing
          in Analyst view resumes that promotion with the observation&apos;s details
          prefilled.
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href="/inbox/new" className={btnPrimary}>
          Capture an observation instead
        </Link>
        <button type="button" onClick={() => setMode("analyst")} className={btnText}>
          Continue in Analyst view
        </button>
      </div>
    </section>
  );
}

function SummaryItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}

/** Quiet heading used to group wizard fields. */
function GroupHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-medium text-ink">{children}</h3>;
}

function listOrDash(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "—";
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

function NewSignalContent() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromObservation = searchParams.get("fromObservation");

  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const observations = useIntelligenceStore((s) => s.observations);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const addSource = useIntelligenceStore((s) => s.addSource);
  const addSignal = useIntelligenceStore((s) => s.addSignal);
  const promoteObservation = useIntelligenceStore((s) => s.promoteObservation);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(defaultForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Quick-create source sub-form
  const [qcName, setQcName] = useState("");
  const [qcType, setQcType] = useState<SourceType>("news_publication");
  const [qcCredibility, setQcCredibility] = useState<Score>(3);
  const [qcRoles, setQcRoles] = useState<SourceRole[]>(["discovery"]);
  const [qcError, setQcError] = useState<string | null>(null);

  // Prefill from an observation being promoted
  const prefilled = useRef(false);
  useEffect(() => {
    if (!hydrated || !fromObservation || prefilled.current) return;
    const obs = observations.find((o) => o.id === fromObservation);
    prefilled.current = true;
    if (!obs) return;
    setForm((f) => ({
      ...f,
      title: obs.title,
      description: obs.description,
      dateObserved: obs.dateObserved.slice(0, 10),
      eventDate: obs.eventDate ? obs.eventDate.slice(0, 10) : "",
      region: obs.region,
      country: obs.country,
      city: obs.city ?? "",
      sectors: obs.sectors,
      subsector: obs.subsector ?? "",
      sourceIds: obs.sourceId
        ? Array.from(new Set([...f.sourceIds, obs.sourceId]))
        : f.sourceIds,
    }));
  }, [hydrated, fromObservation, observations]);

  if (!hydrated) {
    return (
      <>
        <NewSignalHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  if (mode === "simple") {
    return (
      <>
        <NewSignalHeader simple />
        <SimpleCaptureExplainer fromObservation={fromObservation} />
      </>
    );
  }

  const set = <K extends keyof WizardForm>(key: K, value: WizardForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const obsForPromotion = fromObservation
    ? observations.find((o) => o.id === fromObservation) ?? null
    : null;

  const forcedSpeculative = form.scores.evidence < 3;
  const effectiveSpeculative = forcedSpeculative || form.futureIsSpeculative;
  const l2Ok = form.behaviourChanged.trim().length >= ZOOM_MIN;
  const l3Ok = form.systemChanged.trim().length >= ZOOM_MIN;
  const l4Unlocked = l2Ok && l3Ok;

  function reviewDecision(): { status: ReviewStatus; reasons: string[] } {
    const tags = parseTags(form.tagsText);
    const sensitive = sensitiveTags(tags);
    const reasons: string[] = [];
    if (form.confidence === "low" && form.scores.novelty >= 4)
      reasons.push(
        "Low confidence combined with novelty ≥ 4 — potentially important but weakly grounded, so a human must review it before it is used.",
      );
    if (sensitive.length > 0)
      reasons.push(
        `Sensitive tags (${sensitive.join(", ")}) — sensitive subject matter always requires human review.`,
      );
    return { status: reasons.length > 0 ? "needs_human_review" : "draft", reasons };
  }

  function buildSignal(id: string): Signal {
    const now = new Date().toISOString();
    return {
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      dateObserved: form.dateObserved,
      eventDate: form.eventDate ? form.eventDate : null,
      sourceIds: form.sourceIds,
      observationId: fromObservation ?? null,
      region: form.region,
      country: form.country.trim(),
      city: form.city.trim() ? form.city.trim() : null,
      sectors: form.sectors,
      subsector: form.subsector.trim() ? form.subsector.trim() : null,
      actorTypes: form.actorTypes,
      primaryActor: form.primaryActor.trim(),
      typeOfChange: form.typeOfChange,
      systemsAffected: form.systemsAffected,
      signalStrength: form.signalStrength,
      scores: { ...form.scores },
      timeHorizon: form.timeHorizon,
      confidence: form.confidence,
      whyItMatters: form.whyItMatters.trim(),
      zoom: {
        whatHappened: form.whatHappened.trim(),
        behaviourChanged: form.behaviourChanged.trim(),
        systemChanged: form.systemChanged.trim(),
        futurePlausible: form.futurePlausible.trim(),
        futureIsSpeculative: effectiveSpeculative,
      },
      systems: null,
      potentialImplications: splitLines(form.implicationsText),
      assumptions: splitLines(form.assumptionsText),
      openQuestions: splitLines(form.openQuestionsText),
      contradictionIds: form.contradictionIds,
      relatedSignalIds: form.relatedSignalIds,
      clusterIds: form.clusterIds,
      patternIds: [],
      driverIds: [],
      monitoringIndicatorIds: [],
      tags: parseTags(form.tagsText),
      humanNotes: "",
      aiNotes: "",
      aiNotesLabel: null,
      reviewStatus: reviewDecision().status,
      createdAt: now,
      updatedAt: now,
    };
  }

  function validateStep(n: number): string[] {
    const errs: string[] = [];
    if (n === 1) {
      if (!form.title.trim()) errs.push("Title is required.");
      if (!form.description.trim()) errs.push("Description is required.");
      if (!form.dateObserved) errs.push("Date observed is required.");
    }
    if (n === 2) {
      if (!form.country.trim()) errs.push("Country is required.");
      if (form.sectors.length === 0) errs.push("Select at least one sector.");
      if (!form.primaryActor.trim()) errs.push("Primary actor is required.");
    }
    if (n === 3) {
      if (!form.whyItMatters.trim())
        errs.push("Why it matters is required — a signal without stated relevance is noise.");
    }
    if (n === 5) {
      if (form.whatHappened.trim().length < ZOOM_MIN)
        errs.push(`Level 1 — what happened — needs at least ${ZOOM_MIN} characters of factual description.`);
      if (form.behaviourChanged.trim().length < ZOOM_MIN)
        errs.push(`Level 2 — what behaviour changed — needs at least ${ZOOM_MIN} characters.`);
      if (form.systemChanged.trim().length < ZOOM_MIN)
        errs.push(`Level 3 — what system changed — needs at least ${ZOOM_MIN} characters.`);
      if (form.futurePlausible.trim().length < ZOOM_MIN)
        errs.push(`Level 4 — what future becomes more plausible — needs at least ${ZOOM_MIN} characters.`);
    }
    return errs;
  }

  function handleContinue() {
    const errs = validateStep(step);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setStep((s) => Math.min(STEP_TITLES.length, s + 1));
    window.scrollTo({ top: 0 });
  }

  function handleBack() {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0 });
  }

  function handleQuickCreate() {
    const name = qcName.trim();
    if (!name) {
      setQcError("A source name is required.");
      return;
    }
    const src: Source = {
      id: nextId("SRC", sources),
      name,
      url: null,
      sourceType: qcType,
      credibility: qcCredibility,
      biasTags: [],
      roles: qcRoles,
      dateAdded: new Date().toISOString(),
      notes: "Created during signal capture.",
      isDemo: false,
    };
    addSource(src);
    setForm((f) => ({ ...f, sourceIds: [...f.sourceIds, src.id] }));
    setQcName("");
    setQcRoles(["discovery"]);
    setQcCredibility(3);
    setQcError(null);
  }

  function handleSave() {
    const allErrs = [1, 2, 3, 5].flatMap((n) => validateStep(n));
    if (allErrs.length > 0) {
      setErrors(allErrs);
      return;
    }
    setErrors([]);
    const signal = buildSignal(nextId("SIG", signals));
    if (fromObservation) {
      const promoted = promoteObservation(fromObservation, signal);
      if (!promoted) {
        setSaveError(
          `Promotion blocked. An observation may only become a signal when at least ${PROMOTION_MIN_CRITERIA} of its ${PROMOTION_CRITERIA.length} promotion checklist criteria are honestly checked — ${fromObservation} does not currently pass that gate (or no longer exists). Open the observation, complete its checklist in triage, then promote it again.`,
        );
        return;
      }
    } else {
      addSignal(signal);
    }
    router.push(`/signals/${signal.id}`);
  }

  // -------------------------------------------------------------------------
  // Step renderers
  // -------------------------------------------------------------------------

  function renderStep1() {
    return (
      <div className="space-y-8">
        <section className="space-y-4">
          <GroupHeading>Sources</GroupHeading>
          <Field
            label="Link existing sources"
            hint="Evidence must be traceable. Select every source that supports this signal."
          >
            {sources.length > 0 ? (
              <div className="max-h-56 overflow-y-auto border border-line bg-surface px-3 py-2 rounded-[2px]">
                <CheckboxList
                  options={sources.map((s) => ({
                    value: s.id,
                    label: `${s.name} — ${CREDIBILITY_LABELS[s.credibility]}`,
                  }))}
                  selected={form.sourceIds}
                  onChange={(next) => set("sourceIds", next)}
                  columns={1}
                />
              </div>
            ) : (
              <p className="text-[11.5px] text-ink-faint">
                No sources registered yet — quick-create one below.
              </p>
            )}
          </Field>

          <div className="space-y-3 border-l border-line pl-4">
            <p className="text-[12px] font-medium text-ink-soft">Quick-create a source</p>
            <Field label="Source name">
              <TextInput
                value={qcName}
                onChange={(e) => setQcName(e.target.value)}
                placeholder="e.g. Gulf urban policy briefing"
              />
            </Field>
            <Field label="Source type">
              <Select
                value={qcType}
                onChange={(e) => setQcType(e.target.value as SourceType)}
              >
                {optionsFrom(SOURCE_TYPE_LABELS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <ScorePicker
              label="Credibility"
              value={qcCredibility}
              rubric={CREDIBILITY_LABELS}
              onChange={setQcCredibility}
            />
            <Field
              label="Roles"
              hint="Credibility and role are separate — a strong discovery source can be a weak validation source."
            >
              <CheckboxList
                options={optionsFrom(SOURCE_ROLE_LABELS)}
                selected={qcRoles}
                onChange={setQcRoles}
              />
            </Field>
            {qcError ? <p className="text-[11.5px] text-tension">{qcError}</p> : null}
            <button type="button" onClick={handleQuickCreate} className={btnSecondary}>
              Add source and link it
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <GroupHeading>Event details</GroupHeading>
          <Field label="Title" required hint="Name the change, not the topic.">
            <TextInput
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Heritage districts begin licensing night-time creative studios"
            />
          </Field>
          <Field label="Description" required hint="What was observed, factually.">
            <TextArea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date observed" required>
              <TextInput
                type="date"
                value={form.dateObserved}
                onChange={(e) => set("dateObserved", e.target.value)}
              />
            </Field>
            <Field label="Event date" hint="When the event itself occurred, if different.">
              <TextInput
                type="date"
                value={form.eventDate}
                onChange={(e) => set("eventDate", e.target.value)}
              />
            </Field>
          </div>
        </section>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-8">
        <section className="space-y-4">
          <GroupHeading>Geography</GroupHeading>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Region">
            <Select
              value={form.region}
              onChange={(e) => set("region", e.target.value as Region)}
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Country" required>
            <TextInput
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="e.g. Saudi Arabia"
            />
          </Field>
            <Field label="City">
              <TextInput
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Riyadh"
              />
            </Field>
          </div>
        </section>

        <section className="space-y-4">
          <GroupHeading>Classification</GroupHeading>
          <Field label="Sectors" required>
          <CheckboxList
            options={optionsFrom(SECTOR_LABELS)}
            selected={form.sectors}
            onChange={(next) => set("sectors", next)}
          />
        </Field>
        <Field label="Subsector" hint="Optional finer classification.">
          <TextInput
            value={form.subsector}
            onChange={(e) => set("subsector", e.target.value)}
          />
        </Field>
        <Field label="Actor types">
          <CheckboxList
            options={optionsFrom(ACTOR_TYPE_LABELS)}
            selected={form.actorTypes}
            onChange={(next) => set("actorTypes", next)}
          />
        </Field>
        <Field label="Primary actor" required hint="Who is driving the change.">
          <TextInput
            value={form.primaryActor}
            onChange={(e) => set("primaryActor", e.target.value)}
            placeholder="e.g. Ministry of Culture"
          />
        </Field>
        <Field label="Type of change">
          <CheckboxList
            options={optionsFrom(TYPE_OF_CHANGE_LABELS)}
            selected={form.typeOfChange}
            onChange={(next) => set("typeOfChange", next)}
          />
        </Field>
          <Field label="Systems affected">
            <CheckboxList
              options={optionsFrom(SYSTEM_LABELS)}
              selected={form.systemsAffected}
              onChange={(next) => set("systemsAffected", next)}
            />
          </Field>
        </section>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-4">
        <Field
          label="Why it matters"
          required
          hint="The strategic relevance in plain terms. If nothing can be said here, the observation is probably noise."
        >
          <TextArea
            rows={4}
            value={form.whyItMatters}
            onChange={(e) => set("whyItMatters", e.target.value)}
          />
        </Field>
        <Field label="Potential implications" hint="One per line. Possibilities, not predictions.">
          <TextArea
            rows={4}
            value={form.implicationsText}
            onChange={(e) => set("implicationsText", e.target.value)}
            placeholder={"Developers may reprice heritage-adjacent plots\nNight-time licensing could spread to secondary cities"}
          />
        </Field>
        <Field
          label="Tags"
          hint="Comma separated. Sensitive topics (politics, religion, gender, security…) automatically route the signal to human review."
        >
          <TextInput
            value={form.tagsText}
            onChange={(e) => set("tagsText", e.target.value)}
            placeholder="e.g. heritage, night economy, licensing"
          />
        </Field>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="space-y-4">
        <p className="text-[12px] text-ink-faint">
          Score against the rubric anchors, not against enthusiasm. The anchor text updates as
          you pick each value.
        </p>
        <div className="grid gap-2">
          {(Object.keys(SCORE_DIMENSION_LABELS) as Array<keyof SignalScores>).map((k) => (
            <ScorePicker
              key={k}
              label={SCORE_DIMENSION_LABELS[k]}
              value={form.scores[k]}
              rubric={SCORE_RUBRICS[k]}
              onChange={(v) => setForm((f) => ({ ...f, scores: { ...f.scores, [k]: v } }))}
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Signal strength">
            <Select
              value={form.signalStrength}
              onChange={(e) => set("signalStrength", e.target.value as SignalStrength)}
            >
              {optionsFrom(SIGNAL_STRENGTH_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Time horizon">
            <Select
              value={form.timeHorizon}
              onChange={(e) => set("timeHorizon", e.target.value as TimeHorizon)}
            >
              {optionsFrom(TIME_HORIZON_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Confidence" hint="How far the interpretation can be trusted — not how interesting the signal is.">
          <Select
            value={form.confidence}
            onChange={(e) => set("confidence", e.target.value as ConfidenceLevel)}
          >
            {optionsFrom(CONFIDENCE_LABELS).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <ul className="space-y-3 border-l border-line pl-4">
          {CONFIDENCE_ORDER.map((level) => {
            const current = level === form.confidence;
            return (
              <li key={level}>
                <p
                  className={`text-[12px] ${
                    current ? "font-medium text-ink" : "text-ink-faint"
                  }`}
                >
                  {CONFIDENCE_LABELS[level]}
                  {current ? (
                    <span className="ml-1.5 text-[11px] font-normal text-accent-ink">
                      selected
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">
                  {CONFIDENCE_EXPLANATIONS[level]}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  function renderStep5() {
    const l2Len = form.behaviourChanged.trim().length;
    const l3Len = form.systemChanged.trim().length;
    return (
      <div className="space-y-4">
        <p className="text-[12px] leading-relaxed text-ink-faint">
          The zooming ladder is mandatory. The method does not allow a jump from event straight
          to future — Levels 2 and 3 are what make the future claim defensible.
        </p>

        <Field
          label="Level 1 — What happened?"
          required
          hint="The factual event only. No interpretation."
        >
          <TextArea
            rows={3}
            value={form.whatHappened}
            onChange={(e) => set("whatHappened", e.target.value)}
          />
        </Field>

        <div>
          <Field
            label="Level 2 — What behaviour changed?"
            required
            hint="What people, institutions, brands, or systems may be starting to do differently — grounded in the event."
          >
            <TextArea
              rows={3}
              value={form.behaviourChanged}
              onChange={(e) => set("behaviourChanged", e.target.value)}
            />
          </Field>
          <p className={`mt-0.5 font-mono text-[10.5px] ${l2Ok ? "text-accent-ink" : "text-ink-faint"}`}>
            {l2Len} / {ZOOM_MIN} characters minimum
          </p>
        </div>

        <div>
          <Field
            label="Level 3 — What system changed?"
            required
            hint="The larger system the behaviour connects to — identity, tourism, finance, urban life, trust, culture."
          >
            <TextArea
              rows={3}
              value={form.systemChanged}
              onChange={(e) => set("systemChanged", e.target.value)}
            />
          </Field>
          <p className={`mt-0.5 font-mono text-[10.5px] ${l3Ok ? "text-accent-ink" : "text-ink-faint"}`}>
            {l3Len} / {ZOOM_MIN} characters minimum
          </p>
        </div>

        <div className={l4Unlocked ? "" : "opacity-60"}>
          <Field
            label="Level 4 — What future becomes more plausible?"
            required
            hint="Not a prediction. A possible direction suggested by the signal."
          >
            <TextArea
              rows={3}
              value={form.futurePlausible}
              onChange={(e) => set("futurePlausible", e.target.value)}
              disabled={!l4Unlocked}
              placeholder={
                l4Unlocked
                  ? "If this continues, it becomes more plausible that…"
                  : "Locked until Levels 2 and 3 are complete"
              }
            />
          </Field>
          {!l4Unlocked ? (
            <p className="mt-1 text-[11.5px] text-caution">
              Level 4 is locked until Level 2 and Level 3 each hold at least {ZOOM_MIN}{" "}
              characters. Jumping from event to future skips the behaviour and system readings
              that make a future claim defensible.
            </p>
          ) : null}
        </div>

        <label className="flex items-start gap-2 text-[12.5px] text-ink-soft">
          <input
            type="checkbox"
            className="mt-0.5 accent-[#29513f]"
            checked={effectiveSpeculative}
            disabled={forcedSpeculative}
            onChange={(e) => set("futureIsSpeculative", e.target.checked)}
          />
          <span>
            Flag Level 4 as a speculative possibility
            {forcedSpeculative ? (
              <span className="mt-0.5 block text-[11.5px] text-caution">
                Forced on: the evidence score is {form.scores.evidence}/5. When evidence is
                below 3, the future reading must be labelled speculative — it cannot be
                presented as a grounded interpretation.
              </span>
            ) : null}
          </span>
        </label>
      </div>
    );
  }

  function renderStep6() {
    return (
      <div className="space-y-4">
        <Field
          label="Assumptions"
          hint="One per line. Each is saved and displayed as a hypothesis, never as fact."
        >
          <TextArea
            rows={4}
            value={form.assumptionsText}
            onChange={(e) => set("assumptionsText", e.target.value)}
            placeholder={"Assumes the pilot programme will be renewed\nAssumes demand is not purely subsidised"}
          />
        </Field>
        <Field
          label="Open questions"
          hint="One per line. What would you need to know to trust this signal more?"
        >
          <TextArea
            rows={4}
            value={form.openQuestionsText}
            onChange={(e) => set("openQuestionsText", e.target.value)}
            placeholder={"Is this repeating outside the capital?\nWho loses if this continues?"}
          />
        </Field>
        <Field
          label="Link existing contradictions"
          hint="What could contradict this signal? Linking tension keeps the reading honest."
        >
          {contradictions.length > 0 ? (
            <div className="max-h-56 overflow-y-auto border border-line bg-surface px-3 py-2 rounded-[2px]">
              <CheckboxList
                options={contradictions.map((c) => ({ value: c.id, label: `${c.id} — ${c.name}` }))}
                selected={form.contradictionIds}
                onChange={(next) => set("contradictionIds", next)}
                columns={1}
              />
            </div>
          ) : (
            <p className="text-[11.5px] text-ink-faint">
              No contradictions are recorded yet. They are captured on the Contradictions page
              and can be linked to this signal later.
            </p>
          )}
        </Field>
      </div>
    );
  }

  function renderStep7() {
    return (
      <div className="space-y-4">
        <Field
          label="Related signals"
          hint="Evidence gains meaning through relationships. Connect signals that share underlying logic."
        >
          {signals.length > 0 ? (
            <div className="max-h-64 overflow-y-auto border border-line bg-surface px-3 py-2 rounded-[2px]">
              <CheckboxList
                options={signals.map((s) => ({ value: s.id, label: `${s.id} — ${s.title}` }))}
                selected={form.relatedSignalIds}
                onChange={(next) => set("relatedSignalIds", next)}
                columns={1}
              />
            </div>
          ) : (
            <p className="text-[11.5px] text-ink-faint">
              This will be the first signal in the library — there is nothing to relate it to yet.
            </p>
          )}
        </Field>
        <Field
          label="Possible clusters"
          hint="Clusters group signals by shared underlying logic — the question the evidence keeps answering — never by shared topic."
        >
          {clusters.length > 0 ? (
            <div className="max-h-64 overflow-y-auto border border-line bg-surface px-3 py-2 rounded-[2px]">
              <CheckboxList
                options={clusters.map((c) => ({ value: c.id, label: `${c.id} — ${c.name}` }))}
                selected={form.clusterIds}
                onChange={(next) => set("clusterIds", next)}
                columns={1}
              />
            </div>
          ) : (
            <p className="text-[11.5px] text-ink-faint">
              No cluster candidates exist yet. Clusters form once several signals share the same
              underlying logic.
            </p>
          )}
        </Field>
      </div>
    );
  }

  function renderStep8() {
    const candidate = buildSignal("SIG-preview");
    const decision = reviewDecision();
    const zoomResult = zoomComplete(candidate);
    const linkedSourceNames = sources
      .filter((s) => form.sourceIds.includes(s.id))
      .map((s) => s.name);
    const contradictionNames = contradictions
      .filter((c) => form.contradictionIds.includes(c.id))
      .map((c) => c.name);
    const clusterNames = clusters
      .filter((c) => form.clusterIds.includes(c.id))
      .map((c) => c.name);

    return (
      <div className="space-y-8">
        <section>
          <GroupHeading>Signal record</GroupHeading>
          <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <SummaryItem label="Title">{form.title.trim() || "—"}</SummaryItem>
            <SummaryItem label="Dates">
              Observed {fmtDate(form.dateObserved || null)} · Event{" "}
              {fmtDate(form.eventDate || null)}
            </SummaryItem>
            <SummaryItem label="Sources">{listOrDash(linkedSourceNames)}</SummaryItem>
            <SummaryItem label="Geography">
              {form.region} · {form.country.trim() || "—"}
              {form.city.trim() ? ` · ${form.city.trim()}` : ""}
            </SummaryItem>
            <SummaryItem label="Sectors">
              {listOrDash(form.sectors.map((s) => SECTOR_LABELS[s]))}
            </SummaryItem>
            <SummaryItem label="Subsector">{form.subsector.trim() || "—"}</SummaryItem>
            <SummaryItem label="Actor types">
              {listOrDash(form.actorTypes.map((a) => ACTOR_TYPE_LABELS[a]))}
            </SummaryItem>
            <SummaryItem label="Primary actor">{form.primaryActor.trim() || "—"}</SummaryItem>
            <SummaryItem label="Type of change">
              {listOrDash(form.typeOfChange.map((t) => TYPE_OF_CHANGE_LABELS[t]))}
            </SummaryItem>
            <SummaryItem label="Systems affected">
              {listOrDash(form.systemsAffected.map((s) => SYSTEM_LABELS[s]))}
            </SummaryItem>
            <SummaryItem label="Tags">{listOrDash(parseTags(form.tagsText))}</SummaryItem>
            <SummaryItem label="Classification">
              <span className="inline-flex flex-wrap gap-1.5">
                <SignalStrengthBadge strength={form.signalStrength} />
                <ConfidenceBadge level={form.confidence} />
              </span>
            </SummaryItem>
            <SummaryItem label="Time horizon">
              {TIME_HORIZON_LABELS[form.timeHorizon]}
            </SummaryItem>
            <SummaryItem label="Scores">
              <span className="font-mono text-[11px]">
                {(Object.keys(SCORE_DIMENSION_LABELS) as Array<keyof SignalScores>)
                  .map((k) => `${SCORE_DIMENSION_LABELS[k]} ${form.scores[k]}`)
                  .join(" · ")}
              </span>
            </SummaryItem>
            <SummaryItem label="Why it matters">{form.whyItMatters.trim() || "—"}</SummaryItem>
            <SummaryItem label="Potential implications">
              {listOrDash(splitLines(form.implicationsText))}
            </SummaryItem>
            <SummaryItem label="Assumptions (saved as hypotheses)">
              {listOrDash(splitLines(form.assumptionsText))}
            </SummaryItem>
            <SummaryItem label="Open questions">
              {listOrDash(splitLines(form.openQuestionsText))}
            </SummaryItem>
            <SummaryItem label="Contradictions">{listOrDash(contradictionNames)}</SummaryItem>
            <SummaryItem label="Related signals">
              {listOrDash(form.relatedSignalIds)}
            </SummaryItem>
            <SummaryItem label="Clusters">{listOrDash(clusterNames)}</SummaryItem>
            <SummaryItem label="Level 4 speculation flag">
              {effectiveSpeculative
                ? forcedSpeculative
                  ? "On — forced, evidence score below 3"
                  : "On — set manually"
                : "Off"}
            </SummaryItem>
          </dl>
        </section>

        <section>
          <GroupHeading>Zooming ladder</GroupHeading>
          <ol className="mt-3 space-y-3 border-l border-line pl-4">
            {[
              { q: "L1 What happened?", text: form.whatHappened },
              { q: "L2 What behaviour changed?", text: form.behaviourChanged },
              { q: "L3 What system changed?", text: form.systemChanged },
              { q: "L4 What future becomes more plausible?", text: form.futurePlausible },
            ].map((l) => (
              <li key={l.q}>
                <p className="font-mono text-[10.5px] text-ink-faint">{l.q}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                  {l.text.trim() || "—"}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <ValidationChecklist
          result={zoomResult}
          title="Validation notes"
          passedLabel="Ready to save"
          failedLabel="Gaps remain"
        />

        <section>
          <div className="flex flex-wrap items-center gap-2">
            <GroupHeading>Review status on save</GroupHeading>
            <ReviewStatusBadge status={decision.status} />
          </div>
          {decision.reasons.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {decision.reasons.map((r) => (
                <li key={r} className="text-[12px] text-ink-soft">
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12px] text-ink-faint">
              Saved as a draft. It moves to human review or validation as evidence and review
              decisions accumulate.
            </p>
          )}
        </section>

        {saveError ? (
          <div className="border-l-2 border-tension pl-3">
            <p className="text-[12.5px] font-medium text-tension">Promotion blocked</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">{saveError}</p>
            {fromObservation ? (
              <Link
                href={`/inbox/${fromObservation}`}
                className="mt-1.5 inline-block text-[12px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:text-ink"
              >
                Open observation {fromObservation}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
    7: renderStep7,
    8: renderStep8,
  };

  return (
    <>
      <NewSignalHeader />

      {fromObservation ? (
        obsForPromotion ? (
          <div className="mb-6 max-w-2xl border-l-2 border-info pl-3">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Promoting observation <IdChip id={obsForPromotion.id} /> —{" "}
              {obsForPromotion.title}. Fields are prefilled from the observation record; saving
              will mark it as promoted and link it to the new signal.
            </p>
            {!canPromoteObservation(obsForPromotion) ? (
              <p className="mt-1 text-[11.5px] text-caution">
                This observation currently meets {promotionCriteriaMet(obsForPromotion)} of{" "}
                {PROMOTION_CRITERIA.length} promotion criteria — at least{" "}
                {PROMOTION_MIN_CRITERIA} are required. You can fill in the wizard, but saving
                will be blocked until its checklist passes in triage.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mb-6 max-w-2xl border-l-2 border-caution pl-3">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Observation <span className="font-mono text-[11px]">{fromObservation}</span> was
              not found in the Scan Inbox, so promotion will fail on save. Return to the{" "}
              <Link href="/inbox" className="text-accent-ink underline">
                Scan Inbox
              </Link>{" "}
              to locate the observation, or continue to capture a standalone signal by removing
              the promotion parameter.
            </p>
          </div>
        )
      ) : null}

      {/* Step indicator — plain numbered text, current step in ink */}
      <nav aria-label="Wizard progress" className="mb-8">
        <p className="text-[12px] text-ink-faint">
          Step <span className="font-mono">{step}</span> of{" "}
          <span className="font-mono">{STEP_TITLES.length}</span> —{" "}
          <span className="text-ink-soft">{STEP_TITLES[step - 1]}</span>
        </p>
        <ol className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
          {STEP_TITLES.map((t, i) => {
            const n = i + 1;
            return (
              <li key={t}>
                {n < step ? (
                  <button
                    type="button"
                    onClick={() => {
                      setErrors([]);
                      setStep(n);
                    }}
                    className="text-[11.5px] text-ink-faint underline-offset-2 hover:text-ink hover:underline"
                  >
                    <span className="font-mono">{n}</span> {t}
                  </button>
                ) : (
                  <span
                    className={`text-[11.5px] ${
                      n === step ? "font-medium text-ink" : "text-ink-faint"
                    }`}
                  >
                    <span className="font-mono">{n}</span> {t}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="max-w-2xl">{stepRenderers[step]()}</section>

      {errors.length > 0 ? (
        <div className="mt-6 max-w-2xl border-l-2 border-caution pl-3">
          <p className="text-[12px] font-medium text-caution">
            Complete the required fields before continuing
          </p>
          <ul className="mt-1 space-y-0.5">
            {errors.map((e) => (
              <li key={e} className="text-[12px] text-ink-soft">
                {e}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 flex max-w-2xl items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className={`${btnSecondary} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Back
        </button>
        {step < STEP_TITLES.length ? (
          <button type="button" onClick={handleContinue} className={btnPrimary}>
            Continue
          </button>
        ) : (
          <button type="button" onClick={handleSave} className={btnPrimary}>
            {fromObservation ? "Promote and save signal" : "Save signal"}
          </button>
        )}
      </div>
    </>
  );
}

export default function NewSignalPage() {
  return (
    <Suspense
      fallback={
        <>
          <NewSignalHeader />
          <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
        </>
      }
    >
      <NewSignalContent />
    </Suspense>
  );
}
