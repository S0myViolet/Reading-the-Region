"use client";

/**
 * Settings — workspace preferences, guidance controls, review-status
 * reference, and data administration. All state lives in the client store,
 * so the page is hydration-gated like every other store-reading page.
 */

import Link from "next/link";
import { useState } from "react";
import { ReviewStatusBadge } from "@/components/badges";
import { PageHeader } from "@/components/PageHeader";
import { ViewModeSwitch } from "@/components/ViewMode";
import { WALKTHROUGHS } from "@/lib/copy";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { REVIEW_STATUS_LABELS, type ReviewStatus } from "@/lib/types";
import {
  VIEW_MODE_DESCRIPTIONS,
  VIEW_MODE_LABELS,
  type ViewMode,
} from "@/lib/viewMode";

// ---------------------------------------------------------------------------
// Reference copy
// ---------------------------------------------------------------------------

/** The three view depths, in ascending order, for the definition list. */
const VIEW_MODES: ViewMode[] = ["simple", "analyst", "methodology"];

/** One-line meaning for each review status, shown in the reference card. */
const REVIEW_STATUS_MEANINGS: Record<ReviewStatus, string> = {
  draft: "Still being written — not yet part of the usable evidence base.",
  needs_evidence:
    "The claim is plausible but its supporting evidence is too thin to rely on.",
  needs_human_review:
    "Flagged for a human decision before it may inform any conclusion.",
  ai_suggested:
    "Drafted by AI — treated as a suggestion, never as fact, until a human reviews it.",
  human_reviewed:
    "A human has examined it, but it has not yet met its layer's validation thresholds.",
  validated:
    "Meets the validation thresholds for its layer — safe to build on.",
  rejected: "Reviewed and dismissed — kept in the base for the audit trail.",
  archived_noise:
    "Interesting but not strategically meaningful — retained with its triage rationale.",
  duplicate: "Restates an existing object — superseded by the original.",
  contradictory:
    "Credible evidence pulls in opposing directions — the tension itself is the material.",
  monitoring:
    "Tracked over time through leading indicators rather than re-validated once.",
};

/** Standing rule: material that always requires human review before use. */
const ALWAYS_HUMAN_REVIEW: string[] = [
  "Low confidence but high novelty signals.",
  "Low credibility sources carrying interesting claims.",
  "Religion, politics, gender, identity, and sensitive cultural meaning.",
  "Overhyped claims, where PR momentum could be mistaken for structural change.",
  "High-impact contradictions.",
  "Future territories.",
  "Scenarios.",
  "Strategic recommendations.",
];

/** What Guided Mode adds to every main section page. */
const GUIDED_MODE_SHOWS: Array<{ label: string; detail: string }> = [
  { label: "Page purpose", detail: "what the layer is for" },
  { label: "Recommended action", detail: "what to do on the page" },
  { label: "Common mistake", detail: "the error the method guards against" },
  { label: "Next step", detail: "where the evidence should move next" },
];

// ---------------------------------------------------------------------------
// Local presentational helpers
// ---------------------------------------------------------------------------

function SettingsCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card mb-6">
      <header className="border-b border-line px-4 py-2.5">
        <h2 className="overline-label">{title}</h2>
        {caption ? (
          <p className="mt-0.5 text-[11.5px] text-ink-faint">{caption}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

const SECONDARY_BUTTON =
  "border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-50";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const hydrated = useHydrated();

  const guidedMode = useIntelligenceStore((s) => s.guidedMode);
  const setGuidedMode = useIntelligenceStore((s) => s.setGuidedMode);
  const resetOnboarding = useIntelligenceStore((s) => s.resetOnboarding);
  const dismissedWalkthroughs = useIntelligenceStore((s) => s.dismissedWalkthroughs);
  const restoreWalkthrough = useIntelligenceStore((s) => s.restoreWalkthrough);
  const resetToSeedData = useIntelligenceStore((s) => s.resetToSeedData);

  const observations = useIntelligenceStore((s) => s.observations);
  const sources = useIntelligenceStore((s) => s.sources);
  const signals = useIntelligenceStore((s) => s.signals);
  const clusters = useIntelligenceStore((s) => s.clusters);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const territories = useIntelligenceStore((s) => s.territories);
  const scenarios = useIntelligenceStore((s) => s.scenarios);
  const implications = useIntelligenceStore((s) => s.implications);
  const indicators = useIntelligenceStore((s) => s.indicators);

  const [dataNote, setDataNote] = useState<string | null>(null);

  const hiddenGuidanceCount = dismissedWalkthroughs.filter(
    (id) => id in WALKTHROUGHS,
  ).length;

  function handleRestoreAllGuidance() {
    Object.keys(WALKTHROUGHS).forEach((pageId) => restoreWalkthrough(pageId));
  }

  function handleExport() {
    const payload = {
      exportedAt: new Date().toISOString(),
      observations,
      sources,
      signals,
      clusters,
      patterns,
      contradictions,
      drivers,
      territories,
      scenarios,
      implications,
      indicators,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "reading-the-region-export.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDataNote("Export downloaded as reading-the-region-export.json.");
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Reset this workspace to the demonstration dataset? Every observation, signal, and conclusion you have added or edited in this browser will be discarded. This cannot be undone.",
    );
    if (!confirmed) return;
    resetToSeedData();
    setDataNote("Workspace reset to the demonstration dataset.");
  }

  if (!hydrated) {
    return (
      <>
        <PageHeader
          overline="System"
          title="Settings"
          description="Workspace preferences, guidance, and data administration."
        />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const statuses = Object.keys(REVIEW_STATUS_LABELS) as ReviewStatus[];
  const totalObjects =
    observations.length +
    sources.length +
    signals.length +
    clusters.length +
    patterns.length +
    contradictions.length +
    drivers.length +
    territories.length +
    scenarios.length +
    implications.length +
    indicators.length;

  return (
    <>
      <PageHeader
        overline="System"
        title="Settings"
        description="Workspace preferences, guidance, and data administration."
      />

      {/* View depth -------------------------------------------------------- */}
      <SettingsCard
        title="View depth"
        caption="How much of the analytical engine each page shows. The same control appears in the sidebar; changing it never touches the evidence base."
      >
        <div className="border-b border-line px-4 py-3">
          <div className="max-w-sm">
            <ViewModeSwitch />
          </div>
        </div>
        <dl className="space-y-2.5 px-4 py-3">
          {VIEW_MODES.map((m) => (
            <div key={m} className="max-w-2xl">
              <dt className="text-[12.5px] font-medium text-ink">
                {VIEW_MODE_LABELS[m]}
                {m === "simple" ? (
                  <span className="font-normal text-ink-faint"> — default</span>
                ) : null}
              </dt>
              <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                {VIEW_MODE_DESCRIPTIONS[m]}
              </dd>
            </div>
          ))}
        </dl>
      </SettingsCard>

      {/* Guidance --------------------------------------------------------- */}
      <SettingsCard
        title="Guidance"
        caption="Controls for the in-app method guidance. The same Guided Mode switch appears in the sidebar."
      >
        <div className="border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-[13px] font-medium text-ink">Guided Mode</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                When Guided Mode is on, every main section page opens with a short
                guidance panel covering four things:
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {GUIDED_MODE_SHOWS.map((g) => (
                  <li key={g.label} className="text-[12.5px] leading-relaxed text-ink-soft">
                    <span className="font-medium text-ink">{g.label}</span>
                    <span className="text-ink-faint"> — {g.detail}.</span>
                  </li>
                ))}
              </ul>
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[11.5px] text-ink-soft">
              {guidedMode ? "On" : "Off"}
              <button
                role="switch"
                aria-checked={guidedMode}
                aria-label="Guided Mode"
                onClick={() => setGuidedMode(!guidedMode)}
                className={`relative h-[16px] w-[28px] rounded-full border transition-colors ${
                  guidedMode
                    ? "border-accent bg-accent"
                    : "border-line-strong bg-surface-muted"
                }`}
              >
                <span
                  className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white transition-all ${
                    guidedMode ? "left-[14px]" : "left-[2px]"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            Replay the first-run introduction — five short screens covering the
            intelligence pipeline, where to start, and how evidence moves upward.
          </p>
          <button onClick={() => resetOnboarding()} className={SECONDARY_BUTTON}>
            Replay first-run introduction
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            Guidance panels dismissed on individual pages stay hidden until restored.{" "}
            <span className="text-ink-faint">
              {hiddenGuidanceCount === 0
                ? "No page guidance is currently hidden."
                : `${hiddenGuidanceCount} page guidance panel${hiddenGuidanceCount === 1 ? " is" : "s are"} currently hidden.`}
            </span>
          </p>
          <button
            onClick={handleRestoreAllGuidance}
            disabled={hiddenGuidanceCount === 0}
            className={SECONDARY_BUTTON}
          >
            Restore all hidden page guidance
          </button>
        </div>
      </SettingsCard>

      {/* Review statuses reference ---------------------------------------- */}
      <SettingsCard
        title="Review statuses reference"
        caption="Every analytical object carries a review status. The status records how far a claim may be trusted."
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((status) => (
                <tr key={status}>
                  <td className="whitespace-nowrap">
                    <ReviewStatusBadge status={status} />
                  </td>
                  <td className="text-[12.5px] text-ink-soft">
                    {REVIEW_STATUS_MEANINGS[status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3">
          <p className="overline-label">Always requires human review</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            Regardless of score or status, the following material must pass a human
            decision before it informs any conclusion:
          </p>
          <ul className="mt-1.5 grid gap-x-6 gap-y-0.5 sm:grid-cols-2">
            {ALWAYS_HUMAN_REVIEW.map((rule) => (
              <li
                key={rule}
                className="border-l-2 border-l-caution pl-2 text-[12.5px] leading-relaxed text-ink-soft"
              >
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </SettingsCard>

      {/* Data --------------------------------------------------------------- */}
      <SettingsCard
        title="Data"
        caption="Where the workspace lives and how to export or reset it."
      >
        <div className="border-b border-line px-4 py-3">
          <p className="max-w-3xl text-[12.5px] leading-relaxed text-ink-soft">
            This workspace stores all data locally in this browser. Nothing is sent
            to a server: observations, signals, and conclusions persist in local
            storage and survive reloads on this machine only. The seed dataset is
            demonstration material — sample objects labelled as demo data, never to
            be cited as real evidence.
          </p>
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            Current base: <span className="font-mono">{totalObjects}</span> objects
            across the eleven entity collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            Export the eleven entity collections — observations, sources, signals,
            clusters, patterns, contradictions, drivers, territories, scenarios,
            implications, and indicators — as a single JSON file.
          </p>
          <button
            onClick={handleExport}
            className="border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
          >
            Export workspace as JSON
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="border border-tension/30 bg-tension-soft px-3 py-2.5 rounded-[2px]">
            <p className="text-[12.5px] font-medium text-tension">
              Destructive action — cannot be undone
            </p>
            <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
              Resetting discards every edit and addition stored in this browser and
              restores the demonstration dataset. Export the workspace first if any
              of your own material should be kept.
            </p>
            <button
              onClick={handleReset}
              className="mt-2 border border-tension/40 bg-surface px-3 py-1.5 text-[12.5px] font-medium text-tension rounded-[2px] hover:border-tension"
            >
              Reset to demonstration dataset
            </button>
          </div>
          {dataNote ? (
            <p className="mt-2 text-[11.5px] text-ink-faint">{dataNote}</p>
          ) : null}
        </div>
      </SettingsCard>

      {/* About this system --------------------------------------------------- */}
      <SettingsCard title="About this system">
        <div className="px-4 py-3">
          <p className="font-display text-[18px] leading-tight text-ink">
            Reading the Region
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-faint">
            A Strategic Foresight Intelligence System for Detecting, Interpreting,
            and Translating Regional Change
          </p>
          <p className="mt-2.5 max-w-3xl text-[12.5px] leading-relaxed text-ink-soft">
            The system scans for early evidence of change across MENA, with
            particular depth on the Gulf, the United Arab Emirates, and Saudi
            Arabia, alongside Egypt, the Levant, North Africa, and global
            developments with regional significance. Evidence moves through a
            disciplined pipeline — observation, signal, cluster, pattern,
            contradiction, driver, future territory, scenario, strategic
            implication, monitoring — so that every conclusion can be traced back
            down to its sources.
          </p>
          <p className="mt-2.5 text-[12.5px] text-ink-soft">
            The full method, thresholds, and scanning philosophy are documented on
            the{" "}
            <Link
              href="/methodology"
              className="text-accent-ink underline decoration-line-strong underline-offset-2 hover:decoration-accent"
            >
              Methodology
            </Link>{" "}
            page.
          </p>
        </div>
      </SettingsCard>
    </>
  );
}
