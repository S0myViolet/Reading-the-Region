"use client";

/**
 * Drivers — the underlying forces that explain why multiple patterns are
 * emerging. A driver must explain, not describe: it names the mechanism that
 * would produce the observed patterns, and it predicts what should appear
 * next if it is real. Status is computed live against the seven driver
 * validation criteria; the stored status is never trusted on its own.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ConfidenceBadge, IdChip } from "@/components/badges";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateDriver } from "@/lib/validation";
import { DEFINITIONS } from "@/lib/copy";
import type { Driver, Signal } from "@/lib/types";
import { DriverStatusPill, RecomputedNote, statusDisagrees } from "./driver-ui";

function DriversHeader() {
  return (
    <PageHeader
      overline="Interpret & Imagine"
      title="Drivers"
      description={DEFINITIONS.driver}
    />
  );
}

/**
 * The discipline of this layer, stated up front: a driver that merely
 * describes a preference is not a driver at all.
 */
function DisciplineCard() {
  return (
    <section className="card mb-5">
      <header className="border-b border-line px-4 py-2.5">
        <h3 className="overline-label">
          The test of a driver — it must explain, not describe
        </h3>
      </header>
      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3">
          <p className="overline-label mb-1 text-caution">Bad driver — describes</p>
          <blockquote className="font-display text-[14px] italic leading-relaxed text-ink">
            “Consumers like authenticity.”
          </blockquote>
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            This restates a preference already visible in the patterns. It
            names no force, no mechanism, and no direction — so it cannot
            generate plausible futures or leading indicators.
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="overline-label mb-1 text-accent-ink">Good driver — explains</p>
          <blockquote className="font-display text-[14px] italic leading-relaxed text-ink">
            “As AI makes synthetic perfection abundant, human-made imperfection
            becomes a premium signal of trust.”
          </blockquote>
          <p className="mt-1.5 text-[11.5px] text-ink-faint">
            This names an underlying force and its mechanism. It accounts for
            why several patterns would emerge together — and predicts what
            should appear next if the force is real.
          </p>
        </div>
      </div>
    </section>
  );
}

function DriverCard({ driver, signals }: { driver: Driver; signals: Signal[] }) {
  const result = validateDriver(driver, signals);
  const recomputed = statusDisagrees(driver, result);

  return (
    <article className="card px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="max-w-2xl">
          <p className="overline-label mb-0.5">
            Driver · <IdChip id={driver.id} />
          </p>
          <h3 className="font-display text-[17px] leading-snug text-ink">
            <Link
              href={`/drivers/${driver.id}`}
              className="hover:text-accent-ink hover:underline"
            >
              {driver.name}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
            {driver.driverStatement.trim() ? (
              driver.driverStatement
            ) : (
              <span className="text-[12px] text-ink-faint">
                No driver statement recorded yet — a driver must state the
                force and mechanism that explain its patterns, not describe
                what is already visible.
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <DriverStatusPill result={result} />
          {recomputed ? <RecomputedNote /> : null}
          <ConfidenceBadge level={driver.confidence} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-2.5">
        <span className="font-mono text-[11.5px] text-ink-soft">
          {driver.patternIds.length} pattern{driver.patternIds.length === 1 ? "" : "s"}{" "}
          explained
        </span>
        <span className="font-mono text-[11.5px] text-ink-soft">
          {driver.signalIds.length} signal{driver.signalIds.length === 1 ? "" : "s"}
        </span>
        <span className="font-mono text-[11.5px] text-ink-soft">
          {driver.contradictionIds.length} contradiction
          {driver.contradictionIds.length === 1 ? "" : "s"}
        </span>
      </div>
    </article>
  );
}

export default function DriversPage() {
  const hydrated = useHydrated();
  const drivers = useIntelligenceStore((s) => s.drivers);
  const signals = useIntelligenceStore((s) => s.signals);

  if (!hydrated) {
    return (
      <>
        <DriversHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const ordered = [...drivers].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <DriversHeader />
      <WalkthroughPanel pageId="drivers" />
      <DisciplineCard />

      {ordered.length === 0 ? (
        <EmptyState
          message="No drivers yet. A driver is an explanation, and explanations need repetition: identify patterns first, then ask what single force would produce all of them."
          actionLabel="Open Patterns"
          actionHref="/patterns"
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((d) => (
            <DriverCard key={d.id} driver={d} signals={signals} />
          ))}
        </div>
      )}
    </>
  );
}
