"use client";

/**
 * Page-local UI for /implications: the expandable implication card and the
 * creation form. Nothing here is imported outside src/app/implications/.
 *
 * The discipline of this layer: an implication is what should be done
 * differently now because a future may be forming. Every card states its
 * evidence links honestly and carries a bordered "Recommended action" block —
 * the deliverable of the whole pipeline.
 */

import Link from "next/link";
import { useState } from "react";
import {
  ConfidenceBadge,
  IdChip,
  Pill,
  ReviewStatusBadge,
} from "@/components/badges";
import { SectorTags } from "@/components/tags";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { EntityLink } from "@/components/EntityLink";
import { CheckboxList, Field, Select, TextArea } from "@/components/form";
import { nextId, useIntelligenceStore } from "@/lib/store";
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
  TIME_HORIZON_SHORT,
} from "@/lib/types";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const REVIEW_OPTIONS = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
const SECTOR_OPTIONS = Object.keys(SECTOR_LABELS) as Sector[];
const AUDIENCE_OPTIONS = Object.keys(
  IMPLICATION_AUDIENCE_LABELS,
) as ImplicationAudience[];
const TYPE_OPTIONS = Object.keys(IMPLICATION_TYPE_LABELS) as ImplicationType[];
const CONFIDENCE_OPTIONS = Object.keys(CONFIDENCE_LABELS) as ConfidenceLevel[];
const HORIZON_OPTIONS = Object.keys(TIME_HORIZON_LABELS) as TimeHorizon[];

// ---------------------------------------------------------------------------
// Expandable implication card
// ---------------------------------------------------------------------------

function CompactLink({
  href,
  overline,
  id,
  title,
}: {
  href: string;
  overline: string;
  id: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex max-w-full items-baseline gap-1.5 text-[11.5px] text-ink-soft hover:text-accent-ink"
    >
      <span className="overline-label shrink-0">{overline}</span>
      <span className="font-mono text-[10.5px] text-ink-faint">{id}</span>
      <span className="truncate underline decoration-line-strong underline-offset-2">
        {title}
      </span>
    </Link>
  );
}

export function ImplicationCard({
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

  const evidenceCount =
    imp.evidenceSignalIds.length + imp.evidenceDriverIds.length;
  const unresolvedSignals = imp.evidenceSignalIds.length - evidenceSignals.length;
  const unresolvedDrivers = imp.evidenceDriverIds.length - evidenceDrivers.length;
  const grounding = validateImplication(imp);

  return (
    <article className="card">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className="block w-full px-4 pt-3 text-left"
        title={expanded ? "Collapse details" : "Expand details"}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="flex flex-wrap items-center gap-1.5">
            <Pill tone="info">{IMPLICATION_TYPE_LABELS[imp.implicationType]}</Pill>
            {imp.audiences.map((a) => (
              <Pill key={a}>{IMPLICATION_AUDIENCE_LABELS[a]}</Pill>
            ))}
          </span>
          <span className="flex shrink-0 flex-wrap items-center gap-1.5">
            <ConfidenceBadge level={imp.confidence} />
            <Pill title={TIME_HORIZON_LABELS[imp.timeHorizon]}>
              {TIME_HORIZON_SHORT[imp.timeHorizon]}
            </Pill>
          </span>
        </div>
        <p className="mt-2">
          <IdChip id={imp.id} />
        </p>
        <p className="mt-0.5 font-display text-[16px] leading-snug text-ink">
          {imp.implication.trim() ? (
            imp.implication
          ) : (
            <span className="text-[12.5px] text-ink-faint">
              No implication statement recorded — state what should be done
              differently now.
            </span>
          )}
        </p>
      </button>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 pb-3 pt-2">
        {imp.sectors.length > 0 ? (
          <SectorTags sectors={imp.sectors} linked={false} />
        ) : null}
        {evidenceCount > 0 ? (
          <span className="font-mono text-[11px] text-ink-soft">
            {evidenceCount} evidence link{evidenceCount === 1 ? "" : "s"}
          </span>
        ) : (
          <Pill
            tone="caution"
            title="Recommendations must connect back to signals or drivers."
          >
            <span className="font-mono">no evidence links</span>
          </Pill>
        )}
        {territory ? (
          <CompactLink
            href={`/territories/${territory.id}`}
            overline="Territory"
            id={territory.id}
            title={territory.name}
          />
        ) : null}
        {scenario ? (
          <CompactLink
            href={`/scenarios/${scenario.id}`}
            overline="Scenario"
            id={scenario.id}
            title={scenario.title}
          />
        ) : null}
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="ml-auto text-[11.5px] text-ink-faint hover:text-accent-ink"
        >
          {expanded ? "▾ Hide details" : "▸ Details"}
        </button>
      </div>

      {expanded ? (
        <div className="space-y-4 border-t border-line px-4 py-4">
          <div>
            <p className="overline-label mb-1">Why it matters</p>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              {imp.whyItMatters.trim() ? (
                imp.whyItMatters
              ) : (
                <span className="text-[12px] text-ink-faint">
                  Not recorded — an implication without a stated stake cannot
                  be weighed against others.
                </span>
              )}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-line bg-surface px-3 py-2.5 rounded-[2px]">
              <p className="overline-label mb-1 text-accent-ink">Opportunity</p>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                {imp.opportunity.trim() ? (
                  imp.opportunity
                ) : (
                  <span className="text-ink-faint">Not recorded.</span>
                )}
              </p>
            </div>
            <div className="border border-line bg-surface px-3 py-2.5 rounded-[2px]">
              <p className="overline-label mb-1 text-caution">Risk</p>
              <p className="text-[12.5px] leading-relaxed text-ink-soft">
                {imp.risk.trim() ? (
                  imp.risk
                ) : (
                  <span className="text-ink-faint">Not recorded.</span>
                )}
              </p>
            </div>
          </div>

          <div className="border border-line-strong border-l-2 border-l-accent bg-surface-muted px-3.5 py-3 rounded-[2px]">
            <p className="overline-label mb-1">Recommended action</p>
            <p className="text-[13.5px] font-medium leading-relaxed text-ink">
              {imp.recommendedAction.trim() ? (
                imp.recommendedAction
              ) : (
                <span className="text-[12px] font-normal text-ink-faint">
                  No action recorded yet — the implication is not usable until
                  it names a concrete present-day step.
                </span>
              )}
            </p>
          </div>

          <ValidationChecklist
            result={grounding}
            title="Implication grounding"
            passedLabel="Grounded"
            failedLabel="Needs grounding"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="overline-label mb-1.5">Future territory</p>
              {territory ? (
                <EntityLink
                  kind="territory"
                  id={territory.id}
                  title={territory.name}
                />
              ) : imp.territoryId ? (
                <p className="text-[11.5px] text-ink-faint">
                  Territory{" "}
                  <span className="font-mono">{imp.territoryId}</span> no longer
                  resolves in the intelligence base.
                </p>
              ) : (
                <p className="text-[11.5px] text-ink-faint">
                  Not connected to a territory.
                </p>
              )}
            </div>
            <div>
              <p className="overline-label mb-1.5">Scenario</p>
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
            <p className="overline-label mb-1.5">Evidence signals</p>
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
            <p className="overline-label mb-1.5">Evidence drivers</p>
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

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <div className="flex flex-wrap items-center gap-2">
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
                  className="border border-line bg-surface px-2 py-1 text-[12px] text-ink rounded-[2px] focus:border-accent focus:outline-none"
                >
                  {REVIEW_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {REVIEW_STATUS_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-[11px] text-ink-faint">
              Created {fmtDate(imp.createdAt)} · Updated {fmtDate(imp.updatedAt)}
            </p>
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
      <span className="overline-label block">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-[11px] text-ink-faint">{hint}</span>
      ) : null}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function InlineError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[11.5px] text-tension">{message}</p>;
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
    <section className="card mb-5">
      <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h2 className="overline-label">New strategic implication</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-ink-faint hover:text-ink"
        >
          Close
        </button>
      </header>

      <div className="space-y-4 px-4 py-4">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Future territory"
              hint="The future direction this implication responds to."
            >
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
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
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
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
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

        <div>
          <Field
            label="Implication"
            required
            hint="One clear statement of what this future means for the audiences named above."
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

        <div className="grid gap-3 sm:grid-cols-2">
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

        <div className="grid gap-4 lg:grid-cols-2">
          <GroupField
            label="Evidence signals"
            hint="Signals this recommendation traces back to."
          >
            {signals.length > 0 ? (
              <div className="max-h-44 overflow-y-auto border border-line bg-surface px-2.5 py-2 rounded-[2px]">
                <CheckboxList
                  columns={1}
                  options={signals.map((s) => ({
                    value: s.id,
                    label: `${s.id} · ${s.title}`,
                  }))}
                  selected={draft.evidenceSignalIds}
                  onChange={(evidenceSignalIds) => patch({ evidenceSignalIds })}
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
              <div className="max-h-44 overflow-y-auto border border-line bg-surface px-2.5 py-2 rounded-[2px]">
                <CheckboxList
                  columns={1}
                  options={drivers.map((d) => ({
                    value: d.id,
                    label: `${d.id} · ${d.name}`,
                  }))}
                  selected={draft.evidenceDriverIds}
                  onChange={(evidenceDriverIds) => patch({ evidenceDriverIds })}
                />
              </div>
            ) : (
              <p className="text-[11.5px] text-ink-faint">
                No drivers in the intelligence base yet.
              </p>
            )}
          </GroupField>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <p className="mr-auto text-[11px] text-ink-faint">
            Saves as a draft. Raise the review status once evidence links have
            been checked.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
          >
            Save implication
          </button>
        </div>
      </div>
    </section>
  );
}
