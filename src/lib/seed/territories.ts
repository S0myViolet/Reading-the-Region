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
      "A future where parts of the Gulf become long-term homes for families, not only temporary work destinations.",
    whyEmerging:
      "Gulf governments are building the conditions for people to stay. Long-term visas, new metro lines, more schools, and family housing all push in the same direction (DRV-002). At the same time, settled residents buy differently from short-stay workers. They pay for verified, human, community-based services, and institutions are starting to sell exactly that (DRV-001, PAT-001). The evidence so far supports the shift (CLU-003). Families on golden visas are committing to long stays, transit is anchoring daily routines, and daily-life services are replacing visit-based formats. One tension remains unresolved. Long-term visas do not automatically make people feel rooted (CON-003). Many residents hold long-term papers while keeping their savings and sense of home elsewhere. That open question is why this is a territory to monitor, not a conclusion to act on blindly.",
    driverIds: ["DRV-001", "DRV-002"],
    patternIds: ["PAT-001", "PAT-002"],
    clusterIds: ["CLU-003"],
    representativeSignalIds: ["SIG-003", "SIG-010", "SIG-007", "SIG-011", "SIG-002"],
    contradictionIds: ["CON-003", "CON-002"],
    whatItChanges:
      "Most Gulf consumer businesses are built for people passing through. They sell furnished studios, money transfers home, short school stays, and retail built for occasions. Families who stay need different things. They need three-bedroom homes, twenty-year mortgages, schools that anchor a community, healthcare that follows them, and shops built around weekly routines. The measure of success changes too. A customer's value over a lifetime matters more than any single sale. The scarcest asset becomes belonging that residents actually feel, not just paperwork that lets them stay.",
    whoItAffects: [
      "Families deciding whether to settle based on visa length rather than job contracts",
      "Children who grow up in Gulf cities their passports do not name",
      "Developers and planners whose pipelines assume investor buyers rather than settling families",
      "Schools, universities and training providers that may serve the same families for decades",
      "Banks, insurers and pension providers writing ten- and twenty-year products for residents",
      "Governments weighing longer residency against the political weight of citizenship",
    ],
    sectorImplications: [
      {
        sector: "real_estate_urban",
        note: "Demand shifts from investor studios to three-bedroom family homes near schools and stations. Community programming becomes part of running the asset, not just marketing it.",
        whyItMatters:
          "Developers who keep building for buyers who leave will hold the wrong stock as families become the market.",
        exampleDecision:
          "Weight the next land bid toward family districts near schools and transit, not investor towers.",
      },
      {
        sector: "education_work",
        note: "Schools stop being short stops for expatriate children and become lasting community anchors with alumni networks. Workforce policy must fit settlement alongside Saudisation and Emiratisation targets.",
        whyItMatters:
          "A school a family trusts for twelve years is a stronger settlement anchor than any visa category.",
        exampleDecision:
          "Plan school capacity and alumni programmes for families who stay a generation, not a contract cycle.",
      },
      {
        sector: "finance_banking_investment",
        note: "Settled families justify mortgages, education savings, retirement and inheritance products that transient customers never did. The banks that earn trust (CON-001) win these relationships.",
        whyItMatters:
          "This means banks may need products for families who stay for decades, not workers who leave after a contract.",
        exampleDecision:
          "Build a resident product line — mortgage, education savings, retirement — and price it on staying.",
      },
      {
        sector: "hospitality_tourism",
        note: "Residents become primary customers. Hotels can sell memberships, repeat visits and clinic services to people who live ten minutes away, alongside — and in tension with — fly-in tourists.",
        whyItMatters:
          "A hotel priced only on tourist arrivals misses the customers who could visit every week.",
        exampleDecision:
          "Pilot resident memberships for gyms, clinics and workspaces in one flagship property.",
      },
      {
        sector: "health_wellness_longevity",
        note: "Families who plan to stay need healthcare that stays with them. Wellness shifts from holiday retreats to everyday neighbourhood services, and physician-led, certified care becomes the premium.",
        whyItMatters:
          "Long-term patients reward continuity and verified quality; visitors reward novelty. The two need different systems.",
        exampleDecision:
          "Invest in neighbourhood clinics with named physicians rather than another destination spa.",
      },
      {
        sector: "retail_commerce",
        note: "Shops built for weekly routines beat shops built for one-off visits. Mall operators who bundle health, fitness and work memberships become gatekeepers to daily life.",
        whyItMatters:
          "Footfall from routine beats footfall from spectacle once residents outnumber visitors as spenders.",
        exampleDecision:
          "Re-let one anchor unit to daily-life services and measure repeat visits, not first visits.",
      },
    ],
    scenarioIds: ["SCN-001", "SCN-002"],
    risks: [
      "Visa rules could tighten after an economic shock, cutting settlement demand faster than businesses can pull back.",
      "Long residency may never turn into felt belonging, leaving a population that holds options rather than roots (CON-003).",
      "Settlement demand could push family housing and school costs so high that the next wave of families is priced out.",
      "Children raised in the Gulf without clear long-term status become the sharpest social and political fault line.",
    ],
    opportunities: [
      "Being first with decade-long products: family housing, education savings, retirement services, multigenerational memberships.",
      "Building belonging as a business: community programming, gathering places and civic-grade amenities that turn residency into attachment, and attachment into retention.",
      "Speaking to residents as people building lives, not guests passing through. Institutions that do this early earn outsized trust.",
      "Early movers can measure settlement behaviour — renewals, schooling, healthcare continuity — years before competitors notice the shift.",
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
