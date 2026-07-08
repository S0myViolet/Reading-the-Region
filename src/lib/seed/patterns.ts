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
    name: "Belonging is being turned into a product",
    patternType: "cultural",
    patternStatement:
      "Companies and institutions keep converting the need to belong into things people can buy. Heritage clothing sells identity for daily wear. Visa, schooling, and housing packages sell settlement. Malls and coffee houses sell hosted community. Creator campaigns sell regional credibility. We see this across fashion, migration services, housing, schools, malls, coffee houses, and media.",
    evidenceSummary:
      "Five key signals cover eight sectors: fashion and luxury, culture and heritage, migration and belonging, real estate, education and work, retail, food-and-beverage third places, and the creator economy. Eight independent sources of different types back them: government policy data, newspaper reporting, a consulting survey, ethnographic field notes, an expert interview, a creator panel, culture press, and search trends. The evidence runs from September 2025 to June 2026, nine months. The pattern passes all four tests: breadth, depth, persistence, and coherence. The main bias risk is that several sources profit from the belonging story they describe.",
    keySignalIds: ["SIG-001", "SIG-003", "SIG-007", "SIG-008", "SIG-012"],
    clusterIds: ["CLU-001", "CLU-002", "CLU-003"],
    contradictionIds: ["CON-002", "CON-003"],
    possibleDriverIds: ["DRV-001", "DRV-002"],
    strategicMeaning:
      "When belonging becomes a product category, the competitive set changes. Developers compete with schools, malls with mosque courtyards, and fashion labels with citizenship policy. All of them are bidding to answer the same emotional demand. Institutions that treat belonging as a marketing theme will lose to those that build it as infrastructure: community programming, multigenerational products, and memberships that grow more valuable over time. There is also a risk. Products that promise belonging but do not deliver the feeling (see CON-003) create churn-prone, cynical customers.",
    firstEvidenceDate: "2025-09-10",
    latestEvidenceDate: "2026-06-08",
    independentSourceCount: 8,
    confidence: "medium",
    validationStatus: "validated",
    reviewStatus: "validated",
    humanNotes:
      "Passed all four tests at the June review. Keep testing coherence: 'belonging' must not become a catch-all label. Each key signal must show an emotional need being turned into something sellable, not just a lifestyle product doing well.",
    createdAt: "2026-01-08T10:00:00.000Z",
    updatedAt: "2026-06-22T09:30:00.000Z",
  },
  {
    id: "PAT-002",
    name: "Trust is becoming a paid premium in automated services",
    patternType: "behavioural",
    patternStatement:
      "Wherever services automate, customers and regulators keep asking for the same thing: a human or an accountable institution to verify the outcome. People will pay extra for that verification, so trust is becoming a separate premium layer on top of automation. We see this in bank credit decisions, buy-now-pay-later checkout finance, and wellness services that make clinical claims.",
    evidenceSummary:
      "Three key signals span five sectors: technology and AI, finance, retail, hospitality, and health and wellness. But they rest on only three independent sources: investment-bank research, a youth survey, and operator trade material. The evidence window is five months, January to June 2026. Breadth and coherence pass; depth and persistence fail. The pattern is plausible and strategically live. The honest label is hypothesis until at least five independent sources and six months of evidence accumulate.",
    keySignalIds: ["SIG-002", "SIG-006", "SIG-009"],
    clusterIds: ["CLU-002"],
    contradictionIds: ["CON-001"],
    possibleDriverIds: ["DRV-001"],
    strategicMeaning:
      "If trust becomes something customers can buy, institutions can build it as a deliberate product. Examples: named-human confirmation tiers in banking, physician-led verification in wellness, and 'licensed and regulated' as a consumer badge in credit. The strategic mistake would be treating verification demand as friction to remove. The evidence so far says it is demand to be served, and priced.",
    firstEvidenceDate: "2026-01-12",
    latestEvidenceDate: "2026-06-20",
    independentSourceCount: 3,
    confidence: "low",
    validationStatus: "hypothesis",
    reviewStatus: "needs_human_review",
    humanNotes:
      "The persistence clock started in January 2026, so the earliest possible pass is Q3 2026. Scanning priorities: insurance and government-services escalation data, and any bank that publishes human-review volumes. Do not let driver DRV-001 reason backwards into validating this pattern. Evidence comes first.",
    createdAt: "2026-03-18T14:20:00.000Z",
    updatedAt: "2026-06-25T10:10:00.000Z",
  },
];
