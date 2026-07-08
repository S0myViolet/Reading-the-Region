/**
 * Demo clusters. Names are logic statements, never topics. All three sit at
 * status "candidate" — with only twelve signals in the dataset, none can
 * honestly meet the eight-signal validation threshold, and the platform
 * shows that shortfall rather than hiding it.
 */

import type { Cluster } from "../types";

export const seedClusters: Cluster[] = [
  {
    id: "CLU-001",
    name: "Regional identity is being expressed in contemporary forms, not nostalgia",
    unifyingQuestion:
      "Why are young Gulf audiences choosing regional culture made now — in clothing, podcasts, gathering places, and campaigns — over imported global culture and museum-style heritage?",
    clusterStatement:
      "These signals are grouped because they show regional identity being made in the present: people are creating new Gulf culture rather than preserving old culture or importing global culture. The group covers re-cut heritage clothing, Gulf-dialect podcasts, coffee houses that host the majlis instinct, cultural investment, and campaigns fronted by regional creators.",
    signalIds: ["SIG-001", "SIG-004", "SIG-005", "SIG-008", "SIG-012"],
    contradictionIds: ["CON-002"],
    evidenceSummary:
      "Five signals cover five sectors: fashion and luxury, culture and heritage, media and the creator economy, food-and-beverage third places, and government policy. Nine distinct sources back them, including platform data, ethnographic field notes, an expert interview, and event calendars. Evidence quality is mixed. State-linked sources overstate success, and creator-panel sources are anecdotal. The cluster's strength is that unrelated source types all point the same way. It fails the eight-signal threshold, so candidate status is honest.",
    scores: {
      breadth: 4,
      depth: 3,
      coherence: 4,
      persistence: 3,
      acceleration: 4,
      regionalRelevance: 5,
      strategicRelevance: 4,
      contradictionRichness: 4,
      systemicPotential: 4,
    },
    possiblePatternIds: ["PAT-001"],
    possibleDriverIds: ["DRV-001", "DRV-002"],
    confidence: "medium",
    status: "candidate",
    reviewStatus: "human_reviewed",
    humanNotes:
      "Watch the boundary with nostalgia. If the evidence starts pointing at heritage reproduction rather than new work, this becomes a different and weaker claim. OBS-016 (Gulf-dialect voice assistant) is a candidate sixth signal if promoted.",
    createdAt: "2025-11-20T10:30:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "CLU-002",
    name: "Hotels, malls and venues are rebuilding around repeat daily use, not one-off visits",
    unifyingQuestion:
      "Why are Gulf hotels, malls, and venues rebuilding around repeat daily use — memberships, clinics, programming — instead of one-off visits and transactions?",
    clusterStatement:
      "These signals are grouped because they show businesses replacing the economics of the visit with the economics of the relationship: places that once sold moments are being rebuilt to host routines. The group covers hotels adding permanent longevity clinics, malls re-letting anchor space to gyms, clinics, and co-working, coffee houses built for regulars, and residences bundling health services.",
    signalIds: ["SIG-002", "SIG-007", "SIG-008", "SIG-011"],
    contradictionIds: ["CON-003"],
    evidenceSummary:
      "Four signals span hospitality, health and wellness, retail, real estate, and food and beverage. Eight distinct sources support them: trade press, a consulting survey, search trends, ethnographic notes, and operator announcements. The weakest link is SIG-011, which rests on developer-claimed premiums and scores 2 for evidence. The strongest is SIG-007, which has three independent source types. The cluster sits below the eight-signal threshold. The Ramadan night-economy and social-sport observations (OBS-011, OBS-013) are candidate additions.",
    scores: {
      breadth: 3,
      depth: 3,
      coherence: 4,
      persistence: 3,
      acceleration: 4,
      regionalRelevance: 4,
      strategicRelevance: 4,
      contradictionRichness: 3,
      systemicPotential: 4,
    },
    possiblePatternIds: ["PAT-001", "PAT-002"],
    possibleDriverIds: ["DRV-002"],
    confidence: "medium",
    status: "candidate",
    reviewStatus: "needs_human_review",
    humanNotes:
      "The cluster leans on announced plans (clinics, conversions) more than proven behaviour. Before advocating validation, replace announcement evidence with usage evidence: clinic occupancy, dwell-time data, and membership counts.",
    createdAt: "2026-01-25T11:00:00.000Z",
    updatedAt: "2026-06-12T10:20:00.000Z",
  },
  {
    id: "CLU-003",
    name: "Long-term residency is turning the Gulf from a temporary workplace into a permanent home",
    unifyingQuestion:
      "What changes when the people who power Gulf cities stop planning to leave, and which institutions are already rebuilding around that assumption?",
    clusterStatement:
      "These signals are grouped because they show the Gulf's core operating model — workers who rotate through — being replaced by residents who stay, with permanence becoming the design assumption. The group covers golden-visa families making long-term commitments, transit rooting daily routines in place, malls becoming daily-life infrastructure, and homes sold as long-term health platforms.",
    signalIds: ["SIG-003", "SIG-007", "SIG-010", "SIG-011"],
    contradictionIds: ["CON-003"],
    evidenceSummary:
      "Four signals cover migration and belonging, real estate, education and work, mobility, retail, and health — the widest sector spread of any cluster. Nine distinct sources support them, including government policy data, academic ridership research, newspaper reporting, and consulting survey work. Two of the four signals are validated with high confidence (SIG-003 and SIG-010). Depth and source independence are the strongest in the dataset. Candidate status reflects only the eight-signal threshold. On every other dimension this cluster is closest to validation.",
    scores: {
      breadth: 4,
      depth: 4,
      coherence: 5,
      persistence: 4,
      acceleration: 4,
      regionalRelevance: 5,
      strategicRelevance: 5,
      contradictionRichness: 3,
      systemicPotential: 5,
    },
    possiblePatternIds: ["PAT-001"],
    possibleDriverIds: ["DRV-001", "DRV-002"],
    confidence: "medium",
    status: "candidate",
    reviewStatus: "human_reviewed",
    humanNotes:
      "Feeder cluster for the Permanent Gulf territory. Priority scanning: retirement-in-place evidence, inheritance and end-of-life policy changes, and second-generation schooling outcomes. Each would add signals toward the threshold. Do not confuse visa length with belonging; contradiction CON-003 carries that tension.",
    createdAt: "2025-12-10T09:45:00.000Z",
    updatedAt: "2026-06-20T08:30:00.000Z",
  },
];
