"use client";

/**
 * Route-local UI helpers for the Source Library. Credibility and role are
 * deliberately separate judgements: credibility says how much to trust a
 * source, role says what job it does. The helpers here keep that distinction
 * visible everywhere a source is rendered.
 */

import { Pill } from "@/components/badges";
import type { Source, SourceRole } from "@/lib/types";
import {
  CREDIBILITY_LABELS,
  SOURCE_ROLE_LABELS,
  SOURCE_TYPE_LABELS,
} from "@/lib/types";

export const btnPrimary =
  "rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink";

/** Secondary actions are quiet text links, never bordered buttons. */
export const btnQuiet =
  "text-[12.5px] text-ink-soft underline-offset-2 hover:text-ink hover:underline";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** What each role means for how evidence from the source should be weighted. */
export const ROLE_WEIGHT_NOTES: Record<SourceRole, string> = {
  discovery:
    "Use this source to spot early behaviour. Do not use it to prove a conclusion until another source confirms it.",
  validation:
    "Use this source to confirm findings. It is strong proof, but often slow to catch new behaviour.",
  context:
    "Use this source to understand the background. It explains the setting, not the change itself.",
  contradiction:
    "Use this source to find the opposing case. It keeps conclusions honest.",
  data: "Use this source for numbers and scale. Check the method behind the figures before quoting them.",
  interpretation:
    "Use this source for expert readings of what evidence means. Weigh who is speaking and why.",
  monitoring:
    "Use this source to track change over time. It shows movement, not causes.",
};

/**
 * Credibility in words with a one-line reason, derived from the recorded
 * type and roles — never invented. E.g. "High credibility — government /
 * official policy; strongest as validation, weaker for early discovery."
 */
export function credibilityLine(src: Source): string {
  const cred = CREDIBILITY_LABELS[src.credibility];
  const type = SOURCE_TYPE_LABELS[src.sourceType].toLowerCase();
  const hasDiscovery = src.roles.includes("discovery");
  const hasValidation = src.roles.includes("validation");

  let roleClause: string;
  if (hasDiscovery && hasValidation) {
    roleClause = "used for both early discovery and validation";
  } else if (hasValidation) {
    roleClause = "strongest as validation, weaker for early discovery";
  } else if (hasDiscovery) {
    roleClause = "strong for early discovery, weaker for validation";
  } else if (src.roles.length > 0) {
    const names = src.roles.map((r) => SOURCE_ROLE_LABELS[r].toLowerCase());
    roleClause = `used as ${
      names.length === 1
        ? `a ${names[0]}`
        : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
    }`;
  } else {
    roleClause = "no role recorded yet, so its evidence cannot be weighted consistently";
  }
  return `${cred} — ${type}; ${roleClause}.`;
}

/** Roles as one quiet metadata phrase, joined by " · ". */
export function rolesLine(roles: SourceRole[]): string {
  if (roles.length === 0) return "No roles recorded";
  return roles.map((r) => SOURCE_ROLE_LABELS[r]).join(" · ");
}

/**
 * The one warning a low-credibility source carries in lists: credibility 2 or
 * below is safe for discovery but unsafe for validation.
 */
export function CredibilityCautionPill() {
  return (
    <Pill
      tone="caution"
      title="Credibility 2 or below — safe for discovery, unsafe for validation. Evidence found here must be confirmed by an independent, higher-credibility source."
    >
      Unsafe for validation
    </Pill>
  );
}

/**
 * Generated weighting guidance from the source's credibility and roles.
 * Pure text rules — no source is ever presented as more trustworthy than
 * its recorded scores allow.
 */
export function weighingGuidance(src: Source): string[] {
  const lines: string[] = [];
  const { credibility, roles, biasTags } = src;

  if (credibility <= 2 && roles.includes("discovery")) {
    lines.push(
      "Use this source for discovery only. Do not let its evidence support a cluster or pattern until an independent source confirms it.",
    );
  } else if (credibility <= 2) {
    lines.push(
      "Credibility is low. Use this source for leads only. Do not let it carry a conclusion on its own.",
    );
  } else if (credibility === 3) {
    lines.push(
      "Credibility is medium. Use this source to support a signal. Do not rest a conclusion on it without at least one stronger, independent source.",
    );
  } else {
    lines.push(
      "Credibility is high. Use this source to bear weight in validation. Read each claim against its bias tags first.",
    );
  }

  if (roles.includes("validation") && credibility <= 2) {
    lines.push(
      "It is marked as a validation source but its credibility is low. Do not let it confirm anything until the role is reassessed or the credibility rises.",
    );
  }
  if (roles.includes("validation") && credibility >= 4) {
    lines.push(
      "Use this source to validate clusters and patterns. Cite it when moving evidence up the pyramid.",
    );
  }
  if (roles.includes("discovery") && !roles.includes("validation")) {
    lines.push(
      "Use this source to reveal early behaviour. Do not use it to confirm scale or substance — confirm those elsewhere.",
    );
  }
  if (roles.includes("data")) {
    lines.push(
      "Use this source for numbers and scale. Check the method, sample size, and recency behind the figures before quoting them.",
    );
  }
  if (roles.includes("interpretation")) {
    lines.push(
      "Use this source for expert readings of what evidence means. Do not record its analysis as fact — label it as sourced interpretation.",
    );
  }
  if (roles.includes("contradiction")) {
    lines.push(
      "Use this source to find the opposing case. It keeps conclusions honest — weigh it when testing a conclusion, not when building one.",
    );
  }
  if (roles.includes("context")) {
    lines.push(
      "Use this source to understand the background. Do not count it as an independent source when checking validation thresholds.",
    );
  }
  if (roles.includes("monitoring")) {
    lines.push(
      "Use this source to track change over time. Do not treat single items from it as standalone evidence — check it on its cadence.",
    );
  }
  if (roles.length === 0) {
    lines.push(
      "No role recorded yet — assign at least one role so evidence from this source is weighted consistently.",
    );
  }
  if (biasTags.length > 0) {
    lines.push(
      `${biasTags.length} bias tag${biasTags.length === 1 ? "" : "s"} recorded — read every claim from this source against ${
        biasTags.length === 1 ? "it" : "them"
      } before the claim informs a conclusion.`,
    );
  }

  return lines;
}
