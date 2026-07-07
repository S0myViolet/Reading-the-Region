"use client";

/**
 * Visibility-layer components. The platform hides depth by default and lets
 * the user inspect the reasoning when needed:
 *
 *   <ViewGate min="analyst">…scoring, bias, zooming…</ViewGate>
 *   <ViewGate min="methodology">…thresholds, audit trail…</ViewGate>
 *   <DepthHint>Scoring and source detail</DepthHint>  (simple view only)
 */

import { useHydrated } from "@/lib/store";
import {
  modeAtLeast,
  useViewModeStore,
  VIEW_MODE_DESCRIPTIONS,
  VIEW_MODE_LABELS,
  type ViewMode,
} from "@/lib/viewMode";

/** Current mode, hydration-safe: renders as "simple" until the client store loads. */
export function useViewMode(): ViewMode {
  const hydrated = useHydrated();
  const mode = useViewModeStore((s) => s.mode);
  return hydrated ? mode : "simple";
}

/** Renders children only when the current view shows at least `min` depth. */
export function ViewGate({
  min,
  children,
  fallback = null,
}: {
  min: Exclude<ViewMode, "simple">;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const mode = useViewMode();
  return modeAtLeast(mode, min) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Quiet one-line affordance shown only in Simple view: names what deeper
 * material exists and switches the user into Analyst view on demand.
 */
export function DepthHint({ children }: { children: React.ReactNode }) {
  const mode = useViewMode();
  const setMode = useViewModeStore((s) => s.setMode);
  if (mode !== "simple") return null;
  return (
    <p className="text-[11.5px] text-ink-faint">
      {children} —{" "}
      <button
        onClick={() => setMode("analyst")}
        className="underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
      >
        open Analyst view
      </button>
      .
    </p>
  );
}

const MODES: ViewMode[] = ["simple", "analyst", "methodology"];

/** Compact three-segment control for the shell sidebar and settings. */
export function ViewModeSwitch({ compact = false }: { compact?: boolean }) {
  const hydrated = useHydrated();
  const mode = useViewModeStore((s) => s.mode);
  const setMode = useViewModeStore((s) => s.setMode);
  const current = hydrated ? mode : "simple";

  return (
    <div>
      {!compact ? <p className="pb-1 text-[11.5px] text-ink-faint">View depth</p> : null}
      <div
        role="radiogroup"
        aria-label="View depth"
        className="flex w-full rounded-[5px] bg-surface-muted p-[2px]"
      >
        {MODES.map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={current === m}
            title={VIEW_MODE_DESCRIPTIONS[m]}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-[4px] px-1 py-[3px] text-[10.5px] transition-colors ${
              current === m
                ? "bg-surface font-medium text-ink shadow-none"
                : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {VIEW_MODE_LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
