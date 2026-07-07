/**
 * Demo drivers. Both are deliberately labelled "hypothesis": the validation
 * thresholds require thirty supporting signals and eight independent sources,
 * and with twelve signals in the dataset neither driver can honestly claim
 * validated status. Driver statements explain; they do not describe.
 */

import type { Driver } from "../types";

export const seedDrivers: Driver[] = [
  {
    id: "DRV-001",
    name: "As synthetic abundance grows, human-made and verified experiences become premium signals of trust",
    driverStatement:
      "Because AI is making synthetic output — decisions, content, endorsements, environments — abundant and cheap, scarcity value is migrating to whatever is verifiably human: human judgement over automated decisions, human authorship over generated culture, physically shared space over feeds, and regionally rooted voices over interchangeable global ones. Institutions respond by packaging verification, human contact and provenance as premium product attributes, which is why the same trust-premium behaviour appears in sectors that otherwise share nothing.",
    whatItExplains:
      "Explains why bank customers demand human confirmation of AI decisions (SIG-006) at the very moment automation accelerates; why regulators move to certify BNPL trust (SIG-009); why hotels sell physician-led verification rather than generic wellness (SIG-002); why young Saudis over-invest in physical third places (SIG-008); and why regional creators and regional authorship out-persuade global celebrity and imported design (SIG-012, SIG-001). It is the causal engine behind both the belonging pattern (PAT-001) — belonging is the deepest verified-human product — and the trust-premium pattern (PAT-002).",
    patternIds: ["PAT-001", "PAT-002"],
    signalIds: ["SIG-001", "SIG-002", "SIG-006", "SIG-008", "SIG-009", "SIG-012"],
    systemsAffected: ["trust", "consumption", "luxury", "technology", "community", "identity", "finance"],
    contradictionIds: ["CON-001", "CON-002"],
    secondOrderEffects: [
      "Verification becomes an industry: certification bodies, human-review services and provenance infrastructure emerge as sellable layers on top of automated systems.",
      "Human labour bifurcates — routine service work is automated away while accountable, client-facing human roles are repriced upwards as trust carriers.",
      "Marketing claims shift from quality language to proof language: audited, physician-led, human-reviewed, regionally authored.",
    ],
    thirdOrderEffects: [
      "A two-tier trust economy forms in which verified-human service is a class marker, raising fairness questions regulators will eventually own.",
      "Institutions rebuild physical presence (branches, clinics, venues) they had planned to retire, reversing a decade of channel strategy.",
    ],
    possibleFutures: [
      "Trust-priced markets: every automated sector offers a regulated human-verified tier, and 'who confirms this?' is a standard consumer question.",
      "Verification fatigue: proof layers proliferate into noise, trust collapses inward to personal networks and physical community, and institutional verification loses pricing power.",
      "Regional advantage: Gulf states turn early explainability and verification regulation into an exportable governance product for AI-era consumer markets.",
    ],
    leadingIndicatorIds: ["IND-005"],
    independentSourceCount: 6,
    scores: {
      explanatoryPower: 4,
      crossSectorStrength: 4,
      evidenceStrength: 2,
      persistence: 4,
      reversibility: 2,
      behaviouralImpact: 4,
      structuralImpact: 3,
      contradictionRichness: 4,
      scenarioUsefulness: 4,
      strategicRelevance: 4,
    },
    confidence: "low",
    status: "hypothesis",
    reviewStatus: "needs_human_review",
    humanNotes:
      "The most intellectually load-bearing claim on the board and the least evidenced — six signals against a thirty-signal threshold. Treat as a lens, not a conclusion. Falsifier to watch: if human-verification demand fades as AI familiarity grows (cohort data), the driver's core mechanism is wrong.",
    createdAt: "2026-03-25T10:30:00.000Z",
    updatedAt: "2026-06-24T09:20:00.000Z",
  },
  {
    id: "DRV-002",
    name: "State-led economic diversification is converting culture, wellness and lifestyle into infrastructure",
    driverStatement:
      "Because Gulf states must replace hydrocarbon dependence within a generation, they are treating domains that elsewhere evolve as consumer markets — culture, wellness, tourism, urban lifestyle, even settlement itself — as infrastructure to be planned, financed, licensed and measured. State demand de-risks private investment into these domains, policy instruments (visas, licences, transit, cultural budgets) act as market-making devices, and household behaviour follows the infrastructure. This is why lifestyle change in the Gulf moves at construction speed rather than cultural speed.",
    whatItExplains:
      "Explains why Saudi cultural spending produces a labour market, not just festivals (SIG-004); why residency policy generates schooling and housing demand on a settlement horizon (SIG-003); why transit systems appear ahead of demand and then create it (SIG-010); why hotels can commit capital to clinical infrastructure (SIG-002) and malls to civic functions (SIG-007) with policy tailwinds; and why wellness can be packaged into residential assets (SIG-011). It is the structural engine behind the belonging pattern (PAT-001): the state is financing the platforms on which belonging is productised.",
    patternIds: ["PAT-001"],
    signalIds: ["SIG-002", "SIG-003", "SIG-004", "SIG-007", "SIG-010", "SIG-011"],
    systemsAffected: ["governance", "cultural_production", "infrastructure", "urban", "tourism", "labour", "capital", "housing"],
    contradictionIds: ["CON-002", "CON-003"],
    secondOrderEffects: [
      "Private business models form downstream of policy: whole sectors (creative production, wellness real estate, transit-oriented retail) exist at the pleasure of budget cycles and licensing regimes.",
      "Talent markets are reshaped by mandate — Saudisation and Emiratisation in new sectors create wage premiums and training bottlenecks simultaneously.",
      "Success metrics migrate from commercial (sales, occupancy) to national (jobs, GDP share, resident retention), changing what gets funded and for how long.",
    ],
    thirdOrderEffects: [
      "Citizens and residents internalise the state as lifestyle provider, raising expectations that outlast any single programme and constraining future retrenchment.",
      "Regional competition shifts from resource endowments to quality-of-life infrastructure, exporting the model across MENA.",
    ],
    possibleFutures: [
      "Compounding platform: state-built lifestyle infrastructure reaches self-sustaining private demand, and the Gulf becomes a net exporter of culture, wellness and urban-living models.",
      "Budget-cycle whiplash: an extended oil-revenue squeeze forces retrenchment, exposing which lifestyle sectors had real demand beneath the subsidy.",
      "Quiet crowding-out: state scale outcompetes organic grassroots activity, leaving polished infrastructure with thin cultural soil beneath it.",
    ],
    leadingIndicatorIds: ["IND-001", "IND-002"],
    independentSourceCount: 7,
    scores: {
      explanatoryPower: 5,
      crossSectorStrength: 5,
      evidenceStrength: 3,
      persistence: 5,
      reversibility: 2,
      behaviouralImpact: 4,
      structuralImpact: 5,
      contradictionRichness: 4,
      scenarioUsefulness: 5,
      strategicRelevance: 5,
    },
    confidence: "medium",
    status: "hypothesis",
    reviewStatus: "needs_human_review",
    humanNotes:
      "Better evidenced than DRV-001 (six signals, seven sources, and the mechanism is documented policy rather than inferred psychology) but still far below the thirty-signal threshold — hypothesis is the honest label. Guard against explanatory laziness: not everything in the Gulf is state-led, and the driver must not absorb signals that grew bottom-up (SIG-008 is deliberately excluded).",
    createdAt: "2026-02-14T11:15:00.000Z",
    updatedAt: "2026-06-24T09:25:00.000Z",
  },
];
