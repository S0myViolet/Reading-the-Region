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
    name: "AI abundance is raising the value of verified human work",
    driverStatement:
      "AI is making content, decisions, and services cheap and abundant. That is making people value proof of human work and verified quality more. Scarcity is moving to whatever is verifiably human: human judgement over automated decisions, human authorship over generated culture, shared physical space over feeds, and rooted local voices over interchangeable global ones. Institutions respond by selling verification, human contact, and provenance as premium features. That is why the same trust-premium behaviour appears in sectors that otherwise share nothing.",
    whatItExplains:
      "This driver explains several things. Bank customers demand human confirmation of AI decisions just as automation accelerates (SIG-006). Regulators move to certify trust in buy-now-pay-later credit (SIG-009). Hotels sell physician-led verification rather than generic wellness (SIG-002). Young Saudis invest heavily in physical third places (SIG-008). Local voices may be becoming more valuable than global celebrity names, and regional design outsells imports (SIG-012, SIG-001). It shows up in banking, credit regulation, hospitality, community life, media, and fashion. It is the causal engine behind the belonging pattern (PAT-001) and the trust-premium pattern (PAT-002).",
    patternIds: ["PAT-001", "PAT-002"],
    signalIds: ["SIG-001", "SIG-002", "SIG-006", "SIG-008", "SIG-009", "SIG-012"],
    systemsAffected: ["trust", "consumption", "luxury", "technology", "community", "identity", "finance"],
    contradictionIds: ["CON-001", "CON-002"],
    secondOrderEffects: [
      "Verification becomes an industry, with certification bodies, human-review services, and provenance tools sold as layers on top of automated systems.",
      "Human work splits in two: routine service jobs are automated away, while accountable client-facing roles are paid more because they carry trust.",
      "Marketing language shifts from quality claims to proof claims: audited, physician-led, human-reviewed, regionally authored.",
    ],
    thirdOrderEffects: [
      "A two-tier trust economy forms in which verified human service marks social class, raising fairness questions regulators will eventually take on.",
      "Institutions rebuild the branches, clinics, and venues they had planned to retire, reversing a decade of channel strategy.",
    ],
    possibleFutures: [
      "Trust-priced markets: every automated sector offers a regulated human-verified tier, and 'who confirms this?' becomes a standard consumer question.",
      "Verification fatigue: proof labels multiply into noise, trust retreats to personal networks and physical community, and institutional verification loses pricing power.",
      "Regional advantage: Gulf states turn early explainability and verification rules into a governance product they can export to other AI-era consumer markets.",
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
      "This is the most load-bearing claim on the board and the least evidenced: six signals against a thirty-signal threshold. Treat it as a lens, not a conclusion. Falsifier to watch: if demand for human verification fades as people get used to AI, the driver's core mechanism is wrong.",
    createdAt: "2026-03-25T10:30:00.000Z",
    updatedAt: "2026-06-24T09:20:00.000Z",
  },
  {
    id: "DRV-002",
    name: "Gulf states are building culture, wellness and lifestyle as planned infrastructure",
    driverStatement:
      "Gulf states must replace oil income within a generation. That pressure is pushing them to treat culture, wellness, tourism, urban lifestyle, and even settlement as infrastructure to plan, finance, license, and measure. State demand reduces the risk of private investment in these areas. Policy tools such as visas, licences, transit, and cultural budgets create markets directly. Household behaviour then follows the infrastructure. This is why lifestyle in the Gulf changes at construction speed rather than cultural speed.",
    whatItExplains:
      "This driver explains several things. Saudi cultural spending produces a labour market, not just festivals (SIG-004). Residency policy generates schooling and housing demand on a settlement horizon (SIG-003). Transit systems appear ahead of demand and then create it (SIG-010). Hotels commit capital to clinical infrastructure (SIG-002), and malls take on civic functions (SIG-007), because policy supports them. Wellness gets packaged into residential assets (SIG-011). It shows up in culture, migration, transport, hospitality, retail, and housing. It is the structural engine behind the belonging pattern (PAT-001): the state finances the platforms on which belonging is sold.",
    patternIds: ["PAT-001"],
    signalIds: ["SIG-002", "SIG-003", "SIG-004", "SIG-007", "SIG-010", "SIG-011"],
    systemsAffected: ["governance", "cultural_production", "infrastructure", "urban", "tourism", "labour", "capital", "housing"],
    contradictionIds: ["CON-002", "CON-003"],
    secondOrderEffects: [
      "Private business models form downstream of policy, so whole sectors depend on budget cycles and licensing regimes to survive.",
      "Talent markets are reshaped by mandate: Saudisation and Emiratisation in new sectors create wage premiums and training bottlenecks at the same time.",
      "Funding metrics shift from sales and occupancy to jobs, GDP share, and resident retention, which changes what gets funded and for how long.",
    ],
    thirdOrderEffects: [
      "Citizens and residents come to expect the state as lifestyle provider, and those expectations outlast any single programme and limit future cutbacks.",
      "Regional competition shifts from natural resources to quality-of-life infrastructure, and the model spreads across MENA.",
    ],
    possibleFutures: [
      "Compounding platform: state-built lifestyle infrastructure reaches self-sustaining private demand, and the Gulf becomes a net exporter of culture, wellness, and urban-living models.",
      "Budget whiplash: a long oil-revenue squeeze forces cutbacks and reveals which lifestyle sectors had real demand beneath the subsidy.",
      "Quiet crowding-out: state scale outcompetes grassroots activity, leaving polished infrastructure with thin cultural soil beneath it.",
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
      "Better evidenced than DRV-001: six signals, seven sources, and a mechanism documented in policy rather than inferred from psychology. Still far below the thirty-signal threshold, so hypothesis is the honest label. Guard against explanatory laziness: not everything in the Gulf is state-led. The driver must not absorb signals that grew bottom-up; SIG-008 is deliberately excluded.",
    createdAt: "2026-02-14T11:15:00.000Z",
    updatedAt: "2026-06-24T09:25:00.000Z",
  },
];
