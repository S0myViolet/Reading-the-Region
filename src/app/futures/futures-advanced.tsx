"use client";

/**
 * Advanced-mode view for the Futures route. Page-local by design — nothing
 * here is imported outside src/app/futures/.
 *
 * Where Simple Mode folds the upper layers into stories, tensions and
 * possibilities, the advanced view keeps the interpretation layers distinct:
 * clusters, patterns, contradictions, drivers, territories and scenarios,
 * each named as itself, each row linking to its detail page and each section
 * linking to its full section page. No tabs — a vertical run of short
 * sections, five rows at most per layer.
 */

import Link from "next/link";
import { PipelineStageBadge } from "@/components/PipelineStageBadge";
import type { PipelineStage } from "@/lib/pipeline";
import { explainContradiction } from "@/lib/explain";
import type {
  Cluster,
  ClusterStatus,
  Contradiction,
  Driver,
  DriverStatus,
  FutureTerritory,
  Pattern,
  PatternValidationStatus,
  Scenario,
} from "@/lib/types";
import {
  PATTERN_TYPE_LABELS,
  SCENARIO_HORIZON_LABELS,
  SCENARIO_TYPE_LABELS,
  TERRITORY_MONITORING_LABELS,
} from "@/lib/types";

const MAX_ROWS = 5;

/** Plain status words — no pills; default states stay quiet text. */
const CLUSTER_STATUS_WORDS: Record<ClusterStatus, string> = {
  candidate: "Candidate",
  valid: "Valid",
  dissolved: "Dissolved",
};

const PATTERN_VALIDATION_WORDS: Record<PatternValidationStatus, string> = {
  hypothesis: "Hypothesis",
  partially_validated: "Partially validated",
  validated: "Validated",
};

const DRIVER_STATUS_WORDS: Record<DriverStatus, string> = {
  hypothesis: "Hypothesis",
  validated: "Validated",
};

// ---------------------------------------------------------------------------
// Section and row primitives
// ---------------------------------------------------------------------------

function LayerSection({
  heading,
  definition,
  stage,
  href,
  emptyNote,
  count,
  children,
}: {
  heading: string;
  definition: string;
  stage: PipelineStage;
  href: string;
  emptyNote: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={heading} className="max-w-2xl">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[13px] font-medium text-ink">{heading}</h2>
        <PipelineStageBadge stage={stage} />
      </div>
      <p className="mt-0.5 text-[12px] text-ink-faint">{definition}</p>
      {count > 0 ? (
        <>
          <ul className="mt-1">{children}</ul>
          <p className="mt-2">
            <Link
              href={href}
              className="text-[11.5px] text-ink-faint underline-offset-2 hover:text-ink-soft hover:underline"
            >
              View all in {heading}
            </Link>
          </p>
        </>
      ) : (
        <p className="mt-2 text-[12px] text-ink-faint">{emptyNote}</p>
      )}
    </section>
  );
}

function LayerRow({
  href,
  title,
  meta,
  sub,
}: {
  href: string;
  title: string;
  meta?: string;
  sub?: string;
}) {
  return (
    <li className="border-b border-line py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href={href}
          className="min-w-0 truncate text-[13px] font-medium text-ink hover:text-accent-ink"
        >
          {title}
        </Link>
        {meta ? (
          <span className="shrink-0 text-[11.5px] text-ink-faint">{meta}</span>
        ) : null}
      </div>
      {sub ? <p className="mt-0.5 truncate text-[12px] text-ink-faint">{sub}</p> : null}
    </li>
  );
}

// ---------------------------------------------------------------------------
// The distinct-layers view
// ---------------------------------------------------------------------------

export function LayersView({
  clusters,
  patterns,
  contradictions,
  drivers,
  territories,
  scenarios,
}: {
  clusters: Cluster[];
  patterns: Pattern[];
  contradictions: Contradiction[];
  drivers: Driver[];
  territories: FutureTerritory[];
  scenarios: Scenario[];
}) {
  return (
    <div className="space-y-10">
      <LayerSection
        heading="Signal Clusters"
        definition="Groups of signals sharing one underlying logic — candidates until the evidence thresholds pass."
        stage="cluster"
        href="/clusters"
        emptyNote="No clusters yet. Clusters form when several validated signals answer the same unifying question."
        count={clusters.length}
      >
        {clusters.slice(0, MAX_ROWS).map((c) => (
          <LayerRow
            key={c.id}
            href={`/clusters/${c.id}`}
            title={c.name}
            meta={`${CLUSTER_STATUS_WORDS[c.status]} · ${c.signalIds.length} signal${
              c.signalIds.length === 1 ? "" : "s"
            }`}
          />
        ))}
      </LayerSection>

      <LayerSection
        heading="Patterns"
        definition="One movement repeating across clusters, tested for breadth, depth, persistence and coherence."
        stage="pattern"
        href="/patterns"
        emptyNote="No patterns yet. Patterns emerge when the same movement repeats across several clusters."
        count={patterns.length}
      >
        {patterns.slice(0, MAX_ROWS).map((p) => (
          <LayerRow
            key={p.id}
            href={`/patterns/${p.id}`}
            title={p.name}
            meta={`${PATTERN_VALIDATION_WORDS[p.validationStatus]} · ${
              PATTERN_TYPE_LABELS[p.patternType]
            }`}
          />
        ))}
      </LayerSection>

      <LayerSection
        heading="Contradictions"
        definition="Credible evidence pulling in two directions at once — where the future is still being decided."
        stage="contradiction"
        href="/contradictions"
        emptyNote="No contradictions yet. A base without tension is usually under-scanned."
        count={contradictions.length}
      >
        {contradictions.slice(0, MAX_ROWS).map((c) => (
          <LayerRow
            key={c.id}
            href={`/contradictions/${c.id}`}
            title={c.name}
            sub={explainContradiction(c)}
          />
        ))}
      </LayerSection>

      <LayerSection
        heading="Drivers"
        definition="Deeper forces proposed to explain several patterns at once — hypotheses until validated."
        stage="driver"
        href="/drivers"
        emptyNote="No drivers yet. Driver hypotheses form where several patterns share one explanation."
        count={drivers.length}
      >
        {drivers.slice(0, MAX_ROWS).map((d) => (
          <LayerRow
            key={d.id}
            href={`/drivers/${d.id}`}
            title={d.name}
            meta={DRIVER_STATUS_WORDS[d.status]}
          />
        ))}
      </LayerSection>

      <LayerSection
        heading="Future Territories"
        definition="Larger directions where patterns and drivers converge, monitored as evidence moves."
        stage="territory"
        href="/territories"
        emptyNote="No territories yet. Territories are mapped where several drivers converge on one larger shift."
        count={territories.length}
      >
        {territories.slice(0, MAX_ROWS).map((t) => (
          <LayerRow
            key={t.id}
            href={`/territories/${t.id}`}
            title={t.name}
            meta={TERRITORY_MONITORING_LABELS[t.monitoringStatus]}
          />
        ))}
      </LayerSection>

      <LayerSection
        heading="Scenarios"
        definition="Possible future worlds written from territory evidence — explorations, not predictions."
        stage="scenario"
        href="/scenarios"
        emptyNote="No scenarios yet. Scenarios are written once a territory is well-enough evidenced to explore."
        count={scenarios.length}
      >
        {scenarios.slice(0, MAX_ROWS).map((s) => (
          <LayerRow
            key={s.id}
            href={`/scenarios/${s.id}`}
            title={s.title}
            meta={`${SCENARIO_TYPE_LABELS[s.scenarioType]} · ${
              SCENARIO_HORIZON_LABELS[s.horizon]
            }`}
          />
        ))}
      </LayerSection>
    </div>
  );
}
