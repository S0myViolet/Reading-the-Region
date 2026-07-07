"use client";

/**
 * Shared helpers for the Scan Inbox route family (/inbox, /inbox/new,
 * /inbox/[id]). Page-local by design — nothing here is imported outside
 * src/app/inbox/.
 */

import { Pill } from "@/components/badges";
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
