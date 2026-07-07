"use client";

/**
 * Visibility layers — simple surface, rigorous engine underneath.
 *
 * Layer 1 "simple":      summary, confidence, evidence quality, why it
 *                        matters, next step, related objects.
 * Layer 2 "analyst":     + scoring, source credibility & bias, zooming,
 *                        systems, contradiction detail, validation status.
 * Layer 3 "methodology": + full scoring model, thresholds, validation rules,
 *                        provenance labels, audit trail (created/updated,
 *                        review machinery), evidence lineage.
 *
 * The mode is a global preference persisted separately from the intelligence
 * data so switching views never touches the evidence base.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "simple" | "analyst" | "methodology";

export const VIEW_MODE_ORDER: Record<ViewMode, number> = {
  simple: 0,
  analyst: 1,
  methodology: 2,
};

export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  simple: "Simple",
  analyst: "Analyst",
  methodology: "Methodology",
};

export const VIEW_MODE_DESCRIPTIONS: Record<ViewMode, string> = {
  simple:
    "Clean reading view: what happened, why it matters, how confident the system is, what to do next.",
  analyst:
    "Adds scoring, source credibility and bias, zooming analysis, systems, and validation status.",
  methodology:
    "Adds the full scoring model, thresholds, validation rules, provenance labels, and audit trail.",
};

interface ViewModeStore {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeStore>()(
  persist(
    (set) => ({
      mode: "simple",
      setMode: (mode) => set({ mode }),
    }),
    { name: "reading-the-region-viewmode", version: 1 },
  ),
);

/** True when the current mode shows at least `min` depth. */
export function modeAtLeast(mode: ViewMode, min: ViewMode): boolean {
  return VIEW_MODE_ORDER[mode] >= VIEW_MODE_ORDER[min];
}
