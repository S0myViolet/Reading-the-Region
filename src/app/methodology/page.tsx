"use client";

/**
 * Methodology — the long-form editorial page that makes the product
 * self-explanatory. Prose leads; every definition, threshold, rubric, and
 * label is read from copy.ts and types.ts so this documentation can never
 * drift from the implementation. Store access (pipeline counts, onboarding
 * replay) is hydration-gated.
 */

import { ProvenanceBadge } from "@/components/badges";
import { BiasCheckPanel } from "@/components/BiasCheckPanel";
import { IntelligencePipeline } from "@/components/IntelligencePipeline";
import { PageHeader } from "@/components/PageHeader";
import { DEFINITIONS, PHILOSOPHY, RECOMMENDED_WORKFLOW } from "@/lib/copy";
import { pipelineCounts } from "@/lib/derived";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  CADENCE_LABELS,
  CLUSTER_THRESHOLDS,
  CONTRADICTION_TYPE_LABELS,
  DRIVER_THRESHOLDS,
  IMPLICATION_AUDIENCE_LABELS,
  IMPLICATION_TYPE_LABELS,
  INDICATOR_TREND_LABELS,
  INDICATOR_TYPE_LABELS,
  PATTERN_THRESHOLDS,
  PROMOTION_MIN_CRITERIA,
  PROVENANCE_LABELS,
  SCENARIO_HORIZON_LABELS,
  SCENARIO_QUALITY_LABELS,
  SCENARIO_TYPE_LABELS,
  SCORE_DIMENSION_LABELS,
  SCORE_RUBRICS,
  SIGNAL_STRENGTH_LABELS,
  TIME_HORIZON_LABELS,
  type MonitoringCadence,
  type ProvenanceLabel,
  type Score,
  type SignalScores,
  type SignalStrength,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Local content data (display copy only — all constants come from lib)
// ---------------------------------------------------------------------------

const SECTIONS: Array<{ id: string; title: string }> = [
  { id: "what-it-is", title: "What Reading the Region is" },
  { id: "foresight-vs-trends", title: "Foresight vs trend reporting" },
  { id: "prediction", title: "Why prediction is not the goal" },
  { id: "signals", title: "What a signal is" },
  { id: "weak-signals", title: "What a weak signal is" },
  { id: "noise", title: "What noise is" },
  { id: "pyramid", title: "The intelligence pyramid" },
  { id: "scoring", title: "The signal scoring system" },
  { id: "zooming", title: "The zooming method" },
  { id: "clusters", title: "Cluster validation" },
  { id: "patterns", title: "Pattern validation" },
  { id: "contradictions", title: "Contradictions" },
  { id: "systems-thinking", title: "Systems thinking" },
  { id: "drivers", title: "Drivers" },
  { id: "territories", title: "Future territories" },
  { id: "scenarios", title: "Scenarios" },
  { id: "implications", title: "Strategic implications" },
  { id: "monitoring", title: "Monitoring" },
  { id: "guardrails", title: "Hallucination and evidence guardrails" },
  { id: "biases", title: "Biases to avoid" },
];

/** Pyramid layers, bottom (1) to top (12). */
const PYRAMID_LAYERS: string[] = [
  "Environmental Scanning",
  "Weak Signals",
  "Signal Clusters",
  "Emerging Patterns",
  "Contradictions",
  "Systems Thinking",
  "Driving Forces",
  "Future Territories",
  "Future Scenarios",
  "Strategic Implications",
  "Monitoring Layer",
  "Strategic Action",
];

const SCORE_STEPS: Score[] = [1, 2, 3, 4, 5];

const SCORE_DIMENSIONS = Object.keys(SCORE_RUBRICS) as Array<keyof SignalScores>;

const STRENGTH_GLOSSES: Array<{ key: SignalStrength; gloss: string }> = [
  { key: "weak", gloss: "Early, ambiguous, or niche. High foresight value if it repeats; unsafe to build on alone." },
  { key: "emerging", gloss: "Repeating across places or actors. Momentum is visible but the direction is not settled." },
  { key: "established", gloss: "Broadly evidenced and stable. Reliable input for patterns and drivers." },
  { key: "mainstream", gloss: "Widely adopted. Useful context, but its foresight value has largely been spent." },
  { key: "declining", gloss: "Losing momentum. Worth tracking because reversals are themselves signals." },
  { key: "contradictory", gloss: "Credible evidence points in opposing directions. Route it to the contradictions layer, not the trash." },
];

const CADENCE_COVERAGE: Array<{ key: MonitoringCadence; covers: string }> = [
  { key: "weekly", covers: "Scan Inbox intake, fast-moving signals, and indicators tied to live policy or media cycles." },
  { key: "monthly", covers: "Signal health, the review queue, and cluster candidates gathering evidence." },
  { key: "quarterly", covers: "Patterns and drivers — do the breadth, depth, and persistence tests still hold?" },
  { key: "biannual", covers: "Future territories and scenario assumptions — strengthening, weakening, or mutating?" },
  { key: "annual", covers: "Full-system audit: retire dormant territories, archive dead indicators, re-examine the driver set." },
];

const PROVENANCE_GLOSSES: Record<ProvenanceLabel, string> = {
  sourced_fact: "Traceable to a named, credible source. The only label permitted to read as fact.",
  sourced_interpretation: "An interpretation grounded in a cited source, distinguished from the source itself.",
  ai_inference: "A machine-drafted connection or summary. Unverified until a human reviews it.",
  human_interpretation: "Analyst judgement, identified as judgement rather than evidence.",
  hypothesis: "A proposed explanation awaiting evidence. Never presented as a finding.",
  speculative_possibility: "A plausible future statement with weak present-day evidence.",
  validated_conclusion: "Passed the validation thresholds of its layer, with the checks visible.",
  contradiction: "A documented tension between two evidenced, opposing forces.",
};

const AI_MAY_DO: string[] = [
  "Suggest connections between existing objects — related signals, cluster candidates, possible drivers.",
  "Summarize evidence that is already in the system.",
  "Classify and tag material against the shared vocabularies.",
  "Draft text for human review, always labelled as AI inference or AI suggested.",
];

const AI_MUST_NEVER: string[] = [
  "Invent sources or statistics.",
  "Cite articles that do not exist.",
  "Claim evidence without naming a source.",
  "Turn a single signal into a trend.",
  "Overstate certainty.",
  "Ignore contradictions.",
  "Assume MENA equals the GCC.",
  "Assume the UAE equals Dubai.",
  "Assume Saudi Arabia equals the entire region.",
  "Treat a global trend as regional without regional evidence.",
  "Apply Western consumer assumptions without regional validation.",
  "Confuse PR claims with independent evidence.",
  "Merge unrelated signals on keyword similarity.",
  "Coin territory names before the evidence suffices.",
];

const BIAS_LIST: Array<{ name: string; gloss: string }> = [
  { name: "Confirmation bias", gloss: "Collecting evidence that supports what the analyst already believes." },
  { name: "Recency bias", gloss: "Over-weighting whatever arrived last week." },
  { name: "Availability bias", gloss: "Treating easily found evidence as representative evidence." },
  { name: "Survivorship bias", gloss: "Studying the launches that succeeded and ignoring the ones that vanished." },
  { name: "Selection bias", gloss: "Drawing on sources that all sample the same population." },
  { name: "Prestige bias", gloss: "Believing a claim because a prominent institution made it." },
  { name: "Western-centric framing", gloss: "Reading the region through imported categories and consumer logic." },
  { name: "Dubai-centric framing", gloss: "Treating Dubai as a proxy for the UAE or the Gulf." },
  { name: "Saudi-centric framing", gloss: "Treating Saudi announcements as the whole region's direction." },
  { name: "Techno-determinism", gloss: "Assuming technology adoption reshapes behaviour by itself." },
  { name: "Presentism", gloss: "Assuming today's conditions persist unchanged into the future." },
  { name: "Linear extrapolation", gloss: "Projecting a short run of evidence in a straight line." },
  { name: "Narrative fallacy", gloss: "Preferring the story that reads well over the one the evidence supports." },
  { name: "False causality", gloss: "Reading co-occurrence as cause." },
  { name: "Overfitting", gloss: "Building an elaborate explanation around too few data points." },
  { name: "Pattern hallucination", gloss: "Seeing a pattern where signals merely share keywords." },
  { name: "Hype bias", gloss: "Mistaking media volume for structural change." },
  { name: "Cultural flattening", gloss: "Treating MENA as one uniform market with one uniform consumer." },
  { name: "Source authority bias", gloss: "Letting one credible source stand in for independent corroboration." },
];

const SYSTEMS_QUESTIONS: string[] = [
  "What system produced this behaviour?",
  "What structure is changing?",
  "What incentives are changing?",
  "What institutions are involved?",
  "What infrastructure is involved?",
  "What emotional or cultural logic is involved?",
  "What second-order effects could emerge?",
  "What third-order effects could emerge?",
  "What feedback loop could form?",
];

// ---------------------------------------------------------------------------
// Local presentational helpers
// ---------------------------------------------------------------------------

function Section({
  num,
  id,
  title,
  children,
}: {
  num: number;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line pt-6">
      <h2 className="font-display text-[19px] leading-snug text-ink">
        <span className="mr-2.5 align-middle font-mono text-[12px] tracking-wide text-ink-faint">
          {String(num).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-3xl text-[13px] leading-relaxed text-ink-soft">{children}</p>;
}

function Definition({ text }: { text: string }) {
  return (
    <p className="max-w-3xl border-l-2 border-accent pl-3 font-display text-[15px] leading-snug text-ink">
      “{text}”
    </p>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="overline-label pt-1">{children}</h3>;
}

function ThresholdTable({
  rows,
  caption,
}: {
  rows: Array<{ requirement: string; threshold: string | number }>;
  caption?: string;
}) {
  return (
    <div className="card max-w-2xl overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Requirement</th>
            <th>Threshold</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.requirement}>
              <td className="text-ink-soft">{r.requirement}</td>
              <td className="font-mono text-[12.5px] whitespace-nowrap text-ink">{r.threshold}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {caption ? (
        <p className="border-t border-line px-3 py-1.5 text-[11.5px] text-ink-faint">{caption}</p>
      ) : null}
    </div>
  );
}

function TwoColumnList({ items }: { items: string[] }) {
  return (
    <ul className="grid max-w-3xl gap-x-6 gap-y-1.5 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[12.5px] text-ink-soft">
          <span aria-hidden className="text-ink-faint">
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LabelValueList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="card max-w-3xl overflow-x-auto">
      <table className="data-table">
        <tbody>
          {items.map((i) => (
            <tr key={i.label}>
              <td className="w-44 whitespace-nowrap font-medium text-ink">{i.label}</td>
              <td className="text-ink-soft">{i.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MethodologyPage() {
  const hydrated = useHydrated();
  const store = useIntelligenceStore();

  return (
    <div>
      <PageHeader
        overline="System"
        title="Methodology"
        description="How Reading the Region turns scattered observation into defensible foresight."
      />

      {/* Table of contents */}
      <nav aria-label="Contents" className="card mb-8 px-4 py-3">
        <p className="overline-label mb-2">Contents</p>
        <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="flex gap-2 text-[12.5px] text-ink-soft hover:text-ink">
                <span className="w-5 shrink-0 font-mono text-[11px] text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </a>
            </li>
          ))}
          <li>
            <a href="#workflow" className="flex gap-2 text-[12.5px] text-ink-soft hover:text-ink">
              <span aria-hidden className="w-5 shrink-0 font-mono text-[11px] text-ink-faint">
                →
              </span>
              The recommended workflow
            </a>
          </li>
        </ol>
      </nav>

      <div className="space-y-10">
        {/* 1 ------------------------------------------------------------- */}
        <Section num={1} id="what-it-is" title="What Reading the Region is">
          <P>
            Reading the Region is a structured foresight intelligence system for MENA. It exists to
            answer one question with discipline: given what can actually be observed today, which
            futures are becoming more plausible for the region, and what should be done about them
            now? Every object in the system — observation, signal, cluster, pattern, contradiction,
            driver, territory, scenario, implication, indicator — is a step in that argument, and
            every step keeps its evidence attached.
          </P>
          <P>
            It is not a trends dashboard: counts and charts here measure activity, never conclusions.
            It is not a content aggregator: material enters only through deliberate scanning and is
            judged before it is kept. And it is not a news app: recency carries no authority in this
            system, and an item is interesting only insofar as it changes what the future might hold.
          </P>
          <P>
            The working unit is the traceable claim. Any conclusion on any page can be walked back
            down through the layers to the sources that support it — and where the support is thin,
            the system says so instead of hiding it.
          </P>
        </Section>

        {/* 2 ------------------------------------------------------------- */}
        <Section num={2} id="foresight-vs-trends" title="Foresight vs trend reporting">
          <P>
            Trend reporting describes the surface of the present: what is popular, what is growing,
            what is being talked about. It is useful, but it answers a backward-looking question —
            what has already become visible enough to name? By the time something is a named trend,
            most of its strategic value has been priced in.
          </P>
          <P>
            Foresight asks a different question: what does today’s evidence make plausible tomorrow?
            It works from weak and early material, groups it by underlying logic rather than topic,
            tests it against explicit thresholds, and holds contradictions in view instead of
            resolving them prematurely. The output is not a list of things that are happening but a
            small set of defensible views of what could happen — each with the evidence, assumptions,
            and tensions that produced it.
          </P>
          <P>
            The practical difference shows in failure modes. Trend reports age silently: they simply
            stop being true and nobody is notified. A foresight position carries its own monitoring
            indicators, so when the evidence turns, the position visibly weakens and demands
            revision.
          </P>
        </Section>

        {/* 3 ------------------------------------------------------------- */}
        <Section num={3} id="prediction" title="Why prediction is not the goal">
          <P>
            A single-point prediction — “X will happen by 2030” — fails silently. It offers no
            mechanism for being wrong gracefully: either the date arrives and the claim is quietly
            forgotten, or events drift away from it without anyone noticing when confidence should
            have been withdrawn. Silent failure is the most expensive kind, because decisions keep
            resting on the claim long after it stopped deserving them.
          </P>
          <P>
            A plausible future with indicators fails loudly, and that is the point. Each future
            territory and scenario in this system is attached to leading indicators with review
            cadences. When indicators weaken or contradict, the position degrades in public — the
            monitoring status changes, the management center flags it, and the conclusion corrects
            itself or is retired. The goal is not to be right in advance; it is to be wrong quickly
            and visibly.
          </P>
          <SubHeading>The scanning philosophy</SubHeading>
          <div className="card max-w-3xl overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Avoid</th>
                  <th>Practice instead</th>
                </tr>
              </thead>
              <tbody>
                {PHILOSOPHY.map((p) => (
                  <tr key={p.negative}>
                    <td className="text-ink-faint">{p.negative}</td>
                    <td className="font-medium text-ink">{p.positive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 4 ------------------------------------------------------------- */}
        <Section num={4} id="signals" title="What a signal is">
          <Definition text={DEFINITIONS.signal} />
          <P>
            A signal is not the event itself; it is what the event suggests. A new visa category, a
            museum opening, a startup pivot — these are observations. They become signals when a
            reviewer can articulate the future possibility they point to and attach the evidence
            that supports the reading. That is why promotion from the Scan Inbox requires at least{" "}
            {PROMOTION_MIN_CRITERIA} of the nine promotion criteria to hold: a signal must suggest a
            behaviour or system shift, connect to a wider regional issue, or carry future
            implications — being interesting is not enough.
          </P>
          <P>
            Every signal carries its own zooming analysis, nine rubric scores, a time horizon, a
            confidence level, and links to sources. A signal is present-day evidence, held to
            present-day standards; the future it suggests is always labelled as a possibility, never
            as a fact.
          </P>
        </Section>

        {/* 5 ------------------------------------------------------------- */}
        <Section num={5} id="weak-signals" title="What a weak signal is">
          <Definition text={DEFINITIONS.weakSignal} />
          <P>
            Weak signals are the raw material of foresight and the easiest material to mishandle. A
            weak signal is early — it appears before the systems around it have reacted. It is
            ambiguous — it supports more than one reading. And it is often niche — visible in one
            city, one community, or one sector. None of these properties make it unimportant; they
            make it unproven.
          </P>
          <P>
            The discipline is to hold weak signals without either discarding or inflating them. A
            weak signal earns attention when it repeats: across geographies, across actor types,
            across independent sources. Until then it stays weak, its evidence score stays honest,
            and any level-4 zooming statement built on it is flagged as speculative. One striking
            anecdote is a lead to follow, not a finding to publish.
          </P>
        </Section>

        {/* 6 ------------------------------------------------------------- */}
        <Section num={6} id="noise" title="What noise is">
          <Definition text={DEFINITIONS.noise} />
          <P>
            Most of what scanning collects is noise, and that is expected — a scanning practice that
            produces only keepers is not scanning widely enough. Noise includes the genuinely
            interesting: viral moments with no structural consequence, PR announcements without
            behaviour behind them, global stories with no regional evidence. Interesting and
            strategically meaningful are different tests, and only the second one matters here.
          </P>
          <P>
            Noise is archived, never deleted, and every archived observation keeps its triage
            rationale — the stated reason it was judged noise. This makes the filtering itself
            auditable: a reviewer can inspect the noise archive and ask whether the reasons were
            sound, whether a bias shaped them, and whether something archived last quarter has since
            started repeating. A system that cannot show why it discarded material cannot be trusted
            when it claims what remains is meaningful.
          </P>
        </Section>

        {/* 7 ------------------------------------------------------------- */}
        <Section num={7} id="pyramid" title="The intelligence pyramid">
          <P>
            Evidence moves upward through twelve layers. Each layer admits less material than the
            one below it and asserts more meaning — scanning admits almost everything; strategic
            action admits only what has survived every test in between. Nothing may skip a layer:
            a territory not built on drivers, or a driver not built on patterns, is an opinion
            wearing the costume of analysis.
          </P>
          <div className="max-w-3xl space-y-px py-1">
            {[...PYRAMID_LAYERS].reverse().map((layer, i) => {
              const layerNumber = PYRAMID_LAYERS.length - i;
              return (
                <div
                  key={layer}
                  style={{ width: `${100 - (PYRAMID_LAYERS.length - 1 - i) * 4}%` }}
                  className="mx-auto flex min-w-[250px] max-w-full items-baseline justify-center gap-2 border border-line bg-surface px-3 py-1.5"
                >
                  <span className="font-mono text-[10.5px] text-ink-faint">{layerNumber}</span>
                  <span className="text-[12.5px] text-ink">{layer}</span>
                </div>
              );
            })}
          </div>
          <p className="max-w-3xl text-[11.5px] text-ink-faint">
            Read bottom-to-top: Environmental Scanning is the wide base; Strategic Action is the
            narrow summit. Contradictions and systems thinking are working layers — they interrogate
            material rather than store a separate object count.
          </p>
          <P>
            In the application the pyramid is compressed into a nine-stage pipeline of stored
            objects. Current counts:
          </P>
          {hydrated ? (
            <IntelligencePipeline counts={pipelineCounts(store)} compact />
          ) : (
            <p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>
          )}
        </Section>

        {/* 8 ------------------------------------------------------------- */}
        <Section num={8} id="scoring" title="The signal scoring system">
          <P>
            Every signal is scored on nine dimensions, each on a 1–5 rubric with fixed anchors. The
            anchors below are the same ones shown in the scoring interface — scoring is a
            judgement, but it is a judgement against shared language, so two reviewers disagreeing
            about a 3 versus a 4 are at least disagreeing about the same thing.
          </P>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {SCORE_DIMENSIONS.map((dim) => (
              <div key={dim} className="card overflow-hidden">
                <p className="border-b border-line px-3 py-2 text-[12px] font-medium text-ink">
                  {SCORE_DIMENSION_LABELS[dim]}
                </p>
                <table className="data-table">
                  <tbody>
                    {SCORE_STEPS.map((n) => (
                      <tr key={n}>
                        <td className="w-8 font-mono text-[12px] text-ink">{n}</td>
                        <td className="text-[12px] text-ink-soft">{SCORE_RUBRICS[dim][n]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <SubHeading>Time horizon</SubHeading>
          <P>
            Each signal is placed on a horizon — a statement about when its implied change would
            bite, not about when to stop paying attention.
          </P>
          <LabelValueList
            items={Object.entries(TIME_HORIZON_LABELS).map(([, label]) => {
              const [head, tail] = label.split(" — ");
              return { label: head, value: tail ?? "" };
            })}
          />

          <SubHeading>Signal strength</SubHeading>
          <LabelValueList
            items={STRENGTH_GLOSSES.map((s) => ({
              label: SIGNAL_STRENGTH_LABELS[s.key],
              value: s.gloss,
            }))}
          />

          <SubHeading>Confidence logic</SubHeading>
          <LabelValueList
            items={[
              {
                label: "Low confidence",
                value:
                  "A single source, unclear relevance, anecdotal evidence, or an early-stage development.",
              },
              {
                label: "Medium confidence",
                value:
                  "A credible source, repeated evidence, a plausible connection to a larger shift, and some strategic relevance.",
              },
              {
                label: "High confidence",
                value:
                  "Multiple sources, clear behavioural or systemic impact, cross-sector evidence, credible data, and consistency over time.",
              },
            ]}
          />
        </Section>

        {/* 9 ------------------------------------------------------------- */}
        <Section num={9} id="zooming" title="The zooming method">
          <P>
            Zooming is the mandatory four-level interpretation applied to every signal. It forces
            the analysis to travel from fact to future in explicit steps, so each step can be
            examined and challenged on its own.
          </P>
          <LabelValueList
            items={[
              { label: "Level 1", value: "What happened? Factual only — no interpretation." },
              { label: "Level 2", value: "What behaviour does this reveal? Grounded in the event itself." },
              { label: "Level 3", value: "What system is changing? Connects the behaviour to a larger system." },
              {
                label: "Level 4",
                value:
                  "What future becomes more plausible if this continues? Flagged as speculative whenever the evidence score is below 3.",
              },
            ]}
          />
          <P>
            The no-jumping rule: an analysis may never move from level 1 straight to level 4. The
            jump from event to future is where most bad foresight is manufactured — it lets a single
            headline become a destiny. The validation logic enforces all four levels before a signal
            is considered fully analysed.
          </P>
          <SubHeading>Worked example</SubHeading>
          <div className="card max-w-3xl overflow-x-auto">
            <table className="data-table">
              <tbody>
                <tr>
                  <td className="w-16 font-mono text-[11.5px] text-ink-faint">L1</td>
                  <td className="text-ink-soft">Long-term residency visas expand.</td>
                </tr>
                <tr>
                  <td className="font-mono text-[11.5px] text-ink-faint">L2</td>
                  <td className="text-ink-soft">Families plan multi-decade lives.</td>
                </tr>
                <tr>
                  <td className="font-mono text-[11.5px] text-ink-faint">L3</td>
                  <td className="text-ink-soft">
                    Housing, schooling and healthcare systems reorient to permanence.
                  </td>
                </tr>
                <tr>
                  <td className="font-mono text-[11.5px] text-ink-faint">L4</td>
                  <td className="text-ink-soft">
                    <span className="text-ink-faint">(If this continues)</span> the Gulf shifts from
                    career stopover to life platform.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 10 ------------------------------------------------------------ */}
        <Section num={10} id="clusters" title="Cluster validation">
          <Definition text={DEFINITIONS.cluster} />
          <P>
            A cluster groups signals by shared underlying logic, expressed as one unifying question
            — never by topic. “AI” is a topic; “who is trusted to automate care?” is a cluster. A
            cluster becomes valid only when every threshold below is met, computed live from its
            linked signals and sources.
          </P>
          <ThresholdTable
            rows={[
              { requirement: "Linked signals", threshold: `≥ ${CLUSTER_THRESHOLDS.minSignals}` },
              {
                requirement: "Independent sources across linked signals",
                threshold: `≥ ${CLUSTER_THRESHOLDS.minIndependentSources}`,
              },
              { requirement: "Sectors represented", threshold: `≥ ${CLUSTER_THRESHOLDS.minSectors}` },
              { requirement: "Actor types represented", threshold: `≥ ${CLUSTER_THRESHOLDS.minActorTypes}` },
              {
                requirement: "Contradictions or tensions identified",
                threshold: `≥ ${CLUSTER_THRESHOLDS.minContradictions}`,
              },
              { requirement: "Benchmark — breadth score", threshold: `≥ ${CLUSTER_THRESHOLDS.minBreadth}` },
              { requirement: "Benchmark — depth score", threshold: `≥ ${CLUSTER_THRESHOLDS.minDepth}` },
              { requirement: "Benchmark — coherence score", threshold: `≥ ${CLUSTER_THRESHOLDS.minCoherence}` },
              {
                requirement: "Benchmark — strategic relevance score",
                threshold: `≥ ${CLUSTER_THRESHOLDS.minStrategicRelevance}`,
              },
            ]}
            caption="A clear unifying question is also required — a cluster organised around a topic word fails validation regardless of its counts."
          />
          <P>
            The candidate labelling rule: until every check passes, a cluster is labelled a
            candidate and is treated as one everywhere — it may gather evidence, but it may not feed
            pattern detection or appear in any conclusion as if it were valid.
          </P>
        </Section>

        {/* 11 ------------------------------------------------------------ */}
        <Section num={11} id="patterns" title="Pattern validation">
          <Definition text={DEFINITIONS.pattern} />
          <P>
            A pattern claims that a movement is repeating across clusters. The claim must pass four
            tests, each guarding against a distinct failure: breadth against sector-local stories,
            depth against single-source amplification, persistence against news-cycle spikes, and
            coherence against grab-bag groupings.
          </P>
          <ThresholdTable
            rows={[
              {
                requirement: "Breadth test — sectors the pattern appears across",
                threshold: `≥ ${PATTERN_THRESHOLDS.minSectors}`,
              },
              {
                requirement: "Depth test — independent supporting sources",
                threshold: `≥ ${PATTERN_THRESHOLDS.minIndependentSources}`,
              },
              {
                requirement: "Persistence test — months spanned by the evidence",
                threshold: `≥ ${PATTERN_THRESHOLDS.minMonthsPersistence}`,
              },
              {
                requirement: "Coherence test — statable as one clear movement",
                threshold: "single statement",
              },
            ]}
          />
          <P>
            An optional strong threshold marks patterns robust enough to anchor drivers with little
            further corroboration: at least {PATTERN_THRESHOLDS.strongMinSignals} signals,{" "}
            {PATTERN_THRESHOLDS.strongMinSectors} sectors, {PATTERN_THRESHOLDS.strongMinGeographies}{" "}
            geographies, and {PATTERN_THRESHOLDS.strongMinActorTypes} actor types. Until the four
            core tests pass, a pattern remains a hypothesis or partially validated — and is
            labelled as such wherever it appears.
          </P>
        </Section>

        {/* 12 ------------------------------------------------------------ */}
        <Section num={12} id="contradictions" title="Contradictions">
          <Definition text={DEFINITIONS.contradiction} />
          <P>
            Contradictions are not errors to be resolved; they are intelligence. A tension between
            two evidenced, opposing forces marks exactly where the future is undecided — which makes
            it the most valuable input scenarios can have. A foresight base with no contradictions
            in it has almost certainly been curated into agreement, which is a bias, not a finding.
          </P>
          <SubHeading>Recurring contradiction types</SubHeading>
          <TwoColumnList items={Object.values(CONTRADICTION_TYPE_LABELS)} />
          <P>
            The standing rule: every major conclusion — pattern, driver, territory, scenario,
            implication — either carries at least one linked contradiction or states explicitly
            that none has been found yet. The absence statement matters as much as the link: it
            tells the reader the tension was looked for, not overlooked.
          </P>
        </Section>

        {/* 13 ------------------------------------------------------------ */}
        <Section num={13} id="systems-thinking" title="Systems thinking">
          <P>
            Behaviour is an output of systems — incentives, institutions, infrastructure, and
            cultural logic. Before a signal’s meaning is settled, it is interrogated with nine
            questions:
          </P>
          <ol className="max-w-3xl space-y-1.5">
            {SYSTEMS_QUESTIONS.map((q, i) => (
              <li key={q} className="flex gap-2.5 text-[12.5px] text-ink-soft">
                <span className="w-4 shrink-0 font-mono text-[11px] text-ink-faint">{i + 1}</span>
                {q}
              </li>
            ))}
          </ol>
          <P>
            Effects are traced in orders. First-order effects are the direct, immediate consequences.
            Second-order effects are what the first-order effects cause once other actors respond.
            Third-order effects are the slower structural and cultural shifts that follow. Alongside
            the orders sit feedback loops: reinforcing loops that amplify a change, and balancing
            loops that push back against it.
          </P>
          <SubHeading>The residency example</SubHeading>
          <LabelValueList
            items={[
              {
                label: "First-order",
                value: "Expatriates extend their stays; long-horizon property and schooling decisions rise.",
              },
              {
                label: "Second-order",
                value:
                  "Schools plan multi-year enrolment; banks build long mortgages; family healthcare expands around patients who are not leaving.",
              },
              {
                label: "Third-order",
                value:
                  "Belonging and civic identity questions surface; retirement and eldercare markets emerge for people who never planned to grow old in the Gulf.",
              },
              {
                label: "Reinforcing loop",
                value:
                  "Longer stays → deeper investment in place → richer services for permanence → longer stays.",
              },
              {
                label: "Balancing loop",
                value:
                  "Permanent demand raises housing costs → affordability pressure → policy responses that slow the shift.",
              },
            ]}
          />
        </Section>

        {/* 14 ------------------------------------------------------------ */}
        <Section num={14} id="drivers" title="Drivers">
          <Definition text={DEFINITIONS.driver} />
          <P>
            A driver must explain, not describe. Description restates the patterns; explanation
            names the underlying force that produces them, and therefore predicts where else the
            force should show up. The difference is easiest to see side by side:
          </P>
          <LabelValueList
            items={[
              {
                label: "Describes (weak)",
                value: "“Gulf consumers increasingly prefer experiences over possessions.”",
              },
              {
                label: "Explains (strong)",
                value:
                  "“Economic diversification programmes tie state legitimacy to visible quality of life, so governments fund experience infrastructure and residents reorganise spending and status around it.”",
              },
            ]}
          />
          <ThresholdTable
            rows={[
              { requirement: "Patterns the driver explains", threshold: `≥ ${DRIVER_THRESHOLDS.minPatterns}` },
              { requirement: "Supporting signals", threshold: `≥ ${DRIVER_THRESHOLDS.minSignals}` },
              { requirement: "Sectors represented", threshold: `≥ ${DRIVER_THRESHOLDS.minSectors}` },
              {
                requirement: "Independent sources",
                threshold: `≥ ${DRIVER_THRESHOLDS.minIndependentSources}`,
              },
              {
                requirement: "Linked contradictions",
                threshold: `≥ ${DRIVER_THRESHOLDS.minContradictions}`,
              },
            ]}
            caption="Validation also requires articulated plausible futures and at least one leading indicator."
          />
          <P>
            The hypothesis labelling rule: a driver below any threshold is labelled a hypothesis and
            stays one — visibly — in every list, panel, and conclusion that references it. A
            hypothesis may guide scanning; it may not anchor a territory on its own.
          </P>
        </Section>

        {/* 15 ------------------------------------------------------------ */}
        <Section num={15} id="territories" title="Future territories">
          <Definition text={DEFINITIONS.territory} />
          <P>
            A future territory is a larger direction of change that appears where several validated
            drivers converge. It is the system’s most compressed claim about what the region may be
            becoming — and precisely because it is compressed, it is guarded by everything below it:
            drivers, patterns, clusters, signals, and contradictions must all be attached and
            traceable.
          </P>
          <P>
            What a territory is not: a trend, a theme, a category, a campaign, a prediction, or a
            buzzword. Each of those either describes the present, sells something, or forecloses the
            future. A territory describes a direction with enough precision that evidence could
            contradict it.
          </P>
          <SubHeading>Naming rules</SubHeading>
          <TwoColumnList
            items={[
              "Name a direction of change, not a topic or an industry.",
              "Plain language an outsider can understand in one line.",
              "Specific enough that evidence could weaken or contradict it.",
              "No marketing coinage — if it would fit on a conference banner, rename it.",
            ]}
          />
          <P>
            Examples of names that follow the rules: “Permanent expatriate life,” “Culture as
            economic statecraft,” “The Gulf as a life platform.” Each states a direction, can be
            monitored, and can be wrong.
          </P>
        </Section>

        {/* 16 ------------------------------------------------------------ */}
        <Section num={16} id="scenarios" title="Scenarios">
          <Definition text={DEFINITIONS.scenario} />
          <P>
            Scenarios explore how a territory could evolve under different conditions. Each scenario
            is one of five types — {Object.values(SCENARIO_TYPE_LABELS).join(", ").toLowerCase()} —
            and sits on one of three horizons:{" "}
            {Object.values(SCENARIO_HORIZON_LABELS)
              .map((h) => h.toLowerCase())
              .join("; ")}
            . The types force differentiation: five variations of the same comfortable future are
            one scenario wearing five titles.
          </P>
          <SubHeading>The nine quality tests</SubHeading>
          <TwoColumnList items={Object.values(SCENARIO_QUALITY_LABELS)} />
          <P>
            Assumption labelling: every assumption inside a scenario is declared and carries a
            provenance label — typically hypothesis or speculative possibility. A scenario with more
            assumptions than evidence links is flagged as assumption-heavy and is not used for
            strategy until the balance improves.
          </P>
        </Section>

        {/* 17 ------------------------------------------------------------ */}
        <Section num={17} id="implications" title="Strategic implications">
          <Definition text={DEFINITIONS.implication} />
          <P>
            Implications are where foresight becomes a present-day decision: what a specific
            audience should do differently because a particular future may be forming. Audiences
            and implication types are fixed vocabularies, not free text — which keeps
            recommendations addressed to someone and about something.
          </P>
          <SubHeading>Audiences</SubHeading>
          <TwoColumnList items={Object.values(IMPLICATION_AUDIENCE_LABELS)} />
          <SubHeading>Implication types</SubHeading>
          <TwoColumnList items={Object.values(IMPLICATION_TYPE_LABELS)} />
          <P>
            Every recommendation connects back to evidence — linked signals or drivers down the
            pyramid — and to the territory or scenario that motivates it. An implication without
            evidence links is flagged in the management center and treated as an opinion until the
            links exist.
          </P>
        </Section>

        {/* 18 ------------------------------------------------------------ */}
        <Section num={18} id="monitoring" title="Monitoring">
          <Definition text={DEFINITIONS.indicator} />
          <P>
            Monitoring keeps every conclusion falsifiable in practice, not just in principle.
            Indicators are typed —{" "}
            {Object.values(INDICATOR_TYPE_LABELS)
              .map((l) => l.replace(" indicator", "").toLowerCase())
              .join(", ")}{" "}
            — so that a territory is watched from several directions at once, including the
            contradiction and resistance indicators that would announce it is failing.
          </P>
          <P>
            Each indicator carries a trend — {Object.values(INDICATOR_TREND_LABELS).join(", ").toLowerCase()}{" "}
            — and a review cadence. An indicator past its cadence is overdue, and an overdue
            indicator is a hole in the system’s honesty.
          </P>
          <SubHeading>Cadences</SubHeading>
          <LabelValueList
            items={CADENCE_COVERAGE.map((c) => ({
              label: CADENCE_LABELS[c.key],
              value: c.covers,
            }))}
          />
        </Section>

        {/* 19 ------------------------------------------------------------ */}
        <Section num={19} id="guardrails" title="Hallucination and evidence guardrails">
          <P>
            Machine assistance is useful and dangerous in exactly the same place: it produces
            fluent statements whether or not evidence exists. The system therefore fixes what
            assistance may do and what it must never do, and labels every analytical statement with
            its provenance.
          </P>
          <SubHeading>Assistance may</SubHeading>
          <TwoColumnList items={AI_MAY_DO} />
          <SubHeading>Assistance must never</SubHeading>
          <TwoColumnList items={AI_MUST_NEVER} />
          <SubHeading>Provenance labels</SubHeading>
          <div className="card max-w-3xl overflow-x-auto">
            <table className="data-table">
              <tbody>
                {(Object.keys(PROVENANCE_LABELS) as ProvenanceLabel[]).map((key) => (
                  <tr key={key}>
                    <td className="whitespace-nowrap">
                      <ProvenanceBadge label={key} />
                    </td>
                    <td className="text-[12.5px] text-ink-soft">{PROVENANCE_GLOSSES[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>
            And the terminal rule, stated in the interface wherever it applies: where no evidence
            exists, the system says “Evidence not yet available.” It does not fill the gap with
            plausible prose.
          </P>
        </Section>

        {/* 20 ------------------------------------------------------------ */}
        <Section num={20} id="biases" title="Biases to avoid">
          <P>
            Bias in a foresight system rarely looks like error; it looks like a coherent, confident
            picture assembled from selectively weighted evidence. These are the failure modes this
            system checks for by design — in source bias tags, validation thresholds, and the bias
            check shown on every major conclusion page.
          </P>
          <ul className="grid max-w-4xl gap-x-8 gap-y-2 sm:grid-cols-2">
            {BIAS_LIST.map((b) => (
              <li key={b.name} className="text-[12.5px] leading-snug">
                <span className="font-medium text-ink">{b.name}</span>
                <span className="text-ink-soft"> — {b.gloss}</span>
              </li>
            ))}
          </ul>
          <div className="max-w-3xl pt-1">
            <BiasCheckPanel />
          </div>
        </Section>

        {/* Workflow -------------------------------------------------------- */}
        <section id="workflow" className="scroll-mt-20 border-t border-line pt-6">
          <h2 className="font-display text-[19px] leading-snug text-ink">
            The recommended workflow
          </h2>
          <P>
            The full journey through the system, from raw scanning to living monitoring. It is a
            loop, not a line — step 15 returns the analyst to step 1.
          </P>
          <ol className="mt-3 max-w-3xl">
            {RECOMMENDED_WORKFLOW.map((step) => (
              <li key={step.step} className="flex gap-3 border-b border-line py-2 last:border-b-0">
                <span className="w-6 shrink-0 pt-px font-mono text-[11.5px] text-ink-faint">
                  {String(step.step).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[13px] font-medium text-ink">{step.title}</p>
                  <p className="text-[12px] text-ink-soft">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="card mt-6 max-w-3xl px-4 py-4">
            <p className="overline-label">Revisit the introduction</p>
            <p className="mt-1.5 text-[13px] text-ink-soft">
              The onboarding sequence walks through the pipeline, where to start, and how evidence
              moves upward. Replaying it does not touch your data.
            </p>
            {hydrated ? (
              <button
                type="button"
                onClick={() => store.resetOnboarding()}
                className="mt-3 border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink"
              >
                Replay the introduction
              </button>
            ) : (
              <p className="mt-3 text-[12px] text-ink-faint">Loading the intelligence base…</p>
            )}
            <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] text-ink-faint">
              Guided Mode keeps the walkthrough panels and step-by-step prompts visible on every
              page. The toggle lives in the sidebar and in Settings.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
