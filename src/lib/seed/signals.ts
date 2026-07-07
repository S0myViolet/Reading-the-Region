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
    title: "Regional menswear labels are re-cutting Gulf heritage garments for contemporary wardrobes",
    description:
      "A cohort of independent menswear labels in Dubai and Riyadh is releasing thobes, bishts and sirwal re-worked in technical fabrics, slimmer silhouettes and streetwear styling, sold direct-to-consumer and through regional concept stores. The pieces are positioned as daily wear for young Gulf men, priced between streetwear and entry luxury, and are selling through quickly on small drops.",
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
      "Heritage dress is moving from ceremonial category to living design language. When identity garments become everyday fashion, regional identity becomes a commercial design input — and the reference point for aspiration starts shifting from imported luxury to regional authorship.",
    zoom: {
      whatHappened:
        "Between September and December 2025, at least four independent menswear labels in Dubai and Riyadh released collections re-cutting the thobe, bisht and sirwal in technical fabrics and contemporary silhouettes, stocked through regional concept stores and direct-to-consumer channels; several drops sold out within days.",
      behaviourChanged:
        "Young Gulf men are wearing heritage-derived pieces in everyday, mixed settings — offices, coffee houses, travel — rather than reserving national dress for formal occasions, and are choosing regional labels over imported streetwear for identity-signalling purchases.",
      systemChanged:
        "The cultural-production and luxury systems are absorbing regional identity as a design input: buyers at concept stores are allocating shelf space to Gulf labels, stylists are mixing heritage cuts into editorial work, and 'regional' is becoming a premium claim rather than a craft niche.",
      futurePlausible:
        "If this continues, a recognisable contemporary Gulf design language could consolidate into an export category within five years — with regional labels competing for the identity-wardrobe spend that global luxury houses currently capture during Ramadan and Eid seasons.",
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
      "Regional concept retail becomes the gatekeeper channel for youth luxury spend, shifting negotiating power away from global-brand flagships.",
      "Luxury mall operators may need Gulf-designer space as an anchor of cultural credibility, not a token corner.",
      "Heritage-garment tailoring skills become a contested talent pool as labels scale.",
    ],
    assumptions: [
      "Sell-through reported by creators reflects genuine consumer demand rather than deliberately scarce drop sizes.",
      "The behaviour extends beyond a Dubai–Riyadh creative circle to broader middle-class youth.",
    ],
    openQuestions: [
      "Do repeat purchase rates hold once novelty fades, or is this a single-wardrobe-moment phenomenon?",
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
      "Promoted from OBS-001. Discovery came from the TikTok panel (low credibility) but the culture magazine's independent profiles of two labels lifted evidence to 3. Watch for a third independent source — retail sales data would move this to validated.",
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
    title: "Gulf hotels are adding longevity clinics and clinical diagnostics to their properties",
    description:
      "Hotel and resort operators in Dubai and Riyadh are installing physician-led longevity clinics — diagnostic screening, biomarker panels, supervised programmes — as permanent facilities inside properties, sold as multi-day packages. At least three operator announcements since November 2025, with trade coverage reporting further operators scoping clinical partners.",
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
      "Hospitality is acquiring clinical infrastructure — a different regulatory, talent and trust proposition from spa wellness. If the Gulf captures fly-in longevity demand, hotels become health institutions with beds, and the tourism product shifts from days-of-stay to years-of-life.",
    zoom: {
      whatHappened:
        "Between November 2025 and February 2026, three Gulf hotel operators announced permanent physician-led longevity clinics inside flagship properties in Dubai and Riyadh, offering diagnostic screening and multi-day medical programmes; trade press reports further operators in clinical-partner negotiations.",
      behaviourChanged:
        "Affluent guests are booking hotel stays around diagnostics and supervised health programmes rather than leisure alone, and operators are re-training staff and re-purposing floor space from spa treatments to clinical delivery.",
      systemChanged:
        "The tourism and healthcare systems are converging: hospitality assets are entering regulated clinical territory, competing for physicians and health licences, while health spending migrates into leisure venues — a structural blend rather than a packaging exercise.",
      futurePlausible:
        "If this continues, the Gulf could position itself within five years as a scheduled-diagnostics destination for South Asia, Africa and Europe — with hotel-clinics competing on verified clinical outcomes rather than amenity lists, and repeat health visits replacing one-off leisure trips.",
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
      "Hotel valuation models start pricing clinical capability and health-licence portfolios alongside beds and F&B.",
      "A trust hierarchy emerges between physician-led clinics and cosmetic 'longevity-washing', requiring third-party verification.",
      "Medical-tourism authorities gain a new asset class to regulate and market.",
    ],
    assumptions: [
      "Announced clinics will actually open with clinical staffing rather than remaining rebranded spas.",
    ],
    openQuestions: [
      "Which regulator owns a clinic inside a hotel — tourism or health — and how quickly can licensing adapt?",
      "Is demand primarily international fly-in or resident repeat-use?",
    ],
    contradictionIds: ["CON-003"],
    relatedSignalIds: ["SIG-007", "SIG-011"],
    clusterIds: ["CLU-002"],
    patternIds: ["PAT-002"],
    driverIds: ["DRV-001", "DRV-002"],
    monitoringIndicatorIds: [],
    tags: ["longevity", "hotel-clinics", "diagnostics", "medical-tourism", "wellness"],
    humanNotes:
      "Promoted from OBS-002; OBS-010 (duplicate) folded in as momentum evidence. Evidence held at 3 because two of three sources are operator PR — the consulting outlook is the only independent corroboration. Needs an opening, not an announcement, to move up.",
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
    title: "Families are relocating to Dubai on long-term golden visas, driving schooling and family-housing demand",
    description:
      "Households — not individual workers — are relocating to Dubai on 10-year golden visas, producing measurable pressure on school places in family districts, longer tenancy negotiations, and rising demand for three-bedroom stock. Policy data, newspaper reporting and consulting survey work all point in the same direction: relocation decisions are being made on a settlement horizon.",
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
      "The unit of migration is shifting from the rotating worker to the settling family. Nearly every consumer institution in the Gulf — developers, schools, banks, retailers, healthcare — was built for a transient population; a settlement population invalidates core assumptions in all of them.",
    zoom: {
      whatHappened:
        "Through autumn 2025, Dubai school groups reported lengthening waiting lists in family districts, agents reported rising three-bedroom renewals and longer requested tenancies, and official policy data showed sustained growth in 10-year visa issuance to families rather than single applicants.",
      behaviourChanged:
        "Relocating households are making settlement-horizon commitments: multi-year school enrolment, longer leases or purchases, and moving ageing parents — decisions a two-year-contract expatriate model does not produce.",
      systemChanged:
        "The migration system is being re-architected from labour rotation to population settlement, pulling the housing, education and family systems with it: demand shifts from studios and flats near business districts to family stock near schools, and institutions face customers with decade-long time horizons.",
      futurePlausible:
        "If this continues, Dubai's core consumer economy reorganises around permanence within a decade — multigenerational households, alumni networks of local schools, retirement decisions made in the Gulf — and other GCC states compete on the same terms rather than on salary packages alone.",
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
      "Residential pipelines weighted to studio/one-bed investor stock face a structural mismatch with settlement demand.",
      "Education groups become strategic infrastructure players, with waiting lists acting as a leading indicator for district growth.",
      "Financial institutions can underwrite decade-horizon products (mortgages, education savings, retirement) for a population they previously treated as transient.",
    ],
    assumptions: [
      "Visa policy remains stable or continues to liberalise rather than tightening after an economic shock.",
      "Families granted long-term residency behave long-term — the paperwork horizon translates into behavioural commitment.",
    ],
    openQuestions: [
      "What share of golden-visa holders bring school-age children versus using the visa as an option-to-settle?",
      "Does settlement extend to retirement in place, or do families still exit at the end of working life?",
    ],
    contradictionIds: ["CON-003"],
    relatedSignalIds: ["SIG-010", "SIG-011"],
    clusterIds: ["CLU-003"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: ["IND-001"],
    tags: ["golden-visa", "settlement", "family-housing", "schools", "permanence"],
    humanNotes:
      "Strongest signal on the board: policy data, independent reporting and survey work converge. Anchor evidence for cluster CLU-003 and the Permanent Gulf territory. Keep separating issuance data (strong) from belonging claims (weak).",
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
    title: "Saudi cultural investment is converting into measurable creative-economy employment",
    description:
      "State-backed cultural seasons, commissions and festival programmes in Saudi Arabia are now producing a visible creative labour market: production companies scaling headcount, recurring commissioning calendars, and salary competition for experienced Saudi producers and technical crafts. The spend has moved from event-buying to institution-building — training programmes, venues, year-round commissioning bodies.",
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
      "Vision 2030's cultural spending is crossing the line from spectacle to labour market. A creative economy with career paths changes who young Saudis can become — and gives regional brands, media and tourism a domestic production base instead of an imported one.",
    zoom: {
      whatHappened:
        "Through 2025, Saudi cultural seasons and commissions published recurring year-round programming calendars, cultural bodies expanded training schemes, and interview and press evidence recorded production companies hiring at scale, with salary competition for experienced Saudi creative and technical staff.",
      behaviourChanged:
        "Young Saudis are choosing creative-sector employment as a credible career rather than a hobby or exile path, and production firms are structuring permanent teams around a dependable commissioning pipeline instead of staffing per event.",
      systemChanged:
        "The cultural-production system is being industrialised by the state: culture is planned, budgeted and measured as an economic sector, which rewires the labour system (new occupations, Saudisation pressure in creative roles) and the governance system (culture as delivery portfolio, not heritage custody).",
      futurePlausible:
        "If this continues, Saudi Arabia could hold the Gulf's deepest creative labour pool by 2030, exporting production capacity across the region — provided commissioning survives budget cycles and the training bottleneck in technical crafts is closed.",
      futureIsSpeculative: false,
    },
    systems: null,
    potentialImplications: [
      "Regional brands and platforms gain a Saudi production base, reducing dependence on Beirut, Cairo and London supply chains.",
      "Creative-labour costs rise as state demand competes with the private sector for the same limited talent pool.",
      "Cultural authorship becomes a national capability question, tying creative careers to Saudisation policy.",
    ],
    assumptions: [
      "State cultural budgets persist at scale through oil-price cycles rather than being the first discretionary cut.",
    ],
    openQuestions: [
      "How much of the new employment is durable institutional capacity versus event-cycle contracting?",
      "Can training pipelines close the technical-crafts bottleneck flagged in interview evidence (see OBS-014)?",
    ],
    contradictionIds: [],
    relatedSignalIds: ["SIG-001", "SIG-008", "SIG-012"],
    clusterIds: ["CLU-001"],
    patternIds: [],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: ["IND-002"],
    tags: ["vision-2030", "creative-economy", "cultural-investment", "saudisation", "labour-market"],
    humanNotes:
      "Event-calendar and PR sources carry gulf_boosterism; weight rests on the producer interview and newspaper corroboration. The unreviewed Saudisation observation (OBS-014) is a candidate extension on the labour dimension.",
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
      "Platform listening data shows sustained growth in Arabic-language podcast hours in Saudi Arabia and the UAE, concentrated in weekday morning and evening windows that map onto commuting. Interview-format shows in Gulf dialects dominate the top charts, and advertisers are shifting brand budgets into host-read Arabic formats.",
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
      "A daily Arabic-language attention window is forming in the commute — long-form, host-trusted, dialect-native. That is a different persuasion environment from social video, and it is being colonised by regional voices rather than translated global content.",
    zoom: {
      whatHappened:
        "Platform data published in early 2026 showed double-digit year-on-year growth in Arabic podcast listening hours in KSA and the UAE, with weekday peaks at 07:00–09:00 and 17:00–19:00 and Gulf-dialect interview shows holding most top-chart positions.",
      behaviourChanged:
        "Commuters are defaulting to long-form Arabic audio in the car and on new metro journeys — replacing music radio and English-language content with regional hosts they follow personally, episode after episode.",
      systemChanged:
        "The media and attention systems are re-localising: a daily long-form attention slot is shifting from broadcast radio and global platforms to regional creator networks, moving advertising money, talent and editorial agenda-setting into Arabic-first hands.",
      futurePlausible:
        "If this continues, Gulf-dialect audio could become the primary daily media layer for young professionals — making podcast hosts the region's trusted explainers and giving brands and institutions a native channel that bypasses both legacy media and Western platforms' editorial norms.",
      futureIsSpeculative: true,
    },
    systems: null,
    potentialImplications: [
      "Host-read Arabic audio becomes a premium trust channel for banks, developers and government communicators.",
      "Metro expansion multiplies hands-free listening minutes, coupling media habits to transport infrastructure.",
    ],
    assumptions: [
      "Platform-reported growth reflects genuine listener behaviour rather than selective disclosure by a party with a growth story to tell.",
    ],
    openQuestions: [
      "How concentrated is listening across a handful of hit shows — is this a creator economy or a two-show phenomenon?",
    ],
    contradictionIds: [],
    relatedSignalIds: ["SIG-010", "SIG-012"],
    clusterIds: ["CLU-001"],
    patternIds: [],
    driverIds: [],
    monitoringIndicatorIds: [],
    tags: ["arabic-audio", "podcasts", "commuting", "attention", "creator-economy"],
    humanNotes:
      "Single platform-data source plus desk memo; the platform has an interest in the growth narrative. Held at evidence 3 pending an independent listenership survey.",
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
    title: "AI adoption in Gulf retail banks is triggering customer demand for human verification",
    description:
      "Gulf retail banks are deploying AI assistants and automated credit decisioning at pace, in line with national AI strategies. The counter-signal: equity research and youth survey data both record rising demand for human confirmation of AI-made decisions — more branch appointments, complaints requesting human review, and survey verbatims describing distrust of unexplained automated refusals.",
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
      "Customers are not resisting AI — they are pricing it. The demand is for a human layer on top of automation: confirmation, explanation, accountability. That reframes 'human service' from a cost to be automated away into a product attribute that can be sold, and it will not stay confined to banking.",
    zoom: {
      whatHappened:
        "In Q1 2026, an investment-bank sector note recorded Gulf retail banks' accelerating AI deployment alongside rising branch appointment bookings and complaint volumes requesting human review of automated decisions; the quarterly youth survey logged matching verbatims about unexplained AI refusals.",
      behaviourChanged:
        "Customers accept AI for speed but escalate to humans for stakes: they complete routine tasks with assistants, then book branch time or file complaints to have credit and account decisions confirmed, explained or overturned by a person.",
      systemChanged:
        "The trust system inside finance is bifurcating: transactional trust is transferring to machines while accountability trust remains stubbornly human — forcing banks to re-architect service models around a verification layer rather than a pure automation curve, and drawing regulator attention to explainability.",
      futurePlausible:
        "If this continues, 'a named human confirms this' becomes a chargeable service tier across Gulf banking, insurance and government services — and institutions that automated away their human capacity may find themselves buying it back at premium cost.",
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
      "'Human-verified' service tiers become a designed product line in Gulf retail banking rather than a complaints channel.",
      "Explainability regulation could arrive faster in the Gulf than elsewhere, set by states that are simultaneously AI champions and consumer protectors.",
      "Branch networks get repositioned as trust infrastructure rather than legacy cost.",
    ],
    assumptions: [
      "Verification demand reflects a durable trust preference, not a transition-period discomfort that fades with familiarity.",
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
      "Promoted from OBS-004. The two evidence streams (equity note, survey) share no methodology, which strengthens the pattern; but both are indirect measures of trust. A bank's own escalation data would settle it.",
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
    title: "Regional malls are repositioning as lifestyle ecosystems built around fitness, clinics, co-working and culture",
    description:
      "Mall owners across the UAE and Saudi Arabia are re-letting anchor space from department-store retail to gyms, medical and dental clinics, co-working floors, cultural venues and community programming. Leasing language has shifted from footfall to dwell time and repeat visitation, and operators report membership-style relationships (gym contracts, clinic registrations, desk subscriptions) replacing transaction-only visits.",
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
      "In a climate where the mall is the de facto public realm for much of the year, its repositioning from shopping venue to daily-life infrastructure changes what 'retail' competes on: not transactions but membership in residents' routines. That favours operators who can programme life, not just lease space.",
    zoom: {
      whatHappened:
        "Trade reporting through late 2025, consulting survey data and search-trend movement all recorded regional mall operators converting anchor retail space to fitness, clinical, co-working and cultural uses, with leasing strategies publicly reframed around dwell time and repeat visitation.",
      behaviourChanged:
        "Residents are using malls as routine infrastructure — morning gym sessions, clinic appointments, workdays at co-working floors, evening cultural programming — visiting several times a week for reasons unconnected to shopping.",
      systemChanged:
        "The retail system is merging with urban and community systems: malls are absorbing functions of the high street, the clinic, the office and the civic centre, which shifts their economics from sales-per-square-metre to relationships-per-resident and makes them a planning question, not just an investment one.",
      futurePlausible:
        "If this continues, the Gulf mall becomes the organising node of neighbourhood life within five years — with operators holding membership relationships across health, work and leisure, and pure-retail formats surviving only as tenants inside someone else's ecosystem.",
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
      "Retail leases will increasingly price adjacency to ecosystem anchors (gyms, clinics) rather than to fashion flagships.",
      "Mall operators become gatekeepers for consumer health and wellness distribution in the Gulf.",
      "Community programming budgets shift from marketing line-items to core asset-management functions.",
    ],
    assumptions: [
      "Service-anchor tenants (clinics, gyms, co-working) are financially durable rather than a stop-gap for structurally vacant space.",
    ],
    openQuestions: [
      "Does ecosystem repositioning work in secondary malls, or only in dominant super-regional assets?",
    ],
    contradictionIds: ["CON-002"],
    relatedSignalIds: ["SIG-002", "SIG-008", "SIG-011"],
    clusterIds: ["CLU-002", "CLU-003"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: [],
    tags: ["malls", "lifestyle-ecosystem", "dwell-time", "mixed-use", "third-places"],
    humanNotes:
      "Three independent source types agree on direction. The open question is depth: how much anchor space has actually transacted versus been announced. Awaiting leasing data before considering validation.",
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
    title: "Specialty coffee houses are functioning as third places and youth community infrastructure in Riyadh and Jeddah",
    description:
      "Structured field observation in Riyadh and Jeddah records specialty coffee houses operating as de facto community infrastructure: full from evening to past midnight with study groups, book clubs, small-business meetings and informal majlis-style gatherings. Operators are leaning in — programming events, holding tables for recurring groups, and tolerating long dwell times that pure F&B economics would not.",
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
      "Saudi youth are building social infrastructure ahead of the state and the market: the coffee house is where community, taste and ambition are being organised. Institutions that want a relationship with young Saudis will find them here first — and the majlis instinct is being re-housed in commercial space, which makes belonging a business model.",
    zoom: {
      whatHappened:
        "Across six structured observation visits in October 2025, specialty coffee houses in Riyadh and Jeddah were consistently at or near capacity from 20:00 past midnight, hosting recurring study groups, book clubs and business meetings, with several operators programming events and reserving space for repeat groups.",
      behaviourChanged:
        "Young Saudis are treating coffee houses as default gathering infrastructure — a scheduled, recurring, group behaviour rather than incidental consumption — and operators are optimising for community retention over table turnover.",
      systemChanged:
        "The community system is being rebuilt through commercial third places: functions once held by the family majlis, the university and the mosque courtyard are partially migrating to independent venues, making SME operators custodians of youth social life and giving the urban night a new anchor use.",
      futurePlausible:
        "If this continues, a third-place economy could become a recognised urban asset class in Saudi cities — programmed, invested in and courted by developers and cultural bodies — with venue communities acting as the distribution layer for everything from books to banking products aimed at the young.",
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
      "Coffee houses become the highest-trust physical channel for reaching young Saudis — more valuable than mall media.",
      "Developers will attempt to manufacture third places at masterplan scale; authenticity becomes the scarce input.",
      "The evening and night economy gains a non-entertainment anchor compatible with local norms.",
    ],
    assumptions: [
      "Observed venues are representative of a broader movement rather than a handful of exceptional districts.",
    ],
    openQuestions: [
      "How does the behaviour interact with Ramadan rhythms and summer heat — is it seasonal or structural?",
      "Do women-led and mixed groups have equal access across cities, or is the behaviour segmented?",
    ],
    contradictionIds: ["CON-001"],
    relatedSignalIds: ["SIG-001", "SIG-004", "SIG-007"],
    clusterIds: ["CLU-001", "CLU-002"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: [],
    tags: ["third-places", "specialty-coffee", "youth", "community-infrastructure", "majlis"],
    humanNotes:
      "Promoted from OBS-005. Ethnographic base is small (six visits); producer interview corroborates the community-infrastructure reading. Would benefit from operator revenue-mix data or a survey question on gathering habits.",
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
    title: "BNPL is becoming default youth credit in the Gulf while regulators move towards tighter licensing",
    description:
      "Survey data shows buy-now-pay-later reaching habitual use among Gulf 18–30s, with a growing minority stacking multiple concurrent plans; equity research maps rapid volume growth at regional providers. Simultaneously, central-bank commentary signals tighter licensing and affordability rules. Adoption and regulation are accelerating on the same curve.",
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
      "A generation's first credit relationship is forming outside the banking system, at the checkout. Whoever ends up licensed to own that instalment layer — banks, fintechs, or retailers — owns the on-ramp to every subsequent financial product for Gulf youth.",
    zoom: {
      whatHappened:
        "In April 2026 the quarterly GCC youth survey reported majority monthly BNPL use among Saudi 18–30 respondents with a rising share holding three or more concurrent plans, while investment-bank research recorded provider volume growth and central-bank commentary signalled tighter licensing and affordability requirements.",
      behaviourChanged:
        "Young consumers are defaulting to instalments for mid-ticket purchases and managing personal cash flow through stacked plans rather than cards or savings — normalising continuous, app-managed micro-debt as ordinary financial behaviour.",
      systemChanged:
        "The consumer-finance system is being re-layered: credit issuance is shifting from regulated bank products to embedded checkout finance, forcing regulators to extend the licensing perimeter and pushing banks to partner with or acquire the fintechs intermediating their future customers.",
      futurePlausible:
        "If this continues, a regulated instalment layer becomes the default youth credit architecture in the Gulf — with affordability data from BNPL flows feeding credit scoring, and the first providers to achieve full licences converting checkout relationships into full banking ones.",
      futureIsSpeculative: false,
    },
    systems: null,
    potentialImplications: [
      "Banks that ignore the instalment layer may meet their next generation of customers only as competitors' data.",
      "Regulatory licensing will consolidate the sector quickly; scale and compliance capacity become the moat.",
      "Retailers gain bargaining power as owners of the checkout where credit is now originated.",
    ],
    assumptions: [
      "Regulators tighten rules without banning the model — formalisation, not prohibition.",
      "Survey-reported stacking behaviour is directionally accurate despite the digital-panel skew.",
    ],
    openQuestions: [
      "What default and delinquency rates are hiding in stacked plans that no single provider can see?",
    ],
    contradictionIds: [],
    relatedSignalIds: ["SIG-006"],
    clusterIds: [],
    patternIds: ["PAT-002"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: [],
    tags: ["bnpl", "youth-finance", "consumer-credit", "regulation", "fintech"],
    humanNotes:
      "Promoted from OBS-006. Trust dimension links it to PAT-002: regulation here is the institutionalisation of trust in an automated credit environment. Needs central-bank documentation rather than reported commentary to firm up the regulatory side.",
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
    title: "Riyadh Metro and Dubai mobility expansion are changing daily urban behaviour",
    description:
      "Ridership on the Riyadh Metro continues to build through its second year of full operation, with academic ridership studies recording routine commuter adoption, station-district rental premiums and changed evening travel patterns; Dubai's expanding metro, bus and micro-mobility network shows parallel dynamics. Car-first daily routines are visibly loosening in specific corridors.",
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
      "Transit is the Gulf's biggest behavioural experiment: it restructures where people live, how they spend the commute (see the Arabic-audio signal), what districts are worth, and who encounters whom in public. A generation of Riyadh residents is forming daily habits no previous generation had.",
    zoom: {
      whatHappened:
        "Academic ridership studies and press reporting through late 2025 recorded sustained growth in routine commuter use of the Riyadh Metro, rental premiums forming around key stations, and rising search interest for station-adjacent housing; Dubai reported parallel expansion in metro and micro-mobility usage.",
      behaviourChanged:
        "Commuters in served corridors are structuring daily routines around timetables rather than traffic — choosing housing for station proximity, reclaiming the commute for audio and reading, and making car-free evening trips that previously did not happen.",
      systemChanged:
        "The mobility and urban systems are decoupling daily life from universal car dependence: land value is re-pricing around access rather than road frontage, and the housing system is acquiring a transit-oriented logic that planners can now steer — a structural change in how Gulf cities allocate value.",
      futurePlausible:
        "If this continues, Riyadh and Dubai develop genuinely transit-oriented districts by 2030 — denser, more walkable, more encounter-rich — and the second-order effects (street retail, third places, reduced parking economics) compound into a different everyday urbanism for the Gulf.",
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
      "Land and retail strategies must re-price around station catchments rather than highway visibility.",
      "The commute becomes a daily media and services window with captive attention (links to Arabic audio growth).",
      "Municipal design standards for shade and last-mile comfort become competitive infrastructure.",
    ],
    assumptions: [
      "Ridership growth continues past novelty into entrenched habit across seasons.",
    ],
    openQuestions: [
      "How resilient is adoption through the first full summer cycles — does behaviour revert to cars from June to September?",
    ],
    contradictionIds: ["CON-003"],
    relatedSignalIds: ["SIG-003", "SIG-005"],
    clusterIds: ["CLU-003"],
    patternIds: [],
    driverIds: ["DRV-002"],
    monitoringIndicatorIds: ["IND-003"],
    tags: ["riyadh-metro", "transit", "urban-behaviour", "transit-oriented-development", "commuting"],
    humanNotes:
      "Academic source (SRC-010) is the strongest in the dataset; validated on the strength of independent ridership work plus press and search-trend corroboration. Summer resilience is the key monitoring question — indicator IND-003 tracks it.",
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
    title: "Wellness-branded residences are selling at significant premiums to comparable stock",
    description:
      "Developer and operator announcements claim wellness-branded residential towers in Dubai — circadian lighting, air and water certification, in-building clinics and longevity programming — are selling at double-digit premiums to comparable unbranded stock. Search interest in wellness-residence terms is rising, but no independent transaction analysis yet substantiates the premium.",
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
      "If the premium is real, health is displacing brand-name glamour as the top of the residential value stack — a meaningful re-pricing of what 'luxury housing' means in a settlement-era Gulf. If it is not real, this is developer narrative looking for buyers. Either answer is strategically useful.",
    zoom: {
      whatHappened:
        "In the first half of 2026, at least two Dubai developers announced wellness-branded residential towers with clinical and certification features, claiming sales premiums over comparable stock; search-trend data shows rising interest in wellness-residence terms, with no independent transaction analysis yet published.",
      behaviourChanged:
        "A segment of buyers appears to be selecting homes on health infrastructure — clinics, air quality, programming — rather than location and brand prestige alone, treating the home as a preventative-health product.",
      systemChanged:
        "If corroborated, the housing and healthcare systems are beginning to fuse at the premium end: residential real estate absorbing clinical services and certification regimes, and 'healthy building' shifting from marketing garnish to priced attribute.",
      futurePlausible:
        "If this continues and the premium survives independent verification, wellness certification could become a standard valuation layer in Gulf residential property within five years — pulling insurers, clinical operators and certification bodies into the housing value chain. This projection rests on weak evidence and should be read as a possibility, not a probability.",
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
      "Valuation and mortgage models may need a verified wellness-certification input rather than accepting brand claims.",
      "Hotel-clinic operators (see SIG-002) have a licensing path into residential — one trust system feeding another.",
    ],
    assumptions: [
      "Developer-claimed premiums have some basis in transactions rather than being purely promotional.",
    ],
    openQuestions: [
      "Do resale transactions — not launch prices — show any wellness premium?",
      "Is demand from end-user residents or from investors betting on the narrative?",
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
      "Luxury, beauty and lifestyle brands operating in the Gulf are recasting campaigns around regional creators — Gulf-dialect voices with engaged local followings — in roles previously reserved for global celebrities. The creator panel shows sustained paid-partnership growth for regional names, culture-magazine coverage documents the shift in casting, and desk notes record agency briefs explicitly asking for 'regional credibility' over global reach.",
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
      "Cultural authority in the Gulf is being repriced: proximity and dialect now buy more persuasion than global fame. For global brands this inverts the old playbook — the regional market is no longer where global campaigns are translated, but where credibility must be earned locally or bought from those who hold it.",
    zoom: {
      whatHappened:
        "Through spring 2026, brand campaigns in the Gulf visibly recast regional creators in hero roles: the tracked creator panel recorded sustained growth in paid partnerships for Gulf-based names, and culture-press coverage documented luxury and beauty campaigns fronted by regional faces where global ambassadors previously appeared.",
      behaviourChanged:
        "Consumers are responding to — and brands are budgeting for — voices that share their dialect, references and daily context; audiences engage with regional creators' brand content at rates that make imported celebrity endorsement look expensive and inert.",
      systemChanged:
        "The attention and luxury systems are re-localising their trust hierarchies: the value chain of influence (casting, talent management, campaign production) is shifting into regional hands, building a creator-economy infrastructure that keeps cultural and commercial authority inside the Gulf.",
      futurePlausible:
        "If this continues, the Gulf becomes a market where global brands must co-create with regional cultural authors as a condition of entry — and the strongest regional creators evolve into media businesses and brand owners themselves, competing with the multinationals that once hired them.",
      futureIsSpeculative: true,
    },
    systems: null,
    potentialImplications: [
      "Talent management and creator-economy infrastructure become a strategic regional industry, not an agency afterthought.",
      "Global campaign frameworks with translated assets will underperform; regional creative authority becomes a budget line.",
      "Regional creators accumulate brand equity that can convert into owned product lines (links to SIG-001's label cohort).",
    ],
    assumptions: [
      "Engagement advantages of regional creators persist as their rates rise towards celebrity levels.",
    ],
    openQuestions: [
      "Where is the ceiling — do regional creators retain credibility once they become ubiquitous brand fronts?",
    ],
    contradictionIds: ["CON-002"],
    relatedSignalIds: ["SIG-001", "SIG-004", "SIG-005"],
    clusterIds: ["CLU-001"],
    patternIds: ["PAT-001"],
    driverIds: ["DRV-001"],
    monitoringIndicatorIds: [],
    tags: ["creator-economy", "brand-campaigns", "regional-credibility", "casting", "luxury"],
    humanNotes:
      "Panel and culture-press sources overlap with SIG-001's evidence base — treat the two signals as independent behaviours (wearing vs casting) but partially shared sourcing when counting cluster sources.",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: "human_reviewed",
    createdAt: "2026-06-08T09:50:00.000Z",
    updatedAt: "2026-06-30T11:15:00.000Z",
  },
];
