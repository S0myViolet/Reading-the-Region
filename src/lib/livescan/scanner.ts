/**
 * Live scan — server-side feed intake.
 *
 * Pulls the RSS/Atom feeds configured in scan.feeds.json, and turns items it
 * has not seen before into Source and Observation records at the BOTTOM of
 * the pipeline: everything lands in the Scan Inbox as unreviewed material.
 * Nothing is scored, promoted, or linked automatically — the platform's
 * honesty rule is that evidence earns its place through human triage.
 *
 * Runs only on the server (route handlers). State persists in
 * data/live-scan/state.json so scans accumulate across restarts.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import type { Observation, Region, Sector, Source } from "@/lib/types";

// ---------------------------------------------------------------------------
// Config and state files
// ---------------------------------------------------------------------------

export interface FeedConfig {
  name: string;
  url: string;
  sectors?: Sector[];
  region?: Region;
}

export interface ScanConfig {
  enabled: boolean;
  minMinutesBetweenScans: number;
  maxNewItemsPerScan: number;
  feeds: FeedConfig[];
}

export interface ScanResult {
  ranAt: string;
  itemsSeen: number;
  itemsAdded: number;
  feedErrors: Array<{ feed: string; error: string }>;
}

export interface LiveScanState {
  lastScanAt: string | null;
  lastResult: ScanResult | null;
  seenKeys: string[];
  sources: Source[];
  observations: Observation[];
}

const STATE_DIR = path.join(process.cwd(), "data", "live-scan");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const CONFIG_FILE = path.join(process.cwd(), "scan.feeds.json");

const EMPTY_STATE: LiveScanState = {
  lastScanAt: null,
  lastResult: null,
  seenKeys: [],
  sources: [],
  observations: [],
};

export function readConfig(): ScanConfig {
  try {
    const raw = JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as ScanConfig;
    return {
      enabled: raw.enabled !== false,
      minMinutesBetweenScans: Math.max(15, raw.minMinutesBetweenScans ?? 360),
      maxNewItemsPerScan: Math.min(50, Math.max(1, raw.maxNewItemsPerScan ?? 12)),
      feeds: Array.isArray(raw.feeds) ? raw.feeds : [],
    };
  } catch {
    return { enabled: false, minMinutesBetweenScans: 360, maxNewItemsPerScan: 12, feeds: [] };
  }
}

export function readState(): LiveScanState {
  try {
    return { ...EMPTY_STATE, ...(JSON.parse(readFileSync(STATE_FILE, "utf8")) as LiveScanState) };
  } catch {
    return { ...EMPTY_STATE };
  }
}

function writeState(state: LiveScanState): void {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Feed fetching and normalisation
// ---------------------------------------------------------------------------

interface FeedItem {
  title: string;
  link: string;
  snippet: string;
  publisher: string;
  publishedAt: string | null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return text((value as Record<string, unknown>)["#text"]);
  }
  return "";
}

/** Strip tags and collapse whitespace — feed snippets often carry HTML. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function isoOrNull(dateText: string): string | null {
  const t = Date.parse(dateText);
  return Number.isNaN(t) ? null : new Date(t).toISOString().slice(0, 10);
}

/** Normalise one parsed feed document (RSS 2.0 or Atom) into items. */
function normaliseFeed(xml: string, fallbackPublisher: string): FeedItem[] {
  const doc = parser.parse(xml) as Record<string, any>;
  const items: FeedItem[] = [];

  const rssItems = asArray(doc?.rss?.channel?.item);
  for (const it of rssItems) {
    const title = stripHtml(text(it.title));
    const link = text(it.link).trim();
    if (!title || !link) continue;
    items.push({
      title,
      link,
      snippet: stripHtml(text(it.description)).slice(0, 400),
      publisher: stripHtml(text(it.source)) || fallbackPublisher,
      publishedAt: isoOrNull(text(it.pubDate)),
    });
  }

  const atomEntries = asArray(doc?.feed?.entry);
  for (const it of atomEntries) {
    const title = stripHtml(text(it.title));
    const links = asArray(it.link);
    const linkEl =
      links.find((l: any) => l?.["@_rel"] === "alternate" || !l?.["@_rel"]) ?? links[0];
    const link = (linkEl?.["@_href"] ?? text(it.link)).trim();
    if (!title || !link) continue;
    items.push({
      title,
      link,
      snippet: stripHtml(text(it.summary) || text(it.content)).slice(0, 400),
      publisher: fallbackPublisher,
      publishedAt: isoOrNull(text(it.updated) || text(it.published)),
    });
  }

  return items;
}

async function fetchFeed(feed: FeedConfig): Promise<FeedItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { "user-agent": "reading-the-region-live-scan/1.0" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normaliseFeed(await res.text(), feed.name);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Heuristic tagging — keyword hints only; never presented as judgement
// ---------------------------------------------------------------------------

const COUNTRY_HINTS: Array<[RegExp, string, Region]> = [
  [/\b(uae|dubai|abu dhabi|sharjah|emirat)/i, "UAE", "UAE"],
  [/\b(saudi|riyadh|jeddah|neom|alula|dammam)/i, "Saudi Arabia", "Saudi Arabia"],
  [/\b(qatar|doha)/i, "Qatar", "Qatar"],
  [/\b(kuwait)/i, "Kuwait", "Kuwait"],
  [/\b(bahrain|manama)/i, "Bahrain", "Bahrain"],
  [/\b(oman|muscat)/i, "Oman", "Oman"],
  [/\b(egypt|cairo)/i, "Egypt", "Egypt"],
];

const SECTOR_HINTS: Array<[RegExp, Sector]> = [
  [/\b(visa|residenc|citizenship|expat|migration)/i, "migration_citizenship_belonging"],
  [/\b(housing|real estate|property|developer|district)/i, "real_estate_urban"],
  [/\b(hotel|tourism|hospitality|resort)/i, "hospitality_tourism"],
  [/\b(metro|transit|rail|ridership|transport)/i, "mobility_transport"],
  [/\b(school|universit|education|skills|training)/i, "education_work"],
  [/\b(bank|mortgage|fintech|invest)/i, "finance_banking_investment"],
  [/\b(museum|heritage|culture|art|design)/i, "culture_arts_heritage"],
  [/\b(podcast|streaming|drama|media|creator)/i, "media_entertainment_creator"],
  [/\b(clinic|wellness|health|longevity)/i, "health_wellness_longevity"],
  [/\b(retail|mall|store|commerce)/i, "retail_commerce"],
  [/\b(restaurant|cafe|café|food|cuisine)/i, "food_beverage_third_places"],
  [/\b(esports|gaming|sports|padel|league)/i, "sports_gaming"],
  [/\b(ai|artificial intelligence|automation)/i, "technology_ai"],
  [/\b(climate|heat|solar|energy)/i, "climate_energy_environment"],
  [/\b(ramadan|eid|mosque)/i, "religion_ritual_ramadan"],
];

function tagItem(item: FeedItem, feed: FeedConfig): { country: string; region: Region; sectors: Sector[] } {
  const haystack = `${item.title} ${item.snippet}`;
  const countryHit = COUNTRY_HINTS.find(([re]) => re.test(haystack));
  const sectors = new Set<Sector>(feed.sectors ?? []);
  for (const [re, sector] of SECTOR_HINTS) {
    if (re.test(haystack)) sectors.add(sector);
  }
  return {
    country: countryHit?.[1] ?? "",
    region: countryHit?.[2] ?? feed.region ?? "GCC",
    sectors: [...sectors].slice(0, 3),
  };
}

// ---------------------------------------------------------------------------
// Record building
// ---------------------------------------------------------------------------

function keyFor(link: string, title: string): string {
  return createHash("sha1").update(`${link}|${title}`).digest("hex").slice(0, 16);
}

function nextLiveId(prefix: string, existing: Array<{ id: string }>): string {
  const re = new RegExp(`^${prefix}-L(\\d+)$`);
  const max = existing.reduce((acc, { id }) => {
    const m = id.match(re);
    return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
  }, 0);
  return `${prefix}-L${String(max + 1).padStart(3, "0")}`;
}

const EMPTY_CHECKLIST = {
  behaviourShift: false,
  systemShift: false,
  surprising: false,
  widerRegionalIssue: false,
  credibleSource: false,
  futureImplications: false,
  connectedToOthers: false,
  revealsTension: false,
  earlyButMeaningful: false,
};

/** One Source record per configured feed, created on first use. */
function sourceForFeed(feed: FeedConfig, state: LiveScanState, nowIso: string): Source {
  const existing = state.sources.find((s) => s.url === feed.url);
  if (existing) return existing;
  const source: Source = {
    id: nextLiveId("SRC", state.sources),
    name: feed.name,
    url: feed.url,
    sourceType: "news_publication",
    credibility: 3,
    biasTags: [],
    roles: ["discovery"],
    dateAdded: nowIso.slice(0, 10),
    notes:
      "Automated live-scan feed. Credibility defaults to 3 until a human assesses it — check items against their original outlets before relying on them.",
    isDemo: false,
    origin: "live_scan",
  };
  state.sources.push(source);
  return source;
}

// ---------------------------------------------------------------------------
// The scan
// ---------------------------------------------------------------------------

export async function runScan(force = false): Promise<{
  skipped: "disabled" | "fresh" | null;
  result: ScanResult | null;
  state: LiveScanState;
}> {
  const config = readConfig();
  const state = readState();
  const now = new Date();
  const nowIso = now.toISOString();

  if (!config.enabled && !force) return { skipped: "disabled", result: null, state };
  if (!force && state.lastScanAt) {
    const ageMinutes = (now.getTime() - Date.parse(state.lastScanAt)) / 60_000;
    if (ageMinutes < config.minMinutesBetweenScans) {
      return { skipped: "fresh", result: state.lastResult, state };
    }
  }

  const result: ScanResult = { ranAt: nowIso, itemsSeen: 0, itemsAdded: 0, feedErrors: [] };
  const seen = new Set(state.seenKeys);

  for (const feed of config.feeds) {
    if (result.itemsAdded >= config.maxNewItemsPerScan) break;
    let items: FeedItem[] = [];
    try {
      items = await fetchFeed(feed);
    } catch (err) {
      result.feedErrors.push({
        feed: feed.name,
        error: err instanceof Error ? err.message : "fetch failed",
      });
      continue;
    }
    for (const item of items) {
      result.itemsSeen += 1;
      if (result.itemsAdded >= config.maxNewItemsPerScan) break;
      const key = keyFor(item.link, item.title);
      if (seen.has(key)) continue;
      seen.add(key);

      const source = sourceForFeed(feed, state, nowIso);
      const tags = tagItem(item, feed);
      const observation: Observation = {
        id: nextLiveId("OBS", state.observations),
        title: item.title.slice(0, 160),
        description:
          item.snippet ||
          "No summary came with this item — open the original article before triaging.",
        sourceId: source.id,
        sourceName: item.publisher || feed.name,
        sourceUrl: item.link,
        sourceType: "news_publication",
        dateObserved: nowIso.slice(0, 10),
        eventDate: item.publishedAt,
        region: tags.region,
        country: tags.country,
        city: null,
        sectors: tags.sectors,
        subsector: null,
        actorInvolved: null,
        initialNotes: `Imported by the live scan on ${nowIso.slice(0, 10)} from "${feed.name}". Sector and country tags are keyword guesses — confirm them during triage.`,
        potentialFutureRelevance: "",
        status: "unreviewed",
        triageRationale: null,
        checklist: { ...EMPTY_CHECKLIST },
        promotedSignalId: null,
        origin: "live_scan",
        externalKey: key,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      state.observations.push(observation);
      result.itemsAdded += 1;
    }
  }

  state.seenKeys = [...seen].slice(-5000);
  state.lastScanAt = nowIso;
  state.lastResult = result;
  writeState(state);
  return { skipped: null, result, state };
}
