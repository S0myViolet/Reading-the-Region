"use client";

/**
 * Source Library — tracks where evidence comes from and how much weight it
 * should receive. Credibility and role are assessed separately: a source can
 * be a strong discovery source and a weak validation source at the same time.
 */

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { DemoTag, IdChip, SourceCredibilityBadge } from "@/components/badges";
import { SourceBiasTags } from "@/components/tags";
import {
  CheckboxList,
  Field,
  ScorePicker,
  Select,
  TextArea,
  TextInput,
} from "@/components/form";
import { nextId, useHydrated, useIntelligenceStore } from "@/lib/store";
import type { BiasTag, Score, Source, SourceRole, SourceType } from "@/lib/types";
import {
  BIAS_TAG_LABELS,
  CREDIBILITY_LABELS,
  SOURCE_ROLE_LABELS,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";
import { RolePills, btnPrimary, btnSecondary, fmtDate } from "./source-ui";

// ---------------------------------------------------------------------------
// Option lists
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = Object.entries(SOURCE_TYPE_LABELS) as Array<[SourceType, string]>;
const ROLE_OPTIONS = Object.entries(SOURCE_ROLE_LABELS) as Array<[SourceRole, string]>;
const BIAS_OPTIONS = Object.entries(BIAS_TAG_LABELS) as Array<[BiasTag, string]>;
const CRED_VALUES = [1, 2, 3, 4, 5] as const;

// ---------------------------------------------------------------------------
// Header (also used for the pre-hydration skeleton)
// ---------------------------------------------------------------------------

function SourcesHeader() {
  return (
    <PageHeader
      overline="Scan & Classify"
      title="Source Library"
      description="Every source is assessed twice, and separately: credibility scores how far it can be trusted, role records the job it performs in the workflow. Neither judgement substitutes for the other."
    />
  );
}

// ---------------------------------------------------------------------------
// Credibility-vs-role principle strip
// ---------------------------------------------------------------------------

function PrincipleStrip() {
  return (
    <section className="card mb-5">
      <header className="border-b border-line px-4 py-2.5">
        <h2 className="overline-label">Credibility is not role</h2>
      </header>
      <div className="px-4 py-3">
        <p className="text-[13px] text-ink-soft">
          A source&apos;s credibility says how far its claims can be trusted; its role
          says what job it does for the workflow. The two are recorded independently,
          because a source can be excellent at one job and unsafe for another.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="border border-line bg-surface-muted px-3 py-2 rounded-[2px]">
            <p className="text-[12px] font-medium text-ink">Social platforms</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">
              Strong discovery, weak validation. They surface early behaviour before
              stronger sources notice it, but they rarely confirm scale — evidence found
              there requires independent validation before it supports a conclusion.
            </p>
          </div>
          <div className="border border-line bg-surface-muted px-3 py-2 rounded-[2px]">
            <p className="text-[12px] font-medium text-ink">Government reports</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">
              Strong validation, weaker discovery. Authoritative when confirming scale,
              policy, or infrastructure, but slow to register new behaviour — and their
              claims should still be read against a government-agenda bias tag.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Add-source inline form
// ---------------------------------------------------------------------------

function AddSourceForm() {
  const sources = useIntelligenceStore((s) => s.sources);
  const addSource = useIntelligenceStore((s) => s.addSource);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("news_publication");
  const [credibility, setCredibility] = useState<Score>(3);
  const [biasTags, setBiasTags] = useState<BiasTag[]>([]);
  const [roles, setRoles] = useState<SourceRole[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  function reset() {
    setName("");
    setUrl("");
    setSourceType("news_publication");
    setCredibility(3);
    setBiasTags([]);
    setRoles([]);
    setNotes("");
    setError(null);
  }

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
    setConfirmation(`${src.id} — ${src.name} added to the library.`);
    reset();
    setOpen(false);
  }

  return (
    <section id="add-source" className="card mb-5">
      <header
        className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
          open ? "border-b border-line" : ""
        }`}
      >
        <div>
          <h2 className="overline-label">Add source</h2>
          <p className="mt-0.5 text-[11px] text-ink-faint">
            Record where evidence comes from before citing it. Credibility and roles
            are set here and weighed on every page that uses the source.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setConfirmation(null);
          }}
          className={open ? btnSecondary : btnPrimary}
        >
          {open ? "Close" : "Add source"}
        </button>
      </header>
      {confirmation && !open ? (
        <p className="border-t border-line px-4 py-2 text-[12px] text-accent-ink">
          {confirmation}
        </p>
      ) : null}
      {open ? (
        <form onSubmit={submit} className="space-y-4 px-4 py-4">
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
          </div>
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
          {error ? <p className="text-[12px] text-tension">{error}</p> : null}
          <div className="flex items-center gap-2">
            <button type="submit" className={btnPrimary}>
              Add to library
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className={btnSecondary}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Table row
// ---------------------------------------------------------------------------

function SourceRow({
  src,
  observationCount,
  signalCount,
}: {
  src: Source;
  observationCount: number;
  signalCount: number;
}) {
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
        <div className="mt-0.5">
          <IdChip id={src.id} />
        </div>
      </td>
      <td className="text-[12.5px] text-ink-soft">{SOURCE_TYPE_LABELS[src.sourceType]}</td>
      <td>
        <SourceCredibilityBadge score={src.credibility} />
      </td>
      <td>
        <RolePills roles={src.roles} />
      </td>
      <td>
        <SourceBiasTags tags={src.biasTags} />
      </td>
      <td className="whitespace-nowrap text-[12.5px] text-ink-soft">
        {fmtDate(src.dateAdded)}
      </td>
      <td
        className="text-right font-mono text-[12px] text-ink-soft"
        title="Observations citing this source"
      >
        {observationCount}
      </td>
      <td
        className="text-right font-mono text-[12px] text-ink-soft"
        title="Signals citing this source"
      >
        {signalCount}
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
  const sources = useIntelligenceStore((s) => s.sources);
  const observations = useIntelligenceStore((s) => s.observations);
  const signals = useIntelligenceStore((s) => s.signals);

  // ?credibility=low preselects the low-credibility band (≤ 2).
  const lowPreset = searchParams.get("credibility") === "low";
  const [typeFilter, setTypeFilter] = useState<"all" | SourceType>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | SourceRole>("all");
  const [biasFilter, setBiasFilter] = useState<"all" | BiasTag>("all");
  const [minCred, setMinCred] = useState<Score>(1);
  const [maxCred, setMaxCred] = useState<Score>(lowPreset ? 2 : 5);

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

  const filtered = sources.filter(
    (src) =>
      (typeFilter === "all" || src.sourceType === typeFilter) &&
      src.credibility >= minCred &&
      src.credibility <= maxCred &&
      (roleFilter === "all" || src.roles.includes(roleFilter)) &&
      (biasFilter === "all" || src.biasTags.includes(biasFilter)),
  );
  const rows = [...filtered].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));

  const filtersActive =
    typeFilter !== "all" ||
    roleFilter !== "all" ||
    biasFilter !== "all" ||
    minCred !== 1 ||
    maxCred !== 5;

  return (
    <>
      <SourcesHeader />
      <WalkthroughPanel pageId="sources" />
      <PrincipleStrip />
      <AddSourceForm />

      <section className="card mb-4">
        <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="overline-label">Filters</h2>
          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setRoleFilter("all");
                setBiasFilter("all");
                setMinCred(1);
                setMaxCred(5);
              }}
              className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
            >
              Reset filters
            </button>
          ) : null}
        </header>
        <div className="grid gap-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Source type">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | SourceType)}
            >
              <option value="all">All types</option>
              {TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Min credibility">
            <Select
              value={String(minCred)}
              onChange={(e) => setMinCred(Number(e.target.value) as Score)}
            >
              {CRED_VALUES.map((n) => (
                <option key={n} value={n}>
                  {n} — {CREDIBILITY_LABELS[n]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Max credibility">
            <Select
              value={String(maxCred)}
              onChange={(e) => setMaxCred(Number(e.target.value) as Score)}
            >
              {CRED_VALUES.map((n) => (
                <option key={n} value={n}>
                  {n} — {CREDIBILITY_LABELS[n]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Role">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | SourceRole)}
            >
              <option value="all">All roles</option>
              {ROLE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Bias tag">
            <Select
              value={biasFilter}
              onChange={(e) => setBiasFilter(e.target.value as "all" | BiasTag)}
            >
              <option value="all">All bias tags</option>
              {BIAS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {minCred > maxCred ? (
          <p className="border-t border-line px-4 py-2 text-[11.5px] text-caution">
            Minimum credibility is above maximum credibility — no source can match.
            Adjust one of the two bounds.
          </p>
        ) : null}
      </section>

      {sources.length === 0 ? (
        <EmptyState
          message="The Source Library is empty. Every observation and signal should trace back to a recorded source with a credibility score, roles, and bias tags — otherwise evidence cannot be weighed. Use the Add source form above to record the first one."
          actionLabel="Add a source"
          actionHref="#add-source"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          message="No sources match the current filters. Widen the credibility range or clear the type, role, and bias filters — every source stays in the library even when it is filtered out of view."
        />
      ) : (
        <section className="card">
          <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="overline-label">
              {rows.length} of {sources.length} source{sources.length === 1 ? "" : "s"}
            </h2>
            <p className="text-[11px] text-ink-faint">
              Credibility ≤ 2 is safe for discovery, unsafe for validation
            </p>
          </header>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Credibility</th>
                  <th>Roles</th>
                  <th>Bias tags</th>
                  <th>Added</th>
                  <th className="text-right">Obs.</th>
                  <th className="text-right">Signals</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((src) => (
                  <SourceRow
                    key={src.id}
                    src={src}
                    observationCount={observationCount(src)}
                    signalCount={signalCount(src)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
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
