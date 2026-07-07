"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { indicatorOverdue } from "@/lib/derived";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { OnboardingModal } from "./OnboardingModal";
import { SearchOverlay } from "./SearchOverlay";
import { ViewModeSwitch } from "./ViewMode";

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

const NAV_GROUPS: Array<{ heading: string | null; items: NavItem[] }> = [
  {
    heading: null,
    items: [{ href: "/", label: "Overview" }],
  },
  {
    heading: "Scan",
    items: [
      { href: "/inbox", label: "Scan Inbox", badge: (c) => c.unreviewedObservations },
      { href: "/signals", label: "Signal Library", badge: (c) => c.signalsNeedingReview },
      { href: "/sources", label: "Source Library" },
    ],
  },
  {
    heading: "Connect",
    items: [
      { href: "/clusters", label: "Signal Clusters" },
      { href: "/patterns", label: "Patterns" },
      { href: "/contradictions", label: "Contradictions" },
    ],
  },
  {
    heading: "Interpret",
    items: [
      { href: "/drivers", label: "Drivers" },
      { href: "/territories", label: "Future Territories" },
      { href: "/scenarios", label: "Scenarios" },
    ],
  },
  {
    heading: "Apply",
    items: [
      { href: "/implications", label: "Strategic Implications" },
      { href: "/monitoring", label: "Monitoring", badge: (c) => c.overdueIndicators },
    ],
  },
  {
    heading: null,
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
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-[224px] flex-col bg-paper lg:flex">
        <div className="px-6 pb-5 pt-6">
          <Link href="/" className="block">
            <span className="font-display block text-[17px] leading-tight text-ink">
              Reading the Region
            </span>
            <span className="mt-1 block text-[10.5px] leading-snug text-ink-faint">
              Strategic foresight · MENA
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="mx-6 mb-5 flex w-[calc(100%-3rem)] items-baseline justify-between text-[12px] text-ink-faint hover:text-ink-soft"
            title="Search all intelligence layers (Ctrl/Cmd + K)"
          >
            Search
            <span className="font-mono text-[10px]">⌘K</span>
          </button>

          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="mb-5 px-6">
              {group.heading ? (
                <p className="mb-1 text-[10.5px] text-ink-faint">{group.heading}</p>
              ) : null}
              {group.items.map((item) => {
                const badge = item.badge ? item.badge(counts) : 0;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`-mx-2 flex items-baseline justify-between rounded-[4px] px-2 py-[5px] text-[13px] ${
                      active
                        ? "font-medium text-ink"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    <span className={active ? "border-b border-accent pb-px" : ""}>
                      {item.label}
                    </span>
                    {badge > 0 ? (
                      <span className="font-mono text-[10.5px] text-ink-faint">{badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="space-y-3 px-6 pb-6 pt-4">
          <div className="border-t border-line pt-4">
            <ViewModeSwitch compact />
          </div>
          <label
            className="flex cursor-pointer items-center justify-between text-[11.5px] text-ink-faint"
            title="Guided Mode shows the page guide: purpose, recommended action, next step."
          >
            Guided mode
            <button
              role="switch"
              aria-checked={hydrated ? guidedMode : true}
              onClick={() => setGuidedMode(!guidedMode)}
              className={`relative h-[14px] w-[26px] rounded-full transition-colors ${
                hydrated && guidedMode ? "bg-accent" : "bg-line-strong"
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="text-[12px] text-ink-faint"
          >
            Search
          </button>
          <MobileNav pathname={pathname} />
        </div>
      </div>

      <main className="min-w-0 flex-1 px-5 pb-20 pt-16 sm:px-8 lg:ml-[224px] lg:pt-10 lg:pl-10">
        <div className="mx-auto max-w-5xl">{children}</div>
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
        className="text-[12px] text-ink-soft"
        aria-expanded={open}
      >
        Menu
      </button>
      {open ? (
        <div className="card absolute right-0 top-8 z-50 max-h-[70vh] w-60 overflow-y-auto py-2">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="px-4 py-1.5">
              {group.heading ? (
                <p className="pb-0.5 text-[10.5px] text-ink-faint">{group.heading}</p>
              ) : null}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-1 text-[13px] text-ink-soft hover:text-ink"
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
