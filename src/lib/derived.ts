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

// ---------------------------------------------------------------------------
// Advanced Overview: evidence triage and stage movement
// ---------------------------------------------------------------------------

import { signalStage, type PipelineStage } from "./pipeline";
import { promotionCriteriaMet } from "./validation";
import {
  CONFIDENCE_LABELS,
  CREDIBILITY_LABELS,
  BIAS_TAG_LABELS,
  REVIEW_STATUS_LABELS,
  type ConfidenceLevel,
} from "./types";

export interface TriageItem {
  signal: Signal;
  reason: string;
}

export interface TriageGroup {
  key: string;
  title: string;
  caption: string;
  items: TriageItem[];
}

/**
 * What needs analyst attention, grouped by the reason it is unsafe to rely
 * on. A signal can appear under more than one lens — the lenses are
 * different failure modes, not exclusive bins.
 */
export function evidenceTriage(d: IntelligenceData): TriageGroup[] {
  const live = d.signals.filter(
    (s) => !["rejected", "archived_noise", "duplicate"].includes(s.reviewStatus),
  );
  const srcById = new Map(d.sources.map((s) => [s.id, s]));

  const groups: TriageGroup[] = [
    {
      key: "novel_thin",
      title: "High novelty, low evidence",
      caption: "One repetition from mattering, one correction from noise.",
      items: live
        .filter((s) => s.scores.novelty >= 4 && s.scores.evidence <= 2)
        .map((s) => ({
          signal: s,
          reason: `Novelty ${s.scores.novelty}/5 on evidence ${s.scores.evidence}/5 — needs an independent source before it carries weight.`,
        })),
    },
    {
      key: "evidence_outruns_reading",
      title: "Strong evidence, cautious interpretation",
      caption: "The evidence base has outrun the stated confidence — review the reading.",
      items: live
        .filter((s) => s.scores.evidence >= 4 && s.confidence !== "high")
        .map((s) => ({
          signal: s,
          reason: `Evidence ${s.scores.evidence}/5 yet ${CONFIDENCE_LABELS[s.confidence].toLowerCase()} — the interpretation may be lagging the base.`,
        })),
    },
    {
      key: "bias_warning",
      title: "Source bias warning",
      caption: "Leaning on low-credibility or bias-tagged sourcing.",
      items: live
        .flatMap((s) => {
          const weak = s.sourceIds
            .map((id) => srcById.get(id))
            .find((src) => src && src.credibility <= 2 && src.biasTags.length > 0);
          return weak
            ? [{
                signal: s,
                reason: `Leans on ${weak.name} — ${CREDIBILITY_LABELS[weak.credibility].toLowerCase()}, ${weak.biasTags.slice(0, 2).map((t) => BIAS_TAG_LABELS[t].toLowerCase()).join(", ")}.`,
              }]
            : [];
        }),
    },
    {
      key: "contradicted",
      title: "Contradiction detected",
      caption: "Tension on record and no validating review yet.",
      items: live
        .filter((s) => s.contradictionIds.length > 0 && s.reviewStatus !== "validated")
        .map((s) => {
          const con = d.contradictions.find((c) => s.contradictionIds.includes(c.id));
          return {
            signal: s,
            reason: con
              ? `Cut against by “${con.name}” and not yet validated.`
              : "Carries a contradiction and is not yet validated.",
          };
        }),
    },
    {
      key: "review_required",
      title: "Human review required",
      caption: "The methodology will not let these carry weight unreviewed.",
      items: signalsNeedingReview(d).map((s) => ({
        signal: s,
        reason: `Marked ${REVIEW_STATUS_LABELS[s.reviewStatus].toLowerCase()}.`,
      })),
    },
  ];

  return groups
    .map((g) => ({ ...g, items: g.items.slice(0, 3) }))
    .filter((g) => g.items.length > 0);
}

export interface StageMovement {
  fromStage: PipelineStage;
  toStage: PipelineStage;
  title: string;
  href: string;
  /** Why the record sits at its stage — always derived, never invented. */
  basis: string;
  evidenceCount: number;
  confidence: ConfidenceLevel | null;
  reviewNote: string;
  when: string;
}

/**
 * The most recent movements through the pipeline, ordered by each record's
 * last update. The store keeps no transition log, so this is honestly
 * framed as "recent movement", not "today".
 */
export function recentStageMovements(d: IntelligenceData, limit = 6): StageMovement[] {
  const moves: StageMovement[] = [];

  for (const o of d.observations) {
    if (o.status !== "promoted" || !o.promotedSignalId) continue;
    const sig = d.signals.find((s) => s.id === o.promotedSignalId);
    if (!sig) continue;
    moves.push({
      fromStage: "observation",
      toStage: signalStage(sig),
      title: sig.title,
      href: `/signals/${sig.id}`,
      basis: `Met ${promotionCriteriaMet(o)} of 9 promotion criteria at triage.`,
      evidenceCount: sig.sourceIds.length,
      confidence: sig.confidence,
      reviewNote: REVIEW_STATUS_LABELS[sig.reviewStatus],
      when: sig.updatedAt,
    });
  }
  for (const s of d.signals) {
    if (s.reviewStatus !== "validated") continue;
    moves.push({
      fromStage: "signal_candidate",
      toStage: "valid_signal",
      title: s.title,
      href: `/signals/${s.id}`,
      basis: "Human review confirmed the reading against its evidence.",
      evidenceCount: s.sourceIds.length,
      confidence: s.confidence,
      reviewNote: "Human reviewed",
      when: s.updatedAt,
    });
  }
  for (const c of d.clusters) {
    moves.push({
      fromStage: "valid_signal",
      toStage: "cluster",
      title: c.name,
      href: `/clusters/${c.id}`,
      basis: `Groups ${c.signalIds.length} signals under one unifying question.`,
      evidenceCount: c.signalIds.length,
      confidence: c.confidence,
      reviewNote: c.status === "valid" ? "Valid cluster" : "Candidate — below threshold",
      when: c.updatedAt,
    });
  }
  for (const p of d.patterns) {
    moves.push({
      fromStage: "cluster",
      toStage: "pattern",
      title: p.name,
      href: `/patterns/${p.id}`,
      basis: `Repeats across ${p.clusterIds.length} cluster${p.clusterIds.length === 1 ? "" : "s"} and ${p.keySignalIds.length} signals.`,
      evidenceCount: p.keySignalIds.length,
      confidence: p.confidence,
      reviewNote: p.validationStatus === "validated" ? "Validated" : "Not yet validated",
      when: p.updatedAt,
    });
  }
  for (const t of d.territories) {
    moves.push({
      fromStage: "driver",
      toStage: "territory",
      title: t.name,
      href: `/territories/${t.id}`,
      basis: `${t.driverIds.length} drivers converge here.`,
      evidenceCount: t.representativeSignalIds.length,
      confidence: t.confidence,
      reviewNote: t.monitoringStatus,
      when: t.updatedAt,
    });
  }

  return moves.sort((a, b) => b.when.localeCompare(a.when)).slice(0, limit);
}
