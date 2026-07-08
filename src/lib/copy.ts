/**
 * Shared product copy: page walkthroughs, definitions, tooltips, the
 * recommended workflow, and onboarding content. Kept in one module so tone
 * stays consistent — professional, clear, strategic — across every page.
 */

export interface PageWalkthrough {
  pageId: string;
  purpose: string;
  recommendedAction: string;
  commonMistake: string;
  nextStep: string;
}

export const WALKTHROUGHS: Record<string, PageWalkthrough> = {
  today: {
    pageId: "today",
    purpose: "Your daily briefing — what changed, what matters, what to look at next.",
    recommendedAction:
      "Read the three cards, then work through the review queue. A few minutes here keeps the whole picture current.",
    commonMistake:
      "Do not treat today's picks as conclusions — they are the strongest current material, not settled findings.",
    nextStep: "Open anything that interests you, or review the new finds.",
  },
  explore: {
    pageId: "explore",
    purpose: "Browse what is changing — by question, place, or theme.",
    recommendedAction: "Pick a question you actually care about and see what the region says.",
    commonMistake: "Do not read one topic page as the full picture — topics overlap and evidence moves.",
    nextStep: "Save anything worth tracking to your watchlist.",
  },
  finds: {
    pageId: "finds",
    purpose: "Things the platform noticed that may or may not matter.",
    recommendedAction:
      "Go through the queue one by one: keep what seems worth developing, dismiss what is noise.",
    commonMistake:
      "Keeping everything. Most finds are noise — dismissing them is the work, not a failure.",
    nextStep: "Kept finds wait in Advanced mode to be developed into signals.",
  },
  futures: {
    pageId: "futures",
    purpose: "Where signals become bigger stories about where the region may be going.",
    recommendedAction: "Read the stories and tensions; open one that could affect your decisions.",
    commonMistake: "Do not read possibilities as predictions — they are directions, not forecasts.",
    nextStep: "Turn a story you believe in into a decision, or add it to your watchlist.",
  },
  decisions: {
    pageId: "decisions",
    purpose: "What all of this means for action, now.",
    recommendedAction: "Review the takeaways, opportunities and risks for your sector or audience.",
    commonMistake: "Acting on a recommendation without opening its evidence first.",
    nextStep: "Save or export what you will actually use.",
  },
  watchlist: {
    pageId: "watchlist",
    purpose: "The things you care about, and which way they are moving.",
    recommendedAction: "Check what is getting stronger or weaker since you last looked.",
    commonMistake: "Watching without ever revisiting — a stale watchlist is quiet noise.",
    nextStep: "Open anything that changed direction.",
  },
  overview: {
    pageId: "overview",
    purpose:
      "This is the command center. It shows the health of the whole intelligence system.",
    recommendedAction:
      "Use this page to see what needs attention, what is strengthening, and where evidence is weak.",
    commonMistake:
      "Do not treat dashboard counts as conclusions. Counts only show activity. Meaning comes from signal quality, evidence, contradictions, and interpretation.",
    nextStep:
      "Review Signals Worth Attention, Contradictions Emerging, and items needing human review.",
  },
  inbox: {
    pageId: "inbox",
    purpose:
      "This is where raw observations enter before they become signals.",
    recommendedAction:
      "Review each observation and decide whether it should be promoted, archived, merged, split, or marked as needing more evidence.",
    commonMistake:
      "Do not promote an observation just because it is interesting. Promote it only if it suggests a future possibility.",
    nextStep:
      "Use the promotion checklist. If the observation passes at least 3 criteria, promote it to a signal.",
  },
  signals: {
    pageId: "signals",
    purpose: "This is the core evidence base of the platform.",
    recommendedAction:
      "Review signal cards, check scores, improve weak evidence, connect related signals, and identify early clusters.",
    commonMistake:
      "Do not call a signal a trend. A signal is only present-day evidence of a possible future.",
    nextStep:
      "Open the most novel or most strategically relevant signals and connect them to related signals, contradictions, or cluster candidates.",
  },
  sources: {
    pageId: "sources",
    purpose:
      "This page tracks where evidence comes from and how much weight it should receive.",
    recommendedAction:
      "Check source credibility, bias tags, and source role before using evidence in conclusions.",
    commonMistake:
      "Do not confuse discovery sources with validation sources. Social media can reveal early behaviour, but it usually cannot validate scale.",
    nextStep:
      "Review low-credibility but high-novelty sources and decide whether stronger validation is needed.",
  },
  clusters: {
    pageId: "clusters",
    purpose:
      "Clusters group signals by shared underlying logic, not by surface topic.",
    recommendedAction: "Use clusters to find relationships between signals.",
    commonMistake:
      "Do not create clusters called “AI,” “Fashion,” or “Tourism.” Those are topics, not foresight logic.",
    nextStep:
      "Check if the cluster has enough signals, sources, sectors, actor types, and contradictions to become valid.",
  },
  patterns: {
    pageId: "patterns",
    purpose: "Patterns show repeated movements across several clusters.",
    recommendedAction:
      "Use this page to identify what keeps happening across sectors, geographies, and systems.",
    commonMistake:
      "Do not validate a pattern unless it passes breadth, depth, persistence, and coherence tests.",
    nextStep: "Connect validated patterns to possible drivers.",
  },
  contradictions: {
    pageId: "contradictions",
    purpose:
      "Contradictions reveal strategic tension between two valid but opposing forces.",
    recommendedAction:
      "Use contradictions to sharpen scenarios, risks, opportunities, and strategy.",
    commonMistake:
      "Do not treat contradictions as errors. They are often the most valuable part of foresight.",
    nextStep:
      "Connect each contradiction to signals, clusters, patterns, drivers, future territories, or scenarios.",
  },
  drivers: {
    pageId: "drivers",
    purpose: "Drivers explain why multiple patterns are emerging.",
    recommendedAction: "Use drivers to explain why change is happening, not just describe it.",
    commonMistake:
      "Do not write drivers that merely describe consumer preferences. A driver must explain the deeper force behind change.",
    nextStep:
      "Check whether the driver explains enough patterns and has enough evidence to become validated.",
  },
  territories: {
    pageId: "territories",
    purpose:
      "Future territories show larger strategic directions that form when several drivers converge.",
    recommendedAction:
      "Use this page to understand what the region may be becoming.",
    commonMistake:
      "Do not create a future territory too early. It must be backed by drivers, patterns, clusters, signals, and contradictions.",
    nextStep:
      "Use the future territory to generate scenarios, strategic implications, and monitoring indicators.",
  },
  scenarios: {
    pageId: "scenarios",
    purpose: "Scenarios explore plausible future worlds.",
    recommendedAction:
      "Use scenarios to test how a future territory could evolve under different conditions.",
    commonMistake:
      "Do not write scenarios as predictions. They are structured possibilities, not forecasts.",
    nextStep: "Translate scenarios into strategic implications.",
  },
  implications: {
    pageId: "implications",
    purpose: "This page turns foresight into present-day decisions.",
    recommendedAction:
      "Use implications to define what brands, governments, investors, institutions, or organizations should do differently.",
    commonMistake:
      "Do not create vague recommendations. Every implication must connect back to evidence.",
    nextStep:
      "Assign implications to sectors, audiences, time horizons, and confidence levels.",
  },
  monitoring: {
    pageId: "monitoring",
    purpose: "Monitoring keeps the intelligence system alive.",
    recommendedAction:
      "Track whether future territories are strengthening, weakening, mutating, being contradicted, or becoming dormant.",
    commonMistake:
      "Do not assume a future territory remains relevant forever. It must be checked through leading indicators.",
    nextStep:
      "Update each indicator on its own schedule — from weekly to annual, depending on its layer.",
  },
};

/** One-line definitions used for tooltips and inline hints. */
export const DEFINITIONS: Record<string, string> = {
  observation: "Raw information found during scanning. Not yet a signal.",
  signal: "Present-day evidence that suggests a future possibility.",
  weakSignal:
    "Early, ambiguous, or niche evidence that may become important if repeated.",
  noise: "Information that is interesting but not strategically meaningful.",
  cluster: "Signals grouped by shared underlying logic.",
  pattern: "A repeated movement across clusters.",
  contradiction: "A tension between two valid but opposing forces.",
  driver: "An underlying force that explains why patterns are emerging.",
  territory: "A larger direction of change created by converging drivers.",
  scenario: "A plausible future world, not a prediction.",
  implication: "What should be done differently now.",
  indicator:
    "Evidence that shows whether a future territory is strengthening, weakening, mutating, or being contradicted.",
  source:
    "Where evidence comes from. Credibility and role are assessed separately.",
};

/** The recommended workflow, shown in onboarding, methodology, and overview. */
export const RECOMMENDED_WORKFLOW: Array<{ step: number; title: string; detail: string }> = [
  { step: 1, title: "Add observations to the Scan Inbox", detail: "Capture raw material from scanning before judging it." },
  { step: 2, title: "Review observations", detail: "Decide what is meaningful and what is noise." },
  { step: 3, title: "Promote strong observations into signals", detail: "Only observations that pass at least 3 promotion criteria." },
  { step: 4, title: "Score and zoom each signal", detail: "Nine scoring dimensions and the four-level zooming method." },
  { step: 5, title: "Connect related signals", detail: "Evidence gains meaning through relationships." },
  { step: 6, title: "Create cluster candidates", detail: "Group signals by shared underlying logic, not topic." },
  { step: 7, title: "Validate clusters", detail: "8 signals, 3 sources, 2 sectors, 2 actor types, one contradiction." },
  { step: 8, title: "Detect patterns", detail: "Repeated movements across clusters, tested for breadth, depth, persistence, and coherence." },
  { step: 9, title: "Identify contradictions", detail: "Search for tension between valid opposing forces." },
  { step: 10, title: "Develop driver hypotheses", detail: "Explanations, not descriptions, of why patterns emerge." },
  { step: 11, title: "Create future territories", detail: "Only where several drivers converge." },
  { step: 12, title: "Build scenarios", detail: "Plausible future worlds under different conditions." },
  { step: 13, title: "Translate into strategic implications", detail: "What should be done differently now." },
  { step: 14, title: "Create monitoring indicators", detail: "Leading evidence that shows strengthening or weakening." },
  { step: 15, title: "Re-scan and update", detail: "Foresight is monitored, not published and forgotten." },
];

/** Pipeline stages, in order, for the intelligence pipeline component. */
export const PIPELINE_STAGES: Array<{ key: string; label: string; route: string }> = [
  { key: "observation", label: "Observation", route: "/inbox" },
  { key: "signal", label: "Signal", route: "/signals" },
  { key: "cluster", label: "Cluster", route: "/clusters" },
  { key: "pattern", label: "Pattern", route: "/patterns" },
  { key: "driver", label: "Driver", route: "/drivers" },
  { key: "territory", label: "Future Territory", route: "/territories" },
  { key: "scenario", label: "Scenario", route: "/scenarios" },
  { key: "implication", label: "Implication", route: "/implications" },
  { key: "monitor", label: "Monitor", route: "/monitoring" },
];

export interface OnboardingScreen {
  title: string;
  body: string[];
  emphasis?: string;
}

export const ONBOARDING_SCREENS: OnboardingScreen[] = [
  {
    title: "Welcome to Reading the Region",
    body: [
      "This is a strategic foresight intelligence system for detecting early signals of change across MENA, the Gulf, the UAE, Saudi Arabia, and the wider region.",
    ],
    emphasis:
      "This platform helps you move from scattered information to defensible foresight.",
  },
  {
    title: "How the system works",
    body: [
      "Evidence moves through a pipeline: Observation → Signal → Cluster → Pattern → Contradiction → Driver → Future Territory → Scenario → Strategic Implication → Monitoring.",
      "Each layer reduces noise and increases meaning.",
    ],
  },
  {
    title: "Where to start",
    body: [
      "Start on Today — a short daily briefing of what changed and what needs a look.",
      "Review New Finds: keep what seems worth developing, dismiss the noise.",
      "Explore lets you browse what is changing by question, place, or theme.",
    ],
  },
  {
    title: "How evidence moves upward",
    body: [
      "A signal does not become a cluster unless related signals exist.",
      "A cluster does not become a pattern unless the logic repeats across sectors.",
      "A driver does not become valid unless it explains multiple patterns.",
      "A future territory should only appear when several drivers converge.",
    ],
  },
  {
    title: "Simple on the surface, rigorous underneath",
    body: [
      "The default product keeps things human: Today, Explore, Signals, Futures, Decisions, Watchlist.",
      "The full methodology — scores, thresholds, validation — runs in the background and opens in Advanced mode whenever you want to inspect the reasoning.",
    ],
  },
];

/** Core scanning philosophy, shown on the methodology page and overview. */
export const PHILOSOPHY: Array<{ negative: string; positive: string }> = [
  { negative: "Do not collect trends.", positive: "Collect signals." },
  { negative: "Do not group by topic.", positive: "Group by underlying logic." },
  { negative: "Do not search for confirmation.", positive: "Search for contradiction." },
  { negative: "Do not describe only what is happening.", positive: "Explain why it is happening." },
  { negative: "Do not predict one future.", positive: "Identify plausible futures." },
  { negative: "Do not stop at insight.", positive: "Translate into action." },
  { negative: "Do not publish and forget.", positive: "Monitor and update." },
];

/** Bias-check prompts shown on major conclusion pages. */
export const BIAS_CHECK_QUESTIONS: string[] = [
  "What assumptions could be distorting this interpretation?",
  "What evidence would weaken this conclusion?",
  "Are we over-weighting Dubai?",
  "Are we mistaking PR momentum for structural change?",
  "Are we applying Western consumer logic without regional validation?",
  "Are we treating a global trend as regional without regional evidence?",
  "Are we extrapolating linearly from a short run of evidence?",
];
