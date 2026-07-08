"use client";

/**
 * Mode components. The product hides depth by default and lets the user
 * inspect the reasoning when needed:
 *
 *   <ViewGate min="analyst">…scoring, bias, zooming…</ViewGate>
 *   <ViewGate min="methodology">…thresholds, audit trail…</ViewGate>
 *   <DepthHint>Scoring and source detail</DepthHint>  (simple mode only)
 */

import { useHydrated } from "@/lib/store";
import {
  APP_MODE_DESCRIPTIONS,
  modeAtLeast,
  resolveViewMode,
  useViewModeStore,
  VIEW_MODE_DESCRIPTIONS,
  VIEW_MODE_LABELS,
  type AppMode,
  type ViewMode,
} from "@/lib/viewMode";

/** Current app mode, hydration-safe: "simple" until the client store loads. */
export function useAppMode(): AppMode {
  const hydrated = useHydrated();
  const appMode = useViewModeStore((s) => s.appMode);
  return hydrated ? appMode : "simple";
}

/**
 * Current depth, hydration-safe. Simple app mode always resolves to
 * "simple"; advanced mode resolves to analyst or methodology.
 */
export function useViewMode(): ViewMode {
  const hydrated = useHydrated();
  const appMode = useViewModeStore((s) => s.appMode);
  const mode = useViewModeStore((s) => s.mode);
  return hydrated ? resolveViewMode(appMode, mode) : "simple";
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
 * Quiet one-line affordance shown only in simple mode: names what deeper
 * material exists and opens the advanced system on demand.
 */
export function DepthHint({ children }: { children: React.ReactNode }) {
  const mode = useViewMode();
  const setAppMode = useViewModeStore((s) => s.setAppMode);
  if (mode !== "simple") return null;
  return (
    <p className="text-[11.5px] text-ink-faint">
      {children} —{" "}
      <button
        onClick={() => setAppMode("advanced")}
        className="underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
      >
        open deeper analysis
      </button>
      .
    </p>
  );
}

/** Simple / Advanced product toggle for the shell sidebar and settings. */
export function AppModeSwitch() {
  const hydrated = useHydrated();
  const appMode = useViewModeStore((s) => s.appMode);
  const setAppMode = useViewModeStore((s) => s.setAppMode);
  const current = hydrated ? appMode : "simple";

  return (
    <div
      role="radiogroup"
      aria-label="Product mode"
      className="flex w-full rounded-[5px] bg-surface-muted p-[2px]"
    >
      {(["simple", "advanced"] as const).map((m) => (
        <button
          key={m}
          role="radio"
          aria-checked={current === m}
          title={APP_MODE_DESCRIPTIONS[m]}
          onClick={() => setAppMode(m)}
          className={`flex-1 rounded-[4px] px-1 py-[3px] text-[10.5px] capitalize transition-colors ${
            current === m
              ? "bg-surface font-medium text-ink"
              : "text-ink-faint hover:text-ink-soft"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

const DEPTHS: Array<Exclude<ViewMode, "simple">> = ["analyst", "methodology"];

/** Depth control inside advanced mode: analyst vs full methodology. */
export function ViewModeSwitch({ compact = false }: { compact?: boolean }) {
  const hydrated = useHydrated();
  const mode = useViewModeStore((s) => s.mode);
  const setMode = useViewModeStore((s) => s.setMode);
  const current = hydrated ? (mode === "simple" ? "analyst" : mode) : "analyst";

  return (
    <div>
      {!compact ? <p className="pb-1 text-[11.5px] text-ink-faint">View depth</p> : null}
      <div
        role="radiogroup"
        aria-label="View depth"
        className="flex w-full rounded-[5px] bg-surface-muted p-[2px]"
      >
        {DEPTHS.map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={current === m}
            title={VIEW_MODE_DESCRIPTIONS[m]}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-[4px] px-1 py-[3px] text-[10.5px] transition-colors ${
              current === m
                ? "bg-surface font-medium text-ink"
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
