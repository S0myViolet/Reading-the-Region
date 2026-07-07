/**
 * Demo sources. All are labelled `isDemo: true`, carry no URLs, and use
 * realistic-but-generic names. Credibility and role are scored separately:
 * a TikTok panel can be an excellent discovery source and a poor validation
 * source at the same time.
 */

import type { Source } from "../types";

export const seedSources: Source[] = [
  {
    id: "SRC-001",
    name: "UAE federal long-term residency policy portal (demo)",
    url: null,
    sourceType: "government_policy",
    credibility: 4,
    biasTags: ["government_agenda", "gulf_boosterism"],
    roles: ["validation", "data"],
    dateAdded: "2025-08-14",
    notes:
      "Official announcements and eligibility rules for 10-year residency categories. Authoritative on what the policy says; silent on uptake friction and lived experience. Read alongside independent reporting.",
    isDemo: true,
  },
  {
    id: "SRC-002",
    name: "GCC consumer and cities outlook, Middle East practice of a global consultancy (demo)",
    url: null,
    sourceType: "consulting_report",
    credibility: 4,
    biasTags: ["commercial_bias", "western_centric", "investor_optimism"],
    roles: ["validation", "context"],
    dateAdded: "2025-09-02",
    notes:
      "Annual survey-backed outlook on Gulf household spending, relocation intent and retail formats. Useful for magnitudes; framing tends to flatter clients' growth narratives.",
    isDemo: true,
  },
  {
    id: "SRC-003",
    name: "GCC Hospitality Trade Review (demo)",
    url: null,
    sourceType: "trade_publication",
    credibility: 3,
    biasTags: ["commercial_bias", "pr_framing"],
    roles: ["discovery", "context", "monitoring"],
    dateAdded: "2025-08-20",
    notes:
      "Weekly trade coverage of hotel openings, mall repositionings and F&B concepts across the Gulf. Fast and well-sourced on operator moves, but leans on operator press material.",
    isDemo: true,
  },
  {
    id: "SRC-004",
    name: "Gulf economics desk of an international newspaper (demo)",
    url: null,
    sourceType: "news_publication",
    credibility: 4,
    biasTags: ["western_centric", "recency_bias"],
    roles: ["validation", "context"],
    dateAdded: "2025-08-14",
    notes:
      "Correspondent coverage of Gulf policy, property and banking. Strong on verification and data requests; occasionally frames regional dynamics through a Western editorial lens.",
    isDemo: true,
  },
  {
    id: "SRC-005",
    name: "Regional culture and design magazine covering Gulf creative scenes (demo)",
    url: null,
    sourceType: "cultural_publication",
    credibility: 3,
    biasTags: ["cultural_editorial_bias", "luxury_market_bias"],
    roles: ["discovery", "interpretation"],
    dateAdded: "2025-09-18",
    notes:
      "Profiles of designers, studios and cultural programmes in Riyadh, Jeddah, Dubai and Sharjah. Early on creative-scene shifts; celebratory tone requires triangulation.",
    isDemo: true,
  },
  {
    id: "SRC-006",
    name: "Regional TikTok fashion and lifestyle creators (demo panel)",
    url: null,
    sourceType: "social_media",
    credibility: 2,
    biasTags: ["platform_self_promotion", "anecdotal_limitation", "recency_bias"],
    roles: ["discovery"],
    dateAdded: "2025-09-05",
    notes:
      "A tracked panel of roughly forty Gulf-based creators in fashion, food and city life. Excellent early-warning surface for aesthetic and behavioural shifts; never sufficient on its own.",
    isDemo: true,
  },
  {
    id: "SRC-007",
    name: "Audio streaming platform MENA listening report (demo)",
    url: null,
    sourceType: "platform_data",
    credibility: 4,
    biasTags: ["platform_self_promotion", "commercial_bias"],
    roles: ["data", "monitoring"],
    dateAdded: "2025-11-10",
    notes:
      "Aggregate listening-hour and category data for Arabic-language audio. Robust at scale but published selectively — the platform only releases figures that flatter its growth story.",
    isDemo: true,
  },
  {
    id: "SRC-008",
    name: "Interview with a Riyadh-based cultural producer (demo)",
    url: null,
    sourceType: "expert_interview",
    credibility: 4,
    biasTags: ["anecdotal_limitation", "cultural_editorial_bias"],
    roles: ["interpretation", "context"],
    dateAdded: "2025-10-08",
    notes:
      "Recurring conversation with a producer who has staged public programming in Riyadh and Jeddah since 2019. Strong on how commissioning and audiences actually behave; a single vantage point.",
    isDemo: true,
  },
  {
    id: "SRC-009",
    name: "Press releases from a Gulf hotel and wellness operator (demo)",
    url: null,
    sourceType: "company_announcement",
    credibility: 2,
    biasTags: ["pr_framing", "commercial_bias", "gulf_boosterism"],
    roles: ["discovery", "monitoring"],
    dateAdded: "2025-12-02",
    notes:
      "Operator announcements of clinic partnerships, branded residences and wellness programming. Treat as statements of intent, not evidence of demand; useful for spotting where capital wants to go.",
    isDemo: true,
  },
  {
    id: "SRC-010",
    name: "Urban studies research group at a Gulf university (demo)",
    url: null,
    sourceType: "academic_research",
    credibility: 5,
    biasTags: ["sample_size_limitation"],
    roles: ["validation", "context"],
    dateAdded: "2026-01-15",
    notes:
      "Peer-reviewed and working-paper output on transit ridership, neighbourhood change and public-space use in Riyadh and Dubai. Slow but rigorous; samples are city-specific.",
    isDemo: true,
  },
  {
    id: "SRC-011",
    name: "GCC youth financial habits survey by a regional research house (demo)",
    url: null,
    sourceType: "consumer_survey",
    credibility: 3,
    biasTags: ["survey_limitation", "sample_size_limitation", "recency_bias"],
    roles: ["data", "validation"],
    dateAdded: "2026-02-12",
    notes:
      "Quarterly online survey of 18–30 year olds in Saudi Arabia, the UAE and Kuwait on credit, payments and banking trust. Directionally useful; online-panel skew towards the digitally engaged.",
    isDemo: true,
  },
  {
    id: "SRC-012",
    name: "Analyst field notes from Riyadh and Jeddah coffee districts (demo)",
    url: null,
    sourceType: "ethnographic_observation",
    credibility: 3,
    biasTags: ["anecdotal_limitation", "sample_size_limitation"],
    roles: ["discovery", "context"],
    dateAdded: "2025-10-20",
    notes:
      "Structured observation visits (weekday evenings and weekends) recording occupancy, group composition, dwell time and use of space in specialty coffee houses. Rich texture, small sample.",
    isDemo: true,
  },
  {
    id: "SRC-013",
    name: "Gulf banking sector note from a regional investment bank (demo)",
    url: null,
    sourceType: "financial_research",
    credibility: 4,
    biasTags: ["investor_optimism", "commercial_bias"],
    roles: ["validation", "data"],
    dateAdded: "2026-01-28",
    notes:
      "Equity-research coverage of listed Gulf banks and consumer-finance firms, including technology capex and BNPL exposure. Numerate and sourced; written to support buy theses.",
    isDemo: true,
  },
  {
    id: "SRC-014",
    name: "Programming calendars of Saudi cultural seasons and public festivals (demo)",
    url: null,
    sourceType: "event_announcement",
    credibility: 3,
    biasTags: ["government_agenda", "pr_framing", "gulf_boosterism"],
    roles: ["discovery", "monitoring"],
    dateAdded: "2025-09-10",
    notes:
      "Aggregated listings of state-backed cultural seasons, festivals and commissions. A reliable index of what is being funded and staged; says nothing about attendance quality or repeat visits.",
    isDemo: true,
  },
  {
    id: "SRC-015",
    name: "Search trend dashboard for GCC lifestyle and property queries (demo)",
    url: null,
    sourceType: "search_trend_data",
    credibility: 3,
    biasTags: ["recency_bias", "sample_size_limitation"],
    roles: ["data", "monitoring"],
    dateAdded: "2025-11-25",
    notes:
      "Weekly index of search interest across housing, schooling, wellness and retail terms in Arabic and English for KSA and UAE. Good for momentum; poor at distinguishing curiosity from intent.",
    isDemo: true,
  },
  {
    id: "SRC-016",
    name: "Internal analyst memo — Reading the Region desk (demo)",
    url: null,
    sourceType: "internal_note",
    credibility: 3,
    biasTags: ["anecdotal_limitation", "recency_bias"],
    roles: ["interpretation", "context"],
    dateAdded: "2026-03-05",
    notes:
      "Working synthesis notes by the desk: interview digests, cross-source comparisons and hypotheses in progress. Never cited as external evidence; used to carry interpretation between entities.",
    isDemo: true,
  },
];
