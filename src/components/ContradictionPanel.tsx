import Link from "next/link";
import type { Contradiction } from "@/lib/types";
import { CONTRADICTION_TYPE_LABELS } from "@/lib/types";

/**
 * Side-by-side tension display. Contradictions are sites of strategic
 * intelligence, not errors — both sides are presented as valid evidence.
 * The oxide left rail is the only colour: it marks tension without shouting.
 */
export function ContradictionPanel({
  contradiction,
  linked = true,
}: {
  contradiction: Contradiction;
  linked?: boolean;
}) {
  const heading = linked ? (
    <Link
      href={`/contradictions/${contradiction.id}`}
      className="hover:text-accent-ink"
    >
      {contradiction.name}
    </Link>
  ) : (
    contradiction.name
  );

  return (
    <section className="border-l-2 border-tension/50 pl-4">
      <p className="text-[11px] text-tension">
        Contradiction · {CONTRADICTION_TYPE_LABELS[contradiction.contradictionType]}
      </p>
      <h3 className="font-display mt-0.5 text-[15px] text-ink">{heading}</h3>
      <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] text-ink-faint">One side</p>
          <p className="text-[13px] leading-snug text-ink">{contradiction.sideA}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            {contradiction.evidenceSideA}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[11px] text-ink-faint">The other</p>
          <p className="text-[13px] leading-snug text-ink">{contradiction.sideB}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            {contradiction.evidenceSideB}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-ink-soft">
        <span className="text-ink-faint">Underlying tension — </span>
        {contradiction.underlyingTension}
      </p>
    </section>
  );
}

/** Placed where a conclusion has no linked contradiction — the absence must be explicit. */
export function NoContradictionNote() {
  return (
    <p className="max-w-xl text-[12px] italic leading-relaxed text-ink-faint">
      No contradiction linked yet. Check whether there is an opposing reading
      before relying on this conclusion.
    </p>
  );
}
