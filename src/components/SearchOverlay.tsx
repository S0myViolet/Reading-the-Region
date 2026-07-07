"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildSearchIndex, searchEntries } from "@/lib/derived";
import { useIntelligenceStore } from "@/lib/store";
import { ENTITY_KIND_LABELS, type EntityKind } from "@/lib/types";

const KIND_FILTERS: Array<{ value: EntityKind | "all"; label: string }> = [
  { value: "all", label: "All layers" },
  ...(Object.keys(ENTITY_KIND_LABELS) as EntityKind[]).map((k) => ({
    value: k,
    label: ENTITY_KIND_LABELS[k],
  })),
];

/**
 * Global search across every intelligence layer. Matches keywords against
 * titles, descriptions, geography, sectors, systems, tags, statuses and ids.
 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const store = useIntelligenceStore();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<EntityKind | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => buildSearchIndex(store), [store]);
  const results = useMemo(() => {
    const all = searchEntries(index, query);
    return kind === "all" ? all : all.filter((r) => r.kind === kind);
  }, [index, query, kind]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/30 p-4 pt-[10vh]"
      onClick={onClose}
      role="dialog"
      aria-label="Search the intelligence system"
    >
      <div
        className="mx-auto max-w-2xl card shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && results[0]) {
                router.push(results[0].href);
                onClose();
              }
            }}
            placeholder="Search signals, sources, clusters, drivers, territories…"
            className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as EntityKind | "all")}
            className="border border-line bg-surface px-1.5 py-1 text-[11.5px] text-ink-soft rounded-[2px] focus:outline-none"
          >
            {KIND_FILTERS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div className="max-h-[55vh] overflow-y-auto">
          {query.trim() === "" ? (
            <p className="px-4 py-6 text-center text-[12.5px] text-ink-faint">
              Search across all eleven intelligence layers — by keyword, sector, country, city,
              system, tag, status, or id.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-[12.5px] text-ink-faint">
              Nothing matches “{query}”. Try a broader term, a sector name, or an object id such
              as SIG-004.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {results.map((r) => (
                <li key={`${r.kind}-${r.id}`}>
                  <button
                    onClick={() => {
                      router.push(r.href);
                      onClose();
                    }}
                    className="block w-full px-4 py-2.5 text-left hover:bg-surface-muted"
                  >
                    <span className="overline-label">
                      {ENTITY_KIND_LABELS[r.kind]} · <span className="font-mono normal-case">{r.id}</span>
                    </span>
                    <span className="block text-[13px] text-ink">{r.title}</span>
                    <span className="block truncate text-[11.5px] text-ink-faint">{r.snippet}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
