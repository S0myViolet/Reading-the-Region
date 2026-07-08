/**
 * Plain-language explanation generators.
 *
 * The platform never shows a bare score, confidence level, or status without
 * saying why in one readable sentence. Every sentence here is derived from
 * the object's actual data — counts, linked objects, rubric anchors — never
 * invented. If the data cannot support a clause, the clause is omitted.
 */

import type {
  Cluster,
  ConfidenceLevel,
  Contradiction,
  Driver,
  FutureTerritory,
  MonitoringIndicator,
  Pattern,
  Scenario,
  Score,
  Signal,
  SignalScores,
  Source,
  StrategicImplication,
} from "./types";
import {
  CREDIBILITY_LABELS,
  SCORE_DIMENSION_LABELS,
  SCORE_RUBRICS,
  SECTOR_LABELS,
  SYSTEM_LABELS,
} from "./types";
import type { ValidationResult } from "./validation";
import {
  scenarioAssumptionHeavy,
  validateImplication,
  zoomComplete,
} from "./validation";

function joinList(items: string[], max = 4): string {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  const base =
    shown.length <= 1
      ? (shown[0] ?? "")
      : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
  return rest > 0 ? `${base} (+${rest} more)` : base;
}

// ---------------------------------------------------------------------------
// Signal scores
// ---------------------------------------------------------------------------

/**
 * One sentence per score: the rubric anchor, plus a clause grounded in the
 * signal's own linked data where the dimension supports it.
 */
export function explainSignalScore(
  dim: keyof SignalScores,
  signal: Signal,
  sources: Source[],
): string {
  const score = signal.scores[dim];
  const anchor = SCORE_RUBRICS[dim][score];
  const linked = sources.filter((s) => signal.sourceIds.includes(s.id));

  switch (dim) {
    case "strategicRelevance": {
      if (score >= 4 && signal.systemsAffected.length > 0) {
        const systems = joinList(
          signal.systemsAffected.map((s) => SYSTEM_LABELS[s].replace(" system", "")),
        );
        return `${anchor} — this signal touches the ${systems} systems.`;
      }
      return `${anchor}.`;
    }
    case "evidence": {
      if (linked.length > 0) {
        const top = Math.max(...linked.map((s) => s.credibility)) as Score;
        return `${anchor} — ${linked.length} linked source${linked.length === 1 ? "" : "s"}, highest credibility ${CREDIBILITY_LABELS[top].toLowerCase()}.`;
      }
      return `${anchor} — no sources linked yet.`;
    }
    case "crossSectorRelevance": {
      if (signal.sectors.length > 1) {
        return `${anchor} — evidence spans ${joinList(signal.sectors.map((s) => SECTOR_LABELS[s]))}.`;
      }
      return `${anchor}.`;
    }
    case "geographicRelevance":
      return `${anchor} — observed in ${signal.city ? `${signal.city}, ` : ""}${signal.country}.`;
    default:
      return `${anchor}.`;
  }
}

export function scoreHeadline(dim: keyof SignalScores, score: number): string {
  const level = score >= 4 ? "High" : score === 3 ? "Moderate" : "Low";
  return `${level} ${SCORE_DIMENSION_LABELS[dim].toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

/**
 * Why the confidence level is what it is, from the signal's actual evidence
 * base. Mirrors the platform's confidence logic: sources, repetition,
 * cross-sector spread, and consistency.
 */
export function explainSignalConfidence(signal: Signal, sources: Source[]): string {
  const linked = sources.filter((s) => signal.sourceIds.includes(s.id));
  const n = linked.length;
  const sectorSpread = signal.sectors.length;

  if (signal.confidence === "low") {
    const reasons: string[] = [];
    if (n <= 1) reasons.push(`it rests on ${n === 0 ? "no linked sources" : "a single source"}`);
    if (signal.scores.evidence <= 2) reasons.push("the evidence is still anecdotal");
    if (signal.scores.momentum <= 2) reasons.push("it has not yet repeated");
    if (sectorSpread <= 1) reasons.push("it has not appeared beyond one sector");
    if (reasons.length === 0) reasons.push("it is early-stage and its relevance is not yet clear");
    return `Low confidence because ${joinList(reasons, 3)}.`;
  }
  if (signal.confidence === "medium") {
    const reasons: string[] = [];
    if (linked.some((s) => s.credibility >= 4)) reasons.push("the sourcing is credible");
    if (n >= 2) reasons.push(`${n} sources point the same way`);
    if (signal.scores.momentum >= 3) reasons.push("the evidence repeats");
    if (signal.scores.strategicRelevance >= 3) reasons.push("the strategic connection is plausible");
    if (reasons.length === 0) reasons.push("the evidence is credible but not yet consistent over time");
    return `Medium confidence: ${joinList(reasons, 3)} — but cross-sector consistency over time is not yet established.`;
  }
  const reasons: string[] = [];
  if (n >= 2) reasons.push(`${n} independent sources agree`);
  if (signal.scores.behaviouralImpact >= 4 || signal.scores.structuralImpact >= 4)
    reasons.push("the behavioural or systemic impact is clear");
  if (sectorSpread >= 2) reasons.push(`evidence spans ${sectorSpread} sectors`);
  if (signal.scores.evidence >= 4) reasons.push("credible data supports it");
  if (reasons.length === 0) reasons.push("the evidence base is broad and consistent");
  return `High confidence: ${joinList(reasons, 4)}.`;
}

/** Generic confidence sentence for non-signal objects, from stated evidence counts. */
export function explainConfidenceGeneric(
  confidence: ConfidenceLevel,
  evidenceNote: string,
): string {
  const prefix =
    confidence === "low"
      ? "Low confidence"
      : confidence === "medium"
        ? "Medium confidence"
        : "High confidence";
  return `${prefix}: ${evidenceNote}`;
}

// ---------------------------------------------------------------------------
// Evidence quality
// ---------------------------------------------------------------------------

/** One line summarising the evidence base behind a signal. */
export function evidenceQualityLine(signal: Signal, sources: Source[]): string {
  const linked = sources.filter((s) => signal.sourceIds.includes(s.id));
  if (linked.length === 0) return "No sources linked yet — evidence not yet available.";
  const top = Math.max(...linked.map((s) => s.credibility)) as Score;
  const biased = linked.filter((s) => s.biasTags.length > 0).length;
  const parts = [
    `${linked.length} source${linked.length === 1 ? "" : "s"}`,
    `highest credibility ${CREDIBILITY_LABELS[top].toLowerCase()}`,
    SCORE_RUBRICS.evidence[signal.scores.evidence].toLowerCase(),
  ];
  if (biased > 0)
    parts.push(`${biased} carr${biased === 1 ? "ies" : "y"} bias tags worth checking`);
  return parts.join(" · ") + ".";
}

// ---------------------------------------------------------------------------
// Contradictions
// ---------------------------------------------------------------------------

/** "Contradiction detected: X while Y." — always names both sides. */
export function explainContradiction(c: Contradiction): string {
  const a = c.sideA.replace(/\.$/, "");
  const b = c.sideB.replace(/\.$/, "");
  return `${a}, while ${b.charAt(0).toLowerCase()}${b.slice(1)}.`;
}

// ---------------------------------------------------------------------------
// Plain meaning (Connect pages) — one sentence in normal language
// ---------------------------------------------------------------------------

function firstSentenceOf(text: string): string {
  const m = text.trim().match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : text).trim();
}

/**
 * What the cluster means in normal language. Prefers the hand-written
 * plainMeaning; for user-created clusters without one, falls back to the
 * first sentence of the cluster statement with the grouping lead-in removed.
 */
export function clusterPlainMeaning(cluster: Cluster): string {
  if (cluster.plainMeaning?.trim()) return cluster.plainMeaning.trim();
  const s = firstSentenceOf(cluster.clusterStatement).replace(
    /^These signals are grouped because they show (that )?/i,
    "",
  );
  if (!s) return `${cluster.name.replace(/\.$/, "")}.`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** What the pattern means in normal language, with the same fallback rule. */
export function patternPlainMeaning(pattern: Pattern): string {
  if (pattern.plainMeaning?.trim()) return pattern.plainMeaning.trim();
  return firstSentenceOf(pattern.patternStatement);
}

// ---------------------------------------------------------------------------
// Status explanations from validation results
// ---------------------------------------------------------------------------

/**
 * Turn a ValidationResult into one readable sentence:
 * what passed, and what is still missing.
 */
export function summarizeValidation(result: ValidationResult): string {
  if (result.valid) return `Passes all ${result.totalCount} checks.`;
  const failing = result.checks.filter((c) => !c.passed).map((c) => c.label);
  return `Passes ${result.passedCount} of ${result.totalCount} checks — still missing: ${joinList(failing, 3)}.`;
}

export function explainClusterStatus(cluster: Cluster, result: ValidationResult): string {
  if (cluster.status === "valid") {
    return `Valid cluster — ${summarizeValidation(result)}`;
  }
  return `Candidate cluster, not yet valid. ${summarizeValidation(result)} Candidate clusters must not be presented as established patterns.`;
}

export function explainPatternStatus(pattern: Pattern, result: ValidationResult): string {
  const tests = result.checks
    .map((c) => `${c.label.replace(" test", "")} ${c.passed ? "passed" : "failed"}`)
    .join(", ");
  if (pattern.validationStatus === "validated") {
    return `Validated pattern: ${tests}.`;
  }
  return `${pattern.validationStatus === "partially_validated" ? "Partially validated" : "Hypothesis"}: ${tests}. A pattern is only validated when breadth, depth, persistence and coherence all pass.`;
}

export function explainDriverStatus(driver: Driver, result: ValidationResult): string {
  if (driver.status === "validated") {
    return `Validated driver — ${summarizeValidation(result)}`;
  }
  return `Driver hypothesis. ${summarizeValidation(result)} A driver is only validated when it explains multiple patterns with broad, independent evidence.`;
}

export function explainScenarioEvidence(scenario: Scenario): string {
  const links =
    scenario.supportingSignalIds.length +
    scenario.supportingPatternIds.length +
    scenario.supportingDriverIds.length;
  const base = `Linked to ${scenario.supportingSignalIds.length} signal${scenario.supportingSignalIds.length === 1 ? "" : "s"}, ${scenario.supportingDriverIds.length} driver${scenario.supportingDriverIds.length === 1 ? "" : "s"} and ${scenario.shapingContradictionIds.length} contradiction${scenario.shapingContradictionIds.length === 1 ? "" : "s"}, with ${scenario.assumptions.length} declared assumption${scenario.assumptions.length === 1 ? "" : "s"}.`;
  if (scenarioAssumptionHeavy(scenario)) {
    return `${base} Assumptions currently outnumber evidence links — treat this scenario as exploratory until stronger evidence is attached.`;
  }
  return `${base} This is a thought experiment grounded in today's evidence, not a prediction.`;
}

export function explainTerritoryStatus(t: FutureTerritory): string {
  const base = `Rests on ${t.driverIds.length} driver${t.driverIds.length === 1 ? "" : "s"}, ${t.patternIds.length} pattern${t.patternIds.length === 1 ? "" : "s"} and ${t.representativeSignalIds.length} representative signals, with ${t.contradictionIds.length} contradiction${t.contradictionIds.length === 1 ? "" : "s"} acknowledged.`;
  const status: Record<typeof t.monitoringStatus, string> = {
    strengthening: "Leading indicators are currently strengthening.",
    weakening: "Leading indicators are currently weakening.",
    mutating: "The territory appears to be mutating — its shape is changing faster than its strength.",
    contradicted: "Current evidence contradicts the territory — review before using it for strategy.",
    needs_more_evidence: "More evidence is needed before this territory should carry strategic weight.",
    dormant: "The territory is dormant — no recent movement in its indicators.",
  };
  return `${base} ${status[t.monitoringStatus]}`;
}

export function explainImplicationEvidence(imp: StrategicImplication): string {
  const result = validateImplication(imp);
  const links = imp.evidenceSignalIds.length + imp.evidenceDriverIds.length;
  if (result.valid) {
    return `Traces back to ${links} evidence link${links === 1 ? "" : "s"} down the pyramid.`;
  }
  return `Weakly grounded: ${summarizeValidation(result)}`;
}

export function explainIndicator(ind: MonitoringIndicator): string {
  const trendText: Record<typeof ind.trend, string> = {
    strengthening: "evidence is accumulating in its direction",
    weakening: "recent evidence points away from it",
    stable: "recent evidence neither strengthens nor weakens it",
    contradictory: "recent evidence cuts both ways — a tension worth watching",
  };
  return `${ind.currentStatus} Checked ${new Date(ind.dateLastChecked).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}; ${trendText[ind.trend]}.`;
}

// ---------------------------------------------------------------------------
// Next steps (task-based guidance at object level)
// ---------------------------------------------------------------------------

export function nextStepForSignal(signal: Signal): string {
  if (!zoomComplete(signal).valid)
    return "Complete the four-level zooming analysis before connecting this signal to clusters.";
  if (signal.reviewStatus === "needs_human_review" || signal.reviewStatus === "ai_suggested")
    return "This signal needs human review before it is used in clusters or conclusions.";
  if (signal.scores.evidence <= 2)
    return "Strengthen the evidence: add an independent source before this signal informs a pattern.";
  if (signal.clusterIds.length === 0 && signal.scores.strategicRelevance >= 3)
    return "Connect this signal to related signals or a cluster candidate — it is strategically relevant but unclustered.";
  if (signal.contradictionIds.length === 0)
    return "No contradiction identified yet — actively look for evidence that cuts against this signal.";
  return "Monitor for repetition and revisit at the weekly scan.";
}

export function nextStepForCluster(cluster: Cluster, result: ValidationResult): string {
  if (cluster.status === "valid")
    return "Look across this and other valid clusters for a repeated movement — a possible pattern.";
  const failing = result.checks.filter((c) => !c.passed);
  if (failing.length > 0)
    return `Keep this as a candidate: ${failing[0].detail}`;
  return "Review the cluster statement and unifying question, then mark for validation review.";
}
