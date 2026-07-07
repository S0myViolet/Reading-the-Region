import Link from "next/link";
import type { EntityKind } from "@/lib/types";
import { ENTITY_KIND_LABELS, ENTITY_ROUTES } from "@/lib/types";

/** Cross-link to any intelligence object — a quiet two-line text link. */
export function EntityLink({
  kind,
  id,
  title,
}: {
  kind: EntityKind;
  id: string;
  title: string;
}) {
  return (
    <Link href={`${ENTITY_ROUTES[kind]}/${id}`} className="group block py-0.5">
      <span className="block text-[10.5px] text-ink-faint">
        {ENTITY_KIND_LABELS[kind]} · <span className="font-mono">{id}</span>
      </span>
      <span className="text-[12.5px] leading-snug text-ink-soft group-hover:text-accent-ink">
        {title}
      </span>
    </Link>
  );
}

export interface RelatedGroup {
  heading: string;
  kind: EntityKind;
  items: Array<{ id: string; title: string }>;
  emptyNote?: string;
}

/**
 * Relationship trail: every detail page shows where its object sits in the
 * intelligence chain and what it connects to, grouped by layer. Rendered as
 * a quiet outline — a hairline rail, no boxes.
 */
export function RelatedObjectsPanel({ groups }: { groups: RelatedGroup[] }) {
  return (
    <section>
      <h3 className="mb-3 text-[13px] font-medium text-ink">Relationship trail</h3>
      <div className="space-y-4 border-l border-line pl-4">
        {groups.map((g) => (
          <div key={g.heading}>
            <p className="mb-1 text-[11px] text-ink-faint">{g.heading}</p>
            {g.items.length > 0 ? (
              <div className="grid gap-1.5">
                {g.items.map((it) => (
                  <EntityLink key={it.id} kind={g.kind} id={it.id} title={it.title} />
                ))}
              </div>
            ) : (
              <p className="text-[11.5px] text-ink-faint">
                {g.emptyNote ?? `No linked ${g.heading.toLowerCase()} yet.`}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
