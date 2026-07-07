/**
 * Demo seed dataset for Reading the Region.
 *
 * All content here is sample data: grounded, regionally specific, and
 * plausible, but explicitly demo material. Sources carry `isDemo: true` and
 * no URLs are invented. Ids are sequential and human-readable (SIG-001…),
 * and every cross-reference (signal ↔ cluster ↔ pattern ↔ driver ↔ territory
 * ↔ scenario ↔ implication ↔ indicator) resolves to a real object in this
 * dataset, bidirectionally where both sides carry link arrays.
 *
 * Honesty rules baked into the data:
 * - Clusters stay "candidate" (twelve signals cannot honestly clear the
 *   eight-signal validation threshold across three clusters).
 * - Drivers stay "hypothesis" (thirty-signal threshold).
 * - PAT-001 passes all four pattern tests and is validated; PAT-002 fails
 *   persistence and depth and says so.
 * - Low-evidence signals carry speculative level-4 zooms and low confidence.
 * - Two monitoring indicators are overdue against their cadence, one trend
 *   is contradictory and one is weakening.
 */

import { seedSources } from "./sources";
import { seedObservations } from "./observations";
import { seedSignals } from "./signals";
import { seedClusters } from "./clusters";
import { seedPatterns } from "./patterns";
import { seedContradictions } from "./contradictions";
import { seedDrivers } from "./drivers";
import { seedTerritories } from "./territories";
import { seedScenarios } from "./scenarios";
import { seedImplications } from "./implications";
import { seedIndicators } from "./indicators";

export {
  seedSources,
  seedObservations,
  seedSignals,
  seedClusters,
  seedPatterns,
  seedContradictions,
  seedDrivers,
  seedTerritories,
  seedScenarios,
  seedImplications,
  seedIndicators,
};

export const seedData = {
  observations: seedObservations,
  sources: seedSources,
  signals: seedSignals,
  clusters: seedClusters,
  patterns: seedPatterns,
  contradictions: seedContradictions,
  drivers: seedDrivers,
  territories: seedTerritories,
  scenarios: seedScenarios,
  implications: seedImplications,
  indicators: seedIndicators,
};
