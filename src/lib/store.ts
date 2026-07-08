"use client";

/**
 * Client-side intelligence store.
 *
 * State is seeded with the demo dataset and persisted to localStorage so the
 * platform is usable immediately and edits survive reloads. The store is the
 * single write-path for the workflow rules: promotion, linking, and status
 * changes all go through actions here.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedData } from "./seed";
import {
  canPromoteObservation,
} from "./validation";
import type {
  Cluster,
  Contradiction,
  Driver,
  FutureTerritory,
  MonitoringIndicator,
  Observation,
  ObservationStatus,
  Pattern,
  Scenario,
  Signal,
  Source,
  StrategicImplication,
} from "./types";

export interface IntelligenceData {
  observations: Observation[];
  sources: Source[];
  signals: Signal[];
  clusters: Cluster[];
  patterns: Pattern[];
  contradictions: Contradiction[];
  drivers: Driver[];
  territories: FutureTerritory[];
  scenarios: Scenario[];
  implications: StrategicImplication[];
  indicators: MonitoringIndicator[];
}

interface UiState {
  guidedMode: boolean;
  onboardingComplete: boolean;
  /** Walkthrough panels the user has collapsed, keyed by page id. */
  dismissedWalkthroughs: string[];
  /** Pages whose guide has been seen once — after that it defaults collapsed. */
  seenWalkthroughs: string[];
  /** Signals the user saved to their watchlist. */
  savedSignalIds: string[];
  /** New Finds the user chose to keep (worth developing into signals). */
  keptFindIds: string[];
}

export interface IntelligenceStore extends IntelligenceData, UiState {
  // --- observations -------------------------------------------------------
  addObservation: (obs: Observation) => void;
  updateObservation: (id: string, patch: Partial<Observation>) => void;
  setObservationStatus: (
    id: string,
    status: ObservationStatus,
    rationale?: string,
  ) => void;
  /**
   * Promote an observation into a signal. Fails (returns null) when the
   * promotion checklist has fewer than the minimum criteria — the workflow
   * rule is enforced here, not just in the UI.
   */
  promoteObservation: (obsId: string, signal: Signal) => Signal | null;

  // --- entities -----------------------------------------------------------
  addSource: (s: Source) => void;
  updateSource: (id: string, patch: Partial<Source>) => void;
  addSignal: (s: Signal) => void;
  updateSignal: (id: string, patch: Partial<Signal>) => void;
  addCluster: (c: Cluster) => void;
  updateCluster: (id: string, patch: Partial<Cluster>) => void;
  addPattern: (p: Pattern) => void;
  updatePattern: (id: string, patch: Partial<Pattern>) => void;
  addContradiction: (c: Contradiction) => void;
  updateContradiction: (id: string, patch: Partial<Contradiction>) => void;
  addDriver: (d: Driver) => void;
  updateDriver: (id: string, patch: Partial<Driver>) => void;
  addTerritory: (t: FutureTerritory) => void;
  updateTerritory: (id: string, patch: Partial<FutureTerritory>) => void;
  addScenario: (s: Scenario) => void;
  updateScenario: (id: string, patch: Partial<Scenario>) => void;
  addImplication: (i: StrategicImplication) => void;
  updateImplication: (id: string, patch: Partial<StrategicImplication>) => void;
  addIndicator: (i: MonitoringIndicator) => void;
  updateIndicator: (id: string, patch: Partial<MonitoringIndicator>) => void;

  // --- ui -----------------------------------------------------------------
  setGuidedMode: (on: boolean) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  dismissWalkthrough: (pageId: string) => void;
  restoreWalkthrough: (pageId: string) => void;
  markWalkthroughSeen: (pageId: string) => void;
  toggleSavedSignal: (signalId: string) => void;
  keepFind: (observationId: string) => void;
  unkeepFind: (observationId: string) => void;
  resetToSeedData: () => void;
}

function touch<T extends { updatedAt: string }>(patch: Partial<T>): Partial<T> {
  return { ...patch, updatedAt: new Date().toISOString() };
}

function patchById<T extends { id: string; updatedAt: string }>(
  list: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...touch<T>(patch) } : item));
}

export const useIntelligenceStore = create<IntelligenceStore>()(
  persist(
    (set, get) => ({
      ...seedData,
      guidedMode: true,
      onboardingComplete: false,
      dismissedWalkthroughs: [],
      seenWalkthroughs: [],
      savedSignalIds: [],
      keptFindIds: [],

      addObservation: (obs) =>
        set((s) => ({ observations: [obs, ...s.observations] })),
      updateObservation: (id, patch) =>
        set((s) => ({ observations: patchById(s.observations, id, patch) })),
      setObservationStatus: (id, status, rationale) =>
        set((s) => ({
          observations: patchById(s.observations, id, {
            status,
            triageRationale: rationale ?? null,
          }),
        })),

      promoteObservation: (obsId, signal) => {
        const obs = get().observations.find((o) => o.id === obsId);
        if (!obs || !canPromoteObservation(obs)) return null;
        set((s) => ({
          signals: [signal, ...s.signals],
          observations: patchById(s.observations, obsId, {
            status: "promoted",
            promotedSignalId: signal.id,
          }),
        }));
        return signal;
      },

      addSource: (src) => set((s) => ({ sources: [src, ...s.sources] })),
      updateSource: (id, patch) =>
        set((s) => ({
          sources: s.sources.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      addSignal: (sig) => set((s) => ({ signals: [sig, ...s.signals] })),
      updateSignal: (id, patch) =>
        set((s) => ({ signals: patchById(s.signals, id, patch) })),
      addCluster: (c) => set((s) => ({ clusters: [c, ...s.clusters] })),
      updateCluster: (id, patch) =>
        set((s) => ({ clusters: patchById(s.clusters, id, patch) })),
      addPattern: (p) => set((s) => ({ patterns: [p, ...s.patterns] })),
      updatePattern: (id, patch) =>
        set((s) => ({ patterns: patchById(s.patterns, id, patch) })),
      addContradiction: (c) =>
        set((s) => ({ contradictions: [c, ...s.contradictions] })),
      updateContradiction: (id, patch) =>
        set((s) => ({ contradictions: patchById(s.contradictions, id, patch) })),
      addDriver: (d) => set((s) => ({ drivers: [d, ...s.drivers] })),
      updateDriver: (id, patch) =>
        set((s) => ({ drivers: patchById(s.drivers, id, patch) })),
      addTerritory: (t) => set((s) => ({ territories: [t, ...s.territories] })),
      updateTerritory: (id, patch) =>
        set((s) => ({ territories: patchById(s.territories, id, patch) })),
      addScenario: (sc) => set((s) => ({ scenarios: [sc, ...s.scenarios] })),
      updateScenario: (id, patch) =>
        set((s) => ({ scenarios: patchById(s.scenarios, id, patch) })),
      addImplication: (i) =>
        set((s) => ({ implications: [i, ...s.implications] })),
      updateImplication: (id, patch) =>
        set((s) => ({ implications: patchById(s.implications, id, patch) })),
      addIndicator: (i) => set((s) => ({ indicators: [i, ...s.indicators] })),
      updateIndicator: (id, patch) =>
        set((s) => ({ indicators: patchById(s.indicators, id, patch) })),

      setGuidedMode: (on) => set({ guidedMode: on }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () => set({ onboardingComplete: false }),
      dismissWalkthrough: (pageId) =>
        set((s) => ({
          dismissedWalkthroughs: s.dismissedWalkthroughs.includes(pageId)
            ? s.dismissedWalkthroughs
            : [...s.dismissedWalkthroughs, pageId],
        })),
      restoreWalkthrough: (pageId) =>
        set((s) => ({
          dismissedWalkthroughs: s.dismissedWalkthroughs.filter((p) => p !== pageId),
        })),
      markWalkthroughSeen: (pageId) =>
        set((s) => ({
          seenWalkthroughs: s.seenWalkthroughs.includes(pageId)
            ? s.seenWalkthroughs
            : [...s.seenWalkthroughs, pageId],
        })),
      toggleSavedSignal: (signalId) =>
        set((s) => ({
          savedSignalIds: s.savedSignalIds.includes(signalId)
            ? s.savedSignalIds.filter((id) => id !== signalId)
            : [...s.savedSignalIds, signalId],
        })),
      keepFind: (observationId) =>
        set((s) => ({
          keptFindIds: s.keptFindIds.includes(observationId)
            ? s.keptFindIds
            : [...s.keptFindIds, observationId],
        })),
      unkeepFind: (observationId) =>
        set((s) => ({
          keptFindIds: s.keptFindIds.filter((id) => id !== observationId),
        })),
      resetToSeedData: () =>
        set({ ...seedData, guidedMode: get().guidedMode, onboardingComplete: true }),
    }),
    {
      name: "reading-the-region-v1",
      version: 4,
      // v4 ships plain meanings on clusters and patterns for the Connect
      // section. Refresh the data collections on upgrade while keeping the
      // user's UI preferences and progress.
      migrate: (persisted, version) => {
        const state = persisted as Partial<IntelligenceStore>;
        if (version < 4) {
          return {
            ...state,
            ...seedData,
          } as IntelligenceStore;
        }
        return state as IntelligenceStore;
      },
    },
  ),
);

/**
 * Generate the next sequential readable id for an entity list,
 * e.g. nextId("SIG", signals) → "SIG-013".
 */
export function nextId(prefix: string, existing: Array<{ id: string }>): string {
  const max = existing.reduce((acc, { id }) => {
    const m = id.match(new RegExp(`^${prefix}-(\\d+)$`));
    return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

/**
 * Hydration-safe hook: returns undefined on the server / first client render,
 * then the live store. Pages use this to avoid hydration mismatches with
 * persisted localStorage state.
 */
import { useEffect, useState } from "react";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
