"use client";

/**
 * Contradictions — tensions between two valid but opposing forces. They are
 * not errors: a contradiction is often the most strategically rich object in
 * the intelligence base, and both sides stay evidence-linked to signals.
 */

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ContradictionPanel } from "@/components/ContradictionPanel";
import { ReviewStatusBadge } from "@/components/badges";
import { Select } from "@/components/form";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { DEFINITIONS } from "@/lib/copy";
import type { Contradiction } from "@/lib/types";
import {
  CONTRADICTION_SORT_OPTIONS,
  ContradictionScoreChips,
  ContradictionTypePill,
  btnPrimary,
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

function ContradictionRow({ contradiction }: { contradiction: Contradiction }) {
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
