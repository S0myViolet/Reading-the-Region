"use client";

/**
 * Source Library — tracks where evidence comes from and how much weight it
 * should receive. Credibility and role are assessed separately: a source can
 * be a strong discovery source and a weak validation source at the same time.
 *
 * Calm layout: header, one control bar, the source list. The add-source form
 * opens inline from the single header action; the credibility band, exact
 * min/max bounds and bias filters live behind "More filters".
 */

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { DemoTag, IdChip, SourceCredibilityBadge } from "@/components/badges";
import { SourceBiasTags } from "@/components/tags";
import {
  ControlBar,
  ControlSearch,
  ControlSelect,
} from "@/components/ControlBar";
import {
  CheckboxList,
  Field,
  ScorePicker,
  Select,
  TextArea,
  TextInput,
} from "@/components/form";
import { DepthHint, ViewGate, useViewMode } from "@/components/ViewMode";
import { Age, FreshnessWord } from "@/components/freshness";
import { RefreshBar } from "@/components/RefreshControls";
import { nextId, useHydrated, useIntelligenceStore } from "@/lib/store";
import { freshnessOf, sourceActivityAt } from "@/lib/freshness";
import { modeAtLeast } from "@/lib/viewMode";
import type { BiasTag, Score, Source, SourceRole, SourceType } from "@/lib/types";
import {
  BIAS_TAG_LABELS,
  CREDIBILITY_LABELS,
  SOURCE_ROLE_LABELS,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";
import {
  CredibilityCautionPill,
  btnPrimary,
  btnQuiet,
  fmtDate,
  rolesLine,
} from "./source-ui";

// ---------------------------------------------------------------------------
// Option lists
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = Object.entries(SOURCE_TYPE_LABELS) as Array<[SourceType, string]>;
const ROLE_OPTIONS = Object.entries(SOURCE_ROLE_LABELS) as Array<[SourceRole, string]>;
const BIAS_OPTIONS = Object.entries(BIAS_TAG_LABELS) as Array<[BiasTag, string]>;
const CRED_VALUES = [1, 2, 3, 4, 5] as const;

// ---------------------------------------------------------------------------
// Freshness filter (advanced) — every test reads a real recorded field:
// sourceActivityAt for age, url/isDemo for record quality, lastCheckedAt
// for human checks.
// ---------------------------------------------------------------------------

type SourceFreshnessFilter =
  | "all"
  | "fresh"
  | "recent"
  | "stale"
  | "no_url"
  | "demo"
  | "recheck";

const SOURCE_FRESHNESS_OPTIONS: Array<{ value: SourceFreshnessFilter; label: string }> = [
  { value: "all", label: "All records" },
  { value: "fresh", label: "Fresh (last 24h)" },
  { value: "recent", label: "Recent (last 7 days)" },
  { value: "stale", label: "Stale (older than 30 days)" },
  { value: "no_url", label: "No URL recorded" },
  { value: "demo", label: "Demo sources" },
  { value: "recheck", label: "Needs re-check" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const RECHECK_MS = 30 * DAY_MS;

function matchesSourceFreshness(
  src: Source,
  filter: SourceFreshnessFilter,
  now: number,
): boolean {
  if (filter === "all") return true;
  if (filter === "no_url") return !src.url;
  if (filter === "demo") return src.isDemo;
  if (filter === "recheck")
    return !src.lastCheckedAt || now - Date.parse(src.lastCheckedAt) > RECHECK_MS;
  const status = freshnessOf(sourceActivityAt(src), now);
  if (filter === "fresh") return status === "fresh";
  if (filter === "recent") return status === "recent";
  return status === "stale" || status === "archived";
}

/**
 * The honest "when was this source looked at" reading. Sources carry no
 * updatedAt, so the fallback verb is "added" from dateAdded — "checked" is
 * said only when a real check timestamp exists.
 */
function sourceCheckedReading(src: Source): { date: string; verb: "checked" | "added" } {
  return src.lastCheckedAt
    ? { date: src.lastCheckedAt, verb: "checked" }
    : { date: src.dateAdded, verb: "added" };
}

// ---------------------------------------------------------------------------
// Header (also used for the pre-hydration skeleton)
// ---------------------------------------------------------------------------

function SourcesHeader({ onAdd }: { onAdd?: () => void }) {
  return (
    <PageHeader
      title="Source Library"
      description="Credibility says how much to trust a source. Role says what job it does. Judge them separately — a source can be great for discovery and weak for proof."
      actions={
        onAdd ? (
          <button type="button" onClick={onAdd} className={btnPrimary}>
            Add source
          </button>
        ) : undefined
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Add-source form — boxless, one quiet heading, one primary button
// ---------------------------------------------------------------------------

function AddSourceForm({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (message: string) => void;
}) {
  const sources = useIntelligenceStore((s) => s.sources);
  const addSource = useIntelligenceStore((s) => s.addSource);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("news_publication");
  const [credibility, setCredibility] = useState<Score>(3);
  const [biasTags, setBiasTags] = useState<BiasTag[]>([]);
  const [roles, setRoles] = useState<SourceRole[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("A source needs a name before it can be cited.");
      return;
    }
    const src: Source = {
      id: nextId("SRC", sources),
      name: name.trim(),
      url: url.trim() ? url.trim() : null,
      sourceType,
      credibility,
      biasTags,
      roles,
      dateAdded: new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
      isDemo: false,
    };
    addSource(src);
    onAdded(`${src.id} — ${src.name} added to the library.`);
  }

  return (
    <section id="add-source" className="mb-10">
      <h2 className="text-[13px] font-medium text-ink">Add source</h2>
      <p className="mt-0.5 text-[12px] text-ink-faint">
        Record where evidence comes from before citing it. Credibility and roles set
        here are weighed on every page that uses the source.
      </p>
      <form onSubmit={submit} className="mt-4 max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gulf urban policy bulletin"
            />
          </Field>
          <Field
            label="URL"
            hint="Optional. Record the real URL only — never invent one. Leave blank if no link exists."
          >
            <TextInput
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              inputMode="url"
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Source type">
            <Select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
            >
              {TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <ViewGate min="analyst">
            <Field
              label="Credibility"
              hint="How far can claims from this source be trusted, on their own?"
            >
              <ScorePicker
                label="Credibility"
                value={credibility}
                rubric={CREDIBILITY_LABELS}
                onChange={setCredibility}
              />
            </Field>
          </ViewGate>
        </div>
        <ViewGate
          min="analyst"
          fallback={
            <p className="text-[11.5px] text-ink-faint">
              Credibility, roles and bias tags are assessed in Analyst view. Until
              then the source is recorded at medium credibility with no roles, and
              its evidence is weighted accordingly.
            </p>
          }
        >
          <Field
            label="Roles"
            hint="The jobs this source performs in the workflow. Roles do not raise or lower credibility."
          >
            <CheckboxList
              options={ROLE_OPTIONS.map(([value, label]) => ({ value, label }))}
              selected={roles}
              onChange={setRoles}
              columns={2}
            />
          </Field>
          <Field
            label="Bias tags"
            hint="Known distortions to weigh whenever this source is cited."
          >
            <CheckboxList
              options={BIAS_OPTIONS.map(([value, label]) => ({ value, label }))}
              selected={biasTags}
              onChange={setBiasTags}
              columns={2}
            />
          </Field>
          <Field label="Notes">
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Coverage, method, known limitations, how it has performed as evidence…"
            />
          </Field>
        </ViewGate>
        {error ? <p className="text-[12px] text-tension">{error}</p> : null}
        <div className="flex items-center gap-4">
          <button type="submit" className={btnPrimary}>
            Add to library
          </button>
          <button type="button" onClick={onClose} className={btnQuiet}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Simple view — list rows
// ---------------------------------------------------------------------------

function SourceListRow({ src }: { src: Source }) {
  const secondary = [
    SOURCE_TYPE_LABELS[src.sourceType],
    CREDIBILITY_LABELS[src.credibility],
    rolesLine(src.roles),
  ].join(" · ");
  return (
    <Link href={`/sources/${src.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {src.name}
          {src.isDemo ? (
            <span className="ml-2">
              <DemoTag />
            </span>
          ) : null}
        </p>
        {src.credibility <= 2 ? (
          <span className="shrink-0">
            <CredibilityCautionPill />
          </span>
        ) : null}
      </div>
      <p className="mt-1 truncate text-[12px] text-ink-faint">{secondary}</p>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Analyst view — comparison table (≤6 columns)
// ---------------------------------------------------------------------------

function SourceTableRow({
  src,
  observationCount,
  signalCount,
  methodology,
}: {
  src: Source;
  observationCount: number;
  signalCount: number;
  methodology: boolean;
}) {
  // Real recorded dates only: the newest activity (check, fetch or the day
  // the record was added) plus the honest checked/added reading.
  const activityAt = sourceActivityAt(src);
  const checked = sourceCheckedReading(src);
  return (
    <tr>
      <td>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/sources/${src.id}`}
            className="text-[13px] font-medium text-ink hover:text-accent-ink hover:underline"
          >
            {src.name}
          </Link>
          {src.isDemo ? <DemoTag /> : null}
        </div>
        <p className="mt-0.5">
          <IdChip id={src.id} />
          {methodology ? (
            <span className="text-[10.5px] text-ink-faint">
              {" "}
              · added {fmtDate(src.dateAdded)}
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 text-[10.5px] text-ink-faint">
          <FreshnessWord date={activityAt} />
          {activityAt !== checked.date ? (
            <>
              {" · "}
              <Age iso={activityAt} prefix="latest activity" />
            </>
          ) : null}
          {" · "}
          <Age iso={checked.date} prefix={checked.verb} />
        </p>
      </td>
      <td className="text-[12.5px] text-ink-soft">
        {SOURCE_TYPE_LABELS[src.sourceType]}
      </td>
      <td>
        <SourceCredibilityBadge score={src.credibility} />
      </td>
      <td
        className={`text-[12px] ${src.roles.length === 0 ? "text-ink-faint" : "text-ink-soft"}`}
      >
        {rolesLine(src.roles)}
      </td>
      <td>
        <SourceBiasTags tags={src.biasTags.slice(0, 2)} />
        {src.biasTags.length > 2 ? (
          <span
            className="ml-1 text-[11px] text-ink-faint"
            title={src.biasTags.map((t) => BIAS_TAG_LABELS[t]).join(", ")}
          >
            +{src.biasTags.length - 2} more
          </span>
        ) : null}
      </td>
      <td
        className="whitespace-nowrap text-right font-mono text-[12px] text-ink-soft"
        title="Observations and signals citing this source"
      >
        {observationCount} obs · {signalCount} sig
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

function SourcesContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const mode = useViewMode();
  const analyst = modeAtLeast(mode, "analyst");
  const methodology = modeAtLeast(mode, "methodology");
  const sources = useIntelligenceStore((s) => s.sources);
  const observations = useIntelligenceStore((s) => s.observations);
  const signals = useIntelligenceStore((s) => s.signals);

  // ?credibility=low preselects the low-credibility band (≤ 2).
  const lowPreset = searchParams.get("credibility") === "low";
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | SourceType>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | SourceRole>("all");
  const [biasFilter, setBiasFilter] = useState<"all" | BiasTag>("all");
  const [minCred, setMinCred] = useState<Score>(1);
  const [maxCred, setMaxCred] = useState<Score>(lowPreset ? 2 : 5);
  const [freshFilter, setFreshFilter] = useState<SourceFreshnessFilter>("all");
  const [adding, setAdding] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return sources
      .filter(
        (src) =>
          (typeFilter === "all" || src.sourceType === typeFilter) &&
          src.credibility >= minCred &&
          src.credibility <= maxCred &&
          (roleFilter === "all" || src.roles.includes(roleFilter)) &&
          (biasFilter === "all" || src.biasTags.includes(biasFilter)) &&
          (!analyst || matchesSourceFreshness(src, freshFilter, now)) &&
          (!q || `${src.name} ${src.notes}`.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
  }, [sources, query, typeFilter, roleFilter, biasFilter, minCred, maxCred, freshFilter, analyst]);

  if (!hydrated) {
    return (
      <>
        <SourcesHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const observationCount = (src: Source) =>
    observations.filter((o) => o.sourceId === src.id || o.sourceName === src.name)
      .length;
  const signalCount = (src: Source) =>
    signals.filter((sg) => sg.sourceIds.includes(src.id)).length;

  const filtersActive =
    query.trim() !== "" ||
    typeFilter !== "all" ||
    roleFilter !== "all" ||
    biasFilter !== "all" ||
    freshFilter !== "all" ||
    minCred !== 1 ||
    maxCred !== 5;

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setRoleFilter("all");
    setBiasFilter("all");
    setFreshFilter("all");
    setMinCred(1);
    setMaxCred(5);
  };

  // Simple view offers credibility as a named band; Analyst view exposes the
  // underlying min/max bounds. Both drive the same state.
  const credBand =
    minCred === 1 && maxCred === 5
      ? "all"
      : minCred === 4 && maxCred === 5
        ? "high"
        : minCred === 3 && maxCred === 3
          ? "medium"
          : minCred === 1 && maxCred === 2
            ? "low"
            : "custom";
  const setCredBand = (value: string) => {
    if (value === "all") {
      setMinCred(1);
      setMaxCred(5);
    } else if (value === "high") {
      setMinCred(4);
      setMaxCred(5);
    } else if (value === "medium") {
      setMinCred(3);
      setMaxCred(3);
    } else if (value === "low") {
      setMinCred(1);
      setMaxCred(2);
    }
  };

  return (
    <>
      <SourcesHeader
        onAdd={() => {
          setAdding(true);
          setConfirmation(null);
        }}
      />
      <WalkthroughPanel pageId="sources" />
      {analyst ? <RefreshBar /> : null}

      {adding ? (
        <AddSourceForm
          onClose={() => setAdding(false)}
          onAdded={(message) => {
            setConfirmation(message);
            setAdding(false);
          }}
        />
      ) : null}
      {confirmation && !adding ? (
        <p className="mb-4 text-[12px] text-accent-ink">{confirmation}</p>
      ) : null}

      <ControlBar
        right={
          <>
            {filtersActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[12px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
              >
                Reset filters
              </button>
            ) : null}
            <span className="text-[12px] text-ink-faint">
              {rows.length} of {sources.length} source{sources.length === 1 ? "" : "s"}
            </span>
          </>
        }
        more={
          <>
            {analyst ? (
              <>
                <ControlSelect
                  label="Min credibility"
                  value={String(minCred)}
                  onChange={(v) => setMinCred(Number(v) as Score)}
                  options={CRED_VALUES.map((n) => ({
                    value: String(n),
                    label: `${n} — ${CREDIBILITY_LABELS[n]}`,
                  }))}
                />
                <ControlSelect
                  label="Max credibility"
                  value={String(maxCred)}
                  onChange={(v) => setMaxCred(Number(v) as Score)}
                  options={CRED_VALUES.map((n) => ({
                    value: String(n),
                    label: `${n} — ${CREDIBILITY_LABELS[n]}`,
                  }))}
                />
                <ControlSelect
                  label="Bias tag"
                  value={biasFilter}
                  onChange={(v) => setBiasFilter(v as "all" | BiasTag)}
                  options={[
                    { value: "all", label: "All bias tags" },
                    ...BIAS_OPTIONS.map(([value, label]) => ({ value, label })),
                  ]}
                />
                <ControlSelect
                  label="Freshness"
                  value={freshFilter}
                  onChange={(v) => setFreshFilter(v as SourceFreshnessFilter)}
                  options={SOURCE_FRESHNESS_OPTIONS}
                />
              </>
            ) : (
              <ControlSelect
                label="Credibility"
                value={credBand}
                onChange={setCredBand}
                options={[
                  { value: "all", label: "All credibility levels" },
                  { value: "high", label: "High or very high credibility" },
                  { value: "medium", label: "Medium credibility" },
                  { value: "low", label: "Low or low–medium credibility" },
                  ...(credBand === "custom"
                    ? [{ value: "custom", label: "Custom range (set in Analyst view)" }]
                    : []),
                ]}
              />
            )}
          </>
        }
      >
        <ControlSearch value={query} onChange={setQuery} placeholder="Search sources…" />
        <ControlSelect
          label="Type"
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as "all" | SourceType)}
          options={[
            { value: "all", label: "All types" },
            ...TYPE_OPTIONS.map(([value, label]) => ({ value, label })),
          ]}
        />
        <ControlSelect
          label="Role"
          value={roleFilter}
          onChange={(v) => setRoleFilter(v as "all" | SourceRole)}
          options={[
            { value: "all", label: "All roles" },
            ...ROLE_OPTIONS.map(([value, label]) => ({ value, label })),
          ]}
        />
      </ControlBar>

      {minCred > maxCred ? (
        <p className="mb-4 text-[11.5px] text-caution">
          Minimum credibility is above maximum credibility — no source can match.
          Adjust one of the two bounds.
        </p>
      ) : null}

      {sources.length === 0 ? (
        <EmptyState message="The Source Library is empty. Every observation and signal should trace back to a recorded source with a credibility score, roles, and bias tags — otherwise evidence cannot be weighed. Use Add source above to record the first one." />
      ) : rows.length === 0 ? (
        <EmptyState message="No sources match the current filters. Widen the credibility range or clear the search, type, role, and bias filters — every source stays in the library even when it is filtered out of view." />
      ) : analyst ? (
        <section aria-label="Sources" className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Credibility</th>
                <th>Roles</th>
                <th>Bias tags</th>
                <th className="text-right">Linked evidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((src) => (
                <SourceTableRow
                  key={src.id}
                  src={src}
                  observationCount={observationCount(src)}
                  signalCount={signalCount(src)}
                  methodology={methodology}
                />
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section aria-label="Sources">
          {rows.map((src) => (
            <SourceListRow key={src.id} src={src} />
          ))}
        </section>
      )}

      <div className="mt-8">
        <DepthHint>
          Bias tags, the credibility scale and role weighting detail
        </DepthHint>
      </div>

      <ViewGate min="methodology">
        <section className="mt-12 max-w-2xl space-y-8">
          <div>
            <h2 className="text-[13px] font-medium text-ink">Credibility is not role</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              Credibility says how much to trust a source. Role says what job it
              does. Judge them separately — a source can be great for discovery and
              weak for proof. Social platforms are typically strong discovery but
              weak validation: they surface early behaviour before stronger sources
              notice it, yet rarely confirm scale. Government reports are the
              reverse — strong validation but slow discovery, and their claims
              should still be read against a government-agenda bias tag.
            </p>
          </div>
          <div>
            <h2 className="text-[13px] font-medium text-ink">Credibility scale</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">
              Every source carries one credibility score from 1 to 5 — a judgement
              about the source itself, recorded once and weighed everywhere the
              source is cited.
            </p>
            <dl className="mt-3 space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((n) => (
                <div key={n} className="flex gap-3">
                  <dt className="w-4 shrink-0 font-mono text-[11px] leading-[1.7] text-ink-faint">
                    {n}
                  </dt>
                  <dd className="text-[12.5px] text-ink-soft">
                    {CREDIBILITY_LABELS[n]}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-faint">
              Sources scoring 2 or below are safe for discovery but unsafe for
              validation — evidence found through them must be confirmed by an
              independent, higher-credibility source before it supports a conclusion.
            </p>
          </div>
        </section>
      </ViewGate>
    </>
  );
}

export default function SourcesPage() {
  return (
    <Suspense
      fallback={
        <>
          <SourcesHeader />
          <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
        </>
      }
    >
      <SourcesContent />
    </Suspense>
  );
}
