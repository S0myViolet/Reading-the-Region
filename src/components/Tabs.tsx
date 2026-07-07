"use client";

import { useState } from "react";

/**
 * Progressive-disclosure tabs for complex objects (signals, clusters,
 * patterns, drivers). The overview stays simple; deeper methodology opens on
 * demand.
 */
export function Tabs({
  tabs,
  initial,
}: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  initial?: string;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-line-strong" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === active}
            onClick={() => setActive(t.id)}
            className={`-mb-px border-b-2 px-3 py-1.5 text-[12.5px] ${
              t.id === active
                ? "border-accent font-medium text-accent-ink"
                : "border-transparent text-ink-faint hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
