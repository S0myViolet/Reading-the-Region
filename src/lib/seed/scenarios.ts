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
    differentiator:
      "This scenario assumes belonging grows alongside settlement — the second generation treats the Gulf as home, not as a base.",
    corePremise:
      "Long-term residents put down real roots, and their children grow up feeling the Gulf is home. Governments keep making it easier to stay, institutions rebuild around families who stay, and residents begin to feel that staying is wanted, not just permitted.",
    whatHasChanged:
      "By the early 2030s, the settled family is the Gulf's typical customer. School communities have alumni working in the same city. Family neighbourhoods have a second generation of tenants and owners. Banks sell twenty-year products to visa-backed households as a routine matter. Developers compete on community life rather than glossy renderings. Regional design, Gulf-dialect media and neighbourhood gathering places give settled newcomers a shared sense of home that is local, not imported.",
    howPeopleBehave:
      "Families plan in decades. They buy homes instead of renting where neighbourhoods feel permanent. They build local friendships, keep ageing parents nearby, and let children grow up anchored in the city around them. Daily life happens at the school gate, the metro station and the local coffee house, not the compound and the departure lounge. Money once saved for leaving now goes into life here.",
    howInstitutionsBehave:
      "Schools serve the same families for a generation and build alumni networks. Hospitals organise care around families rather than one-off expatriate patients. City authorities programme public space for residents' rituals — Ramadan nights, weekend sport, cultural seasons. Regulators publish clear rules for renewals, inheritance and retirement residency. Employers stop paying staff as if everyone plans to leave.",
    howBrandsBehave:
      "Brands treat residents as customers for life. Loyalty is measured in years, and campaigns are made by regional creators in regional voices. 'We grew up here with you' becomes the most valuable claim a brand can make. Brands that faked local roots in the 2020s are remembered for it.",
    keyTechnologies: [
      "Digital identity and residency systems that make renewals, property and school admin nearly effortless",
      "Arabic-first AI services — dialect-native assistants and education tools — that make daily institutional life feel locally made",
      "Mature metro and transit networks that second-generation residents treat as the normal way to move",
    ],
    keyPolicies: [
      "Long-term visa renewal becomes routine, with published criteria and a path to retirement residency",
      "Clear inheritance and end-of-life rules for non-citizen residents",
      "School-to-work pathways for residents' children, aligned with Saudisation and Emiratisation targets",
    ],
    keyCulturalShifts: [
      "Belonging without citizenship becomes a normal, lived category with its own etiquette and pride",
      "Contemporary regional design and media become the shared culture of settled newcomers, not just nationals",
      "People ask 'how long have you been here?' more often than 'where are you from?'",
    ],
    winners: [
      "Developers and operators who built family homes, community programming and transit-adjacent projects early",
      "Schools and healthcare groups that families trust across a generation",
      "Banks holding decade-long household relationships and the data those relationships produce",
      "Regional creators, designers and cultural producers who authored the language of belonging",
    ],
    losers: [
      "Landlords holding studio pipelines in a market that wants family homes",
      "Global brands that kept translating campaigns instead of making them locally",
      "Financial products built on the assumption that money always leaves the region",
    ],
    risks: [
      "If belonging is priced as a premium, rootedness becomes a class product and the middle of the market hollows out",
      "A large, permanent, non-citizen population with rising civic expectations tests systems built for guests",
    ],
    opportunities: [
      "Products for families staying decades: education-linked savings, family healthcare continuity, retirement-in-place services",
      "Community life as investable infrastructure: programming, gathering places and amenities with measurable retention returns",
      "A regional culture industry exporting the Gulf's language of belonging across MENA",
    ],
    earlySigns: [
      "Golden-visa renewal rates published and trending high, with families dominating new issuance (IND-001)",
      "Children completing their full school run, from entry to graduation, in one Gulf city",
      "Retirement and inheritance rules moving from discussion papers to draft law",
      "Metro ridership holding through full summers, showing habit rather than novelty (IND-003)",
    ],
    strategicQuestions: [
      "Which of our products would a family buy in year one of a twenty-year life here — and which only if they planned to leave?",
      "What do we actually do for belonging — community, continuity, recognition — and could a competitor name theirs faster?",
      "If renewal certainty arrived tomorrow, which decade-long product would we launch first?",
    ],
    supportingSignalIds: ["SIG-003", "SIG-010", "SIG-007", "SIG-008"],
    supportingPatternIds: ["PAT-001"],
    supportingDriverIds: ["DRV-002"],
    shapingContradictionIds: ["CON-003", "CON-002"],
    assumptions: [
      {
        text: "Visa and residency policy keeps opening up, or at least holds steady through one full economic downturn.",
        label: "hypothesis",
      },
      {
        text: "Attachment follows infrastructure: if services and community stay permanent, people begin to feel at home within a generation.",
        label: "speculative_possibility",
      },
      {
        text: "Governments will write formal rules for inheritance, retirement and residents' children, rather than leaving permanence informal.",
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
    differentiator:
      "This scenario assumes visas and services improve faster than belonging, citizenship, and long-term commitment.",
    corePremise:
      "People stay longer, but they never feel the Gulf is home. Visas get renewed, homes get bought and children get schooled, yet identity, savings and long-term plans stay anchored somewhere else.",
    whatHasChanged:
      "By the early 2030s, long-term visas are unremarkable and the settlement infrastructure is world-class. The behaviour underneath tells a quieter story. Families renew their visas but keep their exit plans current. Homes are bought for yield and flexibility as much as for living. Savings still flow out to passport countries. Second-generation residents describe themselves as from somewhere else. Twenty-year mortgages get refinanced at year seven, and 'forever homes' get listed the moment the market peaks. School communities still reset every few years, despite the longer visas.",
    howPeopleBehave:
      "Families stay longer but keep one foot elsewhere. Savings sit offshore, summers happen abroad, and university abroad is the default plan for children. Households quietly compare the Gulf against other places to live each year. Daily life is comfortable and locally connected. The deepest commitments — identity, end-of-life plans, giving — still happen elsewhere. People join communities as members, not as founders.",
    howInstitutionsBehave:
      "Institutions split into two camps. Some serve mobile customers honestly, with flexible leases, portable products and clean exits. Others keep selling belonging language that customers quietly discount, and pay for it in churn. Governments make renewals easier but avoid the deeper questions — citizenship pathways and status for residents' children. That silence keeps everyone holding options.",
    howBrandsBehave:
      "Brands learn that residents are loyal to convenience and quality, not to place. Belonging campaigns cost more than they return. The winning voice is honest about mobility. It serves 'your life while you are here' instead of pretending forever.",
    keyTechnologies: [
      "Cross-border wealth, pension and property platforms that make living across several countries administratively easy",
      "Automated services that deliver excellent daily life with little human or civic contact (see CON-001 — thin trust)",
      "Remote schooling and portable credentials that keep children's options global",
    ],
    keyPolicies: [
      "Renewals get easier while citizenship and the status of residents' children stay unresolved",
      "Property and visa products openly marketed as investments and options rather than as settlement",
      "Tax and fee regimes tuned to attract mobile residents — competitive, but easy to compare and easy to leave",
    ],
    keyCulturalShifts: [
      "A polished cosmopolitan surface with thin local attachment beneath — global formats, translated campaigns, interchangeable districts",
      "Belonging talk becomes marketing wallpaper that residents politely ignore",
      "Children grow up globally fluent and locally uncommitted, mirroring their parents' hedged position",
    ],
    winners: [
      "Operators of flexible, service-rich products: serviced apartments, international schools with global credentials, cross-border banking",
      "Global brands whose value moves between cities without needing local translation",
      "Mobile professionals themselves, who enjoy world-class daily life while keeping their options open",
    ],
    losers: [
      "Institutions that bet on rootedness: community-heavy developments, alumni-dependent schools, and twenty-year product books priced for loyalty that never comes",
      "States, in the long run, if diversification plans counted on settled-resident spending that option-holders never deliver",
      "Residents' children, who carry the personal cost of permanent in-betweenness",
    ],
    risks: [
      "A regional or global shock triggers a synchronised exit, revealing how conditional the settlement really was",
      "Residents grow cynical about institutions that market roots while designing for churn",
      "Governments mistake option-holding for disloyalty and tighten rules, speeding up the very transience they punish",
    ],
    opportunities: [
      "Make reversibility a feature: products that are excellent while you stay and clean when you leave earn trust on honest terms",
      "Portability services — credentials, pensions, healthcare records — become a growth category for lives lived across several bases",
      "Memberships, subscriptions and service tiers turn even short stays into recurring revenue",
    ],
    earlySigns: [
      "Renewal rates stay high, but resale listings spike at every market peak and wellness-home premiums fail to hold (IND-006)",
      "Household savings keep flowing out to passport countries despite longer visas",
      "Surveys in which long-tenure residents still call somewhere else 'home'",
      "Banks meeting verification demands with more automation rather than more people, keeping relationships thin (IND-005)",
    ],
    strategicQuestions: [
      "Which of our products assume permanence, and do they still work if customers secretly plan in five-year blocks?",
      "Can we serve mobile customers honestly and profitably, instead of selling belonging we cannot deliver?",
      "Which single metric would warn us an exit wave had started, before the market prices it in?",
    ],
    supportingSignalIds: ["SIG-003", "SIG-002", "SIG-011"],
    supportingPatternIds: ["PAT-002"],
    supportingDriverIds: ["DRV-001", "DRV-002"],
    shapingContradictionIds: ["CON-003", "CON-001"],
    assumptions: [
      {
        text: "Governments leave the deep questions — citizenship pathways and status for residents' children — unresolved through this horizon.",
        label: "hypothesis",
      },
      {
        text: "Feeling at home does not automatically follow from settlement infrastructure; without recognition, attachment stalls.",
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
