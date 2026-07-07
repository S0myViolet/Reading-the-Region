"use client";

/**
 * Source detail — the full record of one source: its type, credibility,
 * roles, bias tags, and every piece of evidence that traces back to it.
 * The guidance card translates credibility + roles into how material from
 * this source should be weighted when evidence moves up the pyramid.
 */

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { DemoTag, IdChip, SourceCredibilityBadge } from "@/components/badges";
import { SourceBiasTags } from "@/components/tags";
import { RelatedObjectsPanel, type RelatedGroup } from "@/components/EntityLink";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import type { Source } from "@/lib/types";
import { SOURCE_ROLE_LABELS, SOURCE_TYPE_LABELS } from "@/lib/types";
import { ROLE_WEIGHT_NOTES, fmtDate, weighingGuidance } from "../source-ui";

// ---------------------------------------------------------------------------
// Facts card
// ---------------------------------------------------------------------------

function FactsCard({
  src,
  observationCount,
  signalCount,
}: {
  src: Source;
  observationCount: number;
  signalCount: number;
}) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h2 className="overline-label">Source record</h2>
      </header>
      <dl className="space-y-3 px-4 py-3">
        <div>
          <dt className="overline-label">Type</dt>
          <dd className="mt-0.5 text-[13px] text-ink-soft">
            {SOURCE_TYPE_LABELS[src.sourceType]}
          </dd>
        </div>
        <div>
          <dt className="overline-label">URL</dt>
          <dd className="mt-0.5 text-[13px]">
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
          </dd>
        </div>
        <div>
          <dt className="overline-label">Credibility</dt>
          <dd className="mt-1">
            <SourceCredibilityBadge score={src.credibility} />
            <p className="mt-1 text-[11.5px] text-ink-faint">
              Credibility scores trust in the source&apos;s claims on their own. It is
              assessed separately from role — a credible source can still be the wrong
              tool for a given job.
            </p>
          </dd>
        </div>
        <div>
          <dt className="overline-label">Roles</dt>
          <dd className="mt-1">
            {src.roles.length > 0 ? (
              <ul className="space-y-2">
                {src.roles.map((r) => (
                  <li key={r} className="border-l-2 border-line pl-2.5">
                    <p className="text-[12.5px] font-medium text-ink">
                      {SOURCE_ROLE_LABELS[r]}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-faint">
                      {ROLE_WEIGHT_NOTES[r]}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11.5px] text-ink-faint">
                No roles recorded. Assign at least one role so evidence from this
                source is weighted consistently across the workflow.
              </p>
            )}
          </dd>
        </div>
        <div>
          <dt className="overline-label">Bias tags</dt>
          <dd className="mt-1">
            <SourceBiasTags tags={src.biasTags} />
          </dd>
        </div>
        <div>
          <dt className="overline-label">Notes</dt>
          <dd className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">
            {src.notes.trim() ? (
              src.notes
            ) : (
              <span className="text-ink-faint">No notes recorded.</span>
            )}
          </dd>
        </div>
        <div className="grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
          <div>
            <dt className="overline-label">Date added</dt>
            <dd className="mt-0.5 text-[12.5px] text-ink-soft">
              {fmtDate(src.dateAdded)}
            </dd>
          </div>
          <div>
            <dt className="overline-label">Linked evidence</dt>
            <dd className="mt-0.5 font-mono text-[12px] text-ink-soft">
              {observationCount} observation{observationCount === 1 ? "" : "s"} ·{" "}
              {signalCount} signal{signalCount === 1 ? "" : "s"}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Weighting guidance card
// ---------------------------------------------------------------------------

function GuidanceCard({ src }: { src: Source }) {
  const lines = weighingGuidance(src);
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">How to weigh this source</h3>
      </header>
      <ul className="space-y-2 px-4 py-3">
        {lines.map((line) => (
          <li
            key={line}
            className="border-l-2 border-line pl-2.5 text-[12.5px] leading-relaxed text-ink-soft"
          >
            {line}
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-4 py-2 text-[11px] text-ink-faint">
        Generated from the recorded credibility and roles — update the source record
        if either judgement has changed.
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
        <PageHeader overline="Scan & Classify" title="Source" />
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
        <PageHeader overline="Scan & Classify" title="Source not found" />
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
        overline="Scan & Classify"
        title={src.name}
        description={`${SOURCE_TYPE_LABELS[src.sourceType]} · added ${fmtDate(src.dateAdded)}`}
        actions={
          <div className="flex flex-col items-end gap-1">
            <SourceCredibilityBadge score={src.credibility} />
            {src.isDemo ? (
              <span className="flex items-center gap-1.5">
                <DemoTag />
                <span className="text-[11px] text-ink-faint">
                  Sample source for demonstration — not a citation
                </span>
              </span>
            ) : null}
          </div>
        }
      />
      <div className="mb-4">
        <IdChip id={src.id} />
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        <div className="space-y-5">
          <FactsCard
            src={src}
            observationCount={linkedObservations.length}
            signalCount={linkedSignals.length}
          />
          <GuidanceCard src={src} />
        </div>
        <div className="mt-5 lg:mt-0">
          <RelatedObjectsPanel groups={groups} />
        </div>
      </div>
    </>
  );
}
