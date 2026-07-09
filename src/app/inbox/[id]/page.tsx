"use client";

/**
 * Observation detail — the captured record reads as an article on the left;
 * the triage panel on the right is the page's task. Triage decides whether
 * the observation is promoted to a signal (minimum 3 of 9 criteria),
 * archived as noise, held for more evidence, marked duplicate, split, or
 * merged. Every filtering decision requires a rationale so the noise
 * archive stays auditable.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { DemoTag, IdChip, SourceCredibilityBadge } from "@/components/badges";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import { DepthHint, ViewGate } from "@/components/ViewMode";
import { SectorTags, SourceBiasTags } from "@/components/tags";
import { EntityLink, RelatedObjectsPanel } from "@/components/EntityLink";
import { FreshnessLine, SourceLine } from "@/components/freshness";
import { TextArea, TextInput } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { observationEvidenceAt } from "@/lib/freshness";
import { suggestedStage, TRIAGE_LABELS } from "@/lib/pipeline";
import {
  canPromoteObservation,
  promotionCriteriaMet,
} from "@/lib/validation";
import type { Observation, ObservationStatus, Source } from "@/lib/types";
import {
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";
import { ObservationStatusPill, btnPrimary, btnSecondary, fmtDate } from "../observation-ui";

// ---------------------------------------------------------------------------
// Triage actions requiring a rationale
// ---------------------------------------------------------------------------

type TriageActionKey = "archive" | "needs_evidence" | "duplicate" | "split" | "merge";

const TRIAGE_ACTIONS: Array<{
  key: TriageActionKey;
  label: string;
  status: ObservationStatus;
  prompt: string;
}> = [
  {
    key: "archive",
    label: "Archive as noise",
    status: "archived_noise",
    prompt:
      "Why is this noise rather than a signal? The rationale is kept in the noise archive so filtering stays auditable.",
  },
  {
    key: "needs_evidence",
    label: "Needs more evidence",
    status: "needs_more_evidence",
    prompt:
      "What evidence is missing before this observation can be judged, and where would it come from?",
  },
  {
    key: "duplicate",
    label: "Mark duplicate",
    status: "duplicate",
    prompt:
      "Which existing observation or signal does this duplicate? Name it so the decision can be traced.",
  },
  {
    key: "split",
    label: "Split into multiple signals",
    status: "split",
    prompt:
      "What distinct signals does this observation contain? List them — each will be created separately.",
  },
  {
    key: "merge",
    label: "Merge with existing observation",
    status: "merged",
    prompt: "Why merge, and what does the target observation gain from this one?",
  },
];

function TriagePanel({ obs }: { obs: Observation }) {
  const updateObservation = useIntelligenceStore((s) => s.updateObservation);
  const setObservationStatus = useIntelligenceStore((s) => s.setObservationStatus);
  const [activeAction, setActiveAction] = useState<TriageActionKey | null>(null);
  const [rationale, setRationale] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  const met = promotionCriteriaMet(obs);
  const total = PROMOTION_CRITERIA.length;
  const promotable = canPromoteObservation(obs);
  const suggestion = suggestedStage(obs);

  function openAction(key: TriageActionKey) {
    setActiveAction((cur) => (cur === key ? null : key));
    setRationale("");
    setMergeTarget("");
    setError(null);
  }

  function confirmAction(action: (typeof TRIAGE_ACTIONS)[number]) {
    const text = rationale.trim();
    if (!text) {
      setError("A rationale is required — triage decisions must stay auditable.");
      return;
    }
    if (action.key === "merge") {
      const target = mergeTarget.trim();
      if (!target) {
        setError("Name the target observation id (e.g. OBS-004).");
        return;
      }
      setObservationStatus(obs.id, "merged", `Merged into ${target}. ${text}`);
    } else {
      setObservationStatus(obs.id, action.status, text);
    }
    setActiveAction(null);
    setRationale("");
    setMergeTarget("");
    setError(null);
  }

  return (
    <section aria-label="Triage">
      <h2 className="text-[13px] font-medium text-ink">Triage</h2>
      <p className="mt-0.5 text-[12px] text-ink-faint">
        Tick the promotion criteria that genuinely hold, then decide.
      </p>

      <ViewGate min="analyst">
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
          The engine&apos;s read:{" "}
          <span
            className={`font-medium ${
              suggestion === "signal_candidate" ? "text-accent-ink" : "text-ink"
            }`}
          >
            {TRIAGE_LABELS[suggestion]}
          </span>{" "}
          — {met} of {total} criteria.
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-faint">
          Observations carry no numeric scores — scoring completes at signal
          promotion.
        </p>
      </ViewGate>

      <div className="mt-4 space-y-2">
        {PROMOTION_CRITERIA.map((c) => (
          <label
            key={c.key}
            className="flex items-start gap-2 text-[12.5px] leading-snug text-ink-soft"
          >
            <input
              type="checkbox"
              checked={obs.checklist[c.key]}
              onChange={(e) =>
                updateObservation(obs.id, {
                  checklist: { ...obs.checklist, [c.key]: e.target.checked },
                })
              }
              className="mt-0.5 accent-[#29513f]"
            />
            {c.label}
          </label>
        ))}
      </div>

      <p
        className={`mt-3 text-[12px] ${
          promotable ? "text-accent-ink" : "text-ink-faint"
        }`}
      >
        {met} of {total} criteria met — minimum {PROMOTION_MIN_CRITERIA} to promote
      </p>

      {obs.status === "promoted" ? (
        <p className="mt-4 text-[12px] leading-relaxed text-ink-faint">
          Triage is complete — this observation was promoted. Further evidence
          work happens on the signal.
        </p>
      ) : (
        <>
          <div className="mt-4">
            {promotable ? (
              <Link
                href={`/signals/new?fromObservation=${obs.id}`}
                className={`${btnPrimary} block w-full text-center`}
              >
                Promote to signal
              </Link>
            ) : (
              <div>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-[4px] bg-surface-muted px-3.5 py-1.5 text-[12.5px] text-ink-faint"
                >
                  Promote to signal
                </button>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-faint">
                  Promotion is locked: only {met} of {total} criteria hold, and at
                  least {PROMOTION_MIN_CRITERIA} are required. Tick only the criteria
                  that genuinely apply — an observation is not promoted just because
                  it is interesting.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-[11px] text-ink-faint">Or file it instead</p>
            <div className="mt-1.5 space-y-1">
              {TRIAGE_ACTIONS.map((action) => (
                <div key={action.key}>
                  <button
                    type="button"
                    onClick={() => openAction(action.key)}
                    aria-expanded={activeAction === action.key}
                    className={`block py-0.5 text-left text-[12.5px] underline-offset-2 hover:underline ${
                      activeAction === action.key
                        ? "text-ink"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {action.label}
                  </button>
                  {activeAction === action.key ? (
                    <div className="mb-4 mt-2 space-y-2 border-l-2 border-line pl-3">
                      <p className="text-[11.5px] leading-relaxed text-ink-faint">
                        {action.prompt}
                      </p>
                      {action.key === "merge" ? (
                        <TextInput
                          value={mergeTarget}
                          onChange={(e) => setMergeTarget(e.target.value)}
                          placeholder="Target observation id, e.g. OBS-004"
                        />
                      ) : null}
                      <TextArea
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Rationale (required)"
                        rows={3}
                      />
                      {error ? (
                        <p className="text-[11.5px] text-tension">{error}</p>
                      ) : null}
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => confirmAction(action)}
                          className={btnPrimary}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveAction(null)}
                          className={btnSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {obs.status === "split" ? (
            <p className="mt-4 text-[11.5px] leading-relaxed text-ink-faint">
              This observation was split. Create each resulting signal from{" "}
              <Link
                href="/signals/new"
                className="text-accent-ink underline decoration-line-strong underline-offset-2 hover:text-accent"
              >
                Signals → New signal
              </Link>{" "}
              so every part carries its own evidence and scores.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Evidence freshness (advanced) — real dates only: the source line, the
// evidence age, and a "Mark as checked now" action that records a human look.
// ---------------------------------------------------------------------------

function EvidenceFreshness({
  obs,
  source,
}: {
  obs: Observation;
  source: Source | null;
}) {
  const updateObservation = useIntelligenceStore((s) => s.updateObservation);
  return (
    <section aria-label="Evidence freshness" className="space-y-1.5">
      <SourceLine
        source={source}
        publishedAt={obs.eventDate ?? obs.dateObserved}
      />
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <FreshnessLine
          latest={observationEvidenceAt(obs)}
          checkedAt={obs.lastCheckedAt ?? null}
        />
        <button
          type="button"
          onClick={() =>
            updateObservation(obs.id, { lastCheckedAt: new Date().toISOString() })
          }
          title="Records that a human looked at this observation just now — nothing else changes."
          className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
        >
          Mark as checked now
        </button>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Calm labelled fact for the record's definition block
// ---------------------------------------------------------------------------

function Fact({
  label,
  wide = false,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] text-ink-faint">{label}</dt>
      <dd className="mt-1 text-[13px] leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rationale display for filtered observations
// ---------------------------------------------------------------------------

const RATIONALE_HEADINGS: Partial<Record<ObservationStatus, string>> = {
  archived_noise: "Why this was filtered as noise",
  duplicate: "Why this was marked as a duplicate",
  needs_more_evidence: "What evidence is still needed",
  split: "Why this was split",
  merged: "Why this was merged",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ObservationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const hydrated = useHydrated();
  const observations = useIntelligenceStore((s) => s.observations);
  const sources = useIntelligenceStore((s) => s.sources);
  const signals = useIntelligenceStore((s) => s.signals);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Scan Inbox", href: "/inbox" }, { label: "Observation" }]}
        />
        <PageHeader title="Observation" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const obs = observations.find((o) => o.id === id);
  if (!obs) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Scan Inbox", href: "/inbox" }, { label: id || "Unknown" }]}
        />
        <PageHeader title="Observation not found" />
        <EmptyState
          message={`No observation with id “${id}” exists in the intelligence base. It may have been removed by a data reset, or the id may be mistyped. Return to the Scan Inbox to review current observations or capture a new one.`}
          actionLabel="Back to Scan Inbox"
          actionHref="/inbox"
        />
      </>
    );
  }

  const source = obs.sourceId
    ? sources.find((s) => s.id === obs.sourceId) ?? null
    : null;
  const promotedSignal = obs.promotedSignalId
    ? signals.find((s) => s.id === obs.promotedSignalId) ?? null
    : null;
  const rationaleHeading = RATIONALE_HEADINGS[obs.status] ?? "Triage rationale";

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Scan Inbox", href: "/inbox" }, { label: obs.title }]}
      />
      <PageHeader
        title={obs.title}
        actions={
          <>
            <PipelineStageBadge stage="observation" />
            <ObservationStatusPill status={obs.status} />
          </>
        }
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        {/* Left column — the captured record, read as an article */}
        <div className="space-y-8">
          <ViewGate min="analyst">
            <EvidenceFreshness obs={obs} source={source} />
          </ViewGate>

          {obs.status === "promoted" && obs.promotedSignalId ? (
            <section className="border-l-2 border-accent pl-4">
              <p className="text-[13px] leading-relaxed text-ink-soft">
                This observation was promoted — the signal now carries the
                evidence forward.
              </p>
              <div className="mt-1.5">
                <EntityLink
                  kind="signal"
                  id={obs.promotedSignalId}
                  title={promotedSignal?.title ?? "Promoted signal"}
                />
              </div>
            </section>
          ) : null}

          {obs.status !== "promoted" && obs.triageRationale ? (
            <section className="border-l-2 border-caution pl-4">
              <h2 className="text-[13px] font-medium text-ink">{rationaleHeading}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                {obs.triageRationale}
              </p>
            </section>
          ) : null}

          <p className="max-w-prose text-[13.5px] leading-relaxed text-ink-soft">
            {obs.description}
          </p>

          <section aria-label="Record details">
            <h2 className="text-[13px] font-medium text-ink">Record</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Fact label="Source" wide>
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium text-ink">{obs.sourceName}</span>
                  {source ? (
                    <SourceCredibilityBadge score={source.credibility} />
                  ) : null}
                  {source?.isDemo ? <DemoTag /> : null}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-ink-faint">
                  {SOURCE_TYPE_LABELS[obs.sourceType]}
                  {source ? (
                    <>
                      {" · "}
                      <Link
                        href={`/sources/${source.id}`}
                        className="hover:text-accent-ink hover:underline"
                      >
                        source record <span className="font-mono">{source.id}</span>
                      </Link>
                    </>
                  ) : (
                    " · quick capture — credibility and bias not yet assessed"
                  )}
                </span>
                {obs.sourceUrl ? (
                  <a
                    href={obs.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block break-all text-[11.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:text-accent"
                  >
                    {obs.sourceUrl}
                  </a>
                ) : null}
                {source ? (
                  <ViewGate min="analyst">
                    <span className="mt-1.5 block">
                      <SourceBiasTags tags={source.biasTags} />
                    </span>
                  </ViewGate>
                ) : null}
              </Fact>
              <Fact label="Date observed">{fmtDate(obs.dateObserved)}</Fact>
              <Fact label="Event date">
                {obs.eventDate ? (
                  fmtDate(obs.eventDate)
                ) : (
                  <span className="text-ink-faint">Not recorded</span>
                )}
              </Fact>
              <Fact label="Region">{obs.region}</Fact>
              <Fact label="Country / city">
                {obs.country}
                {obs.city ? ` · ${obs.city}` : ""}
              </Fact>
              <Fact label="Sectors" wide>
                {obs.sectors.length > 0 ? (
                  <SectorTags sectors={obs.sectors} />
                ) : (
                  <span className="text-ink-faint">No sectors assigned yet.</span>
                )}
              </Fact>
              <Fact label="Subsector">
                {obs.subsector ?? <span className="text-ink-faint">Not recorded</span>}
              </Fact>
              <Fact label="Actor involved">
                {obs.actorInvolved ?? (
                  <span className="text-ink-faint">Not recorded</span>
                )}
              </Fact>
              <Fact label="Record id">
                <IdChip id={obs.id} />
              </Fact>
            </dl>
          </section>

          <section aria-label="Initial notes">
            <h2 className="text-[13px] font-medium text-ink">Initial notes</h2>
            {obs.initialNotes ? (
              <p className="mt-1.5 max-w-prose text-[13px] leading-relaxed text-ink-soft">
                {obs.initialNotes}
              </p>
            ) : (
              <p className="mt-1.5 text-[11.5px] text-ink-faint">
                No notes at capture.
              </p>
            )}
          </section>

          <section aria-label="Potential future relevance">
            <h2 className="text-[13px] font-medium text-ink">
              Potential future relevance
            </h2>
            {obs.potentialFutureRelevance ? (
              <p className="mt-1.5 max-w-prose text-[13px] leading-relaxed text-ink-soft">
                {obs.potentialFutureRelevance}
              </p>
            ) : (
              <p className="mt-1.5 text-[11.5px] text-ink-faint">
                Not stated. If no future relevance can be articulated during
                triage, consider archiving as noise.
              </p>
            )}
          </section>

          <DepthHint>Source bias tags and credibility detail</DepthHint>
        </div>

        {/* Right column — triage (the page's task) and relationship trail */}
        <div className="mt-10 space-y-10 lg:mt-0">
          <TriagePanel obs={obs} />
          <RelatedObjectsPanel
            groups={[
              {
                heading: "Source",
                kind: "source",
                items: source ? [{ id: source.id, title: source.name }] : [],
                emptyNote:
                  "No registered source — captured with a quick source name only.",
              },
              {
                heading: "Promoted signal",
                kind: "signal",
                items:
                  obs.promotedSignalId != null
                    ? [
                        {
                          id: obs.promotedSignalId,
                          title: promotedSignal?.title ?? "Promoted signal",
                        },
                      ]
                    : [],
                emptyNote:
                  "Not promoted. An observation becomes a signal only after passing the promotion checklist.",
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
