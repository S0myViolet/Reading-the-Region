"use client";

/**
 * Shared helpers for the Future Territories route family
 * (/territories, /territories/[id]). Page-local by design — nothing here is
 * imported outside src/app/territories/.
 *
 * A future territory is a strategically meaningful direction of change
 * created by the convergence of multiple drivers. It is not a trend, a theme,
 * a category, a campaign idea, or a prediction — and this layer's UI keeps
 * that discipline visible: readiness for scenarios is stated plainly, and the
 * monitoring status always carries its plain-language meaning.
 */

import { Pill } from "@/components/badges";
import type { FutureTerritory, TerritoryMonitoringStatus } from "@/lib/types";

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

type Readiness = FutureTerritory["scenarioReadiness"];

const READINESS_LABELS: Record<Readiness, string> = {
  not_ready: "Not ready for scenarios",
  ready: "Ready for scenarios",
  scenarios_active: "Scenarios active",
};

const READINESS_TONES: Record<Readiness, "caution" | "info" | "accent"> = {
  not_ready: "caution",
  ready: "info",
  scenarios_active: "accent",
};

const READINESS_TITLES: Record<Readiness, string> = {
  not_ready:
    "The territory's evidence base is not yet strong enough to explore scenarios from it.",
  ready:
    "The territory is sufficiently grounded to generate scenarios — none exist yet.",
  scenarios_active: "Scenarios are being developed from this territory.",
};

/** Scenario readiness pill: caution / info / accent by readiness state. */
export function ScenarioReadinessPill({ readiness }: { readiness: Readiness }) {
  return (
    <Pill tone={READINESS_TONES[readiness]} title={READINESS_TITLES[readiness]}>
      {READINESS_LABELS[readiness]}
    </Pill>
  );
}

/**
 * Plain-language meaning of each monitoring status, shown wherever the status
 * badge alone would leave the reader guessing what the evidence is doing.
 */
export const MONITORING_STATUS_EXPLANATIONS: Record<
  TerritoryMonitoringStatus,
  string
> = {
  strengthening:
    "Leading indicators are moving in the territory's direction — the evidence base is getting stronger.",
  weakening:
    "Leading indicators are moving against the territory — treat its conclusions with increasing caution.",
  mutating:
    "The direction of change is real but its shape is shifting — the territory's definition may need revision.",
  contradicted:
    "Recent evidence contradicts the territory's core claim — re-examine the drivers beneath it before using it.",
  needs_more_evidence:
    "The indicator base is too thin to judge the territory's trajectory — strengthen monitoring before relying on it.",
  dormant:
    "No meaningful indicator movement recently — the territory is parked, not proven or disproven.",
};
