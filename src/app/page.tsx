"use client";

/** Today — the daily briefing. Placeholder shell; being rebuilt. */

import { PageHeader } from "@/components/PageHeader";
import { useHydrated } from "@/lib/store";

export default function TodayPage() {
  const hydrated = useHydrated();
  return (
    <>
      <PageHeader title="Today" description="Your daily reading of the region." />
      {!hydrated ? (
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      ) : null}
    </>
  );
}
