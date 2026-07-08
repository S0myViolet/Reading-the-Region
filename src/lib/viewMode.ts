"use client";

/**
 * Product modes and visibility layers.
 *
 * App mode decides which product the user is in:
 *   "simple"   — the default product: Today, Explore, Signals, Futures,
 *                Decisions, Watchlist. Human language, cards, guided flow.
 *                The methodology runs underneath but is never forced on
 *                the user.
 *   "advanced" — the full intelligence system: Scan Inbox, Signal Library,
 *                Clusters, Patterns, Contradictions, Drivers, Territories,
 *                Scenarios, Implications, Monitoring, with scores,
 *                thresholds and validation logic visible.
 *
 * Inside advanced mode, the depth control chooses between the analyst
 * layer and the full-methodology layer (thresholds, provenance, audit).
 * All page-level gating goes through useViewMode(): in simple app mode it
 * always resolves to "simple", so ViewGate-wrapped depth stays hidden.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppMode = "simple" | "advanced";

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

export const APP_MODE_DESCRIPTIONS: Record<AppMode, string> = {
  simple:
    "The guided product: Today, Explore, Signals, Futures, Decisions, Watchlist. The methodology works in the background.",
  advanced:
    "The full intelligence system: every methodology layer, score, threshold and validation rule in view.",
};

interface ViewModeStore {
  appMode: AppMode;
  /** Depth inside advanced mode: "analyst" or "methodology". */
  mode: ViewMode;
  setAppMode: (mode: AppMode) => void;
  setMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeStore>()(
  persist(
    (set) => ({
      appMode: "simple",
      mode: "analyst",
      setAppMode: (appMode) => set({ appMode }),
      setMode: (mode) =>
        set({ mode, ...(mode !== "simple" ? { appMode: "advanced" as AppMode } : {}) }),
    }),
    { name: "reading-the-region-viewmode", version: 2 },
  ),
);

/** The depth the current app mode exposes. */
export function resolveViewMode(appMode: AppMode, mode: ViewMode): ViewMode {
  if (appMode === "simple") return "simple";
  return mode === "simple" ? "analyst" : mode;
}

/** True when the current mode shows at least `min` depth. */
export function modeAtLeast(mode: ViewMode, min: ViewMode): boolean {
  return VIEW_MODE_ORDER[mode] >= VIEW_MODE_ORDER[min];
}
