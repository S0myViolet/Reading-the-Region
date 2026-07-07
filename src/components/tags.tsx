import Link from "next/link";
import type { BiasTag, Sector, SystemAffected } from "@/lib/types";
import { BIAS_TAG_LABELS, SECTOR_LABELS, SYSTEM_LABELS } from "@/lib/types";

/*
 * Tag groups are quiet, borderless chips. Colour is not used to distinguish
 * tag families — position and label wording do that work; caution tint is
 * reserved for bias warnings.
 */

export function SectorTags({ sectors, linked = true }: { sectors: Sector[]; linked?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {sectors.map((s) =>
        linked ? (
          <Link
            key={s}
            href={`/signals?sector=${s}`}
            className="rounded-[4px] bg-surface-muted px-1.5 py-px text-[11px] text-ink-soft hover:text-accent-ink"
          >
            {SECTOR_LABELS[s]}
          </Link>
        ) : (
          <span
            key={s}
            className="rounded-[4px] bg-surface-muted px-1.5 py-px text-[11px] text-ink-soft"
          >
            {SECTOR_LABELS[s]}
          </span>
        ),
      )}
    </span>
  );
}

export function SystemTags({ systems }: { systems: SystemAffected[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {systems.map((s) => (
        <span
          key={s}
          title="System affected"
          className="rounded-[4px] bg-surface-muted px-1.5 py-px text-[11px] text-ink-soft"
        >
          {SYSTEM_LABELS[s]}
        </span>
      ))}
    </span>
  );
}

export function SourceBiasTags({ tags }: { tags: BiasTag[] }) {
  if (tags.length === 0)
    return <span className="text-[11px] text-ink-faint">No bias tags recorded</span>;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          title="Known bias to weigh when using this source"
          className="rounded-[4px] bg-caution-soft px-1.5 py-px text-[11px] text-caution"
        >
          {BIAS_TAG_LABELS[t]}
        </span>
      ))}
    </span>
  );
}

export function PlainTags({ tags }: { tags: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-[4px] bg-surface-muted px-1.5 py-px text-[11px] text-ink-soft"
        >
          {t}
        </span>
      ))}
    </span>
  );
}
