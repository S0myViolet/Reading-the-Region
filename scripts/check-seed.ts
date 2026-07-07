/**
 * Referential-integrity check for the seed dataset.
 *
 * Verifies that every cross-reference resolves to a real object and that the
 * main relationship pairs are bidirectional. Run via:
 *   npx tsc scripts/check-seed.ts --outDir .seedcheck --module commonjs \
 *     --target es2020 --esModuleInterop --skipLibCheck --moduleResolution node \
 *   && node .seedcheck/scripts/check-seed.js
 */

import { seedData } from "../src/lib/seed";

const ids = {
  observation: new Set(seedData.observations.map((x) => x.id)),
  source: new Set(seedData.sources.map((x) => x.id)),
  signal: new Set(seedData.signals.map((x) => x.id)),
  cluster: new Set(seedData.clusters.map((x) => x.id)),
  pattern: new Set(seedData.patterns.map((x) => x.id)),
  contradiction: new Set(seedData.contradictions.map((x) => x.id)),
  driver: new Set(seedData.drivers.map((x) => x.id)),
  territory: new Set(seedData.territories.map((x) => x.id)),
  scenario: new Set(seedData.scenarios.map((x) => x.id)),
  implication: new Set(seedData.implications.map((x) => x.id)),
  indicator: new Set(seedData.indicators.map((x) => x.id)),
};

const errors: string[] = [];

function ref(owner: string, field: string, value: string | null, kind: keyof typeof ids) {
  if (value === null || value === "") return;
  if (!ids[kind].has(value)) errors.push(`${owner}.${field} → ${value} (missing ${kind})`);
}

function refs(owner: string, field: string, values: string[], kind: keyof typeof ids) {
  values.forEach((v) => ref(owner, field, v, kind));
}

for (const o of seedData.observations) {
  ref(o.id, "sourceId", o.sourceId, "source");
  ref(o.id, "promotedSignalId", o.promotedSignalId, "signal");
  if (o.status === "promoted" && !o.promotedSignalId)
    errors.push(`${o.id} is promoted but has no promotedSignalId`);
}

for (const s of seedData.signals) {
  refs(s.id, "sourceIds", s.sourceIds, "source");
  ref(s.id, "observationId", s.observationId, "observation");
  refs(s.id, "contradictionIds", s.contradictionIds, "contradiction");
  refs(s.id, "relatedSignalIds", s.relatedSignalIds, "signal");
  refs(s.id, "clusterIds", s.clusterIds, "cluster");
  refs(s.id, "patternIds", s.patternIds, "pattern");
  refs(s.id, "driverIds", s.driverIds, "driver");
  refs(s.id, "monitoringIndicatorIds", s.monitoringIndicatorIds, "indicator");
  if (s.sourceIds.length === 0) errors.push(`${s.id} has no sources`);
}

for (const c of seedData.clusters) {
  refs(c.id, "signalIds", c.signalIds, "signal");
  refs(c.id, "contradictionIds", c.contradictionIds, "contradiction");
  refs(c.id, "possiblePatternIds", c.possiblePatternIds, "pattern");
  refs(c.id, "possibleDriverIds", c.possibleDriverIds, "driver");
  for (const sid of c.signalIds) {
    const sig = seedData.signals.find((x) => x.id === sid);
    if (sig && !sig.clusterIds.includes(c.id))
      errors.push(`bidirectional: ${c.id}.signalIds has ${sid} but ${sid}.clusterIds misses ${c.id}`);
  }
}

for (const p of seedData.patterns) {
  refs(p.id, "keySignalIds", p.keySignalIds, "signal");
  refs(p.id, "clusterIds", p.clusterIds, "cluster");
  refs(p.id, "contradictionIds", p.contradictionIds, "contradiction");
  refs(p.id, "possibleDriverIds", p.possibleDriverIds, "driver");
  for (const sid of p.keySignalIds) {
    const sig = seedData.signals.find((x) => x.id === sid);
    if (sig && !sig.patternIds.includes(p.id))
      errors.push(`bidirectional: ${p.id}.keySignalIds has ${sid} but ${sid}.patternIds misses ${p.id}`);
  }
}

for (const c of seedData.contradictions) {
  refs(c.id, "sideASignalIds", c.sideASignalIds, "signal");
  refs(c.id, "sideBSignalIds", c.sideBSignalIds, "signal");
  for (const sid of [...c.sideASignalIds, ...c.sideBSignalIds]) {
    const sig = seedData.signals.find((x) => x.id === sid);
    if (sig && !sig.contradictionIds.includes(c.id))
      errors.push(`bidirectional: ${c.id} cites ${sid} but ${sid}.contradictionIds misses ${c.id}`);
  }
}

for (const d of seedData.drivers) {
  refs(d.id, "patternIds", d.patternIds, "pattern");
  refs(d.id, "signalIds", d.signalIds, "signal");
  refs(d.id, "contradictionIds", d.contradictionIds, "contradiction");
  refs(d.id, "leadingIndicatorIds", d.leadingIndicatorIds, "indicator");
  for (const iid of d.leadingIndicatorIds) {
    const ind = seedData.indicators.find((x) => x.id === iid);
    if (ind && ind.driverId !== d.id)
      errors.push(`bidirectional: ${d.id}.leadingIndicatorIds has ${iid} but ${iid}.driverId is ${ind.driverId}`);
  }
}

for (const t of seedData.territories) {
  refs(t.id, "driverIds", t.driverIds, "driver");
  refs(t.id, "patternIds", t.patternIds, "pattern");
  refs(t.id, "clusterIds", t.clusterIds, "cluster");
  refs(t.id, "representativeSignalIds", t.representativeSignalIds, "signal");
  refs(t.id, "contradictionIds", t.contradictionIds, "contradiction");
  refs(t.id, "scenarioIds", t.scenarioIds, "scenario");
  refs(t.id, "leadingIndicatorIds", t.leadingIndicatorIds, "indicator");
  for (const scid of t.scenarioIds) {
    const sc = seedData.scenarios.find((x) => x.id === scid);
    if (sc && sc.territoryId !== t.id)
      errors.push(`bidirectional: ${t.id}.scenarioIds has ${scid} but ${scid}.territoryId is ${sc.territoryId}`);
  }
}

for (const s of seedData.scenarios) {
  ref(s.id, "territoryId", s.territoryId, "territory");
  refs(s.id, "supportingSignalIds", s.supportingSignalIds, "signal");
  refs(s.id, "supportingPatternIds", s.supportingPatternIds, "pattern");
  refs(s.id, "supportingDriverIds", s.supportingDriverIds, "driver");
  refs(s.id, "shapingContradictionIds", s.shapingContradictionIds, "contradiction");
}

for (const i of seedData.implications) {
  ref(i.id, "territoryId", i.territoryId, "territory");
  ref(i.id, "scenarioId", i.scenarioId, "scenario");
  refs(i.id, "evidenceSignalIds", i.evidenceSignalIds, "signal");
  refs(i.id, "evidenceDriverIds", i.evidenceDriverIds, "driver");
  if (!i.territoryId && !i.scenarioId)
    errors.push(`${i.id} connects to neither territory nor scenario`);
}

for (const i of seedData.indicators) {
  ref(i.id, "territoryId", i.territoryId, "territory");
  ref(i.id, "driverId", i.driverId, "driver");
  ref(i.id, "signalId", i.signalId, "signal");
  if (!i.territoryId && !i.driverId)
    errors.push(`${i.id} links neither territory nor driver`);
}

const counts = Object.fromEntries(
  Object.entries(seedData).map(([k, v]) => [k, (v as unknown[]).length]),
);
console.log("Seed counts:", JSON.stringify(counts));

if (errors.length > 0) {
  console.error(`\n${errors.length} integrity error(s):`);
  errors.forEach((e) => console.error(" -", e));
  process.exit(1);
}
console.log("Referential integrity: OK");
