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
    name: "Regional identity is being expressed through contemporary design languages rather than nostalgia",
    unifyingQuestion:
      "Why are young Gulf audiences and institutions choosing contemporary regional authorship — in dress, audio, gathering places and campaigns — over both imported global culture and museum-style heritage revival?",
    clusterStatement:
      "Across fashion, cultural investment, audio media, third places and brand casting, regional identity is being produced in a contemporary register: re-cut heritage garments worn daily, Gulf-dialect podcasts in the commute, coffee houses re-housing the majlis instinct, and regional creators displacing global celebrities. The common logic is authorship — identity as something currently being made, not preserved or imported.",
    signalIds: ["SIG-001", "SIG-004", "SIG-005", "SIG-008", "SIG-012"],
    contradictionIds: ["CON-002"],
    evidenceSummary:
      "Five signals across five sectors (fashion & luxury, culture & heritage, media & creator economy, F&B third places, government policy), drawing on nine distinct sources including platform data, ethnographic field notes, expert interview and event-programming calendars. Evidence quality is mixed: state-linked sources carry boosterism, creator-panel sources are anecdotal, but the independent corroboration across unlike source types is the cluster's strength. Fails the eight-signal threshold — candidate status is honest.",
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
      "Watch the boundary with nostalgia carefully: the moment this cluster's evidence starts pointing at heritage reproduction rather than contemporary authorship, it is a different (weaker) claim. OBS-016 (Gulf-dialect voice assistant) is a candidate sixth signal if promoted.",
    createdAt: "2025-11-20T10:30:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "CLU-002",
    name: "Destinations and retail are becoming lifestyle ecosystems rather than visit-based attractions",
    unifyingQuestion:
      "Why are hotels, malls and venues across the Gulf re-engineering themselves around repeat daily use — memberships, clinics, programming — instead of one-off visits and transactions?",
    clusterStatement:
      "Hotels adding permanent longevity clinics, malls re-letting anchors to gyms, clinics and co-working, coffee houses optimising for recurring communities, and residences bundling health infrastructure all follow one logic: the economics of the visit are being replaced by the economics of the relationship. Assets that once sold moments are being rebuilt to host routines.",
    signalIds: ["SIG-002", "SIG-007", "SIG-008", "SIG-011"],
    contradictionIds: ["CON-003"],
    evidenceSummary:
      "Four signals spanning hospitality, health & wellness, retail, real estate and F&B, supported by eight distinct sources — trade press, consulting survey, search trends, ethnographic notes, operator announcements. The weakest link is SIG-011 (developer-claimed premiums, evidence 2); the strongest is SIG-007 (three independent source types). Below the eight-signal threshold; the Ramadan night-economy and social-sport observations (OBS-011, OBS-013) are candidate additions.",
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
      "The cluster leans on announced intent (clinics, conversions) more than realised behaviour. Before advocating validation, replace announcement evidence with usage evidence: clinic occupancy, dwell-time data, membership counts.",
    createdAt: "2026-01-25T11:00:00.000Z",
    updatedAt: "2026-06-12T10:20:00.000Z",
  },
  {
    id: "CLU-003",
    name: "Long-term residency is shifting the Gulf from a temporary work destination to a permanent life platform",
    unifyingQuestion:
      "What changes when the people who power Gulf cities stop planning to leave — and which institutions are already re-building around that assumption?",
    clusterStatement:
      "Golden-visa families making settlement-horizon commitments, transit reshaping daily routines into rooted urban habits, malls becoming daily-life infrastructure, and homes marketed as long-term health platforms converge on one claim: the Gulf's core operating model — talent that rotates — is being replaced by talent that stays. Permanence is becoming the design assumption across housing, mobility, retail and health.",
    signalIds: ["SIG-003", "SIG-007", "SIG-010", "SIG-011"],
    contradictionIds: ["CON-003"],
    evidenceSummary:
      "Four signals across migration & belonging, real estate, education & work, mobility, retail and health — the widest sector spread of any cluster — supported by nine distinct sources including government policy data, academic ridership research, newspaper reporting and consulting survey work. Two of four signals are validated with high confidence (SIG-003, SIG-010); depth and source independence are the strongest in the dataset. Candidate status reflects the eight-signal threshold only: on every other dimension this cluster is closest to validation.",
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
      "Feeder cluster for the Permanent Gulf territory. Priority scanning tasks: retirement-in-place evidence, inheritance/end-of-life policy movement, and second-generation schooling outcomes — each would add signals towards the threshold. Guard against conflating visa duration with belonging (the contradiction CON-003 carries that tension).",
    createdAt: "2025-12-10T09:45:00.000Z",
    updatedAt: "2026-06-20T08:30:00.000Z",
  },
];
