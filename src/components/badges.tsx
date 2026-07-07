import type {
  ConfidenceLevel,
  IndicatorTrend,
  ProvenanceLabel,
  ReviewStatus,
  Score,
  SignalStrength,
  TerritoryMonitoringStatus,
} from "@/lib/types";
import {
  CONFIDENCE_LABELS,
  CREDIBILITY_LABELS,
  INDICATOR_TREND_LABELS,
  PROVENANCE_LABELS,
  REVIEW_STATUS_LABELS,
  SIGNAL_STRENGTH_LABELS,
  TERRITORY_MONITORING_LABELS,
} from "@/lib/types";

type Tone = "neutral" | "accent" | "tension" | "caution" | "info";

/*
 * Status styling is deliberately subdued: soft tint, no border, sentence
 * case. Badges support scanning — they must never compete with content.
 * Neutral tone renders as plain muted text, not a chip.
 */
const TONE_CLASSES: Record<Tone, string> = {
  neutral: "text-ink-faint",
  accent: "bg-accent-soft text-accent-ink",
  tension: "bg-tension-soft text-tension",
  caution: "bg-caution-soft text-caution",
  info: "bg-info-soft text-info",
};

export function Pill({
  tone = "neutral",
  children,
  title,
}: {
  tone?: Tone;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] text-[11px] leading-[1.4] ${
        tone === "neutral" ? "" : "px-1.5 py-px"
      } ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

const CONFIDENCE_TONES: Record<ConfidenceLevel, Tone> = {
  low: "caution",
  medium: "neutral",
  high: "accent",
};

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return <Pill tone={CONFIDENCE_TONES[level]}>{CONFIDENCE_LABELS[level]}</Pill>;
}

/* Only genuinely actionable or warning states carry color. */
const REVIEW_TONES: Record<ReviewStatus, Tone> = {
  draft: "neutral",
  needs_evidence: "caution",
  needs_human_review: "caution",
  ai_suggested: "neutral",
  human_reviewed: "neutral",
  validated: "accent",
  rejected: "tension",
  archived_noise: "neutral",
  duplicate: "neutral",
  contradictory: "tension",
  monitoring: "neutral",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <Pill tone={REVIEW_TONES[status]}>{REVIEW_STATUS_LABELS[status]}</Pill>;
}

export function SourceCredibilityBadge({ score }: { score: Score }) {
  const tone: Tone = score >= 4 ? "accent" : score === 3 ? "neutral" : "caution";
  return <Pill tone={tone}>{CREDIBILITY_LABELS[score]}</Pill>;
}

export function ProvenanceBadge({ label }: { label: ProvenanceLabel }) {
  const tone: Tone =
    label === "contradiction"
      ? "tension"
      : label === "ai_inference" ||
          label === "hypothesis" ||
          label === "speculative_possibility"
        ? "caution"
        : "neutral";
  return <Pill tone={tone}>{PROVENANCE_LABELS[label]}</Pill>;
}

const STRENGTH_TONES: Record<SignalStrength, Tone> = {
  weak: "caution",
  emerging: "neutral",
  established: "accent",
  mainstream: "neutral",
  declining: "neutral",
  contradictory: "tension",
};

export function SignalStrengthBadge({ strength }: { strength: SignalStrength }) {
  return <Pill tone={STRENGTH_TONES[strength]}>{SIGNAL_STRENGTH_LABELS[strength]}</Pill>;
}

const TREND_TONES: Record<IndicatorTrend, Tone> = {
  strengthening: "accent",
  weakening: "caution",
  stable: "neutral",
  contradictory: "tension",
};

export function TrendBadge({ trend }: { trend: IndicatorTrend }) {
  return <Pill tone={TREND_TONES[trend]}>{INDICATOR_TREND_LABELS[trend]}</Pill>;
}

const TERRITORY_STATUS_TONES: Record<TerritoryMonitoringStatus, Tone> = {
  strengthening: "accent",
  weakening: "caution",
  mutating: "neutral",
  contradicted: "tension",
  needs_more_evidence: "caution",
  dormant: "neutral",
};

export function TerritoryStatusBadge({ status }: { status: TerritoryMonitoringStatus }) {
  return <Pill tone={TERRITORY_STATUS_TONES[status]}>{TERRITORY_MONITORING_LABELS[status]}</Pill>;
}

/** Monospace entity id, quiet metadata. */
export function IdChip({ id }: { id: string }) {
  return <span className="font-mono text-[10.5px] text-ink-faint">{id}</span>;
}

/** Small demo-data marker so sample material is never mistaken for real citations. */
export function DemoTag() {
  return (
    <span
      title="Sample data for demonstration — not a real citation"
      className="text-[10.5px] italic text-ink-faint"
    >
      demo data
    </span>
  );
}
