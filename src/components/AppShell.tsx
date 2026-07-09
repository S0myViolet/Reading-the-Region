"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { indicatorOverdue } from "@/lib/derived";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { LiveScanSync } from "./LiveScanSync";
import { OnboardingModal } from "./OnboardingModal";
import { SearchOverlay } from "./SearchOverlay";
import { AppModeSwitch, useAppMode, ViewModeSwitch } from "./ViewMode";

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

interface NavGroup {
  heading: string | null;
  items: NavItem[];
}

/** The product menu: a simple journey, not a system map. */
const SIMPLE_NAV: NavGroup[] = [
  {
    heading: null,
    items: [
      { href: "/", label: "Today" },
      { href: "/explore", label: "Explore" },
      { href: "/finds", label: "New Finds", badge: (c) => c.unreviewedObservations },
      { href: "/signals", label: "Signals" },
      { href: "/futures", label: "Futures" },
      { href: "/decisions", label: "Decisions" },
      { href: "/watchlist", label: "Watchlist", badge: (c) => c.overdueIndicators },
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

/** The full intelligence system, for Advanced mode. */
const ADVANCED_NAV: NavGroup[] = [
  {
    heading: null,
    items: [{ href: "/", label: "Overview" }],
  },
  {
    heading: "Scan",
    items: [
      { href: "/inbox", label: "Scan Inbox", badge: (c) => c.unreviewedObservations },
      { href: "/sources", label: "Source Library" },
      { href: "/observations", label: "Observation Library" },
      { href: "/signals", label: "Signal Library", badge: (c) => c.signalsNeedingReview },
    ],
  },
  {
    heading: "Connect",
    items: [
      { href: "/clusters", label: "Cluster Maps" },
      { href: "/patterns", label: "Patterns" },
      { href: "/contradictions", label: "Contradictions" },
    ],
  },
  {
    heading: "Interpret",
    items: [
      { href: "/drivers", label: "Macro Forces / Drivers" },
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
    heading: "Admin",
    items: [
      { href: "/methodology", label: "Methodology" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const appMode = useAppMode();
  const [searchOpen, setSearchOpen] = useState(false);
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

  const nav = appMode === "advanced" ? ADVANCED_NAV : SIMPLE_NAV;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen">
      <LiveScanSync />
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
            title="Search everything (Ctrl/Cmd + K)"
          >
            Search
            <span className="font-mono text-[10px]">⌘K</span>
          </button>

          {nav.map((group, gi) => (
            <div key={gi} className={`px-6 ${gi === nav.length - 1 ? "mt-6" : "mb-5"}`}>
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
                    className={`-mx-2 flex items-baseline justify-between rounded-[4px] px-2 py-[6px] text-[13px] ${
                      active ? "font-medium text-ink" : "text-ink-soft hover:text-ink"
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
            <AppModeSwitch />
          </div>
          {appMode === "advanced" ? <ViewModeSwitch compact /> : null}
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
          <MobileNav pathname={pathname} nav={nav} />
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

function MobileNav({ pathname, nav }: { pathname: string; nav: NavGroup[] }) {
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
          {nav.map((group, gi) => (
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
          <div className="border-t border-line px-4 pb-1 pt-2.5">
            <AppModeSwitch />
          </div>
        </div>
      ) : null}
    </div>
  );
}
