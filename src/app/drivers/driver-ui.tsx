"use client";

/**
 * Shared helpers for the Drivers route family (/drivers, /drivers/[id]).
 * Page-local by design — nothing here is imported outside src/app/drivers/.
 *
 * The central discipline of this layer: a driver's status is always computed
 * live via validateDriver(driver, signals) against the seven validation
 * criteria. The stored status field is never trusted on its own — when it
 * disagrees with the computed result, the computed result wins and the
 * disagreement is stated. A weak driver is never presented as validated.
 */

import { Pill } from "@/components/badges";
import type { CheckRowData } from "@/components/connect";
import { firstSentence } from "@/lib/simple";
import type {
  ActorType,
  Contradiction,
  Driver,
  DriverScores,
  Score,
  Signal,
  Source,
} from "@/lib/types";
import { CONFIDENCE_LABELS, DRIVER_THRESHOLDS, SYSTEM_LABELS } from "@/lib/types";
import type { ValidationResult } from "@/lib/validation";

/** Calm primary button — the one filled action on a page. */
export const btnPrimary =
  "rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink";
/** Secondary actions are quiet text links, not bordered buttons. */
export const textLink =
  "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink hover:underline";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Signals actually resolvable from the driver's linked signal ids. */
export function signalsOfDriver(driver: Driver, signals: Signal[]): Signal[] {
  return signals.filter((s) => driver.signalIds.includes(s.id));
}

/** Distinct source records reachable through the driver's linked signals. */
export function sourcesOfDriver(driverSignals: Signal[], sources: Source[]): Source[] {
  const ids = new Set(driverSignals.flatMap((s) => s.sourceIds));
  return sources.filter((src) => ids.has(src.id));
}

// ---------------------------------------------------------------------------
// Sentence utilities — everything shown is cut from the record's own text,
// never invented.
// ---------------------------------------------------------------------------

export function splitSentences(text: string): string[] {
  const matched = text.match(/[^.!?]+[.!?]+/g);
  if (matched) return matched.map((s) => s.trim()).filter(Boolean);
  const t = text.trim();
  return t ? [t] : [];
}

/** Remove parenthetical record references like "(SIG-006)" from prose. */
export function stripIdRefs(text: string): string {
  return text.replace(/\s*\([A-Z]{3}-[^)]*\)/g, "");
}

function joinWords(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * The driver statement split for reading: the first two sentences carry the
 * force in plain words; the rest stays available behind a disclosure.
 */
export function statementLead(driver: Driver): { lead: string; rest: string } {
  const text = driver.driverStatement.trim();
  if (!text) return { lead: "", rest: "" };
  const sentences = splitSentences(text);
  return {
    lead: sentences.slice(0, 2).join(" "),
    rest: sentences.slice(2).join(" "),
  };
}

/** whatItExplains re-flowed into short paragraphs of at most three sentences. */
export function whatItExplainsParas(driver: Driver): string[] {
  const sentences = splitSentences(driver.whatItExplains);
  const paras: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paras.push(sentences.slice(i, i + 3).join(" "));
  }
  return paras;
}

/**
 * Sentences of whatItExplains with the generic lead-in and record references
 * removed — the concrete claims, usable on their own.
 */
function explainsSentences(driver: Driver): string[] {
  return splitSentences(stripIdRefs(driver.whatItExplains)).filter(
    (s) => !/^this driver explains several things[.!?]?$/i.test(s.trim()),
  );
}

// ---------------------------------------------------------------------------
// Why it matters — concrete actors from the linked signals' own actor types
// ---------------------------------------------------------------------------

const ACTOR_PLAIN: Record<ActorType, string> = {
  government: "governments",
  sovereign_fund: "sovereign funds",
  corporation: "companies",
  startup: "startups",
  sme: "independent businesses",
  developer: "developers",
  brand: "brands",
  platform: "platforms",
  cultural_institution: "cultural institutions",
  creator: "creators",
  consumer: "consumers",
  community: "communities",
  investor: "investors",
  academic: "researchers",
  ngo: "civil-society groups",
  media_outlet: "media outlets",
};

/** The most frequent actor types across the linked signals, as plain words. */
export function driverActorWords(driverSignals: Signal[], max = 5): string[] {
  const counts = new Map<ActorType, number>();
  for (const s of driverSignals) {
    for (const a of s.actorTypes) counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, max)
    .map(([a]) => ACTOR_PLAIN[a]);
}

/**
 * Why the driver matters, in one or two short paragraphs: the record's own
 * concrete claims first, then who has to respond — actors taken from the
 * linked signals, never invented.
 */
export function driverWhyItMatters(driver: Driver, driverSignals: Signal[]): string[] {
  const paras: string[] = [];
  const claims = explainsSentences(driver);
  if (claims.length > 0) paras.push(claims.slice(0, 2).join(" "));
  const actors = driverActorWords(driverSignals);
  if (actors.length >= 2) {
    paras.push(
      `This means ${joinWords(actors)} are responding to one underlying force, not to separate events. Plans that treat these changes as unrelated will miss what connects them.`,
    );
  }
  return paras;
}

// ---------------------------------------------------------------------------
// Systems tab — the first-order effect, from the record's own fields
// ---------------------------------------------------------------------------

/** The first concrete claim of whatItExplains — what the force directly changes. */
export function firstOrderEffectSentence(driver: Driver): string {
  return explainsSentences(driver)[0] ?? "";
}

/** The systems the driver touches, as one quiet sentence. */
export function systemsTouchedLine(driver: Driver): string {
  if (driver.systemsAffected.length === 0) return "";
  const names = driver.systemsAffected.map((s) =>
    SYSTEM_LABELS[s].replace(/ system$/i, "").toLowerCase(),
  );
  return `It directly touches the ${joinWords(names)} system${
    names.length === 1 ? "" : "s"
  }.`;
}

// ---------------------------------------------------------------------------
// Contradictions — the main tension, and what would strengthen each side
// ---------------------------------------------------------------------------

/** The strongest linked tension — the first thing that could weaken the driver. */
export function mainContradictionOfDriver(
  driver: Driver,
  contradictions: Contradiction[],
): Contradiction | null {
  const linked = contradictions.filter((c) => driver.contradictionIds.includes(c.id));
  if (linked.length === 0) return null;
  return [...linked].sort(
    (a, b) => b.scores.tensionStrength - a.scores.tensionStrength,
  )[0];
}

/**
 * One honest sentence on what would strengthen each side, built from the two
 * sides' own claims. When a side has no recorded evidence, the sentence says
 * what evidence to look for instead of pretending balance.
 */
export function strengthenSidesSentence(c: Contradiction): string {
  const a = firstSentence(stripIdRefs(c.sideA)).trim().replace(/[.!?]$/, "");
  const b = firstSentence(stripIdRefs(c.sideB)).trim().replace(/[.!?]$/, "");
  if (!a || !b) {
    return "The two sides are not fully written down yet — record each side's claim, then attach the signals that would support it.";
  }
  const base = `One side strengthens if new evidence keeps confirming its claim (“${a}”); the other strengthens if new evidence keeps confirming the counter-claim (“${b}”).`;
  const missingA = !c.evidenceSideA.trim();
  const missingB = !c.evidenceSideB.trim();
  if (missingA && missingB) {
    return `${base} Neither side has evidence recorded yet, so start by finding signals that test both claims.`;
  }
  if (missingA || missingB) {
    return `${base} One side has no evidence recorded yet — look for signals that test it before trusting the balance.`;
  }
  return base;
}

// ---------------------------------------------------------------------------
// Live validation, read as rows — requirement, current, threshold, and why
// the requirement exists. Row order mirrors validateDriver exactly.
// ---------------------------------------------------------------------------

/** Requirement / current / threshold / why-it-exists rows for the live checks. */
export function driverCheckRows(
  driver: Driver,
  driverSignals: Signal[],
  result: ValidationResult,
): CheckRowData[] {
  const t = DRIVER_THRESHOLDS;
  const sectorCount = new Set(driverSignals.flatMap((s) => s.sectors)).size;
  const n = (count: number, noun: string, verb: string) =>
    `${count} ${noun}${count === 1 ? "" : "s"} ${verb}`;
  const defs: Array<Omit<CheckRowData, "passed">> = [
    {
      requirement: `Explains at least ${t.minPatterns} patterns`,
      current: n(driver.patternIds.length, "pattern", "connected"),
      threshold: `≥ ${t.minPatterns}`,
      explanation: "A driver must explain repeated movements, not just one cluster.",
    },
    {
      requirement: `Rests on at least ${t.minSignals} connected signals`,
      current: n(driver.signalIds.length, "signal", "connected"),
      threshold: `≥ ${t.minSignals}`,
      explanation: "A force claimed from a handful of signals is a guess, not a driver.",
    },
    {
      requirement: `Signals span at least ${t.minSectors} sectors`,
      current: n(sectorCount, "sector", "represented"),
      threshold: `≥ ${t.minSectors}`,
      explanation:
        "A real driver crosses sectors; a single-sector force is a sector trend.",
    },
    {
      requirement: `Evidence from at least ${t.minIndependentSources} independent sources`,
      current: n(driver.independentSourceCount, "source", "recorded"),
      threshold: `≥ ${t.minIndependentSources}`,
      explanation: "Stops one loud outlet from creating a false force.",
    },
    {
      requirement: `Tested against at least ${t.minContradictions} contradictions`,
      current: n(driver.contradictionIds.length, "contradiction", "linked"),
      threshold: `≥ ${t.minContradictions}`,
      explanation: "A force nobody has argued against has not been tested.",
    },
    {
      requirement: "States at least one possible future",
      current: n(driver.possibleFutures.length, "possible future", "written"),
      threshold: "≥ 1",
      explanation:
        "An explanation that cannot say what should happen next cannot be checked later.",
    },
    {
      requirement: "Names at least one leading indicator",
      current: n(driver.leadingIndicatorIds.length, "indicator", "attached"),
      threshold: "≥ 1",
      explanation:
        "Without a named indicator, nobody can tell whether the force is strengthening or fading.",
    },
  ];
  return defs.map((d, i) => ({ ...d, passed: result.checks[i]?.passed ?? false }));
}

/**
 * The failing checks phrased plainly, in validateDriver order — e.g.
 * "at least 30 connected signals (26 so far)". Empty when validated.
 */
export function driverMissingPhrases(
  driver: Driver,
  driverSignals: Signal[],
  result: ValidationResult,
): string[] {
  const t = DRIVER_THRESHOLDS;
  const sectorCount = new Set(driverSignals.flatMap((s) => s.sectors)).size;
  const soFar = (count: number) => (count === 0 ? "none yet" : `${count} so far`);
  const phrases = [
    `at least ${t.minPatterns} explained patterns (${soFar(driver.patternIds.length)})`,
    `at least ${t.minSignals} connected signals (${soFar(driver.signalIds.length)})`,
    `signals from at least ${t.minSectors} sectors (${soFar(sectorCount)})`,
    `at least ${t.minIndependentSources} independent sources (${soFar(driver.independentSourceCount)})`,
    `at least ${t.minContradictions} linked contradictions (${soFar(driver.contradictionIds.length)})`,
    `at least one written possible future (${soFar(driver.possibleFutures.length)})`,
    `at least one leading indicator to watch (${soFar(driver.leadingIndicatorIds.length)})`,
  ];
  return result.checks
    .map((c, i) => (c.passed ? null : phrases[i]))
    .filter((x): x is string => x !== null);
}

/** How many more linked signals the driver needs to pass the signal check. */
export function signalsStillNeeded(driver: Driver): number {
  return Math.max(0, DRIVER_THRESHOLDS.minSignals - driver.signalIds.length);
}

/** Items for the status strip under a driver detail title. */
export function driverStatusStripItems(
  driver: Driver,
  result: ValidationResult,
): Array<{ text: string; tone?: "accent" | "caution" | "tension" | "neutral" }> {
  const items: Array<{
    text: string;
    tone?: "accent" | "caution" | "tension" | "neutral";
  }> = [
    result.valid
      ? { text: "Validated driver", tone: "accent" }
      : { text: "Still a hypothesis" },
    { text: `${result.passedCount} of ${result.totalCount} checks passed` },
    { text: CONFIDENCE_LABELS[driver.confidence] },
  ];
  const needed = signalsStillNeeded(driver);
  if (needed > 0) {
    items.push({
      text: `Missing: ${needed} more connected signal${needed === 1 ? "" : "s"}`,
      tone: "caution",
    });
  }
  return items;
}

/**
 * Status pill computed from the live ValidationResult — never from the
 * stored status alone. Accent is reserved for the earned state: the pill
 * renders only when all seven criteria pass. A hypothesis carries no badge;
 * its standing is stated in the status sentence instead.
 */
export function ValidatedPill({ result }: { result: ValidationResult }) {
  if (!result.valid) return null;
  return (
    <Pill
      tone="accent"
      title={`${result.passedCount} of ${result.totalCount} driver validation criteria met`}
    >
      Validated driver
    </Pill>
  );
}

/**
 * Computed standing for the detail header: the accent pill when validated,
 * otherwise plain faint text — a hypothesis is a default state, not a
 * warning, so it carries no colour.
 */
export function DriverStanding({ result }: { result: ValidationResult }) {
  if (result.valid) return <ValidatedPill result={result} />;
  return (
    <span
      className="text-[11.5px] text-ink-faint"
      title="A driver is only validated when all seven criteria pass against live evidence"
    >
      Hypothesis — {result.passedCount}/{result.totalCount} criteria met
    </span>
  );
}

/**
 * True when the stored status disagrees with the computed result (stored
 * claims validated but the criteria fail, or the reverse). The UI must then
 * show the computed status with a recomputation note.
 */
export function statusDisagrees(driver: Driver, result: ValidationResult): boolean {
  return (driver.status === "validated") !== result.valid;
}

export function RecomputedNote() {
  return (
    <span className="text-[10.5px] text-ink-faint">status recomputed from evidence</span>
  );
}

// ---------------------------------------------------------------------------
// Counts in words (simple view never leads with bare numbers)
// ---------------------------------------------------------------------------

const NUMBER_WORDS = [
  "no",
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
];

export function countInWords(n: number, singular: string, plural?: string): string {
  const word = n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n);
  return `${word} ${n === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Pattern/signal counts for the list row, in words. */
export function driverLinkCountsInWords(driver: Driver): string {
  return `Explains ${countInWords(driver.patternIds.length, "pattern")} · rests on ${countInWords(driver.signalIds.length, "signal")}.`;
}

/**
 * Evidence note for explainConfidenceGeneric — cites the driver's actual
 * counts: patterns connected, signals, independent sources.
 */
export function driverEvidenceNote(driver: Driver): string {
  return `this explanation currently rests on ${countInWords(driver.patternIds.length, "connected pattern")}, ${countInWords(driver.signalIds.length, "linked signal")} and ${countInWords(driver.independentSourceCount, "independent source")}.`;
}

// ---------------------------------------------------------------------------
// Next step — derived from the live validation result
// ---------------------------------------------------------------------------

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * One next-step sentence: the first failing validation check, or the
 * monitoring instruction once every criterion passes.
 */
export function driverNextStep(result: ValidationResult): string {
  if (result.valid) {
    return "Watch this driver's leading indicators — movement there is what confirms or weakens a validated explanation.";
  }
  const failing = result.checks.find((c) => !c.passed);
  if (!failing) {
    return "Review this driver's evidence links at the next weekly scan.";
  }
  return `Work on the first unmet criterion — ${lowerFirst(failing.label)}. Currently: ${lowerFirst(failing.detail)}`;
}

// ---------------------------------------------------------------------------
// Score readings — a score is never shown as a bare number. The wording is
// derived from the score value alone: 1–2 low, 3 moderate, 4–5 strong.
// ---------------------------------------------------------------------------

export type ScoreBand = "low" | "moderate" | "strong";

export function scoreBand(score: Score): ScoreBand {
  return score <= 2 ? "low" : score === 3 ? "moderate" : "strong";
}

const DRIVER_SCORE_READINGS: Record<keyof DriverScores, Record<ScoreBand, string>> = {
  explanatoryPower: {
    low: "judged to explain little more than the patterns already say",
    moderate: "judged to explain part of what its patterns show",
    strong: "judged to account for its patterns with a clear mechanism",
  },
  crossSectorStrength: {
    low: "its effects are judged visible in one sector at most",
    moderate: "its effects are judged visible in a few adjacent sectors",
    strong: "its effects are judged visible across many sectors",
  },
  evidenceStrength: {
    low: "the evidence beneath it is judged thin or anecdotal",
    moderate: "the evidence beneath it is judged credible but limited",
    strong: "the evidence beneath it is judged broad and credible",
  },
  persistence: {
    low: "judged possibly a short-lived episode rather than a lasting force",
    moderate: "judged to have held for a meaningful period",
    strong: "judged persistent, with no sign of fading",
  },
  reversibility: {
    low: "the ease of this force being undone is judged low",
    moderate: "the ease of this force being undone is judged moderate",
    strong: "the ease of this force being undone is judged high",
  },
  behaviouralImpact: {
    low: "judged to change little day-to-day behaviour so far",
    moderate: "judged to be changing some behaviour in visible ways",
    strong: "judged to be restructuring behaviour at scale",
  },
  structuralImpact: {
    low: "judged to leave systems and institutions largely untouched",
    moderate: "judged to be bending some systems and institutions",
    strong: "judged to be reshaping systems and institutions",
  },
  contradictionRichness: {
    low: "few tensions push back against it — possibly under-scanned",
    moderate: "some real tensions push back against it",
    strong: "it sits amid strong, well-evidenced tensions",
  },
  scenarioUsefulness: {
    low: "judged to give scenario work little to build on",
    moderate: "judged to give scenario work something to build on",
    strong: "judged a load-bearing input for scenario work",
  },
  strategicRelevance: {
    low: "judged to matter little for strategy for now",
    moderate: "judged to matter for strategy within some categories",
    strong: "judged to matter for strategy across sectors",
  },
};

/** One-sentence reading of a driver score, derived from its value. */
export function driverScoreReading(dim: keyof DriverScores, score: Score): string {
  return `${DRIVER_SCORE_READINGS[dim][scoreBand(score)]}.`;
}

// ---------------------------------------------------------------------------
// Sorting and filtering
// ---------------------------------------------------------------------------

export type DriverSort = "updated" | "explanatory" | "evidence" | "patterns";

export const DRIVER_SORT_OPTIONS: Array<{ value: DriverSort; label: string }> = [
  { value: "updated", label: "Recently updated" },
  { value: "explanatory", label: "By explanatory power" },
  { value: "evidence", label: "By evidence strength" },
  { value: "patterns", label: "By patterns explained" },
];

export function sortDrivers(list: Driver[], sort: DriverSort): Driver[] {
  const byUpdated = (a: Driver, b: Driver) => b.updatedAt.localeCompare(a.updatedAt);
  const copy = [...list];
  switch (sort) {
    case "updated":
      return copy.sort(byUpdated);
    case "explanatory":
      return copy.sort(
        (a, b) =>
          b.scores.explanatoryPower - a.scores.explanatoryPower || byUpdated(a, b),
      );
    case "evidence":
      return copy.sort(
        (a, b) =>
          b.scores.evidenceStrength - a.scores.evidenceStrength || byUpdated(a, b),
      );
    case "patterns":
      return copy.sort(
        (a, b) => b.patternIds.length - a.patternIds.length || byUpdated(a, b),
      );
  }
}

export type DriverStatusFilter = "all" | "validated" | "hypothesis";

export const DRIVER_STATUS_FILTER_OPTIONS: Array<{
  value: DriverStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All drivers" },
  { value: "validated", label: "Validated (computed)" },
  { value: "hypothesis", label: "Hypotheses (computed)" },
];
