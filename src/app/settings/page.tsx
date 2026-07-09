"use client";

/**
 * Settings — workspace preferences, guidance controls, and data
 * administration, read as one quiet article: Product mode (Simple vs
 * Advanced, with the depth control inside Advanced), Guided mode &
 * onboarding, Data, then the review-status reference behind a disclosure.
 * All state lives in the client store, so the page is hydration-gated.
 */

import Link from "next/link";
import { useState } from "react";
import { ReviewStatusBadge } from "@/components/badges";
import { LiveScanStatus } from "@/components/LiveScanSync";
import { PageHeader } from "@/components/PageHeader";
import { AppModeSwitch, ViewModeSwitch } from "@/components/ViewMode";
import { WALKTHROUGHS } from "@/lib/copy";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { REVIEW_STATUS_LABELS, type ReviewStatus } from "@/lib/types";
import { VIEW_MODE_LABELS } from "@/lib/viewMode";

// ---------------------------------------------------------------------------
// Reference copy
// ---------------------------------------------------------------------------

/** The two depths available inside Advanced mode, for the definition list. */
const ADVANCED_DEPTHS = ["analyst", "methodology"] as const;

/** Product-mode framing for the settings page. */
const PRODUCT_MODE_COPY = {
  simple: "Shows the main findings in plain language.",
  advanced: "Shows the full evidence pipeline, scores, sources, and review rules.",
} as const;

/** Depth descriptions for the settings page, in plain language. */
const ADVANCED_DEPTH_COPY: Record<(typeof ADVANCED_DEPTHS)[number], string> = {
  analyst: "Shows scores and evidence quality.",
  methodology: "Shows thresholds, validation rules, and audit trail.",
};

/** One-line meaning for each review status, shown in the reference list. */
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

// ---------------------------------------------------------------------------
// Local presentational helpers — one visual weight for every control
// ---------------------------------------------------------------------------

/** Quiet chip button: the single weight used by every settings action. */
const chipBtn =
  "shrink-0 rounded-[4px] bg-surface-muted px-3 py-1.5 text-[12.5px] text-ink-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[13px] font-medium text-ink">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink-faint">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** A setting row: name + faint explanation on the left, one control on the right. */
function SettingRow({
  name,
  detail,
  control,
}: {
  name: string;
  detail: React.ReactNode;
  control: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
      <div className="max-w-xl">
        <p className="text-[13px] text-ink">{name}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-faint">{detail}</p>
      </div>
      {control}
    </div>
  );
}

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
  const [showStatusReference, setShowStatusReference] = useState(false);

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
        title="Settings"
        description="Workspace preferences, guidance, and data administration."
      />

      <div className="space-y-10">
      {/* Product mode & view depth ------------------------------------------ */}
      <SettingsSection
        title="Product mode"
        description="Which product this workspace opens, and how much of the analytical engine each page shows. The same controls appear in the sidebar; changing them never touches the evidence base."
      >
        <div className="max-w-xs">
          <AppModeSwitch />
        </div>
        <dl className="mt-4 max-w-2xl space-y-3">
          <div>
            <dt className="text-[12px] font-medium text-ink-faint">
              Simple<span className="font-normal"> — default</span>
            </dt>
            <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
              {PRODUCT_MODE_COPY.simple}
            </dd>
          </div>
          <div>
            <dt className="text-[12px] font-medium text-ink-faint">Advanced</dt>
            <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
              {PRODUCT_MODE_COPY.advanced}
            </dd>
          </div>
        </dl>
        <p className="mt-4 max-w-2xl text-[11.5px] leading-relaxed text-ink-faint">
          Guided mode is a separate onboarding and help layer — it explains
          each page and does not change the methodology.
        </p>

        <div className="mt-8">
          <p className="text-[12px] font-medium text-ink">Depth inside Advanced mode</p>
          <div className="mt-2 max-w-xs">
            <ViewModeSwitch compact />
          </div>
          <dl className="mt-4 max-w-2xl space-y-3">
            {ADVANCED_DEPTHS.map((m) => (
              <div key={m}>
                <dt className="text-[12px] font-medium text-ink-faint">
                  {VIEW_MODE_LABELS[m]}
                </dt>
                <dd className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
                  {ADVANCED_DEPTH_COPY[m]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </SettingsSection>

      {/* Guided mode & onboarding ------------------------------------------ */}
      <SettingsSection
        title="Guided mode & onboarding"
        description="Controls for the in-app method guidance. The same Guided Mode switch appears in the sidebar."
      >
        <div className="max-w-2xl space-y-5">
          <SettingRow
            name="Guided Mode"
            detail="Opens every main section page with a short guide: the page's purpose, the recommended action, the common mistake to avoid, and the next step."
            control={
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
            }
          />
          <SettingRow
            name="First-run introduction"
            detail="Five short screens covering the intelligence pipeline, where to start, and how evidence moves upward."
            control={
              <button onClick={() => resetOnboarding()} className={chipBtn}>
                Replay introduction
              </button>
            }
          />
          <SettingRow
            name="Hidden page guidance"
            detail={
              hiddenGuidanceCount === 0
                ? "Guidance dismissed on individual pages stays hidden until restored. No page guidance is currently hidden."
                : `Guidance dismissed on individual pages stays hidden until restored. ${hiddenGuidanceCount} page guidance panel${hiddenGuidanceCount === 1 ? " is" : "s are"} currently hidden.`
            }
            control={
              <button
                onClick={handleRestoreAllGuidance}
                disabled={hiddenGuidanceCount === 0}
                className={chipBtn}
              >
                Restore all
              </button>
            }
          />
        </div>
      </SettingsSection>

      {/* Live updates -------------------------------------------------------- */}
      <SettingsSection
        title="Live updates"
        description="The platform can pull new material from real news feeds while it is running."
      >
        <div className="max-w-2xl">
          <LiveScanStatus detailed />
        </div>
      </SettingsSection>

      {/* Data --------------------------------------------------------------- */}
      <SettingsSection
        title="Data"
        description="This workspace stores everything locally in this browser — nothing is sent to a server."
      >
        <div className="max-w-2xl space-y-5">
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            Observations, signals, and conclusions persist in local storage and
            survive reloads on this machine only. The seed dataset is demonstration
            material — sample objects labelled as demo data, never to be cited as
            real evidence.{" "}
            <span className="text-ink-faint">
              Current base: <span className="font-mono">{totalObjects}</span>{" "}
              objects across the eleven entity collections.
            </span>
          </p>
          <SettingRow
            name="Export workspace"
            detail="Downloads the eleven entity collections — observations through indicators — as a single JSON file."
            control={
              <button onClick={handleExport} className={chipBtn}>
                Export as JSON
              </button>
            }
          />
          <div>
            <button
              onClick={handleReset}
              className="text-[12.5px] text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-caution hover:decoration-caution"
            >
              Reset to demonstration dataset…
            </button>
            <p className="mt-1 max-w-xl text-[11.5px] leading-relaxed text-ink-faint">
              Discards every edit and addition stored in this browser and restores
              the seed data. Cannot be undone — export the workspace first if any of
              your own material should be kept.
            </p>
          </div>
          {dataNote ? (
            <p className="text-[11.5px] text-accent-ink">{dataNote}</p>
          ) : null}
        </div>
      </SettingsSection>

      {/* Review status reference — behind a quiet disclosure ----------------- */}
      <section>
        <button
          onClick={() => setShowStatusReference((s) => !s)}
          aria-expanded={showStatusReference}
          className="text-[12px] text-ink-faint hover:text-ink-soft"
        >
          <span className="mr-1 inline-block w-2 text-[9px]">
            {showStatusReference ? "▾" : "▸"}
          </span>
          Review status reference — what each status means
        </button>
        {showStatusReference ? (
          <div className="ml-[3px] mt-3 max-w-2xl border-l border-line pl-4">
            <p className="text-[12px] leading-relaxed text-ink-faint">
              Every analytical object carries a review status recording how far its
              claim may be trusted.
            </p>
            <dl className="mt-3 space-y-2.5">
              {statuses.map((status) => (
                <div
                  key={status}
                  className="grid gap-x-6 gap-y-0.5 sm:grid-cols-[170px_1fr]"
                >
                  <dt>
                    <ReviewStatusBadge status={status} />
                  </dt>
                  <dd className="text-[12.5px] leading-relaxed text-ink-soft">
                    {REVIEW_STATUS_MEANINGS[status]}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[12px] font-medium text-ink">
              Always requires human review
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
              Regardless of score or status, the following material must pass a
              human decision before it informs any conclusion:
            </p>
            <ul className="mt-1.5 space-y-1">
              {ALWAYS_HUMAN_REVIEW.map((rule) => (
                <li key={rule} className="text-[12.5px] leading-relaxed text-ink-soft">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* About --------------------------------------------------------------- */}
      <section>
        <h2 className="text-[13px] font-medium text-ink">About</h2>
        <p className="mt-2 font-display text-[17px] leading-tight text-ink">
          Reading the Region
        </p>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          A Strategic Foresight Intelligence System for Detecting, Interpreting,
          and Translating Regional Change
        </p>
        <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
          The system scans for early evidence of change across MENA, with particular
          depth on the Gulf, the United Arab Emirates, and Saudi Arabia, alongside
          Egypt, the Levant, North Africa, and global developments with regional
          significance. Evidence moves through a disciplined pipeline — observation,
          signal, cluster, pattern, contradiction, driver, future territory,
          scenario, strategic implication, monitoring — so that every conclusion can
          be traced back down to its sources.
        </p>
        <p className="mt-2 text-[12.5px] text-ink-soft">
          The full method, thresholds, and scanning philosophy are documented on the{" "}
          <Link
            href="/methodology"
            className="text-accent-ink underline decoration-line-strong underline-offset-2 hover:decoration-accent"
          >
            Methodology
          </Link>{" "}
          page.
        </p>
      </section>
      </div>
    </>
  );
}
