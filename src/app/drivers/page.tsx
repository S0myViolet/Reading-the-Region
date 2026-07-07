"use client";

/**
 * Drivers — the underlying forces that explain why multiple patterns are
 * emerging. A driver must explain, not describe: it names the mechanism that
 * would produce the observed patterns, and it predicts what should appear
 * next if it is real. Status is computed live against the seven driver
 * validation criteria; the stored status is never trusted on its own.
 *
 * Visibility layers: the simple view lists each driver as its statement plus
 * a plain-language status sentence with counts in words; score chips and the
 * filter/sort controls open in Analyst view.
 */

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import { ConfidenceBadge, IdChip } from "@/components/badges";
import { Select } from "@/components/form";
import { ViewGate } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateDriver } from "@/lib/validation";
import { explainDriverStatus } from "@/lib/explain";
import { DEFINITIONS } from "@/lib/copy";
import type { Driver, Signal } from "@/lib/types";
import {
  DRIVER_SORT_OPTIONS,
  DRIVER_STATUS_FILTER_OPTIONS,
  DriverScoreChips,
  DriverStatusPill,
  RecomputedNote,
  driverLinkCountsInWords,
  sortDrivers,
  statusDisagrees,
  type DriverSort,
  type DriverStatusFilter,
} from "./driver-ui";

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

/**
 * Simple-view card: name, the driver statement, a plain-language status
 * sentence, and pattern/signal counts in words. No scores, no chips.
 */
function SimpleDriverCard({ driver, signals }: { driver: Driver; signals: Signal[] }) {
  const result = validateDriver(driver, signals);
  return (
    <article className="card px-4 py-3">
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
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
        {driver.driverStatement.trim() ? (
          driver.driverStatement
        ) : (
          <span className="text-[12px] text-ink-faint">
            No driver statement recorded yet — a driver must state the force
            and mechanism that explain its patterns, not describe what is
            already visible.
          </span>
        )}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
        {explainDriverStatus(driver, result)}
      </p>
      <p className="mt-2 border-t border-line pt-2 text-[11.5px] text-ink-faint">
        {driverLinkCountsInWords(driver)}
      </p>
    </article>
  );
}

/** Analyst-view card: dense counts, status pill, confidence, score chips. */
function AnalystDriverCard({ driver, signals }: { driver: Driver; signals: Signal[] }) {
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

      <div className="mt-2.5">
        <DriverScoreChips scores={driver.scores} />
      </div>
    </article>
  );
}

function DriverCard({ driver, signals }: { driver: Driver; signals: Signal[] }) {
  return (
    <ViewGate
      min="analyst"
      fallback={<SimpleDriverCard driver={driver} signals={signals} />}
    >
      <AnalystDriverCard driver={driver} signals={signals} />
    </ViewGate>
  );
}

export default function DriversPage() {
  const hydrated = useHydrated();
  const drivers = useIntelligenceStore((s) => s.drivers);
  const signals = useIntelligenceStore((s) => s.signals);
  const [sort, setSort] = useState<DriverSort>("updated");
  const [statusFilter, setStatusFilter] = useState<DriverStatusFilter>("all");

  if (!hydrated) {
    return (
      <>
        <DriversHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const filtered =
    statusFilter === "all"
      ? drivers
      : drivers.filter((d) => {
          const valid = validateDriver(d, signals).valid;
          return statusFilter === "validated" ? valid : !valid;
        });
  const ordered = sortDrivers(filtered, sort);

  return (
    <>
      <DriversHeader />
      <WalkthroughPanel pageId="drivers" />
      <DisciplineCard />

      {drivers.length === 0 ? (
        <EmptyState
          message="No drivers yet. A driver is an explanation, and explanations need repetition: identify patterns first, then ask what single force would produce all of them."
          actionLabel="Open Patterns"
          actionHref="/patterns"
        />
      ) : (
        <>
          <ViewGate min="analyst">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11.5px] text-ink-soft">
                {ordered.length} of {drivers.length} driver
                {drivers.length === 1 ? "" : "s"} shown
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2">
                  <span className="overline-label">Status</span>
                  <span className="w-44">
                    <Select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as DriverStatusFilter)
                      }
                      aria-label="Filter drivers by computed status"
                    >
                      {DRIVER_STATUS_FILTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <span className="overline-label">Order</span>
                  <span className="w-48">
                    <Select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as DriverSort)}
                      aria-label="Order drivers"
                    >
                      {DRIVER_SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </span>
                </label>
              </div>
            </div>
          </ViewGate>

          {ordered.length === 0 ? (
            <EmptyState
              message="No drivers match the current status filter. A driver only counts as validated when all seven criteria pass against live evidence — switch the filter to see the rest."
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
      )}
    </>
  );
}
