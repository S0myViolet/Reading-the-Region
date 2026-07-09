"use client";

/**
 * Source detail — the full record of one source, read as an article: what the
 * source is good for first, then a calm definition block (type, URL,
 * credibility in words with a reason, roles, bias tags, linked evidence),
 * then the analyst "How to use this source" guidance and the methodology
 * reference. The relationship trail sits in the right rail.
 */

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { DemoTag, IdChip } from "@/components/badges";
import { SourceBiasTags } from "@/components/tags";
import { AtAGlance } from "@/components/connect";
import { RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { SourceLine } from "@/components/freshness";
import { DepthHint, ViewGate } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { fullDate, relativeAge } from "@/lib/freshness";
import type { Source } from "@/lib/types";
import {
  CREDIBILITY_LABELS,
  SOURCE_ROLE_LABELS,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";
import {
  CredibilityCautionPill,
  ROLE_WEIGHT_NOTES,
  credibilityLine,
  fmtDate,
  rolesLine,
  weighingGuidance,
} from "../source-ui";

// ---------------------------------------------------------------------------
// Definition block row — label faint 11px, value 13px
// ---------------------------------------------------------------------------

function Def({
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
      <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Article sections
// ---------------------------------------------------------------------------

function GoodForSection({ src }: { src: Source }) {
  return (
    <section>
      <h2 className="text-[13px] font-medium text-ink">
        What this source is good for
      </h2>
      {src.roles.length > 0 ? (
        <div className="mt-2 max-w-2xl space-y-2.5">
          {src.roles.map((r) => (
            <p key={r} className="text-[13px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">{SOURCE_ROLE_LABELS[r]}.</span>{" "}
              {ROLE_WEIGHT_NOTES[r]}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-ink-faint">
          No roles recorded. Assign at least one role so evidence from this source
          is weighted consistently across the workflow.
        </p>
      )}
    </section>
  );
}

function RecordSection({
  src,
  observationCount,
  signalCount,
}: {
  src: Source;
  observationCount: number;
  signalCount: number;
}) {
  return (
    <section>
      <dl className="grid max-w-2xl gap-x-8 gap-y-4 sm:grid-cols-2">
        <Def label="Type">{SOURCE_TYPE_LABELS[src.sourceType]}</Def>
        <Def label="URL">
          {src.url ? (
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-accent-ink underline decoration-line-strong underline-offset-2 hover:decoration-accent"
            >
              {src.url}
            </a>
          ) : (
            <span className="text-ink-faint">No URL recorded</span>
          )}
        </Def>
        <Def label="Credibility" wide>
          {credibilityLine(src)}
        </Def>
        <Def label="Roles" wide>
          {src.roles.length > 0 ? (
            rolesLine(src.roles)
          ) : (
            <span className="text-ink-faint">No roles recorded</span>
          )}
        </Def>
        <ViewGate min="analyst">
          <Def label="Bias tags" wide>
            <SourceBiasTags tags={src.biasTags} />
          </Def>
          <Def label="Notes" wide>
            {src.notes.trim() ? (
              src.notes
            ) : (
              <span className="text-ink-faint">No notes recorded.</span>
            )}
          </Def>
        </ViewGate>
        <Def label="Linked evidence">
          {observationCount} observation{observationCount === 1 ? "" : "s"} ·{" "}
          {signalCount} signal{signalCount === 1 ? "" : "s"}
        </Def>
        <ViewGate min="methodology">
          <Def label="Added">{fmtDate(src.dateAdded)}</Def>
        </ViewGate>
      </dl>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Source record (advanced) — the record's own dates, honestly worded: real
// timestamps only, "checked" only when a check was recorded, fetch dates
// only when the live scan actually wrote them.
// ---------------------------------------------------------------------------

/** Full date plus relative age, e.g. "12 Mar 2026 · 4mo ago". */
function DatedValue({ iso }: { iso: string }) {
  return (
    <span>
      {fullDate(iso)} <span className="text-ink-faint">· {relativeAge(iso)}</span>
    </span>
  );
}

function SourceRecordSection({
  src,
  observationCount,
  signalCount,
}: {
  src: Source;
  observationCount: number;
  signalCount: number;
}) {
  const items: Array<{ label: string; value: React.ReactNode }> = [
    { label: "First added", value: <DatedValue iso={src.dateAdded} /> },
    {
      label: "Last checked",
      value: src.lastCheckedAt ? (
        <DatedValue iso={src.lastCheckedAt} />
      ) : (
        <span className="text-ink-faint">
          Never checked — ages shown come from the record itself
        </span>
      ),
    },
  ];
  if (src.lastSuccessfulFetchAt) {
    items.push({
      label: "Last successful fetch",
      value: <DatedValue iso={src.lastSuccessfulFetchAt} />,
    });
  }
  if (src.lastFailedFetchAt) {
    items.push({
      label: "Last failed fetch",
      value: <DatedValue iso={src.lastFailedFetchAt} />,
    });
  }
  items.push(
    { label: "Linked observations", value: observationCount },
    { label: "Linked signals", value: signalCount },
  );

  return (
    <section aria-label="Source record">
      <h2 className="text-[13px] font-medium text-ink">Source record</h2>
      {src.url ? (
        <div className="mt-1.5">
          <SourceLine source={src} checkedAt={src.lastCheckedAt ?? null} />
        </div>
      ) : null}
      <div className="mt-3 max-w-2xl">
        <AtAGlance items={items} />
      </div>
    </section>
  );
}

function GuidanceSection({
  src,
  observationCount,
  signalCount,
}: {
  src: Source;
  observationCount: number;
  signalCount: number;
}) {
  const lines = weighingGuidance(src);
  const linkedCount = observationCount + signalCount;
  return (
    <section>
      <h2 className="text-[13px] font-medium text-ink">How to use this source</h2>
      <ul className="mt-2 max-w-2xl space-y-2">
        {lines.map((line) => (
          <li key={line} className="text-[12.5px] leading-relaxed text-ink-soft">
            {line}
          </li>
        ))}
      </ul>
      {linkedCount > 0 ? (
        <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-ink-faint">
          Every citation inherits this weighting: the {observationCount} observation
          {observationCount === 1 ? "" : "s"} and {signalCount} signal
          {signalCount === 1 ? "" : "s"} in the relationship trail carry evidence at{" "}
          {CREDIBILITY_LABELS[src.credibility].toLowerCase()}.
        </p>
      ) : null}
      <p className="mt-2 text-[11px] text-ink-faint">
        Generated from the recorded credibility and roles — update the source record
        if either judgement has changed.
      </p>
    </section>
  );
}

function MethodologySection({ src }: { src: Source }) {
  return (
    <section>
      <h2 className="text-[13px] font-medium text-ink">Assessment methodology</h2>
      <dl className="mt-2 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((n) => (
          <div key={n} className="flex gap-3">
            <dt className="w-4 shrink-0 font-mono text-[11px] leading-[1.7] text-ink-faint">
              {n}
            </dt>
            <dd className="text-[12.5px] text-ink-soft">
              {CREDIBILITY_LABELS[n]}
              {src.credibility === n ? (
                <span className="text-ink-faint"> (this source)</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
        Credibility says how much to trust a source. Role says what job it does.
        Judge them separately — a source can be great for discovery and weak for
        proof. A social platform is often strong discovery but weak validation,
        while a government report is strong validation but slow discovery. Sources
        scoring 2 or below are safe for discovery, unsafe for validation.
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SourceDetailPage() {
  const hydrated = useHydrated();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const sources = useIntelligenceStore((s) => s.sources);
  const observations = useIntelligenceStore((s) => s.observations);
  const signals = useIntelligenceStore((s) => s.signals);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const scenarios = useIntelligenceStore((s) => s.scenarios);

  if (!hydrated) {
    return (
      <>
        <Breadcrumbs items={[{ label: "Source Library", href: "/sources" }]} />
        <PageHeader title="Source" />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const src = sources.find((s) => s.id === id);

  if (!src) {
    return (
      <>
        <Breadcrumbs
          items={[{ label: "Source Library", href: "/sources" }, { label: id }]}
        />
        <PageHeader title="Source not found" />
        <EmptyState
          message={`No source with id ${id} exists in the library. It may have been removed, or the id may be mistyped. Sources are recorded in the Source Library so that every observation and signal can be traced back to weighted evidence.`}
          actionLabel="Back to Source Library"
          actionHref="/sources"
        />
      </>
    );
  }

  const linkedObservations = observations.filter((o) => o.sourceId === src.id);
  const linkedSignals = signals.filter((sg) => sg.sourceIds.includes(src.id));
  const signalIdSet = new Set(linkedSignals.map((sg) => sg.id));
  const intersects = (ids: string[]) => ids.some((sid) => signalIdSet.has(sid));

  const linkedClusters = clusters.filter((c) => intersects(c.signalIds));
  const linkedPatterns = patterns.filter((p) => intersects(p.keySignalIds));
  const linkedDrivers = drivers.filter((d) => intersects(d.signalIds));
  const linkedScenarios = scenarios.filter((sc) => intersects(sc.supportingSignalIds));

  const groups: RelatedGroup[] = [
    {
      heading: "Observations",
      kind: "observation",
      items: linkedObservations.map((o) => ({ id: o.id, title: o.title })),
      emptyNote:
        "No observations cite this source. Observations record their source when captured in the Scan Inbox.",
    },
    {
      heading: "Signals",
      kind: "signal",
      items: linkedSignals.map((sg) => ({ id: sg.id, title: sg.title })),
      emptyNote:
        "No signals cite this source. Signals list their sources when promoted from observations.",
    },
    {
      heading: "Clusters",
      kind: "cluster",
      items: linkedClusters.map((c) => ({ id: c.id, title: c.name })),
      emptyNote:
        "No clusters rest on signals from this source yet — clusters inherit their evidence from linked signals.",
    },
    {
      heading: "Patterns",
      kind: "pattern",
      items: linkedPatterns.map((p) => ({ id: p.id, title: p.name })),
      emptyNote:
        "No patterns rest on signals from this source yet — patterns inherit their evidence from key signals.",
    },
    {
      heading: "Drivers",
      kind: "driver",
      items: linkedDrivers.map((d) => ({ id: d.id, title: d.name })),
      emptyNote:
        "No drivers rest on signals from this source yet — drivers cite the signals whose patterns they explain.",
    },
    {
      heading: "Scenarios",
      kind: "scenario",
      items: linkedScenarios.map((sc) => ({ id: sc.id, title: sc.title })),
      emptyNote:
        "No scenarios rest on signals from this source yet — scenarios link supporting signals as evidence.",
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Source Library", href: "/sources" }, { label: src.name }]}
      />
      <PageHeader
        title={src.name}
        description={SOURCE_TYPE_LABELS[src.sourceType]}
        actions={
          src.credibility <= 2 || src.isDemo ? (
            <div className="flex flex-col items-end gap-1">
              {src.credibility <= 2 ? <CredibilityCautionPill /> : null}
              {src.isDemo ? <DemoTag /> : null}
            </div>
          ) : undefined
        }
      />
      <div className="-mt-4 mb-6 space-y-1.5">
        <ViewGate min="analyst">
          <IdChip id={src.id} />
        </ViewGate>
        <DepthHint>Bias tags, weighting guidance and the credibility scale</DepthHint>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="space-y-8">
          <GoodForSection src={src} />
          <RecordSection
            src={src}
            observationCount={linkedObservations.length}
            signalCount={linkedSignals.length}
          />
          <ViewGate min="analyst">
            <SourceRecordSection
              src={src}
              observationCount={linkedObservations.length}
              signalCount={linkedSignals.length}
            />
            <GuidanceSection
              src={src}
              observationCount={linkedObservations.length}
              signalCount={linkedSignals.length}
            />
          </ViewGate>
          <ViewGate min="methodology">
            <MethodologySection src={src} />
          </ViewGate>
        </div>
        <div className="mt-10 lg:mt-0">
          <RelatedObjectsPanel groups={groups} />
        </div>
      </div>
    </>
  );
}
