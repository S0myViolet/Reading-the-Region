"use client";

/**
 * Observation detail — the full captured record on the left, the triage
 * panel on the right. Triage decides whether the observation is promoted
 * to a signal (minimum 3 of 9 criteria), archived as noise, held for more
 * evidence, marked duplicate, split, or merged. Every filtering decision
 * requires a rationale so the noise archive stays auditable.
 */

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { DemoTag, IdChip, SourceCredibilityBadge } from "@/components/badges";
import { SectorTags, SourceBiasTags } from "@/components/tags";
import { EntityLink, RelatedObjectsPanel } from "@/components/EntityLink";
import { CheckboxList, TextArea, TextInput } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  canPromoteObservation,
  promotionCriteriaMet,
} from "@/lib/validation";
import type {
  Observation,
  ObservationStatus,
  PromotionChecklist,
} from "@/lib/types";
import {
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";
import {
  EMPTY_CHECKLIST,
  ObservationStatusPill,
  btnPrimary,
  btnSecondary,
  fmtDate,
} from "../observation-ui";

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
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h2 className="overline-label">Triage — promotion checklist</h2>
      </header>
      <div className="space-y-3 px-4 py-3">
        <CheckboxList<keyof PromotionChecklist>
          options={PROMOTION_CRITERIA.map((c) => ({ value: c.key, label: c.label }))}
          selected={PROMOTION_CRITERIA.filter((c) => obs.checklist[c.key]).map(
            (c) => c.key,
          )}
          onChange={(next) =>
            updateObservation(obs.id, {
              checklist: PROMOTION_CRITERIA.reduce(
                (acc, c) => ({ ...acc, [c.key]: next.includes(c.key) }),
                { ...EMPTY_CHECKLIST },
              ),
            })
          }
          columns={1}
        />
        <p
          className={`border-t border-line pt-2.5 font-mono text-[11.5px] ${
            promotable ? "text-accent-ink" : "text-ink-faint"
          }`}
        >
          {met} of {total} criteria met — minimum {PROMOTION_MIN_CRITERIA} to promote
        </p>

        {obs.status === "promoted" ? (
          <p className="text-[11.5px] text-ink-faint">
            Triage is complete — this observation was promoted. Further evidence work
            happens on the signal.
          </p>
        ) : (
          <div className="space-y-2">
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
                  className="w-full cursor-not-allowed border border-line bg-surface-muted px-3 py-1.5 text-[12.5px] text-ink-faint rounded-[2px]"
                >
                  Promote to signal
                </button>
                <p className="mt-1 text-[11px] text-ink-faint">
                  Promotion is locked: only {met} of {total} criteria hold, and at
                  least {PROMOTION_MIN_CRITERIA} are required. Tick only the criteria
                  that genuinely apply — an observation is not promoted just because
                  it is interesting.
                </p>
              </div>
            )}

            {TRIAGE_ACTIONS.map((action) => (
              <div key={action.key}>
                <button
                  type="button"
                  onClick={() => openAction(action.key)}
                  className={`${btnSecondary} block w-full text-center`}
                >
                  {action.label}
                </button>
                {activeAction === action.key ? (
                  <div className="mt-2 space-y-2 border border-line bg-surface-muted/40 p-2.5 rounded-[2px]">
                    <p className="text-[11.5px] text-ink-soft">{action.prompt}</p>
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
                    <div className="flex gap-2">
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

            {obs.status === "split" ? (
              <p className="text-[11.5px] text-ink-faint">
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
          </div>
        )}
      </div>
    </section>
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
        <PageHeader overline="Scan & Classify" title="Observation" />
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
        <PageHeader overline="Scan & Classify" title="Observation not found" />
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
        overline="Scan & Classify · Observation"
        title={obs.title}
        actions={<ObservationStatusPill status={obs.status} />}
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        {/* Left column — the full captured record */}
        <div className="space-y-4">
          {obs.status === "promoted" && obs.promotedSignalId ? (
            <div className="card border-l-2 border-l-accent px-4 py-3">
              <p className="overline-label mb-1 text-accent-ink">Promoted</p>
              <p className="mb-2 text-[12.5px] text-ink-soft">
                This observation was promoted — the signal now carries the evidence
                forward.
              </p>
              <EntityLink
                kind="signal"
                id={obs.promotedSignalId}
                title={promotedSignal?.title ?? "Promoted signal"}
              />
            </div>
          ) : null}

          {obs.status !== "promoted" && obs.triageRationale ? (
            <div className="card border-l-2 border-l-caution px-4 py-3">
              <p className="overline-label mb-1">{rationaleHeading}</p>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                {obs.triageRationale}
              </p>
            </div>
          ) : null}

          <section className="card">
            <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <h2 className="overline-label">Observation record</h2>
              <IdChip id={obs.id} />
            </header>
            <div className="space-y-4 px-4 py-4">
              <div>
                <p className="overline-label mb-1">Description</p>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {obs.description}
                </p>
              </div>

              <div>
                <p className="overline-label mb-1">Source</p>
                <div className="border border-line bg-surface-muted/40 px-3 py-2.5 rounded-[2px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[13px] font-medium text-ink">
                      {obs.sourceName}
                    </span>
                    {source ? (
                      <SourceCredibilityBadge score={source.credibility} />
                    ) : null}
                    {source?.isDemo ? <DemoTag /> : null}
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-ink-faint">
                    {SOURCE_TYPE_LABELS[obs.sourceType]}
                  </p>
                  {source ? (
                    <div className="mt-1.5">
                      <SourceBiasTags tags={source.biasTags} />
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-ink-faint">
                      Quick-capture source — not yet registered in the source
                      library, so credibility and bias are unassessed.
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    {obs.sourceUrl ? (
                      <a
                        href={obs.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-[11.5px] text-accent-ink underline decoration-line-strong underline-offset-2 hover:text-accent"
                      >
                        {obs.sourceUrl}
                      </a>
                    ) : null}
                    {source ? (
                      <Link
                        href={`/sources/${source.id}`}
                        className="text-[11.5px] text-accent-ink hover:underline"
                      >
                        Source record · <span className="font-mono">{source.id}</span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="overline-label">Date observed</dt>
                  <dd className="mt-0.5 text-[12.5px] text-ink-soft">
                    {fmtDate(obs.dateObserved)}
                  </dd>
                </div>
                <div>
                  <dt className="overline-label">Event date</dt>
                  <dd className="mt-0.5 text-[12.5px] text-ink-soft">
                    {obs.eventDate ? (
                      fmtDate(obs.eventDate)
                    ) : (
                      <span className="text-ink-faint">Not recorded</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="overline-label">Region</dt>
                  <dd className="mt-0.5 text-[12.5px] text-ink-soft">{obs.region}</dd>
                </div>
                <div>
                  <dt className="overline-label">Country / city</dt>
                  <dd className="mt-0.5 text-[12.5px] text-ink-soft">
                    {obs.country}
                    {obs.city ? ` · ${obs.city}` : ""}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="overline-label">Sectors</dt>
                  <dd className="mt-1">
                    {obs.sectors.length > 0 ? (
                      <SectorTags sectors={obs.sectors} />
                    ) : (
                      <span className="text-[11.5px] text-ink-faint">
                        No sectors assigned yet.
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="overline-label">Subsector</dt>
                  <dd className="mt-0.5 text-[12.5px] text-ink-soft">
                    {obs.subsector ?? (
                      <span className="text-ink-faint">Not recorded</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="overline-label">Actor involved</dt>
                  <dd className="mt-0.5 text-[12.5px] text-ink-soft">
                    {obs.actorInvolved ?? (
                      <span className="text-ink-faint">Not recorded</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div>
                <p className="overline-label mb-1">Initial notes</p>
                {obs.initialNotes ? (
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    {obs.initialNotes}
                  </p>
                ) : (
                  <p className="text-[11.5px] text-ink-faint">No notes at capture.</p>
                )}
              </div>
              <div>
                <p className="overline-label mb-1">Potential future relevance</p>
                {obs.potentialFutureRelevance ? (
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    {obs.potentialFutureRelevance}
                  </p>
                ) : (
                  <p className="text-[11.5px] text-ink-faint">
                    Not stated. If no future relevance can be articulated during
                    triage, consider archiving as noise.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right column — triage and relationship trail */}
        <div className="mt-4 space-y-4 lg:mt-0">
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
