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
  /** Short subtitle shown on the topic card — a plain explanation. */
  hint: string;
  /** "In plain English" summary shown at the top of the topic page. */
  plainSummary?: string;
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
    hint: "How housing, transport, heat, and public space are changing daily life.", plainSummary: "Gulf cities are being redesigned around longer stays, heat, transport access, and daily routines.",
    sectors: ["real_estate_urban", "mobility_transport"],
    systems: ["urban", "mobility", "infrastructure", "housing"],
  },
  {
    slug: "youth-culture",
    kind: "question",
    title: "What is changing in youth culture?",
    hint: "How young people meet, play, and spend — from padel courts to coffee houses.", plainSummary: "Young people are building social life around sport, coffee, and community — not only malls.",
    sectors: ["sports_gaming", "food_beverage_third_places", "media_entertainment_creator"],
    systems: ["community", "attention", "consumption"],
    keywords: ["youth", "young"],
  },
  {
    slug: "luxury",
    kind: "question",
    title: "What is changing in luxury?",
    hint: "What counts as premium now, and why regional design is gaining ground.", plainSummary: "Premium is shifting from imported names toward regional design and verified quality.",
    sectors: ["fashion_luxury", "retail_commerce"],
    systems: ["luxury", "identity", "consumption"],
  },
  {
    slug: "ai-trust",
    kind: "question",
    title: "What is changing in AI and trust?",
    hint: "Where automation is spreading, and where people want human proof.", plainSummary: "Automation is spreading fast, and people increasingly pay for human checks and local fit.",
    sectors: ["technology_ai"],
    systems: ["technology", "trust"],
    keywords: ["AI", "artificial intelligence", "automation", "verification"],
  },
  {
    slug: "tourism",
    kind: "question",
    title: "What is changing in tourism?",
    hint: "How hotels and destinations are changing as visitors and residents mix.", plainSummary: "Destinations are serving residents and repeat visitors, not only one-time tourists.",
    sectors: ["hospitality_tourism"],
    systems: ["tourism"],
  },
  {
    slug: "work-migration",
    kind: "question",
    title: "What is changing in work and migration?",
    hint: "Who is coming to stay, and what long-term residents need.", plainSummary: "More people are coming to stay, which changes housing, schools, banking, and daily services.",
    sectors: ["migration_citizenship_belonging", "education_work"],
    systems: ["migration", "labour", "family"],
    keywords: ["visa", "residency", "relocat"],
  },
  {
    slug: "lifestyle-wellness",
    kind: "question",
    title: "What is changing in food, wellness and lifestyle?",
    hint: "How health, food, and daily routines are moving into everyday places.", plainSummary: "Health and wellness are becoming part of homes, hotels, offices, and daily routines.",
    sectors: ["health_wellness_longevity", "food_beverage_third_places"],
    systems: ["healthcare", "community", "consumption"],
  },
];

export const EXPLORE_PLACES: ExploreTopic[] = [
  { slug: "uae", kind: "place", title: "UAE", hint: "Dubai, Abu Dhabi and beyond.", plainSummary: "Longer stays, family settlement, and lifestyle infrastructure are reshaping the UAE.", countries: ["UAE", "United Arab Emirates"] },
  { slug: "saudi-arabia", kind: "place", title: "Saudi Arabia", hint: "Riyadh, Jeddah, AlUla and beyond.", plainSummary: "Culture, sport, entertainment, and new transport are reshaping daily life in Saudi Arabia.", countries: ["Saudi Arabia"] },
  { slug: "qatar", kind: "place", title: "Qatar", hint: "Doha and the wider peninsula.", plainSummary: "What the evidence shows changing in Qatar right now.", countries: ["Qatar"] },
  { slug: "kuwait", kind: "place", title: "Kuwait", hint: "Kuwait City and beyond.", plainSummary: "What the evidence shows changing in Kuwait right now.", countries: ["Kuwait"] },
  { slug: "bahrain", kind: "place", title: "Bahrain", hint: "Manama and beyond.", plainSummary: "What the evidence shows changing in Bahrain right now.", countries: ["Bahrain"] },
  { slug: "oman", kind: "place", title: "Oman", hint: "Muscat and beyond.", plainSummary: "What the evidence shows changing in Oman right now.", countries: ["Oman"] },
  { slug: "egypt", kind: "place", title: "Egypt", hint: "Cairo and the wider market.", plainSummary: "What the evidence shows changing in Egypt right now.", countries: ["Egypt"] },
  { slug: "wider-mena", kind: "place", title: "Wider MENA", hint: "The Levant, North Africa, and regional stories.", plainSummary: "Signals from the wider region beyond the Gulf.", countries: ["Jordan", "Lebanon", "Morocco", "Tunisia", "Iraq", "GCC-wide", "Regional"] },
];

export const EXPLORE_THEMES: ExploreTopic[] = [
  { slug: "identity", kind: "theme", title: "Identity", hint: "Who the region is becoming, and who gets to define it.", plainSummary: "The region is producing more of its own brands, media, and symbols — and they are gaining status.", systems: ["identity", "cultural_production"] },
  { slug: "belonging", kind: "theme", title: "Belonging", hint: "Settling, community, and feeling at home.", plainSummary: "More people are trying to build long-term lives here, and services are forming around that.", systems: ["family", "community", "migration"] },
  { slug: "technology", kind: "theme", title: "Technology", hint: "AI, platforms, and the systems behind daily life.", plainSummary: "Technology is spreading into daily services, and trust is becoming the deciding factor.", sectors: ["technology_ai"], systems: ["technology"] },
  { slug: "theme-luxury", kind: "theme", title: "Luxury", hint: "Where premium value is moving.", plainSummary: "Premium is shifting toward regional design, verified quality, and human craft.", sectors: ["fashion_luxury"], systems: ["luxury"] },
  { slug: "mobility", kind: "theme", title: "Mobility", hint: "How people and goods move through cities.", plainSummary: "New metros and transit are changing where people live, shop, and spend time.", sectors: ["mobility_transport"], systems: ["mobility"] },
  { slug: "wellness", kind: "theme", title: "Wellness", hint: "Health and care moving into homes, hotels, and offices.", plainSummary: "Health services are being built into everyday places, not only clinics.", sectors: ["health_wellness_longevity"], systems: ["healthcare"] },
  { slug: "media", kind: "theme", title: "Media", hint: "Who audiences trust and listen to.", plainSummary: "Arabic-first shows and regional creators are becoming the first choice, not the alternative.", sectors: ["media_entertainment_creator"], systems: ["media", "attention"] },
  { slug: "real-estate", kind: "theme", title: "Real Estate", hint: "What gets built, and who it is built for.", plainSummary: "Housing is starting to shift from investor units toward homes for families who stay.", sectors: ["real_estate_urban"], systems: ["housing", "urban"] },
  { slug: "culture", kind: "theme", title: "Culture", hint: "Museums, arts, and the creative economy.", plainSummary: "Cultural institutions are investing in regional work, and audiences are responding.", sectors: ["culture_arts_heritage"], systems: ["cultural_production", "creativity"] },
  { slug: "finance", kind: "theme", title: "Finance", hint: "How people save, borrow, and invest.", plainSummary: "Banks and platforms are building products for people who plan to stay for years.", sectors: ["finance_banking_investment"], systems: ["finance", "capital"] },
  { slug: "education", kind: "theme", title: "Education", hint: "How people learn and qualify for work.", plainSummary: "Schools and skills programmes are growing to serve families who settle long term.", sectors: ["education_work"], systems: ["education", "labour"] },
  { slug: "climate", kind: "theme", title: "Climate", hint: "Heat, energy, and how cities adapt.", plainSummary: "Heat is shaping how cities design streets, schedules, and public space.", sectors: ["climate_energy_environment"], systems: ["climate"] },
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
