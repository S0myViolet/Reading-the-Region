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
      "Gulf institutions are automating fast. Banks are rolling out AI assistants and automated credit decisions at pace. National AI strategies treat fast adoption as a measure of competitiveness.",
    sideB:
      "The same customers still want a human involved when a decision matters. They ask a person for confirmation, explanation, and accountability. They also keep choosing human-run physical spaces for meaning and trust.",
    evidenceSideA:
      "Investment-bank research shows AI deployment speeding up across Gulf retail banks (SIG-006). This supports side A because banks are automating core decisions, not just back-office tasks. Published national AI strategies and bank technology spending point the same way.",
    evidenceSideB:
      "The same bank research records more branch appointments and complaints asking for human review (SIG-006). This supports side B because customers escalate to people even as services automate. Youth survey quotes describe distrust of automated refusals that come without explanation. Field research shows young Saudis building physical gathering places even as their commercial lives move online (SIG-008).",
    sideASignalIds: ["SIG-006"],
    sideBSignalIds: ["SIG-006", "SIG-008"],
    underlyingTension:
      "Efficiency and accountability are pulling in different directions. Customers accept AI doing the work, but they refuse to let AI own the decision. The open question is whether human involvement is a temporary comfort or a permanent premium.",
    whoBenefits:
      "Institutions that sell the human layer as a product, such as verified tiers and named advisers. Regulators who set explainability rules early. Premium brands that never automated their human service in the first place.",
    whoLoses:
      "Cost-cutters who answer demand for human review with chatbots. Mid-market services that must pay for both the AI systems and the human staff. Customers who cannot afford the human tier if verification is sold as a premium.",
    possibleResolution:
      "A stable two-layer service model: automated by default, with human review available on demand. Regulation would make human review a right for high-stakes decisions and a paid convenience elsewhere.",
    possibleEscalation:
      "A public scandal over a wrongful automated decision, such as a credit denial or misdiagnosis, triggers a run on trust. Demand for human review spikes across sectors. Regulators impose human-review mandates. Institutions that cut their human staff must rehire that capacity at crisis prices.",
    strategicImplication:
      "Treat the human layer as a product, not a cost. Institutions should map which decisions customers will never hand to machines. They should staff those decisions with accountable people and let automation handle the rest. Where that boundary sits is the strategy.",
    scenarioRelevance:
      "This tension shapes trust in both Permanent Gulf scenarios. In 'Rooted Futures', verified human service is part of what makes people feel they belong. In 'Platform Without Roots', thin automated service is one reason residency never turns into attachment.",
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
      "Gulf consumption is still anchored to global prestige. Malls and residences are marketed through international brand names, and wellness towers license global labels. The region remains one of the world's strongest markets for imported luxury.",
    sideB:
      "Value is shifting toward regional makers. Heritage garments re-cut by local labels sell out quickly. Regional creators are replacing global celebrities in campaigns. Some brand briefs now name 'regional credibility' as an explicit requirement.",
    evidenceSideA:
      "Mall repositioning still uses global brands as the prestige anchor of new lifestyle ecosystems (SIG-007). Wellness residences sell through internationally licensed brands and certifications (SIG-011). Both show that global names still carry the top layer of perceived value.",
    evidenceSideB:
      "Independent Gulf menswear labels charge premium prices and sell out fast (SIG-001). Brands are rebuilding campaigns around regional creators instead of global ambassadors (SIG-012). Both show buyers paying more for regional authorship than for imported prestige.",
    sideASignalIds: ["SIG-007", "SIG-011"],
    sideBSignalIds: ["SIG-001", "SIG-012"],
    underlyingTension:
      "Two kinds of aspiration are competing for the same wallet and the same self-image. Global luxury offers membership of a worldwide elite. Regional authorship offers ownership of one's own story. Gulf consumers increasingly want both, and they punish brands that can offer only one.",
    whoBenefits:
      "Regional designers and creators, because their credibility cannot be imported. Global brands willing to co-create rather than just translate. Retailers who can present both kinds of prestige convincingly.",
    whoLoses:
      "Global brands that treat the region as a translation market. Regional labels that scale up, lose their distinctiveness, and lose the premium with it. Licensing deals that assume a Western name still sits at the top of the value chain.",
    possibleResolution:
      "The two prestige systems merge through genuine partnership. Global luxury puts regional designers on global platforms and shares revenue with them. Regional labels borrow global craft and distribution in return.",
    possibleEscalation:
      "Identity shopping becomes polarised. Buying regional becomes a statement against the global. Global brands face authenticity boycotts over token gestures. The luxury market splits into parallel ecosystems with separate media, retail, and pricing.",
    strategicImplication:
      "Local voices may be becoming more valuable than global celebrity names, and the cost of that credibility is rising. Brands should budget for regional designers, creators, and cultural producers as a standing cost of operating in the Gulf. They should also decide deliberately where each product line sits between global and regional.",
    scenarioRelevance:
      "This tension sets the cultural texture of the Permanent Gulf. A settled population consumes identity differently from a transient one. 'Rooted Futures' assumes regional authorship keeps gaining ground. A reversal would mean people are settling without the culture becoming local.",
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
      "The Gulf is building for people who stay: ten-year visas, family schools, and long-term housing. Transit systems are rooting daily routines in place. Institutions from schools to malls are redesigning themselves around residents who stay.",
    sideB:
      "Many hotels, malls, and services still make money from short visits, not long-term residents. Longevity tourism sells multi-day packages to fly-in guests. Globally mobile buyers purchase flexibility and options rather than homes. The talent model still competes for people whose next move is already planned.",
    evidenceSideA:
      "Golden-visa families are making schooling and housing commitments that span many years (SIG-003). This supports side A because families only commit like this when they plan to stay. Riyadh Metro and Dubai mobility adoption are building daily routines around fixed places (SIG-010). This supports side A because districts are being priced around staying, not passing through.",
    evidenceSideB:
      "Hotel longevity clinics sell multi-day packages to internationally mobile patients who fly in for treatment (SIG-002). This supports side B because the business model still earns from visitors, not residents. It extends the Gulf's classic visitor economy into healthcare.",
    sideASignalIds: ["SIG-003", "SIG-010"],
    sideBSignalIds: ["SIG-002"],
    underlyingTension:
      "Long-term visas help people stay, but they do not automatically make people feel rooted. People may hold ten-year visas, own property, and school their children locally. Yet they may keep their savings, citizenship plans, and sense of home elsewhere. The Gulf is testing whether it can build a life platform for people it does not formally make its own.",
    whoBenefits:
      "States that gain long-term residents' spending and stability without granting citizenship. Developers and schools selling the infrastructure of settlement. Mobile elites who get a high-quality base without deep commitment.",
    whoLoses:
      "Residents who invest decades without secure long-term status, if policy tightens. Institutions that build for permanence, if settlement proves shallower than visa numbers suggest. Second-generation residents caught between the home they grew up in and a passport that says otherwise.",
    possibleResolution:
      "A clear long-term-belonging framework that stops short of citizenship. It would cover inheritance rules, retirement residency, and education-to-employment paths for residents' children. That would make permanence credible enough for institutions to build against.",
    possibleEscalation:
      "An economic shock triggers visa tightening or a wave of departures. That would reveal how much 'settlement' was really just people keeping their options open. Family districts would empty, school and housing demand would reverse, and the permanence story would lose a decade of credibility.",
    strategicImplication:
      "Every institution betting on the Permanent Gulf must plan for the gap between residency and belonging. Products should work in both worlds: valuable if the settler stays, recoverable if the settler leaves. Watch renewal rates, second-generation retention, and retirement-in-place as closely as sales.",
    scenarioRelevance:
      "This tension is the axis on which the two Permanent Gulf scenarios split. 'Rooted Futures' resolves it toward genuine belonging. 'Platform Without Roots' leaves it unresolved: permanence on paper, transience in identity.",
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
