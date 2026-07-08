/**
 * The evidence pipeline: every major record belongs to a stage.
 *
 *   Source → Observation → Signal Candidate → Valid Signal → Cluster →
 *   Pattern → Contradiction → Driver → Future Territory → Scenario →
 *   Strategic Implication → Monitoring Indicator
 *
 * Advanced mode names the stage plainly ("Stage: Signal Candidate");
 * Simple mode translates it into friendly language ("Signal worth
 * attention"). One vocabulary, two registers — never two datasets.
 */

import type { Observation, Signal } from "./types";
import { promotionCriteriaMet } from "./validation";
import { PROMOTION_MIN_CRITERIA } from "./types";

export type PipelineStage =
  | "source"
  | "observation"
  | "signal_candidate"
  | "valid_signal"
  | "cluster"
  | "pattern"
  | "contradiction"
  | "driver"
  | "territory"
  | "scenario"
  | "implication"
  | "indicator";

/** Advanced register: the methodology's own names. */
export const STAGE_LABELS: Record<PipelineStage, string> = {
  source: "Source",
  observation: "Observation",
  signal_candidate: "Signal Candidate",
  valid_signal: "Valid Signal",
  cluster: "Cluster",
  pattern: "Pattern",
  contradiction: "Contradiction",
  driver: "Driver",
  territory: "Future Territory",
  scenario: "Scenario",
  implication: "Strategic Implication",
  indicator: "Monitoring Indicator",
};

/** Simple register: what the stage means for a non-analyst reader. */
export const STAGE_LABELS_SIMPLE: Record<PipelineStage, string> = {
  source: "Where evidence comes from",
  observation: "New find",
  signal_candidate: "Signal worth attention",
  valid_signal: "Confirmed signal",
  cluster: "Emerging story",
  pattern: "Repeated movement",
  contradiction: "Tension",
  driver: "Force behind change",
  territory: "Direction to watch",
  scenario: "Possible future",
  implication: "Action to consider",
  indicator: "Being tracked",
};

/** Where the stage sits in the pipeline, for ordering and trails. */
export const STAGE_ORDER: PipelineStage[] = [
  "source",
  "observation",
  "signal_candidate",
  "valid_signal",
  "cluster",
  "pattern",
  "contradiction",
  "driver",
  "territory",
  "scenario",
  "implication",
  "indicator",
];

/** A signal is a candidate until human review validates it. */
export function signalStage(signal: Signal): PipelineStage {
  return signal.reviewStatus === "validated" ? "valid_signal" : "signal_candidate";
}

/**
 * Triage suggestion for inbox material — the Scan Inbox question:
 * is this noise, an observation, or a signal candidate?
 * (An item can only become a *valid signal* after promotion and review.)
 */
export type TriageSuggestion = "noise" | "observation" | "signal_candidate";

export function suggestedStage(obs: Observation): TriageSuggestion {
  const met = promotionCriteriaMet(obs);
  if (met >= PROMOTION_MIN_CRITERIA + 2) return "signal_candidate";
  if (met >= PROMOTION_MIN_CRITERIA) return "observation";
  return "noise";
}

export const TRIAGE_LABELS: Record<TriageSuggestion, string> = {
  noise: "Probably noise",
  observation: "Keep as observation",
  signal_candidate: "Promote to signal candidate",
};
