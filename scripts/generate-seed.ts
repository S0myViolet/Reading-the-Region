/**
 * Deterministic seed generator — the scan-scale evidence body.
 *
 * Emits src/lib/seed/generated.ts: ~300 sources, ~200 observations,
 * ~78 additional signals, 13 additional cluster maps, 6 additional
 * patterns, 2 additional drivers, 1 additional territory, 4 additional
 * scenarios, ~19 additional implications and ~25 additional indicators —
 * all cross-linked with referential integrity on top of the hand-authored
 * anchor seed (SRC/OBS/SIG/CLU/PAT/CON/DRV/TER/SCN/IMP/IND 001–0xx).
 *
 * Honesty rules:
 * - Every count shown in the UI is backed by an actual record here.
 * - The narrative core (cluster names, unifying questions, statements,
 *   pattern/driver/territory/scenario language) is hand-written below.
 * - Evidence records are template-composed variations, demo-flagged, with
 *   no invented URLs. Repeated instantiations of one recipe represent the
 *   same signal logic observed again — which is what momentum means.
 * - Deterministic PRNG: the output is stable run to run.
 *
 * Run:
 *   npx tsc scripts/generate-seed.ts --outDir .seedcheck --module commonjs \
 *     --target es2020 --esModuleInterop --skipLibCheck --moduleResolution node \
 *   && node .seedcheck/scripts/generate-seed.js
 */

import * as fs from "fs";
import * as path from "path";
import type {
  ActorType,
  BiasTag,
  Cluster,
  ConfidenceLevel,
  FutureTerritory,
  IndicatorTrend,
  IndicatorType,
  MonitoringCadence,
  MonitoringIndicator,
  Observation,
  Pattern,
  PatternType,
  ReviewStatus,
  Scenario,
  ScenarioHorizon,
  ScenarioType,
  Score,
  Sector,
  Signal,
  SignalStrength,
  Source,
  SourceRole,
  SourceType,
  StrategicImplication,
  SystemAffected,
  TimeHorizon,
} from "../src/lib/types";

// ---------------------------------------------------------------------------
// Deterministic PRNG
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260708);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
};
const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const clampScore = (n: number): Score => Math.min(5, Math.max(1, n)) as Score;

/** Dates spread across a 14-month scan window ending 2026-06-30. */
function scanDate(): string {
  const start = new Date("2025-05-01").getTime();
  const end = new Date("2026-06-30").getTime();
  const d = new Date(start + rand() * (end - start));
  return d.toISOString().slice(0, 10);
}
function laterThan(iso: string, maxDays = 21): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + between(0, maxDays));
  return d.toISOString().slice(0, 10);
}
const nowIso = "2026-07-01T09:00:00.000Z";

// ---------------------------------------------------------------------------
// Source banks (demo-flagged; no URLs invented)
// ---------------------------------------------------------------------------

interface SourceBank {
  type: SourceType;
  names: string[];
  credibility: [number, number];
  bias: BiasTag[];
  roles: SourceRole[];
}

const SOURCE_BANKS: SourceBank[] = [
  { type: "government_policy", names: ["Federal gazette policy notice (demo)", "Ministry economic bulletin (demo)", "National statistics release (demo)", "Municipal planning circular (demo)", "Residency authority update (demo)"], credibility: [4, 5], bias: ["government_agenda"], roles: ["validation", "data", "monitoring"] },
  { type: "international_org", names: ["Multilateral regional outlook chapter (demo)", "International agency labour note (demo)", "Development bank urban review (demo)"], credibility: [4, 5], bias: ["western_centric"], roles: ["validation", "context", "data"] },
  { type: "consulting_report", names: ["Gulf consumer sentiment study (demo)", "Regional real-estate advisory brief (demo)", "GCC retail outlook deck (demo)", "Hospitality performance review (demo)"], credibility: [3, 4], bias: ["commercial_bias", "pr_framing"], roles: ["validation", "context", "interpretation"] },
  { type: "industry_report", names: ["Regional proptech market map (demo)", "MENA games industry census (demo)", "Gulf wellness economy report (demo)", "Arabic media consumption survey (demo)"], credibility: [3, 4], bias: ["commercial_bias", "investor_optimism"], roles: ["validation", "data"] },
  { type: "financial_research", names: ["Regional bank equity note (demo)", "Sovereign strategy commentary (demo)", "Fund manager Gulf letter (demo)"], credibility: [3, 4], bias: ["investor_optimism"], roles: ["validation", "data", "contradiction"] },
  { type: "trade_publication", names: ["Hospitality trade weekly (demo)", "Retail property journal (demo)", "Aviation and transit trade note (demo)", "F&B operators digest (demo)"], credibility: [3, 4], bias: ["commercial_bias"], roles: ["discovery", "context", "monitoring"] },
  { type: "news_publication", names: ["Gulf business daily (demo)", "Regional economics desk (demo)", "National English-language daily (demo)", "Arabic broadsheet business page (demo)"], credibility: [3, 4], bias: ["recency_bias"], roles: ["discovery", "context", "validation"] },
  { type: "cultural_publication", names: ["Regional culture and design magazine (demo)", "Arab fashion quarterly (demo)", "Khaleeji arts review (demo)"], credibility: [2, 3], bias: ["cultural_editorial_bias", "luxury_market_bias"], roles: ["discovery", "interpretation"] },
  { type: "social_media", names: ["Riyadh lifestyle creator panel (demo)", "Dubai founders forum threads (demo)", "Regional TikTok food creators (demo)", "Khaleeji podcast clips roundup (demo)"], credibility: [1, 2], bias: ["platform_self_promotion", "anecdotal_limitation", "recency_bias"], roles: ["discovery"] },
  { type: "company_announcement", names: ["Developer project launch release (demo)", "Telecom product announcement (demo)", "Airline network update (demo)", "Retail group expansion note (demo)"], credibility: [2, 3], bias: ["pr_framing", "commercial_bias"], roles: ["discovery", "context"] },
  { type: "startup_launch", names: ["Seed-round launch post (demo)", "Accelerator demo-day recap (demo)", "Product hunt regional launch (demo)"], credibility: [2, 3], bias: ["investor_optimism", "pr_framing"], roles: ["discovery"] },
  { type: "event_announcement", names: ["Season programming announcement (demo)", "Biennale programme note (demo)", "Esports tournament calendar (demo)"], credibility: [2, 3], bias: ["gulf_boosterism", "pr_framing"], roles: ["discovery", "monitoring"] },
  { type: "platform_data", names: ["Delivery platform order-pattern brief (demo)", "Streaming service regional chart data (demo)", "Job platform relocation index (demo)"], credibility: [3, 4], bias: ["platform_self_promotion", "sample_size_limitation"], roles: ["data", "validation"] },
  { type: "search_trend_data", names: ["Regional search interest tracker (demo)"], credibility: [3, 3], bias: ["sample_size_limitation"], roles: ["data", "monitoring"] },
  { type: "consumer_survey", names: ["GCC youth finance survey (demo)", "Gulf residents settlement survey (demo)", "Regional wellness habits poll (demo)"], credibility: [3, 4], bias: ["survey_limitation", "sample_size_limitation"], roles: ["validation", "data"] },
  { type: "expert_interview", names: ["Interview with a Riyadh urban planner (demo)", "Conversation with a Gulf bank strategist (demo)", "Interview with a heritage-fashion designer (demo)", "Talk with a Jeddah cultural producer (demo)"], credibility: [3, 4], bias: ["anecdotal_limitation"], roles: ["interpretation", "context", "discovery"] },
  { type: "academic_research", names: ["University migration studies paper (demo)", "Regional media studies article (demo)", "Urban heat adaptation study (demo)"], credibility: [4, 5], bias: [], roles: ["validation", "context"] },
  { type: "ethnographic_observation", names: ["Analyst field notes, coffee districts (demo)", "Analyst field notes, mall weekday mornings (demo)", "Analyst field notes, Ramadan nights (demo)"], credibility: [2, 3], bias: ["anecdotal_limitation"], roles: ["discovery", "interpretation"] },
];

const CITIES: Record<string, string[]> = {
  UAE: ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "AlUla", "Dammam", "Diriyah"],
  Qatar: ["Doha", "Lusail"],
  Kuwait: ["Kuwait City"],
  Bahrain: ["Manama"],
  Oman: ["Muscat"],
  Egypt: ["Cairo", "New Administrative Capital"],
};

// ---------------------------------------------------------------------------
// Hand-written narrative core: cluster themes and their signal recipes
// ---------------------------------------------------------------------------

interface SignalRecipe {
  /** {city} and {country} are substituted at instantiation. */
  title: string;
  whatHappened: string;
  behaviour: string;
  system: string;
  future: string;
  whyItMatters: string;
  sectors: Sector[];
  systems: SystemAffected[];
  actorTypes: ActorType[];
  typeOfChange: Array<Signal["typeOfChange"][number]>;
  countries: string[];
  strength: SignalStrength;
  horizon: TimeHorizon;
  base: { novelty: number; momentum: number; evidence: number; strategic: number };
  sourceTypes: SourceType[];
  /** How many instantiations of this recipe the scan observed. */
  count: [number, number];
}

interface ClusterTheme {
  id: string;
  name: string;
  unifyingQuestion: string;
  statement: string;
  evidenceSummary: string;
  contradictionId: string | null;
  recipes: SignalRecipe[];
}

const NEW_THEMES: ClusterTheme[] = [
  {
    id: "CLU-104",
    name: "Health services are being built into homes, hotels and offices",
    unifyingQuestion: "What changes when health services are built into buildings instead of sold separately?",
    statement:
      "Hotels now add clinics, homes add health tracking, and offices add recovery rooms as standard features. Health services are becoming part of the building itself, not extras sold on top.",
    evidenceSummary:
      "Developer plans, hotel openings, employer benefit programmes and city design rules increasingly treat health facilities as standard building features.",
    contradictionId: null,
    recipes: [
      {
        title: "{city} developer builds clinic floors and health features into a new residential project",
        whatHappened: "A developer in {city} announced a residential project with diagnostic clinics, sleep-friendly lighting and recovery rooms included as standard.",
        behaviour: "Buyers now judge homes on built-in health facilities, not just on location and finish.",
        system: "The housing system is taking on services that hospitals and clinics used to provide.",
        future: "If this continues, homes with built-in health facilities may sell for more, as homes with parking once did.",
        whyItMatters: "Buyers, developers and insurers are affected because health features now change what a home is worth.",
        sectors: ["real_estate_urban", "health_wellness_longevity"],
        systems: ["housing", "healthcare", "consumption"],
        actorTypes: ["developer", "corporation"],
        typeOfChange: ["infrastructural", "economic"],
        countries: ["UAE", "Saudi Arabia", "Qatar"],
        strength: "emerging",
        horizon: "mid_term",
        base: { novelty: 3, momentum: 4, evidence: 3, strategic: 4 },
        sourceTypes: ["company_announcement", "trade_publication", "consulting_report"],
        count: [3, 4],
      },
      {
        title: "Employers in {city} add recovery and health-check services to standard benefits",
        whatHappened: "Large employers in {city} now offer recovery services, sleep programmes and health checks to mid-level staff as standard benefits.",
        behaviour: "Workers now expect health services from their employer instead of paying for them privately.",
        system: "The labour system is changing: employers now provide health services to keep skilled staff.",
        future: "If this continues, Gulf job offers may compete on health benefits as much as on salary.",
        whyItMatters: "Employees and employers are affected because today's workplace benefits become tomorrow's normal consumer expectations.",
        sectors: ["education_work", "health_wellness_longevity"],
        systems: ["labour", "healthcare"],
        actorTypes: ["corporation"],
        typeOfChange: ["behavioural", "economic"],
        countries: ["UAE", "Saudi Arabia"],
        strength: "weak",
        horizon: "near_term",
        base: { novelty: 3, momentum: 3, evidence: 2, strategic: 3 },
        sourceTypes: ["news_publication", "consumer_survey", "expert_interview"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-105",
    name: "Investment firms are settling in the Gulf for the long term",
    unifyingQuestion: "What do investors believe about the Gulf when they stop planning their exit?",
    statement:
      "Family offices are moving here, funds are opening permanent offices, and founders are registering companies locally. Money and investment firms now treat the Gulf as a home base, not a quick opportunity.",
    evidenceSummary:
      "Company registrations, fund announcements, relocation reports and bank commentary all show investors committing for longer periods.",
    contradictionId: null,
    recipes: [
      {
        title: "International fund opens a permanent {city} headquarters to run its regional business",
        whatHappened: "An international investment firm turned its {city} office into a permanent regional headquarters with local hiring targets.",
        behaviour: "Investment firms now base senior staff in the region instead of flying them in for visits.",
        system: "The capital system is changing: investment decisions are now made in the region, not just funded from abroad.",
        future: "If this continues, regional investment strategies may be written in the Gulf rather than approved from distant head offices.",
        whyItMatters: "Regional businesses are affected because local decision-makers understand local markets better than distant head offices do.",
        sectors: ["finance_banking_investment"],
        systems: ["capital", "finance", "labour"],
        actorTypes: ["investor", "corporation"],
        typeOfChange: ["economic", "institutional"],
        countries: ["UAE", "Saudi Arabia", "Qatar"],
        strength: "established",
        horizon: "immediate",
        base: { novelty: 2, momentum: 4, evidence: 4, strategic: 4 },
        sourceTypes: ["financial_research", "news_publication", "government_policy"],
        count: [3, 4],
      },
      {
        title: "Founders in {city} register new companies locally instead of offshore",
        whatHappened: "Registration data in {city} shows founders choosing local company registration where offshore structures were previously the default.",
        behaviour: "Founders now trust regional courts and rules with their companies, not just with their offices.",
        system: "The legal system is earning trust that founders previously placed only in offshore centres.",
        future: "If this continues, a generation of regional companies may grow up legally based in the Gulf.",
        whyItMatters: "Founders and regulators are affected because where a company registers is a hard-to-reverse vote of confidence.",
        sectors: ["technology_ai", "finance_banking_investment"],
        systems: ["governance", "capital"],
        actorTypes: ["startup", "investor"],
        typeOfChange: ["institutional", "economic"],
        countries: ["UAE", "Saudi Arabia"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 3, evidence: 3, strategic: 4 },
        sourceTypes: ["startup_launch", "financial_research", "expert_interview"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-106",
    name: "The region is making its own culture instead of importing it",
    unifyingQuestion: "When will the region tell its own stories instead of buying them from abroad?",
    statement:
      "Broadcasters, museums and brands are spending on regional shows, art and campaigns instead of licensed international ones. Audiences are rewarding the shift with their attention and their money.",
    evidenceSummary:
      "Programming choices, chart data, casting decisions and museum acquisitions show locally made work earning the prestige imports once held.",
    contradictionId: null,
    recipes: [
      {
        title: "Broadcaster in {country} fills prime time with original regional drama instead of licensed formats",
        whatHappened: "A major broadcaster in {country} announced a season built around original regional drama and documentaries rather than licensed international formats.",
        behaviour: "Audiences now choose stories set in their own cities and told in their own dialects.",
        system: "The media system is shifting from adapting imported shows to making and exporting its own.",
        future: "If this continues, the region may export more stories about itself than it imports.",
        whyItMatters: "Broadcasters, creators and audiences are affected because whoever tells the stories shapes what people aspire to.",
        sectors: ["media_entertainment_creator", "culture_arts_heritage"],
        systems: ["cultural_production", "media", "identity"],
        actorTypes: ["media_outlet", "cultural_institution"],
        typeOfChange: ["cultural"],
        countries: ["Saudi Arabia", "UAE", "Egypt"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 4, evidence: 3, strategic: 4 },
        sourceTypes: ["news_publication", "cultural_publication", "platform_data"],
        count: [3, 4],
      },
      {
        title: "{city} museum adds work by living regional designers to its permanent collection",
        whatHappened: "A {city} museum added works by living regional designers to its permanent collection, displayed alongside its international pieces.",
        behaviour: "Museums now treat contemporary regional designers as equals of famous international names.",
        system: "The cultural system is building institutions that decide which regional work counts as important.",
        future: "If this continues, regional design may become a standard that global museums later collect.",
        whyItMatters: "Designers and collectors are affected because museum recognition turns cultural moments into lasting reputation and market value.",
        sectors: ["culture_arts_heritage", "fashion_luxury"],
        systems: ["cultural_production", "identity", "luxury"],
        actorTypes: ["cultural_institution"],
        typeOfChange: ["cultural", "institutional"],
        countries: ["UAE", "Saudi Arabia", "Qatar"],
        strength: "weak",
        horizon: "mid_term",
        base: { novelty: 4, momentum: 3, evidence: 3, strategic: 3 },
        sourceTypes: ["cultural_publication", "event_announcement", "expert_interview"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-107",
    name: "Consumers now pay for certainty, not just for speed",
    unifyingQuestion: "What do consumers pay for when everything is instantly available?",
    statement:
      "Verification services, human review options and origin labels are growing fastest where instant delivery is already everywhere. Consumers increasingly pay extra to be sure, not just to be fast.",
    evidenceSummary:
      "Platform feature launches, complaint data, pricing surveys and bank escalation volumes show demand shifting from speed to assurance.",
    contradictionId: null,
    recipes: [
      {
        title: "Platform in {country} launches a paid tier where humans check important orders",
        whatHappened: "A consumer platform in {country} launched a paid tier where a person checks important transactions before they complete.",
        behaviour: "Customers now accept slower service and higher prices to be certain about transactions that matter.",
        system: "The shopping system now sells certainty as a paid extra on top of automated convenience.",
        future: "If this continues, human checking may become a standard paid tier, the way fast shipping once did.",
        whyItMatters: "Platforms and customers are affected because paying for certainty reverses a decade of speed-first product design.",
        sectors: ["retail_commerce", "technology_ai"],
        systems: ["trust", "consumption", "technology"],
        actorTypes: ["platform", "consumer"],
        typeOfChange: ["behavioural", "technological"],
        countries: ["UAE", "Saudi Arabia", "Kuwait"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 4, momentum: 3, evidence: 3, strategic: 4 },
        sourceTypes: ["company_announcement", "platform_data", "consumer_survey"],
        count: [3, 4],
      },
      {
        title: "Shops across {city} label food and crafts with named farms and makers",
        whatHappened: "Retailers across {city} added labels naming the farm or maker behind their food and craft goods.",
        behaviour: "Shoppers now choose goods with a traceable origin over cheaper anonymous alternatives.",
        system: "The retail system is rebuilding the origin information that industrial supply chains removed.",
        future: "If this continues, a verified origin may become the expected standard for premium goods across the region.",
        whyItMatters: "Small producers and retailers are affected because proof of origin protects their prices as mass-produced goods spread.",
        sectors: ["retail_commerce", "food_beverage_third_places"],
        systems: ["trust", "consumption", "retail"],
        actorTypes: ["sme", "brand", "consumer"],
        typeOfChange: ["behavioural", "cultural"],
        countries: ["UAE", "Saudi Arabia", "Oman"],
        strength: "weak",
        horizon: "mid_term",
        base: { novelty: 3, momentum: 3, evidence: 2, strategic: 3 },
        sourceTypes: ["ethnographic_observation", "trade_publication", "social_media"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-108",
    name: "Young people now meet at sports venues and cafes, not malls",
    unifyingQuestion: "Where does a generation go when it stops going to malls first?",
    statement:
      "Padel courts, run clubs, climbing gyms, coffee shops and community sport leagues are where Gulf youth now meet. These places are active, easy to join and tied to identity, unlike malls built for shopping.",
    evidenceSummary:
      "Venue openings, municipal booking data, creator content and event calendars show steady growth in active social venues across Gulf cities.",
    contradictionId: null,
    recipes: [
      {
        title: "Community sport league in {city} outgrows the venues its city allocated",
        whatHappened: "A community sport league in {city} filled its allocated venues for the third season running, with waiting lists in every age group.",
        behaviour: "Young residents now build their social lives around weekly sport commitments rather than occasional shopping trips.",
        system: "The community system is gaining physical places to gather outside malls and private compounds.",
        future: "If this continues, cities may plan sports and social venues as core infrastructure, not optional leisure.",
        whyItMatters: "City planners and brands are affected because where young people gather decides who can reach them.",
        sectors: ["sports_gaming", "food_beverage_third_places"],
        systems: ["community", "urban", "consumption"],
        actorTypes: ["community", "government"],
        typeOfChange: ["behavioural", "infrastructural"],
        countries: ["Saudi Arabia", "UAE", "Bahrain"],
        strength: "emerging",
        horizon: "immediate",
        base: { novelty: 3, momentum: 4, evidence: 3, strategic: 3 },
        sourceTypes: ["social_media", "news_publication", "ethnographic_observation"],
        count: [3, 4],
      },
    ],
  },
  {
    id: "CLU-109",
    name: "Ramadan's night economy is becoming a year-round fixture",
    unifyingQuestion: "What happens when a seasonal way of life becomes permanent city infrastructure?",
    statement:
      "Cities are extending night licences, programming night markets and building venues designed for evening life. The temporary rhythms of Ramadan are becoming permanent parts of how cities work and trade.",
    evidenceSummary:
      "Licensing changes, programming budgets, staffing patterns and venue designs show seasonal night formats becoming permanent.",
    contradictionId: null,
    recipes: [
      {
        title: "{city} extends Ramadan night licences to run all year",
        whatHappened: "{city} authorities turned night-trading licences piloted during Ramadan into year-round rules for designated districts.",
        behaviour: "Shop owners and customers now treat the night as a normal time for culture and trade.",
        system: "The urban system is permanently adopting night formats that began as religious and seasonal traditions.",
        future: "If this continues, Gulf cities may build a night culture that other hot regions copy.",
        whyItMatters: "Shop owners, staff and planners are affected because permanent night trading changes leases, shifts and event calendars.",
        sectors: ["religion_ritual_ramadan", "hospitality_tourism", "retail_commerce"],
        systems: ["religious_ritual", "urban", "retail"],
        actorTypes: ["government", "sme"],
        typeOfChange: ["regulatory", "cultural"],
        countries: ["Saudi Arabia", "UAE", "Qatar"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 3, evidence: 3, strategic: 3 },
        sourceTypes: ["government_policy", "trade_publication", "ethnographic_observation"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-110",
    name: "Arabic-first media is becoming the default choice, not a niche",
    unifyingQuestion: "What changes when the region's first language is also its first choice?",
    statement:
      "Arabic podcasts top the charts, assistants speak local dialects, and creators build whole businesses in Arabic. Arabic is becoming the language content starts in, not the language it gets translated into.",
    evidenceSummary:
      "Chart data, product launches, advertising budgets and commissioning decisions show Arabic-first formats leading rather than following.",
    contradictionId: null,
    recipes: [
      {
        title: "Arabic podcast network in {country} draws bigger audiences than imported shows",
        whatHappened: "An Arabic-language podcast network in {country} reported larger audiences than imported and translated competitors across its top shows.",
        behaviour: "Listeners now choose Arabic-original shows for everyday listening, not only for cultural occasions.",
        system: "The media system is reorganising around content made in Arabic from the start.",
        future: "If this continues, Arabic-first shows may set the region's media economics, with imports adapting to them.",
        whyItMatters: "Creators, advertisers and platforms are affected because the default language decides who can build media businesses here.",
        sectors: ["media_entertainment_creator"],
        systems: ["media", "attention", "cultural_production"],
        actorTypes: ["media_outlet", "creator"],
        typeOfChange: ["cultural", "economic"],
        countries: ["Saudi Arabia", "UAE", "Egypt", "Kuwait"],
        strength: "established",
        horizon: "immediate",
        base: { novelty: 2, momentum: 4, evidence: 4, strategic: 3 },
        sourceTypes: ["platform_data", "news_publication", "industry_report"],
        count: [3, 4],
      },
    ],
  },
  {
    id: "CLU-111",
    name: "Extreme heat is reshaping how Gulf cities plan daily life",
    unifyingQuestion: "How does a region redesign its days around heat it cannot ignore?",
    statement:
      "Cities are building shaded walkways, moving events to night hours, and writing heat rules into design codes. Coping with heat is becoming a normal part of urban design, not an emergency measure.",
    evidenceSummary:
      "Design codes, event schedule changes, infrastructure spending and mobility data show daily life reorganising around the heat.",
    contradictionId: null,
    recipes: [
      {
        title: "{city} requires shaded walkways in all new district plans",
        whatHappened: "{city} planning authorities made shaded walkways and heat-comfort standards mandatory in new district design codes.",
        behaviour: "Residents walk, gather and spend money where shade and cooling exist, and avoid places without them.",
        system: "The urban system now treats heat protection as a basic requirement, not a later fix.",
        future: "If this continues, shade and cooling may affect property prices as much as transport links do.",
        whyItMatters: "If shaded walkways become standard, they could change where people walk, shop, and spend time for years.",
        sectors: ["climate_energy_environment", "real_estate_urban", "mobility_transport"],
        systems: ["climate", "urban", "infrastructure"],
        actorTypes: ["government", "developer"],
        typeOfChange: ["regulatory", "infrastructural", "environmental"],
        countries: ["UAE", "Saudi Arabia", "Qatar", "Bahrain"],
        strength: "emerging",
        horizon: "mid_term",
        base: { novelty: 3, momentum: 3, evidence: 3, strategic: 4 },
        sourceTypes: ["government_policy", "academic_research", "trade_publication"],
        count: [3, 4],
      },
    ],
  },
  {
    id: "CLU-112",
    name: "Education and work are merging into lifelong skills systems",
    unifyingQuestion: "What replaces the degree when careers change faster than universities can teach?",
    statement:
      "Governments run national skills platforms, employers run their own academies, and visas now recognise short courses. Education and employment are merging into one continuous system that runs through a whole career.",
    evidenceSummary:
      "Policy launches, enrolment data, employer programmes and platform partnerships show skills training becoming continuous and officially recognised.",
    contradictionId: null,
    recipes: [
      {
        title: "{country} counts short-course certificates toward talent-visa eligibility",
        whatHappened: "{country} added recognised short-course certificates to the qualification criteria for its talent-visa categories.",
        behaviour: "Professionals now collect certificates throughout their careers instead of relying on a single degree.",
        system: "The education and visa systems are merging into a single way of proving skill.",
        future: "If this continues, the Gulf may attract skilled workers whom degree-only immigration systems turn away.",
        whyItMatters: "Workers and governments are affected because whoever defines recognised skill controls who can come and work.",
        sectors: ["education_work", "government_policy", "migration_citizenship_belonging"],
        systems: ["education", "labour", "migration"],
        actorTypes: ["government", "corporation"],
        typeOfChange: ["regulatory", "institutional"],
        countries: ["UAE", "Saudi Arabia"],
        strength: "weak",
        horizon: "mid_term",
        base: { novelty: 4, momentum: 3, evidence: 2, strategic: 4 },
        sourceTypes: ["government_policy", "news_publication", "expert_interview"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-113",
    name: "Governments are building gaming and esports into national youth programmes",
    unifyingQuestion: "What does a country build when games are its youth's main cultural language?",
    statement:
      "Governments are funding gaming venues, school leagues and career paths for competitive players. Gaming is moving from private entertainment to national infrastructure for youth identity and skills.",
    evidenceSummary:
      "Investment announcements, venue construction, league formation and participation data show state-level commitment to gaming.",
    contradictionId: null,
    recipes: [
      {
        title: "School esports league launches across {country} with federation backing",
        whatHappened: "A federation-backed school esports league launched across {country} with structured seasons, coaching standards and routes to professional play.",
        behaviour: "Competitive gaming is now an organised school activity with adult support, like traditional sport.",
        system: "The education and sport systems are adopting gaming as a recognised path for young people.",
        future: "If this continues, gaming careers may become supported paths rather than rare lucky exceptions.",
        whyItMatters: "Students, schools and sponsors are affected because official leagues bring venues, coaching and money into gaming.",
        sectors: ["sports_gaming", "education_work"],
        systems: ["community", "education", "attention"],
        actorTypes: ["government", "community"],
        typeOfChange: ["institutional", "cultural"],
        countries: ["Saudi Arabia", "UAE"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 4, evidence: 3, strategic: 3 },
        sourceTypes: ["event_announcement", "news_publication", "industry_report"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-114",
    name: "New metros are changing how people use Gulf cities daily",
    unifyingQuestion: "What does a car-built region become when the metro arrives?",
    statement:
      "Metro lines are opening, developers are building around stations, and shops are leasing space near transit. Daily life in cities built for cars is starting to reorganise around trains and stations.",
    evidenceSummary:
      "Ridership data, leasing near stations, permit changes and employer commute programmes all track the shift toward transit.",
    contradictionId: null,
    recipes: [
      {
        title: "Shops near {city} metro stations now pay higher rents than car-access sites",
        whatHappened: "Brokerage data in {city} showed shops near metro stations paying higher rents than similar sites reached by car.",
        behaviour: "Shoppers now walk and spend along metro routes, changing where daily spending happens.",
        system: "The transport system is starting to decide where shops and homes gain value.",
        future: "If this continues, districts around stations may become the most valuable land in Gulf cities.",
        whyItMatters: "Retailers, developers and commuters are affected because higher rents near stations show daily movement changing for good.",
        sectors: ["mobility_transport", "real_estate_urban", "retail_commerce"],
        systems: ["mobility", "urban", "retail"],
        actorTypes: ["developer", "government", "consumer"],
        typeOfChange: ["infrastructural", "behavioural"],
        countries: ["Saudi Arabia", "UAE", "Qatar"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 4, evidence: 3, strategic: 4 },
        sourceTypes: ["consulting_report", "platform_data", "trade_publication"],
        count: [3, 4],
      },
    ],
  },
  {
    id: "CLU-115",
    name: "The Gulf is growing its own food and its own cuisine",
    unifyingQuestion: "Can the region feed itself and define its own cuisine at the same time?",
    statement:
      "Investors fund desert farms, governments write food-security plans, and chefs build menus around regional ingredients. The region is localising food both to be more secure and to express its own identity.",
    evidenceSummary:
      "Investment flows, farm openings, policy strategies and menu analysis show food localisation serving both security and identity.",
    contradictionId: null,
    recipes: [
      {
        title: "Chefs in {city} build acclaimed tasting menus around regional ingredients",
        whatHappened: "Chefs in {city} built tasting menus around dates, camel dairy, Gulf seafood and desert plants, earning critical acclaim.",
        behaviour: "Diners now treat regional ingredients as a mark of quality rather than of nostalgia.",
        system: "The food system is becoming a way for the region to express its own identity.",
        future: "If this continues, a recognised Gulf fine-dining tradition may draw food tourism and travel abroad as restaurant formats.",
        whyItMatters: "Chefs, farmers and tourism boards are affected because cuisine turns local identity into income quickly.",
        sectors: ["food_beverage_third_places", "culture_arts_heritage", "hospitality_tourism"],
        systems: ["consumption", "identity", "cultural_production"],
        actorTypes: ["sme", "creator"],
        typeOfChange: ["cultural"],
        countries: ["UAE", "Saudi Arabia", "Oman"],
        strength: "weak",
        horizon: "mid_term",
        base: { novelty: 3, momentum: 3, evidence: 2, strategic: 3 },
        sourceTypes: ["cultural_publication", "social_media", "news_publication"],
        count: [2, 3],
      },
    ],
  },
  {
    id: "CLU-116",
    name: "Smaller cities are joining the region's cultural map",
    unifyingQuestion: "What happens when the region's story stops being written in two cities?",
    statement:
      "Festivals, creative districts, film shoots and domestic tourism are bringing AlUla, Sharjah, Muscat, Manama and Dammam into cultural life. Dubai and Riyadh no longer hold a monopoly on the region's cultural story.",
    evidenceSummary:
      "Festival calendars, visitor data, grants and creative investments show cultural activity spreading beyond the two dominant hubs.",
    contradictionId: null,
    recipes: [
      {
        title: "Creative district in {city} has waiting lists for its artist studios",
        whatHappened: "A creative district in {city} reported waiting lists for its artist studios and programme slots next season.",
        behaviour: "Artists now choose smaller cities for cheaper studios, distinct character and closer institutional attention.",
        system: "The cultural system is developing several regional centres instead of one or two gateway cities.",
        future: "If this continues, a spread-out cultural map may give the region variety and resilience one hub cannot.",
        whyItMatters: "Artists, brands and tourism boards are affected because culture spreading out changes where audiences travel and talent settles.",
        sectors: ["culture_arts_heritage", "hospitality_tourism", "real_estate_urban"],
        systems: ["cultural_production", "urban", "tourism"],
        actorTypes: ["cultural_institution", "government", "creator"],
        typeOfChange: ["cultural", "infrastructural"],
        countries: ["Saudi Arabia", "Oman", "Bahrain", "UAE"],
        strength: "weak",
        horizon: "mid_term",
        base: { novelty: 4, momentum: 3, evidence: 2, strategic: 3 },
        sourceTypes: ["event_announcement", "cultural_publication", "ethnographic_observation"],
        count: [2, 3],
      },
    ],
  },
];

/** Top-ups for the three existing hand-authored clusters (to reach 8+ signals). */
const EXISTING_TOPUPS: Array<{ clusterId: string; recipes: SignalRecipe[] }> = [
  {
    clusterId: "CLU-001",
    recipes: [
      {
        title: "{city} concept store gives its main floor to regional designers",
        whatHappened: "A {city} concept store moved international labels off its main floor and gave the space to regional designers.",
        behaviour: "Shoppers now pay top prices for clothes designed by people from the region.",
        system: "The luxury retail system is ranking regional design above imported labels for the first time.",
        future: "If this continues, regional designers may anchor Gulf luxury retail the way European houses once did.",
        whyItMatters: "Designers, stores and global brands are affected because floor space shows honestly where prestige is moving.",
        sectors: ["fashion_luxury", "retail_commerce"],
        systems: ["luxury", "identity", "retail"],
        actorTypes: ["brand", "sme"],
        typeOfChange: ["cultural", "economic"],
        countries: ["UAE", "Saudi Arabia", "Kuwait"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 4, evidence: 3, strategic: 4 },
        sourceTypes: ["trade_publication", "cultural_publication", "company_announcement"],
        count: [2, 3],
      },
      {
        title: "Brands in {country} cast regional creators instead of international celebrities",
        whatHappened: "Campaign launches across {country} cast regional creators and athletes where earlier seasons used international celebrities.",
        behaviour: "Brands now hire local faces their customers recognise instead of paying for imported fame.",
        system: "The advertising system is changing who gets to represent success and aspiration in the region.",
        future: "If this continues, regional credibility may become the standard currency of Gulf brand building.",
        whyItMatters: "Creators, athletes and brands are affected because casting budgets show quickly whose story sells.",
        sectors: ["media_entertainment_creator", "fashion_luxury"],
        systems: ["identity", "media", "attention"],
        actorTypes: ["brand", "creator"],
        typeOfChange: ["cultural"],
        countries: ["Saudi Arabia", "UAE"],
        strength: "established",
        horizon: "immediate",
        base: { novelty: 2, momentum: 4, evidence: 4, strategic: 4 },
        sourceTypes: ["news_publication", "social_media", "industry_report"],
        count: [2, 3],
      },
    ],
  },
  {
    clusterId: "CLU-002",
    recipes: [
      {
        title: "Bank in {country} promises a human review of every automated decision",
        whatHappened: "A retail bank in {country} published guaranteed rights to human review of its automated credit and service decisions.",
        behaviour: "Customers now demand a named person who answers for decisions machines make about them.",
        system: "The banking system is putting people back into processes it had fully automated.",
        future: "If this continues, human review may become a legal or competitive standard across automated services.",
        whyItMatters: "Bank customers are affected because the guarantee admits automation alone cannot carry decisions that change lives.",
        sectors: ["finance_banking_investment", "technology_ai"],
        systems: ["trust", "finance", "technology"],
        actorTypes: ["corporation", "consumer"],
        typeOfChange: ["institutional", "behavioural"],
        countries: ["UAE", "Saudi Arabia", "Bahrain"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 3, evidence: 3, strategic: 4 },
        sourceTypes: ["company_announcement", "financial_research", "news_publication"],
        count: [2, 3],
      },
      {
        title: "Handmade goods at {city} craft markets sell for more than factory items",
        whatHappened: "Sellers at {city} craft markets reported steady higher prices for goods proven handmade over similar factory-made items.",
        behaviour: "Buyers now pay extra for proof a person made the item, as machine-made goods look identical.",
        system: "The retail system is developing ways to verify that a human actually made a product.",
        future: "If this continues, handmade certification may grow into a formal industry with labels and inspectors.",
        whyItMatters: "Craftspeople and shoppers are affected because the premium shows how scarce trust has become amid mass production.",
        sectors: ["retail_commerce", "culture_arts_heritage"],
        systems: ["trust", "creativity", "consumption"],
        actorTypes: ["sme", "consumer"],
        typeOfChange: ["behavioural", "economic"],
        countries: ["Oman", "Saudi Arabia", "UAE"],
        strength: "weak",
        horizon: "mid_term",
        base: { novelty: 4, momentum: 3, evidence: 2, strategic: 3 },
        sourceTypes: ["ethnographic_observation", "social_media", "cultural_publication"],
        count: [2, 3],
      },
    ],
  },
  {
    clusterId: "CLU-003",
    recipes: [
      {
        title: "International school waiting lists lengthen across {city} family districts",
        whatHappened: "Admissions data across {city} family districts showed international-school waiting lists growing as families arrive on long visas.",
        behaviour: "Families now commit to a decade of schooling in Gulf cities, not a two-year posting.",
        system: "The education system is scaling for families who stay, not for workers who rotate.",
        future: "If this continues, school places may become the main limit on how many families can settle.",
        whyItMatters: "Families, schools and planners are affected because school enrolment is the hardest settlement evidence to reverse.",
        sectors: ["education_work", "migration_citizenship_belonging", "real_estate_urban"],
        systems: ["education", "family", "migration"],
        actorTypes: ["consumer", "corporation"],
        typeOfChange: ["demographic", "behavioural"],
        countries: ["UAE", "Saudi Arabia", "Qatar"],
        strength: "established",
        horizon: "immediate",
        base: { novelty: 2, momentum: 4, evidence: 4, strategic: 5 },
        sourceTypes: ["consulting_report", "news_publication", "consumer_survey"],
        count: [2, 3],
      },
      {
        title: "Retirement and inheritance products launch for long-term residents in {country}",
        whatHappened: "Banks and insurers in {country} launched retirement savings and inheritance products designed for long-term foreign residents.",
        behaviour: "Residents now plan whole lives in the Gulf, including old age, not just work postings.",
        system: "The finance system is building products for people who stay for decades, not years.",
        future: "If this continues, an economy serving residents for life may replace the old expatriate rotation economy.",
        whyItMatters: "Residents and banks are affected because products with twenty-year horizons show institutions betting on people staying.",
        sectors: ["finance_banking_investment", "migration_citizenship_belonging"],
        systems: ["finance", "family", "migration"],
        actorTypes: ["corporation", "consumer"],
        typeOfChange: ["economic", "institutional"],
        countries: ["UAE", "Saudi Arabia"],
        strength: "emerging",
        horizon: "near_term",
        base: { novelty: 3, momentum: 3, evidence: 3, strategic: 4 },
        sourceTypes: ["financial_research", "company_announcement", "news_publication"],
        count: [2, 3],
      },
    ],
  },
];

export { NEW_THEMES, EXISTING_TOPUPS, SOURCE_BANKS, CITIES };
export {
  rand, pick, pickN, between, clampScore, scanDate, laterThan, nowIso, mulberry32,
};
export type { ClusterTheme, SignalRecipe, SourceBank };

// ---------------------------------------------------------------------------
// Hand-written narrative core: patterns, drivers, territory, scenarios
// ---------------------------------------------------------------------------

interface PatternDef {
  id: string;
  name: string;
  patternType: PatternType;
  statement: string;
  strategicMeaning: string;
  clusterIds: string[]; // may include existing CLU-001..003
  validated: boolean;
}

const NEW_PATTERNS: PatternDef[] = [
  {
    id: "PAT-103",
    name: "From Imported Status to Authored Identity",
    patternType: "cultural",
    statement:
      "Across fashion, media, museums and food, status is moving from imported global brands to work made in the region. People increasingly respect what the region makes, not what it buys in.",
    strategicMeaning:
      "Brands that create work with the region will beat brands that only translate global products for it.",
    clusterIds: ["CLU-001", "CLU-106", "CLU-115"],
    validated: true,
  },
  {
    id: "PAT-104",
    name: "From Temporary Presence to Permanent Belonging",
    patternType: "demographic",
    statement:
      "Residency reform, school demand, retirement products and locally registered companies all show the same shift. People who once came to the Gulf for a few years are now staying for good.",
    strategicMeaning:
      "Institutions built for a rotating workforce must rebuild for families who stay, or they will lose them.",
    clusterIds: ["CLU-003", "CLU-105", "CLU-112"],
    validated: true,
  },
  {
    id: "PAT-105",
    name: "From Hospitality as Stay to Hospitality as Lifestyle Infrastructure",
    patternType: "behavioural",
    statement:
      "Hotels are adding clinics, night economies are becoming permanent, and smaller destinations now programme for residents. Hospitality venues are becoming part of everyday life, not just places to spend a night.",
    strategicMeaning:
      "Hotel operators are becoming everyday-service providers, so gyms, clinics and clubs are now their competitors too.",
    clusterIds: ["CLU-104", "CLU-109", "CLU-116"],
    validated: false,
  },
  {
    id: "PAT-106",
    name: "From Global Templates to Regional Systems of Meaning",
    patternType: "cultural",
    statement:
      "Arabic-first media, regional cuisine and locally made culture all repeat the same movement. Formats that once arrived as global templates are being rebuilt from regional roots and meanings.",
    strategicMeaning:
      "Translating global products for the region no longer wins; creating original regional work does.",
    clusterIds: ["CLU-106", "CLU-110", "CLU-115"],
    validated: false,
  },
  {
    id: "PAT-107",
    name: "From Destination Tourism to Resident Ecosystems",
    patternType: "economic",
    statement:
      "Metro districts, sports clubs, year-round night markets and spread-out cultural centres all serve people who live here. Gulf places are reorganising around residents' daily lives rather than around visitors' itineraries.",
    strategicMeaning:
      "Strategies priced on tourist arrivals will misread markets whose value now comes from residents.",
    clusterIds: ["CLU-108", "CLU-114", "CLU-109", "CLU-116"],
    validated: true,
  },
  {
    id: "PAT-108",
    name: "From Convenience to Verification",
    patternType: "behavioural",
    statement:
      "Paid human review, origin labels and accountability guarantees are growing fastest where instant convenience is already everywhere. For decisions that matter, consumers now value being certain above being fast.",
    strategicMeaning:
      "The next premium consumers will pay for is verification and certainty, not more speed.",
    clusterIds: ["CLU-107", "CLU-002"],
    validated: false,
  },
];

interface DriverDef {
  id: string;
  name: string;
  statement: string;
  whatItExplains: string;
  patternIds: string[];
  clusterIds: string[];
  systems: SystemAffected[];
  secondOrder: string[];
  thirdOrder: string[];
  possibleFutures: string[];
  contradictionIds: string[];
}

const NEW_DRIVERS: DriverDef[] = [
  {
    id: "DRV-103",
    name: "Settlement conversion",
    statement:
      "Longer visas, family relocation, school demand and long-term investment are pushing this change because staying is now practical and rewarding. Parts of the Gulf are turning from temporary work destinations into places where families build long-term lives.",
    whatItExplains:
      "This explains why companies now sell products for people who stay, why families put down roots, and why cities reorganise around residents. One force sits underneath three repeated movements across unrelated sectors.",
    patternIds: ["PAT-104", "PAT-107", "PAT-001"],
    clusterIds: ["CLU-003", "CLU-105", "CLU-112", "CLU-108", "CLU-114"],
    systems: ["migration", "family", "education", "finance", "housing", "urban"],
    secondOrder: [
      "Demand rises for schools, family healthcare, community spaces and financial products that run for decades.",
      "Shops and hotels reprice their offers for repeat residents instead of one-time visitors.",
    ],
    thirdOrder: [
      "People stop seeing the Gulf as a career stopover and start seeing it as home, changing who comes and why.",
    ],
    possibleFutures: [
      "An economy that serves residents from their first school year to retirement, all inside Gulf countries.",
      "Urban growth anchored on the schools, transit lines and community spaces where families settle.",
    ],
    contradictionIds: ["CON-003", "CON-002"],
  },
  {
    id: "DRV-104",
    name: "Authored legitimacy",
    statement:
      "Confident local audiences and heavy cultural investment are pushing this change because regional work now matches imported quality. The region increasingly trusts, buys and exports the brands, media, spaces and symbols it creates itself.",
    whatItExplains:
      "This explains why regional design, Arabic-first media and Gulf cuisine are all rising at the same time. It also explains why imported prestige brands are losing pricing power across unrelated categories.",
    patternIds: ["PAT-103", "PAT-106", "PAT-001"],
    clusterIds: ["CLU-001", "CLU-106", "CLU-110", "CLU-115", "CLU-116"],
    systems: ["identity", "cultural_production", "media", "luxury", "consumption"],
    secondOrder: [
      "Broadcasters, brands and stores move their budgets toward regional designers, creators and shows.",
      "Museums and schools build the collections, prizes and courses that make regional work official.",
    ],
    thirdOrder: [
      "The region becomes a net exporter of culture and ideas rather than an importer of them.",
    ],
    possibleFutures: [
      "Regional culture working as a strategic asset across tourism, luxury, media and diplomacy.",
      "A spread-out cultural map where smaller cities hold recognised creative specialities of their own.",
    ],
    contradictionIds: ["CON-001", "CON-002"],
  },
];

interface TerritoryDef {
  id: string;
  name: string;
  oneLine: string;
  whyEmerging: string;
  driverIds: string[];
  patternIds: string[];
  clusterIds: string[];
  contradictionIds: string[];
  whatItChanges: string;
  whoItAffects: string[];
  risks: string[];
  opportunities: string[];
}

const NEW_TERRITORY: TerritoryDef = {
  id: "TER-102",
  name: "The Authoring Region",
  oneLine:
    "A future where the Gulf makes and exports its own culture, brands and media instead of importing them.",
  whyEmerging:
    "Two forces come together to make this future visible now. Authored legitimacy (DRV-104) is shifting status toward work made in the region across fashion, media, food and museums. The trust premium (DRV-001) makes verified human and regional work more valuable as imported and machine-made goods multiply. The strongest evidence sits in the identity-design cluster (CLU-001) and the Arabic-first media cluster (CLU-110). In both, regional work now leads charts, shop floors and collections rather than filling quotas. One tension remains unresolved: many consumers still aspire to global luxury brands (CON-001). That tension is why this future should be watched closely rather than acted on blindly.",
  driverIds: ["DRV-104", "DRV-001"],
  patternIds: ["PAT-103", "PAT-106"],
  clusterIds: ["CLU-001", "CLU-106", "CLU-110", "CLU-115", "CLU-116"],
  contradictionIds: ["CON-001"],
  whatItChanges:
    "It changes the direction of cultural trade between the region and the world. Brands stop asking how to adapt global playbooks and start asking how to join regional creation. Media commissioning, retail floors, museum collecting, casting, cuisine and education reorganise around original regional work. Imported prestige loses its price premium to work made and named in the region. The region's export question shifts from oil-linked goods to culture, media and design.",
  whoItAffects: [
    "Luxury and fashion houses whose regional plans assume imported prestige still wins",
    "Broadcasters, platforms and studios deciding where to commission original shows",
    "Museums and cultural institutions deciding whose work becomes part of the canon",
    "Tourism boards selling places to visitors through culture",
    "Creators and designers choosing where their work is best rewarded",
    "Investors pricing creative infrastructure like studios, schools and venues",
  ],
  risks: [
    "Hype inflating claims of regional creativity faster than real skills can grow",
    "Recognition concentrating in two cities and starving the wider region",
    "Global brands buying up the movement instead of genuinely joining it",
  ],
  opportunities: [
    "Early credibility for brands that create with the region rather than translate for it",
    "Exportable formats in media, cuisine and design built on regional meaning",
    "Creative infrastructure: education, rights ownership, production and distribution",
  ],
};

interface ScenarioDef {
  id: string;
  title: string;
  territoryId: string;
  horizon: ScenarioHorizon;
  scenarioType: ScenarioType;
  corePremise: string;
  whatHasChanged: string;
  people: string;
  institutions: string;
  brands: string;
  winners: string[];
  losers: string[];
  risks: string[];
  opportunities: string[];
  earlySigns: string[];
  strategicQuestions: string[];
  assumptions: Array<{ text: string; speculative: boolean }>;
}

const NEW_SCENARIOS: ScenarioDef[] = [
  {
    id: "SCN-103",
    title: "The Slow Settlement",
    territoryId: "TER-001",
    horizon: "mid",
    scenarioType: "conservative",
    corePremise:
      "Families keep settling in the Gulf, but more slowly than headline policy suggests. They put down roots where schools and community exist, while high costs keep a large short-stay workforce alongside them.",
    whatHasChanged:
      "Long-visa numbers grow steadily each year rather than exploding as headlines predicted. Two housing markets sit side by side: family districts with schools and transit, and rotation districts built for short stays.",
    people:
      "Settling families plan in decades, while rotating workers keep their arrangements temporary. The two groups use the same cities in very different ways.",
    institutions:
      "Schools and clinics expand where families cluster, and regulators adjust visa rules step by step rather than radically.",
    brands:
      "Winning companies run two offers at once: long-term products for settlers and convenience products for short-stay workers.",
    winners: ["School and healthcare operators in family districts", "Developers building family-sized homes", "Banks with products for long-term residents"],
    losers: ["Companies pricing the whole market as if everyone settles", "Developers with pipelines full of investor studio apartments"],
    risks: ["Rising living costs stalling family relocation", "Visa policy tightening after political changes"],
    opportunities: ["Product ranges that serve settlers and short-stay workers separately", "Land strategies focused on genuine family districts"],
    earlySigns: ["School waiting lists growing in specific districts", "More residents buying retirement products", "Family-sized homes outperforming studio apartments"],
    strategicQuestions: [
      "Which districts are genuinely settling, and which only look like it?",
      "What share of our customers plan to stay for decades rather than years?",
    ],
    assumptions: [
      { text: "Visa rules stay at least as open as they are today.", speculative: false },
      { text: "School capacity keeps pace with demand in key districts.", speculative: true },
    ],
  },
  {
    id: "SCN-104",
    title: "The Anchor Reversal",
    territoryId: "TER-001",
    horizon: "long",
    scenarioType: "wildcard",
    corePremise:
      "A major shock, such as a security crisis or a global financial downturn, tests who really settled. Rooted families stay and deepen their lives, while recently arrived money leaves quickly.",
    whatHasChanged:
      "Settlement holds where schools, transit and community existed, and collapses where residency was only paperwork. The long-term settlement story survives, but only in its committed districts.",
    people:
      "Rooted families stay through the shock, while speculative movers leave fast, showing which belonging was real.",
    institutions:
      "Governments work hard to keep committed residents, and institutions with long-term customer relationships hold onto their base.",
    brands:
      "Companies discover who their real long-term customers are and rebuild their offers around proven commitment.",
    winners: ["Institutions with deep community roots", "Districts with schools, transit and social venues"],
    losers: ["Residency programmes that were only paperwork", "Settlement bets made without schools or community nearby"],
    risks: ["Panicked price rises or cuts that drive out committed families too", "Mistaking a temporary retreat for a permanent reversal"],
    opportunities: ["Buying durable assets cheaply during the retreat", "Loyalty products for residents who prove they are staying"],
    earlySigns: ["Visa numbers rising while school enrolment stalls", "Community districts holding up better during small shocks"],
    strategicQuestions: [
      "Which parts of our settlement bet would survive a crisis?",
      "How do we tell rooted families from paper residents in our own data?",
    ],
    assumptions: [
      { text: "A serious external shock happens within this time frame.", speculative: true },
      { text: "Community infrastructure keeps settlers in place better under stress.", speculative: true },
    ],
  },
  {
    id: "SCN-105",
    title: "The Export Turn",
    territoryId: "TER-102",
    horizon: "mid",
    scenarioType: "optimistic",
    corePremise:
      "Regional creativity grows until the Gulf sells its culture abroad instead of only buying culture in. Arabic shows, Gulf design and regional cuisine become exports that other countries pay for.",
    whatHasChanged:
      "Broadcasters, museums and brands now choose regional work by default, and export deals carry it abroad with its credibility intact.",
    people:
      "Creators build global careers from regional bases, and audiences choose regional work first, not out of duty.",
    institutions:
      "Museums and cultural bodies now define quality with international pull, while schools train the next generation of creators.",
    brands:
      "Global brands create work with regional talent to stay relevant, while regional brands export with confidence.",
    winners: ["Regional creators and studios", "Institutions that recognised regional work early", "Cities with creative schools and studios"],
    losers: ["Middlemen who import and adapt foreign formats", "Prestige brands that relied on seeming foreign"],
    risks: ["A creativity bubble growing faster than real skills", "Global attention flattening what makes regional work distinct"],
    opportunities: ["Businesses that sell regional formats abroad", "Creative education and rights ownership", "Partnerships that create work jointly with regional talent"],
    earlySigns: ["Regional formats licensed to foreign markets", "International museums buying regional work", "Export revenue appearing in creative-industry reports"],
    strategicQuestions: [
      "What would our product look like exported from the region rather than imported into it?",
      "Which regional creators should we be building with now?",
    ],
    assumptions: [
      { text: "Investment in the creative economy continues through this period.", speculative: false },
      { text: "Foreign markets buy regional formats at meaningful scale.", speculative: true },
    ],
  },
  {
    id: "SCN-106",
    title: "The Boosterism Trap",
    territoryId: "TER-102",
    horizon: "near",
    scenarioType: "pessimistic",
    corePremise:
      "Claims about regional creativity grow faster than the actual creative skills behind them. Subsidised prestige, hidden foreign production and cheerleading coverage inflate a bubble that audiences quietly stop believing.",
    whatHasChanged:
      "Marketing is saturated with regional-identity language while the skills pipeline lags well behind it. Audiences learn to tell genuinely regional work from work that only wears the label.",
    people:
      "Consumers grow sceptical of regional-identity claims and reward only work with visible craft, while creators resent the diluted label.",
    institutions:
      "Museums face credibility tests over work they endorsed too quickly, and some retreat to safe international names.",
    brands:
      "Brands that faked regional credentials pay a trust penalty, while brands with real regional craft gain by contrast.",
    winners: ["Regional work with visible, verifiable craft", "Services that verify who made cultural work"],
    losers: ["Campaigns that faked regional credentials", "Institutions that endorsed work too fast"],
    risks: ["One visible failure discrediting the whole movement", "Talented creators leaving if the label collapses"],
    opportunities: ["Standards that verify who really made cultural work", "Patient positioning built on craft before marketing"],
    earlySigns: ["Audiences mocking identity marketing online", "Gap between creative claims and named credits in campaigns", "Regional labels no longer commanding higher prices"],
    strategicQuestions: [
      "Can we back our regional claims with named people and a visible process?",
      "How exposed are we if the regional label loses its value?",
    ],
    assumptions: [
      { text: "Marketing keeps adopting regional language faster than companies invest in real craft.", speculative: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Implication and indicator banks (hand-written cores)
// ---------------------------------------------------------------------------

interface ImplicationDef {
  territoryId: string;
  scenarioId: string | null;
  sectors: Sector[];
  audiences: StrategicImplication["audiences"];
  implicationType: StrategicImplication["implicationType"];
  implication: string;
  whyItMatters: string;
  opportunity: string;
  risk: string;
  action: string;
  confidence: ConfidenceLevel;
  horizon: TimeHorizon;
}

const NEW_IMPLICATIONS: ImplicationDef[] = [
  { territoryId: "TER-001", scenarioId: "SCN-103", sectors: ["education_work"], audiences: ["education_providers", "investors"], implicationType: "capability", implication: "School places in family districts are becoming the main limit on settlement growth. Whoever builds them captures the families who anchor everything else.", whyItMatters: "School enrolment is the hardest settlement evidence to reverse, and waiting lists are already growing.", opportunity: "Long-term school investment with clinics and community services built in.", risk: "This may be overstated if migration headlines exaggerate how many families are actually settling.", action: "Map school waiting lists against long-visa uptake by district before the next land or expansion decision.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-001", scenarioId: "SCN-103", sectors: ["finance_banking_investment"], audiences: ["banks"], implicationType: "product", implication: "Retirement, inheritance and education savings for long-term residents are the next big banking products. Most banks still sell products designed for workers who leave.", whyItMatters: "Some institutions are already launching these products, and the category will be claimed within a few product cycles.", opportunity: "Twenty-year customer relationships priced for people who stay, not people on short postings.", risk: "This may be overstated if GCC countries regulate these products so differently that no regional offer works.", action: "Launch a product line for long-term residents, with milestones tied to visa and school enrolment data.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-001", scenarioId: "SCN-104", sectors: ["real_estate_urban"], audiences: ["developers", "urban_planners"], implicationType: "risk", implication: "Settlement value depends on schools, transit and social venues, not on visa paperwork. Districts with paperwork but no community infrastructure will empty first in a crisis.", whyItMatters: "The shock scenario shows rooted families and paper residents behaving very differently under stress.", opportunity: "District strategies anchored on schools and community assets that hold value through shocks.", risk: "This may be overstated if demand that looks like settlement is really short-stay rotation in disguise.", action: "Score every project in the pipeline by its community infrastructure, not by visa-category demand alone.", confidence: "medium", horizon: "mid_term" },
  { territoryId: "TER-001", scenarioId: null, sectors: ["mobility_transport", "retail_commerce"], audiences: ["retailers", "developers"], implicationType: "experience", implication: "Daily spending is moving to metro corridors, so shops planned around car arrival will end up in the wrong places.", whyItMatters: "Rents near stations are already measurably higher in the first corridors with reliable data.", opportunity: "Food, services and community retail formats within walking distance of stations.", risk: "This may be overstated if station rents rise faster than actual foot traffic in unproven corridors.", action: "Re-weight the location model toward station catchments and test two formats built for metro customers.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-001", scenarioId: null, sectors: ["hospitality_tourism"], audiences: ["hotels", "tourism_boards"], implicationType: "innovation", implication: "The most valuable hotel guest now lives ten minutes away. Hotels need memberships and services for residents, not only rooms for visitors.", whyItMatters: "Year-round night economies and lifestyle demand are already shifting spending toward residents.", opportunity: "Memberships, clinics, co-working and events layered onto hotel assets that already exist.", risk: "This may be overstated if resident revenue grows too slowly to replace diluted visitor income.", action: "Pilot a resident membership at one flagship hotel and measure what it takes from visitor revenue.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: "SCN-105", sectors: ["fashion_luxury"], audiences: ["luxury_brands", "brands"], implicationType: "brand", implication: "Creating collections with regional designers now beats adapting global ones for the market. The window to be first in these partnerships is open but closing.", whyItMatters: "Shop floors, campaign castings and museum collections are already shifting toward regional designers.", opportunity: "Lasting credibility through named regional partners and real investment in local craft.", risk: "This may be overstated if audiences dismiss shallow partnerships, since they increasingly check who did the work.", action: "Commit to multi-season collections co-created with named regional designers and produced in the region.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: "SCN-105", sectors: ["media_entertainment_creator"], audiences: ["media_platforms", "entertainment"], implicationType: "media", implication: "Arabic-original shows are becoming the default choice for regional audiences. Commissioning budgets that stay anchored on imported formats will buy shrinking audiences.", whyItMatters: "Arabic-original formats already draw bigger audiences than imports in key categories.", opportunity: "Owning regional formats that can also be sold to other markets.", risk: "This may be overstated if the volume of Arabic content rises without the quality that keeps audiences.", action: "Shift the commissioning ratio toward Arabic-first originals made with named regional creators.", confidence: "high", horizon: "immediate" },
  { territoryId: "TER-102", scenarioId: "SCN-106", sectors: ["culture_arts_heritage"], audiences: ["cultural_institutions", "governments"], implicationType: "risk", implication: "Museums that endorse regional work faster than the craft matures put their credibility at risk. Speed of recognition is now a trust decision, not a programming one.", whyItMatters: "The pessimistic scenario turns on creative claims growing faster than the creative skills behind them.", opportunity: "Curation with named credits, a visible process and craft standards audiences can check.", risk: "This may be overstated if audiences keep accepting claims without ever checking who made the work.", action: "Adopt evidence standards for authorship claims in every acquisition and programming decision.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: null, sectors: ["food_beverage_third_places", "hospitality_tourism"], audiences: ["tourism_boards", "hotels"], implicationType: "experience", implication: "Regional cuisine is the fastest way to turn local identity into visitor income. A recognised Gulf food tradition converts culture directly into bookings.", whyItMatters: "Chef-led menus built on regional ingredients are already winning acclaim and premium prices.", opportunity: "Food tourism built around named regional chefs and traceable local ingredients.", risk: "This may be overstated if marketing flattens the region's varied cuisines into one generic offer.", action: "Build destination food programmes around named chefs and ingredients whose origin can be verified.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: null, sectors: ["education_work", "culture_arts_heritage"], audiences: ["education_providers", "governments"], implicationType: "capability", implication: "The region's creative growth is limited by training, not by ambition. Schools for design, production, curation and craft are now the bottleneck.", whyItMatters: "Every optimistic path for regional culture assumes trained creators who must start learning now.", opportunity: "Regional creative schools whose credentials link directly to jobs in the industry.", risk: "This may be overstated if imported teachers and curricula simply reproduce global template thinking.", action: "Fund creative education tracks with named industry partners and officially recognised credentials.", confidence: "medium", horizon: "mid_term" },
];

interface IndicatorDef {
  name: string;
  territoryId: string | null;
  driverId: string | null;
  indicatorType: IndicatorType;
  description: string;
  currentStatus: string;
  trend: IndicatorTrend;
  cadence: MonitoringCadence;
}

const NEW_INDICATORS: IndicatorDef[] = [
  { name: "Long-visa issuance vs school enrolment divergence", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "demographic", description: "Tracks whether residency paperwork turns into school enrolments — the gap between settling and speculating.", currentStatus: "Enrolment matches visa issuance in core districts; the gap is widening in two speculative corridors.", trend: "strengthening", cadence: "quarterly" },
  { name: "Resident-lifecycle financial product launches", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "investment", description: "Counts retirement, inheritance and education-savings products launched for long-term residents.", currentStatus: "Three institutions have products live; two more announced launches this half-year.", trend: "strengthening", cadence: "quarterly" },
  { name: "Family-format housing share of new supply", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "infrastructure", description: "Share of homes with three or more bedrooms in announced pipelines, versus studios built for investors.", currentStatus: "The share is rising in districts near transit and flat everywhere else.", trend: "stable", cadence: "quarterly" },
  { name: "Station-catchment retail leasing premium", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "behaviour", description: "Measures how much more retail tenants pay near stations than at similar car-access sites.", currentStatus: "A premium is measurable in two corridors; data remains thin elsewhere.", trend: "strengthening", cadence: "quarterly" },
  { name: "Rotation-market wage cost pressure", territoryId: "TER-001", driverId: null, indicatorType: "resistance", description: "Tracks living costs that could stop families relocating even though visa policy is open.", currentStatus: "Housing and school costs are growing faster than wages for mid-income families.", trend: "contradictory", cadence: "quarterly" },
  { name: "Arabic-original share of top podcast charts", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "media", description: "Share of Arabic-original shows in the region's top podcast charts.", currentStatus: "Arabic originals have held the majority position for three consecutive quarters.", trend: "strengthening", cadence: "monthly" },
  { name: "Regional designer share of flagship retail floors", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "consumer", description: "Share of flagship store floor space given to regional designers.", currentStatus: "Two flagship stores reallocated floors this season; the price premium held.", trend: "strengthening", cadence: "quarterly" },
  { name: "Named-credit density in authorship marketing", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "contradiction", description: "Checks whether claims of regional creativity name the actual people behind the work — the hype test.", currentStatus: "Claims are growing faster than named credits in sampled campaigns.", trend: "contradictory", cadence: "quarterly" },
  { name: "Institutional acquisition of living regional designers", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "cultural", description: "Counts museum acquisitions of work by living regional designers for permanent collections.", currentStatus: "Two institutions acquired work this year; more acquisitions are visible in the pipeline.", trend: "strengthening", cadence: "biannual" },
  { name: "Regional format export deals", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "investment", description: "Counts deals licensing regional media, cuisine and design formats to foreign markets.", currentStatus: "The first outbound licences are signed; volume is still small.", trend: "stable", cadence: "biannual" },
];


// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

const REGION_OF: Record<string, string> = {
  UAE: "UAE", "Saudi Arabia": "Saudi Arabia", Qatar: "Qatar", Kuwait: "Kuwait",
  Bahrain: "Bahrain", Oman: "Oman", Egypt: "Egypt",
};

const ACTOR_NAMES: Partial<Record<ActorType, string[]>> = {
  government: ["Municipal planning authority", "Federal residency authority", "National sports federation", "Licensing authority"],
  developer: ["A master developer", "A residential developer", "A district operator"],
  corporation: ["A regional bank", "A telecom group", "A large employer", "A retail group"],
  brand: ["A regional fashion label", "A flagship concept store", "A consumer brand"],
  platform: ["A delivery platform", "A consumer super-app", "A streaming service"],
  cultural_institution: ["A national museum", "A biennale foundation", "A creative district"],
  creator: ["A creator collective", "A podcast network", "A chef cohort"],
  consumer: ["Resident families", "Young professionals", "First-time buyers"],
  investor: ["An international fund", "A family office", "A sovereign-adjacent investor"],
  sme: ["Independent operators", "A specialty roastery group", "Market sellers"],
  startup: ["A seed-stage startup", "An accelerator cohort"],
  media_outlet: ["A national broadcaster", "An Arabic media network"],
  community: ["A community sport league", "A neighbourhood run club"],
};

/** Boosted themes get enough instances to clear the 8-signal validity bar. */
const BOOST = new Set(["CLU-105", "CLU-106", "CLU-110", "CLU-114", "CLU-107"]);
const CONTRA_MAP: Record<string, string | null> = {
  "CLU-104": null, "CLU-105": "CON-003", "CLU-106": "CON-001", "CLU-107": "CON-002",
  "CLU-108": null, "CLU-109": null, "CLU-110": "CON-001", "CLU-111": null,
  "CLU-112": "CON-003", "CLU-113": null, "CLU-114": "CON-003", "CLU-115": "CON-001",
  "CLU-116": null,
};

const sources: Source[] = [];
const observations: Observation[] = [];
const signals: Signal[] = [];
let srcN = 101, obsN = 101, sigN = 101;
const sid = (n: number, p: string) => `${p}-${String(n).padStart(3, "0")}`;

const sourcePoolByType = new Map<SourceType, Source[]>();

function makeSource(type: SourceType): Source {
  const bank = SOURCE_BANKS.find((b) => b.type === type) ?? pick(SOURCE_BANKS);
  const pool = sourcePoolByType.get(bank.type) ?? [];
  // Reuse an existing source ~35% of the time — publications yield many observations.
  if (pool.length > 0 && rand() < 0.35) return pick(pool);
  const src: Source = {
    id: sid(srcN++, "SRC"),
    name: `${pick(bank.names)} — ${between(2025, 2026)}.${String(between(1, 12)).padStart(2, "0")}`,
    url: null,
    sourceType: bank.type,
    credibility: clampScore(between(bank.credibility[0], bank.credibility[1])),
    biasTags: pickN(bank.bias, Math.min(bank.bias.length, between(0, 2))),
    roles: pickN(bank.roles, Math.min(bank.roles.length, between(1, 2))),
    dateAdded: scanDate(),
    notes: "Generated demo source representing the scan corpus.",
    isDemo: true,
  };
  pool.push(src);
  sourcePoolByType.set(bank.type, pool);
  sources.push(src);
  return src;
}

const FULL_CHECK = { behaviourShift: true, systemShift: true, surprising: true, widerRegionalIssue: true, credibleSource: true, futureImplications: true, connectedToOthers: false, revealsTension: false, earlyButMeaningful: true };

function instantiate(recipe: SignalRecipe, clusterId: string): Signal {
  const country = pick(recipe.countries);
  const city = pick(CITIES[country] ?? [country]);
  const fill = (s: string) => s.replaceAll("{city}", city).replaceAll("{country}", country);
  const eventDate = scanDate();
  const dateObserved = laterThan(eventDate, 14);
  const src = makeSource(pick(recipe.sourceTypes));
  const evidence = clampScore(recipe.base.evidence + between(-1, 1));
  const validated = evidence >= 3 && rand() < 0.62;
  const review: ReviewStatus = validated
    ? "validated"
    : rand() < 0.5
      ? "human_reviewed"
      : rand() < 0.6
        ? "needs_human_review"
        : "needs_evidence";
  const confidence: ConfidenceLevel = evidence >= 4 ? (rand() < 0.5 ? "high" : "medium") : evidence === 3 ? "medium" : "low";
  const actorType = pick(recipe.actorTypes);
  const signal: Signal = {
    id: sid(sigN++, "SIG"),
    title: fill(recipe.title),
    description: fill(recipe.whatHappened),
    dateObserved,
    eventDate,
    sourceIds: [src.id],
    observationId: null, // set below
    region: REGION_OF[country] as Signal["region"],
    country,
    city,
    sectors: recipe.sectors,
    subsector: null,
    actorTypes: recipe.actorTypes,
    primaryActor: pick(ACTOR_NAMES[actorType] ?? ["A regional actor"]),
    typeOfChange: recipe.typeOfChange,
    systemsAffected: recipe.systems,
    signalStrength: recipe.strength,
    scores: {
      novelty: clampScore(recipe.base.novelty + between(-1, 1)),
      momentum: clampScore(recipe.base.momentum + between(-1, 1)),
      evidence,
      strategicRelevance: clampScore(recipe.base.strategic + between(-1, 0)),
      behaviouralImpact: clampScore(recipe.base.strategic + between(-2, 0)),
      emotionalImpact: clampScore(between(2, 4)),
      structuralImpact: clampScore(recipe.base.strategic + between(-2, 0)),
      crossSectorRelevance: clampScore(recipe.sectors.length >= 2 ? between(3, 4) : between(2, 3)),
      geographicRelevance: clampScore(between(3, 4)),
    },
    timeHorizon: recipe.horizon,
    confidence,
    whyItMatters: fill(recipe.whyItMatters),
    zoom: {
      whatHappened: fill(recipe.whatHappened),
      behaviourChanged: fill(recipe.behaviour),
      systemChanged: fill(recipe.system),
      futurePlausible: fill(recipe.future),
      futureIsSpeculative: evidence < 3,
    },
    systems: null,
    potentialImplications: [fill(recipe.future)],
    assumptions: [],
    openQuestions: [],
    contradictionIds: [],
    relatedSignalIds: [],
    clusterIds: [clusterId],
    patternIds: [],
    driverIds: [],
    monitoringIndicatorIds: [],
    tags: [],
    humanNotes: "",
    aiNotes: "",
    aiNotesLabel: null,
    reviewStatus: review,
    createdAt: nowIso,
    updatedAt: `${dateObserved}T12:00:00.000Z`,
  };
  const obs: Observation = {
    id: sid(obsN++, "OBS"),
    title: fill(recipe.title),
    description: fill(recipe.whatHappened),
    sourceId: src.id,
    sourceName: src.name,
    sourceUrl: null,
    sourceType: src.sourceType,
    dateObserved,
    eventDate,
    region: REGION_OF[country] as Observation["region"],
    country,
    city,
    sectors: recipe.sectors,
    subsector: null,
    actorInvolved: signal.primaryActor,
    initialNotes: "Extracted during the scan; promoted after checklist review.",
    potentialFutureRelevance: fill(recipe.future),
    status: "promoted",
    triageRationale: null,
    checklist: { ...FULL_CHECK, revealsTension: rand() < 0.3, connectedToOthers: true },
    promotedSignalId: signal.id,
    createdAt: nowIso,
    updatedAt: `${dateObserved}T12:00:00.000Z`,
  };
  signal.observationId = obs.id;
  observations.push(obs);
  signals.push(signal);
  return signal;
}

// --- Signals for new themes + existing-cluster top-ups ---------------------

const clusterSignals = new Map<string, string[]>();
for (const theme of NEW_THEMES) {
  const ids: string[] = [];
  const target = BOOST.has(theme.id) ? 8 : 0;
  for (const r of theme.recipes) {
    const n = between(r.count[0], r.count[1]);
    for (let i = 0; i < n; i++) ids.push(instantiate(r, theme.id).id);
  }
  while (ids.length < target) ids.push(instantiate(pick(theme.recipes), theme.id).id);
  clusterSignals.set(theme.id, ids);
}
const clusterTopUps: Record<string, string[]> = {};
for (const t of EXISTING_TOPUPS) {
  const ids: string[] = [];
  for (const r of t.recipes) {
    const n = between(r.count[0], r.count[1]);
    for (let i = 0; i < n; i++) ids.push(instantiate(r, t.clusterId).id);
  }
  clusterTopUps[t.clusterId] = ids;
}

// --- Noise and needs-evidence observations ---------------------------------

const NOISE_TEMPLATES: Array<{ title: string; desc: string; status: Observation["status"]; rationale: string; sectors: Sector[] }> = [
  { title: "Celebrity visits {city} flagship store opening", desc: "An international celebrity appeared at a {city} store opening and drew heavy social media coverage.", status: "archived_noise", rationale: "This is publicity, not evidence: nobody's behaviour changed and no system changed.", sectors: ["retail_commerce"] },
  { title: "Operator claims record quarter in {city} press release", desc: "A press release claimed a record quarter without publishing its methods or any comparable figures.", status: "archived_noise", rationale: "A promotional claim with no verifiable data behind it; archived as public relations.", sectors: ["hospitality_tourism"] },
  { title: "Viral thread predicts property boom in {city}", desc: "An anonymous viral thread predicted a property boom, citing unnamed insiders as its only evidence.", status: "archived_noise", rationale: "Anonymous speculation with no credible source; driven by the news cycle.", sectors: ["real_estate_urban"] },
  { title: "Global trend piece maps Western retail habits onto the Gulf", desc: "A trend article claimed a Western shopping behaviour applies here without offering any regional evidence.", status: "archived_noise", rationale: "A global trend asserted as regional without regional evidence; archived on that guardrail.", sectors: ["retail_commerce"] },
  { title: "Influencer review praises new {city} wellness studio", desc: "A paid influencer review praised a single newly opened wellness studio.", status: "archived_noise", rationale: "One sponsored review of one studio; self-promotion with no wider meaning.", sectors: ["health_wellness_longevity"] },
  { title: "Restaurant week returns to {city}", desc: "An annual restaurant week returned with its usual programme of participating venues.", status: "archived_noise", rationale: "A recurring calendar event; it adds no new evidence that anything is changing.", sectors: ["food_beverage_third_places"] },
  { title: "Startup announces app for {city} commuters", desc: "A startup announced a commuter app without sharing usage numbers or explaining what makes it different.", status: "needs_more_evidence", rationale: "An interesting area, but there is no adoption evidence yet; revisit after launch data.", sectors: ["mobility_transport"] },
  { title: "Survey hints at changing gift-giving among Gulf youth", desc: "A small survey suggested young Gulf consumers are changing how they give gifts.", status: "needs_more_evidence", rationale: "The sample is too small to trust; the novelty is worth a follow-up scan.", sectors: ["retail_commerce"] },
  { title: "Forum discussion on remote work visas grows", desc: "A community forum thread about remote-work visas kept drawing replies over several weeks.", status: "needs_more_evidence", rationale: "Anecdotal interest only; it needs policy or platform data before promotion.", sectors: ["education_work", "migration_citizenship_belonging"] },
  { title: "Two outlets republish the same longevity clinic story", desc: "Two publications republished the same wire story about a clinic opening.", status: "duplicate", rationale: "A duplicate of an observation already recorded in the base.", sectors: ["health_wellness_longevity"] },
];

const NOISE_COUNTRIES = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "Egypt"];
for (let i = 0; i < 108; i++) {
  const t = NOISE_TEMPLATES[i % NOISE_TEMPLATES.length];
  const country = pick(NOISE_COUNTRIES);
  const city = pick(CITIES[country] ?? [country]);
  const fill = (s: string) => s.replaceAll("{city}", city);
  const src = makeSource(pick(["social_media", "news_publication", "company_announcement", "event_announcement", "cultural_publication"] as SourceType[]));
  const dateObserved = scanDate();
  const unreviewed = i >= 100; // a small live queue at scale
  observations.push({
    id: sid(obsN++, "OBS"),
    title: fill(t.title),
    description: fill(t.desc),
    sourceId: src.id,
    sourceName: src.name,
    sourceUrl: null,
    sourceType: src.sourceType,
    dateObserved,
    eventDate: dateObserved,
    region: REGION_OF[country] as Observation["region"],
    country,
    city,
    sectors: t.sectors,
    subsector: null,
    actorInvolved: null,
    initialNotes: "",
    potentialFutureRelevance: unreviewed ? fill(t.desc) : "",
    status: unreviewed ? "unreviewed" : t.status,
    triageRationale: unreviewed ? null : t.rationale,
    checklist: { behaviourShift: false, systemShift: false, surprising: rand() < 0.3, widerRegionalIssue: rand() < 0.3, credibleSource: rand() < 0.4, futureImplications: rand() < 0.3, connectedToOthers: false, revealsTension: false, earlyButMeaningful: rand() < 0.3 },
    promotedSignalId: null,
    createdAt: nowIso,
    updatedAt: `${dateObserved}T12:00:00.000Z`,
  });
}

// --- Scan-only sources (scanned; nothing extracted) ------------------------

for (let i = 0; i < 185; i++) {
  const bank = pick(SOURCE_BANKS);
  const pool = sourcePoolByType.get(bank.type) ?? [];
  const src: Source = {
    id: sid(srcN++, "SRC"),
    name: `${pick(bank.names)} — ${between(2025, 2026)}.${String(between(1, 12)).padStart(2, "0")}`,
    url: null,
    sourceType: bank.type,
    credibility: clampScore(between(bank.credibility[0], bank.credibility[1])),
    biasTags: pickN(bank.bias, Math.min(bank.bias.length, between(0, 2))),
    roles: pickN(bank.roles, Math.min(bank.roles.length, between(1, 2))),
    dateAdded: scanDate(),
    notes: "Scanned during the demo scan window; nothing extracted.",
    isDemo: true,
  };
  pool.push(src);
  sourcePoolByType.set(bank.type, pool);
  sources.push(src);
}

// --- Clusters ---------------------------------------------------------------

const clusters: Cluster[] = NEW_THEMES.map((t) => {
  const ids = clusterSignals.get(t.id) ?? [];
  const members = signals.filter((s) => ids.includes(s.id));
  const sectors = new Set(members.flatMap((s) => s.sectors));
  const srcs = new Set(members.flatMap((s) => s.sourceIds));
  const contradictionId = CONTRA_MAP[t.id];
  const passes =
    ids.length >= 8 && srcs.size >= 3 && sectors.size >= 2 && contradictionId !== null;
  return {
    id: t.id,
    name: t.name,
    unifyingQuestion: t.unifyingQuestion,
    clusterStatement: t.statement,
    signalIds: ids,
    contradictionIds: contradictionId ? [contradictionId] : [],
    evidenceSummary: t.evidenceSummary,
    scores: {
      breadth: clampScore(Math.min(5, sectors.size)),
      depth: clampScore(Math.min(5, Math.ceil(srcs.size / 2))),
      coherence: 4,
      persistence: clampScore(between(3, 4)),
      acceleration: clampScore(between(2, 4)),
      regionalRelevance: 4,
      strategicRelevance: clampScore(between(3, 4)),
      contradictionRichness: contradictionId ? 3 : 2,
      systemicPotential: clampScore(between(3, 4)),
    },
    possiblePatternIds: NEW_PATTERNS.filter((p) => p.clusterIds.includes(t.id)).map((p) => p.id),
    possibleDriverIds: NEW_DRIVERS.filter((d) => d.clusterIds.includes(t.id)).map((d) => d.id),
    confidence: passes ? "medium" : "low",
    status: passes ? "valid" : "candidate",
    reviewStatus: passes ? "human_reviewed" : "needs_evidence",
    humanNotes: "",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
});

const allClusterSignalIds = (cid: string): string[] =>
  cid.startsWith("CLU-1")
    ? clusterSignals.get(cid) ?? []
    : clusterTopUps[cid] ?? [];

// --- Patterns ----------------------------------------------------------------

const patterns: Pattern[] = NEW_PATTERNS.map((p) => {
  const memberIds = p.clusterIds.flatMap((cid) => allClusterSignalIds(cid));
  const key = pickN(memberIds, Math.min(memberIds.length, 14));
  const members = signals.filter((s) => key.includes(s.id));
  for (const s of members) s.patternIds.push(p.id);
  const dates = members.map((s) => s.dateObserved).sort();
  const srcs = new Set(members.flatMap((s) => s.sourceIds));
  return {
    id: p.id,
    name: p.name,
    patternType: p.patternType,
    patternStatement: p.statement,
    evidenceSummary: `Drawn from ${p.clusterIds.length} cluster maps and ${members.length} key signals across the scan window.`,
    keySignalIds: key,
    clusterIds: p.clusterIds,
    contradictionIds: ["CON-001", "CON-002", "CON-003"].filter(() => rand() < 0.4).slice(0, 1),
    possibleDriverIds: NEW_DRIVERS.filter((d) => d.patternIds.includes(p.id)).map((d) => d.id),
    strategicMeaning: p.strategicMeaning,
    firstEvidenceDate: dates[0] ?? "2025-06-01",
    latestEvidenceDate: dates[dates.length - 1] ?? "2026-06-01",
    independentSourceCount: srcs.size,
    confidence: p.validated ? "medium" : "low",
    validationStatus: p.validated ? "validated" : "partially_validated",
    reviewStatus: p.validated ? "human_reviewed" : "needs_evidence",
    humanNotes: "",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
});

// --- Indicators (built before drivers/territories so links exist) ------------

const indicators: MonitoringIndicator[] = NEW_INDICATORS.map((d, i) => {
  const overdue = i % 5 === 4;
  const lastChecked = overdue ? "2026-02-10" : `2026-0${between(4, 6)}-1${between(0, 5)}`;
  return {
    id: sid(101 + i, "IND"),
    name: d.name,
    territoryId: d.territoryId,
    driverId: d.driverId,
    signalId: null,
    indicatorType: d.indicatorType,
    description: d.description,
    currentStatus: d.currentStatus,
    evidence: "Tracked through the demo scan corpus.",
    dateLastChecked: lastChecked,
    trend: d.trend,
    cadence: d.cadence,
    confidence: "medium",
    notes: "",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
});

// --- Drivers ------------------------------------------------------------------

const drivers = NEW_DRIVERS.map((d) => {
  const sigIds = [...new Set(d.clusterIds.flatMap((cid) => allClusterSignalIds(cid)))];
  const members = signals.filter((s) => sigIds.includes(s.id));
  for (const s of members) s.driverIds.push(d.id);
  const srcs = new Set(members.flatMap((s) => s.sourceIds));
  const inds = indicators.filter((i) => i.driverId === d.id).map((i) => i.id);
  const valid =
    d.patternIds.length >= 3 && sigIds.length >= 30 && srcs.size >= 8 &&
    d.contradictionIds.length >= 2 && d.possibleFutures.length >= 1 && inds.length >= 1;
  const driver = {
    id: d.id,
    name: d.name,
    driverStatement: d.statement,
    whatItExplains: d.whatItExplains,
    patternIds: d.patternIds,
    signalIds: sigIds,
    systemsAffected: d.systems,
    contradictionIds: d.contradictionIds,
    secondOrderEffects: d.secondOrder,
    thirdOrderEffects: d.thirdOrder,
    possibleFutures: d.possibleFutures,
    leadingIndicatorIds: inds,
    independentSourceCount: srcs.size,
    scores: {
      explanatoryPower: 4 as Score, crossSectorStrength: 4 as Score, evidenceStrength: 3 as Score,
      persistence: 4 as Score, reversibility: 2 as Score, behaviouralImpact: 4 as Score,
      structuralImpact: 4 as Score, contradictionRichness: 3 as Score,
      scenarioUsefulness: 4 as Score, strategicRelevance: 5 as Score,
    },
    confidence: "medium" as ConfidenceLevel,
    status: (valid ? "validated" : "hypothesis") as "validated" | "hypothesis",
    reviewStatus: "human_reviewed" as ReviewStatus,
    humanNotes: "",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  return driver;
});

// --- Territory -----------------------------------------------------------------

const terSignals = pickN(
  NEW_TERRITORY.clusterIds.flatMap((cid) => allClusterSignalIds(cid)),
  6,
);
const territory: FutureTerritory = {
  id: NEW_TERRITORY.id,
  name: NEW_TERRITORY.name,
  oneLineDefinition: NEW_TERRITORY.oneLine,
  whyEmerging: NEW_TERRITORY.whyEmerging,
  driverIds: NEW_TERRITORY.driverIds,
  patternIds: NEW_TERRITORY.patternIds,
  clusterIds: NEW_TERRITORY.clusterIds,
  representativeSignalIds: terSignals,
  contradictionIds: NEW_TERRITORY.contradictionIds,
  whatItChanges: NEW_TERRITORY.whatItChanges,
  whoItAffects: NEW_TERRITORY.whoItAffects,
  sectorImplications: [
    { sector: "fashion_luxury", note: "Creating with regional designers replaces adapting global products as the way into the market." },
    { sector: "media_entertainment_creator", note: "Commissioning shifts to Arabic-first originals that can also be exported." },
    { sector: "culture_arts_heritage", note: "Museums and collections that define regional work become strategic assets." },
  ],
  scenarioIds: ["SCN-105", "SCN-106"],
  risks: NEW_TERRITORY.risks,
  opportunities: NEW_TERRITORY.opportunities,
  leadingIndicatorIds: indicators.filter((i) => i.territoryId === "TER-102").map((i) => i.id),
  evidenceStrength: 4,
  scenarioReadiness: "scenarios_active",
  monitoringStatus: "strengthening",
  confidence: "medium",
  reviewStatus: "human_reviewed",
  createdAt: nowIso,
  updatedAt: nowIso,
};

// --- Scenarios --------------------------------------------------------------------

const scenarios: Scenario[] = NEW_SCENARIOS.map((s) => {
  const ter = s.territoryId === "TER-102" ? territory : null;
  const clusterPool = ter ? ter.clusterIds : ["CLU-003", "CLU-105", "CLU-112", "CLU-114"];
  const support = pickN(clusterPool.flatMap((cid) => allClusterSignalIds(cid)), 4);
  return {
    id: s.id,
    title: s.title,
    territoryId: s.territoryId,
    horizon: s.horizon,
    scenarioType: s.scenarioType,
    corePremise: s.corePremise,
    whatHasChanged: s.whatHasChanged,
    howPeopleBehave: s.people,
    howInstitutionsBehave: s.institutions,
    howBrandsBehave: s.brands,
    keyTechnologies: ["Verification and provenance layers", "Arabic-first product interfaces"],
    keyPolicies: ["Residency and talent frameworks", "Creative-economy investment programmes"],
    keyCulturalShifts: ["Authorship over import", "Settlement over rotation"],
    winners: s.winners,
    losers: s.losers,
    risks: s.risks,
    opportunities: s.opportunities,
    earlySigns: s.earlySigns,
    strategicQuestions: s.strategicQuestions,
    supportingSignalIds: support,
    supportingPatternIds: s.territoryId === "TER-102" ? ["PAT-103", "PAT-106"] : ["PAT-104", "PAT-107"],
    supportingDriverIds: s.territoryId === "TER-102" ? ["DRV-104"] : ["DRV-103"],
    shapingContradictionIds: s.territoryId === "TER-102" ? ["CON-001"] : ["CON-003"],
    assumptions: s.assumptions.map((a) => ({
      text: a.text,
      label: (a.speculative ? "speculative_possibility" : "hypothesis") as "speculative_possibility" | "hypothesis",
    })),
    qualityChecks: {
      plausible: true, internallyCoherent: true, evidenceLinked: true, strategicallyRelevant: true,
      differentiated: true, notOptimisticFantasy: s.scenarioType !== "optimistic" ? true : true,
      notPureDystopia: true, connectedToTodaysSignals: true, usefulForDecisions: true,
    },
    confidence: s.scenarioType === "wildcard" ? "low" : "medium",
    reviewStatus: "human_reviewed",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
});

// --- Implications --------------------------------------------------------------

const implications: StrategicImplication[] = NEW_IMPLICATIONS.map((d, i) => {
  const pool = (d.territoryId === "TER-102" ? NEW_TERRITORY.clusterIds : ["CLU-003", "CLU-105", "CLU-112", "CLU-114", "CLU-108"]).flatMap((cid) => allClusterSignalIds(cid));
  return {
    id: sid(101 + i, "IMP"),
    territoryId: d.territoryId,
    scenarioId: d.scenarioId,
    sectors: d.sectors,
    audiences: d.audiences,
    implicationType: d.implicationType,
    implication: d.implication,
    whyItMatters: d.whyItMatters,
    evidenceSignalIds: pickN(pool, 3),
    evidenceDriverIds: d.territoryId === "TER-102" ? ["DRV-104"] : ["DRV-103"],
    opportunity: d.opportunity,
    risk: d.risk,
    recommendedAction: d.action,
    confidence: d.confidence,
    timeHorizon: d.horizon,
    reviewStatus: "human_reviewed",
    createdAt: nowIso,
    updatedAt: nowIso,
  };
});

// --- Top-ups for existing hand-authored records ---------------------------------

const territoryTopUps: Record<string, { scenarioIds: string[]; leadingIndicatorIds: string[]; driverIds: string[]; patternIds: string[] }> = {
  "TER-001": {
    scenarioIds: ["SCN-103", "SCN-104"],
    leadingIndicatorIds: indicators.filter((i) => i.territoryId === "TER-001").map((i) => i.id),
    driverIds: ["DRV-103"],
    patternIds: ["PAT-104", "PAT-107"],
  },
};

// --- Emit -------------------------------------------------------------------------

const out = `/**
 * GENERATED FILE — do not edit by hand. Produced by scripts/generate-seed.ts
 * (deterministic; re-run the script to regenerate). This is the scan-scale
 * evidence body layered on top of the hand-authored anchor seed: every count
 * shown in the UI is backed by a record here, all demo-flagged, no invented
 * URLs. See the generator for the hand-written narrative core.
 */

import type {
  Cluster, FutureTerritory, MonitoringIndicator, Observation, Pattern,
  Scenario, Signal, Source, StrategicImplication, Driver,
} from "../types";

export const generatedSources: Source[] = ${JSON.stringify(sources)};
export const generatedObservations: Observation[] = ${JSON.stringify(observations)};
export const generatedSignals: Signal[] = ${JSON.stringify(signals)};
export const generatedClusters: Cluster[] = ${JSON.stringify(clusters)};
export const generatedPatterns: Pattern[] = ${JSON.stringify(patterns)};
export const generatedDrivers: Driver[] = ${JSON.stringify(drivers)};
export const generatedTerritories: FutureTerritory[] = ${JSON.stringify([territory])};
export const generatedScenarios: Scenario[] = ${JSON.stringify(scenarios)};
export const generatedImplications: StrategicImplication[] = ${JSON.stringify(implications)};
export const generatedIndicators: MonitoringIndicator[] = ${JSON.stringify(indicators)};

/** Signal ids to append to existing hand-authored clusters. */
export const clusterTopUps: Record<string, string[]> = ${JSON.stringify(clusterTopUps)};

/** Link additions for existing hand-authored territories. */
export const territoryTopUps: Record<string, { scenarioIds: string[]; leadingIndicatorIds: string[]; driverIds: string[]; patternIds: string[] }> = ${JSON.stringify(territoryTopUps)};
`;

fs.writeFileSync(path.join(process.cwd(), "src", "lib", "seed", "generated.ts"), out);
console.log(
  `generated: ${sources.length} sources, ${observations.length} observations, ${signals.length} signals, ${clusters.length} clusters, ${patterns.length} patterns, ${drivers.length} drivers, 1 territory, ${scenarios.length} scenarios, ${implications.length} implications, ${indicators.length} indicators`,
);
