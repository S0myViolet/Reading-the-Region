import Link from "next/link";
import type { EntityKind } from "@/lib/types";
import { ENTITY_KIND_LABELS, ENTITY_ROUTES } from "@/lib/types";

/** Cross-link to any intelligence object, with its kind as an overline. */
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
    <Link
      href={`${ENTITY_ROUTES[kind]}/${id}`}
      className="group block border border-line bg-surface px-2.5 py-1.5 rounded-[2px] hover:border-accent"
    >
      <span className="overline-label block group-hover:text-accent-ink">
        {ENTITY_KIND_LABELS[kind]} · <span className="font-mono normal-case">{id}</span>
      </span>
      <span className="text-[12.5px] text-ink leading-snug">{title}</span>
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
 * intelligence chain and what it connects to, grouped by layer.
 */
export function RelatedObjectsPanel({ groups }: { groups: RelatedGroup[] }) {
  return (
    <section className="card">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">Relationship trail</h3>
      </header>
      <div className="space-y-3 px-4 py-3">
        {groups.map((g) => (
          <div key={g.heading}>
            <p className="overline-label mb-1">{g.heading}</p>
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
