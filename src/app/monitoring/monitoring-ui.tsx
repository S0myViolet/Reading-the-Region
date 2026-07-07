"use client";

/**
 * Monitoring — page-local UI: the indicator card with its inline
 * record-check form, the add-indicator form, the territory monitoring
 * questions reference, and the cadence rhythm strip.
 *
 * Monitoring is the living part of the system: a future territory is never
 * published and forgotten — its leading indicators are checked on a cadence
 * and the trend is updated with evidence.
 */

import { useState } from "react";
import { ConfidenceBadge, IdChip, Pill, TrendBadge } from "@/components/badges";
import { EntityLink } from "@/components/EntityLink";
import { ViewGate, useViewMode } from "@/components/ViewMode";
import { Field, Select, TextArea, TextInput } from "@/components/form";
import { indicatorOverdue } from "@/lib/derived";
import { explainConfidenceGeneric, explainIndicator } from "@/lib/explain";
import { nextId, useIntelligenceStore } from "@/lib/store";
import { modeAtLeast } from "@/lib/viewMode";
import type {
  ConfidenceLevel,
  IndicatorTrend,
  IndicatorType,
  MonitoringCadence,
  MonitoringIndicator,
} from "@/lib/types";
import {
  CADENCE_LABELS,
  CONFIDENCE_LABELS,
  INDICATOR_TREND_LABELS,
  INDICATOR_TYPE_LABELS,
} from "@/lib/types";

const primaryBtn =
  "border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink";
const secondaryBtn =
  "border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Today as an ISO date (date part only), used when a check is recorded. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Cadence lengths in days, mirroring the overdue rule in lib/derived.ts
 * (route-local copy — the lib map is not exported).
 */
const NEXT_CHECK_DAYS: Record<MonitoringCadence, number> = {
  weekly: 7,
  monthly: 31,
  quarterly: 92,
  biannual: 183,
  annual: 366,
};

/** "Next check due by …" in words, from the cadence and the last check date. */
function nextCheckLine(i: MonitoringIndicator): string {
  const due = new Date(
    new Date(i.dateLastChecked).getTime() + NEXT_CHECK_DAYS[i.cadence] * 86_400_000,
  );
  const dueText = due.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const cadenceWord = CADENCE_LABELS[i.cadence].toLowerCase();
  return indicatorOverdue(i)
    ? `Check overdue — it was due by ${dueText}; this indicator is checked ${cadenceWord}.`
    : `Next check due by ${dueText} — this indicator is checked ${cadenceWord}.`;
}

const TREND_OPTIONS = Object.entries(INDICATOR_TREND_LABELS) as Array<
  [IndicatorTrend, string]
>;
const TYPE_OPTIONS = Object.entries(INDICATOR_TYPE_LABELS) as Array<
  [IndicatorType, string]
>;
const CADENCE_OPTIONS = Object.entries(CADENCE_LABELS) as Array<
  [MonitoringCadence, string]
>;
const CONFIDENCE_OPTIONS = Object.entries(CONFIDENCE_LABELS) as Array<
  [ConfidenceLevel, string]
>;

// ---------------------------------------------------------------------------
// Territory monitoring questions — compact collapsible reference
// ---------------------------------------------------------------------------

const MONITORING_QUESTIONS: string[] = [
  "Is this territory strengthening?",
  "Is this territory weakening?",
  "Is this territory mutating?",
  "Is this territory being contradicted?",
  "Is adoption accelerating?",
  "Are new actors entering?",
  "Is capital flowing toward it?",
  "Is policy supporting it?",
  "Is consumer behaviour changing?",
  "Is resistance increasing?",
];

export function MonitoringQuestionsCard() {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="card mb-5">
      <header className="flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="overline-label hover:text-accent-ink"
        >
          {expanded ? "▾" : "▸"} Territory monitoring questions
        </button>
        <span className="text-[11px] text-ink-faint">Ask these at every check</span>
      </header>
      {expanded ? (
        <ul className="grid gap-x-6 gap-y-1 border-t border-line px-4 py-3 sm:grid-cols-2">
          {MONITORING_QUESTIONS.map((q) => (
            <li key={q} className="text-[12.5px] text-ink-soft">
              {q}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Cadence rhythm strip
// ---------------------------------------------------------------------------

const CADENCE_RHYTHM: Array<{ label: string; focus: string }> = [
  { label: "Weekly", focus: "Weak signals and news" },
  { label: "Monthly", focus: "Signal database update" },
  { label: "Quarterly", focus: "Cluster and pattern review" },
  { label: "Biannually", focus: "Driver review" },
  { label: "Annually", focus: "Future territory refresh" },
];

export function CadenceStrip() {
  return (
    <section className="card mb-5">
      <header className="border-b border-line px-4 py-2">
        <h3 className="overline-label">Monitoring rhythm</h3>
      </header>
      <div className="grid divide-y divide-line sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {CADENCE_RHYTHM.map((c) => (
          <div key={c.label} className="px-4 py-2.5">
            <p className="overline-label">{c.label}</p>
            <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{c.focus}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Record-check mini form — the living part of the system
// ---------------------------------------------------------------------------

function RecordCheckForm({
  indicator,
  onDone,
}: {
  indicator: MonitoringIndicator;
  onDone: () => void;
}) {
  const updateIndicator = useIntelligenceStore((s) => s.updateIndicator);
  const [trend, setTrend] = useState<IndicatorTrend>(indicator.trend);
  const [currentStatus, setCurrentStatus] = useState(indicator.currentStatus);
  const [evidence, setEvidence] = useState(indicator.evidence);
  const [notes, setNotes] = useState(indicator.notes);

  return (
    <form
      className="mt-3 border-t border-line pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        updateIndicator(indicator.id, {
          trend,
          currentStatus: currentStatus.trim(),
          evidence: evidence.trim(),
          notes: notes.trim(),
          dateLastChecked: todayIso(),
        });
        onDone();
      }}
    >
      <p className="overline-label mb-2">
        Record check — will be dated {formatDate(todayIso())}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Trend">
          <Select
            value={trend}
            onChange={(e) => setTrend(e.target.value as IndicatorTrend)}
          >
            {TREND_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Current status">
          <TextInput
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            placeholder="What the indicator shows right now"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Evidence"
            hint="What was observed at this check — cite the material, not the impression."
          >
            <TextArea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Notes">
            <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" className={primaryBtn}>
          Save check
        </button>
        <button type="button" onClick={onDone} className={secondaryBtn}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Indicator card
// ---------------------------------------------------------------------------

export interface LinkedRef {
  id: string;
  title: string;
}

export function MonitoringIndicatorCard({
  indicator,
  territory,
  driver,
  signal,
}: {
  indicator: MonitoringIndicator;
  territory: LinkedRef | null;
  driver: LinkedRef | null;
  signal: LinkedRef | null;
}) {
  const [checking, setChecking] = useState(false);
  const mode = useViewMode();
  const analyst = modeAtLeast(mode, "analyst");
  const overdue = indicatorOverdue(indicator);
  const hasLinks = territory !== null || driver !== null || signal !== null;

  return (
    <article className="card px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 max-w-2xl">
          <p className="overline-label mb-0.5">
            Monitoring indicator
            {analyst ? (
              <>
                {" "}
                · <IdChip id={indicator.id} />
              </>
            ) : null}
          </p>
          <h3 className="text-[14.5px] font-medium leading-snug text-ink">
            {indicator.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {analyst ? (
              <Pill>{INDICATOR_TYPE_LABELS[indicator.indicatorType]}</Pill>
            ) : null}
            <TrendBadge trend={indicator.trend} />
            {overdue ? (
              <Pill
                tone="caution"
                title="Past its review cadence — check and update the status."
              >
                Overdue
              </Pill>
            ) : null}
          </div>
        </div>
        {analyst ? (
          <button
            type="button"
            onClick={() => setChecking((c) => !c)}
            className={secondaryBtn + " shrink-0"}
          >
            {checking ? "Close check form" : "Record check"}
          </button>
        ) : null}
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        {indicator.description}
      </p>

      <div className="mt-2.5">
        <p className="overline-label">Reading</p>
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          {indicator.currentStatus.trim() ? (
            explainIndicator(indicator)
          ) : (
            <>
              <span className="text-ink-faint">
                No status recorded yet — a check should capture what the
                indicator shows.
              </span>{" "}
              {explainIndicator(indicator).trim()}
            </>
          )}
        </p>
        <p
          className={`mt-1 text-[12px] ${overdue ? "text-caution" : "text-ink-faint"}`}
        >
          {nextCheckLine(indicator)}
        </p>
      </div>

      <ViewGate min="analyst">
        <dl className="mt-2.5 space-y-1.5">
          <div>
            <dt className="overline-label">Evidence</dt>
            <dd className="text-[12.5px] text-ink-soft">
              {indicator.evidence.trim() ? (
                indicator.evidence
              ) : (
                <span className="text-ink-faint">
                  No evidence recorded — a trend without evidence is an opinion.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </ViewGate>

      {hasLinks ? (
        <div className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
          {territory ? (
            <EntityLink kind="territory" id={territory.id} title={territory.title} />
          ) : null}
          {driver ? (
            <EntityLink kind="driver" id={driver.id} title={driver.title} />
          ) : null}
          {signal ? (
            <EntityLink kind="signal" id={signal.id} title={signal.title} />
          ) : null}
        </div>
      ) : null}

      <ViewGate min="analyst">
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-2.5">
          <span className="text-[11.5px] text-ink-faint">
            Last checked{" "}
            <span className="font-mono text-ink-soft">
              {formatDate(indicator.dateLastChecked)}
            </span>
          </span>
          <span className="text-[11.5px] text-ink-faint">
            Cadence{" "}
            <span className="text-ink-soft">{CADENCE_LABELS[indicator.cadence]}</span>
          </span>
          <ConfidenceBadge level={indicator.confidence} />
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          {explainConfidenceGeneric(
            indicator.confidence,
            indicator.evidence.trim()
              ? "based on the evidence recorded at the last check."
              : "no evidence recorded yet — record a check citing material before this trend carries weight.",
          )}
        </p>

        {indicator.notes.trim() ? (
          <div className="mt-2">
            <p className="overline-label">Notes</p>
            <p className="text-[11.5px] leading-relaxed text-ink-faint">
              {indicator.notes}
            </p>
          </div>
        ) : null}
      </ViewGate>

      <ViewGate min="methodology">
        <p className="mt-2 border-t border-line pt-2 text-[11px] text-ink-faint">
          Created {formatDate(indicator.createdAt)} · Updated{" "}
          {formatDate(indicator.updatedAt)}
        </p>
      </ViewGate>

      {analyst && checking ? (
        <RecordCheckForm indicator={indicator} onDone={() => setChecking(false)} />
      ) : null}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Add-indicator form
// ---------------------------------------------------------------------------

export function AddIndicatorForm({ onClose }: { onClose: () => void }) {
  const territories = useIntelligenceStore((s) => s.territories);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const signals = useIntelligenceStore((s) => s.signals);
  const indicators = useIntelligenceStore((s) => s.indicators);
  const addIndicator = useIntelligenceStore((s) => s.addIndicator);
  const updateTerritory = useIntelligenceStore((s) => s.updateTerritory);
  const updateDriver = useIntelligenceStore((s) => s.updateDriver);
  const updateSignal = useIntelligenceStore((s) => s.updateSignal);

  const [name, setName] = useState("");
  const [territoryId, setTerritoryId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [signalId, setSignalId] = useState("");
  const [indicatorType, setIndicatorType] = useState<IndicatorType>("policy");
  const [description, setDescription] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [evidence, setEvidence] = useState("");
  const [trend, setTrend] = useState<IndicatorTrend>("stable");
  const [cadence, setCadence] = useState<MonitoringCadence>("monthly");
  const [confidence, setConfidence] = useState<ConfidenceLevel>("low");
  const [errors, setErrors] = useState<string[]>([]);

  function save() {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const problems: string[] = [];
    if (!trimmedName) problems.push("A name is required.");
    if (!trimmedDescription) problems.push("A description is required.");
    if (!territoryId && !driverId)
      problems.push(
        "Link the indicator to a future territory or a driver. An indicator that monitors nothing cannot show strengthening or weakening.",
      );
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }

    const now = new Date().toISOString();
    const id = nextId("IND", indicators);
    const indicator: MonitoringIndicator = {
      id,
      name: trimmedName,
      territoryId: territoryId || null,
      driverId: driverId || null,
      signalId: signalId || null,
      indicatorType,
      description: trimmedDescription,
      currentStatus: currentStatus.trim(),
      evidence: evidence.trim(),
      dateLastChecked: todayIso(),
      trend,
      cadence,
      confidence,
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
    addIndicator(indicator);

    // Keep the relationship trail two-way: the monitored objects list this
    // indicator among their leading indicators.
    const territory = territories.find((t) => t.id === territoryId);
    if (territory)
      updateTerritory(territory.id, {
        leadingIndicatorIds: [...territory.leadingIndicatorIds, id],
      });
    const driver = drivers.find((d) => d.id === driverId);
    if (driver)
      updateDriver(driver.id, {
        leadingIndicatorIds: [...driver.leadingIndicatorIds, id],
      });
    const signal = signals.find((s) => s.id === signalId);
    if (signal)
      updateSignal(signal.id, {
        monitoringIndicatorIds: [...signal.monitoringIndicatorIds, id],
      });

    onClose();
  }

  return (
    <section className="card mb-5 border-l-2 border-l-accent">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">New monitoring indicator</h3>
        <p className="mt-0.5 text-[11.5px] text-ink-faint">
          A leading indicator is observable, checkable on a cadence, and anchored
          to the territory or driver it monitors.
        </p>
      </header>
      <form
        className="px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Name" required>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Number of GCC municipalities piloting heat-adapted public space standards"
              />
            </Field>
          </div>
          <Field
            label="Future territory"
            hint="Required unless a driver is linked."
          >
            <Select
              value={territoryId}
              onChange={(e) => setTerritoryId(e.target.value)}
            >
              <option value="">No territory linkage</option>
              {territories.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Driver" hint="Required unless a territory is linked.">
            <Select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
              <option value="">No driver linkage</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} — {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Signal" hint="Optional — the signal this indicator watches.">
            <Select value={signalId} onChange={(e) => setSignalId(e.target.value)}>
              <option value="">No signal linkage</option>
              {signals.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Indicator type">
            <Select
              value={indicatorType}
              onChange={(e) => setIndicatorType(e.target.value as IndicatorType)}
            >
              {TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Description"
              required
              hint="What exactly is being watched, and what movement would mean."
            >
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Current status">
            <TextInput
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              placeholder="What the indicator shows today"
            />
          </Field>
          <Field label="Initial trend">
            <Select
              value={trend}
              onChange={(e) => setTrend(e.target.value as IndicatorTrend)}
            >
              {TREND_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Evidence" hint="The material behind the current status.">
              <TextArea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Cadence">
            <Select
              value={cadence}
              onChange={(e) => setCadence(e.target.value as MonitoringCadence)}
            >
              {CADENCE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Confidence">
            <Select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
            >
              {CONFIDENCE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {errors.length > 0 ? (
          <ul className="mt-3 space-y-0.5">
            {errors.map((err) => (
              <li key={err} className="text-[12px] text-tension">
                {err}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex gap-2 border-t border-line pt-3">
          <button type="submit" className={primaryBtn}>
            Add indicator
          </button>
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
