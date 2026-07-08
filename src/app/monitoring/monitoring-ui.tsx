"use client";

/**
 * Monitoring — page-local UI: the indicator list row with its analyst
 * disclosure and inline record-check form, the add-indicator form, the
 * territory monitoring questions reference, and the cadence rhythm.
 *
 * Monitoring is the living part of the system: a future territory is never
 * published and forgotten — its leading indicators are checked on a cadence
 * and the trend is updated with evidence. Everything here is quiet and
 * boxless: rows separated by hairlines, detail indented, forms under plain
 * headings.
 */

import { useState } from "react";
import { IdChip, TrendBadge } from "@/components/badges";
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

const btnPrimary =
  "rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink";
const btnText =
  "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink hover:underline";

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

/** Short next-check phrase for the row's metadata line. */
function nextCheckPhrase(i: MonitoringIndicator): string {
  const due = new Date(
    new Date(i.dateLastChecked).getTime() + NEXT_CHECK_DAYS[i.cadence] * 86_400_000,
  );
  const dueText = due.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return indicatorOverdue(i)
    ? `check was due ${dueText}`
    : `next check due ${dueText}`;
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
// Territory monitoring questions — quiet collapsible reference
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

export function MonitoringQuestions() {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="text-[13px] font-medium text-ink hover:text-accent-ink"
        >
          Territory monitoring questions
        </button>
        <span className="text-[11.5px] text-ink-faint">
          Ask these at every check — {expanded ? "hide" : "show"}
        </span>
      </div>
      {expanded ? (
        <ul className="mt-3 grid max-w-3xl gap-x-8 gap-y-1.5 sm:grid-cols-2">
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
// Cadence rhythm
// ---------------------------------------------------------------------------

const CADENCE_RHYTHM: Array<{ label: string; focus: string }> = [
  { label: "Weekly", focus: "Weak signals and news" },
  { label: "Monthly", focus: "Signal database update" },
  { label: "Quarterly", focus: "Cluster and pattern review" },
  { label: "Biannually", focus: "Driver review" },
  { label: "Annually", focus: "Future territory refresh" },
];

export function CadenceRhythm() {
  return (
    <section className="mt-12">
      <h3 className="text-[13px] font-medium text-ink">Monitoring rhythm</h3>
      <div className="mt-2.5 flex flex-wrap gap-x-10 gap-y-3">
        {CADENCE_RHYTHM.map((c) => (
          <div key={c.label}>
            <p className="text-[11px] text-ink-faint">{c.label}</p>
            <p className="text-[12.5px] leading-snug text-ink-soft">{c.focus}</p>
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
      <p className="text-[13px] font-medium text-ink">Record check</p>
      <p className="mt-0.5 text-[11.5px] text-ink-faint">
        Will be dated {formatDate(todayIso())}.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
      <div className="mt-4 flex items-center gap-4">
        <button type="submit" className={btnPrimary}>
          Save check
        </button>
        <button type="button" onClick={onDone} className={btnText}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Indicator row
// ---------------------------------------------------------------------------

export interface LinkedRef {
  id: string;
  title: string;
}

/** Analyst disclosure under a row: evidence, confidence, notes, links, check. */
function IndicatorDetail({
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
  const hasLinks = territory !== null || driver !== null || signal !== null;

  return (
    <div className="mt-4 space-y-4 border-l border-line pl-5">
      <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
        {indicator.description}
      </p>
      <p className="text-[12px] text-ink-faint">
        {INDICATOR_TYPE_LABELS[indicator.indicatorType]} · checked{" "}
        {CADENCE_LABELS[indicator.cadence].toLowerCase()} · last checked{" "}
        {formatDate(indicator.dateLastChecked)} · <IdChip id={indicator.id} />
      </p>
      <p className="text-[12px] text-ink-faint">
        Next review — {CADENCE_LABELS[indicator.cadence].toLowerCase()} cadence,{" "}
        {nextCheckPhrase(indicator)}.
      </p>

      <div>
        <p className="mb-1 text-[11px] text-ink-faint">Evidence</p>
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
          {indicator.evidence.trim() ? (
            indicator.evidence
          ) : (
            <span className="text-ink-faint">
              No evidence recorded — a trend without evidence is an opinion.
            </span>
          )}
        </p>
      </div>

      <p className="max-w-2xl text-[12px] leading-relaxed text-ink-soft">
        {explainConfidenceGeneric(
          indicator.confidence,
          indicator.evidence.trim()
            ? "based on the evidence recorded at the last check."
            : "no evidence recorded yet — record a check citing material before this trend carries weight.",
        )}
      </p>

      {indicator.notes.trim() ? (
        <div>
          <p className="mb-1 text-[11px] text-ink-faint">Notes</p>
          <p className="max-w-2xl text-[11.5px] leading-relaxed text-ink-faint">
            {indicator.notes}
          </p>
        </div>
      ) : null}

      {hasLinks ? (
        <div className="grid gap-1.5 sm:grid-cols-3">
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

      <ViewGate min="methodology">
        <p className="text-[11px] text-ink-faint">
          Created {formatDate(indicator.createdAt)} · Updated{" "}
          {formatDate(indicator.updatedAt)}
        </p>
      </ViewGate>

      {checking ? (
        <RecordCheckForm indicator={indicator} onDone={() => setChecking(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setChecking(true)}
          className="rounded-[4px] bg-surface-muted px-2.5 py-1 text-[12px] text-ink-soft hover:text-ink"
        >
          Record check
        </button>
      )}
    </div>
  );
}

export function MonitoringIndicatorRow({
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
  const [expanded, setExpanded] = useState(false);
  const mode = useViewMode();
  const analyst = modeAtLeast(mode, "analyst");
  const overdue = indicatorOverdue(indicator);

  const reading = indicator.currentStatus.trim()
    ? explainIndicator(indicator)
    : `No reading recorded yet — ${explainIndicator(indicator).trim()}`;

  const summary = (
    <>
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink">
          {indicator.name}
          {overdue ? (
            <span
              className="ml-2 text-[11.5px] font-normal text-caution"
              title="Past its review cadence — check and update the status."
            >
              overdue
            </span>
          ) : null}
        </p>
        <span className="shrink-0">
          <TrendBadge trend={indicator.trend} />
        </span>
      </div>
      <p className="mt-1 flex gap-1.5 text-[12px] text-ink-faint">
        <span className="min-w-0 truncate">{reading}</span>
        <span className="shrink-0">· {nextCheckPhrase(indicator)}</span>
      </p>
    </>
  );

  return (
    <article className="list-row">
      {analyst ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="block w-full text-left"
          title={expanded ? "Collapse analyst detail" : "Expand analyst detail"}
        >
          {summary}
        </button>
      ) : (
        <div>{summary}</div>
      )}
      {analyst && expanded ? (
        <IndicatorDetail
          indicator={indicator}
          territory={territory}
          driver={driver}
          signal={signal}
        />
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
    <section className="mb-10 border-b border-line pb-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-medium text-ink">
          New monitoring indicator
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
        A leading indicator is observable, checkable on a cadence, and anchored
        to the territory or driver it monitors.
      </p>
      <form
        className="mt-5 max-w-3xl"
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

        <div className="mt-6 flex items-center gap-4">
          <button type="submit" className={btnPrimary}>
            Add indicator
          </button>
          <button type="button" onClick={onClose} className={btnText}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
