/**
 * Demo strategic implications. Every implication is anchored to the Permanent
 * Gulf territory (and, where relevant, a specific scenario) and linked back
 * down the pyramid to signals and drivers. Recommended actions are concrete
 * present-day moves, not directions of travel.
 */

import type { StrategicImplication } from "../types";

export const seedImplications: StrategicImplication[] = [
  {
    id: "IMP-001",
    territoryId: "TER-001",
    scenarioId: null,
    sectors: ["real_estate_urban", "education_work"],
    audiences: ["developers", "urban_planners"],
    implicationType: "product",
    implication:
      "Developers may be building too many homes for investors and not enough for families who plan to stay.",
    whyItMatters:
      "Many long-term visa holders are arriving with families, so demand may shift toward larger homes, schools, and daily-life services. Homes planned now will reach the market in 2028–2030, when that shift would bite.",
    evidenceSignalIds: ["SIG-003", "SIG-010", "SIG-011"],
    evidenceDriverIds: ["DRV-002"],
    opportunity:
      "Developers who move first can secure school partnerships and plots near stations before prices reflect family demand.",
    risk:
      "This may be overstated if long-term visas do not turn into actual long-term stays.",
    recommendedAction:
      "Review your pipeline this quarter for three-bedroom supply, school places within 15 minutes, and station distance, then rebalance the next two land purchases against that review.",
    confidence: "medium",
    timeHorizon: "near_term",
    reviewStatus: "human_reviewed",
    createdAt: "2026-04-10T09:30:00.000Z",
    updatedAt: "2026-06-20T10:15:00.000Z",
  },
  {
    id: "IMP-002",
    territoryId: "TER-001",
    scenarioId: null,
    sectors: ["finance_banking_investment"],
    audiences: ["banks"],
    implicationType: "innovation",
    implication:
      "Settling families will want mortgages, education savings and retirement products, but they will only buy them from banks they trust to stay accountable.",
    whyItMatters:
      "The bank that wins a family's mortgage and savings keeps that relationship for twenty years. Young customers are forming their first credit habits at instalment checkouts, outside banks, right now. Customers also demand a human answer exactly where banks are automating.",
    evidenceSignalIds: ["SIG-003", "SIG-006", "SIG-009"],
    evidenceDriverIds: ["DRV-001"],
    opportunity:
      "A settlement bundle — mortgage pre-approval, education savings, family healthcare financing — with one named human adviser could win these families early.",
    risk:
      "Charging extra for human review of automated decisions invites regulator action and reputation damage.",
    recommendedAction:
      "Pilot a settlement bundle for long-term-visa families within two quarters: one named adviser per household, published human-review rights on automated credit decisions, and an instalment partnership reaching under-30s at checkout.",
    confidence: "medium",
    timeHorizon: "near_term",
    reviewStatus: "needs_human_review",
    createdAt: "2026-04-15T11:00:00.000Z",
    updatedAt: "2026-06-21T09:45:00.000Z",
  },
  {
    id: "IMP-003",
    territoryId: "TER-001",
    scenarioId: "SCN-001",
    sectors: ["hospitality_tourism", "health_wellness_longevity"],
    audiences: ["tourism_boards", "hotels"],
    implicationType: "experience",
    implication:
      "Hotels and destinations can earn steady income from residents who visit every week, not only from tourists who visit once.",
    whyItMatters:
      "Hotel clinics and mall memberships already show residents paying for repeat relationships. Tourism strategies that only count arrivals will miss this revenue, and hotels that treat residents as off-peak filler will lose them to operators who design for them.",
    evidenceSignalIds: ["SIG-002", "SIG-007"],
    evidenceDriverIds: ["DRV-002"],
    opportunity:
      "Resident memberships create steady annual revenue that smooths seasonality and survives travel shocks.",
    risk:
      "Serving residents and fly-in guests in the same spaces can degrade both experiences unless properties clearly separate the two.",
    recommendedAction:
      "Pilot a resident membership at two flagship properties this year — wellness, family programming and workspace under one annual fee — and track member share of restaurant and spa revenue.",
    confidence: "medium",
    timeHorizon: "mid_term",
    reviewStatus: "human_reviewed",
    createdAt: "2026-04-22T10:20:00.000Z",
    updatedAt: "2026-06-22T11:30:00.000Z",
  },
  {
    id: "IMP-004",
    territoryId: "TER-001",
    scenarioId: "SCN-001",
    sectors: ["fashion_luxury", "media_entertainment_creator"],
    audiences: ["luxury_brands", "agencies"],
    implicationType: "brand",
    implication:
      "Gulf customers increasingly trust brands that work with regional designers and creators, and increasingly ignore translated global campaigns.",
    whyItMatters:
      "Residents who are building lives here reward brands that take part in the culture being made locally. The price of regional credibility rises every season, so buying it later will cost more and convince less.",
    evidenceSignalIds: ["SIG-001", "SIG-012"],
    evidenceDriverIds: ["DRV-001"],
    opportunity:
      "Early, long-term partnerships with regional designers and creators lock in credibility before it is repriced.",
    risk:
      "Token gestures — a Ramadan capsule or a translated tagline — are easy to spot and can turn indifference into open cynicism.",
    recommendedAction:
      "Shift 30% of next year's regional campaign budget from adapted global assets to regionally authored work, starting with one Gulf designer collaboration on genuine revenue share.",
    confidence: "medium",
    timeHorizon: "immediate",
    reviewStatus: "human_reviewed",
    createdAt: "2026-05-02T09:10:00.000Z",
    updatedAt: "2026-06-23T10:40:00.000Z",
  },
  {
    id: "IMP-005",
    territoryId: "TER-001",
    scenarioId: "SCN-002",
    sectors: ["education_work", "migration_citizenship_belonging"],
    audiences: ["education_providers", "governments"],
    implicationType: "risk",
    implication:
      "Schools are filling with long-term visa families today, but those families may still leave early, taking expected enrolment years and alumni value with them.",
    whyItMatters:
      "Education groups are investing in buildings and curricula for decades ahead. Whether families stay for a full school run or leave midway decides if those investments pay off, and it can be measured now.",
    evidenceSignalIds: ["SIG-003"],
    evidenceDriverIds: ["DRV-002"],
    opportunity:
      "Schools that track and design for continuity — full school runs, local university pathways, in-region alumni — become the strongest proof of belonging in the market.",
    risk:
      "Schools may build capacity for visa-length demand that behaves like contract-length demand, leaving campuses over-expanded and alumni programmes unused.",
    recommendedAction:
      "Track full-cycle completion, leaver destinations and parents' tenure intentions this academic year, and set a completion threshold that triggers a review of campus expansion plans.",
    confidence: "low",
    timeHorizon: "mid_term",
    reviewStatus: "needs_human_review",
    createdAt: "2026-05-12T10:50:00.000Z",
    updatedAt: "2026-06-24T11:20:00.000Z",
  },
];
