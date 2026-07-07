"use client";

/**
 * Contradictions — tensions between two valid but opposing forces. They are
 * not errors: a contradiction is often the most strategically rich object in
 * the intelligence base, and both sides stay evidence-linked to signals.
 *
 * Visibility layers: the simple view lists each tension as a readable
 * sentence with its type and evidence counts in words; score chips, the dense
 * side-by-side columns and score-based ordering open in Analyst view.
 */

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ContradictionPanel } from "@/components/ContradictionPanel";
import { IdChip, ReviewStatusBadge } from "@/components/badges";
import { Select } from "@/components/form";
import { ViewGate } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { explainContradiction } from "@/lib/explain";
import { DEFINITIONS } from "@/lib/copy";
import type { Contradiction } from "@/lib/types";
import {
  CONTRADICTION_SORT_OPTIONS,
  ContradictionScoreChips,
  ContradictionTypePill,
  btnPrimary,
  contradictionEvidenceCounts,
  sortContradictions,
  type ContradictionSort,
} from "./contradiction-ui";

function ContradictionsHeader() {
  return (
    <PageHeader
      overline="Connect & Synthesize"
      title="Contradictions"
      description={DEFINITIONS.contradiction}
      actions={
        <Link href="/contradictions/new" className={btnPrimary}>
          Record contradiction
        </Link>
      }
    />
  );
}

/** Simple-view card: the tension as one readable sentence, no scores. */
function SimpleContradictionCard({ contradiction }: { contradiction: Contradiction }) {
  return (
    <article className="card border-l-2 border-l-tension px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-2xl">
          <p className="overline-label mb-0.5 text-tension">
            Contradiction · <IdChip id={contradiction.id} />
          </p>
          <h3 className="font-display text-[15px] leading-snug text-ink">
            <Link
              href={`/contradictions/${contradiction.id}`}
              className="hover:text-accent-ink hover:underline"
            >
              {contradiction.name}
            </Link>
          </h3>
        </div>
        <ContradictionTypePill type={contradiction.contradictionType} />
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        {explainContradiction(contradiction)}
      </p>
      <p className="mt-2 border-t border-line pt-2 text-[11.5px] text-ink-faint">
        {contradictionEvidenceCounts(contradiction)}
      </p>
    </article>
  );
}

/** Analyst-view row: dense side-by-side columns, score chips, review status. */
function AnalystContradictionRow({ contradiction }: { contradiction: Contradiction }) {
  return (
    <article>
      <ContradictionPanel contradiction={contradiction} />
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-0.5">
        <ContradictionTypePill type={contradiction.contradictionType} />
        <ContradictionScoreChips scores={contradiction.scores} />
        <span className="ml-auto">
          <ReviewStatusBadge status={contradiction.reviewStatus} />
        </span>
      </div>
    </article>
  );
}

function ContradictionRow({ contradiction }: { contradiction: Contradiction }) {
  return (
    <ViewGate
      min="analyst"
      fallback={<SimpleContradictionCard contradiction={contradiction} />}
    >
      <AnalystContradictionRow contradiction={contradiction} />
    </ViewGate>
  );
}

export default function ContradictionsPage() {
  const hydrated = useHydrated();
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const [sort, setSort] = useState<ContradictionSort>("tension");

  if (!hydrated) {
    return (
      <>
        <ContradictionsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const ordered = sortContradictions(contradictions, sort);

  return (
    <>
      <ContradictionsHeader />
      <WalkthroughPanel pageId="contradictions" />

      {ordered.length === 0 ? (
        <EmptyState
          message="No contradictions recorded yet. Foresight without tension is usually under-scanned — look for places where two valid signals pull in opposite directions."
          actionLabel="Open the Signal Library"
          actionHref="/signals"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[11.5px] text-ink-soft">
              {ordered.length} contradiction{ordered.length === 1 ? "" : "s"} recorded
            </p>
            <ViewGate min="analyst">
              <label className="flex items-center gap-2">
                <span className="overline-label">Order</span>
                <span className="w-52">
                  <Select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as ContradictionSort)}
                    aria-label="Order contradictions"
                  >
                    {CONTRADICTION_SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </span>
              </label>
            </ViewGate>
          </div>

          <div className="space-y-5">
            {ordered.map((c) => (
              <ContradictionRow key={c.id} contradiction={c} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
