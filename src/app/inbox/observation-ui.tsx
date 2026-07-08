"use client";

/**
 * Shared helpers for the observation routes: the Scan Inbox family
 * (/inbox, /inbox/new, /inbox/[id]) and the Observation Library
 * (/observations). Route-local by design — nothing here is imported
 * outside those two directories.
 */

import { Pill } from "@/components/badges";
import { TRIAGE_LABELS, type TriageSuggestion } from "@/lib/pipeline";
import type {
  ObservationStatus,
  PromotionChecklist,
  Region,
} from "@/lib/types";
import { OBSERVATION_STATUS_LABELS } from "@/lib/types";

type PillTone = "neutral" | "accent" | "tension" | "caution" | "info";

/**
 * Tone mapping for observation statuses. Unreviewed is the default state of
 * inbox material, so it stays quiet — amber keeps meaning for items that
 * genuinely need more evidence; accent is reserved for earned promotion.
 */
export const OBSERVATION_STATUS_TONES: Record<ObservationStatus, PillTone> = {
  unreviewed: "neutral",
  promoted: "accent",
  archived_noise: "neutral",
  needs_more_evidence: "caution",
  duplicate: "neutral",
  split: "neutral",
  merged: "neutral",
};

export function ObservationStatusPill({ status }: { status: ObservationStatus }) {
  return (
    <Pill tone={OBSERVATION_STATUS_TONES[status]}>
      {OBSERVATION_STATUS_LABELS[status]}
    </Pill>
  );
}

/**
 * The engine's triage suggestion as a quiet chip. Colour is earned:
 * accent only when the checklist basis recommends promotion; a plain
 * muted chip for "keep as observation"; bare faint text for probable
 * noise. The suggestion derives from the promotion checklist alone —
 * observations carry no numeric scores; scoring happens at promotion.
 */
export function TriageSuggestionChip({ suggestion }: { suggestion: TriageSuggestion }) {
  const title =
    "Engine suggestion from the promotion checklist — scoring happens at signal promotion";
  if (suggestion === "signal_candidate") {
    return (
      <Pill tone="accent" title={title}>
        {TRIAGE_LABELS.signal_candidate}
      </Pill>
    );
  }
  if (suggestion === "observation") {
    return (
      <span
        title={title}
        className="whitespace-nowrap rounded-[4px] bg-surface-muted px-1.5 py-px text-[11px] leading-[1.4] text-ink-soft"
      >
        {TRIAGE_LABELS.observation}
      </span>
    );
  }
  return (
    <span title={title} className="whitespace-nowrap text-[11px] text-ink-faint">
      {TRIAGE_LABELS.noise}
    </span>
  );
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const EMPTY_CHECKLIST: PromotionChecklist = {
  behaviourShift: false,
  systemShift: false,
  surprising: false,
  widerRegionalIssue: false,
  credibleSource: false,
  futureImplications: false,
  connectedToOthers: false,
  revealsTension: false,
  earlyButMeaningful: false,
};

/** The Region union, in display order, for the capture form. */
export const REGION_OPTIONS: Region[] = [
  "GCC",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "Egypt",
  "Levant",
  "North Africa",
  "MENA-wide",
  "Global with regional significance",
];

/** The one primary action per page — calm, borderless, accent. */
export const btnPrimary =
  "bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white rounded-[4px] hover:bg-accent-ink";
/** Secondary actions are quiet text links, not bordered buttons. */
export const btnSecondary =
  "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink hover:underline";
