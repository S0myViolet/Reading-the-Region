import Link from "next/link";

/**
 * Instructional empty state. Generic "no data" copy is not allowed here —
 * every empty state must explain what the layer requires and where to go next.
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
    <div className="card px-6 py-8 text-center">
      <p className="mx-auto max-w-xl text-[13px] leading-relaxed text-ink-soft">{message}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-block border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
