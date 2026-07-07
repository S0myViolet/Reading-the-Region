"use client";

import { useEffect, useState } from "react";
import { WALKTHROUGHS } from "@/lib/copy";
import { useHydrated, useIntelligenceStore } from "@/lib/store";

/**
 * Page guide — deliberately light. A single quiet line that expands to three
 * short items (purpose, recommended action, next step) with the common
 * mistake behind one more click. Expanded automatically only on the user's
 * first visit to a page; collapsed ever after. Hidden when Guided Mode is off.
 */
export function WalkthroughPanel({ pageId }: { pageId: string }) {
  const hydrated = useHydrated();
  const guidedMode = useIntelligenceStore((s) => s.guidedMode);
  const seen = useIntelligenceStore((s) => s.seenWalkthroughs);
  const markSeen = useIntelligenceStore((s) => s.markWalkthroughSeen);
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const [showMistake, setShowMistake] = useState(false);

  const firstVisit = hydrated && !seen.includes(pageId);

  // First visit: open once, then record the visit so the guide stays quiet.
  useEffect(() => {
    if (!hydrated || !guidedMode) return;
    if (expanded === null) {
      setExpanded(firstVisit);
      if (firstVisit) markSeen(pageId);
    }
  }, [hydrated, guidedMode, expanded, firstVisit, markSeen, pageId]);

  const content = WALKTHROUGHS[pageId];
  if (!hydrated || !guidedMode || !content) return null;

  const isOpen = expanded === true;

  return (
    <aside className="mb-8 -mt-3">
      <button
        onClick={() => setExpanded(!isOpen)}
        className="text-[11.5px] text-ink-faint hover:text-ink-soft"
        aria-expanded={isOpen}
      >
        <span className="mr-1 inline-block w-2 text-[9px]">{isOpen ? "▾" : "▸"}</span>
        Page guide
      </button>
      {isOpen ? (
        <div className="mt-2 ml-[3px] space-y-1.5 border-l border-line pl-4">
          <p className="max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
            {content.purpose}
          </p>
          <p className="max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">Do here — </span>
            {content.recommendedAction}
          </p>
          <p className="max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
            <span className="text-ink-faint">Then — </span>
            {content.nextStep}
          </p>
          {showMistake ? (
            <p className="max-w-xl text-[12.5px] leading-relaxed text-ink-soft">
              <span className="text-ink-faint">Avoid — </span>
              {content.commonMistake}
            </p>
          ) : (
            <button
              onClick={() => setShowMistake(true)}
              className="text-[11.5px] text-ink-faint underline decoration-line-strong underline-offset-2 hover:text-ink-soft"
            >
              Common mistake to avoid
            </button>
          )}
        </div>
      ) : null}
    </aside>
  );
}
