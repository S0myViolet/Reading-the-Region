/**
 * Reading the Region — core data model.
 *
 * The model mirrors the intelligence pyramid:
 * Observation → Signal → Cluster → Pattern → Contradiction → Driver
 * → Future Territory → Scenario → Strategic Implication → Monitoring Indicator.
 *
 * Every layer reduces noise while increasing meaning. Objects reference each
 * other by id so evidence can be traced downward from any conclusion.
 */

// ---------------------------------------------------------------------------
// Shared enums and vocabularies
// ---------------------------------------------------------------------------

export type ReviewStatus =
  | "draft"
  | "needs_evidence"
  | "needs_human_review"
  | "ai_suggested"
  | "human_reviewed"
  | "validated"
  | "rejected"
  | "archived_noise"
  | "duplicate"
  | "contradictory"
  | "monitoring";

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: "Draft",
  needs_evidence: "Needs evidence",
  needs_human_review: "Needs human review",
  ai_suggested: "AI suggested",
  human_reviewed: "Human reviewed",
  validated: "Validated",
  rejected: "Rejected",
  archived_noise: "Archived as noise",
  duplicate: "Duplicate",
  contradictory: "Contradictory",
  monitoring: "Monitoring",
};

export type ConfidenceLevel = "low" | "medium" | "high";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

export type TimeHorizon =
  | "immediate"
  | "near_term"
  | "mid_term"
  | "long_term"
  | "distant";

export const TIME_HORIZON_LABELS: Record<TimeHorizon, string> = {
  immediate: "Immediate — already happening",
  near_term: "Near-term — 0–2 years",
  mid_term: "Mid-term — 3–5 years",
  long_term: "Long-term — 5–10 years",
  distant: "Distant — 10+ years",
};

export const TIME_HORIZON_SHORT: Record<TimeHorizon, string> = {
  immediate: "Now",
  near_term: "0–2 yrs",
  mid_term: "3–5 yrs",
  long_term: "5–10 yrs",
  distant: "10+ yrs",
};

export type SignalStrength =
  | "weak"
  | "emerging"
  | "established"
  | "mainstream"
  | "declining"
  | "contradictory";

export const SIGNAL_STRENGTH_LABELS: Record<SignalStrength, string> = {
  weak: "Weak signal",
  emerging: "Emerging signal",
  established: "Established signal",
  mainstream: "Mainstream trend",
  declining: "Declining signal",
  contradictory: "Contradictory signal",
};

/** 1–5 rubric score used across the platform. */
export type Score = 1 | 2 | 3 | 4 | 5;

export type Region =
  | "GCC"
  | "UAE"
  | "Saudi Arabia"
  | "Qatar"
  | "Kuwait"
  | "Bahrain"
  | "Oman"
  | "Egypt"
  | "Levant"
  | "North Africa"
  | "MENA-wide"
  | "Global with regional significance";

export type Sector =
  | "government_policy"
  | "real_estate_urban"
  | "hospitality_tourism"
  | "fashion_luxury"
  | "culture_arts_heritage"
  | "media_entertainment_creator"
  | "technology_ai"
  | "retail_commerce"
  | "food_beverage_third_places"
  | "health_wellness_longevity"
  | "sports_gaming"
  | "mobility_transport"
  | "education_work"
  | "finance_banking_investment"
  | "climate_energy_environment"
  | "religion_ritual_ramadan"
  | "migration_citizenship_belonging";

export const SECTOR_LABELS: Record<Sector, string> = {
  government_policy: "Government & Policy",
  real_estate_urban: "Real Estate & Urban Development",
  hospitality_tourism: "Hospitality & Tourism",
  fashion_luxury: "Fashion & Luxury",
  culture_arts_heritage: "Culture, Arts, Museums & Heritage",
  media_entertainment_creator: "Media, Entertainment & Creator Economy",
  technology_ai: "Technology & AI",
  retail_commerce: "Retail & Commerce",
  food_beverage_third_places: "Food, Beverage & Third Places",
  health_wellness_longevity: "Health, Wellness & Longevity",
  sports_gaming: "Sports & Gaming",
  mobility_transport: "Mobility & Transport",
  education_work: "Education & Work",
  finance_banking_investment: "Finance, Banking & Investment",
  climate_energy_environment: "Climate, Energy & Environment",
  religion_ritual_ramadan: "Religion, Ritual & Ramadan",
  migration_citizenship_belonging: "Migration, Citizenship & Belonging",
};

export type SystemAffected =
  | "identity"
  | "cultural_production"
  | "media"
  | "education"
  | "labour"
  | "migration"
  | "housing"
  | "healthcare"
  | "tourism"
  | "religious_ritual"
  | "retail"
  | "luxury"
  | "mobility"
  | "urban"
  | "climate"
  | "technology"
  | "finance"
  | "governance"
  | "family"
  | "community"
  | "trust"
  | "attention"
  | "creativity"
  | "consumption"
  | "infrastructure"
  | "capital";

export const SYSTEM_LABELS: Record<SystemAffected, string> = {
  identity: "Identity system",
  cultural_production: "Cultural production system",
  media: "Media system",
  education: "Education system",
  labour: "Labour system",
  migration: "Migration system",
  housing: "Housing system",
  healthcare: "Healthcare system",
  tourism: "Tourism system",
  religious_ritual: "Religious & ritual system",
  retail: "Retail system",
  luxury: "Luxury system",
  mobility: "Mobility system",
  urban: "Urban system",
  climate: "Climate system",
  technology: "Technology system",
  finance: "Finance system",
  governance: "Governance system",
  family: "Family system",
  community: "Community system",
  trust: "Trust system",
  attention: "Attention system",
  creativity: "Creativity system",
  consumption: "Consumption system",
  infrastructure: "Infrastructure system",
  capital: "Capital system",
};

export type ActorType =
  | "government"
  | "sovereign_fund"
  | "corporation"
  | "startup"
  | "sme"
  | "developer"
  | "brand"
  | "platform"
  | "cultural_institution"
  | "creator"
  | "consumer"
  | "community"
  | "investor"
  | "academic"
  | "ngo"
  | "media_outlet";

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  government: "Government / regulator",
  sovereign_fund: "Sovereign fund",
  corporation: "Corporation",
  startup: "Startup",
  sme: "SME / independent business",
  developer: "Developer / operator",
  brand: "Brand",
  platform: "Platform",
  cultural_institution: "Cultural institution",
  creator: "Creator / talent",
  consumer: "Consumer / resident",
  community: "Community / grassroots",
  investor: "Investor",
  academic: "Academic / researcher",
  ngo: "NGO / civil society",
  media_outlet: "Media outlet",
};

export type TypeOfChange =
  | "behavioural"
  | "cultural"
  | "economic"
  | "technological"
  | "regulatory"
  | "infrastructural"
  | "demographic"
  | "environmental"
  | "institutional";

export const TYPE_OF_CHANGE_LABELS: Record<TypeOfChange, string> = {
  behavioural: "Behavioural change",
  cultural: "Cultural change",
  economic: "Economic change",
  technological: "Technological change",
  regulatory: "Regulatory change",
  infrastructural: "Infrastructural change",
  demographic: "Demographic change",
  environmental: "Environmental change",
  institutional: "Institutional change",
};

/**
 * Provenance label for every analytical statement. AI output must never be
 * presented as sourced fact.
 */
export type ProvenanceLabel =
  | "sourced_fact"
  | "sourced_interpretation"
  | "ai_inference"
  | "human_interpretation"
  | "hypothesis"
  | "speculative_possibility"
  | "validated_conclusion"
  | "contradiction";

export const PROVENANCE_LABELS: Record<ProvenanceLabel, string> = {
  sourced_fact: "Sourced fact",
  sourced_interpretation: "Sourced interpretation",
  ai_inference: "AI inference",
  human_interpretation: "Human interpretation",
  hypothesis: "Hypothesis",
  speculative_possibility: "Speculative possibility",
  validated_conclusion: "Validated conclusion",
  contradiction: "Contradiction",
};

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export type SourceType =
  | "government_policy"
  | "international_org"
  | "academic_research"
  | "consulting_report"
  | "industry_report"
  | "financial_research"
  | "trade_publication"
  | "news_publication"
  | "cultural_publication"
  | "social_media"
  | "community_forum"
  | "expert_interview"
  | "company_announcement"
  | "startup_launch"
  | "event_announcement"
  | "platform_data"
  | "search_trend_data"
  | "consumer_survey"
  | "ethnographic_observation"
  | "internal_note";

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  government_policy: "Government / official policy",
  international_org: "International organization",
  academic_research: "Academic research",
  consulting_report: "Consulting report",
  industry_report: "Industry report",
  financial_research: "Financial / investment research",
  trade_publication: "Trade publication",
  news_publication: "News publication",
  cultural_publication: "Cultural publication",
  social_media: "Social media",
  community_forum: "Community forum",
  expert_interview: "Expert interview",
  company_announcement: "Company announcement",
  startup_launch: "Startup / product launch",
  event_announcement: "Event / programming announcement",
  platform_data: "Platform data",
  search_trend_data: "Search trend data",
  consumer_survey: "Consumer survey",
  ethnographic_observation: "Ethnographic observation",
  internal_note: "Internal note",
};

export type BiasTag =
  | "commercial_bias"
  | "government_agenda"
  | "investor_optimism"
  | "pr_framing"
  | "cultural_editorial_bias"
  | "western_centric"
  | "gulf_boosterism"
  | "anti_gulf"
  | "luxury_market_bias"
  | "platform_self_promotion"
  | "survey_limitation"
  | "sample_size_limitation"
  | "anecdotal_limitation"
  | "recency_bias";

export const BIAS_TAG_LABELS: Record<BiasTag, string> = {
  commercial_bias: "Commercial bias",
  government_agenda: "Government agenda",
  investor_optimism: "Investor optimism",
  pr_framing: "PR framing",
  cultural_editorial_bias: "Cultural editorial bias",
  western_centric: "Western-centric bias",
  gulf_boosterism: "Gulf boosterism",
  anti_gulf: "Anti-Gulf bias",
  luxury_market_bias: "Luxury-market bias",
  platform_self_promotion: "Platform self-promotion",
  survey_limitation: "Survey limitation",
  sample_size_limitation: "Sample-size limitation",
  anecdotal_limitation: "Anecdotal limitation",
  recency_bias: "Recency bias",
};

/**
 * Credibility and role are deliberately separate. A source can be a strong
 * discovery source and a weak validation source at the same time.
 */
export type SourceRole =
  | "discovery"
  | "validation"
  | "context"
  | "contradiction"
  | "data"
  | "interpretation"
  | "monitoring";

export const SOURCE_ROLE_LABELS: Record<SourceRole, string> = {
  discovery: "Discovery source",
  validation: "Validation source",
  context: "Context source",
  contradiction: "Contradiction source",
  data: "Data source",
  interpretation: "Interpretation source",
  monitoring: "Monitoring source",
};

export const CREDIBILITY_LABELS: Record<Score, string> = {
  5: "Very high credibility",
  4: "High credibility",
  3: "Medium credibility",
  2: "Low–medium credibility",
  1: "Low credibility",
};

export interface Source {
  id: string;
  name: string;
  url: string | null;
  sourceType: SourceType;
  credibility: Score;
  biasTags: BiasTag[];
  roles: SourceRole[];
  dateAdded: string; // ISO date
  notes: string;
  isDemo: boolean; // sample/demo sources are labelled, never presented as real citations
}

// ---------------------------------------------------------------------------
// Observations (Scan Inbox)
// ---------------------------------------------------------------------------

export type ObservationStatus =
  | "unreviewed"
  | "promoted"
  | "archived_noise"
  | "needs_more_evidence"
  | "duplicate"
  | "split"
  | "merged";

export const OBSERVATION_STATUS_LABELS: Record<ObservationStatus, string> = {
  unreviewed: "Unreviewed",
  promoted: "Promoted to signal",
  archived_noise: "Archived as noise",
  needs_more_evidence: "Needs more evidence",
  duplicate: "Duplicate",
  split: "Split into signals",
  merged: "Merged",
};

/**
 * Promotion checklist. An observation may be promoted only when at least
 * three criteria hold (PROMOTION_MIN_CRITERIA).
 */
export interface PromotionChecklist {
  behaviourShift: boolean;
  systemShift: boolean;
  surprising: boolean;
  widerRegionalIssue: boolean;
  credibleSource: boolean;
  futureImplications: boolean;
  connectedToOthers: boolean;
  revealsTension: boolean;
  earlyButMeaningful: boolean;
}

export const PROMOTION_CRITERIA: Array<{
  key: keyof PromotionChecklist;
  label: string;
}> = [
  { key: "behaviourShift", label: "Suggests a behaviour shift" },
  { key: "systemShift", label: "Suggests a system shift" },
  { key: "surprising", label: "Feels surprising or non-obvious" },
  { key: "widerRegionalIssue", label: "Connects to a wider regional issue" },
  { key: "credibleSource", label: "Supported by a credible source" },
  { key: "futureImplications", label: "May have future implications" },
  { key: "connectedToOthers", label: "Appears connected to other observations" },
  { key: "revealsTension", label: "Reveals tension or contradiction" },
  { key: "earlyButMeaningful", label: "Early but potentially meaningful" },
];

export const PROMOTION_MIN_CRITERIA = 3;

export interface Observation {
  id: string;
  title: string;
  description: string;
  sourceId: string | null;
  sourceName: string; // denormalised for quick capture before a source exists
  sourceUrl: string | null;
  sourceType: SourceType;
  dateObserved: string;
  eventDate: string | null;
  region: Region;
  country: string;
  city: string | null;
  sectors: Sector[];
  subsector: string | null;
  actorInvolved: string | null;
  initialNotes: string;
  potentialFutureRelevance: string;
  status: ObservationStatus;
  /** Why the observation was archived / not promoted — feeds the Noise Filter. */
  triageRationale: string | null;
  checklist: PromotionChecklist;
  promotedSignalId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

export interface SignalScores {
  novelty: Score;
  momentum: Score;
  evidence: Score;
  strategicRelevance: Score;
  behaviouralImpact: Score;
  emotionalImpact: Score;
  structuralImpact: Score;
  crossSectorRelevance: Score;
  geographicRelevance: Score;
}

export const SCORE_DIMENSION_LABELS: Record<keyof SignalScores, string> = {
  novelty: "Novelty",
  momentum: "Momentum",
  evidence: "Evidence",
  strategicRelevance: "Strategic relevance",
  behaviouralImpact: "Behavioural impact",
  emotionalImpact: "Emotional impact",
  structuralImpact: "Structural impact",
  crossSectorRelevance: "Cross-sector relevance",
  geographicRelevance: "Geographic relevance",
};

/** Rubric anchors for each 1–5 scoring dimension, shown in the scoring UI. */
export const SCORE_RUBRICS: Record<keyof SignalScores, Record<Score, string>> = {
  novelty: {
    1: "Already mainstream",
    2: "Familiar but slightly evolving",
    3: "Moderately new",
    4: "Surprising and emerging",
    5: "Highly novel, strange, or unexpected",
  },
  momentum: {
    1: "Isolated event",
    2: "Limited repetition",
    3: "Repeated in one sector",
    4: "Growing across sectors or geographies",
    5: "Accelerating rapidly with investment, adoption, or policy support",
  },
  evidence: {
    1: "Anecdotal only",
    2: "Single weak source",
    3: "Credible source but isolated",
    4: "Multiple credible sources",
    5: "Multiple independent credible sources plus data",
  },
  strategicRelevance: {
    1: "Interesting but low relevance",
    2: "Niche relevance",
    3: "Category relevance",
    4: "Cross-category relevance",
    5: "High strategic relevance across sectors",
  },
  behaviouralImpact: {
    1: "No behaviour change",
    2: "Symbolic change only",
    3: "Minor behaviour change",
    4: "Meaningful behaviour change",
    5: "Behaviour restructured at scale",
  },
  emotionalImpact: {
    1: "No emotional shift",
    2: "Minor emotional relevance",
    3: "Moderate emotional relevance",
    4: "Strong emotional shift",
    5: "Deep psychological or cultural shift",
  },
  structuralImpact: {
    1: "No structural impact",
    2: "Small business impact",
    3: "Category-level impact",
    4: "Industry or system impact",
    5: "Systemic or regional impact",
  },
  crossSectorRelevance: {
    1: "One niche only",
    2: "One sector",
    3: "Adjacent sectors",
    4: "Multiple sectors",
    5: "Region-wide systemic relevance",
  },
  geographicRelevance: {
    1: "Hyperlocal",
    2: "City-level",
    3: "National",
    4: "GCC or MENA regional",
    5: "Global with regional significance",
  },
};

/**
 * The zooming method. Four mandatory levels; the app must not allow a jump
 * from event (level 1) straight to future (level 4).
 */
export interface ZoomAnalysis {
  /** Level 1 — What happened? Factual only. */
  whatHappened: string;
  /** Level 2 — What behaviour does this reveal? Grounded in the event. */
  behaviourChanged: string;
  /** Level 3 — What system is changing? Connects behaviour to a larger system. */
  systemChanged: string;
  /** Level 4 — What future becomes more plausible if this continues? */
  futurePlausible: string;
  /** Level 4 must be explicitly flagged when evidence is weak. */
  futureIsSpeculative: boolean;
}

export interface SystemsAnalysis {
  firstOrderEffect: string;
  secondOrderEffect: string;
  thirdOrderEffect: string;
  reinforcingLoops: string[];
  balancingLoops: string[];
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  dateObserved: string;
  eventDate: string | null;
  sourceIds: string[];
  observationId: string | null; // provenance: the observation it was promoted from
  region: Region;
  country: string;
  city: string | null;
  sectors: Sector[];
  subsector: string | null;
  actorTypes: ActorType[];
  primaryActor: string;
  typeOfChange: TypeOfChange[];
  systemsAffected: SystemAffected[];
  signalStrength: SignalStrength;
  scores: SignalScores;
  timeHorizon: TimeHorizon;
  confidence: ConfidenceLevel;
  whyItMatters: string;
  zoom: ZoomAnalysis;
  systems: SystemsAnalysis | null;
  potentialImplications: string[];
  assumptions: string[];
  openQuestions: string[];
  contradictionIds: string[];
  relatedSignalIds: string[];
  clusterIds: string[];
  patternIds: string[];
  driverIds: string[];
  monitoringIndicatorIds: string[];
  tags: string[];
  humanNotes: string;
  /** AI-drafted notes; always labelled in the UI, never shown as fact. */
  aiNotes: string;
  aiNotesLabel: ProvenanceLabel | null;
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Clusters
// ---------------------------------------------------------------------------

export interface ClusterScores {
  breadth: Score;
  depth: Score;
  coherence: Score;
  persistence: Score;
  acceleration: Score;
  regionalRelevance: Score;
  strategicRelevance: Score;
  contradictionRichness: Score;
  systemicPotential: Score;
}

export const CLUSTER_SCORE_LABELS: Record<keyof ClusterScores, string> = {
  breadth: "Breadth",
  depth: "Depth",
  coherence: "Coherence",
  persistence: "Persistence",
  acceleration: "Acceleration",
  regionalRelevance: "Regional relevance",
  strategicRelevance: "Strategic relevance",
  contradictionRichness: "Contradiction richness",
  systemicPotential: "Systemic potential",
};

export type ClusterStatus = "candidate" | "valid" | "dissolved";

export interface Cluster {
  id: string;
  /** A sentence expressing shared logic — never a topic word. */
  name: string;
  /** One sentence saying what the cluster means in normal language. */
  plainMeaning?: string;
  unifyingQuestion: string;
  clusterStatement: string;
  signalIds: string[];
  contradictionIds: string[];
  evidenceSummary: string;
  scores: ClusterScores;
  possiblePatternIds: string[];
  possibleDriverIds: string[];
  confidence: ConfidenceLevel;
  status: ClusterStatus;
  reviewStatus: ReviewStatus;
  humanNotes: string;
  createdAt: string;
  updatedAt: string;
}

/** Validation thresholds for a cluster (see lib/validation.ts). */
export const CLUSTER_THRESHOLDS = {
  minSignals: 8,
  minIndependentSources: 3,
  minSectors: 2,
  minActorTypes: 2,
  minContradictions: 1,
  minBreadth: 3,
  minDepth: 3,
  minCoherence: 4,
  minStrategicRelevance: 3,
} as const;

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

export type PatternType =
  | "behavioural"
  | "emotional"
  | "cultural"
  | "economic"
  | "technological"
  | "regulatory"
  | "infrastructure"
  | "demographic";

export const PATTERN_TYPE_LABELS: Record<PatternType, string> = {
  behavioural: "Behavioural pattern",
  emotional: "Emotional pattern",
  cultural: "Cultural pattern",
  economic: "Economic pattern",
  technological: "Technological pattern",
  regulatory: "Regulatory pattern",
  infrastructure: "Infrastructure pattern",
  demographic: "Demographic pattern",
};

export type PatternValidationStatus = "hypothesis" | "partially_validated" | "validated";

export interface Pattern {
  id: string;
  name: string;
  /** One sentence saying what the pattern means in normal language. */
  plainMeaning?: string;
  patternType: PatternType;
  patternStatement: string;
  evidenceSummary: string;
  keySignalIds: string[];
  clusterIds: string[];
  contradictionIds: string[];
  possibleDriverIds: string[];
  strategicMeaning: string;
  /** Earliest evidence date — used by the persistence test. */
  firstEvidenceDate: string;
  /** Latest evidence date — used by the persistence test. */
  latestEvidenceDate: string;
  independentSourceCount: number;
  confidence: ConfidenceLevel;
  validationStatus: PatternValidationStatus;
  reviewStatus: ReviewStatus;
  humanNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const PATTERN_THRESHOLDS = {
  minSectors: 3, // breadth test
  minIndependentSources: 5, // depth test
  minMonthsPersistence: 6, // persistence test
  // optional stronger thresholds
  strongMinSignals: 20,
  strongMinSectors: 5,
  strongMinGeographies: 2,
  strongMinActorTypes: 3,
} as const;

// ---------------------------------------------------------------------------
// Contradictions
// ---------------------------------------------------------------------------

export type ContradictionType =
  | "adoption_vs_resistance"
  | "global_vs_local"
  | "speed_vs_trust"
  | "digital_vs_physical"
  | "luxury_vs_accessibility"
  | "growth_vs_sustainability"
  | "permanence_vs_mobility"
  | "automation_vs_human_meaning"
  | "national_ambition_vs_individual_identity";

export const CONTRADICTION_TYPE_LABELS: Record<ContradictionType, string> = {
  adoption_vs_resistance: "Adoption vs Resistance",
  global_vs_local: "Global vs Local",
  speed_vs_trust: "Speed vs Trust",
  digital_vs_physical: "Digital vs Physical",
  luxury_vs_accessibility: "Luxury vs Accessibility",
  growth_vs_sustainability: "Growth vs Sustainability",
  permanence_vs_mobility: "Permanence vs Mobility",
  automation_vs_human_meaning: "Automation vs Human Meaning",
  national_ambition_vs_individual_identity: "National Ambition vs Individual Identity",
};

export interface ContradictionScores {
  tensionStrength: Score;
  strategicRichness: Score;
  evidenceBalance: Score;
  futureImpact: Score;
  emotionalCharge: Score;
}

export const CONTRADICTION_SCORE_LABELS: Record<keyof ContradictionScores, string> = {
  tensionStrength: "Tension strength",
  strategicRichness: "Strategic richness",
  evidenceBalance: "Evidence balance",
  futureImpact: "Future impact",
  emotionalCharge: "Emotional charge",
};

export interface Contradiction {
  id: string;
  name: string;
  contradictionType: ContradictionType;
  sideA: string;
  sideB: string;
  evidenceSideA: string;
  evidenceSideB: string;
  /** Signal ids supporting each side — keeps the tension evidence-linked. */
  sideASignalIds: string[];
  sideBSignalIds: string[];
  underlyingTension: string;
  whoBenefits: string;
  whoLoses: string;
  possibleResolution: string;
  possibleEscalation: string;
  strategicImplication: string;
  scenarioRelevance: string;
  scores: ContradictionScores;
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

export interface DriverScores {
  explanatoryPower: Score;
  crossSectorStrength: Score;
  evidenceStrength: Score;
  persistence: Score;
  reversibility: Score;
  behaviouralImpact: Score;
  structuralImpact: Score;
  contradictionRichness: Score;
  scenarioUsefulness: Score;
  strategicRelevance: Score;
}

export const DRIVER_SCORE_LABELS: Record<keyof DriverScores, string> = {
  explanatoryPower: "Explanatory power",
  crossSectorStrength: "Cross-sector strength",
  evidenceStrength: "Evidence strength",
  persistence: "Persistence",
  reversibility: "Reversibility",
  behaviouralImpact: "Behavioural impact",
  structuralImpact: "Structural impact",
  contradictionRichness: "Contradiction richness",
  scenarioUsefulness: "Scenario usefulness",
  strategicRelevance: "Strategic relevance",
};

export type DriverStatus = "hypothesis" | "validated";

export interface Driver {
  id: string;
  name: string;
  /** Must explain, not describe. */
  driverStatement: string;
  whatItExplains: string;
  patternIds: string[];
  signalIds: string[];
  systemsAffected: SystemAffected[];
  contradictionIds: string[];
  secondOrderEffects: string[];
  thirdOrderEffects: string[];
  possibleFutures: string[];
  leadingIndicatorIds: string[];
  independentSourceCount: number;
  scores: DriverScores;
  confidence: ConfidenceLevel;
  status: DriverStatus;
  reviewStatus: ReviewStatus;
  humanNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const DRIVER_THRESHOLDS = {
  minPatterns: 3,
  minSignals: 30,
  minSectors: 5,
  minIndependentSources: 8,
  minContradictions: 2,
} as const;

// ---------------------------------------------------------------------------
// Future Territories
// ---------------------------------------------------------------------------

export type TerritoryMonitoringStatus =
  | "strengthening"
  | "weakening"
  | "mutating"
  | "contradicted"
  | "needs_more_evidence"
  | "dormant";

export const TERRITORY_MONITORING_LABELS: Record<TerritoryMonitoringStatus, string> = {
  strengthening: "Strengthening",
  weakening: "Weakening",
  mutating: "Mutating",
  contradicted: "Contradicted",
  needs_more_evidence: "Needs more evidence",
  dormant: "Dormant",
};

export interface SectorImplicationNote {
  sector: Sector;
  note: string;
}

export interface FutureTerritory {
  id: string;
  name: string;
  oneLineDefinition: string;
  whyEmerging: string;
  driverIds: string[];
  patternIds: string[];
  clusterIds: string[];
  representativeSignalIds: string[];
  contradictionIds: string[];
  whatItChanges: string;
  whoItAffects: string[];
  sectorImplications: SectorImplicationNote[];
  scenarioIds: string[];
  risks: string[];
  opportunities: string[];
  leadingIndicatorIds: string[];
  evidenceStrength: Score;
  scenarioReadiness: "not_ready" | "ready" | "scenarios_active";
  monitoringStatus: TerritoryMonitoringStatus;
  confidence: ConfidenceLevel;
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export type ScenarioType =
  | "optimistic"
  | "pessimistic"
  | "conservative"
  | "transformational"
  | "wildcard";

export const SCENARIO_TYPE_LABELS: Record<ScenarioType, string> = {
  optimistic: "Optimistic",
  pessimistic: "Pessimistic",
  conservative: "Conservative",
  transformational: "Transformational",
  wildcard: "Wildcard",
};

export type ScenarioHorizon = "near" | "mid" | "long";

export const SCENARIO_HORIZON_LABELS: Record<ScenarioHorizon, string> = {
  near: "Near future — 1–2 years",
  mid: "Mid future — 3–5 years",
  long: "Long future — 5–10 years",
};

export interface ScenarioQualityChecks {
  plausible: boolean;
  internallyCoherent: boolean;
  evidenceLinked: boolean;
  strategicallyRelevant: boolean;
  differentiated: boolean;
  notOptimisticFantasy: boolean;
  notPureDystopia: boolean;
  connectedToTodaysSignals: boolean;
  usefulForDecisions: boolean;
}

export const SCENARIO_QUALITY_LABELS: Record<keyof ScenarioQualityChecks, string> = {
  plausible: "Plausible",
  internallyCoherent: "Internally coherent",
  evidenceLinked: "Evidence-linked",
  strategicallyRelevant: "Strategically relevant",
  differentiated: "Different from other scenarios",
  notOptimisticFantasy: "Not optimistic fantasy",
  notPureDystopia: "Not pure dystopia",
  connectedToTodaysSignals: "Connected to today's signals",
  usefulForDecisions: "Useful for decision-making",
};

export interface ScenarioAssumption {
  text: string;
  label: ProvenanceLabel; // typically "hypothesis" or "speculative_possibility"
}

export interface Scenario {
  id: string;
  title: string;
  territoryId: string;
  horizon: ScenarioHorizon;
  scenarioType: ScenarioType;
  corePremise: string;
  whatHasChanged: string;
  howPeopleBehave: string;
  howInstitutionsBehave: string;
  howBrandsBehave: string;
  keyTechnologies: string[];
  keyPolicies: string[];
  keyCulturalShifts: string[];
  winners: string[];
  losers: string[];
  risks: string[];
  opportunities: string[];
  earlySigns: string[];
  strategicQuestions: string[];
  supportingSignalIds: string[];
  supportingPatternIds: string[];
  supportingDriverIds: string[];
  shapingContradictionIds: string[];
  assumptions: ScenarioAssumption[];
  qualityChecks: ScenarioQualityChecks;
  confidence: ConfidenceLevel;
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Strategic Implications
// ---------------------------------------------------------------------------

export type ImplicationAudience =
  | "brands"
  | "governments"
  | "tourism_boards"
  | "hotels"
  | "developers"
  | "retailers"
  | "luxury_brands"
  | "banks"
  | "telecoms"
  | "media_platforms"
  | "entertainment"
  | "education_providers"
  | "healthcare_providers"
  | "cultural_institutions"
  | "startups"
  | "investors"
  | "agencies"
  | "urban_planners";

export const IMPLICATION_AUDIENCE_LABELS: Record<ImplicationAudience, string> = {
  brands: "Brands",
  governments: "Governments",
  tourism_boards: "Tourism boards",
  hotels: "Hotels",
  developers: "Developers",
  retailers: "Retailers",
  luxury_brands: "Luxury brands",
  banks: "Banks",
  telecoms: "Telecoms",
  media_platforms: "Media platforms",
  entertainment: "Entertainment companies",
  education_providers: "Education providers",
  healthcare_providers: "Healthcare providers",
  cultural_institutions: "Cultural institutions",
  startups: "Startups",
  investors: "Investors",
  agencies: "Agencies",
  urban_planners: "Urban planners",
};

export type ImplicationType =
  | "brand"
  | "product"
  | "communication"
  | "experience"
  | "innovation"
  | "media"
  | "partnership"
  | "research"
  | "risk"
  | "capability";

export const IMPLICATION_TYPE_LABELS: Record<ImplicationType, string> = {
  brand: "Brand implication",
  product: "Product implication",
  communication: "Communication implication",
  experience: "Experience implication",
  innovation: "Innovation implication",
  media: "Media implication",
  partnership: "Partnership implication",
  research: "Research implication",
  risk: "Risk implication",
  capability: "Capability implication",
};

export interface StrategicImplication {
  id: string;
  territoryId: string | null;
  scenarioId: string | null;
  sectors: Sector[];
  audiences: ImplicationAudience[];
  implicationType: ImplicationType;
  implication: string;
  whyItMatters: string;
  /** Evidence links back down the pyramid — an implication without these is flagged. */
  evidenceSignalIds: string[];
  evidenceDriverIds: string[];
  opportunity: string;
  risk: string;
  recommendedAction: string;
  confidence: ConfidenceLevel;
  timeHorizon: TimeHorizon;
  reviewStatus: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Monitoring
// ---------------------------------------------------------------------------

export type IndicatorType =
  | "policy"
  | "investment"
  | "behaviour"
  | "cultural"
  | "infrastructure"
  | "technology"
  | "media"
  | "consumer"
  | "demographic"
  | "contradiction"
  | "resistance";

export const INDICATOR_TYPE_LABELS: Record<IndicatorType, string> = {
  policy: "Policy indicator",
  investment: "Investment indicator",
  behaviour: "Behaviour indicator",
  cultural: "Cultural indicator",
  infrastructure: "Infrastructure indicator",
  technology: "Technology indicator",
  media: "Media indicator",
  consumer: "Consumer indicator",
  demographic: "Demographic indicator",
  contradiction: "Contradiction indicator",
  resistance: "Resistance indicator",
};

export type IndicatorTrend =
  | "strengthening"
  | "weakening"
  | "stable"
  | "contradictory";

export const INDICATOR_TREND_LABELS: Record<IndicatorTrend, string> = {
  strengthening: "Strengthening",
  weakening: "Weakening",
  stable: "Stable",
  contradictory: "Contradictory",
};

export type MonitoringCadence =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "biannual"
  | "annual";

export const CADENCE_LABELS: Record<MonitoringCadence, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  biannual: "Biannually",
  annual: "Annually",
};

export interface MonitoringIndicator {
  id: string;
  name: string;
  territoryId: string | null;
  driverId: string | null;
  signalId: string | null;
  indicatorType: IndicatorType;
  description: string;
  currentStatus: string;
  evidence: string;
  dateLastChecked: string;
  trend: IndicatorTrend;
  cadence: MonitoringCadence;
  confidence: ConfidenceLevel;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Misc shared objects
// ---------------------------------------------------------------------------

export interface UserNote {
  id: string;
  objectType: EntityKind;
  objectId: string;
  text: string;
  author: string;
  createdAt: string;
}

export type EntityKind =
  | "observation"
  | "source"
  | "signal"
  | "cluster"
  | "pattern"
  | "contradiction"
  | "driver"
  | "territory"
  | "scenario"
  | "implication"
  | "indicator";

export const ENTITY_KIND_LABELS: Record<EntityKind, string> = {
  observation: "Observation",
  source: "Source",
  signal: "Signal",
  cluster: "Cluster",
  pattern: "Pattern",
  contradiction: "Contradiction",
  driver: "Driver",
  territory: "Future territory",
  scenario: "Scenario",
  implication: "Strategic implication",
  indicator: "Monitoring indicator",
};

/** Route prefix per entity kind, for cross-linking components. */
export const ENTITY_ROUTES: Record<EntityKind, string> = {
  observation: "/inbox",
  source: "/sources",
  signal: "/signals",
  cluster: "/clusters",
  pattern: "/patterns",
  contradiction: "/contradictions",
  driver: "/drivers",
  territory: "/territories",
  scenario: "/scenarios",
  implication: "/implications",
  indicator: "/monitoring",
};
