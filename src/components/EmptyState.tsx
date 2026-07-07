import Link from "next/link";

/**
 * Instructional empty state. Generic "no data" copy is not allowed here —
 * every empty state must explain what the layer requires and where to go next.
 * No box: whitespace carries it.
 */
export function EmptyState({
  message,
  actionLabel,
  actionHref,
}: {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-ink-soft">{message}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-block rounded-[4px] bg-accent px-3.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-accent-ink"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
