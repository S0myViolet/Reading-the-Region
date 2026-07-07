/**
 * Demo scenarios for the Permanent Gulf territory. Both are mid-horizon and
 * split on the same axis — whether lengthening residency matures into felt
 * belonging (CON-003). Assumptions are labelled; quality checks are honest.
 */

import type { Scenario } from "../types";

export const seedScenarios: Scenario[] = [
  {
    id: "SCN-001",
    title: "Rooted Futures",
    territoryId: "TER-001",
    horizon: "mid",
    scenarioType: "transformational",
    corePremise:
      "Long-term residency deepens into genuine multigenerational belonging. Policy keeps extending the permanence ladder (renewals become routine, retirement and inheritance frameworks arrive), institutions build for people who stay, and — decisively — residents begin to feel that staying is not just permitted but wanted.",
    whatHasChanged:
      "By the early 2030s, the settled family is the Gulf's default consumer unit. School communities have alumni working in the same city; family districts have a second generation of tenants and owners; transit-oriented neighbourhoods have regulars, not just residents. Institutions have re-platformed: banks sell twenty-year products to visa-backed households as standard, developers compete on community fabric rather than render glamour, and the cultural economy (heritage-contemporary design, Gulf-dialect media, third places) gives the settled population a shared vocabulary of belonging that is regional rather than imported.",
    howPeopleBehave:
      "Families plan in decades: they buy rather than rent where districts feel permanent, invest in local networks, keep ageing parents nearby, and let children build identities anchored in the city they grew up in. The commute, the coffee house, the school gate and the metro line replace the compound and the departure lounge as the geography of daily life. Discretionary spend shifts from exit-oriented saving towards local quality of life.",
    howInstitutionsBehave:
      "Schools operate as multigenerational anchors with alumni economies; hospitals build continuity-of-care around families rather than episodic expatriate patients; municipalities programme public space for residents' rituals — Ramadan nights, weekend sport, cultural seasons. Regulators codify the permanence ladder: renewal certainty, inheritance clarity, retirement residency. Employers stop pricing an exit premium into packages.",
    howBrandsBehave:
      "Brands address residents as citizens-in-behaviour: loyalty is measured in years, campaigns are authored by regional creators in regional vocabularies, and 'we grew up here with you' becomes the most valuable claim in the market. Belonging is the product, and brands that faked it in the 2020s are remembered.",
    keyTechnologies: [
      "Verified digital-identity and residency rails that make renewals, property and schooling administration near-frictionless",
      "Arabic-first AI services (dialect-native assistants, education tools) that make daily institutional life feel locally authored",
      "Transit and mobility networks reaching maturity as the default way second-generation residents move",
    ],
    keyPolicies: [
      "Routine long-term visa renewal with published criteria, extended to retirement residency",
      "Inheritance and end-of-life legal clarity for non-citizen residents",
      "Education-to-employment continuity for children of residents, aligned with Saudisation and Emiratisation frameworks",
    ],
    keyCulturalShifts: [
      "Belonging without citizenship becomes a lived, normalised category with its own etiquette and pride",
      "Regional identity expressed through contemporary design and media becomes the shared culture of settled newcomers, not just nationals",
      "The question 'where are you from?' loses ground to 'how long have you been here?'",
    ],
    winners: [
      "Developers and operators who invested early in family stock, community programming and transit-adjacent formats",
      "Schools and healthcare groups that became trusted multigenerational institutions",
      "Banks holding decade-long household relationships and the data that comes with them",
      "Regional creators, designers and cultural producers who authored the belonging vocabulary",
    ],
    losers: [
      "Investor-stock landlords holding studio pipelines in a family-stock market",
      "Global brands that kept translating campaigns instead of co-creating them",
      "Remittance-era financial products built on the assumption that money always leaves",
    ],
    risks: [
      "Affordability exclusion: belonging priced as premium turns rootedness into a class product and hollows the middle of the settlement market",
      "Political friction: a large, permanent, non-citizen population with rising civic expectations tests governance models built for guests",
    ],
    opportunities: [
      "Multigenerational product lines: education-linked savings, family healthcare continuity, retirement-in-place services",
      "Community fabric as investable infrastructure: programming, third places and civic amenities with measurable retention returns",
      "A regional culture industry exporting the Gulf belonging vocabulary across MENA",
    ],
    earlySigns: [
      "Golden-visa renewal rates published and trending high; family categories dominating new issuance (IND-001)",
      "Second-generation enrolment: children completing full school cycles in one Gulf city",
      "Retirement-in-place and inheritance policy instruments moving from discussion to draft",
      "Transit ridership holding through full summer cycles as habit, not novelty (IND-003)",
    ],
    strategicQuestions: [
      "Which of our products would a family buy in year one of a twenty-year life here — and which would they only buy if they planned to leave?",
      "What is our measurable contribution to belonging (community, continuity, recognition), and could a competitor name theirs faster?",
      "If renewal certainty arrived tomorrow, which decade-horizon product should we launch first?",
    ],
    supportingSignalIds: ["SIG-003", "SIG-010", "SIG-007", "SIG-008"],
    supportingPatternIds: ["PAT-001"],
    supportingDriverIds: ["DRV-002"],
    shapingContradictionIds: ["CON-003", "CON-002"],
    assumptions: [
      {
        text: "Visa and residency policy continues to liberalise or at minimum holds stable through one full economic downturn.",
        label: "hypothesis",
      },
      {
        text: "Felt belonging follows infrastructure: given permanence of services and community, attachment develops within a generation.",
        label: "speculative_possibility",
      },
      {
        text: "States will codify inheritance, retirement and second-generation pathways rather than leaving permanence informal.",
        label: "speculative_possibility",
      },
    ],
    qualityChecks: {
      plausible: true,
      internallyCoherent: true,
      evidenceLinked: true,
      strategicallyRelevant: true,
      differentiated: true,
      notOptimisticFantasy: false,
      notPureDystopia: true,
      connectedToTodaysSignals: true,
      usefulForDecisions: true,
    },
    confidence: "medium",
    reviewStatus: "needs_human_review",
    createdAt: "2026-03-05T10:20:00.000Z",
    updatedAt: "2026-06-26T10:00:00.000Z",
  },
  {
    id: "SCN-002",
    title: "Platform Without Roots",
    territoryId: "TER-001",
    horizon: "mid",
    scenarioType: "conservative",
    corePremise:
      "Residency lengthens but belonging stays shallow. The infrastructure of permanence gets built and used — visas renewed, homes bought, children schooled — yet identity, savings and ultimate plans remain anchored elsewhere. The Gulf becomes the world's best place to hold an option on a life: permanence in paperwork, transience in identity.",
    whatHasChanged:
      "By the early 2030s, long-term visas are unremarkable and the settlement infrastructure is world-class, but the behavioural data tells a quieter story: renewal rates are solid yet exit-contingent, property is bought for optionality and yield as much as home, capital still flows out to passport countries, and second-generation residents describe themselves as from somewhere else. Institutions that built for rootedness find customers using permanence products in transient ways — the twenty-year mortgage refinanced at year seven, the 'forever home' listed when the market peaks, school communities that reset every few years despite longer visas.",
    howPeopleBehave:
      "Families stay longer but keep one foot elsewhere: savings offshore, summers away, university abroad as the default aspiration for children, and a live spreadsheet comparing the Gulf against other bases. Daily life is comfortable and locally embedded; deep commitments — citizenship-equivalent identity, end-of-life plans, philanthropy — happen elsewhere. Community participation is genuine but contractual: memberships, not covenants.",
    howInstitutionsBehave:
      "Institutions bifurcate. Some double down on service excellence for a sophisticated transient-plus population — flexible tenures, portable products, exit-friendly design. Others keep selling belonging language that customers quietly discount, and pay for it in churn. Governments extend residency mechanics but defer the deeper questions (citizenship pathways, second-generation status), which keeps the option-holding equilibrium stable.",
    howBrandsBehave:
      "Brands learn that the resident is loyal to the platform, not the place: convenience, quality and status transfer decide share of wallet, while belonging campaigns underperform their cost. The winning voice is honest about mobility — serving 'your life while you are here' rather than pretending forever.",
    keyTechnologies: [
      "Cross-border wealth, pension and property platforms that make multi-base living administratively trivial",
      "Automated service layers that deliver excellent daily life with minimal human or civic entanglement (see CON-001 — thin trust)",
      "Remote schooling and credential portability that keep children's options global",
    ],
    keyPolicies: [
      "Residency renewal liberalised as mechanics while citizenship and second-generation status stay unresolved",
      "Property and visa products explicitly marketed as optionality (investment-linked residency) rather than settlement",
      "Tax and fee regimes tuned to attract holders of options — competitive, but easily benchmarked and easily left",
    ],
    keyCulturalShifts: [
      "A polished cosmopolitan surface culture with thin local attachment beneath — global formats, translated campaigns, interchangeable districts",
      "Belonging talk becomes marketing wallpaper that residents politely ignore",
      "The second generation grows up globally fluent and locally uncommitted, mirroring their parents' hedged position",
    ],
    winners: [
      "Operators of flexible, portable, service-dense products: serviced living, international schools with global credentials, cross-border banking",
      "Global brands whose value transfers between cities without cultural translation costs",
      "Mobile professionals themselves, who extract world-class quality of life while keeping global options open",
    ],
    losers: [
      "Institutions that over-invested in rootedness economics: community-programming-heavy developments, alumni-dependent schools, twenty-year product books priced for retention that does not come",
      "States, in the long run, if diversification metrics assumed settled-resident spending depth that optionality never delivers",
      "Second-generation residents carrying the personal cost of permanent in-betweenness",
    ],
    risks: [
      "A demand shock (regional or global) triggers synchronized option-exercising — the exit wave reveals how much settlement was contingent",
      "Belonging-washing backlash: residents grow cynical about institutions that market roots while designing for churn",
      "Policy overcorrection: mistaking option-holding for disloyalty and tightening rules, accelerating the very transience it punishes",
    ],
    opportunities: [
      "Design for reversibility as a feature: products that are excellent while you stay and clean when you leave win trust on honest terms",
      "Portability infrastructure (credentials, pensions, healthcare records) as a growth category serving the multi-base life",
      "Institutions that convert even shallow tenure into recurring revenue — memberships, subscriptions, service tiers — outperform ownership-model competitors",
    ],
    earlySigns: [
      "Renewal rates high but resale listings spike at every market peak; wellness-residence premiums fail to hold in resale data (IND-006)",
      "Household capital outflows to passport countries persist despite longer visas",
      "Survey data showing long-tenure residents still describing 'home' as elsewhere",
      "Verification and trust demands met with automation rather than human capacity, keeping institutional relationships thin (IND-005)",
    ],
    strategicQuestions: [
      "Which of our permanence-assuming products still work if the average customer secretly plans in five-year options?",
      "Can we serve optionality honestly — and profitably — instead of selling belonging that we cannot deliver?",
      "What early-warning metric would tell us the exit wave has started before the market prices it?",
    ],
    supportingSignalIds: ["SIG-003", "SIG-002", "SIG-011"],
    supportingPatternIds: ["PAT-002"],
    supportingDriverIds: ["DRV-001", "DRV-002"],
    shapingContradictionIds: ["CON-003", "CON-001"],
    assumptions: [
      {
        text: "Deep-commitment policy questions (citizenship pathways, second-generation status) remain unresolved through the horizon.",
        label: "hypothesis",
      },
      {
        text: "Felt belonging does not automatically follow settlement infrastructure; without recognition, attachment plateaus.",
        label: "speculative_possibility",
      },
    ],
    qualityChecks: {
      plausible: true,
      internallyCoherent: true,
      evidenceLinked: true,
      strategicallyRelevant: true,
      differentiated: true,
      notOptimisticFantasy: true,
      notPureDystopia: true,
      connectedToTodaysSignals: true,
      usefulForDecisions: true,
    },
    confidence: "low",
    reviewStatus: "needs_human_review",
    createdAt: "2026-03-05T11:10:00.000Z",
    updatedAt: "2026-06-26T10:05:00.000Z",
  },
];
