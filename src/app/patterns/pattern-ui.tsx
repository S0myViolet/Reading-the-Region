"use client";

/**
 * Shared helpers for the Patterns route family (/patterns, /patterns/[id]).
 * Page-local by design — nothing here is imported outside src/app/patterns/.
 *
 * The central discipline of this layer: a pattern's validation status is
 * always computed live via validatePattern(pattern, signals). The stored
 * validationStatus field is never trusted on its own — when it disagrees
 * with the computed result, the computed result wins and the disagreement
 * is stated.
 */

import { Pill } from "@/components/badges";
import type { CheckRowData } from "@/components/connect";
import { firstSentence } from "@/lib/simple";
import type {
  ActorType,
  Contradiction,
  Pattern,
  Sector,
  Signal,
  Source,
  SourceType,
  SystemAffected,
} from "@/lib/types";
import { PATTERN_THRESHOLDS, SOURCE_TYPE_LABELS } from "@/lib/types";
import { monthsBetween, type ValidationResult } from "@/lib/validation";

export const btnPrimary =
  "bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white rounded-[4px] hover:bg-accent-ink";

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
 * ValidationResult — never from the stored validationStatus alone.
 */
export function shortPatternStatus(result: ValidationResult): string {
  return result.valid
    ? `Validated — passes all ${countInWords(result.totalCount)} tests.`
    : `Hypothesis — passes ${countInWords(result.passedCount)} of ${countInWords(result.totalCount)} tests.`;
}

/** Signals actually resolvable from the pattern's key signal ids. */
export function signalsOfPattern(pattern: Pattern, signals: Signal[]): Signal[] {
  return signals.filter((s) => pattern.keySignalIds.includes(s.id));
}

/** Sectors, geographies, actor types, and systems derived from key signals. */
export interface DerivedPatternFacts {
  sectors: Sector[];
  countries: string[];
  actorTypes: ActorType[];
  systems: SystemAffected[];
}

export function derivePatternFacts(patternSignals: Signal[]): DerivedPatternFacts {
  return {
    sectors: [...new Set(patternSignals.flatMap((s) => s.sectors))],
    countries: [...new Set(patternSignals.map((s) => s.country).filter(Boolean))],
    actorTypes: [...new Set(patternSignals.flatMap((s) => s.actorTypes))],
    systems: [...new Set(patternSignals.flatMap((s) => s.systemsAffected))],
  };
}

export function findCheck(result: ValidationResult, label: string) {
  return result.checks.find((c) => c.label === label);
}

/**
 * Validation status readout computed from the live ValidationResult — never
 * from the stored validationStatus alone. Accent is reserved for earned
 * validation; a hypothesis is the default state and stays quiet plain text.
 */
export function PatternValidationPill({ result }: { result: ValidationResult }) {
  return (
    <Pill
      tone={result.valid ? "accent" : "neutral"}
      title={`${result.passedCount} of ${result.totalCount} pattern tests passed`}
    >
      {result.valid
        ? "Validated"
        : `Hypothesis — ${result.passedCount}/${result.totalCount} tests passed`}
    </Pill>
  );
}

/**
 * True when the stored validationStatus disagrees with the computed result
 * (stored claims validated but the tests fail, or the reverse). The UI must
 * then show the computed status with a recomputation note.
 */
export function statusDisagrees(pattern: Pattern, result: ValidationResult): boolean {
  return (pattern.validationStatus === "validated") !== result.valid;
}

export function RecomputedNote() {
  return (
    <span className="text-[10.5px] text-ink-faint">status recomputed from evidence</span>
  );
}

/**
 * Task-based next step from the live validation result: name the first
 * failing test while the pattern is a hypothesis; once validated, move up
 * the pyramid.
 */
export function nextStepForPattern(result: ValidationResult): string {
  if (result.valid) return "Connect this pattern to possible drivers.";
  const failing = result.checks.find((c) => !c.passed);
  if (failing) {
    return `Not yet validated — the ${failing.label.toLowerCase()} is failing. ${failing.detail}`;
  }
  return "Review the pattern statement and evidence window before validation.";
}

// ---------------------------------------------------------------------------
// Advanced-register helpers. Every figure and sentence below is computed
// from the records actually linked to the pattern — nothing is asserted.
// ---------------------------------------------------------------------------

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinWords(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Split prose into sentences; a text without terminal punctuation is one sentence. */
export function splitSentences(text: string): string[] {
  const matched = text.match(/[^.!?]+[.!?]+/g);
  if (matched) return matched.map((s) => s.trim()).filter(Boolean);
  const t = text.trim();
  return t ? [t] : [];
}

/** Source records actually reachable through the pattern's key signals. */
export function linkedSourcesOfPattern(
  patternSignals: Signal[],
  sources: Source[],
): Source[] {
  const ids = new Set(patternSignals.flatMap((s) => s.sourceIds));
  return sources.filter((src) => ids.has(src.id));
}

/**
 * Independent-source figure for display: the live count of source records
 * reachable through the key signals, falling back to the recorded
 * independentSourceCount only when the signals resolve to none.
 */
export function independentSourceFigure(
  pattern: Pattern,
  patternSignals: Signal[],
  sources: Source[],
): number {
  const derived = linkedSourcesOfPattern(patternSignals, sources).length;
  return derived > 0 ? derived : pattern.independentSourceCount;
}

function monthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

/** "Sep 2025 – Jun 2026", from the pattern's first and latest evidence dates. */
export function evidenceWindowLabel(pattern: Pattern): string {
  return `${monthYear(pattern.firstEvidenceDate)} – ${monthYear(pattern.latestEvidenceDate)}`;
}

/** The same "Sep 2025 – Jun 2026" label from any two dates — used for the
 * live window computed from the linked key signals. */
export function windowLabelFromDates(oldest: string, latest: string): string {
  return `${monthYear(oldest)} – ${monthYear(latest)}`;
}

/** First linked contradiction that resolves to a record — the main tension. */
export function mainTensionOfPattern(
  pattern: Pattern,
  contradictions: Contradiction[],
): Contradiction | null {
  for (const id of pattern.contradictionIds) {
    const c = contradictions.find((x) => x.id === id);
    if (c) return c;
  }
  return null;
}

/**
 * The four pattern tests as requirement / current / threshold / why rows.
 * Pass–fail flags come from the live ValidationResult; the current figures
 * are recomputed from the same inputs the tests use.
 */
export function patternCheckRows(
  pattern: Pattern,
  result: ValidationResult,
  patternSignals: Signal[],
): CheckRowData[] {
  const t = PATTERN_THRESHOLDS;
  const sectorCount = new Set(patternSignals.flatMap((s) => s.sectors)).size;
  const months = monthsBetween(pattern.firstEvidenceDate, pattern.latestEvidenceDate);
  const passed = (label: string) => findCheck(result, label)?.passed ?? false;
  const coherencePassed = passed("Coherence test");
  return [
    {
      requirement: "Breadth — the movement shows up in several sectors",
      current: `Appears across ${sectorCount} sector${sectorCount === 1 ? "" : "s"}`,
      threshold: `${t.minSectors} sectors`,
      passed: passed("Breadth test"),
      explanation:
        "A movement confined to one sector is a sector story, not a pattern.",
    },
    {
      requirement: "Depth — several independent sources support it",
      current: `${pattern.independentSourceCount} independent source${
        pattern.independentSourceCount === 1 ? "" : "s"
      }`,
      threshold: `${t.minIndependentSources} sources`,
      passed: passed("Depth test"),
      explanation:
        "Stops one loud source from looking like a region-wide movement.",
    },
    {
      requirement: "Persistence — the evidence holds over time",
      current: `Evidence spans ${months} month${months === 1 ? "" : "s"}`,
      threshold: `${t.minMonthsPersistence} months`,
      passed: passed("Persistence test"),
      explanation: "Separates a durable movement from a news cycle.",
    },
    {
      requirement: "Coherence — it can be said as one movement",
      current: coherencePassed
        ? "Stated as one clear movement in a single statement"
        : "No single statement names the movement yet",
      threshold: "One clear movement",
      passed: coherencePassed,
      explanation: "If it cannot be said as one movement, it is probably two.",
    },
  ];
}

/** Each failing test as one plain sentence, using the live check detail. */
export function failingTestSentences(result: ValidationResult): string[] {
  return result.checks
    .filter((c) => !c.passed)
    .map((c) => {
      if (c.label === "Coherence test") {
        return "The coherence test is not passing yet: the statement does not yet say the movement clearly in one sentence.";
      }
      const detail = c.detail.charAt(0).toLowerCase() + c.detail.slice(1);
      return `The ${c.label.toLowerCase()} is not passing yet: ${detail}`;
    });
}

/** Caveat when the linked sources lean heavily on one source type. */
export function sourceTypeConcentrationNote(linkedSources: Source[]): string | null {
  if (linkedSources.length < 2) return null;
  const byType = new Map<SourceType, number>();
  for (const s of linkedSources) {
    byType.set(s.sourceType, (byType.get(s.sourceType) ?? 0) + 1);
  }
  const [topType, topCount] = [...byType.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topCount < 2 || topCount / linkedSources.length < 0.5) return null;
  const label = SOURCE_TYPE_LABELS[topType].toLowerCase();
  return `${cap(countInWords(topCount))} of the ${countInWords(
    linkedSources.length,
  )} linked sources are of one type (${label}) — one kind of reporting may be doing most of the work.`;
}

/** Caveat when the key signals cluster in one geography. */
export function geographyConcentrationNote(patternSignals: Signal[]): string | null {
  const withCountry = patternSignals.filter((s) => s.country);
  if (withCountry.length < 3) return null;
  const byCountry = new Map<string, number>();
  for (const s of withCountry) {
    byCountry.set(s.country, (byCountry.get(s.country) ?? 0) + 1);
  }
  const [top, topCount] = [...byCountry.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topCount / withCountry.length < 0.6) return null;
  if (byCountry.size === 1) {
    return `All ${countInWords(withCountry.length)} key signals come from ${top} — the movement may be national rather than regional.`;
  }
  return `${cap(countInWords(topCount))} of ${countInWords(
    withCountry.length,
  )} key signals come from ${top} — the movement may be narrower than region-wide.`;
}

/** Bias caveats already written into the record itself, sentence by sentence. */
export function biasNotesInRecord(pattern: Pattern): string[] {
  return splitSentences(`${pattern.evidenceSummary} ${pattern.humanNotes}`).filter(
    (s) => /bias/i.test(s),
  );
}

/** Caveat from bias tags recorded on the linked sources. */
export function biasTagNote(linkedSources: Source[]): string | null {
  const tagged = linkedSources.filter((s) => s.biasTags.length > 0);
  if (tagged.length === 0) return null;
  return `${cap(countInWords(tagged.length))} of the ${countInWords(
    linkedSources.length,
  )} linked sources have bias tags recorded — check who benefits from the story they tell.`;
}

/**
 * What could weaken the pattern, computed from the live result and the
 * linked evidence: failing tests, source and geography concentration, bias
 * tags, and bias caveats already present in the record.
 */
export function patternWeaknesses(
  pattern: Pattern,
  result: ValidationResult,
  patternSignals: Signal[],
  linkedSources: Source[],
): string[] {
  return [
    ...failingTestSentences(result),
    sourceTypeConcentrationNote(linkedSources),
    geographyConcentrationNote(patternSignals),
    biasTagNote(linkedSources),
    ...biasNotesInRecord(pattern),
  ].filter((x): x is string => Boolean(x));
}

/**
 * How a linked contradiction bears on this pattern, from the overlap between
 * the pattern's key signals and the signals supporting each side. When the
 * overlap does not favour a side, the honest answer is that it is unresolved.
 */
export function contradictionEffectOnPattern(
  c: Contradiction,
  pattern: Pattern,
): string {
  const key = new Set(pattern.keySignalIds);
  const a = c.sideASignalIds.filter((id) => key.has(id)).length;
  const b = c.sideBSignalIds.filter((id) => key.has(id)).length;
  if (a === b) {
    return "Unresolved — could cut either way; watch which side accumulates evidence.";
  }
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  const leaningClaim = firstSentence(a > b ? c.sideA : c.sideB).replace(/\.$/, "");
  return `The pattern's own evidence leans to one side here — ${countInWords(hi)} of its key signals support “${leaningClaim}”, against ${countInWords(lo)} for the opposite reading. The pattern strengthens if that side keeps accumulating evidence, and weakens if the other side does.`;
}

/**
 * Next step for the analyst register: once validated, the move up the
 * pyramid; while a hypothesis, exactly what must accumulate, with the real
 * shortfalls.
 */
export function advancedNextStep(
  pattern: Pattern,
  result: ValidationResult,
  patternSignals: Signal[],
): string {
  if (result.valid) {
    return "Connect this pattern to drivers only if the evidence stays strong across sectors and geographies.";
  }
  const t = PATTERN_THRESHOLDS;
  const sectorCount = new Set(patternSignals.flatMap((s) => s.sectors)).size;
  const months = monthsBetween(pattern.firstEvidenceDate, pattern.latestEvidenceDate);
  const passed = (label: string) => findCheck(result, label)?.passed ?? false;
  const parts: string[] = [];
  if (!passed("Breadth test")) {
    parts.push(
      `find the same movement in ${t.minSectors - sectorCount} more sector${
        t.minSectors - sectorCount === 1 ? "" : "s"
      } (now ${sectorCount} of ${t.minSectors})`,
    );
  }
  if (!passed("Depth test")) {
    parts.push(
      `add ${t.minIndependentSources - pattern.independentSourceCount} more independent source${
        t.minIndependentSources - pattern.independentSourceCount === 1 ? "" : "s"
      } (now ${pattern.independentSourceCount} of ${t.minIndependentSources})`,
    );
  }
  if (!passed("Persistence test")) {
    parts.push(
      `let the persistence clock reach ${t.minMonthsPersistence} months (now ${months})`,
    );
  }
  if (!passed("Coherence test")) {
    parts.push("restate the pattern as one clear movement in a single statement");
  }
  if (parts.length === 0) {
    return "Review the pattern statement and evidence window before validation.";
  }
  return `Still a hypothesis — before connecting it to a driver, ${joinWords(parts)}.`;
}

/**
 * Why the key signals support the pattern, from their real spread. When the
 * evidence sits in a single sector, the sentence says so instead of claiming
 * support it does not have.
 */
export function evidenceLeadInSentence(patternSignals: Signal[]): string {
  if (patternSignals.length === 0) {
    return "No key signals are linked yet, so there is nothing here to weigh.";
  }
  const sectors = new Set(patternSignals.flatMap((s) => s.sectors)).size;
  const countries = new Set(patternSignals.map((s) => s.country).filter(Boolean)).size;
  if (sectors <= 1) {
    return "These signals show the same movement, but so far only within a single sector — that is a sector story until breadth accumulates.";
  }
  const spread =
    countries > 1
      ? `${countInWords(sectors)} different sectors and ${countInWords(countries)} countries`
      : `${countInWords(sectors)} different sectors`;
  return `These signals support the pattern because they show the same movement in ${spread}.`;
}

/** One honest line on why a signal belongs under this pattern. */
export function whySignalBelongs(signal: Signal): string {
  const why = signal.whyItMatters.trim();
  if (why) return firstSentence(why);
  return firstSentence(signal.description);
}

/**
 * The linked sources broken down by type — "news publication (2), consulting
 * report (1)…" — for the Evidence tab summary paragraph.
 */
export function sourceMixSummary(linkedSources: Source[]): string | null {
  if (linkedSources.length === 0) return null;
  const byType = new Map<SourceType, number>();
  for (const s of linkedSources) {
    byType.set(s.sourceType, (byType.get(s.sourceType) ?? 0) + 1);
  }
  const parts = [...byType.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([type, n]) => `${SOURCE_TYPE_LABELS[type].toLowerCase()} (${n})`);
  return `${cap(countInWords(linkedSources.length))} independent source record${
    linkedSources.length === 1 ? " is" : "s are"
  } reachable through the key signals: ${parts.join(", ")}.`;
}
