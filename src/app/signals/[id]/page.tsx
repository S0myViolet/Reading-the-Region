"use client";

/**
 * Signal detail — the full evidence record for one signal, disclosed through
 * visibility layers. Simple view reads as a plain article: what happened, why
 * it matters, how confident, the evidence, what could contradict it, and the
 * next step — headings and whitespace, no boxes. Analyst view opens the tabs:
 * overview, evidence, scoring, the mandatory zooming ladder, systems
 * analysis, contradictions, and human review. Methodology view adds rubric
 * anchors, provenance labels, the audit trail, and the zoom-completeness
 * checklist. The right column holds the quiet reading guide (Guided Mode)
 * and the relationship trail in every mode.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Tabs } from "@/components/Tabs";
import {
  ConfidenceBadge,
  DemoTag,
  IdChip,
  ProvenanceBadge,
  ReviewStatusBadge,
  SignalStrengthBadge,
  SourceCredibilityBadge,
} from "@/components/badges";
import { PlainTags, SectorTags, SourceBiasTags, SystemTags } from "@/components/tags";
import { RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { SignalScorePanel } from "@/components/ScorePanel";
import { ZoomingPanel } from "@/components/ZoomingPanel";
import { ContradictionPanel, NoContradictionNote } from "@/components/ContradictionPanel";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { ExplainedConfidence, ExplainedScore } from "@/components/Explained";
import { Select, TextArea } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { zoomComplete } from "@/lib/validation";
import {
  evidenceQualityLine,
  explainContradiction,
  nextStepForSignal,
} from "@/lib/explain";
import type {
  ConfidenceLevel,
  Contradiction,
  ReviewStatus,
  Score,
  Signal,
  SignalScores,
  Source,
} from "@/lib/types";
import {
  ACTOR_TYPE_LABELS,
  CONFIDENCE_LABELS,
  REVIEW_STATUS_LABELS,
  SCORE_DIMENSION_LABELS,
  SCORE_RUBRICS,
  SOURCE_ROLE_LABELS,
  SOURCE_TYPE_LABELS,
  TYPE_OF_CHANGE_LABELS,
} from "@/lib/types";
import {
  CONFIDENCE_EXPLANATIONS,
  SIGNAL_READING_GUIDE,
  btnPrimary,
  fmtDate,
} from "../signal-ui";

// ---------------------------------------------------------------------------
// Small presentation helpers — headings and whitespace, never boxes
// ---------------------------------------------------------------------------

/** Article section: a small ink heading over prose. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[13px] font-medium text-ink">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">{children}</p>;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}

function FaintNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] text-ink-faint">{children}</p>;
}

function linkedSources(signal: Signal, sources: Source[]): Source[] {
  return signal.sourceIds
    .map((id) => sources.find((s) => s.id === id))
    .filter((s): s is Source => Boolean(s));
}

// ---------------------------------------------------------------------------
// Simple view — one readable column, no analysis machinery
// ---------------------------------------------------------------------------

function SimpleView({
  signal,
  sources,
  contradictions,
}: {
  signal: Signal;
  sources: Source[];
  contradictions: Contradiction[];
}) {
  const linked = linkedSources(signal, sources);
  return (
    <div className="max-w-2xl space-y-8">
      <Section title="What happened">
        <Prose>{signal.zoom.whatHappened.trim() || signal.description}</Prose>
      </Section>

      <Section title="Why it matters">
        <Prose>{signal.whyItMatters}</Prose>
      </Section>

      <Section title="How confident">
        <ExplainedConfidence signal={signal} sources={sources} />
      </Section>

      <Section title="What evidence supports it">
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
          {evidenceQualityLine(signal, sources)}
        </p>
        {linked.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {linked.map((src) => (
              <li key={src.id} className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={`/sources/${src.id}`}
                  className="text-[12.5px] text-ink hover:text-accent-ink hover:underline"
                >
                  {src.name}
                </Link>
                {src.isDemo ? <DemoTag /> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      <Section title="What could contradict it">
        {contradictions.length > 0 ? (
          <ul className="space-y-2">
            {contradictions.map((c) => (
              <li key={c.id} className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
                <Link
                  href={`/contradictions/${c.id}`}
                  className="font-medium text-ink hover:text-accent-ink hover:underline"
                >
                  {c.name}
                </Link>
                {": "}
                {explainContradiction(c)}
              </li>
            ))}
          </ul>
        ) : (
          <NoContradictionNote />
        )}
      </Section>

      <Section title="Suggested next step">
        <Prose>{nextStepForSignal(signal)}</Prose>
      </Section>

      <DepthHint>Scoring, zooming analysis, source bias and validation detail</DepthHint>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs (analyst view and deeper)
// ---------------------------------------------------------------------------

function OverviewTab({ signal }: { signal: Signal }) {
  return (
    <div className="max-w-2xl space-y-8">
      <Section title="Why it matters">
        <Prose>{signal.whyItMatters}</Prose>
      </Section>

      <Section title="Description">
        <Prose>{signal.description}</Prose>
      </Section>

      <Section title="Classification">
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Fact label="Region">{signal.region}</Fact>
          <Fact label="Country · city">
            {signal.country}
            {signal.city ? ` · ${signal.city}` : ""}
          </Fact>
          <Fact label="Sectors">
            {signal.sectors.length > 0 ? (
              <SectorTags sectors={signal.sectors} />
            ) : (
              <FaintNote>No sectors recorded.</FaintNote>
            )}
          </Fact>
          <Fact label="Subsector">{signal.subsector ?? "—"}</Fact>
          <Fact label="Actor types">
            {signal.actorTypes.length > 0
              ? signal.actorTypes.map((a) => ACTOR_TYPE_LABELS[a]).join(", ")
              : "—"}
          </Fact>
          <Fact label="Primary actor">{signal.primaryActor}</Fact>
          <Fact label="Type of change">
            {signal.typeOfChange.length > 0
              ? signal.typeOfChange.map((t) => TYPE_OF_CHANGE_LABELS[t]).join(", ")
              : "—"}
          </Fact>
          <Fact label="Dates">
            Observed {fmtDate(signal.dateObserved)} · Event {fmtDate(signal.eventDate)}
          </Fact>
          <Fact label="Systems affected">
            {signal.systemsAffected.length > 0 ? (
              <SystemTags systems={signal.systemsAffected} />
            ) : (
              <FaintNote>No systems recorded yet.</FaintNote>
            )}
          </Fact>
          <Fact label="Tags">
            {signal.tags.length > 0 ? (
              <PlainTags tags={signal.tags} />
            ) : (
              <FaintNote>No tags.</FaintNote>
            )}
          </Fact>
        </dl>
      </Section>

      <Section title="Potential implications">
        {signal.potentialImplications.length > 0 ? (
          <ul className="space-y-1.5">
            {signal.potentialImplications.map((imp) => (
              <li key={imp} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                <span aria-hidden className="text-ink-faint">
                  –
                </span>
                {imp}
              </li>
            ))}
          </ul>
        ) : (
          <FaintNote>
            No potential implications articulated yet. What could this change for the sector,
            the audience, or the region if it continues?
          </FaintNote>
        )}
      </Section>

      <Section title="Assumptions">
        {signal.assumptions.length > 0 ? (
          <ul className="space-y-1.5">
            {signal.assumptions.map((a) => (
              <li key={a} className="flex items-start justify-between gap-3">
                <span className="text-[13px] leading-relaxed text-ink-soft">{a}</span>
                <ProvenanceBadge label="hypothesis" />
              </li>
            ))}
          </ul>
        ) : (
          <FaintNote>
            No assumptions declared. Every interpretation rests on assumptions — naming them is
            what keeps the reading honest.
          </FaintNote>
        )}
      </Section>

      <Section title="Open questions">
        {signal.openQuestions.length > 0 ? (
          <ul className="space-y-1.5">
            {signal.openQuestions.map((q) => (
              <li key={q} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                <span aria-hidden className="text-ink-faint">
                  ?
                </span>
                {q}
              </li>
            ))}
          </ul>
        ) : (
          <FaintNote>No open questions recorded.</FaintNote>
        )}
      </Section>
    </div>
  );
}

function EvidenceTab({ signal, sources }: { signal: Signal; sources: Source[] }) {
  const linked = linkedSources(signal, sources);

  return (
    <div className="max-w-2xl space-y-8">
      <Section title="Linked sources">
        {linked.length > 0 ? (
          <ul className="space-y-4">
            {linked.map((src) => (
              <li key={src.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/sources/${src.id}`}
                    className="text-[13px] font-medium text-ink hover:text-accent-ink hover:underline"
                  >
                    {src.name}
                  </Link>
                  <SourceCredibilityBadge score={src.credibility} />
                  {src.isDemo ? <DemoTag /> : null}
                </div>
                <p className="mt-0.5 text-[11px] text-ink-faint">
                  {SOURCE_TYPE_LABELS[src.sourceType]} · <IdChip id={src.id} />
                  {src.roles.length > 0
                    ? ` · ${src.roles.map((r) => SOURCE_ROLE_LABELS[r]).join(" · ")}`
                    : null}
                </p>
                {src.biasTags.length > 0 ? (
                  <div className="mt-1.5">
                    <SourceBiasTags tags={src.biasTags} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            No sources are linked to this signal. Evidence must be traceable — attach at least
            one source from the source registry, and use its credibility and role to decide how
            much weight the signal can carry.
          </p>
        )}
      </Section>

      <Section title="Dates">
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Fact label="Date observed">{fmtDate(signal.dateObserved)}</Fact>
          <Fact label="Event date">{fmtDate(signal.eventDate)}</Fact>
        </dl>
      </Section>

      <Section title="Human notes">
        {signal.humanNotes.trim() ? (
          <p className="max-w-2xl whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
            {signal.humanNotes}
          </p>
        ) : (
          <FaintNote>No human notes yet. Notes can be added in the Review tab.</FaintNote>
        )}
      </Section>

      {signal.aiNotes.trim() ? (
        <section className="border-l-2 border-caution/50 pl-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[13px] font-medium text-ink">AI-drafted note</h3>
            <ViewGate min="methodology">
              <ProvenanceBadge label={signal.aiNotesLabel ?? "ai_inference"} />
            </ViewGate>
          </div>
          <p className="mt-1.5 max-w-2xl whitespace-pre-line text-[13px] leading-relaxed text-ink-soft">
            {signal.aiNotes}
          </p>
          <p className="mt-2 text-[11px] text-caution">AI-drafted note — not evidence.</p>
        </section>
      ) : null}
    </div>
  );
}

const CONFIDENCE_ORDER: ConfidenceLevel[] = ["low", "medium", "high"];

/** The dimensions whose reasons are spelled out, not just tooltipped. */
const EXPLAINED_DIMS: Array<keyof SignalScores> = [
  "novelty",
  "momentum",
  "evidence",
  "strategicRelevance",
];

const SCORE_STEPS: Score[] = [1, 2, 3, 4, 5];

function ScoringTab({ signal, sources }: { signal: Signal; sources: Source[] }) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <Section title="Nine-dimension scoring">
          <SignalScorePanel scores={signal.scores} />
        </Section>
      </div>

      <div className="max-w-2xl">
        <Section title="Why these scores">
          <div className="space-y-3">
            {EXPLAINED_DIMS.map((dim) => (
              <ExplainedScore key={dim} dim={dim} signal={signal} sources={sources} />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-faint">
            Remaining dimensions carry their rubric anchor as a tooltip on the score bars above.
          </p>
        </Section>
      </div>

      <div className="max-w-2xl">
        <Section title="Confidence logic">
          <ul className="space-y-3">
            {CONFIDENCE_ORDER.map((level) => {
              const current = level === signal.confidence;
              return (
                <li key={level}>
                  <p
                    className={`text-[12.5px] ${
                      current ? "font-medium text-ink" : "text-ink-faint"
                    }`}
                  >
                    {CONFIDENCE_LABELS[level]}
                    {current ? (
                      <span className="ml-1.5 font-normal text-[11px] text-accent-ink">
                        current
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
        </Section>
      </div>

      <ViewGate min="methodology">
        <section>
          <h3 className="text-[13px] font-medium text-ink">
            Rubric anchors — this signal&apos;s position marked
          </h3>
          <div className="card mt-3">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dimension</th>
                    {SCORE_STEPS.map((n) => (
                      <th key={n}>{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(SCORE_DIMENSION_LABELS) as Array<keyof SignalScores>).map(
                    (k) => (
                      <tr key={k}>
                        <td className="whitespace-nowrap text-[12px] font-medium text-ink">
                          {SCORE_DIMENSION_LABELS[k]}
                        </td>
                        {SCORE_STEPS.map((n) => (
                          <td
                            key={n}
                            className={`text-[11.5px] ${
                              signal.scores[k] === n
                                ? "bg-accent-soft font-medium text-accent-ink"
                                : "text-ink-soft"
                            }`}
                          >
                            {SCORE_RUBRICS[k][n]}
                          </td>
                        ))}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </ViewGate>
    </div>
  );
}

function ZoomingTab({ signal }: { signal: Signal }) {
  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-[12px] leading-relaxed text-ink-faint">
        The zooming ladder is mandatory for every signal. The reading must climb from event to
        behaviour to system before any future is stated — a jump from Level 1 straight to Level
        4 is not a signal reading, it is a guess.
      </p>
      <ZoomingPanel zoom={signal.zoom} />
      <ViewGate min="methodology">
        <ValidationChecklist
          result={zoomComplete(signal)}
          title="Zooming completeness"
          passedLabel="Ladder complete"
          failedLabel="Ladder incomplete"
        />
      </ViewGate>
    </div>
  );
}

function SystemsTab({ signal }: { signal: Signal }) {
  const systems = signal.systems;
  if (!systems) {
    return (
      <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
        Systems analysis not yet completed — ask what system produced this behaviour, what
        incentives are shifting, and what second-order effects could emerge if the change
        continues.
      </p>
    );
  }
  const chain: Array<{ label: string; text: string }> = [
    { label: "First-order effect", text: systems.firstOrderEffect },
    { label: "Second-order effect", text: systems.secondOrderEffect },
    { label: "Third-order effect", text: systems.thirdOrderEffect },
  ];
  return (
    <div className="max-w-2xl space-y-8">
      <Section title="Order-of-effects chain">
        <ol className="space-y-4 border-l border-line pl-4">
          {chain.map((c, i) => (
            <li key={c.label}>
              <p className="text-[12.5px] font-medium text-ink">
                <span className="mr-1 font-mono text-[11px] text-ink-faint">{i + 1}</span>
                {c.label}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{c.text}</p>
            </li>
          ))}
        </ol>
      </Section>
      <div className="grid gap-8 sm:grid-cols-2">
        <Section title="Reinforcing loops">
          {systems.reinforcingLoops.length > 0 ? (
            <ul className="space-y-1.5">
              {systems.reinforcingLoops.map((l) => (
                <li key={l} className="text-[12.5px] leading-relaxed text-ink-soft">
                  {l}
                </li>
              ))}
            </ul>
          ) : (
            <FaintNote>No reinforcing loops identified.</FaintNote>
          )}
        </Section>
        <Section title="Balancing loops">
          {systems.balancingLoops.length > 0 ? (
            <ul className="space-y-1.5">
              {systems.balancingLoops.map((l) => (
                <li key={l} className="text-[12.5px] leading-relaxed text-ink-soft">
                  {l}
                </li>
              ))}
            </ul>
          ) : (
            <FaintNote>No balancing loops identified.</FaintNote>
          )}
        </Section>
      </div>
    </div>
  );
}

function ReviewTab({ signal }: { signal: Signal }) {
  const updateSignal = useIntelligenceStore((s) => s.updateSignal);
  const [status, setStatus] = useState<ReviewStatus>(signal.reviewStatus);
  const [notes, setNotes] = useState(signal.humanNotes);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateSignal(signal.id, { reviewStatus: status, humanNotes: notes });
    setSaved(true);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[13px] font-medium text-ink">Review status</h3>
          <ReviewStatusBadge status={signal.reviewStatus} />
        </div>
        <label className="mt-3 block max-w-sm">
          <span className="block text-[11px] text-ink-faint">Change review status</span>
          <span className="mt-1 block">
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ReviewStatus);
                setSaved(false);
              }}
            >
              {(Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[]).map((k) => (
                <option key={k} value={k}>
                  {REVIEW_STATUS_LABELS[k]}
                </option>
              ))}
            </Select>
          </span>
        </label>
        <p className="mt-2 text-[11.5px] text-ink-faint">
          A human decision, recorded honestly: validation is earned through evidence, not
          assigned for convenience.
        </p>
      </section>

      <Section title="Human notes">
        <TextArea
          rows={5}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          placeholder="Reviewer judgement, caveats, follow-ups — kept separate from AI-drafted material."
        />
      </Section>

      <ViewGate min="methodology">
        <Section title="Audit trail">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Fact label="Created">{fmtDate(signal.createdAt)}</Fact>
            <Fact label="Last updated">{fmtDate(signal.updatedAt)}</Fact>
            <Fact label="Review status on record">
              {REVIEW_STATUS_LABELS[signal.reviewStatus]}
            </Fact>
            <Fact label="Provenance">
              {signal.observationId ? (
                <>
                  Promoted from observation <IdChip id={signal.observationId} />
                </>
              ) : (
                "Captured directly as a signal"
              )}
            </Fact>
          </dl>
        </Section>
      </ViewGate>

      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave} className={btnPrimary}>
          Save review
        </button>
        {saved ? <span className="text-[12px] text-accent-ink">Saved.</span> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right column
// ---------------------------------------------------------------------------

/** Quiet reading outline — a hairline rail, faint numbers, no boxes. */
function ReadingGuidePanel() {
  return (
    <section>
      <h3 className="mb-3 text-[13px] font-medium text-ink">How to read this signal</h3>
      <ol className="space-y-3 border-l border-line pl-4">
        {SIGNAL_READING_GUIDE.map((item, i) => (
          <li key={item.q}>
            <p className="text-[12px] font-medium text-ink">
              <span className="mr-1 font-mono text-[10.5px] text-ink-faint">{i + 1}</span>
              {item.q}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">{item.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function resolveItems<T extends { id: string }>(
  ids: string[],
  list: T[],
  title: (t: T) => string,
): Array<{ id: string; title: string }> {
  return ids.map((id) => {
    const found = list.find((x) => x.id === id);
    return { id, title: found ? title(found) : id };
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SignalDetailPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const signals = useIntelligenceStore((s) => s.signals);
  const sources = useIntelligenceStore((s) => s.sources);
  const observations = useIntelligenceStore((s) => s.observations);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const indicators = useIntelligenceStore((s) => s.indicators);
  const guidedMode = useIntelligenceStore((s) => s.guidedMode);

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Signal detail" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const signal = signals.find((s) => s.id === id);
  if (!signal) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Signal Library", href: "/signals" }, { label: String(id) }]} />
        <PageHeader title="Signal not found" />
        <EmptyState
          message={`No signal with id “${id}” exists in the library. Signals are created by promoting observations that pass the promotion checklist in the Scan Inbox, or captured directly through the guided form.`}
          actionLabel="Open the Signal Library"
          actionHref="/signals"
        />
      </>
    );
  }

  const observation = signal.observationId
    ? observations.find((o) => o.id === signal.observationId) ?? null
    : null;
  const firstCluster =
    signal.clusterIds.length > 0
      ? clusters.find((c) => c.id === signal.clusterIds[0]) ?? null
      : null;
  const linkedContradictions = signal.contradictionIds
    .map((cid) => contradictions.find((c) => c.id === cid))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const crumbs: Array<{ label: string; href?: string }> = [
    signal.observationId
      ? { label: "Scan Inbox", href: `/inbox/${signal.observationId}` }
      : { label: "Scan Inbox", href: "/inbox" },
    { label: `Signal · ${signal.id}` },
  ];
  if (signal.clusterIds.length > 0) {
    crumbs.push({
      label: firstCluster ? `Cluster · ${firstCluster.id}` : `Cluster · ${signal.clusterIds[0]}`,
      href: `/clusters/${signal.clusterIds[0]}`,
    });
  }

  const relatedGroups: RelatedGroup[] = [
    {
      heading: "Sources",
      kind: "source",
      items: resolveItems(signal.sourceIds, sources, (s) => s.name),
      emptyNote: "No sources linked — evidence must be traceable to a source.",
    },
    {
      heading: "Original observation",
      kind: "observation",
      items: observation
        ? [{ id: observation.id, title: observation.title }]
        : signal.observationId
          ? [{ id: signal.observationId, title: signal.observationId }]
          : [],
      emptyNote: "Captured directly as a signal — no originating observation.",
    },
    {
      heading: "Related signals",
      kind: "signal",
      items: resolveItems(signal.relatedSignalIds, signals, (s) => s.title),
      emptyNote: "No related signals connected yet. Evidence gains meaning through relationships.",
    },
    {
      heading: "Clusters",
      kind: "cluster",
      items: resolveItems(signal.clusterIds, clusters, (c) => c.name),
      emptyNote: "Not yet part of any cluster candidate.",
    },
    {
      heading: "Patterns",
      kind: "pattern",
      items: resolveItems(signal.patternIds, patterns, (p) => p.name),
      emptyNote: "Not yet cited by any pattern.",
    },
    {
      heading: "Possible drivers",
      kind: "driver",
      items: resolveItems(signal.driverIds, drivers, (d) => d.name),
      emptyNote: "No driver hypothesis draws on this signal yet.",
    },
    {
      heading: "Contradictions",
      kind: "contradiction",
      items: resolveItems(signal.contradictionIds, contradictions, (c) => c.name),
      emptyNote: "No contradiction linked — check whether this reading is under-opposed.",
    },
    {
      heading: "Monitoring indicators",
      kind: "indicator",
      items: resolveItems(signal.monitoringIndicatorIds, indicators, (i) => i.name),
      emptyNote: "No monitoring indicator tracks this signal.",
    },
  ];

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader title={signal.title} />
      <p className="-mt-6 mb-8 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <IdChip id={signal.id} />
        <SignalStrengthBadge strength={signal.signalStrength} />
        <ConfidenceBadge level={signal.confidence} />
      </p>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="min-w-0">
          {mode === "simple" ? (
            <SimpleView
              signal={signal}
              sources={sources}
              contradictions={linkedContradictions}
            />
          ) : (
            <Tabs
              tabs={[
                { id: "overview", label: "Overview", content: <OverviewTab signal={signal} /> },
                {
                  id: "evidence",
                  label: "Evidence",
                  content: <EvidenceTab signal={signal} sources={sources} />,
                },
                {
                  id: "scoring",
                  label: "Scoring",
                  content: <ScoringTab signal={signal} sources={sources} />,
                },
                { id: "zooming", label: "Zooming", content: <ZoomingTab signal={signal} /> },
                { id: "systems", label: "Systems", content: <SystemsTab signal={signal} /> },
                {
                  id: "contradictions",
                  label: "Contradictions",
                  content:
                    linkedContradictions.length > 0 ? (
                      <div className="space-y-8">
                        {linkedContradictions.map((c) => (
                          <ContradictionPanel key={c.id} contradiction={c} />
                        ))}
                      </div>
                    ) : (
                      <NoContradictionNote />
                    ),
                },
                { id: "review", label: "Review", content: <ReviewTab signal={signal} /> },
              ]}
            />
          )}
        </div>
        <aside className="mt-10 space-y-8 lg:mt-0">
          {guidedMode ? <ReadingGuidePanel /> : null}
          <RelatedObjectsPanel groups={relatedGroups} />
        </aside>
      </div>
    </>
  );
}
