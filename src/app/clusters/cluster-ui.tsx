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
import type { CheckRowData } from "@/components/connect";
import type {
  ActorType,
  Cluster,
  ClusterScores,
  Score,
  Sector,
  Signal,
  Source,
  SystemAffected,
} from "@/lib/types";
import { ACTOR_TYPE_LABELS, CLUSTER_THRESHOLDS, SECTOR_LABELS } from "@/lib/types";
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

/** Sectors, geographies, actor types, and systems read from the linked signals. */
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

/** First sentence of a prose field — used for card-length excerpts. */
export function firstSentence(text: string): string {
  const m = text.trim().match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : text).trim();
}

/**
 * One honest status line per cluster, from the live result plus review
 * state. Accent is earned only by "Valid cluster"; everything else stays
 * quiet text. When the signal count itself is the shortfall, the line says
 * so directly instead of a generic check tally.
 */
export function clusterStatusLine(
  cluster: Cluster,
  result: ValidationResult,
  linkedCount: number,
): { text: string; valid: boolean } {
  if (result.valid) return { text: "Valid cluster", valid: true };
  if (
    cluster.reviewStatus === "needs_human_review" ||
    cluster.reviewStatus === "ai_suggested"
  ) {
    return { text: "Human review required", valid: false };
  }
  if (linkedCount < CLUSTER_THRESHOLDS.minSignals) {
    return {
      text: `Needs more evidence — ${linkedCount} of ${CLUSTER_THRESHOLDS.minSignals} signals`,
      valid: false,
    };
  }
  return {
    text: `Cluster candidate — passes ${result.passedCount} of ${result.totalCount} checks`,
    valid: false,
  };
}

/**
 * Why a signal belongs in this cluster, said from its actual contribution:
 * a sector, geography, or actor type the rest of the group lacks — or, when
 * it overlaps, its place in the group's sector spread. Ends with the
 * signal's own first "why it matters" sentence when one is recorded.
 */
export function whyIncluded(signal: Signal, group: Signal[]): string {
  const others = group.filter((s) => s.id !== signal.id);
  const otherSectors = new Set(others.flatMap((s) => s.sectors));
  const otherCountries = new Set(others.map((s) => s.country));
  const otherActors = new Set(others.flatMap((s) => s.actorTypes));
  const totalSectors = new Set(group.flatMap((s) => s.sectors)).size;

  const uniqueSector = signal.sectors.find((s) => !otherSectors.has(s));
  const uniqueActor = signal.actorTypes.find((a) => !otherActors.has(a));
  const primary = signal.sectors[0] ? SECTOR_LABELS[signal.sectors[0]] : null;

  let base: string;
  if (uniqueSector) {
    base = `The group's only ${SECTOR_LABELS[uniqueSector]} evidence, observed in ${signal.country}.`;
  } else if (signal.country && !otherCountries.has(signal.country)) {
    base = `The only ${signal.country} evidence in this group${primary ? ` — ${primary}` : ""}.`;
  } else if (uniqueActor) {
    base = `Adds the group's only ${ACTOR_TYPE_LABELS[uniqueActor]} perspective${primary ? ` — ${primary} evidence` : ""} from ${signal.country}.`;
  } else if (primary) {
    base = `Brings ${primary} evidence from ${signal.country}, one of ${totalSectors} sectors in this group.`;
  } else {
    base = `Adds evidence from ${signal.country}.`;
  }

  const why = firstSentence(signal.whyItMatters);
  return why ? `${base} ${why}` : base;
}

/**
 * The cluster thresholds as live check rows: current value, threshold, and
 * one line on what each requirement protects against. Mirrors the order and
 * logic of validateCluster so the tally always matches the live result.
 */
export function buildClusterCheckRows(
  cluster: Cluster,
  linked: Signal[],
  sources: Source[],
): CheckRowData[] {
  const t = CLUSTER_THRESHOLDS;
  const sourceIds = new Set(linked.flatMap((s) => s.sourceIds));
  const independentSources = sources.filter((src) => sourceIds.has(src.id));
  const sectors = new Set(linked.flatMap((s) => s.sectors));
  const actorTypes = new Set(linked.flatMap((s) => s.actorTypes));
  const hasQuestion = cluster.unifyingQuestion.trim().length >= 15;

  return [
    {
      requirement: `At least ${t.minSignals} signals`,
      current: `${linked.length} signal${linked.length === 1 ? "" : "s"}`,
      threshold: `${t.minSignals}`,
      passed: linked.length >= t.minSignals,
      explanation:
        "Enough signals to be reviewed as a real group, not an isolated story.",
    },
    {
      requirement: `At least ${t.minIndependentSources} independent sources`,
      current: `${independentSources.length} source${independentSources.length === 1 ? "" : "s"}`,
      threshold: `${t.minIndependentSources}`,
      passed: independentSources.length >= t.minIndependentSources,
      explanation:
        "Stops one outlet or one PR push from looking like a movement.",
    },
    {
      requirement: `At least ${t.minSectors} sectors`,
      current: `${sectors.size} sector${sectors.size === 1 ? "" : "s"}`,
      threshold: `${t.minSectors}`,
      passed: sectors.size >= t.minSectors,
      explanation:
        "A cluster confined to one sector is a sector story, not a regional logic.",
    },
    {
      requirement: `At least ${t.minActorTypes} actor types`,
      current: `${actorTypes.size} actor type${actorTypes.size === 1 ? "" : "s"}`,
      threshold: `${t.minActorTypes}`,
      passed: actorTypes.size >= t.minActorTypes,
      explanation:
        "More than one kind of actor shows the movement is not a single player's strategy.",
    },
    {
      requirement: "Clear unifying question",
      current: hasQuestion ? "Recorded" : "Missing",
      threshold: "One full question",
      passed: hasQuestion,
      explanation:
        "A cluster is organised around one question. Without it, the group is a topic folder.",
    },
    {
      requirement: `Strategic relevance ≥ ${t.minStrategicRelevance}`,
      current: `${cluster.scores.strategicRelevance}/5`,
      threshold: `${t.minStrategicRelevance}/5`,
      passed: cluster.scores.strategicRelevance >= t.minStrategicRelevance,
      explanation:
        "Scores whether the group could change a decision in the region. The minimum keeps merely interesting groups from advancing.",
    },
    {
      requirement: `At least ${t.minContradictions} contradiction linked`,
      current: `${cluster.contradictionIds.length} linked`,
      threshold: `${t.minContradictions}`,
      passed: cluster.contradictionIds.length >= t.minContradictions,
      explanation:
        "A group nobody has argued against has usually not been tested.",
    },
    {
      requirement: `Breadth ≥ ${t.minBreadth}`,
      current: `${cluster.scores.breadth}/5`,
      threshold: `${t.minBreadth}/5`,
      passed: cluster.scores.breadth >= t.minBreadth,
      explanation:
        "Breadth scores how widely the logic shows up across sectors and places. The minimum stops one corner of the region from standing in for the whole.",
    },
    {
      requirement: `Depth ≥ ${t.minDepth}`,
      current: `${cluster.scores.depth}/5`,
      threshold: `${t.minDepth}/5`,
      passed: cluster.scores.depth >= t.minDepth,
      explanation:
        "Depth scores how substantial the evidence is under each signal. The minimum keeps announcement-level groups from moving up.",
    },
    {
      requirement: `Coherence ≥ ${t.minCoherence}`,
      current: `${cluster.scores.coherence}/5`,
      threshold: `${t.minCoherence}/5`,
      passed: cluster.scores.coherence >= t.minCoherence,
      explanation:
        "Coherence scores whether the signals tell one story. The high minimum stops a loose collection from posing as one logic.",
    },
  ];
}

/**
 * Honest weaknesses, each grounded in the record itself: failing checks,
 * caveat sentences already written into the evidence summary or review
 * notes, geographic over-representation (≥60% of signals from one country),
 * and a missing contradiction. Nothing here is invented.
 */
export function clusterWeaknesses(
  cluster: Cluster,
  result: ValidationResult,
  linked: Signal[],
): string[] {
  const items: string[] = [];

  const failing = result.checks.filter((c) => !c.passed);
  if (failing.length > 0) {
    const names = failing
      .slice(0, 3)
      .map((c) => c.label.charAt(0).toLowerCase() + c.label.slice(1))
      .join("; ");
    items.push(
      `It does not yet pass ${failing.length} of the ${result.totalCount} validation checks — still short on: ${names}${failing.length > 3 ? "; and more" : ""}. The Validation tab shows each gap.`,
    );
  }

  // Caveats the analyst has already recorded — quoted, never paraphrased in.
  const caveatWords =
    /anecdot|overstat|announcement evidence|announced plans|claimed|weakest|is mixed|still missing|bias|do not confuse|leans? on/i;
  const summarySentences = cluster.evidenceSummary.split(/(?<=[.!?])\s+/);
  const caveat = summarySentences.find((s) => caveatWords.test(s));
  if (caveat) items.push(`From the evidence summary: ${caveat.trim()}`);
  const noteSentences = cluster.humanNotes.split(/(?<=[.!?])\s+/);
  const noteCaveat = noteSentences.find((s) => caveatWords.test(s));
  if (noteCaveat) items.push(`Noted in review: ${noteCaveat.trim()}`);

  const dominant = dominantCountry(linked);
  if (dominant) {
    const n = linked.filter((s) => s.country === dominant).length;
    items.push(
      `Heavily weighted toward ${dominant} evidence — ${n} of ${linked.length} signals come from there. The logic may be a ${dominant} story rather than a regional one.`,
    );
  }

  if (cluster.contradictionIds.length === 0) {
    items.push(
      "No contradiction linked — nothing recorded yet that argues against this reading.",
    );
  }

  return items;
}

/** ≥60% of linked signals from one country → that country, else null. */
export function dominantCountry(linked: Signal[]): string | null {
  if (linked.length < 2) return null;
  const byCountry = new Map<string, number>();
  for (const s of linked) {
    if (!s.country) continue;
    byCountry.set(s.country, (byCountry.get(s.country) ?? 0) + 1);
  }
  for (const [country, n] of byCountry) {
    if (n / linked.length >= 0.6) return country;
  }
  return null;
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
