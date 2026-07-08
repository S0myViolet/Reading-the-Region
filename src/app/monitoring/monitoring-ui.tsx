"use client";

/**
 * Monitoring — page-local UI: the indicator list row with its expandable
 * reading and inline record-check form, the add-indicator form, the
 * territory monitoring questions reference, and the cadence rhythm.
 *
 * Monitoring is the living part of the system: a future territory is never
 * published and forgotten — its leading indicators are checked on a cadence
 * and the trend is updated with evidence. Each row answers quickly: what the
 * indicator tells us, its current read, when it was last checked, when the
 * next check is due, and what to do about it. Everything is quiet and
 * boxless: rows separated by hairlines, detail indented, forms under plain
 * headings.
 */

import { useState } from "react";
import Link from "next/link";
import { IdChip, Pill, TrendBadge } from "@/components/badges";
import {
  AtAGlance,
  ConnectBlock,
  IncompleteNote,
  ShowAllList,
  StatusStrip,
} from "@/components/connect";
import { EntityLink } from "@/components/EntityLink";
import { ViewGate, useViewMode } from "@/components/ViewMode";
import { Field, Select, TextArea, TextInput } from "@/components/form";
import { indicatorOverdue } from "@/lib/derived";
import { explainConfidenceGeneric, explainIndicator } from "@/lib/explain";
import { nextId, useIntelligenceStore } from "@/lib/store";
import { modeAtLeast } from "@/lib/viewMode";
import type {
  ConfidenceLevel,
  FutureTerritory,
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
const quietLink =
  "text-[12px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink";

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDate(iso: string): string {
  return formatDay(new Date(iso));
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

/** The date the next check falls due: last check plus the cadence interval. */
function nextCheckDue(i: MonitoringIndicator): Date {
  return new Date(
    new Date(i.dateLastChecked).getTime() + NEXT_CHECK_DAYS[i.cadence] * 86_400_000,
  );
}

/** Short next-check phrase for the simple-mode metadata line. */
function nextCheckPhrase(i: MonitoringIndicator): string {
  const dueText = formatDay(nextCheckDue(i));
  return indicatorOverdue(i)
    ? `check was due ${dueText}`
    : `next check due ${dueText}`;
}

/** First full sentence of a text — never a clipped fragment. */
function firstSentence(text: string): string {
  const t = text.trim();
  const match = t.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (match ? match[0] : t).trim();
}

function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * The assumption a territory definition states, phrased so it can follow
 * "Tests whether …". Definitions written as "A future where X" reduce to X.
 */
function assumptionClause(definition: string): string {
  const t = definition.trim().replace(/\.+$/, "");
  const prefix = t.match(/^a future (?:where|in which) /i);
  return prefix ? t.slice(prefix[0].length) : lcFirst(t);
}

/** One honest sentence about the evidence behind the current reading. */
function evidenceNoteFor(
  i: MonitoringIndicator,
  overdue: boolean,
  hasTerritory: boolean,
): string {
  if (overdue || i.evidence.trim() === "")
    return "No recent check — treat this reading with reduced confidence.";
  switch (i.trend) {
    case "strengthening":
      return "Recent evidence is accumulating in this direction.";
    case "contradictory":
      return "Recent evidence cuts both ways.";
    case "weakening":
      return `Recent evidence is moving against ${
        hasTerritory ? "the territory's direction" : "the expected direction"
      }.`;
    case "stable":
      return "Recent evidence shows little meaningful change since the last check.";
  }
}

/** The action a row's state calls for. */
interface RowAction {
  label: string;
  title: string;
  kind: "check" | "expand" | "link";
  href?: string;
}

function rowActionFor(
  i: MonitoringIndicator,
  overdue: boolean,
  contradictionHref: string | null,
): RowAction {
  if (overdue)
    return {
      label: "Run check",
      kind: "check",
      title: "Past its cadence — record what the evidence shows now.",
    };
  switch (i.trend) {
    case "contradictory":
      return contradictionHref
        ? {
            label: "Review contradiction",
            kind: "link",
            href: contradictionHref,
            title: "Evidence is pulling both ways — open the linked contradiction.",
          }
        : {
            label: "Review contradiction",
            kind: "expand",
            title: "Evidence is pulling both ways — open the full reading.",
          };
    case "weakening":
      return {
        label: "Open evidence",
        kind: "expand",
        title: "Read the evidence behind this weakening reading.",
      };
    case "strengthening":
      return {
        label: "Open evidence",
        kind: "expand",
        title: "Read the evidence behind this strengthening reading.",
      };
    case "stable":
      return {
        label: "Keep watching",
        kind: "expand",
        title: "No action needed now — open the reading to see what would change it.",
      };
  }
}

/** 2–3 honest lines on what would move the reading, derived from its state. */
function readingChangeLines(
  i: MonitoringIndicator,
  overdue: boolean,
  hasTerritory: boolean,
): string[] {
  const dir = hasTerritory ? "the territory's direction" : "the expected direction";
  const lines: string[] = [];
  switch (i.trend) {
    case "stable":
      lines.push(
        `New evidence in ${dir} would move this to strengthening.`,
        "Sustained counter-evidence would move it to weakening.",
      );
      break;
    case "strengthening":
      lines.push(
        "Counter-evidence or a missed check would weaken or suspend this reading.",
        "Evidence pulling in both directions at once would mark it contradictory.",
      );
      break;
    case "weakening":
      lines.push(
        `New evidence in ${dir} at the next check could steady or reverse this reading.`,
        "Continued movement against it would keep the reading weakening — and may call for the linked reading to be revisited.",
      );
      break;
    case "contradictory":
      lines.push(
        "A check showing one side clearly ahead would move this to strengthening or weakening.",
        "If both sides keep strengthening, the underlying tension needs review — not just this indicator.",
      );
      break;
  }
  lines.push(
    overdue
      ? "Until a new check is recorded, the current trend rests on stale evidence."
      : `Missing the next check (due ${formatDay(nextCheckDue(i))}) would leave the reading resting on stale evidence.`,
  );
  return lines;
}

/** The next-action sentence repeated inside the expanded reading. */
function nextActionSentence(i: MonitoringIndicator, overdue: boolean): string {
  if (overdue) return "Run the overdue check and record what the evidence shows now.";
  switch (i.trend) {
    case "contradictory":
      return "Review the contradiction and decide which side the next evidence supports.";
    case "weakening":
      return "Follow the evidence — if the weakening continues, the linked reading may need revisiting.";
    case "strengthening":
      return "Follow the evidence and confirm the reading at the next scheduled check.";
    case "stable":
      return "Keep watching on the current cadence — no change is needed yet.";
  }
}

// ---------------------------------------------------------------------------
// Group summary — one honest sentence per territory group
// ---------------------------------------------------------------------------

const TREND_KEYS: IndicatorTrend[] = [
  "strengthening",
  "weakening",
  "stable",
  "contradictory",
];

/**
 * Derived overall read for a territory's indicators: majority trend plus
 * overdue count, with mixed evidence reported as mixed rather than averaged.
 */
export function overallReadSentence(items: MonitoringIndicator[]): string {
  const counts: Record<IndicatorTrend, number> = {
    strengthening: 0,
    weakening: 0,
    stable: 0,
    contradictory: 0,
  };
  let overdue = 0;
  for (const i of items) {
    counts[i.trend] += 1;
    if (indicatorOverdue(i)) overdue += 1;
  }
  const max = Math.max(...TREND_KEYS.map((t) => counts[t]));
  const leaders = TREND_KEYS.filter((t) => counts[t] === max);
  const lead = leaders.length === 1 ? leaders[0] : null;
  const opposing =
    lead === "strengthening"
      ? counts.weakening + counts.contradictory
      : lead === "weakening"
        ? counts.strengthening + counts.contradictory
        : 0;
  const mixed =
    lead === null || lead === "contradictory" || (lead !== "stable" && opposing >= max);

  const countText = `${items.length} indicator${items.length === 1 ? "" : "s"}.`;
  const overdueText = `${overdue} check${overdue === 1 ? " is" : "s are"} overdue`;

  if (mixed) {
    return overdue > 0
      ? `${countText} Overall read: mixed — evidence pulls both ways, and ${overdueText}.`
      : `${countText} Overall read: mixed — evidence pulls both ways.`;
  }
  const label = INDICATOR_TREND_LABELS[lead].toLowerCase();
  if (overdue === 0) return `${countText} Overall read: ${label}.`;
  const joiner = lead === "weakening" ? "and" : "but";
  return `${countText} Overall read: ${label}, ${joiner} ${overdueText}.`;
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

const TREND_STRIP_TONES: Record<
  IndicatorTrend,
  "accent" | "caution" | "tension" | "neutral"
> = {
  strengthening: "accent",
  weakening: "caution",
  stable: "neutral",
  contradictory: "tension",
};

const TREND_READING_SENTENCES: Record<IndicatorTrend, string> = {
  strengthening:
    "Marked strengthening — the evidence gathered so far is moving in the direction this indicator watches.",
  weakening:
    "Marked weakening — the evidence gathered so far is moving against the direction this indicator watches.",
  stable: "Marked stable — little meaningful change since the last check.",
  contradictory:
    "Marked contradictory — the evidence is pulling in both directions at once.",
};

/** Expanded reading under a row: the full record, honestly framed. */
function IndicatorDetail({
  indicator,
  territory,
  driver,
  signal,
  territoryRecord,
  contradictionHref,
  checking,
  onStartCheck,
  onDoneCheck,
}: {
  indicator: MonitoringIndicator;
  territory: LinkedRef | null;
  driver: LinkedRef | null;
  signal: LinkedRef | null;
  territoryRecord: FutureTerritory | null;
  contradictionHref: string | null;
  checking: boolean;
  onStartCheck: () => void;
  onDoneCheck: () => void;
}) {
  const implications = useIntelligenceStore((s) => s.implications);
  const overdue = indicatorOverdue(indicator);
  const hasTerritory = territory !== null;
  const hasEvidence = indicator.evidence.trim() !== "";
  const due = nextCheckDue(indicator);
  const relatedImplications =
    indicator.territoryId === null
      ? []
      : implications.filter((imp) => imp.territoryId === indicator.territoryId);
  const hasLinks =
    territory !== null ||
    driver !== null ||
    signal !== null ||
    relatedImplications.length > 0;

  return (
    <div className="mt-5 space-y-6 border-l border-line pl-5">
      <ConnectBlock heading="What this indicator tells us">
        <p>{indicator.description}</p>
      </ConnectBlock>

      <ConnectBlock heading="Current reading">
        <StatusStrip
          items={[
            {
              text: INDICATOR_TREND_LABELS[indicator.trend],
              tone: TREND_STRIP_TONES[indicator.trend],
            },
            ...(overdue
              ? [{ text: "Overdue — record a check", tone: "caution" as const }]
              : []),
            { text: CONFIDENCE_LABELS[indicator.confidence] },
          ]}
        />
        <p className="mt-2">
          {indicator.currentStatus.trim()
            ? indicator.currentStatus
            : "No reading recorded yet — record a check to establish one."}
        </p>
        <p className="mt-2 text-[12px]">
          {TREND_READING_SENTENCES[indicator.trend]}
        </p>
        {overdue ? (
          <p className="mt-2 text-[12px] text-caution">
            This check lapsed on {formatDay(due)} — evidence may have moved since{" "}
            {formatDate(indicator.dateLastChecked)}. Record a check before relying
            on this reading.
          </p>
        ) : null}
      </ConnectBlock>

      <ConnectBlock heading="Evidence since last check">
        {hasEvidence ? (
          <p>{indicator.evidence}</p>
        ) : (
          <p className="text-ink-faint">
            No evidence recorded at the last check — a trend without evidence is
            an opinion. Treat this reading as provisional until a check cites
            material.
          </p>
        )}
        <p className="mt-2 text-[12px]">
          {explainConfidenceGeneric(
            indicator.confidence,
            hasEvidence
              ? "based on the evidence recorded at the last check."
              : "no evidence recorded yet — record a check citing material before relying on this trend.",
          )}
        </p>
        {indicator.notes.trim() ? (
          <p className="mt-2 text-[11.5px] text-ink-faint">
            Note — {indicator.notes}
          </p>
        ) : null}
      </ConnectBlock>

      <ConnectBlock heading="Why it matters">
        {territoryRecord ? (
          <p>
            Tests whether {assumptionClause(territoryRecord.oneLineDefinition)}.
            If this indicator weakens or is contradicted, that territory reading
            weakens with it.
          </p>
        ) : driver ? (
          <p>
            Tests whether the driver “{driver.title}” is still operating the way
            the analysis claims. If this indicator weakens, that explanation
            needs a second look.
          </p>
        ) : (
          <IncompleteNote
            missing="Not yet tied to a territory or driver."
            whyItMatters="An indicator that monitors nothing cannot strengthen or weaken a strategic reading."
            nextStep="Link it to the future territory or driver whose assumption it should test."
          />
        )}
      </ConnectBlock>

      <ConnectBlock heading="What would change the reading">
        <ul className="space-y-1">
          {readingChangeLines(indicator, overdue, hasTerritory).map((line) => (
            <li key={line} className="text-[12.5px]">
              {line}
            </li>
          ))}
        </ul>
      </ConnectBlock>

      <ConnectBlock heading="Linked intelligence">
        {hasLinks ? (
          <>
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
            {relatedImplications.length > 0 ? (
              <div className="mt-3">
                <p className="mb-1 text-[11px] text-ink-faint">
                  Implications of this territory
                </p>
                <div className="grid gap-1.5">
                  <ShowAllList
                    noun="implications"
                    previewCount={3}
                    items={relatedImplications.map((imp) => (
                      <EntityLink
                        key={imp.id}
                        kind="implication"
                        id={imp.id}
                        title={firstSentence(imp.implication)}
                      />
                    ))}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-ink-faint">
            Nothing linked yet — tie this indicator to a territory or driver so
            its reading feeds the wider analysis.
          </p>
        )}
      </ConnectBlock>

      <AtAGlance
        items={[
          { label: "Type", value: INDICATOR_TYPE_LABELS[indicator.indicatorType] },
          { label: "Cadence", value: CADENCE_LABELS[indicator.cadence] },
          {
            label: "Last checked",
            value: (
              <span className="font-mono text-[12px]">
                {formatDate(indicator.dateLastChecked)}
              </span>
            ),
          },
          {
            label: overdue ? "Check was due" : "Next check due",
            value: (
              <span
                className={`font-mono text-[12px] ${overdue ? "text-caution" : ""}`}
              >
                {formatDay(due)}
              </span>
            ),
          },
          { label: "Confidence", value: CONFIDENCE_LABELS[indicator.confidence] },
          { label: "ID", value: <IdChip id={indicator.id} /> },
        ]}
      />

      <ViewGate min="methodology">
        <p className="text-[11px] text-ink-faint">
          Created {formatDate(indicator.createdAt)} · Updated{" "}
          {formatDate(indicator.updatedAt)}
        </p>
      </ViewGate>

      <p className="max-w-2xl text-[12px] leading-relaxed text-ink-soft">
        <span className="text-ink-faint">Next action — </span>
        {nextActionSentence(indicator, overdue)}
        {!overdue && indicator.trend === "contradictory" && contradictionHref ? (
          <>
            {" "}
            <Link href={contradictionHref} className={quietLink}>
              Open contradiction
            </Link>
          </>
        ) : null}
      </p>

      {checking ? (
        <RecordCheckForm indicator={indicator} onDone={onDoneCheck} />
      ) : (
        <button
          type="button"
          onClick={onStartCheck}
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
  const [checking, setChecking] = useState(false);
  const mode = useViewMode();
  const analyst = modeAtLeast(mode, "analyst");
  const territories = useIntelligenceStore((s) => s.territories);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const overdue = indicatorOverdue(indicator);

  if (!analyst) {
    // Simple register — unchanged: one calm line per indicator.
    const reading = indicator.currentStatus.trim()
      ? explainIndicator(indicator)
      : `No reading recorded yet — ${explainIndicator(indicator).trim()}`;
    return (
      <article className="list-row">
        <div>
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
        </div>
      </article>
    );
  }

  // Advanced register — the monitoring desk row.
  const territoryRecord =
    territory === null
      ? null
      : (territories.find((t) => t.id === territory.id) ?? null);
  const linkedContradiction =
    territoryRecord?.contradictionIds
      .map((id) => contradictions.find((c) => c.id === id))
      .find((c) => c !== undefined) ?? null;
  const contradictionHref = linkedContradiction
    ? `/contradictions/${linkedContradiction.id}`
    : null;
  const action = rowActionFor(indicator, overdue, contradictionHref);
  const runAction = () => {
    setExpanded(true);
    if (action.kind === "check") setChecking(true);
  };

  return (
    <article className="list-row">
      <div className="flex items-start justify-between gap-6">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="min-w-0 flex-1 text-left"
          title={expanded ? "Collapse the full reading" : "Expand the full reading"}
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[13.5px] font-medium text-ink">
              {indicator.name}
            </span>
            <TrendBadge trend={indicator.trend} />
            {overdue ? (
              <Pill
                tone="caution"
                title="Past its review cadence — record a check before relying on this reading."
              >
                Overdue — check needed
              </Pill>
            ) : null}
          </div>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">Why it matters — </span>
            {firstSentence(indicator.description)}
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-ink-faint">
            Last checked: {formatDate(indicator.dateLastChecked)} ·{" "}
            {overdue ? "Check was due" : "Next check due"}:{" "}
            {formatDay(nextCheckDue(indicator))}
          </p>
          <p className="mt-1 max-w-2xl text-[12px] text-ink-faint">
            {evidenceNoteFor(indicator, overdue, territory !== null)}
          </p>
        </button>
        <span className="shrink-0 pt-0.5">
          {action.kind === "link" && action.href ? (
            <Link href={action.href} title={action.title} className={quietLink}>
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={runAction}
              title={action.title}
              className={quietLink}
            >
              {action.label}
            </button>
          )}
        </span>
      </div>
      {expanded ? (
        <IndicatorDetail
          indicator={indicator}
          territory={territory}
          driver={driver}
          signal={signal}
          territoryRecord={territoryRecord}
          contradictionHref={contradictionHref}
          checking={checking}
          onStartCheck={() => setChecking(true)}
          onDoneCheck={() => setChecking(false)}
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
