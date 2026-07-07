"use client";

import { useState } from "react";

/**
 * Unified control strip for list pages: one calm horizontal bar holding
 * search, the few filters that matter, and sort. Everything else belongs
 * behind the "More filters" disclosure. Replaces scattered pills and chips.
 */
export function ControlBar({
  children,
  more,
  right,
}: {
  children: React.ReactNode;
  /** Advanced controls, hidden behind a quiet "More filters" toggle. */
  more?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const [showMore, setShowMore] = useState(false);
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-line pb-3">
        {children}
        {more ? (
          <button
            onClick={() => setShowMore((s) => !s)}
            className={`text-[12px] ${
              showMore ? "text-ink" : "text-ink-faint hover:text-ink-soft"
            }`}
            aria-expanded={showMore}
          >
            {showMore ? "Fewer filters" : "More filters"}
          </button>
        ) : null}
        {right ? <div className="ml-auto flex items-center gap-2.5">{right}</div> : null}
      </div>
      {more && showMore ? (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-line py-3">
          {more}
        </div>
      ) : null}
    </div>
  );
}

/** Quiet search input for the control bar — underline appears on focus. */
export function ControlSearch({
  value,
  onChange,
  placeholder = "Search…",
  widthClass = "w-56",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  widthClass?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${widthClass} bg-transparent py-1 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none`}
    />
  );
}

/** Compact labelled select for the control bar. Borderless until hover. */
export function ControlSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[12px] text-ink-faint">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-44 cursor-pointer truncate rounded-[4px] bg-transparent py-1 text-[12.5px] text-ink-soft hover:bg-surface-muted focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Vertical hairline between control groups. */
export function ControlDivider() {
  return <span aria-hidden className="h-4 w-px bg-line" />;
}
