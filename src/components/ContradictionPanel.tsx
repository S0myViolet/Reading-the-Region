import Link from "next/link";
import type { Contradiction } from "@/lib/types";
import { CONTRADICTION_TYPE_LABELS } from "@/lib/types";
import { IdChip } from "./badges";

/**
 * Side-by-side tension display. Contradictions are sites of strategic
 * intelligence, not errors — both sides are presented as valid evidence.
 */
export function ContradictionPanel({
  contradiction,
  linked = true,
}: {
  contradiction: Contradiction;
  linked?: boolean;
}) {
  const heading = linked ? (
    <Link href={`/contradictions/${contradiction.id}`} className="hover:underline">
      {contradiction.name}
    </Link>
  ) : (
    contradiction.name
  );

  return (
    <section className="card border-l-2 border-l-tension">
      <header className="border-b border-line px-4 py-2.5">
        <p className="overline-label text-tension">
          Contradiction · {CONTRADICTION_TYPE_LABELS[contradiction.contradictionType]}{" "}
          <IdChip id={contradiction.id} />
        </p>
        <h3 className="font-display text-[15px] text-ink">{heading}</h3>
      </header>
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3">
          <p className="overline-label mb-1">Side A</p>
          <p className="text-[13px] text-ink">{contradiction.sideA}</p>
          <p className="mt-1.5 text-[12px] text-ink-soft">{contradiction.evidenceSideA}</p>
        </div>
        <div className="px-4 py-3">
          <p className="overline-label mb-1">Side B</p>
          <p className="text-[13px] text-ink">{contradiction.sideB}</p>
          <p className="mt-1.5 text-[12px] text-ink-soft">{contradiction.evidenceSideB}</p>
        </div>
      </div>
      <p className="border-t border-line px-4 py-2 text-[12px] text-ink-soft">
        <span className="overline-label mr-1.5">Underlying tension</span>
        {contradiction.underlyingTension}
      </p>
    </section>
  );
}

/** Placed where a conclusion has no linked contradiction — the absence must be explicit. */
export function NoContradictionNote() {
  return (
    <p className="border border-dashed border-line-strong px-3 py-2 text-[12px] text-ink-faint rounded-[2px]">
      No strong contradiction has been identified yet. Treat this conclusion with caution —
      unopposed conclusions are often under-scanned, not correct.
    </p>
  );
}
