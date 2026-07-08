/**
 * The simple-language layer.
 *
 * Simple Mode never shows methodology vocabulary — no criteria counts, no
 * score names, no validation labels. These helpers translate the engine's
 * state into human words, and select what the Today page surfaces. All of
 * it is derived from real object state; nothing is invented.
 */

import type { IntelligenceData } from "./store";
import type {
  Contradiction,
  FutureTerritory,
  IndicatorTrend,
  MonitoringIndicator,
  Observation,
  Signal,
} from "./types";
import { promotionCriteriaMet } from "./validation";

// ---------------------------------------------------------------------------
// Human words for engine states
// ---------------------------------------------------------------------------

export type FindVerdict = "keep" | "more_proof" | "noise";

/**
 * What the engine thinks of a raw find, in words. Internally this is the
 * promotion checklist; the user sees a recommendation, not a fraction.
 */
export function findVerdict(obs: Observation): FindVerdict {
  const met = promotionCriteriaMet(obs);
  if (met >= 5) return "keep";
  if (met >= 3) return "more_proof";
  return "noise";
}

export const FIND_VERDICT_WORDS: Record<FindVerdict, string> = {
  keep: "Recommended to keep",
  more_proof: "Needs more proof",
  noise: "Probably noise",
};

/** Indicator / watchlist direction in plain words. */
export const TREND_WORDS: Record<IndicatorTrend, string> = {
  strengthening: "Getting stronger",
  weakening: "Getting weaker",
  stable: "Holding steady",
  contradictory: "Being contradicted",
};

/** One-line evidence description without methodology vocabulary. */
export function evidenceWords(signal: Signal, sourceCount: number): string {
  const e = signal.scores.evidence;
  if (e >= 4) return `Well supported — ${sourceCount} independent sources agree.`;
  if (e === 3)
    return sourceCount > 1
      ? `Credible sources, still early — worth watching.`
      : `One credible source — needs independent confirmation.`;
  return `Early and thin — treat as a hint, not a finding.`;
}

/** Importance in plain words, from strategic relevance + novelty. */
export function importanceWords(signal: Signal): string {
  const s = signal.scores.strategicRelevance;
  const n = signal.scores.novelty;
  if (s >= 4 && n >= 4) return "High — new and strategically broad";
  if (s >= 4) return "High — touches many decisions";
  if (n >= 4) return "Worth attention — genuinely new";
  if (s >= 3) return "Moderate";
  return "Low for now";
}

// ---------------------------------------------------------------------------
// Today page selection
// ---------------------------------------------------------------------------

export interface TodayPicks {
  signal: Signal | null;
  contradiction: Contradiction | null;
  territory: FutureTerritory | null;
}

/** The three cards at the top of Today. */
export function todayPicks(data: IntelligenceData): TodayPicks {
  const activeSignals = data.signals.filter(
    (s) => !["rejected", "archived_noise", "duplicate"].includes(s.reviewStatus),
  );
  const signal =
    [...activeSignals].sort(
      (a, b) =>
        b.scores.strategicRelevance + b.scores.novelty + b.scores.momentum -
        (a.scores.strategicRelevance + a.scores.novelty + a.scores.momentum),
    )[0] ?? null;

  const contradiction =
    [...data.contradictions].sort(
      (a, b) =>
        b.scores.tensionStrength + b.scores.futureImpact -
        (a.scores.tensionStrength + a.scores.futureImpact),
    )[0] ?? null;

  const territory =
    [...data.territories].sort((a, b) => {
      const rank = (t: FutureTerritory) =>
        (t.monitoringStatus === "strengthening" ? 2 : t.monitoringStatus === "mutating" ? 1 : 0) +
        t.evidenceStrength;
      return rank(b) - rank(a);
    })[0] ?? null;

  return { signal, contradiction, territory };
}

/** The short opening sentence on Today — what the system noticed. */
export function todaySentence(data: IntelligenceData): string {
  const gaining = data.signals.filter((s) => s.scores.momentum >= 4).length;
  const newFinds = data.observations.filter((o) => o.status === "unreviewed").length;
  const strengthening = data.indicators.filter((i) => i.trend === "strengthening").length;

  const parts: string[] = [];
  if (gaining > 0)
    parts.push(`${numberWord(gaining)} signal${gaining === 1 ? " is" : "s are"} gaining momentum`);
  if (strengthening > 0)
    parts.push(
      `${numberWord(strengthening)} watched development${strengthening === 1 ? " is" : "s are"} getting stronger`,
    );
  if (newFinds > 0)
    parts.push(`${numberWord(newFinds)} new find${newFinds === 1 ? " waits" : "s wait"} for review`);
  if (parts.length === 0)
    return "The region is quiet today — a good moment to explore what is already known.";
  return capitalize(parts.join(", and ") + ".");
}

export interface QueueItem {
  id: string;
  kind: "find" | "signal";
  title: string;
  whyItMatters: string;
  href: string;
}

/** Today's review queue: 5–7 items, most promising finds first. */
export function todaysQueue(data: IntelligenceData, keptFindIds: string[]): QueueItem[] {
  const finds = data.observations
    .filter((o) => o.status === "unreviewed" && !keptFindIds.includes(o.id))
    .sort((a, b) => promotionCriteriaMet(b) - promotionCriteriaMet(a))
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      kind: "find" as const,
      title: o.title,
      whyItMatters: o.potentialFutureRelevance || o.description,
      href: `/finds?item=${o.id}`,
    }));

  const reviewSignals = data.signals
    .filter((s) => ["needs_human_review", "ai_suggested"].includes(s.reviewStatus))
    .slice(0, Math.max(0, 7 - finds.length))
    .map((s) => ({
      id: s.id,
      kind: "signal" as const,
      title: s.title,
      whyItMatters: s.whyItMatters,
      href: `/signals/${s.id}`,
    }));

  return [...finds, ...reviewSignals].slice(0, 7);
}

/** Watchlist grouping in plain words. */
export function watchlistGroups(indicators: MonitoringIndicator[]) {
  return {
    strengthening: indicators.filter((i) => i.trend === "strengthening"),
    weakening: indicators.filter((i) => i.trend === "weakening"),
    unclear: indicators.filter((i) => i.trend === "contradictory"),
    steady: indicators.filter((i) => i.trend === "stable"),
  };
}

// ---------------------------------------------------------------------------
// Small text utilities
// ---------------------------------------------------------------------------

const NUMBER_WORDS = [
  "no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
];

export function numberWord(n: number): string {
  return n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** First sentence of a longer text, for card summaries. */
export function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : text;
}

// ---------------------------------------------------------------------------
// Today briefing extensions
// ---------------------------------------------------------------------------

import { SECTOR_LABELS as SECTOR_WORDS } from "./types";
import type { StrategicImplication } from "./types";
import { IMPLICATION_AUDIENCE_LABELS } from "./types";

/**
 * The Daily Brief: what the system noticed, then where movement centres.
 * Both sentences derive from the live base.
 */
/** Sector → plain everyday theme, for the daily brief sentence. */
const PLAIN_SECTOR_THEMES: Partial<Record<keyof typeof SECTOR_WORDS, string>> = {
  migration_citizenship_belonging: "people staying longer",
  culture_arts_heritage: "regional culture gaining value",
  mobility_transport: "transport shaping daily life",
  technology_ai: "AI and who people trust",
  fashion_luxury: "what counts as premium",
  real_estate_urban: "how homes and districts are built",
  hospitality_tourism: "how hotels and destinations are used",
  health_wellness_longevity: "health moving into daily places",
  finance_banking_investment: "how people save and borrow",
  media_entertainment_creator: "who audiences listen to",
  retail_commerce: "how people shop",
  food_beverage_third_places: "where people meet",
  sports_gaming: "how young people spend time",
  education_work: "how people learn and work",
  climate_energy_environment: "heat shaping city life",
  religion_ritual_ramadan: "how ritual shapes the year",
  government_policy: "new rules and policies",
};

export function dailyBrief(data: IntelligenceData): string {
  const opening = todaySentence(data);
  const movers = [...data.signals]
    .filter((s) => !["rejected", "archived_noise", "duplicate"].includes(s.reviewStatus))
    .sort((a, b) => b.scores.momentum - a.scores.momentum)
    .slice(0, 3);
  if (movers.length === 0) return opening;
  const themes = [
    ...new Set(
      movers.map((s) => PLAIN_SECTOR_THEMES[s.sectors[0]] ?? SECTOR_WORDS[s.sectors[0]]?.toLowerCase()),
    ),
  ].filter(Boolean);
  if (themes.length === 0) return opening;
  const list =
    themes.length === 1
      ? themes[0]
      : `${themes.slice(0, -1).join(", ")}, and ${themes[themes.length - 1]}`;
  return `${opening} Most change today is around ${list}.`;
}

export interface DoNowAction {
  id: string;
  who: string;
  what: string;
  whyNow: string;
  confidence: string;
}

/** One or two recommended present-day actions, strongest grounding first. */
export function doNowActions(data: IntelligenceData, n = 2): DoNowAction[] {
  const rank = { high: 2, medium: 1, low: 0 } as const;
  return [...data.implications]
    .filter((i) => !["rejected", "archived_noise"].includes(i.reviewStatus))
    .sort(
      (a, b) =>
        rank[b.confidence] - rank[a.confidence] ||
        b.evidenceSignalIds.length +
          b.evidenceDriverIds.length -
          (a.evidenceSignalIds.length + a.evidenceDriverIds.length),
    )
    .slice(0, n)
    .map((i) => ({
      id: i.id,
      who: i.audiences.slice(0, 2).map((a) => IMPLICATION_AUDIENCE_LABELS[a]).join(" and "),
      what: firstSentence(i.recommendedAction),
      whyNow: firstSentence(i.whyItMatters),
      confidence: i.confidence,
    }));
}

export interface MovementGroups {
  stronger: MonitoringIndicator[];
  weaker: MonitoringIndicator[];
  needsAttention: MonitoringIndicator[];
}

/** Movement since last check, for the Today briefing (top 2 per group). */
export function movementSinceLastCheck(
  data: IntelligenceData,
  isOverdue: (i: MonitoringIndicator) => boolean,
): MovementGroups {
  const byRecency = (a: MonitoringIndicator, b: MonitoringIndicator) =>
    b.dateLastChecked.localeCompare(a.dateLastChecked);
  const attention = data.indicators.filter(
    (i) => i.trend === "contradictory" || isOverdue(i),
  );
  return {
    stronger: data.indicators
      .filter((i) => i.trend === "strengthening")
      .sort(byRecency)
      .slice(0, 2),
    weaker: data.indicators
      .filter((i) => i.trend === "weakening")
      .sort(byRecency)
      .slice(0, 2),
    needsAttention: attention.sort(byRecency).slice(0, 2),
  };
}
