/**
 * Demo patterns. PAT-001 passes all four validation tests (breadth across
 * three-plus sectors, eight independent sources, nine months of evidence,
 * one-statement coherence) and is therefore marked validated. PAT-002 fails
 * persistence (five months) and depth (three sources) and stays an honest
 * hypothesis.
 */

import type { Pattern } from "../types";

export const seedPatterns: Pattern[] = [
  {
    id: "PAT-001",
    name: "Belonging is being productised",
    patternType: "cultural",
    patternStatement:
      "Across unrelated sectors, institutions are converting emotional needs — identity, community, permanence — into products, services and infrastructure: heritage re-cut as purchasable daily identity, settlement packaged as visa-plus-schooling-plus-housing, community hosted in commercial third places and mall ecosystems, and regional credibility sold through creator campaigns. The emotional need is the raw material; the product is the answer to 'where do I belong?'",
    evidenceSummary:
      "Five key signals spanning eight sectors (fashion & luxury, culture & heritage, migration & belonging, real estate, education & work, retail, F&B third places, media & creator economy), evidenced by eight independent sources of unlike types — government policy data, newspaper reporting, consulting survey, ethnographic field notes, expert interview, creator panel, culture press and search trends. Evidence spans September 2025 to June 2026 (nine months). Breadth, depth, persistence and coherence tests all pass; the pattern's principal bias risk is that several sources profit from the belonging narrative they describe.",
    keySignalIds: ["SIG-001", "SIG-003", "SIG-007", "SIG-008", "SIG-012"],
    clusterIds: ["CLU-001", "CLU-002", "CLU-003"],
    contradictionIds: ["CON-002", "CON-003"],
    possibleDriverIds: ["DRV-001", "DRV-002"],
    strategicMeaning:
      "When belonging becomes a product category, the competitive set changes: developers compete with schools, malls with mosques' courtyards, fashion labels with citizenship policy — all bidding to answer the same emotional demand. Institutions that treat belonging as a marketing theme will lose to those that build it as infrastructure with switching costs: community programming, multigenerational products, membership that compounds. The risk side is equally strategic: productised belonging that fails to deliver felt belonging (see CON-003) produces a churn-prone, cynical customer base.",
    firstEvidenceDate: "2025-09-10",
    latestEvidenceDate: "2026-06-08",
    independentSourceCount: 8,
    confidence: "medium",
    validationStatus: "validated",
    reviewStatus: "validated",
    humanNotes:
      "Passed all four tests at the June review. Keep pressure-testing coherence: 'belonging' must not become a catch-all — each key signal must show an emotional need being converted into a sellable structure, not merely a lifestyle product succeeding.",
    createdAt: "2026-01-08T10:00:00.000Z",
    updatedAt: "2026-06-22T09:30:00.000Z",
  },
  {
    id: "PAT-002",
    name: "Trust is becoming a premium product attribute in automated environments",
    patternType: "behavioural",
    patternStatement:
      "Where services automate — bank credit decisions, embedded checkout finance, algorithm-adjacent wellness claims — customers and regulators are converging on the same demand: verification by an accountable human or institution. Trust is separating from the service itself and being repriced as a distinct, premium attribute layered on top of automation.",
    evidenceSummary:
      "Three key signals across five sectors (technology & AI, finance, retail, hospitality, health & wellness) but only three independent sources (investment-bank research, youth survey, operator/trade material) and a five-month evidence window (January–June 2026). Breadth and coherence pass; depth and persistence fail. The pattern is plausible and strategically live, but the honest label is hypothesis until at least five independent sources and six months of evidence accumulate.",
    keySignalIds: ["SIG-002", "SIG-006", "SIG-009"],
    clusterIds: ["CLU-002"],
    contradictionIds: ["CON-001"],
    possibleDriverIds: ["DRV-001"],
    strategicMeaning:
      "If trust becomes a purchasable layer, institutions can productise it deliberately — named-human confirmation tiers in banking, physician-led verification in wellness, licensed-and-regulated as a consumer-facing badge in credit. The strategic mistake would be treating verification demand as friction to engineer away; the evidence so far suggests it is demand to be served, and priced.",
    firstEvidenceDate: "2026-01-12",
    latestEvidenceDate: "2026-06-20",
    independentSourceCount: 3,
    confidence: "low",
    validationStatus: "hypothesis",
    reviewStatus: "needs_human_review",
    humanNotes:
      "Persistence clock started January 2026; earliest possible pass is Q3 2026. Scanning priorities: insurance and government-services escalation data, and any bank publishing human-review volumes. Do not let the driver DRV-001 reason backwards into validating this pattern — evidence first.",
    createdAt: "2026-03-18T14:20:00.000Z",
    updatedAt: "2026-06-25T10:10:00.000Z",
  },
];
