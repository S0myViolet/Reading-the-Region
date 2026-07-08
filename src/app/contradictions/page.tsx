"use client";

/**
 * Contradictions — tensions between two valid but opposing forces. They are
 * not errors: a contradiction is often the most strategically rich object in
 * the intelligence base, and both sides stay evidence-linked to signals.
 *
 * Layout has exactly four layers: header, one control bar, the tension list,
 * and the collapsed page guide. Each tension is one .list-row. The simple row
 * is the readable sentence with the type quietly on the right. The advanced
 * row makes tensions comparable at a glance: both sides as short labelled
 * lines, why it matters, tension strength in words, and the linked-signal
 * count — plus the score-based ordering control in the bar.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import {
  ControlBar,
  ControlSearch,
  ControlSelect,
} from "@/components/ControlBar";
import { useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { explainContradiction } from "@/lib/explain";
import { DEFINITIONS } from "@/lib/copy";
import type { Contradiction, ContradictionType } from "@/lib/types";
import { CONTRADICTION_TYPE_LABELS } from "@/lib/types";
import {
  CONTRADICTION_SORT_OPTIONS,
  TENSION_STRENGTH_WORDS,
  btnPrimary,
  firstSentence,
  linkedSignalCount,
  sortContradictions,
  whyItMattersLine,
  type ContradictionSort,
} from "./contradiction-ui";

const TYPE_KEYS = Object.keys(CONTRADICTION_TYPE_LABELS) as ContradictionType[];

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  ...TYPE_KEYS.map((t) => ({ value: t, label: CONTRADICTION_TYPE_LABELS[t] })),
];

function ContradictionsHeader() {
  return (
    <PageHeader
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
  const advanced = useViewMode() !== "simple";

  if (!advanced) {
    return (
      <Link
        href={`/contradictions/${contradiction.id}`}
        className="list-row group"
      >
        <div className="flex items-baseline justify-between gap-6">
          <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
            {contradiction.name}
          </p>
          <span className="shrink-0 text-[11.5px] text-ink-faint">
            {CONTRADICTION_TYPE_LABELS[contradiction.contradictionType]}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-faint">
          {explainContradiction(contradiction)}
        </p>
      </Link>
    );
  }

  const why = whyItMattersLine(contradiction);
  const signalCount = linkedSignalCount(contradiction);
  const strength = contradiction.scores.tensionStrength;

  return (
    <Link
      href={`/contradictions/${contradiction.id}`}
      className="list-row group"
    >
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {contradiction.name}
        </p>
        <span className="shrink-0 text-[11.5px] text-ink-faint">
          {CONTRADICTION_TYPE_LABELS[contradiction.contradictionType]}
        </span>
      </div>
      <div className="mt-1.5 grid gap-x-8 gap-y-1 sm:grid-cols-2">
        <p className="text-[12px] leading-relaxed text-ink-soft">
          <span className="text-ink-faint">One side — </span>
          {firstSentence(contradiction.sideA)}
        </p>
        <p className="text-[12px] leading-relaxed text-ink-soft">
          <span className="text-ink-faint">The other side — </span>
          {firstSentence(contradiction.sideB)}
        </p>
      </div>
      {why ? (
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
          <span className="text-ink-faint">Why it matters — </span>
          {why}
        </p>
      ) : null}
      <p className="mt-1.5 text-[11.5px] text-ink-faint">
        Tension strength: {TENSION_STRENGTH_WORDS[strength]}{" "}
        <span className="font-mono text-[10.5px]">{strength}/5</span>
        {" · "}
        {signalCount} signal{signalCount === 1 ? "" : "s"} linked
        {" · "}
        <span className="underline decoration-line-strong underline-offset-2 group-hover:text-ink-soft">
          Open contradiction
        </span>
      </p>
    </Link>
  );
}

export default function ContradictionsPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<ContradictionSort>("tension");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = contradictions.filter((c) => {
      if (typeFilter !== "all" && c.contradictionType !== typeFilter) return false;
      if (
        q &&
        !`${c.name} ${c.sideA} ${c.sideB} ${c.underlyingTension}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    return sortContradictions(filtered, sort);
  }, [contradictions, query, typeFilter, sort]);

  if (!hydrated) {
    return (
      <>
        <ContradictionsHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  return (
    <>
      <ContradictionsHeader />
      <WalkthroughPanel pageId="contradictions" />

      <ControlBar
        right={
          contradictions.length > 0 ? (
            <span className="text-[12px] text-ink-faint">
              {contradictions.length} recorded
            </span>
          ) : null
        }
      >
        <ControlSearch
          value={query}
          onChange={setQuery}
          placeholder="Search contradictions…"
        />
        <ControlSelect
          label="Type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={TYPE_OPTIONS}
        />
        {mode !== "simple" ? (
          <ControlSelect
            label="Order"
            value={sort}
            onChange={(v) => setSort(v as ContradictionSort)}
            options={CONTRADICTION_SORT_OPTIONS}
          />
        ) : null}
      </ControlBar>

      {contradictions.length === 0 ? (
        <EmptyState
          message="No contradictions recorded yet. Foresight without tension is usually under-scanned — look for places where two valid signals pull in opposite directions."
          actionLabel="Open the Signal Library"
          actionHref="/signals"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          message="Nothing matches the current filters. Contradictions are typed against nine recurring tension families — widen the type filter or clear the search to see the rest."
          actionLabel="Record contradiction"
          actionHref="/contradictions/new"
        />
      ) : (
        <section aria-label="Contradictions">
          {rows.map((c) => (
            <ContradictionRow key={c.id} contradiction={c} />
          ))}
        </section>
      )}
    </>
  );
}
