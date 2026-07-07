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
      "Residential pipelines weighted towards investor studios are structurally mismatched with a settlement market: golden-visa demand is family demand — three bedrooms, school proximity, community fabric, transit access.",
    whyItMatters:
      "Product mix decisions being made now will deliver into the market of 2028–2030. If the settlement dynamic (SIG-003) holds, family-fit stock near schools and stations earns a durable occupancy and retention premium; if pipelines stay investor-weighted, developers will be discounting studios while competitors lease waiting-list family product.",
    evidenceSignalIds: ["SIG-003", "SIG-010", "SIG-011"],
    evidenceDriverIds: ["DRV-002"],
    opportunity:
      "First movers can secure school partnerships, transit-adjacent plots and community-programming operators before settlement pricing is consensus.",
    risk:
      "Over-rotation: if visa policy tightens (CON-003 escalation), family-stock bets need exit routes — design formats convertible between family and shared occupancy.",
    recommendedAction:
      "Audit the residential pipeline for family-formation fit within one quarter: share of three-bedroom supply, school-place availability within 15 minutes, station distance, and a named community-programming budget per project. Rebalance the next two land acquisitions against that audit, and add golden-visa renewal data (IND-001) to the investment committee's standing pack.",
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
      "A settling population justifies decade-horizon retail products the transient model never supported — but winning them requires solving the trust problem first: customers demand human verification exactly where banks are automating (SIG-006), and youth credit relationships are forming outside banks entirely (SIG-009).",
    whyItMatters:
      "The bank that owns a family's mortgage, education savings and eventual retirement products captures twenty years of relationship value. That contest is being decided now, at two entry points banks currently treat as noise: the BNPL checkout where young customers form credit habits, and the verification moment where automated service either earns or burns accountability trust.",
    evidenceSignalIds: ["SIG-003", "SIG-006", "SIG-009"],
    evidenceDriverIds: ["DRV-001"],
    opportunity:
      "Design a 'settlement bundle' — visa-linked mortgage pre-approval, education savings, family healthcare financing — with a named human adviser as the accountable spine of the relationship.",
    risk:
      "Pricing human verification as premium-only invites regulator and reputation damage; recourse on high-stakes automated decisions is heading towards being a right, not a product.",
    recommendedAction:
      "Stand up a two-part pilot within two quarters: (1) a settlement bundle for long-term-visa families with one named adviser per household and published human-review rights on all automated credit decisions; (2) an instalment-layer partnership or licence application so the bank meets under-30s at the checkout rather than at first mortgage. Report escalation-to-human volumes (IND-005) to the board monthly.",
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
      "The most valuable 'visitor' of the next decade may live ten minutes away: settlement turns destinations and hotels into repeat-use ecosystems for residents — memberships, clinics, programming — alongside the fly-in economy rather than instead of it.",
    whyItMatters:
      "Hotel longevity clinics (SIG-002) and mall lifestyle ecosystems (SIG-007) both point at relationship economics replacing visit economics. Tourism strategies measured purely in arrivals will misprice the settled-resident opportunity — and hotels that treat residents as off-peak filler will lose the membership relationship to operators who design for it.",
    evidenceSignalIds: ["SIG-002", "SIG-007"],
    evidenceDriverIds: ["DRV-002"],
    opportunity:
      "Resident memberships (wellness, dining, work, family programming) create annuity revenue that smooths seasonality and survives travel shocks; clinic-anchored properties earn repeat clinical visits rather than one-off stays.",
    risk:
      "Serving two masters badly: resident ecosystems and fly-in luxury have different service rhythms — properties need explicit zoning of the two, or both experiences degrade (CON-003's mobility side is still real revenue).",
    recommendedAction:
      "Pilot a resident-membership product at two flagship properties this year — wellness diagnostics, family programming and workspace under one annual fee — with a target of 30% of F&B and spa revenue from members within 18 months. Tourism boards: add resident repeat-use metrics (memberships, annual visits per resident) to destination scorecards alongside arrivals.",
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
      "In a settling Gulf, cultural credibility localises: regional authorship — designers, creators, dialect, references — is displacing imported prestige as the top of the persuasion stack (SIG-001, SIG-012), and translated global campaigns increasingly read as absentee marketing.",
    whyItMatters:
      "A permanent population consumes identity differently from a transient one: residents building lives here reward brands that participate in the culture being made, not brands that visit it. The price of regional credibility is rising every season (CON-002) — buying it later will cost more and convince less.",
    evidenceSignalIds: ["SIG-001", "SIG-012"],
    evidenceDriverIds: ["DRV-001"],
    opportunity:
      "Early, structural partnerships with regional designers and creators — revenue-shared collections, multi-year ambassador relationships, production investment — lock in credibility before it is repriced.",
    risk:
      "Token localisation (a Ramadan capsule, a translated tagline) is now legible as such and can convert indifference into active cynicism; authenticity failures travel fast through the creator networks brands are trying to court.",
    recommendedAction:
      "Reallocate a defined share of next year's regional campaign budget — 30% is a defensible starting point — from global-asset adaptation to regionally authored work: commission at least one Gulf designer collaboration with genuine revenue share, and shift ambassador spend from global celebrity to a two-year portfolio of regional creators with editorial freedom. Measure engagement per dirham against the global-asset baseline.",
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
      "Schools are the institution most exposed to the gap between residency and belonging: settlement demand is filling classrooms today (SIG-003), but if the 'Platform Without Roots' dynamic holds, enrolment longevity, alumni value and university pathways will all underperform the permanence the visa data implies.",
    whyItMatters:
      "Education groups are making capacity and curriculum investments on decade horizons, and governments are counting on schools to convert residency into attachment for the second generation. Whether families treat a school as a community anchor or a service they exit at the next move is the difference between an alumni economy and perpetual churn — and it is measurable now.",
    evidenceSignalIds: ["SIG-003"],
    evidenceDriverIds: ["DRV-002"],
    opportunity:
      "Schools that measure and design for continuity — full-cycle enrolment, local university pathways, alumni networks that remain in-region — become the strongest belonging infrastructure in the territory and can evidence it to policymakers.",
    risk:
      "Building capacity against visa-length demand that behaves like contract-length demand: over-expanded campuses, under-used alumni investments, and a generation of students for whom the school was a corridor, not a community.",
    recommendedAction:
      "Instrument the belonging gap this academic year: track full-cycle completion rates (entry to graduation in one school), destination of leavers (in-region versus abroad), and parental tenure intentions in the annual survey. Set a board-level threshold — for example, full-cycle completion below 40% — that triggers a strategy review of capacity expansion, and share anonymised continuity data with residency policymakers as evidence for second-generation pathway design.",
    confidence: "low",
    timeHorizon: "mid_term",
    reviewStatus: "needs_human_review",
    createdAt: "2026-05-12T10:50:00.000Z",
    updatedAt: "2026-06-24T11:20:00.000Z",
  },
];
