"use client";

/**
 * Shared helpers for the Signal Clusters route family (/clusters,
 * /clusters/new, /clusters/[id]). Page-local by design — nothing here is
 * imported outside src/app/clusters/.
 *
 * The central discipline of this layer: cluster validity is always computed
 * live via validateCluster(cluster, signals, sources). The stored status
 * field is never trusted on its own.
 */

import { Pill } from "@/components/badges";
import type {
  ActorType,
  Cluster,
  ClusterScores,
  Score,
  Sector,
  Signal,
  SystemAffected,
} from "@/lib/types";
import type { ValidationResult } from "@/lib/validation";

export const btnPrimary =
  "bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white rounded-[4px] hover:bg-accent-ink";
export const textLink =
  "text-[12.5px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SMALL_NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

/** Small counts written out in words for the simple reading view. */
export function countInWords(n: number): string {
  return n >= 0 && n < SMALL_NUMBER_WORDS.length ? SMALL_NUMBER_WORDS[n] : String(n);
}

/**
 * Short one-sentence status for list rows, derived from the live
 * ValidationResult — never from the stored status alone.
 */
export function shortClusterStatus(result: ValidationResult): string {
  return result.valid
    ? `Valid cluster — passes all ${result.totalCount} checks.`
    : `Candidate — passes ${result.passedCount} of ${result.totalCount} checks.`;
}

/**
 * Validity readout computed from a live ValidationResult — never from the
 * stored cluster status alone. Accent is reserved for earned validity;
 * a candidate is the default state and stays quiet plain text.
 */
export function ClusterValidityPill({ result }: { result: ValidationResult }) {
  return (
    <Pill
      tone={result.valid ? "accent" : "neutral"}
      title={`${result.passedCount} of ${result.totalCount} validation checks passed`}
    >
      {result.valid ? "Valid cluster" : "Candidate — not yet valid"}
    </Pill>
  );
}

/** Sectors, geographies, actor types, and systems derived from linked signals. */
export interface DerivedClusterFacts {
  sectors: Sector[];
  countries: string[];
  actorTypes: ActorType[];
  systems: SystemAffected[];
}

export function deriveClusterFacts(clusterSignals: Signal[]): DerivedClusterFacts {
  return {
    sectors: [...new Set(clusterSignals.flatMap((s) => s.sectors))],
    countries: [...new Set(clusterSignals.map((s) => s.country).filter(Boolean))],
    actorTypes: [...new Set(clusterSignals.flatMap((s) => s.actorTypes))],
    systems: [...new Set(clusterSignals.flatMap((s) => s.systemsAffected))],
  };
}

export function signalsOfCluster(cluster: Cluster, signals: Signal[]): Signal[] {
  return signals.filter((s) => cluster.signalIds.includes(s.id));
}

/** Generic 1–5 rubric for the nine cluster scoring dimensions. */
export const GENERIC_SCORE_RUBRIC: Record<Score, string> = {
  1: "Very weak",
  2: "Weak",
  3: "Moderate",
  4: "Strong",
  5: "Very strong",
};

/** Neutral starting point for the create form — every dimension must be judged. */
export const DEFAULT_CLUSTER_SCORES: ClusterScores = {
  breadth: 2,
  depth: 2,
  coherence: 2,
  persistence: 2,
  acceleration: 2,
  regionalRelevance: 2,
  strategicRelevance: 2,
  contradictionRichness: 2,
  systemicPotential: 2,
};

/** Cast helper: ClusterScores → indexable record for the generic ScoreGrid. */
export function clusterScoresRecord(
  scores: ClusterScores,
): Record<keyof ClusterScores, Score> {
  return scores as Record<keyof ClusterScores, Score>;
}

/**
 * Naming discipline. Bare topic words are not clusters — a cluster name must
 * express the shared underlying logic as a sentence.
 */
export const TOPIC_WORDS: string[] = [
  "ai",
  "fashion",
  "tourism",
  "real estate",
  "tech",
  "food",
  "retail",
  "luxury",
  "gaming",
  "wellness",
];

export function topicNameWarning(name: string): string | null {
  const n = name.trim().toLowerCase().replace(/[.?!]+$/, "").trim();
  if (!n) return null;
  if (TOPIC_WORDS.includes(n) || !/\s/.test(n)) {
    return "This looks like a topic, not a shared logic. Express the underlying logic as a sentence.";
  }
  return null;
}
