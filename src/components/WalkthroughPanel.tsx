"use client";

import { useState } from "react";
import { WALKTHROUGHS } from "@/lib/copy";
import { useHydrated, useIntelligenceStore } from "@/lib/store";

/**
 * Collapsible page walkthrough shown under the page header. Content follows
 * the fixed structure: purpose, recommended action, common mistake, next
 * step. Hidden entirely when Guided Mode is off; dismissible per page.
 */
export function WalkthroughPanel({ pageId }: { pageId: string }) {
  const hydrated = useHydrated();
  const guidedMode = useIntelligenceStore((s) => s.guidedMode);
  const dismissed = useIntelligenceStore((s) => s.dismissedWalkthroughs);
  const dismiss = useIntelligenceStore((s) => s.dismissWalkthrough);
  const restore = useIntelligenceStore((s) => s.restoreWalkthrough);
  const [expanded, setExpanded] = useState(true);

  const content = WALKTHROUGHS[pageId];
  if (!hydrated || !guidedMode || !content) return null;

  if (dismissed.includes(pageId)) {
    return (
      <button
        onClick={() => restore(pageId)}
        className="mb-4 text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-accent-ink"
      >
        Show guidance for this page
      </button>
    );
  }

  return (
    <aside className="card mb-5 border-l-2 border-l-accent">
      <header className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="overline-label hover:text-accent-ink"
        >
          {expanded ? "▾" : "▸"} How to work on this page
        </button>
        <button
          onClick={() => dismiss(pageId)}
          className="text-[11px] text-ink-faint hover:text-ink"
          title="Hide this guidance panel. You can restore it any time."
        >
          Hide
        </button>
      </header>
      {expanded ? (
        <dl className="grid gap-x-6 gap-y-2 border-t border-line px-4 py-3 sm:grid-cols-2">
          <div>
            <dt className="overline-label">Purpose</dt>
            <dd className="mt-0.5 text-[12.5px] text-ink-soft">{content.purpose}</dd>
          </div>
          <div>
            <dt className="overline-label">Recommended action</dt>
            <dd className="mt-0.5 text-[12.5px] text-ink-soft">{content.recommendedAction}</dd>
          </div>
          <div>
            <dt className="overline-label text-caution">Common mistake to avoid</dt>
            <dd className="mt-0.5 text-[12.5px] text-ink-soft">{content.commonMistake}</dd>
          </div>
          <div>
            <dt className="overline-label text-accent-ink">Next step</dt>
            <dd className="mt-0.5 text-[12.5px] text-ink-soft">{content.nextStep}</dd>
          </div>
        </dl>
      ) : null}
    </aside>
  );
}
