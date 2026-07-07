"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { indicatorOverdue } from "@/lib/derived";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { OnboardingModal } from "./OnboardingModal";
import { SearchOverlay } from "./SearchOverlay";

interface NavItem {
  href: string;
  label: string;
  badge?: (counts: NavCounts) => number;
}

interface NavCounts {
  unreviewedObservations: number;
  signalsNeedingReview: number;
  overdueIndicators: number;
}

const NAV_GROUPS: Array<{ heading: string; items: NavItem[] }> = [
  {
    heading: "Command",
    items: [{ href: "/", label: "Intelligence Overview" }],
  },
  {
    heading: "Scan & Classify",
    items: [
      { href: "/inbox", label: "Scan Inbox", badge: (c) => c.unreviewedObservations },
      { href: "/signals", label: "Signal Library", badge: (c) => c.signalsNeedingReview },
      { href: "/sources", label: "Source Library" },
    ],
  },
  {
    heading: "Connect & Synthesize",
    items: [
      { href: "/clusters", label: "Signal Clusters" },
      { href: "/patterns", label: "Patterns" },
      { href: "/contradictions", label: "Contradictions" },
    ],
  },
  {
    heading: "Interpret & Imagine",
    items: [
      { href: "/drivers", label: "Drivers" },
      { href: "/territories", label: "Future Territories" },
      { href: "/scenarios", label: "Scenarios" },
    ],
  },
  {
    heading: "Apply & Monitor",
    items: [
      { href: "/implications", label: "Strategic Implications" },
      { href: "/monitoring", label: "Monitoring", badge: (c) => c.overdueIndicators },
    ],
  },
  {
    heading: "System",
    items: [
      { href: "/methodology", label: "Methodology" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [searchOpen, setSearchOpen] = useState(false);
  const guidedMode = useIntelligenceStore((s) => s.guidedMode);
  const setGuidedMode = useIntelligenceStore((s) => s.setGuidedMode);
  const observations = useIntelligenceStore((s) => s.observations);
  const signals = useIntelligenceStore((s) => s.signals);
  const indicators = useIntelligenceStore((s) => s.indicators);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const counts: NavCounts = hydrated
    ? {
        unreviewedObservations: observations.filter((o) => o.status === "unreviewed").length,
        signalsNeedingReview: signals.filter((s) =>
          ["needs_human_review", "ai_suggested", "needs_evidence"].includes(s.reviewStatus),
        ).length,
        overdueIndicators: indicators.filter((i) => indicatorOverdue(i)).length,
      }
    : { unreviewedObservations: 0, signalsNeedingReview: 0, overdueIndicators: 0 };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen">
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-[218px] flex-col border-r border-line bg-paper lg:flex">
        <div className="border-b border-line px-4 py-4">
          <Link href="/" className="block">
            <span className="font-display block text-[17px] leading-tight text-ink">
              Reading the Region
            </span>
            <span className="mt-0.5 block text-[10px] leading-snug text-ink-faint">
              Strategic foresight intelligence · MENA
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex-1 border border-line bg-surface px-2 py-1 text-left text-[11.5px] text-ink-faint rounded-[2px] hover:border-line-strong"
            title="Search all intelligence layers (Ctrl/Cmd + K)"
          >
            Search… <span className="float-right font-mono text-[10px]">⌘K</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="px-2 py-1.5">
              <p className="overline-label px-2 pb-1">{group.heading}</p>
              {group.items.map((item) => {
                const badge = item.badge ? item.badge(counts) : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-[2px] px-2 py-[5px] text-[12.5px] ${
                      isActive(item.href)
                        ? "bg-surface font-medium text-accent-ink border border-line"
                        : "text-ink-soft hover:bg-surface hover:text-ink border border-transparent"
                    }`}
                  >
                    {item.label}
                    {badge > 0 ? (
                      <span className="ml-2 rounded-[2px] bg-caution-soft px-1.5 font-mono text-[10px] text-caution">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="border-t border-line px-4 py-3">
          <label
            className="flex cursor-pointer items-center justify-between text-[11.5px] text-ink-soft"
            title="Guided Mode shows page-level guidance: purpose, recommended action, common mistake, next step."
          >
            Guided mode
            <button
              role="switch"
              aria-checked={hydrated ? guidedMode : true}
              onClick={() => setGuidedMode(!guidedMode)}
              className={`relative h-[16px] w-[28px] rounded-full border transition-colors ${
                hydrated && guidedMode ? "border-accent bg-accent" : "border-line-strong bg-surface-muted"
              }`}
            >
              <span
                className={`absolute top-[2px] h-[10px] w-[10px] rounded-full bg-white transition-all ${
                  hydrated && guidedMode ? "left-[14px]" : "left-[2px]"
                }`}
              />
            </button>
          </label>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-paper px-4 py-2.5 lg:hidden">
        <Link href="/" className="font-display text-[15px] text-ink">
          Reading the Region
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="border border-line bg-surface px-2 py-1 text-[11.5px] text-ink-faint rounded-[2px]"
          >
            Search
          </button>
          <MobileNav pathname={pathname} />
        </div>
      </div>

      <main className="min-w-0 flex-1 px-4 pb-16 pt-16 sm:px-6 lg:ml-[218px] lg:pt-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <OnboardingModal />
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="border border-line bg-surface px-2 py-1 text-[11.5px] text-ink-soft rounded-[2px]"
        aria-expanded={open}
      >
        Menu
      </button>
      {open ? (
        <div className="absolute right-0 top-8 z-50 w-60 card max-h-[70vh] overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="border-b border-line px-3 py-2 last:border-b-0">
              <p className="overline-label pb-1">{group.heading}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-[2px] px-1.5 py-1 text-[12.5px] text-ink-soft hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
