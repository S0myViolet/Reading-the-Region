/**
 * Demo contradictions — the tensions that keep the analysis honest. Each side
 * is evidence-linked to signals so the tension is traceable, not rhetorical.
 */

import type { Contradiction } from "../types";

export const seedContradictions: Contradiction[] = [
  {
    id: "CON-001",
    name: "AI acceleration vs demand for human verification",
    contradictionType: "automation_vs_human_meaning",
    sideA:
      "Gulf institutions are automating aggressively: banks deploying AI assistants and automated credit decisioning at pace, backed by national AI strategies that treat adoption speed as a competitiveness metric.",
    sideB:
      "The same customers adopting automated services are escalating to humans for anything with stakes — demanding confirmation, explanation and accountability from a person, and gravitating to human-anchored spaces and services for meaning and trust.",
    evidenceSideA:
      "Investment-bank sector research documents accelerating AI deployment across Gulf retail banks (SIG-006), consistent with published national AI strategies and bank technology capex disclosures.",
    evidenceSideB:
      "The same sector note records rising branch appointments and complaints requesting human review; youth survey verbatims describe distrust of unexplained automated refusals (SIG-006). Ethnographic evidence shows young Saudis investing heavily in human, physical gathering infrastructure (SIG-008) even as their commercial lives digitise.",
    sideASignalIds: ["SIG-006"],
    sideBSignalIds: ["SIG-006", "SIG-008"],
    underlyingTension:
      "Efficiency and accountability are pulling apart. Automation transfers transactional trust to machines faster than it transfers moral accountability — customers accept AI doing the work but refuse AI owning the decision. The deeper question is whether human involvement is a transition-era comfort or a permanent premium.",
    whoBenefits:
      "Institutions that productise the human layer (verified tiers, named advisers), regulators who arrive early with explainability rules, and premium brands whose human service was never automated away.",
    whoLoses:
      "Pure-automation cost-cutters who meet verification demand with chatbots; mid-market services stuck paying for both the AI stack and the human layer; customers who cannot afford the human tier if verification is priced as premium.",
    possibleResolution:
      "A stable two-layer service architecture: automated by default, human-verified on demand — standardised by regulation (explainability and recourse rights) so verification is a right for high-stakes decisions and a paid convenience elsewhere.",
    possibleEscalation:
      "A high-profile automated-decision scandal (wrongful credit denial, misdiagnosis) triggers a trust run: verification demand spikes across sectors, regulators impose human-review mandates, and institutions that fired their human capacity buy it back at crisis prices.",
    strategicImplication:
      "Plan the human layer as a product, not a cost. Institutions should map which decisions customers will never cede to machines, staff those with accountable humans, and let automation own the rest — the boundary line itself is the strategy.",
    scenarioRelevance:
      "Shapes the trust architecture of both Permanent Gulf scenarios: in 'Rooted Futures' verified human service is part of the belonging offer; in 'Platform Without Roots' thin automated service is one reason residency never deepens into attachment.",
    scores: {
      tensionStrength: 4,
      strategicRichness: 5,
      evidenceBalance: 3,
      futureImpact: 4,
      emotionalCharge: 4,
    },
    reviewStatus: "human_reviewed",
    createdAt: "2026-03-12T10:40:00.000Z",
    updatedAt: "2026-05-20T09:15:00.000Z",
  },
  {
    id: "CON-002",
    name: "Global luxury aspiration vs rising value of regional identity",
    contradictionType: "global_vs_local",
    sideA:
      "Gulf consumption remains anchored to global prestige: malls and residences are marketed through international brand names, wellness towers license global labels, and the region continues to be one of the world's strongest markets for imported luxury.",
    sideB:
      "Value is migrating to regional authorship: heritage garments re-cut by local labels sell out, regional creators displace global celebrities in campaigns, and 'regional credibility' is appearing as an explicit brief requirement.",
    evidenceSideA:
      "Mall repositioning still leans on global-brand anchors as the prestige layer of new lifestyle ecosystems (SIG-007); wellness residences sell through internationally licensed brands and certifications (SIG-011).",
    evidenceSideB:
      "Independent Gulf menswear labels command premium prices and rapid sell-through (SIG-001); brands are recasting campaigns around regional creators at the expense of global ambassadors (SIG-012).",
    sideASignalIds: ["SIG-007", "SIG-011"],
    sideBSignalIds: ["SIG-001", "SIG-012"],
    underlyingTension:
      "Aspiration is bilingual and the two vocabularies are competing for the same wallet and the same self-image. Global luxury offers membership of a worldwide elite; regional authorship offers ownership of one's own story. The Gulf consumer increasingly wants both — and punishes brands that can only speak one language.",
    whoBenefits:
      "Regional designers and creators whose credibility cannot be imported; global brands willing to co-create rather than translate; retailers who can merchandise both vocabularies coherently.",
    whoLoses:
      "Global brands that treat the region as a translation market; regional labels that scale into blandness and lose the authorship premium; licensing plays that assume a Western name is still the top of the value stack.",
    possibleResolution:
      "Hybridisation: global luxury absorbs regional authorship through genuine creative partnership (regional designers on global platforms, revenue-shared collaborations), while regional labels borrow global craft and distribution — a negotiated merger of the two prestige systems.",
    possibleEscalation:
      "Identity consumption polarises: buying regional becomes a cultural statement against the global, global brands face authenticity boycotts over token gestures, and the luxury market splits into parallel ecosystems with separate media, retail and pricing.",
    strategicImplication:
      "Cultural credibility is becoming a paid-for input with a rising price. Brands should budget for regional authorship (designers, creators, cultural producers) as a structural cost of operating in the Gulf, and decide deliberately where on the global–regional spectrum each product line sits.",
    scenarioRelevance:
      "Determines the cultural texture of the Permanent Gulf: a settled population consumes identity differently from a transient one. 'Rooted Futures' assumes the regional vocabulary keeps gaining ground; a reversal would indicate settlement without cultural localisation.",
    scores: {
      tensionStrength: 4,
      strategicRichness: 4,
      evidenceBalance: 4,
      futureImpact: 4,
      emotionalCharge: 4,
    },
    reviewStatus: "human_reviewed",
    createdAt: "2025-12-15T11:20:00.000Z",
    updatedAt: "2026-06-15T10:00:00.000Z",
  },
  {
    id: "CON-003",
    name: "Permanent settlement vs transient global mobility",
    contradictionType: "permanence_vs_mobility",
    sideA:
      "The Gulf is building for permanence: decade-long visas pulling families into settlement decisions, transit systems rooting daily routines in place, and institutions from schools to malls re-architecting around residents who stay.",
    sideB:
      "The region's growth engines still monetise transience: fly-in longevity tourism, globally mobile capital buying optionality rather than homes, and a talent model that competes worldwide for people whose next move is always priced in.",
    evidenceSideA:
      "Golden-visa families making multi-year schooling and housing commitments (SIG-003); Riyadh Metro and Dubai mobility adoption embedding place-based daily routines and re-pricing districts around staying, not passing through (SIG-010).",
    evidenceSideB:
      "Hotel longevity clinics are built for the fly-in guest — multi-day packages sold to internationally mobile patients, extending the Gulf's classic visitor-economy logic into healthcare (SIG-002).",
    sideASignalIds: ["SIG-003", "SIG-010"],
    sideBSignalIds: ["SIG-002"],
    underlyingTension:
      "Permanence in paperwork is not permanence in identity. Residency can lengthen while belonging stays shallow: people may hold ten-year visas, own property and school their children locally, yet keep their savings, citizenship ambitions and sense of home elsewhere. The Gulf is testing whether a life platform can be built for people it does not formally make its own.",
    whoBenefits:
      "States that capture long-tenure residents' spending and stability without extending citizenship; developers and schools selling settlement infrastructure; mobile elites who gain a low-commitment base with high-quality services.",
    whoLoses:
      "Residents who invest decades without secure long-term status if policy tightens; institutions that build for permanence if settlement proves shallower than visa data suggests; second-generation residents caught between a home they grew up in and a passport that says otherwise.",
    possibleResolution:
      "A codified long-term-belonging framework short of citizenship — inheritance clarity, retirement residency, education-to-employment continuity for children of residents — that makes permanence credible enough for institutions to build against.",
    possibleEscalation:
      "An economic shock triggers visa tightening or an exit wave, revealing how much 'settlement' was optionality: family districts hollow out, school and housing demand reverses, and the permanence narrative loses a decade of credibility.",
    strategicImplication:
      "Every institution betting on the Permanent Gulf must underwrite the difference between residency and belonging. Products should be designed to work in both worlds — valuable to the settler, recoverable if the settler leaves — and leading indicators (renewal rates, second-generation retention, retirement-in-place) should be watched as closely as sales.",
    scenarioRelevance:
      "This is the axis on which the two Permanent Gulf scenarios split: 'Rooted Futures' resolves the tension towards genuine belonging; 'Platform Without Roots' is the tension left unresolved — permanence in paperwork, transience in identity.",
    scores: {
      tensionStrength: 5,
      strategicRichness: 5,
      evidenceBalance: 3,
      futureImpact: 5,
      emotionalCharge: 4,
    },
    reviewStatus: "human_reviewed",
    createdAt: "2025-12-18T09:30:00.000Z",
    updatedAt: "2026-06-18T11:45:00.000Z",
  },
];
