"use client";

import type { Score } from "@/lib/types";

/** Shared form primitives in the platform idiom: labelled, dense, calm. */

export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-ink-soft">
        {label}
        {required ? <span className="text-ink-faint"> *</span> : null}
      </span>
      {hint ? <span className="mt-0.5 block text-[11.5px] text-ink-faint">{hint}</span> : null}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

const inputClass =
  "w-full border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink rounded-[2px] placeholder:text-ink-faint focus:border-accent focus:outline-none";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={`${inputClass} leading-relaxed ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

/** Checkbox list for multi-select enums (sectors, systems, actor types). */
export function CheckboxList<T extends string>({
  options,
  selected,
  onChange,
  columns = 2,
}: {
  options: Array<{ value: T; label: string }>;
  selected: T[];
  onChange: (next: T[]) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-x-4 gap-y-1"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 text-[12.5px] text-ink-soft">
          <input
            type="checkbox"
            checked={selected.includes(o.value)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...selected, o.value]
                  : selected.filter((v) => v !== o.value),
              )
            }
            className="accent-[#29513f]"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

/** 1–5 score picker showing the rubric anchor for the selected value. */
export function ScorePicker({
  label,
  value,
  rubric,
  onChange,
}: {
  label: string;
  value: Score;
  rubric: Record<Score, string>;
  onChange: (v: Score) => void;
}) {
  return (
    <div className="border border-line bg-surface px-3 py-2 rounded-[2px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-ink">{label}</span>
        <span className="flex gap-1">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-6 w-6 border text-[11.5px] font-mono rounded-[2px] ${
                n === value
                  ? "border-accent bg-accent text-white"
                  : n < value
                    ? "border-accent/40 bg-accent-soft text-accent-ink"
                    : "border-line bg-surface text-ink-faint hover:border-line-strong"
              }`}
            >
              {n}
            </button>
          ))}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-ink-faint">
        {value}/5 — {rubric[value]}
      </p>
    </div>
  );
}
