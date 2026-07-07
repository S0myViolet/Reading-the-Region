/**
 * Page header: title, one-line description, one primary action. Structure
 * comes from whitespace and type scale, not rules or kickers. The `overline`
 * prop is accepted for compatibility but no longer rendered — the sidebar
 * already orients the user.
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  overline?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        <h1 className="font-display text-[27px] leading-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2 pb-1">{actions}</div> : null}
    </header>
  );
}
