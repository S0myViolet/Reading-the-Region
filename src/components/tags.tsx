import Link from "next/link";
import type { BiasTag, Sector, SystemAffected } from "@/lib/types";
import { BIAS_TAG_LABELS, SECTOR_LABELS, SYSTEM_LABELS } from "@/lib/types";

export function SectorTags({ sectors, linked = true }: { sectors: Sector[]; linked?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {sectors.map((s) =>
        linked ? (
          <Link
            key={s}
            href={`/signals?sector=${s}`}
            className="border border-line bg-surface px-1.5 py-px text-[10.5px] text-ink-soft rounded-[2px] hover:border-accent hover:text-accent-ink"
          >
            {SECTOR_LABELS[s]}
          </Link>
        ) : (
          <span
            key={s}
            className="border border-line bg-surface px-1.5 py-px text-[10.5px] text-ink-soft rounded-[2px]"
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
          className="border border-info/25 bg-info-soft px-1.5 py-px text-[10.5px] text-info rounded-[2px]"
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
          className="border border-caution/30 bg-caution-soft px-1.5 py-px text-[10.5px] text-caution rounded-[2px]"
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
          className="bg-surface-muted px-1.5 py-px text-[10.5px] text-ink-soft rounded-[2px]"
        >
          {t}
        </span>
      ))}
    </span>
  );
}
