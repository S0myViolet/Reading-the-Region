import Link from "next/link";

/**
 * Breadcrumb trail across detail pages. Shows where the user is, where the
 * object came from, and what the next intelligence layer is.
 */
export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-[11.5px]">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 ? (
            <span aria-hidden className="text-ink-faint">
              →
            </span>
          ) : null}
          {item.href ? (
            <Link href={item.href} className="text-ink-faint hover:text-accent-ink hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-soft">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
