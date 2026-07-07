/**
 * Validation logic for the intelligence workflow.
 *
 * These functions enforce the upward-movement rules of the pyramid:
 * observations cannot become signals without promotion criteria, clusters
 * cannot be valid without thresholds, patterns must pass four tests, drivers
 * must explain multiple patterns, and territories must rest on drivers.
 */

import {
  CLUSTER_THRESHOLDS,
  Cluster,
  Driver,
  DRIVER_THRESHOLDS,
  FutureTerritory,
  Observation,
  Pattern,
  PATTERN_THRESHOLDS,
  PROMOTION_CRITERIA,
  PROMOTION_MIN_CRITERIA,
  Scenario,
  Signal,
  Source,
  StrategicImplication,
} from "./types";

export interface ValidationCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface ValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  passedCount: number;
  totalCount: number;
}

function summarize(checks: ValidationCheck[]): ValidationResult {
  const passedCount = checks.filter((c) => c.passed).length;
  return { valid: passedCount === checks.length, checks, passedCount, totalCount: checks.length };
}

// ---------------------------------------------------------------------------
// Observation promotion
// ---------------------------------------------------------------------------

export function promotionCriteriaMet(obs: Observation): number {
  return PROMOTION_CRITERIA.filter(({ key }) => obs.checklist[key]).length;
}

export function canPromoteObservation(obs: Observation): boolean {
  return promotionCriteriaMet(obs) >= PROMOTION_MIN_CRITERIA;
}

// ---------------------------------------------------------------------------
// Signal completeness (zooming is mandatory; no jump from event to future)
// ---------------------------------------------------------------------------

export function zoomComplete(signal: Signal): ValidationResult {
  const z = signal.zoom;
  const checks: ValidationCheck[] = [
    {
      label: "Level 1 — What happened",
      passed: z.whatHappened.trim().length >= 20,
      detail: "A factual account of the event, at least a sentence long.",
    },
    {
      label: "Level 2 — What behaviour changed",
      passed: z.behaviourChanged.trim().length >= 20,
      detail: "The behaviour the event reveals, grounded in the event itself.",
    },
    {
      label: "Level 3 — What system is changing",
      passed: z.systemChanged.trim().length >= 20,
      detail: "The larger system the behaviour connects to.",
    },
    {
      label: "Level 4 — What future becomes more plausible",
      passed: z.futurePlausible.trim().length >= 20,
      detail: "A possible direction, marked speculative if evidence is weak.",
    },
    {
      label: "Speculation flag consistent with evidence",
      passed: signal.scores.evidence >= 3 || z.futureIsSpeculative,
      detail:
        "When the evidence score is below 3, level 4 must be flagged as a speculative possibility.",
    },
  ];
  return summarize(checks);
}

// ---------------------------------------------------------------------------
// Cluster validation
// ---------------------------------------------------------------------------

export function validateCluster(
  cluster: Cluster,
  signals: Signal[],
  sources: Source[],
): ValidationResult {
  const clusterSignals = signals.filter((s) => cluster.signalIds.includes(s.id));
  const sourceIds = new Set(clusterSignals.flatMap((s) => s.sourceIds));
  const independentSources = sources.filter((src) => sourceIds.has(src.id));
  const sectors = new Set(clusterSignals.flatMap((s) => s.sectors));
  const actorTypes = new Set(clusterSignals.flatMap((s) => s.actorTypes));
  const t = CLUSTER_THRESHOLDS;

  const checks: ValidationCheck[] = [
    {
      label: `At least ${t.minSignals} signals`,
      passed: clusterSignals.length >= t.minSignals,
      detail: `${clusterSignals.length} of ${t.minSignals} linked signals.`,
    },
    {
      label: `At least ${t.minIndependentSources} independent sources`,
      passed: independentSources.length >= t.minIndependentSources,
      detail: `${independentSources.length} of ${t.minIndependentSources} independent sources across linked signals.`,
    },
    {
      label: `At least ${t.minSectors} sectors`,
      passed: sectors.size >= t.minSectors,
      detail: `${sectors.size} of ${t.minSectors} sectors represented.`,
    },
    {
      label: `At least ${t.minActorTypes} actor types`,
      passed: actorTypes.size >= t.minActorTypes,
      detail: `${actorTypes.size} of ${t.minActorTypes} actor types represented.`,
    },
    {
      label: "Clear unifying question",
      passed: cluster.unifyingQuestion.trim().length >= 15,
      detail: "The cluster must be organised around one question, not a topic.",
    },
    {
      label: "Clear strategic relevance",
      passed: cluster.scores.strategicRelevance >= t.minStrategicRelevance,
      detail: `Strategic relevance ${cluster.scores.strategicRelevance} (minimum ${t.minStrategicRelevance}).`,
    },
    {
      label: "At least one contradiction or tension identified",
      passed: cluster.contradictionIds.length >= t.minContradictions,
      detail: `${cluster.contradictionIds.length} contradiction(s) linked.`,
    },
    {
      label: `Breadth ≥ ${t.minBreadth}`,
      passed: cluster.scores.breadth >= t.minBreadth,
      detail: `Breadth ${cluster.scores.breadth}.`,
    },
    {
      label: `Depth ≥ ${t.minDepth}`,
      passed: cluster.scores.depth >= t.minDepth,
      detail: `Depth ${cluster.scores.depth}.`,
    },
    {
      label: `Coherence ≥ ${t.minCoherence}`,
      passed: cluster.scores.coherence >= t.minCoherence,
      detail: `Coherence ${cluster.scores.coherence}.`,
    },
  ];
  return summarize(checks);
}

// ---------------------------------------------------------------------------
// Pattern validation — breadth, depth, persistence, coherence
// ---------------------------------------------------------------------------

export function monthsBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.abs(
    (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()),
  );
}

export function validatePattern(pattern: Pattern, signals: Signal[]): ValidationResult {
  const patternSignals = signals.filter((s) => pattern.keySignalIds.includes(s.id));
  const sectors = new Set(patternSignals.flatMap((s) => s.sectors));
  const persistenceMonths = monthsBetween(
    pattern.firstEvidenceDate,
    pattern.latestEvidenceDate,
  );
  const t = PATTERN_THRESHOLDS;

  const checks: ValidationCheck[] = [
    {
      label: "Breadth test",
      passed: sectors.size >= t.minSectors,
      detail: `Appears across ${sectors.size} sectors (minimum ${t.minSectors}).`,
    },
    {
      label: "Depth test",
      passed: pattern.independentSourceCount >= t.minIndependentSources,
      detail: `Supported by ${pattern.independentSourceCount} independent sources (minimum ${t.minIndependentSources}).`,
    },
    {
      label: "Persistence test",
      passed: persistenceMonths >= t.minMonthsPersistence,
      detail: `Evidence spans ${persistenceMonths} months (minimum ${t.minMonthsPersistence}).`,
    },
    {
      label: "Coherence test",
      passed: pattern.patternStatement.trim().length >= 40,
      detail: "Can be explained as one clear movement in a single statement.",
    },
  ];
  return summarize(checks);
}

export function patternStrongThreshold(pattern: Pattern, signals: Signal[]): ValidationResult {
  const patternSignals = signals.filter((s) => pattern.keySignalIds.includes(s.id));
  const sectors = new Set(patternSignals.flatMap((s) => s.sectors));
  const geographies = new Set(patternSignals.map((s) => s.country));
  const actorTypes = new Set(patternSignals.flatMap((s) => s.actorTypes));
  const t = PATTERN_THRESHOLDS;

  const checks: ValidationCheck[] = [
    {
      label: `At least ${t.strongMinSignals} signals`,
      passed: patternSignals.length >= t.strongMinSignals,
      detail: `${patternSignals.length} signals linked.`,
    },
    {
      label: `At least ${t.strongMinSectors} sectors`,
      passed: sectors.size >= t.strongMinSectors,
      detail: `${sectors.size} sectors represented.`,
    },
    {
      label: `At least ${t.strongMinGeographies} geographies`,
      passed: geographies.size >= t.strongMinGeographies,
      detail: `${geographies.size} geographies represented.`,
    },
    {
      label: `At least ${t.strongMinActorTypes} actor types`,
      passed: actorTypes.size >= t.strongMinActorTypes,
      detail: `${actorTypes.size} actor types represented.`,
    },
  ];
  return summarize(checks);
}

// ---------------------------------------------------------------------------
// Driver validation
// ---------------------------------------------------------------------------

export function validateDriver(driver: Driver, signals: Signal[]): ValidationResult {
  const driverSignals = signals.filter((s) => driver.signalIds.includes(s.id));
  const sectors = new Set(driverSignals.flatMap((s) => s.sectors));
  const t = DRIVER_THRESHOLDS;

  const checks: ValidationCheck[] = [
    {
      label: `Explains at least ${t.minPatterns} patterns`,
      passed: driver.patternIds.length >= t.minPatterns,
      detail: `${driver.patternIds.length} pattern(s) connected.`,
    },
    {
      label: `Supported by at least ${t.minSignals} signals`,
      passed: driver.signalIds.length >= t.minSignals,
      detail: `${driver.signalIds.length} signal(s) connected.`,
    },
    {
      label: `Appears across at least ${t.minSectors} sectors`,
      passed: sectors.size >= t.minSectors,
      detail: `${sectors.size} sector(s) represented.`,
    },
    {
      label: `Evidence from at least ${t.minIndependentSources} independent sources`,
      passed: driver.independentSourceCount >= t.minIndependentSources,
      detail: `${driver.independentSourceCount} independent source(s).`,
    },
    {
      label: `At least ${t.minContradictions} contradictions`,
      passed: driver.contradictionIds.length >= t.minContradictions,
      detail: `${driver.contradictionIds.length} contradiction(s) linked.`,
    },
    {
      label: "Produces plausible future scenarios",
      passed: driver.possibleFutures.length >= 1,
      detail: `${driver.possibleFutures.length} possible future(s) articulated.`,
    },
    {
      label: "Clear leading indicators",
      passed: driver.leadingIndicatorIds.length >= 1,
      detail: `${driver.leadingIndicatorIds.length} leading indicator(s) attached.`,
    },
  ];
  return summarize(checks);
}

// ---------------------------------------------------------------------------
// Territory, scenario, and implication linkage rules
// ---------------------------------------------------------------------------

export function validateTerritory(territory: FutureTerritory): ValidationResult {
  const checks: ValidationCheck[] = [
    {
      label: "Rests on at least 2 drivers",
      passed: territory.driverIds.length >= 2,
      detail: `${territory.driverIds.length} driver(s) connected. Territories emerge from converging drivers, not single forces.`,
    },
    {
      label: "Connected to at least 1 pattern",
      passed: territory.patternIds.length >= 1,
      detail: `${territory.patternIds.length} pattern(s) connected.`,
    },
    {
      label: "Contradiction-aware",
      passed: territory.contradictionIds.length >= 1,
      detail: `${territory.contradictionIds.length} contradiction(s) acknowledged.`,
    },
    {
      label: "Representative signals attached",
      passed: territory.representativeSignalIds.length >= 3,
      detail: `${territory.representativeSignalIds.length} representative signal(s).`,
    },
    {
      label: "Monitorable",
      passed: territory.leadingIndicatorIds.length >= 1,
      detail: `${territory.leadingIndicatorIds.length} leading indicator(s). A territory without indicators cannot be tracked.`,
    },
  ];
  return summarize(checks);
}

export function validateScenario(scenario: Scenario): ValidationResult {
  const checks: ValidationCheck[] = [
    {
      label: "Anchored to a future territory",
      passed: scenario.territoryId.trim().length > 0,
      detail: "Every scenario evolves from a territory under stated conditions.",
    },
    {
      label: "Linked to supporting signals",
      passed: scenario.supportingSignalIds.length >= 2,
      detail: `${scenario.supportingSignalIds.length} signal(s) linked.`,
    },
    {
      label: "Linked to drivers",
      passed: scenario.supportingDriverIds.length >= 1,
      detail: `${scenario.supportingDriverIds.length} driver(s) linked.`,
    },
    {
      label: "Shaped by at least one contradiction",
      passed: scenario.shapingContradictionIds.length >= 1,
      detail: `${scenario.shapingContradictionIds.length} contradiction(s) shaping the scenario.`,
    },
    {
      label: "Assumptions declared",
      passed: scenario.assumptions.length >= 1,
      detail: `${scenario.assumptions.length} assumption(s) explicitly labelled.`,
    },
  ];
  return summarize(checks);
}

export function scenarioAssumptionHeavy(scenario: Scenario): boolean {
  const evidenceLinks =
    scenario.supportingSignalIds.length +
    scenario.supportingPatternIds.length +
    scenario.supportingDriverIds.length;
  return scenario.assumptions.length > evidenceLinks;
}

export function validateImplication(imp: StrategicImplication): ValidationResult {
  const checks: ValidationCheck[] = [
    {
      label: "Connected to a territory or scenario",
      passed: imp.territoryId !== null || imp.scenarioId !== null,
      detail: "Implications answer: what should we do differently because this future may be forming?",
    },
    {
      label: "Evidence-linked",
      passed: imp.evidenceSignalIds.length + imp.evidenceDriverIds.length >= 1,
      detail: `${imp.evidenceSignalIds.length + imp.evidenceDriverIds.length} evidence link(s) back down the pyramid.`,
    },
    {
      label: "Actionable recommendation",
      passed: imp.recommendedAction.trim().length >= 20,
      detail: "A concrete present-day action, not a vague direction.",
    },
  ];
  return summarize(checks);
}
