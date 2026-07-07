export function PageHeader({
  overline,
  title,
  description,
  actions,
}: {
  overline: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line-strong pb-4">
      <div className="max-w-3xl">
        <p className="overline-label mb-1">{overline}</p>
        <h1 className="font-display text-[26px] leading-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-[13px] text-ink-soft">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
