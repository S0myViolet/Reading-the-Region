/**
 * Demo future territory. Territories always require human review — they are
 * the point where evidence becomes worldview, and that step is never
 * delegated to automation in this workflow.
 */

import type { FutureTerritory } from "../types";

export const seedTerritories: FutureTerritory[] = [
  {
    id: "TER-001",
    name: "The Permanent Gulf",
    oneLineDefinition:
      "The Gulf's shift from a temporary expatriate work destination to a permanent, multigenerational life platform — where people arrive to stay, and institutions rebuild around them.",
    whyEmerging:
      "Two drivers are converging. State-led diversification (DRV-002) is building the hard platform of permanence — long-term visas, transit, schools, cultural and wellness infrastructure — because settled, spending residents are a diversification asset. Simultaneously, the trust-premium dynamic (DRV-001) is building the soft platform: verified, human, belonging-rich products are what a settling population buys, and what institutions increasingly sell (PAT-001). The strongest evidence sits in cluster CLU-003: golden-visa families making settlement-horizon commitments, transit rooting daily routines, and daily-life infrastructure replacing visit-based formats. The unresolved tension — permanence in paperwork versus transience in identity (CON-003) — is what makes this a territory to monitor rather than a conclusion to act on blindly.",
    driverIds: ["DRV-001", "DRV-002"],
    patternIds: ["PAT-001", "PAT-002"],
    clusterIds: ["CLU-003"],
    representativeSignalIds: ["SIG-003", "SIG-010", "SIG-007", "SIG-011", "SIG-002"],
    contradictionIds: ["CON-003", "CON-002"],
    whatItChanges:
      "The design assumption beneath nearly every Gulf consumer institution. A rotation population needs furnished flats, remittance rails, international schools as waiting rooms, and retail built for moments; a settlement population needs family housing, decade-horizon finance, schools as community anchors, healthcare continuity, retirement and inheritance frameworks, and retail built for routines. The territory also changes the meaning of market share: lifetime value replaces transaction value as the unit of competition, and belonging — felt, not stamped — becomes the scarce resource institutions compete to provide.",
    whoItAffects: [
      "Relocating families making settlement decisions on visa horizons rather than contract cycles",
      "Second-generation residents whose identities form in cities their passports do not name",
      "Developers and urban planners whose pipelines assume investor stock rather than family settlement",
      "Schools, universities and training providers becoming multigenerational institutions",
      "Banks, insurers and pension providers underwriting decade-long resident relationships",
      "Governments balancing residency liberalisation against citizenship's political weight",
    ],
    sectorImplications: [
      {
        sector: "real_estate_urban",
        note: "Demand rotates from investor studios towards three-bedroom family stock, school-adjacent districts and transit-oriented formats; community programming becomes an asset-management function, not marketing.",
      },
      {
        sector: "education_work",
        note: "Schools shift from expatriate waiting rooms to permanent community anchors with alumni economies; workforce policy must reconcile settlement with Saudisation and Emiratisation targets.",
      },
      {
        sector: "finance_banking_investment",
        note: "A settlement population supports decade-horizon products — mortgages, education savings, retirement, inheritance planning — that the transient model never justified; trust architecture (CON-001) decides who wins the relationships.",
      },
      {
        sector: "hospitality_tourism",
        note: "The resident becomes a primary customer: repeat-use ecosystems, memberships and longevity clinics serving people who live ten minutes away, alongside — and in tension with — the fly-in visitor economy.",
      },
      {
        sector: "health_wellness_longevity",
        note: "Healthcare continuity becomes a retention factor for settled families; wellness shifts from retreat product to residential infrastructure, with verification (physician-led, certified) as the premium layer.",
      },
      {
        sector: "retail_commerce",
        note: "Retail formats built for routines beat formats built for visits; membership relationships across health, fitness and work make the mall operator a life-platform gatekeeper.",
      },
    ],
    scenarioIds: ["SCN-001", "SCN-002"],
    risks: [
      "Policy reversibility: visa tightening after an economic shock could unwind settlement demand faster than institutions can retreat from it.",
      "Belonging gap: if long residency never matures into felt belonging, the territory produces a churn-prone population holding options rather than roots (CON-003).",
      "Affordability spiral: settlement demand inflates family housing and schooling costs, pricing out the next wave and capping the territory's growth.",
      "Second-generation limbo: children raised in the Gulf without long-term status certainty become the territory's most acute social and political fault line.",
    ],
    opportunities: [
      "First-mover advantage in decade-horizon products: family-formation housing, education-linked savings, retirement-in-place services, multigenerational memberships.",
      "Belonging infrastructure as a category: community programming, third places and civic-grade amenities that convert residency into attachment — and attachment into retention.",
      "A settlement-era brand voice: institutions that address residents as people building lives, not guests passing through, will own disproportionate trust.",
      "Data advantage for early institutions: settlement behaviour (renewals, schooling, healthcare continuity) is measurable years before competitors notice the shift.",
    ],
    leadingIndicatorIds: ["IND-001", "IND-003", "IND-004", "IND-006"],
    evidenceStrength: 3,
    scenarioReadiness: "scenarios_active",
    monitoringStatus: "strengthening",
    confidence: "medium",
    reviewStatus: "needs_human_review",
    createdAt: "2026-02-20T10:00:00.000Z",
    updatedAt: "2026-06-26T09:40:00.000Z",
  },
];
