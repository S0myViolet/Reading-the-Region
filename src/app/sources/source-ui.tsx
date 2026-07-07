"use client";

/**
 * Route-local UI helpers for the Source Library. Credibility and role are
 * deliberately separate judgements: credibility scores how far a source can
 * be trusted, role records the job it performs in the workflow. The helpers
 * here keep that distinction visible everywhere a source is rendered.
 */

import { Pill } from "@/components/badges";
import type { Source, SourceRole } from "@/lib/types";
import { SOURCE_ROLE_LABELS } from "@/lib/types";

export const btnPrimary =
  "border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink";

export const btnSecondary =
  "border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong";

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
    "Surfaces early material before stronger sources notice it; findings need independent validation before they carry weight in conclusions.",
  validation:
    "Can confirm scale or substance; evidence from it may support clusters, patterns, and drivers when credibility is high.",
  context:
    "Frames other evidence with background; it should not be counted as an independent source in validation thresholds.",
  contradiction:
    "Used deliberately to find opposing evidence; weigh it when testing a conclusion, not when building one.",
  data: "Supplies quantitative evidence; check methodology, sample size, and recency before weighting its numbers.",
  interpretation:
    "Offers analysis, not fact; label material from it as sourced interpretation, never as sourced fact.",
  monitoring:
    "Checked on a regular cadence for indicator updates; more useful for trend direction than for one-off claims.",
};

/** Compact role pills for table rows. */
export function RolePills({ roles }: { roles: SourceRole[] }) {
  if (roles.length === 0)
    return <span className="text-[11px] text-ink-faint">No roles recorded</span>;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {roles.map((r) => (
        <Pill key={r} title={ROLE_WEIGHT_NOTES[r]}>
          {SOURCE_ROLE_LABELS[r]}
        </Pill>
      ))}
    </span>
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
      "Use for discovery only; require independent validation before this evidence supports a cluster or pattern.",
    );
  } else if (credibility <= 2) {
    lines.push(
      "Credibility is low: treat material from this source as provisional and never let it carry a conclusion on its own.",
    );
  } else if (credibility === 3) {
    lines.push(
      "Medium credibility: evidence from this source can support a signal, but conclusions should also rest on at least one stronger, independent source.",
    );
  } else {
    lines.push(
      "High credibility: evidence from this source can bear weight in validation, provided each claim is read against its bias tags.",
    );
  }

  if (roles.includes("validation") && credibility <= 2) {
    lines.push(
      "It is marked as a validation source but its credibility is low — reassess the role, or raise the credibility bar before it confirms anything.",
    );
  }
  if (roles.includes("validation") && credibility >= 4) {
    lines.push(
      "Suitable for validating clusters and patterns — cite it when moving evidence up the pyramid.",
    );
  }
  if (roles.includes("discovery") && !roles.includes("validation")) {
    lines.push(
      "A discovery role without a validation role: it can reveal early behaviour, but scale and substance must be confirmed elsewhere.",
    );
  }
  if (roles.includes("data")) {
    lines.push(
      "As a data source, check methodology, sample size, and recency before weighting its numbers.",
    );
  }
  if (roles.includes("interpretation")) {
    lines.push(
      "Interpretation from this source is analysis, not fact — record it as sourced interpretation.",
    );
  }
  if (roles.includes("contradiction")) {
    lines.push(
      "Use it when searching for opposing evidence: contradictions sharpen conclusions rather than weaken them.",
    );
  }
  if (roles.includes("context")) {
    lines.push(
      "Context material frames other evidence; do not count it as an independent source when checking validation thresholds.",
    );
  }
  if (roles.includes("monitoring")) {
    lines.push(
      "Check it on its monitoring cadence for indicator updates rather than treating single items as standalone evidence.",
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
