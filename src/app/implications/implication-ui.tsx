"use client";

/**
 * Page-local UI for /implications: the editorial implication entry and the
 * creation form. Nothing here is imported outside src/app/implications/.
 *
 * The discipline of this layer: an implication is what should be done
 * differently now because a future may be forming. Each entry reads as a
 * short editorial block — statement, stake, action, quiet metadata — with
 * analyst detail behind an indented disclosure, not a box.
 */

import { useState } from "react";
import { IdChip, ReviewStatusBadge } from "@/components/badges";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { EntityLink } from "@/components/EntityLink";
import { EvidenceTrail, type TrailStep } from "@/components/EvidenceTrail";
import { ViewGate, useViewMode } from "@/components/ViewMode";
import { CheckboxList, Field, Select, TextArea } from "@/components/form";
import { explainConfidenceGeneric, explainImplicationEvidence } from "@/lib/explain";
import { signalStage } from "@/lib/pipeline";
import { firstSentence } from "@/lib/simple";
import { nextId, useIntelligenceStore } from "@/lib/store";
import { modeAtLeast } from "@/lib/viewMode";
import { validateImplication } from "@/lib/validation";
import type {
  ConfidenceLevel,
  Driver,
  FutureTerritory,
  ImplicationAudience,
  ImplicationType,
  ReviewStatus,
  Scenario,
  Sector,
  Signal,
  StrategicImplication,
  TimeHorizon,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  IMPLICATION_AUDIENCE_LABELS,
  IMPLICATION_TYPE_LABELS,
  REVIEW_STATUS_LABELS,
  SECTOR_LABELS,
  TIME_HORIZON_LABELS,
} from "@/lib/types";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const btnPrimary =
  "rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink";
export const btnText =
  "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink hover:underline";

const REVIEW_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const SECTOR_OPTIONS = Object.keys(SECTOR_LABELS) as Sector[];
const AUDIENCE_OPTIONS = Object.keys(
  IMPLICATION_AUDIENCE_LABELS,
) as ImplicationAudience[];
const TYPE_OPTIONS = Object.keys(IMPLICATION_TYPE_LABELS) as ImplicationType[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];
const HORIZON_OPTIONS = Object.keys(TIME_HORIZON_LABELS) as TimeHorizon[];

// ---------------------------------------------------------------------------
// Editorial implication entry
// ---------------------------------------------------------------------------

/** Tiny faint label used inside the analyst disclosure. */
function DetailLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-[11px] text-ink-faint">{children}</p>;
}

export function ImplicationEntry({
  implication: imp,
  territory,
  scenario,
  evidenceSignals,
  evidenceDrivers,
}: {
  implication: StrategicImplication;
  territory: FutureTerritory | null;
  scenario: Scenario | null;
  evidenceSignals: Signal[];
  evidenceDrivers: Driver[];
}) {
  const [expanded, setExpanded] = useState(false);
  const updateImplication = useIntelligenceStore((s) => s.updateImplication);
  const sources = useIntelligenceStore((s) => s.sources);
  const mode = useViewMode();
  const analyst = modeAtLeast(mode, "analyst");

  const unresolvedSignals = imp.evidenceSignalIds.length - evidenceSignals.length;
  const unresolvedDrivers = imp.evidenceDriverIds.length - evidenceDrivers.length;
  const grounding = validateImplication(imp);

  // Evidence chain, top-down from the implication's actual links — steps are
  // never invented, so a thinly grounded implication shows a visibly short trail.
  const trailSteps: TrailStep[] = [
    { stage: "implication", title: firstSentence(imp.implication) || imp.id },
  ];
  if (scenario)
    trailSteps.push({
      stage: "scenario",
      title: scenario.title,
      href: `/scenarios/${scenario.id}`,
    });
  if (territory)
    trailSteps.push({
      stage: "territory",
      title: territory.name,
      href: `/territories/${territory.id}`,
    });
  for (const d of evidenceDrivers)
    trailSteps.push({ stage: "driver", title: d.name, href: `/drivers/${d.id}` });
  for (const s of evidenceSignals.slice(0, 3)) {
    trailSteps.push({
      stage: signalStage(s),
      title: s.title,
      href: `/signals/${s.id}`,
    });
    const firstSource = sources.find((src) => src.id === s.sourceIds[0]);
    if (firstSource)
      trailSteps.push({
        stage: "source",
        title: firstSource.name,
        href: `/sources/${firstSource.id}`,
      });
  }

  const metadata = [
    imp.audiences.length > 0
      ? imp.audiences.map((a) => IMPLICATION_AUDIENCE_LABELS[a]).join(", ")
      : null,
    imp.sectors.length > 0
      ? imp.sectors.map((s) => SECTOR_LABELS[s]).join(", ")
      : null,
    TIME_HORIZON_LABELS[imp.timeHorizon],
    explainConfidenceGeneric(imp.confidence, explainImplicationEvidence(imp)),
  ].filter((part): part is string => part !== null);

  return (
    <article className="list-row py-7">
      <p className="max-w-3xl text-[14px] font-medium leading-snug text-ink">
        {imp.implication.trim() ? (
          imp.implication
        ) : (
          <span className="text-[12.5px] font-normal text-ink-faint">
            No implication statement recorded — state what should be done
            differently now.
          </span>
        )}
      </p>

      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
        {imp.whyItMatters.trim() ? (
          imp.whyItMatters
        ) : (
          <span className="text-[12px] text-ink-faint">
            Why it matters is not recorded — an implication without a stated
            stake cannot be weighed against others.
          </span>
        )}
      </p>

      <p className="mt-2.5 max-w-2xl text-[13px] font-medium leading-relaxed text-ink">
        {imp.recommendedAction.trim() ? (
          <>Do now — {imp.recommendedAction}</>
        ) : (
          <span className="text-[12px] font-normal text-ink-faint">
            No action recorded yet — the implication is not usable until it
            names a concrete present-day step.
          </span>
        )}
      </p>

      <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-ink-faint">
        {metadata.join(" · ")}
        {analyst ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            className="ml-2.5 underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
          >
            {expanded ? "Hide details" : "Details"}
          </button>
        ) : null}
      </p>

      {analyst && expanded ? (
        <div className="mt-5 space-y-5 border-l border-line pl-5">
          <p className="text-[12px] text-ink-faint">
            {IMPLICATION_TYPE_LABELS[imp.implicationType]} · <IdChip id={imp.id} />
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <DetailLabel>Opportunity</DetailLabel>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                {imp.opportunity.trim() ? (
                  imp.opportunity
                ) : (
                  <span className="text-ink-faint">Not recorded.</span>
                )}
              </p>
            </div>
            <div>
              <DetailLabel>What could make this wrong</DetailLabel>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                {imp.risk.trim() ? (
                  imp.risk
                ) : (
                  <span className="text-ink-faint">Not recorded.</span>
                )}
              </p>
            </div>
          </div>

          <ValidationChecklist
            result={grounding}
            title="Implication grounding"
            passedLabel="Grounded"
            failedLabel="Needs grounding"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <DetailLabel>Future territory</DetailLabel>
              {territory ? (
                <EntityLink
                  kind="territory"
                  id={territory.id}
                  title={territory.name}
                />
              ) : imp.territoryId ? (
                <p className="text-[11.5px] text-ink-faint">
                  Territory <span className="font-mono">{imp.territoryId}</span>{" "}
                  no longer resolves in the intelligence base.
                </p>
              ) : (
                <p className="text-[11.5px] text-ink-faint">
                  Not connected to a territory.
                </p>
              )}
            </div>
            <div>
              <DetailLabel>Scenario</DetailLabel>
              {scenario ? (
                <EntityLink
                  kind="scenario"
                  id={scenario.id}
                  title={scenario.title}
                />
              ) : imp.scenarioId ? (
                <p className="text-[11.5px] text-ink-faint">
                  Scenario <span className="font-mono">{imp.scenarioId}</span>{" "}
                  no longer resolves in the intelligence base.
                </p>
              ) : (
                <p className="text-[11.5px] text-ink-faint">
                  Not connected to a scenario.
                </p>
              )}
            </div>
          </div>

          <div>
            <DetailLabel>Evidence signals</DetailLabel>
            {evidenceSignals.length > 0 ? (
              <div className="grid gap-1.5 sm:grid-cols-2">
                {evidenceSignals.map((s) => (
                  <EntityLink key={s.id} kind="signal" id={s.id} title={s.title} />
                ))}
              </div>
            ) : (
              <p className="text-[11.5px] text-ink-faint">
                No evidence signals linked — recommendations must trace back
                down the pyramid.
              </p>
            )}
            {unresolvedSignals > 0 ? (
              <p className="mt-1 text-[11px] text-ink-faint">
                {unresolvedSignals} linked signal id
                {unresolvedSignals === 1 ? "" : "s"} no longer resolve
                {unresolvedSignals === 1 ? "s" : ""}.
              </p>
            ) : null}
          </div>

          <div>
            <DetailLabel>Evidence drivers</DetailLabel>
            {evidenceDrivers.length > 0 ? (
              <div className="grid gap-1.5 sm:grid-cols-2">
                {evidenceDrivers.map((d) => (
                  <EntityLink key={d.id} kind="driver" id={d.id} title={d.name} />
                ))}
              </div>
            ) : (
              <p className="text-[11.5px] text-ink-faint">
                No evidence drivers linked.
              </p>
            )}
            {unresolvedDrivers > 0 ? (
              <p className="mt-1 text-[11px] text-ink-faint">
                {unresolvedDrivers} linked driver id
                {unresolvedDrivers === 1 ? "" : "s"} no longer resolve
                {unresolvedDrivers === 1 ? "s" : ""}.
              </p>
            ) : null}
          </div>

          <div>
            <DetailLabel>Evidence chain</DetailLabel>
            <EvidenceTrail steps={trailSteps} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ReviewStatusBadge status={imp.reviewStatus} />
            <label className="flex items-center gap-1.5 text-[11px] text-ink-faint">
              Set review status
              <select
                value={imp.reviewStatus}
                onChange={(e) =>
                  updateImplication(imp.id, {
                    reviewStatus: e.target.value as ReviewStatus,
                  })
                }
                className="cursor-pointer rounded-[4px] bg-surface-muted px-2 py-1 text-[12px] text-ink-soft focus:outline-none"
              >
                {REVIEW_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {REVIEW_STATUS_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
            <ViewGate min="methodology">
              <p className="text-[11px] text-ink-faint">
                Created {fmtDate(imp.createdAt)} · Updated {fmtDate(imp.updatedAt)}
              </p>
            </ViewGate>
          </div>
        </div>
      ) : null}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Creation form
// ---------------------------------------------------------------------------

/**
 * Field-shaped wrapper for checkbox groups. The shared Field renders a
 * <label>, which must not wrap the CheckboxList's own labels — this mirrors
 * its look with a plain div.
 */
function GroupField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="block text-[12.5px] font-medium text-ink-soft">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-[11.5px] text-ink-faint">{hint}</span>
      ) : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[11.5px] text-tension">{message}</p>;
}

/** Quiet in-form section heading — text, not a box. */
function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[13px] font-medium text-ink">{title}</h3>
      {hint ? <p className="mt-0.5 text-[12px] text-ink-faint">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

interface ImplicationDraft {
  territoryId: string;
  scenarioId: string;
  sectors: Sector[];
  audiences: ImplicationAudience[];
  implicationType: ImplicationType;
  implication: string;
  whyItMatters: string;
  opportunity: string;
  risk: string;
  recommendedAction: string;
  evidenceSignalIds: string[];
  evidenceDriverIds: string[];
  confidence: ConfidenceLevel;
  timeHorizon: TimeHorizon;
}

const INITIAL_DRAFT: ImplicationDraft = {
  territoryId: "",
  scenarioId: "",
  sectors: [],
  audiences: [],
  implicationType: "brand",
  implication: "",
  whyItMatters: "",
  opportunity: "",
  risk: "",
  recommendedAction: "",
  evidenceSignalIds: [],
  evidenceDriverIds: [],
  confidence: "low",
  timeHorizon: "near_term",
};

interface DraftErrors {
  anchor?: string;
  implication?: string;
  whyItMatters?: string;
  recommendedAction?: string;
}

export function ImplicationForm({ onClose }: { onClose: () => void }) {
  const territories = useIntelligenceStore((s) => s.territories);
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const signals = useIntelligenceStore((s) => s.signals);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const implications = useIntelligenceStore((s) => s.implications);
  const addImplication = useIntelligenceStore((s) => s.addImplication);

  const [draft, setDraft] = useState<ImplicationDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});

  const patch = (p: Partial<ImplicationDraft>) =>
    setDraft((d) => ({ ...d, ...p }));

  const scenarioOptions = draft.territoryId
    ? scenarios.filter((s) => s.territoryId === draft.territoryId)
    : scenarios;

  function handleTerritoryChange(territoryId: string) {
    setDraft((d) => {
      const chosen = scenarios.find((s) => s.id === d.scenarioId);
      const scenarioStillValid =
        !territoryId || !chosen || chosen.territoryId === territoryId;
      return {
        ...d,
        territoryId,
        scenarioId: scenarioStillValid ? d.scenarioId : "",
      };
    });
  }

  function handleSave() {
    const next: DraftErrors = {};
    if (!draft.territoryId && !draft.scenarioId)
      next.anchor =
        "Connect the implication to a territory or a scenario. Implications answer: what should we do differently because this future may be forming?";
    if (!draft.implication.trim())
      next.implication = "State the implication before saving.";
    if (!draft.whyItMatters.trim())
      next.whyItMatters = "Record why this matters before saving.";
    if (!draft.recommendedAction.trim())
      next.recommendedAction =
        "Record a concrete present-day action before saving.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const now = new Date().toISOString();
    addImplication({
      id: nextId("IMP", implications),
      territoryId: draft.territoryId || null,
      scenarioId: draft.scenarioId || null,
      sectors: draft.sectors,
      audiences: draft.audiences,
      implicationType: draft.implicationType,
      implication: draft.implication.trim(),
      whyItMatters: draft.whyItMatters.trim(),
      evidenceSignalIds: draft.evidenceSignalIds,
      evidenceDriverIds: draft.evidenceDriverIds,
      opportunity: draft.opportunity.trim(),
      risk: draft.risk.trim(),
      recommendedAction: draft.recommendedAction.trim(),
      confidence: draft.confidence,
      timeHorizon: draft.timeHorizon,
      reviewStatus: "draft",
      createdAt: now,
      updatedAt: now,
    });
    setDraft(INITIAL_DRAFT);
    setErrors({});
    onClose();
  }

  return (
    <section className="mb-10 border-b border-line pb-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-medium text-ink">
          New strategic implication
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[12px] text-ink-faint hover:text-ink"
        >
          Close
        </button>
      </div>
      <p className="mt-1 max-w-2xl text-[12px] text-ink-faint">
        An implication answers: what should we do differently because this
        future may be forming? It is anchored to a territory or scenario and
        traces back to evidence.
      </p>

      <div className="mt-6 max-w-3xl space-y-7">
        <FormSection
          title="Anchor"
          hint="The future this implication responds to."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Future territory">
              <Select
                value={draft.territoryId}
                onChange={(e) => handleTerritoryChange(e.target.value)}
              >
                <option value="">None</option>
                {territories.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id} · {t.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Scenario"
              hint={
                draft.territoryId
                  ? "Scenarios built on the chosen territory."
                  : "Choose a territory to narrow this list."
              }
            >
              <Select
                value={draft.scenarioId}
                onChange={(e) => patch({ scenarioId: e.target.value })}
              >
                <option value="">None</option>
                {scenarioOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} · {s.title}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <InlineError message={errors.anchor} />
        </FormSection>

        <FormSection
          title="Statement"
          hint="The deliverable of the whole pipeline: what, why, and the present-day step."
        >
          <div className="space-y-4">
            <div>
              <Field
                label="Implication"
                required
                hint="One clear statement of what this future means for the audiences named below."
              >
                <TextArea
                  value={draft.implication}
                  onChange={(e) => patch({ implication: e.target.value })}
                  placeholder="Because this future may be forming, …"
                />
              </Field>
              <InlineError message={errors.implication} />
            </div>
            <div>
              <Field
                label="Why it matters"
                required
                hint="The stake: what is gained or lost if this future forms."
              >
                <TextArea
                  value={draft.whyItMatters}
                  onChange={(e) => patch({ whyItMatters: e.target.value })}
                />
              </Field>
              <InlineError message={errors.whyItMatters} />
            </div>
            <div>
              <Field
                label="Recommended action"
                required
                hint="Concrete and present-day. Avoid vague recommendations."
              >
                <TextArea
                  value={draft.recommendedAction}
                  onChange={(e) => patch({ recommendedAction: e.target.value })}
                />
              </Field>
              <InlineError message={errors.recommendedAction} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Scope">
          <div className="grid gap-4 lg:grid-cols-2">
            <GroupField label="Audiences" hint="Who should act on it.">
              <CheckboxList
                options={AUDIENCE_OPTIONS.map((a) => ({
                  value: a,
                  label: IMPLICATION_AUDIENCE_LABELS[a],
                }))}
                selected={draft.audiences}
                onChange={(audiences) => patch({ audiences })}
              />
            </GroupField>
            <GroupField label="Sectors" hint="Where the implication lands.">
              <CheckboxList
                options={SECTOR_OPTIONS.map((s) => ({
                  value: s,
                  label: SECTOR_LABELS[s],
                }))}
                selected={draft.sectors}
                onChange={(sectors) => patch({ sectors })}
              />
            </GroupField>
          </div>
          <div className="mt-4 max-w-xs">
            <Field label="Time horizon">
              <Select
                value={draft.timeHorizon}
                onChange={(e) =>
                  patch({ timeHorizon: e.target.value as TimeHorizon })
                }
              >
                {HORIZON_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {TIME_HORIZON_LABELS[h]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </FormSection>

        <ViewGate
          min="analyst"
          fallback={
            <p className="text-[11.5px] text-ink-faint">
              Classification, confidence, opportunity/risk and evidence linking
              complete in Analyst view — the implication saves as a draft and is
              flagged as needing grounding until evidence is linked.
            </p>
          }
        >
          <FormSection
            title="Classification and evidence"
            hint="Analyst detail — completes the grounding the checklist tests for."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Implication type" required>
                <Select
                  value={draft.implicationType}
                  onChange={(e) =>
                    patch({ implicationType: e.target.value as ImplicationType })
                  }
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {IMPLICATION_TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Confidence">
                <Select
                  value={draft.confidence}
                  onChange={(e) =>
                    patch({ confidence: e.target.value as ConfidenceLevel })
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Opportunity" hint="What acting early makes possible.">
                <TextArea
                  value={draft.opportunity}
                  onChange={(e) => patch({ opportunity: e.target.value })}
                />
              </Field>
              <Field label="Risk" hint="What ignoring this future would cost.">
                <TextArea
                  value={draft.risk}
                  onChange={(e) => patch({ risk: e.target.value })}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <GroupField
                label="Evidence signals"
                hint="Signals this recommendation traces back to."
              >
                {signals.length > 0 ? (
                  <div className="max-h-44 overflow-y-auto border-l border-line pl-3">
                    <CheckboxList
                      columns={1}
                      options={signals.map((s) => ({
                        value: s.id,
                        label: `${s.id} · ${s.title}`,
                      }))}
                      selected={draft.evidenceSignalIds}
                      onChange={(evidenceSignalIds) =>
                        patch({ evidenceSignalIds })
                      }
                    />
                  </div>
                ) : (
                  <p className="text-[11.5px] text-ink-faint">
                    No signals in the intelligence base yet.
                  </p>
                )}
              </GroupField>
              <GroupField
                label="Evidence drivers"
                hint="Drivers that explain why this future is forming."
              >
                {drivers.length > 0 ? (
                  <div className="max-h-44 overflow-y-auto border-l border-line pl-3">
                    <CheckboxList
                      columns={1}
                      options={drivers.map((d) => ({
                        value: d.id,
                        label: `${d.id} · ${d.name}`,
                      }))}
                      selected={draft.evidenceDriverIds}
                      onChange={(evidenceDriverIds) =>
                        patch({ evidenceDriverIds })
                      }
                    />
                  </div>
                ) : (
                  <p className="text-[11.5px] text-ink-faint">
                    No drivers in the intelligence base yet.
                  </p>
                )}
              </GroupField>
            </div>
          </FormSection>
        </ViewGate>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          <button type="button" onClick={handleSave} className={btnPrimary}>
            Save implication
          </button>
          <button type="button" onClick={onClose} className={btnText}>
            Cancel
          </button>
          <p className="text-[11px] text-ink-faint">
            Saves as a draft — raise the review status once evidence links have
            been checked.
          </p>
        </div>
      </div>
    </section>
  );
}
