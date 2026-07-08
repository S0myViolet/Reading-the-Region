"use client";

/**
 * Futures — where signals become bigger stories about where the region may
 * be going. One page, four tabs: Stories (clusters and validated patterns),
 * Tensions (contradictions), Possibilities (territories with drivers as the
 * forces behind them) and Scenarios (possible future worlds, grouped by the
 * direction they explore).
 *
 * This is a Simple Mode surface: the reader never needs cluster, pattern,
 * driver or territory vocabulary — cards link to the existing detail routes
 * where the deeper analysis lives.
 */

import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { Tabs } from "@/components/Tabs";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  PossibilitiesSection,
  ScenariosSection,
  StoriesSection,
  TensionsSection,
} from "./futures-ui";

function FuturesHeader() {
  return (
    <PageHeader
      title="Futures"
      description="Where signals become bigger stories about where the region may be going."
    />
  );
}

export default function FuturesPage() {
  const hydrated = useHydrated();
  const clusters = useIntelligenceStore((s) => s.clusters);
  const patterns = useIntelligenceStore((s) => s.patterns);
  const contradictions = useIntelligenceStore((s) => s.contradictions);
  const drivers = useIntelligenceStore((s) => s.drivers);
  const territories = useIntelligenceStore((s) => s.territories);
  const scenarios = useIntelligenceStore((s) => s.scenarios);

  if (!hydrated) {
    return (
      <>
        <FuturesHeader />
        <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
      </>
    );
  }

  return (
    <>
      <FuturesHeader />
      <WalkthroughPanel pageId="futures" />

      <Tabs
        tabs={[
          {
            id: "stories",
            label: "Stories",
            content: (
              <StoriesSection
                clusters={clusters}
                patterns={patterns}
                contradictions={contradictions}
              />
            ),
          },
          {
            id: "tensions",
            label: "Tensions",
            content: (
              <TensionsSection
                contradictions={contradictions}
                territories={territories}
                scenarios={scenarios}
              />
            ),
          },
          {
            id: "possibilities",
            label: "Possibilities",
            content: <PossibilitiesSection territories={territories} drivers={drivers} />,
          },
          {
            id: "scenarios",
            label: "Scenarios",
            content: <ScenariosSection scenarios={scenarios} territories={territories} />,
          },
        ]}
      />
    </>
  );
}
