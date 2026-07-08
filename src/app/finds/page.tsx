"use client";

/**
 * New Finds — the Simple Mode review queue. Things the platform noticed that
 * may or may not matter; the user reviews them one at a time and decides:
 * keep, needs more proof, or dismiss. A short queue, not a database.
 *
 * Simple-language rules apply: verdicts are words (never criteria fractions),
 * no entity ids in the primary UI, no methodology vocabulary.
 */

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { Pill } from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { FIND_VERDICT_WORDS, findVerdict, firstSentence, type FindVerdict } from "@/lib/simple";
import { SECTOR_LABELS, type Observation } from "@/lib/types";

const VERDICT_RANK: Record<FindVerdict, number> = { keep: 0, more_proof: 1, noise: 2 };

const VERDICT_TONE: Record<FindVerdict, "accent" | "caution" | "neutral"> = {
  keep: "accent",
  more_proof: "caution",
  noise: "neutral",
};

const quietLink =
  "underline decoration-line-strong underline-offset-2 hover:text-ink-soft";

function fmtDate(x: string): string {
  return new Date(x).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FindsHeader() {
  return (
    <PageHeader
      title="New Finds"
      description="Review what the platform found and decide what is worth keeping."
    />
  );
}

/** The current find, shown generously — one thing to look at, one decision. */
function FocusedFind({
  obs,
  onKeep,
  onMoreProof,
  onDismiss,
}: {
  obs: Observation;
  onKeep: () => void;
  onMoreProof: () => void;
  onDismiss: () => void;
}) {
  const verdict = findVerdict(obs);

  return (
    <article aria-label="Current find" className="card mb-8 px-7 py-6 sm:px-9 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <h2 className="min-w-0 max-w-xl text-[16.5px] font-medium leading-snug text-ink">
          {obs.title}
        </h2>
        <Pill tone={VERDICT_TONE[verdict]}>{FIND_VERDICT_WORDS[verdict]}</Pill>
      </div>
      <p className="mt-1.5 text-[12px] text-ink-faint">
        {obs.sourceName} · {fmtDate(obs.dateObserved)}
      </p>

      <p className="mt-5 line-clamp-4 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
        {obs.description}
      </p>

      {obs.potentialFutureRelevance ? (
        <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          <span className="font-medium text-ink">Why it may matter — </span>
          {firstSentence(obs.potentialFutureRelevance)}
        </p>
      ) : null}

      {obs.sectors.length > 0 ? (
        <p className="mt-4 text-[12px] text-ink-faint">
          {obs.sectors.map((s) => SECTOR_LABELS[s]).join(" · ")}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={onKeep}
          className="rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink"
        >
          Keep
        </button>
        <button
          onClick={onMoreProof}
          className="rounded-[4px] bg-surface-muted px-3.5 py-1.5 text-[12.5px] text-ink-soft hover:text-ink"
        >
          Need more proof
        </button>
        <button
          onClick={onDismiss}
          className="rounded-[4px] bg-surface-muted px-3.5 py-1.5 text-[12.5px] text-ink-soft hover:text-ink"
        >
          Dismiss
        </button>
        <Link
          href={`/inbox/${obs.id}`}
          className={`ml-auto text-[12px] text-ink-faint ${quietLink}`}
        >
          Full record
        </Link>
      </div>
    </article>
  );
}

function FindsContent() {
  const hydrated = useHydrated();
  const searchParams = useSearchParams();

  const observations = useIntelligenceStore((s) => s.observations);
  const keptFindIds = useIntelligenceStore((s) => s.keptFindIds);
  const keepFind = useIntelligenceStore((s) => s.keepFind);
  const unkeepFind = useIntelligenceStore((s) => s.unkeepFind);
  const setObservationStatus = useIntelligenceStore((s) => s.setObservationStatus);

  /** Position in the queue; clamped on render as the queue shrinks. */
  const [position, setPosition] = useState(0);
  /** Decisions made this session (keep / more proof / dismiss). */
  const [decidedCount, setDecidedCount] = useState(0);
  const [keptOpen, setKeptOpen] = useState(false);

  const queue = useMemo(
    () =>
      observations
        .filter((o) => o.status === "unreviewed" && !keptFindIds.includes(o.id))
        .sort((a, b) => {
          const rank = VERDICT_RANK[findVerdict(a)] - VERDICT_RANK[findVerdict(b)];
          if (rank !== 0) return rank;
          return b.dateObserved.localeCompare(a.dateObserved);
        }),
    [observations, keptFindIds],
  );

  const kept = useMemo(
    () => observations.filter((o) => keptFindIds.includes(o.id)),
    [observations, keptFindIds],
  );

  // ?item=… jumps the queue to that find (applied once per param value).
  const itemParam = searchParams.get("item");
  const appliedItemParam = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated || !itemParam || appliedItemParam.current === itemParam) return;
    appliedItemParam.current = itemParam;
    const idx = queue.findIndex((o) => o.id === itemParam);
    if (idx >= 0) setPosition(idx);
  }, [hydrated, itemParam, queue]);

  if (!hydrated) {
    return (
      <>
        <FindsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const focusIndex = Math.min(position, Math.max(queue.length - 1, 0));
  const current: Observation | undefined = queue[focusIndex];
  const sessionTotal = decidedCount + queue.length;
  const upNext = queue.filter((_, i) => i !== focusIndex);

  const decide = (action: () => void) => {
    action();
    setDecidedCount((c) => c + 1);
    // The decided find leaves the queue; the next one slides into place.
    setPosition(focusIndex);
  };

  const skip = () => {
    if (queue.length > 0) setPosition((focusIndex + 1) % queue.length);
  };

  const focusFind = (id: string) => {
    const idx = queue.findIndex((o) => o.id === id);
    if (idx >= 0) setPosition(idx);
  };

  return (
    <>
      <FindsHeader />
      <WalkthroughPanel pageId="finds" />

      {current ? (
        <section aria-label="Focused review" className="mb-10">
          <p className="mb-2 flex items-baseline justify-between gap-6 text-[12px] text-ink-faint">
            <span>
              {decidedCount} of {sessionTotal} reviewed today
            </span>
            <button onClick={skip} className={quietLink}>
              Skip
            </button>
          </p>
          <FocusedFind
            obs={current}
            onKeep={() => decide(() => keepFind(current.id))}
            onMoreProof={() =>
              decide(() =>
                setObservationStatus(
                  current.id,
                  "needs_more_evidence",
                  "Marked as needing more proof during New Finds review.",
                ),
              )
            }
            onDismiss={() =>
              decide(() =>
                setObservationStatus(
                  current.id,
                  "archived_noise",
                  "Dismissed during New Finds review.",
                ),
              )
            }
          />

          {upNext.length > 0 ? (
            <div>
              <h2 className="text-[13px] font-medium text-ink">Up next</h2>
              <div>
                {upNext.slice(0, 8).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => focusFind(o.id)}
                    className="list-row group w-full text-left"
                  >
                    <span className="flex items-baseline justify-between gap-6">
                      <span className="min-w-0 truncate text-[13px] text-ink-soft group-hover:text-ink">
                        {o.title}
                      </span>
                      <span className="shrink-0 text-[11.5px] text-ink-faint">
                        {FIND_VERDICT_WORDS[findVerdict(o)]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {upNext.length > 8 ? (
                <p className="mt-2 text-[11.5px] text-ink-faint">
                  and {upNext.length - 8} more
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : (
        <section aria-label="Nothing to review" className="mb-10 max-w-xl">
          {decidedCount > 0 ? (
            <p className="mb-2 text-[12px] text-ink-faint">
              {decidedCount} of {sessionTotal} reviewed today
            </p>
          ) : null}
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Nothing new to review. The platform will surface new finds as scanning
            continues — or{" "}
            <Link href="/explore" className={quietLink}>
              explore what is already known
            </Link>
            .
          </p>
          <p className="mt-2 text-[12px] text-ink-faint">
            Your{" "}
            <Link href="/watchlist" className={quietLink}>
              watchlist
            </Link>{" "}
            shows what is already being tracked.
          </p>
        </section>
      )}

      {kept.length > 0 ? (
        <section aria-label="Kept finds" className="mb-10">
          <button
            onClick={() => setKeptOpen(!keptOpen)}
            aria-expanded={keptOpen}
            className="text-[13px] font-medium text-ink hover:text-accent-ink"
          >
            <span className="mr-1 inline-block w-2 text-[9px] text-ink-faint">
              {keptOpen ? "▾" : "▸"}
            </span>
            Kept ({kept.length})
          </button>
          {keptOpen ? (
            <div className="mt-1">
              {kept.map((o) => (
                <div key={o.id} className="list-row">
                  <div className="flex items-baseline justify-between gap-6">
                    <p className="min-w-0 truncate text-[13px] font-medium text-ink">
                      {o.title}
                    </p>
                    <button
                      onClick={() => unkeepFind(o.id)}
                      className={`shrink-0 text-[11.5px] text-ink-faint ${quietLink}`}
                    >
                      Undo
                    </button>
                  </div>
                  <p className="mt-1 text-[12px] text-ink-faint">
                    Kept — waits to be developed into a signal in Advanced mode.
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}

export default function FindsPage() {
  return (
    <Suspense
      fallback={
        <>
          <FindsHeader />
          <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
        </>
      }
    >
      <FindsContent />
    </Suspense>
  );
}
