/**
 * Demo seed dataset for Reading the Region.
 *
 * All content here is sample data: grounded, regionally specific, and
 * plausible, but explicitly demo material. Sources carry `isDemo: true` and
 * no URLs are invented. Ids are sequential and human-readable (SIG-001…),
 * and every cross-reference (signal ↔ cluster ↔ pattern ↔ driver ↔ territory
 * ↔ scenario ↔ implication ↔ indicator) must resolve to a real object in
 * this file.
 */

import type {
  Cluster,
  Contradiction,
  Driver,
  FutureTerritory,
  MonitoringIndicator,
  Observation,
  Pattern,
  Scenario,
  Signal,
  Source,
  StrategicImplication,
} from "../types";

export const seedSources: Source[] = [];
export const seedObservations: Observation[] = [];
export const seedSignals: Signal[] = [];
export const seedClusters: Cluster[] = [];
export const seedPatterns: Pattern[] = [];
export const seedContradictions: Contradiction[] = [];
export const seedDrivers: Driver[] = [];
export const seedTerritories: FutureTerritory[] = [];
export const seedScenarios: Scenario[] = [];
export const seedImplications: StrategicImplication[] = [];
export const seedIndicators: MonitoringIndicator[] = [];

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
