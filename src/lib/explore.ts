/**
 * Explore taxonomy: the browsable questions, places and themes of Simple
 * Mode. Each entry maps a human question onto the underlying classification
 * (sectors, systems, countries, keywords) so topic pages can gather the
 * signals, stories, tensions and watch items that belong to it — without
 * the user ever touching a filter panel.
 */

import type { IntelligenceData } from "./store";
import type {
  Cluster,
  Contradiction,
  MonitoringIndicator,
  Sector,
  Signal,
  StrategicImplication,
  SystemAffected,
} from "./types";

export interface ExploreTopic {
  slug: string;
  kind: "question" | "place" | "theme";
  title: string;
  /** Short subtitle shown on the topic card. */
  hint: string;
  sectors?: Sector[];
  systems?: SystemAffected[];
  countries?: string[];
  keywords?: string[];
}

export const EXPLORE_QUESTIONS: ExploreTopic[] = [
  {
    slug: "gulf-cities",
    kind: "question",
    title: "What is changing in Gulf cities?",
    hint: "Urban life, mobility, districts, public space",
    sectors: ["real_estate_urban", "mobility_transport"],
    systems: ["urban", "mobility", "infrastructure", "housing"],
  },
  {
    slug: "youth-culture",
    kind: "question",
    title: "What is changing in youth culture?",
    hint: "Community, sport, spending, third places",
    sectors: ["sports_gaming", "food_beverage_third_places", "media_entertainment_creator"],
    systems: ["community", "attention", "consumption"],
    keywords: ["youth", "young"],
  },
  {
    slug: "luxury",
    kind: "question",
    title: "What is changing in luxury?",
    hint: "Regional design, heritage, premium trust",
    sectors: ["fashion_luxury", "retail_commerce"],
    systems: ["luxury", "identity", "consumption"],
  },
  {
    slug: "ai-trust",
    kind: "question",
    title: "What is changing in AI and trust?",
    hint: "Automation, verification, human premium",
    sectors: ["technology_ai"],
    systems: ["technology", "trust"],
    keywords: ["AI", "artificial intelligence", "automation", "verification"],
  },
  {
    slug: "tourism",
    kind: "question",
    title: "What is changing in tourism?",
    hint: "Destinations, hospitality, resident leisure",
    sectors: ["hospitality_tourism"],
    systems: ["tourism"],
  },
  {
    slug: "work-migration",
    kind: "question",
    title: "What is changing in work and migration?",
    hint: "Residency, settlement, talent, belonging",
    sectors: ["migration_citizenship_belonging", "education_work"],
    systems: ["migration", "labour", "family"],
    keywords: ["visa", "residency", "relocat"],
  },
  {
    slug: "lifestyle-wellness",
    kind: "question",
    title: "What is changing in food, wellness and lifestyle?",
    hint: "Longevity, third places, daily routines",
    sectors: ["health_wellness_longevity", "food_beverage_third_places"],
    systems: ["healthcare", "community", "consumption"],
  },
];

export const EXPLORE_PLACES: ExploreTopic[] = [
  { slug: "uae", kind: "place", title: "UAE", hint: "Dubai, Abu Dhabi and beyond", countries: ["UAE", "United Arab Emirates"] },
  { slug: "saudi-arabia", kind: "place", title: "Saudi Arabia", hint: "Riyadh, Jeddah, giga-projects", countries: ["Saudi Arabia"] },
  { slug: "qatar", kind: "place", title: "Qatar", hint: "Doha and the wider peninsula", countries: ["Qatar"] },
  { slug: "kuwait", kind: "place", title: "Kuwait", hint: "Kuwait City and beyond", countries: ["Kuwait"] },
  { slug: "bahrain", kind: "place", title: "Bahrain", hint: "Manama and beyond", countries: ["Bahrain"] },
  { slug: "oman", kind: "place", title: "Oman", hint: "Muscat and beyond", countries: ["Oman"] },
  { slug: "egypt", kind: "place", title: "Egypt", hint: "Cairo and the wider market", countries: ["Egypt"] },
  { slug: "wider-mena", kind: "place", title: "Wider MENA", hint: "Levant, North Africa, regional", countries: ["Jordan", "Lebanon", "Morocco", "Tunisia", "Iraq", "GCC-wide", "Regional"] },
];

export const EXPLORE_THEMES: ExploreTopic[] = [
  { slug: "identity", kind: "theme", title: "Identity", hint: "Who the region is becoming", systems: ["identity", "cultural_production"] },
  { slug: "belonging", kind: "theme", title: "Belonging", hint: "Settlement, community, home", systems: ["family", "community", "migration"] },
  { slug: "technology", kind: "theme", title: "Technology", hint: "AI, platforms, infrastructure", sectors: ["technology_ai"], systems: ["technology"] },
  { slug: "theme-luxury", kind: "theme", title: "Luxury", hint: "Premium value and its sources", sectors: ["fashion_luxury"], systems: ["luxury"] },
  { slug: "mobility", kind: "theme", title: "Mobility", hint: "How people and things move", sectors: ["mobility_transport"], systems: ["mobility"] },
  { slug: "wellness", kind: "theme", title: "Wellness", hint: "Health, longevity, care", sectors: ["health_wellness_longevity"], systems: ["healthcare"] },
  { slug: "media", kind: "theme", title: "Media", hint: "Attention, creators, formats", sectors: ["media_entertainment_creator"], systems: ["media", "attention"] },
  { slug: "real-estate", kind: "theme", title: "Real Estate", hint: "Homes, districts, development", sectors: ["real_estate_urban"], systems: ["housing", "urban"] },
  { slug: "culture", kind: "theme", title: "Culture", hint: "Arts, heritage, creative economy", sectors: ["culture_arts_heritage"], systems: ["cultural_production", "creativity"] },
  { slug: "finance", kind: "theme", title: "Finance", hint: "Money, credit, capital", sectors: ["finance_banking_investment"], systems: ["finance", "capital"] },
  { slug: "education", kind: "theme", title: "Education", hint: "Learning and work readiness", sectors: ["education_work"], systems: ["education", "labour"] },
  { slug: "climate", kind: "theme", title: "Climate", hint: "Heat, energy, adaptation", sectors: ["climate_energy_environment"], systems: ["climate"] },
];

export const ALL_TOPICS: ExploreTopic[] = [
  ...EXPLORE_QUESTIONS,
  ...EXPLORE_PLACES,
  ...EXPLORE_THEMES,
];

export function findTopic(slug: string): ExploreTopic | undefined {
  return ALL_TOPICS.find((t) => t.slug === slug);
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

function textMatches(keywords: string[] | undefined, ...texts: string[]): boolean {
  if (!keywords || keywords.length === 0) return false;
  const haystack = texts.join(" ").toLowerCase();
  return keywords.some((k) => haystack.includes(k.toLowerCase()));
}

export function signalMatchesTopic(signal: Signal, topic: ExploreTopic): boolean {
  if (topic.countries?.some((c) => signal.country.toLowerCase().includes(c.toLowerCase())))
    return true;
  if (topic.sectors?.some((s) => signal.sectors.includes(s))) return true;
  if (topic.systems?.some((s) => signal.systemsAffected.includes(s))) return true;
  if (textMatches(topic.keywords, signal.title, signal.description, ...signal.tags)) return true;
  return false;
}

export interface TopicContent {
  signals: Signal[];
  clusters: Cluster[];
  contradictions: Contradiction[];
  indicators: MonitoringIndicator[];
  implications: StrategicImplication[];
}

/**
 * Everything the platform knows about a topic, gathered through the signal
 * layer: clusters, tensions, watch items and implications qualify through
 * the signals they link to.
 */
export function topicContent(topic: ExploreTopic, data: IntelligenceData): TopicContent {
  const signals = data.signals.filter(
    (s) =>
      signalMatchesTopic(s, topic) &&
      !["rejected", "archived_noise", "duplicate"].includes(s.reviewStatus),
  );
  const signalIds = new Set(signals.map((s) => s.id));

  const clusters = data.clusters.filter((c) =>
    c.signalIds.some((id) => signalIds.has(id)),
  );
  const contradictions = data.contradictions.filter((c) =>
    [...c.sideASignalIds, ...c.sideBSignalIds].some((id) => signalIds.has(id)),
  );
  const indicators = data.indicators.filter(
    (i) => (i.signalId && signalIds.has(i.signalId)) ||
      data.territories.some(
        (t) => t.id === i.territoryId && t.representativeSignalIds.some((id) => signalIds.has(id)),
      ),
  );
  const implications = data.implications.filter((imp) =>
    imp.evidenceSignalIds.some((id) => signalIds.has(id)),
  );

  return { signals, clusters, contradictions, indicators, implications };
}
