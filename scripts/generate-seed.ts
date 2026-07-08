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
    name: "The Ramadan economy is formalising into year-round cultural infrastructure",
    unifyingQuestion: "What happens when a season becomes a system?",
    statement:
      "Extended licensing, programmed night markets, dedicated retail calendars and hospitality formats built for the night economy are converting Ramadan's temporary rhythms into permanent cultural and commercial infrastructure.",
    evidenceSummary:
      "Licensing changes, programming budgets, staffing patterns and venue design briefs show seasonal formats being institutionalised.",
    contradictionId: null,
    recipes: [
      {
        title: "{city} formalises extended night-economy licensing beyond the season",
        whatHappened: "{city} authorities extended night-economy licensing frameworks piloted during Ramadan into year-round provisions for designated districts.",
        behaviour: "Operators and audiences are treating the night as a first-class cultural timeslot, not an exception.",
        system: "The religious and ritual system is contributing formats that the urban and retail systems adopt permanently.",
        future: "Gulf cities may develop a distinctive night-cultural infrastructure exported to other hot-climate regions.",
        whyItMatters: "Seasonal formats becoming permanent reshapes leases, staffing, programming and media calendars.",
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
    name: "Arabic-first media is becoming default, not niche",
    unifyingQuestion: "What changes when the region's first language is also its first choice?",
    statement:
      "Arabic podcasts topping charts, dialect-tuned assistants, Arabic-first product interfaces and creator economies operating natively in Arabic mark a shift from Arabic as localisation to Arabic as origination.",
    evidenceSummary:
      "Chart data, product launches, advertising allocation and commissioning decisions show Arabic-first formats leading rather than following.",
    contradictionId: null,
    recipes: [
      {
        title: "Arabic podcast network in {country} outdraws imported formats in its category",
        whatHappened: "An Arabic-language podcast network in {country} reported category leadership over imported and translated competitors across its top shows.",
        behaviour: "Listeners are defaulting to Arabic-original programming for daily listening, not just cultural occasions.",
        system: "The media system's centre of gravity is moving to Arabic origination.",
        future: "Arabic-first formats may set regional media economics, with imports adapting to them.",
        whyItMatters: "Language default determines who can build attention businesses in the region.",
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
    name: "Heat and climate adaptation are redrawing daily urban rhythms",
    unifyingQuestion: "How does a region redesign its days around heat it cannot ignore?",
    statement:
      "Shaded corridors, night-shifted activity, indoor civic space and heat-resilient design codes show Gulf cities converting climate adaptation from emergency measure into everyday urban design.",
    evidenceSummary:
      "Design codes, event scheduling shifts, infrastructure investments and mobility data show daily life reorganising around thermal reality.",
    contradictionId: null,
    recipes: [
      {
        title: "{city} mandates shaded pedestrian corridors in new district codes",
        whatHappened: "{city} planning authorities added mandatory shaded pedestrian corridors and thermal-comfort standards to new district design codes.",
        behaviour: "Residents walk, gather and spend where thermal comfort is engineered — and avoid where it is not.",
        system: "The urban system is internalising climate adaptation as a base requirement, not a retrofit.",
        future: "Thermal comfort may become as decisive for property value as transport access.",
        whyItMatters: "Design codes lock decades of daily behaviour into the built environment.",
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
    name: "Education and work are converging into lifelong credentialing systems",
    unifyingQuestion: "What replaces the degree when careers outlive curricula?",
    statement:
      "National skills platforms, employer academies, micro-credentials recognised in visa frameworks and mid-career retraining subsidies are fusing education and employment into one continuous system.",
    evidenceSummary:
      "Policy launches, enrolment data, employer programmes and platform partnerships show credentialing becoming continuous and state-recognised.",
    contradictionId: null,
    recipes: [
      {
        title: "{country} links recognised micro-credentials to talent-visa eligibility",
        whatHappened: "{country} added recognised micro-credentials to the qualification criteria for talent-visa categories.",
        behaviour: "Professionals are assembling portfolios of continuous credentials rather than relying on terminal degrees.",
        system: "The education and migration systems are fusing into a single talent-qualification infrastructure.",
        future: "The Gulf may operate skills-recognition systems that outcompete degree-centric immigration models.",
        whyItMatters: "Whoever defines recognised skill controls the region's talent pipeline.",
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
    name: "Gaming and esports are becoming national youth infrastructure",
    unifyingQuestion: "What does a country build when games are its youth's main cultural language?",
    statement:
      "Sovereign investment, city-scale venues, school leagues and career pathways are converting gaming from entertainment purchase into national infrastructure for youth identity, skills and soft power.",
    evidenceSummary:
      "Investment announcements, venue construction, league formation and participation data show state-scale commitment to gaming as infrastructure.",
    contradictionId: null,
    recipes: [
      {
        title: "School esports league launches across {country} with federation backing",
        whatHappened: "A federation-backed school esports league launched across {country} with structured seasons, coaching standards and progression pathways.",
        behaviour: "Competitive gaming is becoming an organised youth activity with adult institutional support, like traditional sport.",
        system: "The education and sport systems are absorbing gaming as a legitimate developmental track.",
        future: "Gaming careers may be institutionally supported paths rather than exceptional outcomes.",
        whyItMatters: "Institutionalisation converts a pastime into a talent system with venues, sponsors and curricula.",
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
    name: "Mobility investment is rewiring how Gulf cities are used daily",
    unifyingQuestion: "What does a car-built region become when the metro arrives?",
    statement:
      "Metro openings, station-district development, micro-mobility permits and transit-oriented leasing show daily urban behaviour reorganising around fixed transit in cities designed for cars.",
    evidenceSummary:
      "Ridership data, leasing patterns near stations, permit changes and employer commute programmes track a structural mobility shift.",
    contradictionId: null,
    recipes: [
      {
        title: "Retail leasing premiums emerge around {city} transit stations",
        whatHappened: "Brokerage data in {city} showed retail leasing premiums forming around metro stations relative to comparable car-access sites.",
        behaviour: "Foot traffic is consolidating along transit spines, changing where daily spending happens.",
        system: "The mobility system is beginning to shape the retail and housing systems rather than serve them.",
        future: "Transit-oriented districts may anchor the next generation of Gulf urban value.",
        whyItMatters: "Transit premiums signal a durable rewiring of daily movement and land value.",
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
    name: "Food systems are localising for security and identity",
    unifyingQuestion: "Can the region grow what it means as well as what it eats?",
    statement:
      "AgTech investment, desert farming, national food-security strategies and chef-led regional cuisine movements are localising the food system simultaneously for resilience and for cultural authorship.",
    evidenceSummary:
      "Investment flows, farm openings, policy strategies and menu analysis show localisation operating as both security policy and identity project.",
    contradictionId: null,
    recipes: [
      {
        title: "Chef-led movement in {city} elevates regional ingredients to fine-dining canon",
        whatHappened: "A cohort of {city} chefs built tasting menus around regional ingredients — dates, camel dairy, Gulf seafood, desert botanicals — to critical acclaim.",
        behaviour: "Diners are treating regional ingredients as prestige rather than nostalgia.",
        system: "The consumption and identity systems are converging on food as cultural authorship.",
        future: "A recognised Khaleeji fine-dining canon may anchor culinary tourism and export formats.",
        whyItMatters: "Cuisine is among the fastest routes from identity to economy.",
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
    name: "Second-tier cities are entering the regional cultural map",
    unifyingQuestion: "What happens when the region's story stops being written in two cities?",
    statement:
      "Festival programmes, creative-district investments, film locations and domestic tourism flows are pulling AlUla, Sharjah, Muscat, Manama and Dammam into cultural relevance that Dubai and Riyadh no longer monopolise.",
    evidenceSummary:
      "Programming calendars, visitation data, grants and creative-economy investments show cultural gravity distributing beyond the two dominant hubs.",
    contradictionId: null,
    recipes: [
      {
        title: "{city} creative district reports resident-artist waiting lists",
        whatHappened: "A creative district in {city} reported waiting lists for resident-artist studios and programme slots for the coming season.",
        behaviour: "Creative talent is choosing second-tier cities for affordability, character and institutional attention.",
        system: "The cultural production system is developing multiple regional centres rather than one or two gateways.",
        future: "A distributed cultural map may give the region resilience and variety that single-hub models lack.",
        whyItMatters: "Cultural decentralisation changes where audiences travel, where brands show up and where talent settles.",
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
        title: "{city} concept store dedicates flagship floor to regional designers",
        whatHappened: "A {city} concept store re-allocated its flagship floor from international labels to regional designers working in contemporary heritage idioms.",
        behaviour: "Shoppers are paying flagship prices for regional authorship.",
        system: "The luxury system is re-ranking prestige toward local design languages.",
        future: "Regional authorship may anchor Gulf luxury retail the way European maisons once did.",
        whyItMatters: "Floor allocation is retail's most honest vote on where prestige is heading.",
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
        title: "Regional brand casting replaces international faces in {country} campaign season",
        whatHappened: "Campaign launches across {country} cast regional creators and athletes where previous seasons used international celebrities.",
        behaviour: "Brands are buying regional credibility instead of imported fame.",
        system: "The identity and media systems are re-pricing who confers aspiration.",
        future: "Regional credibility may become the default currency of Gulf brand building.",
        whyItMatters: "Casting budgets are a fast-moving indicator of whose story sells.",
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
        title: "Bank in {country} publishes human-review guarantees for automated decisions",
        whatHappened: "A retail bank in {country} published guaranteed human-review rights covering its automated credit and service decisions.",
        behaviour: "Customers are demanding named human accountability precisely where automation is most complete.",
        system: "The trust system is forcing a human layer back into automated finance.",
        future: "Human accountability may become a regulated or competitive standard across automated services.",
        whyItMatters: "Guarantees like this concede that automation alone cannot carry high-stakes trust.",
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
        title: "Craft markets in {city} report premiums for verifiably handmade goods",
        whatHappened: "Sellers at {city} craft markets reported sustained price premiums for goods with verifiable human making over comparable manufactured items.",
        behaviour: "Buyers pay for proof of human authorship as synthetic goods become indistinguishable.",
        system: "The consumption system is developing verification layers for human origin.",
        future: "Human-made verification may become a formal certification economy.",
        whyItMatters: "The premium quantifies trust scarcity in an age of synthetic abundance.",
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
        whatHappened: "Admissions data across {city} family districts showed lengthening international-school waiting lists linked to long-visa family relocation.",
        behaviour: "Families are making decade-horizon education commitments in Gulf cities.",
        system: "The education system is scaling to a settling population rather than a rotating one.",
        future: "School capacity may become the binding constraint on settlement-led growth.",
        whyItMatters: "Education demand is the least reversible evidence of permanent settlement.",
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
        whatHappened: "Financial institutions in {country} launched retirement savings and inheritance-planning products designed for long-term foreign residents.",
        behaviour: "Residents are planning whole lives — not postings — inside Gulf jurisdictions.",
        system: "The finance system is building the instruments of permanence.",
        future: "A resident lifecycle economy may replace the expatriate rotation economy.",
        whyItMatters: "Products with decade horizons are institutions voting on settlement.",
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
      "Across fashion, media, museums and food, prestige is migrating from imported global symbols toward locally authored cultural work — the region increasingly confers status on what it makes, not what it buys in.",
    strategicMeaning:
      "Brands and institutions that author with the region will outcompete those that merely localise for it.",
    clusterIds: ["CLU-001", "CLU-106", "CLU-115"],
    validated: true,
  },
  {
    id: "PAT-104",
    name: "From Temporary Presence to Permanent Belonging",
    patternType: "demographic",
    statement:
      "Residency reform, education demand, retirement products and domiciled capital repeat one movement across unrelated sectors: presence in the Gulf is converting from rotation to settlement.",
    strategicMeaning:
      "Institutions built for a rotating population must rebuild for a settling one — or lose it.",
    clusterIds: ["CLU-003", "CLU-105", "CLU-112"],
    validated: true,
  },
  {
    id: "PAT-105",
    name: "From Hospitality as Stay to Hospitality as Lifestyle Infrastructure",
    patternType: "behavioural",
    statement:
      "Hotels adding clinics, night economies formalising and second-tier destinations programming for residents show hospitality assets becoming everyday life infrastructure rather than episodic accommodation.",
    strategicMeaning:
      "Hospitality operators are becoming infrastructure operators; the relevant competitor set is changing.",
    clusterIds: ["CLU-104", "CLU-109", "CLU-116"],
    validated: false,
  },
  {
    id: "PAT-106",
    name: "From Global Templates to Regional Systems of Meaning",
    patternType: "cultural",
    statement:
      "Arabic-first media, regional cuisine canons and locally authored cultural production repeat the same movement: formats that once arrived as global templates are being rebuilt as regional systems of meaning.",
    strategicMeaning:
      "Localisation is no longer the winning move; origination is.",
    clusterIds: ["CLU-106", "CLU-110", "CLU-115"],
    validated: false,
  },
  {
    id: "PAT-107",
    name: "From Destination Tourism to Resident Ecosystems",
    patternType: "economic",
    statement:
      "Transit-oriented districts, active third places, year-round night economies and distributed cultural centres are reorganising Gulf places around the daily lives of residents rather than the itineraries of visitors.",
    strategicMeaning:
      "Strategies priced on arrivals will misread markets whose value is shifting to residency.",
    clusterIds: ["CLU-108", "CLU-114", "CLU-109", "CLU-116"],
    validated: true,
  },
  {
    id: "PAT-108",
    name: "From Convenience to Verification",
    patternType: "behavioural",
    statement:
      "Paid human review, provenance labelling and accountability guarantees are growing fastest exactly where convenience is most saturated — consumers are re-pricing certainty above speed in decisions that matter.",
    strategicMeaning:
      "The next premium tier across categories is verification, not velocity.",
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
      "Residency reform, family relocation, capital migration, education demand and lifestyle infrastructure are converting parts of the Gulf from temporary work destinations into long-term life platforms.",
    whatItExplains:
      "Why belonging is being productised, why presence is becoming permanent, and why places are reorganising around residents — one force underneath three repeated movements.",
    patternIds: ["PAT-104", "PAT-107", "PAT-001"],
    clusterIds: ["CLU-003", "CLU-105", "CLU-112", "CLU-108", "CLU-114"],
    systems: ["migration", "family", "education", "finance", "housing", "urban"],
    secondOrder: [
      "Demand rises for schools, family healthcare, community space and long-horizon financial products.",
      "Retail and hospitality re-price toward repeat residents over one-time visitors.",
    ],
    thirdOrder: [
      "The Gulf's psychological contract shifts from career stopover to life platform, changing who comes and why.",
    ],
    possibleFutures: [
      "A resident lifecycle economy — education to retirement — operating inside Gulf jurisdictions.",
      "Settlement-led urban value chains anchored on schools, transit and community infrastructure.",
    ],
    contradictionIds: ["CON-003", "CON-002"],
  },
  {
    id: "DRV-104",
    name: "Authored legitimacy",
    statement:
      "Status is shifting from imported global symbols toward locally authored cultural legitimacy — the region increasingly trusts, buys and exports what it makes itself.",
    whatItExplains:
      "Why regional design languages, Arabic-first media and regional cuisine canons are rising together, and why imported prestige is losing pricing power across unrelated categories.",
    patternIds: ["PAT-103", "PAT-106", "PAT-001"],
    clusterIds: ["CLU-001", "CLU-106", "CLU-110", "CLU-115", "CLU-116"],
    systems: ["identity", "cultural_production", "media", "luxury", "consumption"],
    secondOrder: [
      "Commissioning, casting and retail-floor budgets reallocate toward regional authorship.",
      "Institutions build canonising infrastructure — collections, prizes, curricula — for regional work.",
    ],
    thirdOrder: [
      "The region becomes a net exporter of cultural reference points rather than an importer of them.",
    ],
    possibleFutures: [
      "Regional culture operating as strategic capital across tourism, luxury, media and diplomacy.",
      "A distributed cultural map where second-tier cities hold recognised authorship niches.",
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
    "The Gulf's shift from importing culture, formats and legitimacy to authoring them — and exporting the results.",
  whyEmerging:
    "Two drivers converge. Authored legitimacy (DRV-104) is re-pricing status toward locally made cultural work across fashion, media, food and institutions. The trust premium (DRV-001) makes verified human and regional authorship more valuable as synthetic and imported abundance grows. The strongest evidence sits in the identity-design cluster (CLU-001) and Arabic-first media cluster (CLU-110): regional authorship leading charts, floors and collections rather than filling quotas. The unresolved tension — global luxury aspiration versus rising regional identity (CON-001) — is what makes this a territory to monitor rather than a conclusion to act on blindly.",
  driverIds: ["DRV-104", "DRV-001"],
  patternIds: ["PAT-103", "PAT-106"],
  clusterIds: ["CLU-001", "CLU-106", "CLU-110", "CLU-115", "CLU-116"],
  contradictionIds: ["CON-001"],
  whatItChanges:
    "The direction of cultural trade. Brands stop asking how to localise global playbooks and start asking how to participate in regional authorship. Media commissioning, retail allocation, institutional collecting, casting, cuisine and education reorganise around origination. Prestige pricing shifts from provenance-by-import to provenance-by-authorship, and the export question changes from oil-adjacent goods to systems of meaning.",
  whoItAffects: [
    "Luxury and fashion houses whose regional strategies assume imported prestige",
    "Broadcasters, platforms and studios deciding where original commissioning lives",
    "Cultural institutions building collections and canons",
    "Tourism boards selling place through culture",
    "Creators and designers choosing where authorship is best rewarded",
    "Investors pricing creative-economy infrastructure",
  ],
  risks: [
    "Boosterism inflating authorship claims faster than craft capacity grows",
    "Canonisation concentrating in two cities and starving the wider map",
    "Global houses re-capturing the movement through acquisition rather than participation",
  ],
  opportunities: [
    "First-mover credibility for brands that co-author rather than localise",
    "Export formats — media, cuisine, design — built on regional systems of meaning",
    "Creative-economy infrastructure: education, IP, production, distribution",
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
      "Settlement conversion continues but slower than headline policy suggests: families anchor where schools and community exist, while cost pressure keeps a large rotational workforce alongside them.",
    whatHasChanged:
      "Long-visa uptake grows steadily rather than exponentially. Two housing markets coexist: settlement districts with schools and transit, and rotation districts optimised for short stays.",
    people:
      "Settling families plan decade horizons; rotational workers remain transactional. The two populations use the same cities differently.",
    institutions:
      "Schools and healthcare expand where settlement clusters; regulators tune visa categories incrementally rather than radically.",
    brands:
      "Winning operators run dual propositions — lifecycle products for settlers, convenience products for rotators — without confusing the two.",
    winners: ["School and healthcare operators in settlement districts", "Developers with family-format supply", "Banks with resident-lifecycle products"],
    losers: ["Operators pricing the whole market as settlers", "Investor-studio-heavy pipelines"],
    risks: ["Cost-of-living pressure stalling family relocation", "Policy tightening after political cycles"],
    opportunities: ["Dual-market product architectures", "Settlement-district land strategies"],
    earlySigns: ["School waiting lists lengthening in specific districts", "Retirement products gaining uptake", "Family-format housing outperforming studios"],
    strategicQuestions: [
      "Which districts are actually settling, and which only look like it?",
      "What share of our customer base is lifecycle versus rotation?",
    ],
    assumptions: [
      { text: "Visa frameworks remain at least as open as today.", speculative: false },
      { text: "Education capacity keeps pace in key districts.", speculative: true },
    ],
  },
  {
    id: "SCN-104",
    title: "The Anchor Reversal",
    territoryId: "TER-001",
    horizon: "long",
    scenarioType: "wildcard",
    corePremise:
      "An external shock — a prolonged regional security crisis or global capital repricing — tests settlement: some anchored families deepen roots while newly arrived capital retreats, splitting the Permanent Gulf into committed cores and evaporating edges.",
    whatHasChanged:
      "Settlement proves durable exactly where community infrastructure existed, and fragile where it was only paperwork. The territory mutates rather than dies.",
    people:
      "Rooted families stay through the shock; speculative movers leave quickly, revealing which belonging was real.",
    institutions:
      "Governments double down on retention of committed residents; institutions with lifecycle relationships hold their base.",
    brands:
      "Operators discover their true resident base and rebuild propositions around demonstrated commitment.",
    winners: ["Institutions with deep community roots", "Districts with schools, transit and third places"],
    losers: ["Paper-residency programmes", "Speculative settlement plays without community infrastructure"],
    risks: ["Overreaction pricing out the committed core", "Reading temporary retreat as structural reversal"],
    opportunities: ["Acquiring durable positions during the retreat", "Retention products for committed residents"],
    earlySigns: ["Divergence between visa issuance and school enrolment", "Community-district resilience during minor shocks"],
    strategicQuestions: [
      "Which parts of our settlement thesis survive a stress test?",
      "What distinguishes rooted belonging from arbitraged residency in our data?",
    ],
    assumptions: [
      { text: "A material external shock occurs within the horizon.", speculative: true },
      { text: "Community infrastructure differentially retains settlers under stress.", speculative: true },
    ],
  },
  {
    id: "SCN-105",
    title: "The Export Turn",
    territoryId: "TER-102",
    horizon: "mid",
    scenarioType: "optimistic",
    corePremise:
      "Regional authorship compounds: Arabic-first formats, Khaleeji design languages and regional cuisine canons become exportable systems, and the Gulf begins selling meaning abroad the way it once only bought it.",
    whatHasChanged:
      "Commissioning, collecting and casting decisions have made regional authorship the default; export deals carry formats outward with regional credibility intact.",
    people:
      "Creators build global careers from regional bases; audiences treat regional work as first-choice culture, not civic duty.",
    institutions:
      "Cultural institutions operate as canon-makers with international pull; education pipelines feed authorship professions.",
    brands:
      "Global houses co-author with regional talent to stay relevant; regional brands export with cultural confidence.",
    winners: ["Regional creators and studios", "Institutions that canonised early", "Cities with authorship infrastructure"],
    losers: ["Import-and-localise intermediaries", "Prestige models built on distance"],
    risks: ["Authorship bubble inflating past craft capacity", "Export attention diluting regional specificity"],
    opportunities: ["Format export businesses", "Authorship education and IP infrastructure", "Co-authoring partnerships"],
    earlySigns: ["Regional formats licensed outward", "International institutions acquiring regional work", "Export revenue lines in creative-economy reporting"],
    strategicQuestions: [
      "What would our category look like exported from the region rather than imported into it?",
      "Which regional authors should we be building with now?",
    ],
    assumptions: [
      { text: "Creative-economy investment sustains through the horizon.", speculative: false },
      { text: "External markets receive regional formats at scale.", speculative: true },
    ],
  },
  {
    id: "SCN-106",
    title: "The Boosterism Trap",
    territoryId: "TER-102",
    horizon: "near",
    scenarioType: "pessimistic",
    corePremise:
      "Authorship claims outrun authorship capacity: subsidised prestige, imported ghost-production and celebratory coverage inflate a legitimacy bubble that audiences quietly discount.",
    whatHasChanged:
      "The vocabulary of regional authorship saturates marketing while craft pipelines lag; audiences learn to distinguish authored work from authored-washed work.",
    people:
      "Consumers grow sceptical of regional-identity claims and reward only verifiable craft; creators resent dilution of the label.",
    institutions:
      "Institutions face credibility tests over what they canonise; some retreat to imported safety.",
    brands:
      "Brands that authored-washed pay a trust penalty; those with real regional craft gain by contrast.",
    winners: ["Verifiably crafted regional work", "Verification and provenance layers for culture"],
    losers: ["Authorship-washing campaigns", "Institutions that canonised too fast"],
    risks: ["A visible failure discrediting the wider movement", "Talent exit if the label collapses"],
    opportunities: ["Verification standards for cultural authorship", "Patient craft-first positioning"],
    earlySigns: ["Audience sarcasm toward identity marketing", "Gap between authorship claims and named credits", "Discounting of regional-label premiums"],
    strategicQuestions: [
      "Can we evidence our authorship claims with named credits and process?",
      "What is our exposure if the regional-authorship label gets discounted?",
    ],
    assumptions: [
      { text: "Marketing adoption of authorship language continues to outpace craft investment.", speculative: true },
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
  { territoryId: "TER-001", scenarioId: "SCN-103", sectors: ["education_work"], audiences: ["education_providers", "investors"], implicationType: "capability", implication: "School capacity in settlement districts is becoming the binding constraint on the settlement economy — whoever solves it captures the anchor tenant of permanence.", whyItMatters: "Education demand is the least reversible settlement evidence, and waiting lists are already lengthening.", opportunity: "Long-horizon education infrastructure with embedded community services.", risk: "Building for headline migration numbers rather than verified settlement districts.", action: "Map school waiting lists against long-visa uptake by district before the next land or expansion decision.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-001", scenarioId: "SCN-103", sectors: ["finance_banking_investment"], audiences: ["banks"], implicationType: "product", implication: "Resident-lifecycle finance — retirement, inheritance, education savings — is the settlement economy's product frontier while most banks still sell rotation products.", whyItMatters: "Institutions are already launching permanence instruments; the category will be claimed within a few product cycles.", opportunity: "Twenty-year customer relationships priced at settlement rather than posting horizons.", risk: "Regulatory divergence across GCC jurisdictions fragmenting the product set.", action: "Stand up a resident-lifecycle product line with named milestones tied to visa and education data.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-001", scenarioId: "SCN-104", sectors: ["real_estate_urban"], audiences: ["developers", "urban_planners"], implicationType: "risk", implication: "Settlement value is conditional on community infrastructure — paper residency without schools, transit and third places evaporates first under stress.", whyItMatters: "The wildcard scenario shows anchored and arbitraged residency diverging sharply in a shock.", opportunity: "Stress-resilient district strategies anchored on community assets.", risk: "Underwriting settlement demand that is actually rotation in disguise.", action: "Score the pipeline by community-infrastructure completeness, not visa-category demand alone.", confidence: "medium", horizon: "mid_term" },
  { territoryId: "TER-001", scenarioId: null, sectors: ["mobility_transport", "retail_commerce"], audiences: ["retailers", "developers"], implicationType: "experience", implication: "Transit spines are becoming the organising geography of daily resident spending — retail formats built for car arrival will mis-locate.", whyItMatters: "Leasing premiums around stations are already measurable in early corridors.", opportunity: "Transit-adjacent daily-life formats: food, services, community retail.", risk: "Premiums inflating faster than footfall in unproven corridors.", action: "Re-weight the location model toward station catchments and test two transit-native formats.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-001", scenarioId: null, sectors: ["hospitality_tourism"], audiences: ["hotels", "tourism_boards"], implicationType: "innovation", implication: "The most valuable guest of the settlement era lives ten minutes away — hospitality assets need resident propositions, not only visitor ones.", whyItMatters: "Night-economy formalisation and lifestyle infrastructure are reorganising demand around residents.", opportunity: "Membership, clinics, co-working and programming layers on existing assets.", risk: "Diluting visitor economics before resident revenue matures.", action: "Pilot a resident membership across one flagship asset with clear cannibalisation metrics.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: "SCN-105", sectors: ["fashion_luxury"], audiences: ["luxury_brands", "brands"], implicationType: "brand", implication: "Co-authorship with regional designers is replacing localisation as the credible market-entry strategy — the window for first-mover partnerships is open but narrowing.", whyItMatters: "Retail floors, castings and collections are already re-ranking toward regional authorship.", opportunity: "Durable credibility through named regional co-authors and craft investment.", risk: "Authorship-washing detection — audiences increasingly check credits.", action: "Commit to multi-season co-authored lines with named credits and regional production.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: "SCN-105", sectors: ["media_entertainment_creator"], audiences: ["media_platforms", "entertainment"], implicationType: "media", implication: "Arabic-first origination is becoming the default attention economy — commissioning budgets anchored on imports will buy declining relevance.", whyItMatters: "Arabic-original formats are already out-drawing imports in key categories.", opportunity: "Regional format ownership with export upside.", risk: "Chasing volume of Arabic content without authorship quality.", action: "Shift the commissioning ratio toward Arabic-first originals with named regional creators.", confidence: "high", horizon: "immediate" },
  { territoryId: "TER-102", scenarioId: "SCN-106", sectors: ["culture_arts_heritage"], audiences: ["cultural_institutions", "governments"], implicationType: "risk", implication: "Canonisation speed is a credibility risk — institutions that consecrate authorship faster than craft matures will pay in trust when the discount comes.", whyItMatters: "The pessimistic scenario turns on claims outrunning capacity.", opportunity: "Verification-grade curation: named credits, process transparency, craft standards.", risk: "A visible authorship-washing failure discrediting the wider movement.", action: "Adopt evidence standards for authorship claims in acquisitions and programming.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: null, sectors: ["food_beverage_third_places", "hospitality_tourism"], audiences: ["tourism_boards", "hotels"], implicationType: "experience", implication: "Regional cuisine is the fastest route from identity to visitor economy — a recognised Khaleeji canon converts authorship into bookings.", whyItMatters: "Chef-led movements are already earning critical acclaim and premium pricing.", opportunity: "Culinary tourism products anchored on named regional chefs and ingredients.", risk: "Flattening regional variety into one marketable cuisine.", action: "Build destination gastronomy programmes around named chefs and verifiable regional sourcing.", confidence: "medium", horizon: "near_term" },
  { territoryId: "TER-102", scenarioId: null, sectors: ["education_work", "culture_arts_heritage"], audiences: ["education_providers", "governments"], implicationType: "capability", implication: "Authorship professions need pipelines — design, production, curation and craft education are the constraint on the authoring region's growth.", whyItMatters: "Every optimistic path through this territory assumes craft capacity that must be built now.", opportunity: "Regional creative-education infrastructure with employment-linked credentials.", risk: "Importing faculty and frameworks that reproduce template thinking.", action: "Fund authorship-track education with named industry partnerships and credential recognition.", confidence: "medium", horizon: "mid_term" },
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
  { name: "Long-visa issuance vs school enrolment divergence", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "demographic", description: "Tracks whether residency paperwork converts into education commitments — the settlement/arbitrage gap.", currentStatus: "Enrolment tracking issuance in core districts; gap widening in two speculative corridors.", trend: "strengthening", cadence: "quarterly" },
  { name: "Resident-lifecycle financial product launches", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "investment", description: "Counts retirement, inheritance and education-savings products for long-term residents.", currentStatus: "Three institutions live; two more announced this half.", trend: "strengthening", cadence: "quarterly" },
  { name: "Family-format housing share of new supply", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "infrastructure", description: "Share of three-bedroom-plus units in announced pipelines versus investor studios.", currentStatus: "Rising in transit districts; flat elsewhere.", trend: "stable", cadence: "quarterly" },
  { name: "Station-catchment retail leasing premium", territoryId: "TER-001", driverId: "DRV-103", indicatorType: "behaviour", description: "Leasing premium of transit-adjacent retail over car-access comparables.", currentStatus: "Premium measurable in two corridors; data thin elsewhere.", trend: "strengthening", cadence: "quarterly" },
  { name: "Rotation-market wage cost pressure", territoryId: "TER-001", driverId: null, indicatorType: "resistance", description: "Cost pressure that could stall family relocation despite policy openness.", currentStatus: "Housing and schooling cost growth outpacing wage growth for mid-income families.", trend: "contradictory", cadence: "quarterly" },
  { name: "Arabic-original share of top podcast charts", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "media", description: "Share of Arabic-first originals in top regional audio charts.", currentStatus: "Majority position held for third consecutive quarter.", trend: "strengthening", cadence: "monthly" },
  { name: "Regional designer share of flagship retail floors", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "consumer", description: "Floor allocation to regional authorship in flagship retail.", currentStatus: "Two flagship reallocations this season; premium sustained.", trend: "strengthening", cadence: "quarterly" },
  { name: "Named-credit density in authorship marketing", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "contradiction", description: "Whether regional-authorship claims carry named credits — the boosterism check.", currentStatus: "Claims growing faster than named credits in campaign sampling.", trend: "contradictory", cadence: "quarterly" },
  { name: "Institutional acquisition of living regional designers", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "cultural", description: "Permanent-collection acquisitions of living regional designers.", currentStatus: "Two institutions acquired this year; pipeline visible.", trend: "strengthening", cadence: "biannual" },
  { name: "Regional format export deals", territoryId: "TER-102", driverId: "DRV-104", indicatorType: "investment", description: "Outbound licensing of regional media, cuisine and design formats.", currentStatus: "First outbound licences signed; volume still small.", trend: "stable", cadence: "biannual" },
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
  { title: "Celebrity visits {city} flagship opening", desc: "An international celebrity appeared at a {city} retail opening to significant social coverage.", status: "archived_noise", rationale: "Event coverage with no behaviour or system shift — publicity, not evidence.", sectors: ["retail_commerce"] },
  { title: "Operator claims record quarter in {city} press release", desc: "A press release claimed record quarterly performance without published methodology or comparable figures.", status: "archived_noise", rationale: "Promotional claim without verifiable data; PR framing.", sectors: ["hospitality_tourism"] },
  { title: "Viral thread predicts property boom in {city}", desc: "An anonymous viral thread predicted a property boom citing unnamed insiders.", status: "archived_noise", rationale: "Anonymous speculation; no credible source; recency-driven.", sectors: ["real_estate_urban"] },
  { title: "Global trend piece maps Western retail format onto the Gulf", desc: "A trend article asserted a Western retail behaviour applies regionally without regional evidence.", status: "archived_noise", rationale: "Global trend treated as regional without regional evidence — guardrail archive.", sectors: ["retail_commerce"] },
  { title: "Influencer review praises new {city} wellness studio", desc: "A sponsored influencer review praised a single new wellness studio opening.", status: "archived_noise", rationale: "Single sponsored anecdote; platform self-promotion; no wider implication.", sectors: ["health_wellness_longevity"] },
  { title: "Restaurant week returns to {city}", desc: "An annual restaurant week returned with its usual programming.", status: "archived_noise", rationale: "Recurring calendar event; adds no new evidence of change.", sectors: ["food_beverage_third_places"] },
  { title: "Startup announces app for {city} commuters", desc: "A startup announced a commuter app with no usage data or differentiation stated.", status: "needs_more_evidence", rationale: "Interesting space but no adoption evidence yet; revisit after launch data.", sectors: ["mobility_transport"] },
  { title: "Survey hints at changing gift-giving among Gulf youth", desc: "A small-sample survey suggested shifting gift-giving preferences among young Gulf consumers.", status: "needs_more_evidence", rationale: "Sample too small to weight; novelty worth a follow-up scan.", sectors: ["retail_commerce"] },
  { title: "Forum discussion on remote work visas grows", desc: "A community forum thread on remote-work visas drew sustained engagement.", status: "needs_more_evidence", rationale: "Anecdotal interest signal; needs policy or platform data before promotion.", sectors: ["education_work", "migration_citizenship_belonging"] },
  { title: "Two outlets republish the same longevity clinic story", desc: "Two publications republished the same wire story on a clinic opening.", status: "duplicate", rationale: "Duplicate of an observation already in the base.", sectors: ["health_wellness_longevity"] },
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
    { sector: "fashion_luxury", note: "Co-authorship replaces localisation as market-entry strategy." },
    { sector: "media_entertainment_creator", note: "Commissioning shifts to Arabic-first origination with export upside." },
    { sector: "culture_arts_heritage", note: "Canonising infrastructure becomes strategic capital." },
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
