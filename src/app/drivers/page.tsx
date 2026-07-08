"use client";

/**
 * Drivers — the underlying forces that explain why multiple patterns are
 * emerging. A driver must explain, not describe: it names the mechanism that
 * would produce the observed patterns, and it predicts what should appear
 * next if it is real. Status is computed live against the seven driver
 * validation criteria; the stored status is never trusted on its own.
 *
 * Layout has exactly four layers: header, one control bar, the driver list,
 * and the collapsed page guide. In the simple view each driver is one
 * .list-row — name, a plain-language status sentence with counts in words,
 * and the accent pill only when validation is earned. The advanced row leads
 * with the driver's meaning (the first sentence of its statement), then live
 * counts, its standing in plain words, and — for a hypothesis — the first
 * requirement it still fails. The describe-vs-explain test sits collapsed
 * below the list.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { EmptyState } from "@/components/EmptyState";
import {
  ControlBar,
  ControlSearch,
  ControlSelect,
} from "@/components/ControlBar";
import { useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { validateDriver } from "@/lib/validation";
import { explainDriverStatus } from "@/lib/explain";
import { DEFINITIONS } from "@/lib/copy";
import { firstSentence } from "@/lib/simple";
import type { Driver, Signal } from "@/lib/types";
import { CONFIDENCE_LABELS } from "@/lib/types";
import {
  DRIVER_SORT_OPTIONS,
  DRIVER_STATUS_FILTER_OPTIONS,
  ValidatedPill,
  driverLinkCountsInWords,
  driverMissingPhrases,
  signalsOfDriver,
  signalsStillNeeded,
  sortDrivers,
  type DriverSort,
  type DriverStatusFilter,
} from "./driver-ui";

function DriversHeader() {
  return <PageHeader title="Drivers" description={DEFINITIONS.driver} />;
}

function DriverRow({
  driver,
  signals,
  advanced,
}: {
  driver: Driver;
  signals: Signal[];
  advanced: boolean;
}) {
  const result = validateDriver(driver, signals);

  if (!advanced) {
    return (
      <Link href={`/drivers/${driver.id}`} className="list-row group">
        <div className="flex items-baseline justify-between gap-6">
          <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
            {driver.name}
          </p>
          <span className="shrink-0">
            <ValidatedPill result={result} />
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-faint">
          {explainDriverStatus(driver, result)} {driverLinkCountsInWords(driver)}
        </p>
      </Link>
    );
  }

  // Advanced row: meaning first, then live counts, standing in plain words,
  // and — for a hypothesis — the first requirement it still fails.
  const missing = driverMissingPhrases(driver, signalsOfDriver(driver, signals), result);
  const needed = signalsStillNeeded(driver);
  const patterns = driver.patternIds.length;
  const linked = driver.signalIds.length;

  return (
    <Link href={`/drivers/${driver.id}`} className="list-row group">
      <div className="flex items-baseline justify-between gap-6">
        <p className="min-w-0 truncate text-[13.5px] font-medium text-ink group-hover:text-accent-ink">
          {driver.name}
        </p>
        <span className="shrink-0 text-[11px] text-ink-faint">
          {CONFIDENCE_LABELS[driver.confidence]}
        </span>
      </div>
      <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
        {firstSentence(driver.driverStatement)}
      </p>
      <p className="mt-1.5 text-[12px] text-ink-faint">
        Explains {patterns} pattern{patterns === 1 ? "" : "s"} and {linked} linked
        signal{linked === 1 ? "" : "s"}.
      </p>
      <p className="mt-1 text-[12px] leading-relaxed">
        {result.valid ? (
          <>
            <span className="font-medium text-accent-ink">Validated driver</span>
            <span className="text-ink-soft">
              {" "}
              — passes all {result.totalCount} checks.
            </span>
          </>
        ) : (
          <span className="text-ink-soft">
            Still a hypothesis. Passes {result.passedCount} of {result.totalCount}{" "}
            validation checks.
            {needed > 0
              ? ` Needs ${needed} more linked signal${needed === 1 ? "" : "s"}.`
              : ""}
          </span>
        )}
      </p>
      {!result.valid && missing.length > 0 ? (
        <p className="mt-1 text-[12px] leading-relaxed text-caution">
          Missing: {missing[0]}.
        </p>
      ) : null}
    </Link>
  );
}

/**
 * The discipline of this layer, kept out of the way: one collapsed line
 * below the list that opens into the describe-vs-explain test.
 */
function DriverDiscipline() {
  const [open, setOpen] = useState(false);
  return (
    <aside className="mt-10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[11.5px] text-ink-faint hover:text-ink-soft"
        aria-expanded={open}
      >
        <span className="mr-1 inline-block w-2 text-[9px]">{open ? "▾" : "▸"}</span>
        The test of a driver — it must explain, not describe
      </button>
      {open ? (
        <div className="mt-3 ml-[3px] grid max-w-2xl gap-x-10 gap-y-5 border-l border-line pl-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] text-ink-faint">Describes — not a driver</p>
            <blockquote className="mt-1 font-display text-[13.5px] italic leading-relaxed text-ink">
              “Consumers like authenticity.”
            </blockquote>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-faint">
              This restates a preference already visible in the patterns. It
              names no force, no mechanism, and no direction — so it cannot
              generate plausible futures or leading indicators.
            </p>
          </div>
          <div>
            <p className="text-[11px] text-ink-faint">Explains — a driver</p>
            <blockquote className="mt-1 font-display text-[13.5px] italic leading-relaxed text-ink">
              “As AI makes synthetic perfection abundant, human-made imperfection
              becomes a premium signal of trust.”
            </blockquote>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-faint">
              This names an underlying force and its mechanism. It accounts for
              why several patterns would emerge together — and predicts what
              should appear next if the force is real.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export default function DriversPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
  const drivers = useIntelligenceStore((s) => s.drivers);
  const signals = useIntelligenceStore((s) => s.signals);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatusFilter>("all");
  const [sort, setSort] = useState<DriverSort>("updated");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = drivers.filter((d) => {
      if (statusFilter !== "all") {
        const valid = validateDriver(d, signals).valid;
        if (statusFilter === "validated" ? !valid : valid) return false;
      }
      if (
        q &&
        !`${d.name} ${d.driverStatement} ${d.whatItExplains}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
    return sortDrivers(filtered, sort);
  }, [drivers, signals, query, statusFilter, sort]);

  if (!hydrated) {
    return (
      <>
        <DriversHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  const validatedCount = drivers.filter(
    (d) => validateDriver(d, signals).valid,
  ).length;

  return (
    <>
      <DriversHeader />
      <WalkthroughPanel pageId="drivers" />

      <ControlBar
        right={
          drivers.length > 0 ? (
            <span className="text-[12px] text-ink-faint">
              {validatedCount} of {drivers.length} validated
            </span>
          ) : null
        }
      >
        <ControlSearch
          value={query}
          onChange={setQuery}
          placeholder="Search drivers…"
        />
        <ControlSelect
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as DriverStatusFilter)}
          options={DRIVER_STATUS_FILTER_OPTIONS}
        />
        {mode !== "simple" ? (
          <ControlSelect
            label="Order"
            value={sort}
            onChange={(v) => setSort(v as DriverSort)}
            options={DRIVER_SORT_OPTIONS}
          />
        ) : null}
      </ControlBar>

      {drivers.length === 0 ? (
        <EmptyState
          message="No drivers yet. A driver is an explanation, and explanations need repetition: identify patterns first, then ask what single force would produce all of them."
          actionLabel="Open Patterns"
          actionHref="/patterns"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          message="No drivers match the current filters. A driver only counts as validated when all seven criteria pass against live evidence — widen the status filter or clear the search to see the rest."
          actionLabel="Open Patterns"
          actionHref="/patterns"
        />
      ) : (
        <section aria-label="Drivers">
          {rows.map((d) => (
            <DriverRow
              key={d.id}
              driver={d}
              signals={signals}
              advanced={mode !== "simple"}
            />
          ))}
        </section>
      )}

      <DriverDiscipline />
    </>
  );
}
