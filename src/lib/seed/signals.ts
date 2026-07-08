/**
 * Demo signals. Every signal carries the mandatory four-level zoom, full
 * scoring, and evidence links back to sources and (where applicable) the
 * observation it was promoted from. Confidence tracks evidence honestly:
 * low-evidence signals are marked speculative at level 4 and low confidence.
 */

import type { Signal } from "../types";

export const seedSignals: Signal[] = [
  // ---------------------------------------------------------------------------
  // SIG-001 — heritage menswear, contemporary cut
  // ---------------------------------------------------------------------------
  {
    id: "SIG-001",
    title: "Gulf menswear labels are redesigning heritage garments for everyday wear",
    description:
      "Independent menswear labels in Dubai and Riyadh are redesigning thobes, bishts and sirwal. They use technical fabrics, slimmer cuts and streetwear styling. They sell directly to customers and through regional concept stores. The pieces are marketed as daily wear for young Gulf men. Prices sit between streetwear and entry-level luxury. Small production runs are selling out within days.",
    dateObserved: "2025-10-06",
    eventDate: "2025-09-20",
    sourceIds: ["SRC-006", "SRC-005"],
    observationId: "OBS-001",
    region: "GCC",
    country: "UAE",
    city: "Dubai",
    sectors: ["fashion_luxury", "culture_arts_heritage"],
    subsector: "menswear / contemporary heritage design",
    actorTypes: ["sme", "creator", "brand"],
    primaryActor: "Independent Gulf menswear labels (demo)",
    typeOfChange: ["cultural", "behavioural"],
    systemsAffected: ["identity", "cultural_production", "luxury", "consumption"],
    signalStrength: "emerging",
    scores: {
      novelty: 4,
      momentum: 3,
      evidence: 3,
      strategicRelevance: 4,
      behaviouralImpact: 3,
      emotionalImpact: 4,
      structuralImpact: 2,
      crossSectorRelevance: 3,
      geographicRelevance: 4,
    },
    timeHorizon: "near_term",
    confidence: "medium",
    whyItMatters:
      "Young Gulf men are starting to wear heritage garments as everyday clothes, not only for ceremonies. That gives regional designers a commercial market for Gulf identity. Aspiration may shift from imported luxury brands to regional labels.",
    zoom: {
      whatHappened:
        "Between September and December 2025, at least four independent menswear labels in Dubai and Riyadh released redesigned thobes, bishts and sirwal. The pieces used technical fabrics and contemporary cuts. They were stocked in regional concept stores and sold directly to customers. Several drops sold out within days.",
      behaviourChanged:
        "Young Gulf men now wear heritage-derived pieces at the office, in coffee houses and while travelling. They no longer save national dress for formal occasions. For purchases that signal identity, they are choosing regional labels over imported streetwear.",
      systemChanged:
        "The fashion and luxury system is starting to treat Gulf identity as a design input. Concept-store buyers are giving shelf space to Gulf labels. Stylists are mixing heritage cuts into editorial work. 'Regional' is becoming a premium claim, not a craft niche.",
      futurePlausible:
        "If this continues, regional labels could build a recognisable Gulf design style within five years and win the Ramadan and Eid spending that global luxury houses capture today.",
      futureIsSpeculative: true,
    },
    systems: {
      firstOrderEffect:
        "Small regional labels capture a growing share of young men's wardrobe spend for identity-relevant occasions.",
      secondOrderEffect:
        "Concept stores, regional fashion weeks and cultural funds begin building commercial infrastructure — wholesale, manufacturing, styling talent — around Gulf design authorship.",
      thirdOrderEffect:
        "Global luxury houses respond with regional design collaborations and Arabic-first campaigns, raising the price of cultural credibility across the category.",
      reinforcingLoops: [
        "Creator visibility drives label sales, which fund better production, which attracts more creators to wear the pieces.",
        "State cultural investment legitimises regional design careers, increasing the supply of designers feeding the movement.",
      ],
      balancingLoops: [
        "Small-batch production limits volume; rapid demand growth without manufacturing depth invites quality failures that could deflate the premium.",
      ],
    },
    potentialImplications: [
      "Regional concept stores could become the main channel for young people's luxury spending, weakening global-brand flagships.",
      "Mall operators may need real space for Gulf designers to stay culturally credible, not a token corner.",
      "As labels grow, they will compete for the small pool of tailors skilled in heritage garments.",
    ],
    assumptions: [
      "Reported sell-outs reflect real demand, not deliberately small production runs.",
      "The trend reaches middle-class youth broadly, not just a creative circle in Dubai and Riyadh.",
    ],
    openQuestions: [
      "Will buyers come back once the novelty fades, or is this a one-off purchase?",
      "Will womenswear see an equivalent movement, and through which garments?",
    ],
    contradictionIds: ["CON-002"],
    relatedSignalIds: ["SIG-004", "SIG-008", "SIG-012"],
    clusterIds: ["CLU-001"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: ["IND-004"],
    tags: ["heritage-design", "menswear", "thobe", "regional-identity", "youth-culture"],
    humanNotes:
      "Promoted from OBS-001. The first sighting came from the TikTok panel, a low-credibility source. The culture magazine's independent profiles of two labels lifted evidence to 3. A third independent source — retail sales data — would move this to validated.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "human_reviewed",
    createdAt: "2025-10-06T09:20:00.000Z",
    updatedAt: "2026-03-11T10:05:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-002 — hotels adding longevity clinics
  // ---------------------------------------------------------------------------
  {
    id: "SIG-002",
    title: "Gulf hotels are adding longevity clinics and medical diagnostics",
    description:
      "Hotel and resort operators in Dubai and Riyadh are building physician-led longevity clinics inside their properties. The clinics offer diagnostic screening, biomarker panels and supervised health programmes, sold as multi-day packages. They are permanent facilities, not seasonal retreats. At least three operators have announced clinics since November 2025. Trade coverage reports more operators looking for clinical partners.",
    dateObserved: "2026-01-20",
    eventDate: "2026-01-12",
    sourceIds: ["SRC-009", "SRC-003", "SRC-002"],
    observationId: "OBS-002",
    region: "GCC",
    country: "UAE",
    city: "Dubai",
    sectors: ["hospitality_tourism", "health_wellness_longevity"],
    subsector: "wellness & longevity",
    actorTypes: ["developer", "corporation", "brand"],
    primaryActor: "Gulf hotel and resort operators (demo)",
    typeOfChange: ["economic", "institutional", "behavioural"],
    systemsAffected: ["tourism", "healthcare", "luxury", "trust", "consumption"],
    signalStrength: "emerging",
    scores: {
      novelty: 4,
      momentum: 4,
      evidence: 3,
      strategicRelevance: 4,
      behaviouralImpact: 3,
      emotionalImpact: 3,
      structuralImpact: 3,
      crossSectorRelevance: 4,
      geographicRelevance: 4,
    },
    timeHorizon: "near_term",
    confidence: "medium",
    whyItMatters:
      "Hotels are adding clinics and diagnostics, which may turn them into regular health and lifestyle destinations. Running a clinic demands different regulation, staff and trust than running a spa. If Gulf hotels win guests who fly in for health checks, their business shifts from selling nights to supporting guests' health over years.",
    zoom: {
      whatHappened:
        "Between November 2025 and February 2026, three Gulf hotel operators announced permanent physician-led longevity clinics inside flagship properties in Dubai and Riyadh. The clinics offer diagnostic screening and multi-day medical programmes. Trade press reports more operators negotiating with clinical partners.",
      behaviourChanged:
        "Wealthy guests are booking hotel stays around health checks and supervised programmes, not leisure alone. Operators are retraining staff and converting spa space into clinical space.",
      systemChanged:
        "Tourism and healthcare are merging inside hotels. Hotels are entering regulated medical territory and competing for doctors and health licences. Health spending is moving into leisure venues. This is a structural change, not a marketing repackage.",
      futurePlausible:
        "If this continues, the Gulf could become a destination for scheduled health checks from South Asia, Africa and Europe within five years, with hotel clinics competing on verified medical results and repeat health visits replacing one-off holidays.",
      futureIsSpeculative: true,
    },
    systems: {
      firstOrderEffect:
        "Operators differentiate premium properties and raise revenue per guest through clinical packages.",
      secondOrderEffect:
        "Health regulators extend licensing frameworks into hospitality venues; clinical talent is drawn from hospitals into hotel-employed roles.",
      thirdOrderEffect:
        "Insurers and employers begin recognising hotel-clinic diagnostics, pulling longevity services from luxury discretionary spend towards reimbursable healthcare.",
      reinforcingLoops: [
        "Each operator announcement legitimises the category and pressures competitors to add clinical offerings.",
        "Verified outcomes attract repeat guests, funding better clinical capability, which improves outcomes.",
      ],
      balancingLoops: [
        "Clinical incidents or licensing failures in a hotel setting would damage trust across the whole category, not just one property.",
        "Physician scarcity caps how fast properties can open credible clinics.",
      ],
    },
    potentialImplications: [
      "Hotel valuations may start to count clinics and health licences alongside rooms and restaurants.",
      "Guests will need help telling doctor-led clinics from rebranded spas, which creates a role for independent verification.",
      "Medical-tourism authorities get a new type of facility to regulate and promote.",
    ],
    assumptions: [
      "The announced clinics will open with real medical staff, not remain rebranded spas.",
    ],
    openQuestions: [
      "Who regulates a clinic inside a hotel — the tourism authority or the health authority — and how fast can licensing adapt?",
      "Do most customers fly in from abroad, or are they residents coming back regularly?",
    ],
    contradictionIds: ["CON-003"],
    relatedSignalIds: ["SIG-007", "SIG-011"],
    clusterIds: ["CLU-002"],
    patternIds: ["PAT-002"],
    driverIds: ["DRV-001", "DRV-002"],
    monitoringIndicatorIds: [],
    tags: ["longevity", "hotel-clinics", "diagnostics", "medical-tourism", "wellness"],
    humanNotes:
      "Promoted from OBS-002; the duplicate OBS-010 was folded in as momentum evidence. Evidence stays at 3 because two of the three sources are operator press releases. The consulting outlook is the only independent corroboration. A clinic actually opening, not another announcement, would raise the score.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "needs_human_review",
    createdAt: "2026-01-20T11:35:00.000Z",
    updatedAt: "2026-02-06T09:00:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-003 — golden-visa family settlement
  // ---------------------------------------------------------------------------
  {
    id: "SIG-003",
    title: "Families are relocating to Dubai on long-term golden visas",
    description:
      "Whole households, not individual workers, are relocating to Dubai on 10-year golden visas. School places in family districts are under measurable pressure. Tenancy negotiations are getting longer, and demand for three-bedroom homes is rising. Policy data, newspaper reporting and consulting survey work all point the same way: families are moving with the intention to stay.",
    dateObserved: "2025-11-05",
    eventDate: "2025-10-20",
    sourceIds: ["SRC-001", "SRC-004", "SRC-002"],
    observationId: "OBS-003",
    region: "UAE",
    country: "UAE",
    city: "Dubai",
    sectors: ["migration_citizenship_belonging", "real_estate_urban", "education_work"],
    subsector: "long-term residency",
    actorTypes: ["government", "consumer", "developer"],
    primaryActor: "Families relocating on 10-year residency visas (demo)",
    typeOfChange: ["demographic", "regulatory", "behavioural"],
    systemsAffected: ["migration", "housing", "education", "family", "community"],
    signalStrength: "established",
    scores: {
      novelty: 3,
      momentum: 5,
      evidence: 5,
      strategicRelevance: 5,
      behaviouralImpact: 4,
      emotionalImpact: 4,
      structuralImpact: 4,
      crossSectorRelevance: 5,
      geographicRelevance: 4,
    },
    timeHorizon: "immediate",
    confidence: "high",
    whyItMatters:
      "Migration to Dubai is shifting from rotating workers to settling families. Developers, schools, banks, retailers and healthcare providers built their businesses for people who leave after a few years. A population that stays for decades breaks core assumptions in all of them.",
    zoom: {
      whatHappened:
        "Through autumn 2025, Dubai school groups reported longer waiting lists in family districts. Letting agents reported more three-bedroom renewals and requests for longer tenancies. Official policy data showed sustained growth in 10-year visas issued to families rather than single applicants.",
      behaviourChanged:
        "Relocating families are making long-term commitments: multi-year school enrolment, longer leases or home purchases, and moving ageing parents to Dubai. A model built around people leaving after a few years does not produce these decisions.",
      systemChanged:
        "Dubai's migration system is shifting from labour rotation to family settlement, and housing, education and family life are shifting with it. Demand is moving from studios near business districts to family homes near schools. Schools, banks and developers now face customers who plan in decades, not contract cycles.",
      futurePlausible:
        "If this continues, Dubai's consumer economy reorganises around permanence within a decade — multigenerational households, school alumni networks, retirement in the Gulf — and other GCC states compete for settlers, not just salaried workers.",
      futureIsSpeculative: false,
    },
    systems: {
      firstOrderEffect:
        "Demand rises for family housing, school places and long-tenure leases in specific districts.",
      secondOrderEffect:
        "Developers rebalance pipelines towards three-bedroom and community formats; schools expand capacity; banks extend mortgage and education products to visa-backed residents.",
      thirdOrderEffect:
        "A settled middle class develops civic expectations — public space, healthcare continuity, end-of-life and inheritance frameworks — pushing policy beyond visa mechanics into belonging infrastructure.",
      reinforcingLoops: [
        "Each settled family strengthens the schooling and community fabric that attracts the next family.",
        "Long-tenure residents deepen local spending, justifying more resident-first amenities, which increase retention.",
      ],
      balancingLoops: [
        "Housing and schooling cost inflation in family districts prices out the next wave of settlers, slowing intake.",
        "Visa conditionality (fees, thresholds, renewals) can be tightened, cooling settlement demand quickly.",
      ],
    },
    potentialImplications: [
      "Developers with pipelines full of studios and one-bedroom investor flats are building the wrong stock for settling families.",
      "School groups become strategic infrastructure, and their waiting lists become an early indicator of district growth.",
      "Banks can offer mortgages, education savings and retirement products to families they once treated as short-term residents.",
    ],
    assumptions: [
      "Visa policy stays stable or loosens further, rather than tightening after an economic shock.",
      "Families with 10-year visas actually behave long-term — the visa translates into real commitment.",
    ],
    openQuestions: [
      "How many golden-visa holders bring school-age children, and how many hold the visa as a backup option?",
      "Do families stay into retirement, or still leave when working life ends?",
    ],
    contradictionIds: ["CON-003"],
    relatedSignalIds: ["SIG-010", "SIG-011"],
    clusterIds: ["CLU-003"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: ["IND-001"],
    tags: ["golden-visa", "settlement", "family-housing", "schools", "permanence"],
    humanNotes:
      "Strongest signal on the board: policy data, independent reporting and survey work all agree. It anchors cluster CLU-003 and the Permanent Gulf territory. Keep the strong visa-issuance data separate from the weaker claims about belonging.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "validated",
    createdAt: "2025-11-05T09:15:00.000Z",
    updatedAt: "2026-05-14T08:20:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-004 — Saudi cultural investment and creative jobs
  // ---------------------------------------------------------------------------
  {
    id: "SIG-004",
    title: "Saudi cultural spending is creating real creative-sector jobs",
    description:
      "Saudi Arabia's state-backed cultural seasons, commissions and festivals now support a visible creative job market. Production companies are hiring at scale. Commissioning calendars repeat year after year. Experienced Saudi producers and technical crews receive competing salary offers. The spending has moved from buying events to building institutions: training programmes, venues and year-round commissioning bodies.",
    dateObserved: "2025-09-14",
    eventDate: "2025-09-01",
    sourceIds: ["SRC-014", "SRC-008", "SRC-004"],
    observationId: null,
    region: "Saudi Arabia",
    country: "Saudi Arabia",
    city: "Riyadh",
    sectors: ["culture_arts_heritage", "government_policy"],
    subsector: "creative economy",
    actorTypes: ["government", "sovereign_fund", "cultural_institution", "creator"],
    primaryActor: "Saudi cultural ministries and commissions (demo)",
    typeOfChange: ["economic", "institutional", "cultural"],
    systemsAffected: ["cultural_production", "labour", "governance", "creativity"],
    signalStrength: "established",
    scores: {
      novelty: 3,
      momentum: 5,
      evidence: 4,
      strategicRelevance: 5,
      behaviouralImpact: 3,
      emotionalImpact: 4,
      structuralImpact: 4,
      crossSectorRelevance: 4,
      geographicRelevance: 3,
    },
    timeHorizon: "immediate",
    confidence: "high",
    whyItMatters:
      "Young Saudis can now build careers in the creative sector, not just attend state-funded events. That changes who they can become. It also gives regional brands, media and tourism a Saudi production base instead of an imported one.",
    zoom: {
      whatHappened:
        "Through 2025, Saudi cultural seasons and commissions published recurring year-round programming calendars. Cultural bodies expanded training schemes. Interviews and press reports recorded production companies hiring at scale, with salary competition for experienced Saudi creative and technical staff.",
      behaviourChanged:
        "Young Saudis are choosing creative jobs as a credible career, not a hobby or a reason to move abroad. Production firms are building permanent teams around a dependable pipeline of commissions instead of staffing event by event.",
      systemChanged:
        "The state is turning cultural production into an industry. Culture is now planned, budgeted and measured as an economic sector. The job market gains new occupations and Saudisation pressure in creative roles. Government treats culture as a portfolio to deliver, not only heritage to protect.",
      futurePlausible:
        "If this continues, Saudi Arabia could hold the Gulf's deepest creative workforce by 2030 and export production capacity across the region — provided commissioning survives budget cycles and training closes the shortage of technical craft skills.",
      futureIsSpeculative: false,
    },
    systems: null,
    potentialImplications: [
      "Regional brands and platforms gain a Saudi production base, reducing reliance on Beirut, Cairo and London.",
      "Creative salaries rise as state projects and private firms compete for the same small talent pool.",
      "Who makes Saudi culture becomes a national policy question, tying creative careers to Saudisation rules.",
    ],
    assumptions: [
      "State cultural budgets survive oil-price cycles instead of being the first spending cut.",
    ],
    openQuestions: [
      "How many of the new jobs are permanent, and how many are short contracts tied to event seasons?",
      "Can training programmes close the shortage of technical craft skills flagged in interview evidence (see OBS-014)?",
    ],
    contradictionIds: [],
    relatedSignalIds: ["SIG-001", "SIG-008", "SIG-012"],
    clusterIds: ["CLU-001"],
    patternIds: [],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: ["IND-002"],
    tags: ["vision-2030", "creative-economy", "cultural-investment", "saudisation", "labour-market"],
    humanNotes:
      "The event-calendar and PR sources lean promotional (gulf_boosterism). The weight rests on the producer interview and newspaper corroboration. The unreviewed Saudisation observation (OBS-014) could extend the labour-market side.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "validated",
    createdAt: "2025-09-14T10:00:00.000Z",
    updatedAt: "2026-04-28T14:30:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-005 — Arabic podcasts in the commute
  // ---------------------------------------------------------------------------
  {
    id: "SIG-005",
    title: "Arabic-language podcasts are becoming a mainstream commuting habit",
    description:
      "Platform data shows Arabic-language podcast listening growing steadily in Saudi Arabia and the UAE. Listening peaks on weekday mornings and evenings, matching commute times. Interview shows in Gulf dialects dominate the top charts. Advertisers are moving brand budgets into host-read Arabic formats.",
    dateObserved: "2026-02-11",
    eventDate: "2026-02-04",
    sourceIds: ["SRC-007", "SRC-016"],
    observationId: null,
    region: "GCC",
    country: "Saudi Arabia",
    city: null,
    sectors: ["media_entertainment_creator"],
    subsector: "audio / podcasts",
    actorTypes: ["platform", "creator", "consumer"],
    primaryActor: "Arabic-language podcast networks and audio platforms (demo)",
    typeOfChange: ["behavioural", "cultural"],
    systemsAffected: ["media", "attention", "cultural_production"],
    signalStrength: "emerging",
    scores: {
      novelty: 3,
      momentum: 4,
      evidence: 3,
      strategicRelevance: 3,
      behaviouralImpact: 3,
      emotionalImpact: 3,
      structuralImpact: 2,
      crossSectorRelevance: 3,
      geographicRelevance: 4,
    },
    timeHorizon: "near_term",
    confidence: "medium",
    whyItMatters:
      "Gulf commuters now spend a daily window with long Arabic audio from hosts they trust. That is a different persuasion environment from social video. Regional voices, not translated global content, are filling it.",
    zoom: {
      whatHappened:
        "Platform data published in early 2026 showed double-digit annual growth in Arabic podcast listening hours in Saudi Arabia and the UAE. Listening peaked on weekdays at 07:00–09:00 and 17:00–19:00. Gulf-dialect interview shows held most top-chart positions.",
      behaviourChanged:
        "Commuters are choosing long Arabic audio in the car and on new metro journeys. They are replacing music radio and English-language content with regional hosts they follow personally, episode after episode.",
      systemChanged:
        "The daily media habit is moving from broadcast radio and global platforms to regional podcast networks. Advertising money, talent and agenda-setting are shifting into Arabic-first hands.",
      futurePlausible:
        "If this continues, Gulf-dialect audio could become young professionals' main daily media — making podcast hosts the region's trusted explainers and giving brands and institutions a native channel that bypasses both legacy media and Western platforms.",
      futureIsSpeculative: true,
    },
    systems: null,
    potentialImplications: [
      "Banks, developers and government communicators may treat host-read Arabic audio as a premium, high-trust channel.",
      "Metro expansion adds hands-free listening time, tying media habits to transport infrastructure.",
    ],
    assumptions: [
      "The platform's growth figures reflect real listening, not selective disclosure by a company with a growth story to sell.",
    ],
    openQuestions: [
      "Is listening spread across many shows, or concentrated in two or three hits?",
    ],
    contradictionIds: [],
    relatedSignalIds: ["SIG-010", "SIG-012"],
    clusterIds: ["CLU-001"],
    patternIds: [],
    driverIds: [],
    monitoringIndicatorIds: [],
    tags: ["arabic-audio", "podcasts", "commuting", "attention", "creator-economy"],
    humanNotes:
      "One platform-data source plus a desk memo, and the platform benefits from the growth narrative. Evidence held at 3 until an independent listener survey appears.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "human_reviewed",
    createdAt: "2026-02-11T08:45:00.000Z",
    updatedAt: "2026-03-02T11:10:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-006 — bank AI and verification demand
  // ---------------------------------------------------------------------------
  {
    id: "SIG-006",
    title: "Gulf bank customers are demanding human review of AI decisions",
    description:
      "Gulf retail banks are rolling out AI assistants and automated credit decisions quickly, in line with national AI strategies. At the same time, equity research and youth survey data record customers asking for a person to confirm what the AI decided. Branch appointments are rising. Complaints request human review. Survey respondents describe distrust of automated refusals that come without explanation.",
    dateObserved: "2026-03-09",
    eventDate: "2026-02-25",
    sourceIds: ["SRC-013", "SRC-011", "SRC-004"],
    observationId: "OBS-004",
    region: "GCC",
    country: "UAE",
    city: null,
    sectors: ["technology_ai", "finance_banking_investment"],
    subsector: "retail banking automation",
    actorTypes: ["corporation", "consumer", "government"],
    primaryActor: "Gulf retail banks deploying AI service and credit tools (demo)",
    typeOfChange: ["technological", "behavioural", "regulatory"],
    systemsAffected: ["finance", "trust", "technology"],
    signalStrength: "emerging",
    scores: {
      novelty: 4,
      momentum: 4,
      evidence: 3,
      strategicRelevance: 5,
      behaviouralImpact: 3,
      emotionalImpact: 4,
      structuralImpact: 4,
      crossSectorRelevance: 5,
      geographicRelevance: 4,
    },
    timeHorizon: "near_term",
    confidence: "medium",
    whyItMatters:
      "Bank customers are not rejecting AI. They want a person to confirm, explain and take responsibility for important automated decisions. That turns human service from a cost to cut into a product banks can sell. The same demand is likely to spread beyond banking.",
    zoom: {
      whatHappened:
        "In the first quarter of 2026, an investment-bank sector note recorded Gulf retail banks accelerating AI deployment. The same note flagged rising branch appointment bookings and complaints asking for human review of automated decisions. The quarterly youth survey logged matching comments about unexplained AI refusals.",
      behaviourChanged:
        "Customers use AI for routine tasks because it is fast. For decisions that matter, they book branch appointments or file complaints to get a person to confirm, explain or overturn the outcome.",
      systemChanged:
        "Trust in banking is splitting in two. Customers trust machines with transactions but still want a person accountable for decisions. Banks must design a human verification layer instead of a pure automation path, and regulators are starting to look at explainability.",
      futurePlausible:
        "If this continues, 'a named person confirms this' becomes a paid service tier across Gulf banking, insurance and government services — and institutions that cut their human staff may have to buy that capacity back at a premium.",
      futureIsSpeculative: true,
    },
    systems: {
      firstOrderEffect:
        "Banks face rising human-escalation volumes precisely where they projected automation savings.",
      secondOrderEffect:
        "Service models split into automated-default and human-verified tiers; regulators begin drafting explainability and recourse requirements for automated credit decisions.",
      thirdOrderEffect:
        "Human accountability becomes a cross-sector premium attribute, repricing human expertise in healthcare, education and advisory services region-wide.",
      reinforcingLoops: [
        "Each opaque automated refusal that a human later overturns teaches customers to escalate, increasing verification demand.",
      ],
      balancingLoops: [
        "Better explainable-AI interfaces resolve routine doubts without humans, absorbing some verification demand.",
        "Charging for human review suppresses frivolous escalations but risks regulator pushback on fairness.",
      ],
    },
    potentialImplications: [
      "Banks may design human-verified service tiers as products, instead of handling verification through complaints.",
      "Gulf states champion AI and protect consumers at the same time, so rules requiring explainable decisions could arrive here first.",
      "Branch networks may be repositioned as trust infrastructure rather than a legacy cost.",
    ],
    assumptions: [
      "The demand for human confirmation is lasting, not a discomfort that fades as people get used to AI.",
    ],
    openQuestions: [
      "Will customers actually pay for human verification, or only demand it for free?",
      "Does the same pattern appear in insurance and government services data?",
    ],
    contradictionIds: ["CON-001"],
    relatedSignalIds: ["SIG-009"],
    clusterIds: [],
    patternIds: ["PAT-002"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: ["IND-005"],
    tags: ["ai-adoption", "trust", "verification", "banking", "explainability"],
    humanNotes:
      "Promoted from OBS-004. The equity note and the survey share no methodology, which makes their agreement more convincing. Both still measure trust indirectly. A bank's own escalation data would settle it.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "needs_human_review",
    createdAt: "2026-03-09T10:10:00.000Z",
    updatedAt: "2026-04-01T09:40:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-007 — malls as lifestyle ecosystems
  // ---------------------------------------------------------------------------
  {
    id: "SIG-007",
    title: "Gulf malls are filling anchor space with gyms, clinics and co-working",
    description:
      "Mall owners in the UAE and Saudi Arabia are re-letting anchor space from department stores to gyms, medical and dental clinics, co-working floors, cultural venues and community events. Leasing teams now talk about time spent and repeat visits, not just footfall. Operators report membership relationships — gym contracts, clinic registrations, desk subscriptions — replacing one-off shopping trips.",
    dateObserved: "2025-12-02",
    eventDate: "2025-11-18",
    sourceIds: ["SRC-003", "SRC-002", "SRC-015"],
    observationId: null,
    region: "GCC",
    country: "UAE",
    city: "Dubai",
    sectors: ["retail_commerce", "real_estate_urban"],
    subsector: "mall repositioning",
    actorTypes: ["developer", "corporation", "brand", "consumer"],
    primaryActor: "Regional mall owners and operators (demo)",
    typeOfChange: ["economic", "infrastructural", "behavioural"],
    systemsAffected: ["retail", "urban", "community", "consumption"],
    signalStrength: "established",
    scores: {
      novelty: 3,
      momentum: 4,
      evidence: 4,
      strategicRelevance: 4,
      behaviouralImpact: 4,
      emotionalImpact: 3,
      structuralImpact: 4,
      crossSectorRelevance: 4,
      geographicRelevance: 4,
    },
    timeHorizon: "immediate",
    confidence: "medium",
    whyItMatters:
      "For much of the year, the mall is the closest thing Gulf residents have to public space. As malls host daily routines — exercise, healthcare, work — retail stops competing on transactions and starts competing for a place in residents' weekly lives. Operators who can programme daily life, not just lease space, win.",
    zoom: {
      whatHappened:
        "Through late 2025, trade reporting, consulting survey data and search-trend movement all recorded regional mall operators converting anchor retail space to fitness, clinical, co-working and cultural uses. Operators publicly reframed leasing strategy around time spent and repeat visits.",
      behaviourChanged:
        "Residents use malls for daily routines: morning gym sessions, clinic appointments, workdays at co-working desks, evening cultural events. Many visit several times a week for reasons unconnected to shopping.",
      systemChanged:
        "Malls are absorbing the functions of the high street, the clinic, the office and the civic centre. Their economics shift from sales per square metre to relationships per resident. That makes malls a city-planning question, not just an investment one.",
      futurePlausible:
        "If this continues, the Gulf mall becomes the organising centre of neighbourhood life within five years — with operators holding membership relationships across health, work and leisure, and pure retail surviving only as a tenant inside someone else's venue.",
      futureIsSpeculative: false,
    },
    systems: {
      firstOrderEffect:
        "Anchor vacancies are absorbed by service, health and work tenants at resilient rents.",
      secondOrderEffect:
        "Mall operators build data and membership relationships across categories, becoming platforms that intermediate residents' daily routines.",
      thirdOrderEffect:
        "Municipal planning begins treating malls as quasi-public infrastructure — transport nodes, clinic capacity, civic programming — blurring public and private responsibility for the urban realm.",
      reinforcingLoops: [
        "More daily-life tenants increase visit frequency, which raises the value of remaining retail space, funding further ecosystem investment.",
      ],
      balancingLoops: [
        "As transit expands and outdoor public realm improves (see Riyadh Metro signal), the mall's monopoly on comfortable public space weakens.",
      ],
    },
    potentialImplications: [
      "Retail rents may start to depend on proximity to gyms and clinics rather than fashion flagships.",
      "Mall operators become the gatekeepers for reaching Gulf consumers with health and wellness services.",
      "Budgets for community events shift from marketing extras to core asset management.",
    ],
    assumptions: [
      "Clinics, gyms and co-working tenants can pay rent durably; they are not a stop-gap for empty space.",
    ],
    openQuestions: [
      "Does this work in smaller malls, or only in the dominant regional destinations?",
    ],
    contradictionIds: ["CON-002"],
    relatedSignalIds: ["SIG-002", "SIG-008", "SIG-011"],
    clusterIds: ["CLU-002", "CLU-003"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: [],
    tags: ["malls", "lifestyle-ecosystem", "dwell-time", "mixed-use", "third-places"],
    humanNotes:
      "Three independent source types point the same way. The open question is depth: how much anchor space has actually been leased versus announced. Waiting for leasing data before considering validation.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "human_reviewed",
    createdAt: "2025-12-02T13:00:00.000Z",
    updatedAt: "2026-02-18T10:25:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-008 — specialty coffee as third places
  // ---------------------------------------------------------------------------
  {
    id: "SIG-008",
    title: "Riyadh and Jeddah coffee houses are becoming young people's gathering places",
    description:
      "Structured field visits in Riyadh and Jeddah found specialty coffee houses working as community venues. They are full from evening past midnight with study groups, book clubs, small-business meetings and informal majlis-style gatherings. Operators encourage this. They programme events, hold tables for regular groups, and accept long stays that pure food-and-drink economics would not.",
    dateObserved: "2025-10-19",
    eventDate: null,
    sourceIds: ["SRC-012", "SRC-008"],
    observationId: "OBS-005",
    region: "Saudi Arabia",
    country: "Saudi Arabia",
    city: "Riyadh / Jeddah",
    sectors: ["food_beverage_third_places", "culture_arts_heritage"],
    subsector: "specialty coffee / third places",
    actorTypes: ["sme", "consumer", "community", "creator"],
    primaryActor: "Independent specialty coffee houses (demo)",
    typeOfChange: ["behavioural", "cultural"],
    systemsAffected: ["community", "urban", "consumption", "identity"],
    signalStrength: "established",
    scores: {
      novelty: 3,
      momentum: 4,
      evidence: 3,
      strategicRelevance: 4,
      behaviouralImpact: 4,
      emotionalImpact: 4,
      structuralImpact: 3,
      crossSectorRelevance: 4,
      geographicRelevance: 3,
    },
    timeHorizon: "immediate",
    confidence: "medium",
    whyItMatters:
      "Young Saudis are building their own gathering places before the state or developers provide them. The coffee house is where community, taste and ambition are organised. Institutions that want a relationship with young Saudis will find them there first. The majlis tradition is moving into commercial venues, so hosting community is becoming a business.",
    zoom: {
      whatHappened:
        "Across six structured observation visits in October 2025, specialty coffee houses in Riyadh and Jeddah were at or near capacity from 20:00 past midnight. They hosted recurring study groups, book clubs and business meetings. Several operators programmed events and reserved space for repeat groups.",
      behaviourChanged:
        "Young Saudis treat coffee houses as their default meeting place. Gatherings are scheduled, recurring and group-based, not incidental. Operators optimise for keeping communities, not turning tables.",
      systemChanged:
        "Community life is moving into commercial venues. Functions once held by the family majlis, the university and the mosque courtyard now partly happen in independent coffee houses. Small operators have become custodians of youth social life, and the urban evening has a new anchor.",
      futurePlausible:
        "If this continues, coffee houses and similar venues could become a recognised urban asset class in Saudi cities — programmed, invested in and courted by developers and cultural bodies — with venue communities becoming the channel for reaching the young, from books to banking.",
      futureIsSpeculative: true,
    },
    systems: {
      firstOrderEffect:
        "Independent venues capture long-dwell evening custom and build loyal recurring communities.",
      secondOrderEffect:
        "Developers and mall operators begin courting specialty operators as community anchors; cultural bodies route programming through venues that already hold audiences.",
      thirdOrderEffect:
        "Youth social capital concentrates in commercially owned space, raising questions about affordability, inclusivity and what happens to community when leases end.",
      reinforcingLoops: [
        "Recurring groups make venues feel alive, attracting more groups and enabling programming, which deepens attachment.",
      ],
      balancingLoops: [
        "Rising rents in successful coffee districts squeeze the independent operators that created the value, pushing communities to cheaper districts.",
      ],
    },
    potentialImplications: [
      "Coffee houses become the most trusted physical channel for reaching young Saudis, worth more than mall advertising.",
      "Developers will try to build gathering places into masterplans; authenticity becomes the scarce ingredient.",
      "The evening and night economy gains an anchor that fits local norms and does not depend on entertainment venues.",
    ],
    assumptions: [
      "The venues observed represent a broad movement, not a few exceptional districts.",
    ],
    openQuestions: [
      "Does the pattern hold through Ramadan and summer heat, or is it seasonal?",
      "Do women-led and mixed groups have the same access in every city, or is the pattern segmented?",
    ],
    contradictionIds: ["CON-001"],
    relatedSignalIds: ["SIG-001", "SIG-004", "SIG-007"],
    clusterIds: ["CLU-001", "CLU-002"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: [],
    tags: ["third-places", "specialty-coffee", "youth", "community-infrastructure", "majlis"],
    humanNotes:
      "Promoted from OBS-005. The field evidence is small — six visits — and the producer interview supports the community reading. Operator revenue data or a survey question on gathering habits would strengthen it.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "human_reviewed",
    createdAt: "2025-10-19T09:35:00.000Z",
    updatedAt: "2026-01-12T08:50:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-009 — BNPL adoption and regulatory attention
  // ---------------------------------------------------------------------------
  {
    id: "SIG-009",
    title: "Young Gulf consumers are using buy-now-pay-later more, and regulators are responding",
    description:
      "Survey data shows Gulf 18–30s using buy-now-pay-later as a habit, with a growing minority juggling several plans at once. Equity research maps rapid volume growth at regional providers. At the same time, central-bank commentary points to tighter licensing and affordability rules. Use and regulation are accelerating together.",
    dateObserved: "2026-04-14",
    eventDate: "2026-04-02",
    sourceIds: ["SRC-011", "SRC-013"],
    observationId: "OBS-006",
    region: "GCC",
    country: "Saudi Arabia",
    city: null,
    sectors: ["finance_banking_investment", "retail_commerce"],
    subsector: "consumer credit / BNPL",
    actorTypes: ["startup", "consumer", "government"],
    primaryActor: "Regional BNPL providers and central-bank regulators (demo)",
    typeOfChange: ["economic", "behavioural", "regulatory"],
    systemsAffected: ["finance", "consumption", "trust"],
    signalStrength: "established",
    scores: {
      novelty: 2,
      momentum: 4,
      evidence: 3,
      strategicRelevance: 4,
      behaviouralImpact: 4,
      emotionalImpact: 2,
      structuralImpact: 3,
      crossSectorRelevance: 4,
      geographicRelevance: 4,
    },
    timeHorizon: "near_term",
    confidence: "medium",
    whyItMatters:
      "Young Gulf consumers are forming their first credit relationship at the checkout, outside the banking system. Whoever wins the licence to run that instalment layer — banks, fintechs or retailers — controls the entry point to every later financial product for this generation.",
    zoom: {
      whatHappened:
        "In April 2026, the quarterly GCC youth survey reported that most Saudi 18–30 respondents use buy-now-pay-later monthly, with a rising share holding three or more plans at once. Investment-bank research recorded provider volume growth. Central-bank commentary signalled tighter licensing and affordability requirements.",
      behaviourChanged:
        "Young consumers now default to instalments for mid-sized purchases. They manage cash flow through several overlapping plans instead of cards or savings. Continuous, app-managed micro-debt has become ordinary financial behaviour.",
      systemChanged:
        "Consumer credit is moving from regulated bank products to finance embedded at the checkout. Regulators are extending the licensing perimeter to cover it. Banks face partnering with, or buying, the fintechs that now sit between them and their future customers.",
      futurePlausible:
        "If this continues, a regulated instalment layer becomes the default credit system for Gulf youth — with repayment data feeding credit scores, and the first fully licensed providers converting checkout relationships into full banking ones.",
      futureIsSpeculative: false,
    },
    systems: null,
    potentialImplications: [
      "Banks that ignore instalment finance may only ever see their next generation of customers in a competitor's data.",
      "Licensing will consolidate the sector quickly; providers with scale and compliance capacity will survive.",
      "Retailers gain bargaining power because credit now starts at their checkout.",
    ],
    assumptions: [
      "Regulators formalise the model rather than banning it.",
      "The survey's finding on stacked plans is directionally right despite the digital panel's skew.",
    ],
    openQuestions: [
      "How many missed payments hide across stacked plans that no single provider can see?",
    ],
    contradictionIds: [],
    relatedSignalIds: ["SIG-006"],
    clusterIds: [],
    patternIds: ["PAT-002"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: [],
    tags: ["bnpl", "youth-finance", "consumer-credit", "regulation", "fintech"],
    humanNotes:
      "Promoted from OBS-006. The trust dimension links it to PAT-002: regulation here institutionalises trust in automated credit. The regulatory side needs central-bank documents, not reported commentary, to firm up.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "needs_human_review",
    createdAt: "2026-04-14T12:10:00.000Z",
    updatedAt: "2026-05-05T09:30:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-010 — metro and mobility expansion changing daily behaviour
  // ---------------------------------------------------------------------------
  {
    id: "SIG-010",
    title: "The Riyadh Metro and Dubai transit are changing daily routines",
    description:
      "Riyadh Metro ridership keeps building in its second year of full operation. Academic studies record routine commuter use, rental premiums near stations and changed evening travel. Dubai's growing metro, bus and micro-mobility network shows the same pattern. In specific corridors, the car-first daily routine is visibly loosening.",
    dateObserved: "2025-08-26",
    eventDate: "2025-08-15",
    sourceIds: ["SRC-010", "SRC-004", "SRC-015"],
    observationId: null,
    region: "GCC",
    country: "Saudi Arabia",
    city: "Riyadh",
    sectors: ["mobility_transport", "real_estate_urban"],
    subsector: "public transit adoption",
    actorTypes: ["government", "consumer", "developer"],
    primaryActor: "City transport authorities (demo)",
    typeOfChange: ["infrastructural", "behavioural"],
    systemsAffected: ["mobility", "urban", "housing"],
    signalStrength: "established",
    scores: {
      novelty: 3,
      momentum: 5,
      evidence: 4,
      strategicRelevance: 4,
      behaviouralImpact: 5,
      emotionalImpact: 3,
      structuralImpact: 5,
      crossSectorRelevance: 4,
      geographicRelevance: 3,
    },
    timeHorizon: "immediate",
    confidence: "high",
    whyItMatters:
      "Transit is the Gulf's biggest behavioural experiment. It changes where families live, how commuters spend travel time (see the Arabic-audio signal), what districts are worth, and who meets whom in public. A generation of Riyadh residents is forming daily habits no previous generation had.",
    zoom: {
      whatHappened:
        "Academic ridership studies and press reports through late 2025 recorded sustained growth in routine commuting on the Riyadh Metro. Rents rose near key stations, and searches for station-adjacent housing increased. Dubai reported parallel growth in metro and micro-mobility use.",
      behaviourChanged:
        "Commuters in served corridors plan their day around timetables instead of traffic. They choose homes near stations, use the commute for audio and reading, and make car-free evening trips that previously did not happen.",
      systemChanged:
        "Daily life in Riyadh and Dubai is starting to detach from total car dependence. Land near stations is gaining value over land with road frontage. Housing is acquiring a transit-oriented logic that planners can now steer.",
      futurePlausible:
        "If this continues, Riyadh and Dubai develop genuinely transit-oriented districts by 2030 — denser, more walkable, more social — with street retail, gathering places and weaker parking economics compounding into a different everyday city.",
      futureIsSpeculative: false,
    },
    systems: {
      firstOrderEffect:
        "Commuters shift trips to metro corridors; station-adjacent housing and retail gain value.",
      secondOrderEffect:
        "Developers reorient pipelines to transit-oriented formats; parking economics weaken (see OBS-015); street-level retail and third places thicken around stations.",
      thirdOrderEffect:
        "Public space becomes a site of routine social mixing across class and nationality, gradually shifting norms about who shares the city and how belonging is practised.",
      reinforcingLoops: [
        "Ridership justifies network extensions, which expand the transit-served population, which raises ridership.",
        "Station-district vibrancy attracts residents who choose car-light lives, deepening demand for local amenities.",
      ],
      balancingLoops: [
        "Summer heat caps walkable last-mile journeys without shaded design investment, limiting adoption in exposed districts.",
        "Station-district rent premiums can price out the young riders who drive adoption.",
      ],
    },
    potentialImplications: [
      "Land and retail strategies must price locations by station catchments, not highway visibility.",
      "The commute becomes a daily window of captive attention for media and services (see the Arabic-audio signal).",
      "Shade and comfortable walking routes to stations become infrastructure that cities compete on.",
    ],
    assumptions: [
      "Ridership keeps growing after the novelty fades and holds across seasons.",
    ],
    openQuestions: [
      "Does metro use hold through full summers, or do riders return to cars from June to September?",
    ],
    contradictionIds: ["CON-003"],
    relatedSignalIds: ["SIG-003", "SIG-005"],
    clusterIds: ["CLU-003"],
    patternIds: [],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: ["IND-003"],
    tags: ["riyadh-metro", "transit", "urban-behaviour", "transit-oriented-development", "commuting"],
    humanNotes:
      "The academic source (SRC-010) is the strongest in the dataset. Validated on independent ridership research plus press and search-trend corroboration. Summer resilience is the key monitoring question; indicator IND-003 tracks it.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "validated",
    createdAt: "2025-08-26T08:00:00.000Z",
    updatedAt: "2026-04-02T10:45:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-011 — wellness-branded residences at premium (AI-suggested, weak evidence)
  // ---------------------------------------------------------------------------
  {
    id: "SIG-011",
    title: "Developers claim wellness-branded homes sell at large premiums",
    description:
      "Developers and operators claim wellness-branded residential towers in Dubai are selling at double-digit premiums over similar unbranded buildings. The towers offer circadian lighting, certified air and water, in-building clinics and longevity programmes. Search interest in wellness residences is rising. No independent analysis of transactions yet supports the premium.",
    dateObserved: "2026-05-22",
    eventDate: "2026-05-10",
    sourceIds: ["SRC-009", "SRC-015"],
    observationId: null,
    region: "UAE",
    country: "UAE",
    city: "Dubai",
    sectors: ["real_estate_urban", "health_wellness_longevity"],
    subsector: "branded residences",
    actorTypes: ["developer", "brand", "investor", "consumer"],
    primaryActor: "Developers licensing wellness brands for residential towers (demo)",
    typeOfChange: ["economic", "cultural"],
    systemsAffected: ["housing", "luxury", "consumption", "healthcare"],
    signalStrength: "weak",
    scores: {
      novelty: 5,
      momentum: 3,
      evidence: 2,
      strategicRelevance: 4,
      behaviouralImpact: 2,
      emotionalImpact: 3,
      structuralImpact: 2,
      crossSectorRelevance: 4,
      geographicRelevance: 3,
    },
    timeHorizon: "near_term",
    confidence: "low",
    whyItMatters:
      "If the premium is real, buyers are starting to pay more for health features than for brand-name glamour. That would change what luxury housing means as families settle in the Gulf. If it is not real, this is a developer sales story looking for buyers. Either answer is useful.",
    zoom: {
      whatHappened:
        "In the first half of 2026, at least two Dubai developers announced wellness-branded residential towers with clinics and health certifications, claiming sales premiums over similar buildings. Search-trend data shows rising interest in wellness-residence terms. No independent transaction analysis has been published.",
      behaviourChanged:
        "Some buyers appear to choose homes for health features — clinics, air quality, health programming — rather than location and brand prestige alone. They treat the home as a preventative-health product.",
      systemChanged:
        "If the claims hold, premium housing and healthcare are starting to fuse. Homes would absorb clinical services and certification regimes, and 'healthy building' would move from marketing language to a priced attribute.",
      futurePlausible:
        "If this continues and independent data confirms the premium, wellness certification could become a standard part of Gulf home valuation within five years — though this rests on weak evidence and should be read as a possibility, not a probability.",
      futureIsSpeculative: true,
    },
    systems: {
      firstOrderEffect:
        "Developers attach wellness brands and clinical features to differentiate premium launches in a crowded market.",
      secondOrderEffect:
        "Certification bodies and clinical operators gain a residential revenue stream; comparable unbranded stock faces narrative pressure to retrofit.",
      thirdOrderEffect:
        "Health-stratified housing emerges — homes as preventative-health platforms for those who can pay — sharpening equity questions in the housing system.",
      reinforcingLoops: [
        "Premium claims attract media and buyer attention, encouraging more wellness-branded launches, reinforcing the category's visibility.",
      ],
      balancingLoops: [
        "If resale values fail to hold the premium, investor demand evaporates and the category deflates quickly.",
      ],
    },
    potentialImplications: [
      "Valuers and mortgage lenders may need verified wellness certification instead of accepting brand claims.",
      "Hotel-clinic operators (see SIG-002) could license their services into homes, extending one trust system into another.",
    ],
    assumptions: [
      "The claimed premiums have some basis in actual sales, not just promotion.",
    ],
    openQuestions: [
      "Do resales — not launch prices — show any wellness premium?",
      "Are the buyers residents who will live there, or investors betting on the story?",
    ],
    contradictionIds: ["CON-002"],
    relatedSignalIds: ["SIG-002", "SIG-003", "SIG-007"],
    clusterIds: ["CLU-002", "CLU-003"],
    patternIds: [],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: ["IND-006"],
    tags: ["wellness-real-estate", "branded-residences", "premiumisation", "healthy-buildings"],
    humanNotes: "",
    aiNotes:
      "Drafted by AI from two low-independence sources (operator PR and search trends). The premium claim originates entirely from parties selling the product; search interest confirms attention, not transactions. Flagged as a watch item because it sits at the intersection of three stronger signals (SIG-002, SIG-003, SIG-007) — if the settlement and wellness dynamics are real, this is where they would monetise first. Recommend human review and a request for resale transaction data before any promotion of confidence.",
    aiNotesLabel: "ai_inference",
    reviewStatus: "ai_suggested",
    createdAt: "2026-05-22T14:05:00.000Z",
    updatedAt: "2026-05-22T14:05:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // SIG-012 — regional creators over global celebrities
  // ---------------------------------------------------------------------------
  {
    id: "SIG-012",
    title: "Regional creators are replacing global celebrities in Gulf brand campaigns",
    description:
      "Luxury, beauty and lifestyle brands in the Gulf are recasting campaigns around regional creators — Gulf-dialect voices with engaged local followings — in roles once reserved for global celebrities. The creator panel shows sustained growth in paid partnerships for regional names. Culture-magazine coverage documents the casting shift. Desk notes record agency briefs explicitly asking for 'regional credibility' over global reach.",
    dateObserved: "2026-06-08",
    eventDate: "2026-05-30",
    sourceIds: ["SRC-006", "SRC-005", "SRC-016"],
    observationId: null,
    region: "GCC",
    country: "UAE",
    city: "Dubai",
    sectors: ["media_entertainment_creator", "fashion_luxury"],
    subsector: "brand partnerships / casting",
    actorTypes: ["brand", "creator", "platform", "consumer"],
    primaryActor: "Luxury and beauty brands commissioning regional creators (demo)",
    typeOfChange: ["cultural", "economic"],
    systemsAffected: ["media", "luxury", "identity", "attention", "creativity"],
    signalStrength: "emerging",
    scores: {
      novelty: 4,
      momentum: 4,
      evidence: 3,
      strategicRelevance: 4,
      behaviouralImpact: 3,
      emotionalImpact: 4,
      structuralImpact: 3,
      crossSectorRelevance: 4,
      geographicRelevance: 4,
    },
    timeHorizon: "near_term",
    confidence: "medium",
    whyItMatters:
      "For brands in the Gulf, local voices may be becoming more valuable than global celebrity names. Sharing the audience's dialect and daily life now persuades more than fame. This reverses the old playbook: the Gulf is no longer a place to translate global campaigns, but a place where credibility must be earned locally or bought from those who hold it.",
    zoom: {
      whatHappened:
        "Through spring 2026, Gulf brand campaigns visibly recast regional creators in lead roles. The tracked creator panel recorded sustained growth in paid partnerships for Gulf-based names. Culture-press coverage documented luxury and beauty campaigns fronted by regional faces where global ambassadors previously appeared.",
      behaviourChanged:
        "Audiences respond more to voices that share their dialect, references and daily context, and brands now budget for that. Engagement with regional creators' brand content makes imported celebrity endorsement look expensive and flat.",
      systemChanged:
        "The business of influence is moving into regional hands. Casting, talent management and campaign production are shifting to Gulf-based players. That builds a creator economy which keeps cultural and commercial authority inside the region.",
      futurePlausible:
        "If this continues, global brands will need to co-create with regional creators to enter the Gulf market — and the strongest creators will grow into media businesses and brand owners competing with the multinationals that once hired them.",
      futureIsSpeculative: true,
    },
    systems: null,
    potentialImplications: [
      "Talent management for regional creators becomes a strategic regional industry, not an agency afterthought.",
      "Translated global campaigns will underperform; brands will need a budget line for regional creative leadership.",
      "Regional creators build name value they can turn into their own product lines (see SIG-001's label cohort).",
    ],
    assumptions: [
      "Regional creators keep their engagement advantage even as their fees rise towards celebrity levels.",
    ],
    openQuestions: [
      "Do regional creators stay credible once they front many brands at once?",
    ],
    contradictionIds: ["CON-002"],
    relatedSignalIds: ["SIG-001", "SIG-004", "SIG-005"],
    clusterIds: ["CLU-001"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: [],
    tags: ["creator-economy", "brand-campaigns", "regional-credibility", "casting", "luxury"],
    humanNotes:
      "The panel and culture-press sources overlap with SIG-001's evidence base. Treat the two signals as separate behaviours (wearing versus casting) but count their partly shared sources carefully at cluster level.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "human_reviewed",
    createdAt: "2026-06-08T09:50:00.000Z",
    updatedAt: "2026-06-30T11:15:00.000Z",
  },
];
