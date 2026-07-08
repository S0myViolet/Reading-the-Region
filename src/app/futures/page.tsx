"use client";

/**
 * Futures — where signals become bigger stories about where the region may
 * be going. In Simple Mode: one page, four tabs — Stories (clusters and
 * validated patterns), Tensions (contradictions), Possibilities (territories
 * with drivers as the forces behind them) and Scenarios (possible future
 * worlds, grouped by the direction they explore). The reader never needs
 * cluster, pattern, driver or territory vocabulary — cards link to the
 * existing detail routes where the deeper analysis lives.
 *
 * In Advanced Mode the story framing would collapse the methodology, so the
 * page renders the interpretation layers distinct instead: clusters,
 * patterns, contradictions, drivers, territories, scenarios — a vertical run
 * of short sections, each carrying its pipeline-stage badge and linking to
 * its full section page (see ./futures-advanced).
 */

import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { Tabs } from "@/components/Tabs";
import { useViewMode } from "@/components/ViewMode";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import { LayersView } from "./futures-advanced";
import {
  PossibilitiesSection,
  ScenariosSection,
  StoriesSection,
  TensionsSection,
} from "./futures-ui";

function FuturesHeader() {
  // useViewMode is hydration-safe ("simple" until the client store loads),
  // so the header matches the server render and switches only after mount.
  const advanced = useViewMode() !== "simple";
  return (
    <PageHeader
      title="Futures"
      description={
        advanced
          ? "The interpretation layers, kept distinct: clusters, patterns, contradictions, drivers, territories, scenarios."
          : "Where signals become bigger stories about where the region may be going."
      }
    />
  );
}

export default function FuturesPage() {
  const hydrated = useHydrated();
  const mode = useViewMode();
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

  if (mode !== "simple") {
    return (
      <>
        <FuturesHeader />
        <WalkthroughPanel pageId="futures" />
        <LayersView
          clusters={clusters}
          patterns={patterns}
          contradictions={contradictions}
          drivers={drivers}
          territories={territories}
          scenarios={scenarios}
        />
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
