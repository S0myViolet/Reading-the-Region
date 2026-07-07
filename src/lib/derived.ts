/**
 * Derived queries over the intelligence dataset: dashboard sections, the
 * management center (system health), task-based guidance, and the global
 * search index. All pure functions over a data snapshot.
 */

import type { IntelligenceData } from "./store";
import type {
  EntityKind,
  MonitoringCadence,
  MonitoringIndicator,
  Observation,
  Signal,
} from "./types";
import { SECTOR_LABELS, SYSTEM_LABELS } from "./types";
import {
  scenarioAssumptionHeavy,
  validateCluster,
  validateImplication,
  validatePattern,
  zoomComplete,
} from "./validation";

// ---------------------------------------------------------------------------
// Pipeline counts
// ---------------------------------------------------------------------------

export function pipelineCounts(d: IntelligenceData): Record<string, number> {
  return {
    observation: d.observations.length,
    signal: d.signals.length,
    cluster: d.clusters.length,
    pattern: d.patterns.length,
    driver: d.drivers.length,
    territory: d.territories.length,
    scenario: d.scenarios.length,
    implication: d.implications.length,
    monitor: d.indicators.length,
  };
}

// ---------------------------------------------------------------------------
// Overview sections
// ---------------------------------------------------------------------------

/** High novelty, low confidence, high strategic relevance — worth attention. */
export function signalsWorthAttention(d: IntelligenceData): Signal[] {
  return d.signals
    .filter(
      (s) =>
        s.scores.novelty >= 4 &&
        s.confidence === "low" &&
        s.scores.strategicRelevance >= 3,
    )
    .sort(
      (a, b) =>
        b.scores.novelty + b.scores.strategicRelevance -
        (a.scores.novelty + a.scores.strategicRelevance),
    );
}

export function signalsNeedingReview(d: IntelligenceData): Signal[] {
  return d.signals.filter(
    (s) =>
      s.reviewStatus === "needs_human_review" ||
      s.reviewStatus === "ai_suggested" ||
      s.reviewStatus === "needs_evidence",
  );
}

/** Contradictions ranked by tension × future impact. */
export function contradictionsEmerging(d: IntelligenceData) {
  return [...d.contradictions].sort(
    (a, b) =>
      b.scores.tensionStrength * b.scores.futureImpact -
      a.scores.tensionStrength * a.scores.futureImpact,
  );
}

/** Territories whose indicators have recently strengthened. */
export function strengtheningTerritories(d: IntelligenceData) {
  return d.territories
    .map((t) => {
      const indicators = d.indicators.filter((i) => i.territoryId === t.id);
      const strengthening = indicators.filter((i) => i.trend === "strengthening");
      return { territory: t, indicators, strengthening };
    })
    .filter(
      (x) => x.strengthening.length > 0 || x.territory.monitoringStatus === "strengthening",
    )
    .sort((a, b) => b.strengthening.length - a.strengthening.length);
}

/** Archived / rejected observations with rationale — the noise filter. */
export function noiseArchive(d: IntelligenceData): Observation[] {
  return d.observations.filter(
    (o) => o.status === "archived_noise" || o.status === "duplicate",
  );
}

// ---------------------------------------------------------------------------
// Management center — system health queries
// ---------------------------------------------------------------------------

const CADENCE_DAYS: Record<MonitoringCadence, number> = {
  weekly: 7,
  monthly: 31,
  quarterly: 92,
  biannual: 183,
  annual: 366,
};

export function indicatorOverdue(i: MonitoringIndicator, now = new Date()): boolean {
  const last = new Date(i.dateLastChecked).getTime();
  return (now.getTime() - last) / 86_400_000 > CADENCE_DAYS[i.cadence];
}

export interface ManagementItem {
  title: string;
  count: number;
  detail: string;
  href: string;
  items: Array<{ id: string; label: string; href: string }>;
}

export function managementCenter(d: IntelligenceData): ManagementItem[] {
  const needsReview = [
    ...d.signals.filter((s) =>
      ["needs_human_review", "ai_suggested"].includes(s.reviewStatus),
    ).map((s) => ({ id: s.id, label: s.title, href: `/signals/${s.id}` })),
    ...d.territories.filter((t) => t.reviewStatus === "needs_human_review")
      .map((t) => ({ id: t.id, label: t.name, href: `/territories/${t.id}` })),
    ...d.scenarios.filter((s) => s.reviewStatus === "needs_human_review")
      .map((s) => ({ id: s.id, label: s.title, href: `/scenarios/${s.id}` })),
    ...d.implications.filter((i) => i.reviewStatus === "needs_human_review")
      .map((i) => ({ id: i.id, label: i.implication.slice(0, 80), href: `/implications` })),
  ];

  const lowEvidenceHighNovelty = d.signals.filter(
    (s) => s.scores.evidence <= 2 && s.scores.novelty >= 4,
  );
  const relevantUnclustered = d.signals.filter(
    (s) => s.scores.strategicRelevance >= 4 && s.clusterIds.length === 0,
  );
  const candidateClusters = d.clusters.filter(
    (c) => !validateCluster(c, d.signals, d.sources).valid,
  );
  const patternsMissingPersistence = d.patterns.filter(
    (p) => !validatePattern(p, d.signals).checks.find((c) => c.label === "Persistence test")?.passed,
  );
  const driverHypotheses = d.drivers.filter((dr) => dr.status === "hypothesis");
  const territoriesNoIndicators = d.territories.filter(
    (t) => t.leadingIndicatorIds.length === 0,
  );
  const assumptionHeavyScenarios = d.scenarios.filter(scenarioAssumptionHeavy);
  const implicationsNoEvidence = d.implications.filter(
    (i) => !validateImplication(i).checks.find((c) => c.label === "Evidence-linked")?.passed,
  );
  const overdueIndicators = d.indicators.filter((i) => indicatorOverdue(i));
  const lowCredSources = d.sources.filter((s) => s.credibility <= 2);
  const noiseObjects = d.observations.filter((o) =>
    ["archived_noise", "duplicate"].includes(o.status),
  );

  return [
    {
      title: "Items needing human review",
      count: needsReview.length,
      detail: "Signals, territories, scenarios and implications awaiting a human decision.",
      href: "/signals?review=needs_human_review",
      items: needsReview.slice(0, 5),
    },
    {
      title: "Low evidence, high novelty signals",
      count: lowEvidenceHighNovelty.length,
      detail: "Potentially important but weakly evidenced — strengthen or archive.",
      href: "/signals?attention=novelty",
      items: lowEvidenceHighNovelty.map((s) => ({ id: s.id, label: s.title, href: `/signals/${s.id}` })).slice(0, 5),
    },
    {
      title: "High strategic relevance, no cluster",
      count: relevantUnclustered.length,
      detail: "Strong signals not yet connected to any cluster candidate.",
      href: "/signals?unclustered=1",
      items: relevantUnclustered.map((s) => ({ id: s.id, label: s.title, href: `/signals/${s.id}` })).slice(0, 5),
    },
    {
      title: "Candidate clusters below threshold",
      count: candidateClusters.length,
      detail: "Clusters that have not met validation thresholds. Do not treat as patterns.",
      href: "/clusters",
      items: candidateClusters.map((c) => ({ id: c.id, label: c.name, href: `/clusters/${c.id}` })).slice(0, 5),
    },
    {
      title: "Patterns missing persistence evidence",
      count: patternsMissingPersistence.length,
      detail: "Breadth without time depth — gather evidence across a longer window.",
      href: "/patterns",
      items: patternsMissingPersistence.map((p) => ({ id: p.id, label: p.name, href: `/patterns/${p.id}` })).slice(0, 5),
    },
    {
      title: "Drivers still marked as hypotheses",
      count: driverHypotheses.length,
      detail: "Not yet validated — must explain ≥3 patterns with sufficient evidence.",
      href: "/drivers",
      items: driverHypotheses.map((dr) => ({ id: dr.id, label: dr.name, href: `/drivers/${dr.id}` })).slice(0, 5),
    },
    {
      title: "Territories missing leading indicators",
      count: territoriesNoIndicators.length,
      detail: "A territory without indicators cannot be monitored.",
      href: "/territories",
      items: territoriesNoIndicators.map((t) => ({ id: t.id, label: t.name, href: `/territories/${t.id}` })).slice(0, 5),
    },
    {
      title: "Assumption-heavy scenarios",
      count: assumptionHeavyScenarios.length,
      detail: "More assumptions than evidence links — review before using for strategy.",
      href: "/scenarios",
      items: assumptionHeavyScenarios.map((s) => ({ id: s.id, label: s.title, href: `/scenarios/${s.id}` })).slice(0, 5),
    },
    {
      title: "Implications missing evidence links",
      count: implicationsNoEvidence.length,
      detail: "Recommendations must connect back to signals or drivers.",
      href: "/implications",
      items: implicationsNoEvidence.map((i) => ({ id: i.id, label: i.implication.slice(0, 80), href: `/implications` })).slice(0, 5),
    },
    {
      title: "Monitoring indicators overdue",
      count: overdueIndicators.length,
      detail: "Past their review cadence — check and update their status.",
      href: "/monitoring?overdue=1",
      items: overdueIndicators.map((i) => ({ id: i.id, label: i.name, href: `/monitoring` })).slice(0, 5),
    },
    {
      title: "Low credibility sources in use",
      count: lowCredSources.length,
      detail: "Credibility ≤ 2 — useful for discovery, unsafe for validation.",
      href: "/sources?credibility=low",
      items: lowCredSources.map((s) => ({ id: s.id, label: s.name, href: `/sources/${s.id}` })).slice(0, 5),
    },
    {
      title: "Objects marked duplicate or noise",
      count: noiseObjects.length,
      detail: "The noise archive — kept with rationale so filtering stays auditable.",
      href: "/inbox?status=archived_noise",
      items: noiseObjects.map((o) => ({ id: o.id, label: o.title, href: `/inbox/${o.id}` })).slice(0, 5),
    },
  ];
}

// ---------------------------------------------------------------------------
// Task-based guidance
// ---------------------------------------------------------------------------

export interface GuidanceTask {
  text: string;
  href: string;
}

export function guidanceTasks(d: IntelligenceData): GuidanceTask[] {
  const tasks: GuidanceTask[] = [];
  const unreviewed = d.observations.filter((o) => o.status === "unreviewed");
  if (unreviewed.length > 0)
    tasks.push({
      text: `Review ${unreviewed.length} new observation${unreviewed.length === 1 ? "" : "s"} in the Scan Inbox.`,
      href: "/inbox",
    });

  const incompleteZoom = d.signals.filter((s) => !zoomComplete(s).valid);
  if (incompleteZoom.length > 0)
    tasks.push({
      text: `Complete zooming analysis for ${incompleteZoom.length} signal${incompleteZoom.length === 1 ? "" : "s"} before connecting them to clusters.`,
      href: "/signals?zoom=incomplete",
    });

  const needsReview = signalsNeedingReview(d);
  if (needsReview.length > 0)
    tasks.push({
      text: `${needsReview.length} signal${needsReview.length === 1 ? "" : "s"} awaiting human review.`,
      href: "/signals?review=needs_human_review",
    });

  const candidates = d.clusters.filter((c) => c.status === "candidate");
  if (candidates.length > 0)
    tasks.push({
      text: `${candidates.length} cluster candidate${candidates.length === 1 ? " is" : "s are"} below the validation threshold. Add evidence before validating.`,
      href: "/clusters",
    });

  const hypotheses = d.drivers.filter((dr) => dr.status === "hypothesis");
  if (hypotheses.length > 0)
    tasks.push({
      text: `${hypotheses.length} driver${hypotheses.length === 1 ? " remains a hypothesis" : "s remain hypotheses"} — they explain too few patterns to validate.`,
      href: "/drivers",
    });

  const overdue = d.indicators.filter((i) => indicatorOverdue(i));
  if (overdue.length > 0)
    tasks.push({
      text: `${overdue.length} monitoring indicator${overdue.length === 1 ? " is" : "s are"} overdue for a check.`,
      href: "/monitoring?overdue=1",
    });

  return tasks;
}

// ---------------------------------------------------------------------------
// Global search
// ---------------------------------------------------------------------------

export interface SearchEntry {
  kind: EntityKind;
  id: string;
  title: string;
  snippet: string;
  href: string;
  haystack: string;
}

export function buildSearchIndex(d: IntelligenceData): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const push = (
    kind: EntityKind,
    id: string,
    title: string,
    snippet: string,
    href: string,
    extra: string[],
  ) =>
    entries.push({
      kind,
      id,
      title,
      snippet,
      href,
      haystack: [id, title, snippet, ...extra].join(" ").toLowerCase(),
    });

  d.signals.forEach((s) =>
    push("signal", s.id, s.title, s.description, `/signals/${s.id}`, [
      s.country,
      s.city ?? "",
      ...s.tags,
      ...s.sectors.map((x) => SECTOR_LABELS[x]),
      ...s.systemsAffected.map((x) => SYSTEM_LABELS[x]),
      s.confidence,
      s.timeHorizon,
      s.reviewStatus,
    ]),
  );
  d.observations.forEach((o) =>
    push("observation", o.id, o.title, o.description, `/inbox/${o.id}`, [
      o.country,
      o.city ?? "",
      o.status,
      ...o.sectors.map((x) => SECTOR_LABELS[x]),
    ]),
  );
  d.sources.forEach((s) =>
    push("source", s.id, s.name, s.notes, `/sources/${s.id}`, [s.sourceType]),
  );
  d.clusters.forEach((c) =>
    push("cluster", c.id, c.name, c.clusterStatement, `/clusters/${c.id}`, [c.status]),
  );
  d.patterns.forEach((p) =>
    push("pattern", p.id, p.name, p.patternStatement, `/patterns/${p.id}`, [
      p.validationStatus,
    ]),
  );
  d.contradictions.forEach((c) =>
    push("contradiction", c.id, c.name, c.underlyingTension, `/contradictions/${c.id}`, []),
  );
  d.drivers.forEach((dr) =>
    push("driver", dr.id, dr.name, dr.driverStatement, `/drivers/${dr.id}`, [dr.status]),
  );
  d.territories.forEach((t) =>
    push("territory", t.id, t.name, t.oneLineDefinition, `/territories/${t.id}`, [
      t.monitoringStatus,
    ]),
  );
  d.scenarios.forEach((s) =>
    push("scenario", s.id, s.title, s.corePremise, `/scenarios/${s.id}`, [s.scenarioType]),
  );
  d.implications.forEach((i) =>
    push("implication", i.id, i.implication.slice(0, 90), i.whyItMatters, "/implications", [
      i.implicationType,
    ]),
  );
  d.indicators.forEach((i) =>
    push("indicator", i.id, i.name, i.description, "/monitoring", [i.indicatorType, i.trend]),
  );

  return entries;
}

export function searchEntries(index: SearchEntry[], query: string): SearchEntry[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return index
    .filter((e) => terms.every((t) => e.haystack.includes(t)))
    .slice(0, 30);
}
