"use client";

/**
 * Page-local UI for /implications: the decision entry and the creation form.
 * Nothing here is imported outside src/app/implications/.
 *
 * The discipline of this layer: an implication is what should be done
 * differently now because a future may be forming. In advanced mode each
 * entry reads as a decision — recommendation, stake, a prominent "Do now"
 * line, who it is for, timing, confidence, and a plain evidence sentence —
 * with the deeper evidence behind one quiet disclosure. The simple register
 * keeps the original /decisions-style reading untouched.
 */

import Link from "next/link";
import { useState } from "react";
import { IdChip, Pill, ReviewStatusBadge } from "@/components/badges";
import { ValidationChecklist } from "@/components/ValidationChecklist";
import { EntityLink } from "@/components/EntityLink";
import { IncompleteNote, ShowAllList } from "@/components/connect";
import { ViewGate, useViewMode } from "@/components/ViewMode";
import { CheckboxList, Field, Select, TextArea } from "@/components/form";
import { explainConfidenceGeneric, explainImplicationEvidence } from "@/lib/explain";
import { firstSentence } from "@/lib/simple";
import { nextId, useIntelligenceStore } from "@/lib/store";
import { validateImplication, type ValidationResult } from "@/lib/validation";
import type {
  ConfidenceLevel,
  Contradiction,
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
// Decision entry
// ---------------------------------------------------------------------------

/** Tiny faint label used inside the evidence disclosure. */
function DetailLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1 text-[11px] text-ink-faint">{children}</p>;
}

const quietLink =
  "text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink";

/** Split prose into a lead of at most `count` sentences and the remainder. */
function leadSentences(
  text: string,
  count: number,
): { lead: string; rest: string } {
  const trimmed = text.trim();
  const matches = trimmed.match(/[^.!?]*[.!?]+['")\]]*(?:\s+|$)/g);
  if (!matches || matches.length <= count) return { lead: trimmed, rest: "" };
  const raw = matches.slice(0, count).join("");
  return { lead: raw.trim(), rest: trimmed.slice(raw.length).trim() };
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * One plain sentence for the collapsed card: what the recommendation rests
 * on, counted from live links only. Zero-count parts are omitted, never
 * padded.
 */
function evidenceSummary(
  signalCount: number,
  driverCount: number,
  hasTerritory: boolean,
  hasScenario: boolean,
): string {
  const parts: string[] = [];
  if (signalCount > 0)
    parts.push(`${signalCount} linked signal${signalCount === 1 ? "" : "s"}`);
  if (driverCount > 0)
    parts.push(`${driverCount} driver${driverCount === 1 ? "" : "s"}`);
  if (hasTerritory) parts.push("1 future territory");
  if (hasScenario) parts.push("1 scenario");
  return parts.length > 0
    ? `Evidence: ${parts.join(", ")}.`
    : "Evidence: none linked yet.";
}

/**
 * The validateImplication checks that test evidence linkage. When either
 * fails, the card says "Needs more evidence" instead of the stored
 * confidence — the label must not claim more than the links support.
 * Matched by check label; keep in step with validateImplication.
 */
const EVIDENCE_CHECK_LABELS = new Set([
  "Connected to a territory or scenario",
  "Evidence-linked",
]);

/** Plain words for what a failing grounding check leaves missing. */
const MISSING_EVIDENCE_PHRASES: Record<string, string> = {
  "Connected to a territory or scenario":
    "a link to the future territory or scenario it responds to",
  "Evidence-linked": "at least one supporting signal or driver",
  "Actionable recommendation": "a concrete present-day action",
};

function missingEvidenceList(result: ValidationResult): string {
  return joinWithAnd(
    result.checks
      .filter((c) => !c.passed)
      .map((c) => MISSING_EVIDENCE_PHRASES[c.label] ?? c.label.toLowerCase()),
  );
}

/**
 * One honest clause on why the named audiences are affected — derived from
 * the recorded stake and sectors, never invented per audience.
 */
function whoShouldActReason(imp: StrategicImplication): string {
  const why = firstSentence(imp.whyItMatters.trim());
  const sectors = imp.sectors.map((s) => SECTOR_LABELS[s]);
  if (sectors.length > 0 && why)
    return `Affected because the change lands in ${joinWithAnd(sectors)} — ${why}`;
  if (why) return `The stake for them — ${why}`;
  if (sectors.length > 0)
    return `Affected because the change lands in ${joinWithAnd(sectors)}.`;
  return "Why they are affected is not recorded yet.";
}

interface TensionSource {
  contradiction: Contradiction;
  origin: "territory" | "scenario";
}

/**
 * Implications are not linked to contradictions directly. The honest route
 * runs through the anchor: the linked territory's contradictions, then the
 * scenario's shaping ones, strongest tension first.
 */
function strongestTension(
  territory: FutureTerritory | null,
  scenario: Scenario | null,
  contradictions: Contradiction[],
): TensionSource | null {
  const byId = new Map(contradictions.map((c) => [c.id, c] as const));
  const candidates: TensionSource[] = [];
  for (const id of territory?.contradictionIds ?? []) {
    const c = byId.get(id);
    if (c) candidates.push({ contradiction: c, origin: "territory" });
  }
  for (const id of scenario?.shapingContradictionIds ?? []) {
    const c = byId.get(id);
    if (c && !candidates.some((x) => x.contradiction.id === c.id))
      candidates.push({ contradiction: c, origin: "scenario" });
  }
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) =>
      b.contradiction.scores.tensionStrength -
      a.contradiction.scores.tensionStrength,
  );
  return candidates[0];
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
  const [open, setOpen] = useState(false);
  const updateImplication = useIntelligenceStore((s) => s.updateImplication);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const indicators = useIntelligenceStore((s) => s.indicators);
  const mode = useViewMode();
  const advanced = mode !== "simple";

  // Simple register — the /decisions-style reading, unchanged.
  if (!advanced) {
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
        </p>
      </article>
    );
  }

  // Advanced register — the decision card.
  const grounding = validateImplication(imp);
  const unresolvedSignals = imp.evidenceSignalIds.length - evidenceSignals.length;
  const unresolvedDrivers = imp.evidenceDriverIds.length - evidenceDrivers.length;
  const needsMoreEvidence = grounding.checks.some(
    (c) => EVIDENCE_CHECK_LABELS.has(c.label) && !c.passed,
  );
  const why = leadSentences(imp.whyItMatters, 2);
  const tension = strongestTension(territory, scenario, contradictions);
  const territoryIndicators = imp.territoryId
    ? indicators.filter((i) => i.territoryId === imp.territoryId)
    : [];
  const shownIndicators = territoryIndicators.slice(0, 3);
  const hasAnyEvidence =
    evidenceSignals.length > 0 ||
    evidenceDrivers.length > 0 ||
    territory !== null ||
    scenario !== null;

  return (
    <article className="list-row py-8">
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

      <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
        {imp.whyItMatters.trim() ? (
          <>
            <span className="text-ink-faint">Why this matters — </span>
            {why.lead}
            {why.rest ? (
              <span className="text-ink-faint"> (continues in the evidence detail)</span>
            ) : null}
          </>
        ) : (
          <span className="text-[12px] text-ink-faint">
            Why it matters is not recorded — an implication without a stated
            stake cannot be weighed against others.
          </span>
        )}
      </p>

      {imp.recommendedAction.trim() ? (
        <p className="mt-4 max-w-2xl border-l-2 border-accent/50 pl-3 text-[13px] font-medium leading-relaxed text-ink">
          <span className="text-accent-ink">Do now</span>
          <span className="font-normal text-ink-faint"> — </span>
          {imp.recommendedAction}
        </p>
      ) : (
        <p className="mt-4 max-w-2xl text-[12px] text-ink-faint">
          No action recorded yet — the implication is not usable until it names
          a concrete present-day step.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[12px]">
        <span className="text-[11px] text-ink-faint">For</span>
        {imp.audiences.length > 0 ? (
          imp.audiences.map((a) => (
            <Pill key={a}>{IMPLICATION_AUDIENCE_LABELS[a]}</Pill>
          ))
        ) : (
          <span className="text-ink-faint">no audience named yet</span>
        )}
        <span className="text-ink-faint">·</span>
        <span className="text-ink-soft">{TIME_HORIZON_LABELS[imp.timeHorizon]}</span>
        <span className="text-ink-faint">·</span>
        {needsMoreEvidence ? (
          <span className="text-caution">Needs more evidence</span>
        ) : (
          <span className="text-ink-soft">{CONFIDENCE_LABELS[imp.confidence]}</span>
        )}
      </div>

      <p className="mt-2.5 text-[12px] text-ink-faint">
        {evidenceSummary(
          evidenceSignals.length,
          evidenceDrivers.length,
          territory !== null,
          scenario !== null,
        )}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`ml-2.5 ${quietLink}`}
        >
          {open ? "Hide evidence" : "Open evidence"}
        </button>
      </p>

      {open ? (
        <div className="mt-5 space-y-5 border-l border-line pl-5">
          <p className="text-[12px] text-ink-faint">
            {IMPLICATION_TYPE_LABELS[imp.implicationType]} · <IdChip id={imp.id} />
          </p>

          {why.rest ? (
            <div>
              <DetailLabel>Why this matters, in full</DetailLabel>
              <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
                {imp.whyItMatters.trim()}
              </p>
            </div>
          ) : null}

          <div>
            <DetailLabel>Who should act</DetailLabel>
            {imp.audiences.length > 0 ? (
              <>
                <p className="text-[12.5px] text-ink">
                  {joinWithAnd(
                    imp.audiences.map((a) => IMPLICATION_AUDIENCE_LABELS[a]),
                  )}
                </p>
                <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink-soft">
                  {whoShouldActReason(imp)}
                </p>
              </>
            ) : (
              <p className="text-[12px] text-ink-faint">
                No audience is named yet — a recommendation nobody owns will
                not be acted on.
              </p>
            )}
          </div>

          <div className="max-w-2xl space-y-2">
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              <span className="text-ink-faint">Opportunity — </span>
              {imp.opportunity.trim() ? (
                imp.opportunity
              ) : (
                <span className="text-ink-faint">not recorded.</span>
              )}
            </p>
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              <span className="text-ink-faint">Risk — </span>
              {imp.risk.trim() ? (
                imp.risk
              ) : (
                <span className="text-ink-faint">not recorded.</span>
              )}
            </p>
          </div>

          <div>
            <DetailLabel>Evidence behind this</DetailLabel>
            {hasAnyEvidence ? (
              <div className="grid gap-1.5">
                {evidenceSignals.length > 0 ? (
                  <ShowAllList
                    previewCount={4}
                    noun="signals"
                    items={evidenceSignals.map((s) => (
                      <EntityLink
                        key={s.id}
                        kind="signal"
                        id={s.id}
                        title={s.title}
                      />
                    ))}
                  />
                ) : (
                  <p className="text-[11.5px] text-ink-faint">
                    No signals linked — the recommendation rests on
                    interpretation until observed evidence is attached.
                  </p>
                )}
                {evidenceDrivers.map((d) => (
                  <EntityLink key={d.id} kind="driver" id={d.id} title={d.name} />
                ))}
                {territory ? (
                  <EntityLink
                    kind="territory"
                    id={territory.id}
                    title={territory.name}
                  />
                ) : null}
                {scenario ? (
                  <EntityLink
                    kind="scenario"
                    id={scenario.id}
                    title={scenario.title}
                  />
                ) : null}
              </div>
            ) : (
              <IncompleteNote
                missing="Nothing is linked to this implication yet."
                whyItMatters="Without signals, drivers, or an anchor, the recommendation is an opinion rather than intelligence."
                nextStep="Link the territory or scenario it responds to, and the evidence that makes that future plausible."
              />
            )}
            {imp.territoryId && !territory ? (
              <p className="mt-1 text-[11px] text-ink-faint">
                Territory <span className="font-mono">{imp.territoryId}</span>{" "}
                no longer resolves in the intelligence base.
              </p>
            ) : null}
            {imp.scenarioId && !scenario ? (
              <p className="mt-1 text-[11px] text-ink-faint">
                Scenario <span className="font-mono">{imp.scenarioId}</span> no
                longer resolves in the intelligence base.
              </p>
            ) : null}
            {unresolvedSignals > 0 ? (
              <p className="mt-1 text-[11px] text-ink-faint">
                {unresolvedSignals} linked signal id
                {unresolvedSignals === 1 ? "" : "s"} no longer resolve
                {unresolvedSignals === 1 ? "s" : ""}.
              </p>
            ) : null}
            {unresolvedDrivers > 0 ? (
              <p className="mt-1 text-[11px] text-ink-faint">
                {unresolvedDrivers} linked driver id
                {unresolvedDrivers === 1 ? "" : "s"} no longer resolve
                {unresolvedDrivers === 1 ? "s" : ""}.
              </p>
            ) : null}
          </div>

          <div>
            <DetailLabel>What could make this wrong</DetailLabel>
            {tension ? (
              <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
                The {tension.origin} this rests on carries an open tension:{" "}
                <Link
                  href={`/contradictions/${tension.contradiction.id}`}
                  className={quietLink}
                >
                  {tension.contradiction.name}
                </Link>
                {" — "}
                {firstSentence(tension.contradiction.underlyingTension)}
              </p>
            ) : grounding.valid ? (
              <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
                No open contradiction is recorded against the future this rests
                on. Read that as untested rather than settled — a tension may
                simply not have been captured yet.
              </p>
            ) : (
              <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
                No contradiction can be reached from this implication because
                its evidence base is incomplete. Still missing:{" "}
                {missingEvidenceList(grounding)}.
              </p>
            )}
          </div>

          <div>
            <DetailLabel>What to monitor next</DetailLabel>
            {shownIndicators.length > 0 ? (
              <>
                <div className="grid gap-1.5">
                  {shownIndicators.map((ind) => (
                    <EntityLink
                      key={ind.id}
                      kind="indicator"
                      id={ind.id}
                      title={ind.name}
                    />
                  ))}
                </div>
                {territoryIndicators.length > 3 ? (
                  <p className="mt-1.5 text-[11px] text-ink-faint">
                    First 3 of {territoryIndicators.length} indicators watching
                    this territory — the full set is on the Monitoring page.
                  </p>
                ) : null}
              </>
            ) : imp.territoryId ? (
              <p className="max-w-2xl text-[12px] leading-relaxed text-ink-faint">
                No monitoring indicators watch this territory yet, so nothing
                will flag it if this future strengthens or fades. Add one on
                the Monitoring page.
              </p>
            ) : (
              <p className="max-w-2xl text-[12px] leading-relaxed text-ink-faint">
                Not linked to a territory, so no monitoring indicators cover
                this implication yet.
              </p>
            )}
          </div>

          <ViewGate min="methodology">
            <ValidationChecklist
              result={grounding}
              title="Implication grounding"
              passedLabel="Grounded"
              failedLabel="Needs grounding"
            />
          </ViewGate>

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
        cites the evidence that makes that future plausible.
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
                hint="The observed signals this recommendation rests on."
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
