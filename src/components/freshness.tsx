"use client";

/**
 * Freshness UI — the platform-wide way to show evidence age.
 *
 * Quiet by design: small text, a full date in the tooltip, colour only where
 * it is earned (fresh) or needed (stale). Every component takes real
 * timestamps; none of them invents or softens an age.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import {
  FRESHNESS_LABELS,
  FRESHNESS_MEANINGS,
  freshnessOf,
  fullDate,
  relativeAge,
  type Freshness,
} from "@/lib/freshness";
import type { Source } from "@/lib/types";
import { SOURCE_TYPE_LABELS } from "@/lib/types";

/** Relative age with the full date in the tooltip. */
export function Age({ iso, prefix }: { iso: string; prefix?: string }) {
  return (
    <span title={fullDate(iso)}>
      {prefix ? `${prefix} ` : ""}
      {relativeAge(iso)}
    </span>
  );
}

const FRESHNESS_TONES: Record<Freshness, string> = {
  fresh: "text-accent-ink",
  recent: "text-ink-soft",
  aging: "text-ink-faint",
  stale: "text-caution",
  archived: "text-ink-faint",
};

/** The status word for a date — "Fresh", "Stale", "Historical" — quietly toned. */
export function FreshnessWord({ date }: { date: string | null | undefined }) {
  const status = freshnessOf(date);
  return (
    <span className={FRESHNESS_TONES[status]} title={FRESHNESS_MEANINGS[status]}>
      {FRESHNESS_LABELS[status]}
    </span>
  );
}

/**
 * One quiet metadata line combining status and ages, e.g.
 * "Fresh · latest evidence 6h ago · oldest 9mo ago · checked 12m ago".
 * Parts with no real timestamp are simply omitted.
 */
export function FreshnessLine({
  latest,
  oldest,
  checkedAt,
  checkedVerb = "checked",
  latestLabel = "latest evidence",
  className = "text-[11.5px] text-ink-faint",
}: {
  latest: string | null | undefined;
  oldest?: string | null;
  checkedAt?: string | null;
  checkedVerb?: "checked" | "updated" | "added";
  latestLabel?: string;
  className?: string;
}) {
  const parts: ReactNode[] = [];
  parts.push(<FreshnessWord key="word" date={latest} />);
  if (latest) {
    parts.push(
      <span key="latest" title={fullDate(latest)}>
        {latestLabel} {relativeAge(latest)}
      </span>,
    );
  } else {
    parts.push(<span key="latest">no dated evidence linked</span>);
  }
  if (oldest && oldest !== latest) {
    parts.push(
      <span key="oldest" title={fullDate(oldest)}>
        oldest {relativeAge(oldest)}
      </span>,
    );
  }
  if (checkedAt) {
    parts.push(
      <span key="checked" title={fullDate(checkedAt)}>
        {checkedVerb} {relativeAge(checkedAt)}
      </span>,
    );
  }
  return (
    <p className={className}>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 ? " · " : ""}
          {p}
        </span>
      ))}
    </p>
  );
}

/**
 * A visible, clickable source line for the main reading area:
 * "Gulf News article · published 5h ago · checked 12m ago".
 * External links open in a new tab; missing links and demo data say so.
 */
export function SourceLine({
  source,
  publishedAt,
  checkedAt,
  titleOverride,
}: {
  source: Source | null;
  publishedAt?: string | null;
  checkedAt?: string | null;
  titleOverride?: string;
}) {
  if (!source) {
    return (
      <p className="text-[11.5px] text-ink-faint">No source record linked.</p>
    );
  }
  const name = titleOverride ?? source.name;
  return (
    <p className="text-[11.5px] text-ink-faint">
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink"
        >
          {name}
        </a>
      ) : (
        <Link
          href={`/sources/${source.id}`}
          className="text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink"
        >
          {name}
        </Link>
      )}{" "}
      · {SOURCE_TYPE_LABELS[source.sourceType]}
      {publishedAt ? (
        <span title={fullDate(publishedAt)}> · published {relativeAge(publishedAt)}</span>
      ) : null}
      {checkedAt ? (
        <span title={fullDate(checkedAt)}> · checked {relativeAge(checkedAt)}</span>
      ) : null}
      {!source.url ? " · no source link recorded" : null}
      {source.isDemo ? " · demo source, not externally verifiable" : null}
    </p>
  );
}
