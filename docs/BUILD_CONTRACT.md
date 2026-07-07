# Reading the Region — page build contract

This document is the binding contract for building route pages. Read it fully,
then read the referenced source files before writing any page code.

## Stack

- Next.js 15 App Router, TypeScript strict, Tailwind CSS v4 (tokens in `src/app/globals.css`).
- All data is client-side: a zustand store persisted to localStorage, seeded from `src/lib/seed`.
- **Every page that reads data must be a client component** (`"use client"`) and must be
  hydration-safe: call `useHydrated()` from `@/lib/store`; until it returns `true`, render a
  minimal skeleton (e.g. the PageHeader plus `<p className="text-[12px] text-ink-faint">Loading the intelligence base…</p>`).
  Never render store-derived data before hydration.

## Files you must read before building

- `src/lib/types.ts` — all entities, enums, label maps (SECTOR_LABELS, etc.)
- `src/lib/store.ts` — store shape, actions, `nextId`, `useHydrated`
- `src/lib/validation.ts` — validation functions returning `ValidationResult`
- `src/lib/derived.ts` — dashboard/management/search queries
- `src/lib/copy.ts` — walkthrough content, definitions, workflow, pipeline stages
- `src/components/*.tsx` — the component inventory below

## Component inventory (use these; do not re-invent)

From `@/components/badges`: `Pill`, `ConfidenceBadge`, `ReviewStatusBadge`,
`SourceCredibilityBadge`, `ProvenanceBadge`, `SignalStrengthBadge`, `TrendBadge`,
`TerritoryStatusBadge`, `IdChip`, `DemoTag`.
From `@/components/tags`: `SectorTags`, `SystemTags`, `SourceBiasTags`, `PlainTags`.
From `@/components/ScorePanel`: `ScoreBar`, `SignalScorePanel`, `ScoreGrid`.
From `@/components/PageHeader`: `PageHeader` (props: overline, title, description?, actions?).
From `@/components/EmptyState`: `EmptyState` (message must be instructional and specific).
From `@/components/ValidationChecklist`: `ValidationChecklist` (renders a `ValidationResult`).
From `@/components/WalkthroughPanel`: `WalkthroughPanel` (prop: `pageId` — keys in `WALKTHROUGHS`).
From `@/components/EntityLink`: `EntityLink`, `RelatedObjectsPanel` (relationship trail).
From `@/components/ZoomingPanel`: `ZoomingPanel`.
From `@/components/ContradictionPanel`: `ContradictionPanel`, `NoContradictionNote`.
From `@/components/IntelligencePipeline`: `IntelligencePipeline` (prop: counts from `pipelineCounts`).
From `@/components/BiasCheckPanel`: `BiasCheckPanel`.
From `@/components/Tabs`: `Tabs` (progressive disclosure on detail pages).
From `@/components/Breadcrumbs`: `Breadcrumbs`.
From `@/components/form`: `Field`, `TextInput`, `TextArea`, `Select`, `CheckboxList`, `ScorePicker`.

## Design idiom (must match exactly)

- Warm paper background is global. Content sits in `.card` blocks (white, 1px `line` border,
  3px radius). No shadows, no gradients, no rounded-2xl, no emoji, no decorative icons.
- Section labels use `.overline-label`. Page titles come only from `PageHeader` (serif display).
- Body text: `text-[13px] text-ink-soft`; secondary: `text-[11.5px] text-ink-faint`.
- Tables use `<table className="data-table">` with plain `<th>`/`<td>` (styles are global).
- Primary button: `border border-accent bg-accent px-3 py-1.5 text-[12.5px] font-medium text-white rounded-[2px] hover:bg-accent-ink`.
- Secondary button: `border border-line bg-surface px-3 py-1.5 text-[12.5px] text-ink-soft rounded-[2px] hover:border-line-strong`.
- Color tokens (as Tailwind classes): `paper, surface, surface-muted, ink, ink-soft, ink-faint,
  line, line-strong, accent, accent-soft, accent-ink, tension, tension-soft, caution,
  caution-soft, info, info-soft`. Tension (oxide red) is reserved for contradictions;
  caution (amber) for review/weak evidence; accent (green) for validated/strengthening.
- Layout: pages render inside a max-w-6xl container. Detail pages: two-column
  `lg:grid lg:grid-cols-[1fr_320px] lg:gap-6` with the relationship trail / guidance in the
  right column.

## Page conventions

1. Every main section page starts with `PageHeader` then `WalkthroughPanel pageId="…"`.
2. Every detail page starts with `Breadcrumbs` tracing the pipeline (e.g. Scan Inbox →
   Observation → Promoted Signal → Cluster Candidate…), then `PageHeader`.
3. Every detail page includes a `RelatedObjectsPanel` relationship trail with the groups
   specified for its layer.
4. Empty states must be instructional (what the layer requires + where to go), via `EmptyState`.
5. Detail pages for complex objects use `Tabs` for progressive disclosure
   (Overview / Evidence / Scoring / Relationships / Contradictions / Review as applicable).
6. Cross-link everything: ids render via `EntityLink` or `IdChip`; never bare text ids.
7. Validation is always shown honestly: use `ValidationChecklist` with the right validator;
   never present a candidate/hypothesis as validated. Conclusion pages (pattern, driver,
   territory, scenario, implication detail) include `BiasCheckPanel` and either linked
   contradictions or `NoContradictionNote`.
8. Copywriting: serious, precise, foresight vocabulary (signals, evidence, contradictions,
   confidence, validation, noise). Banned: "unlock", "AI-powered", "supercharge", "discover
   trends", "stay ahead", "game-changing", "revolutionary", "next-gen", "seamless", "smart
   analytics", and emoji.
9. Dates: format with `new Date(x).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })`.
10. Mutations go through store actions; new ids via `nextId("SIG", signals)` etc. Prefixes:
    OBS, SRC, SIG, CLU, PAT, CON, DRV, TER, SCN, IMP, IND.

## File ownership

You own ONLY the route files assigned in your prompt (under `src/app/<your-route>/`), plus
new page-specific components placed inside your route directory. Never edit shared files
(`src/lib/*`, `src/components/*`, `src/app/layout.tsx`, `globals.css`). If a shared change
seems needed, work around it locally and note it in your final report.

## Definition of done

`cd /home/user/Reading-the-Region && npx tsc --noEmit` passes with zero errors in your files.

## Visibility layers (complexity rule)

The platform is a simple surface over a rigorous engine. Depth is hidden by default and
inspectable on demand via the global view-depth control (`ViewModeSwitch` in the shell).

- `simple` (default): what happened, why it matters, confidence **with a reason**, evidence
  quality in one line, what could contradict it, what it connects to, suggested next step.
- `analyst`: adds scoring panels, source credibility & bias tags, zooming analysis, systems
  effects, cluster logic, validation status.
- `methodology`: adds thresholds, full rubric detail, provenance labels, audit trail
  (created/updated, review machinery), evidence lineage.

Implementation idiom:

- Gate depth with `<ViewGate min="analyst">…</ViewGate>` / `<ViewGate min="methodology">…</ViewGate>`
  from `@/components/ViewMode`; read the mode with `useViewMode()`.
- In simple view, add one `<DepthHint>Scoring, sources and validation detail</DepthHint>` per
  detail page so users know deeper material exists.
- Never render a bare score, confidence level, or "contradiction detected". Use the
  generators in `@/lib/explain.ts` (`explainSignalScore`, `explainSignalConfidence`,
  `evidenceQualityLine`, `explainContradiction`, `explainClusterStatus`,
  `explainPatternStatus`, `explainDriverStatus`, `explainScenarioEvidence`,
  `explainTerritoryStatus`, `explainImplicationEvidence`, `explainIndicator`,
  `summarizeValidation`, `nextStepForSignal`, `nextStepForCluster`) and the readout
  components in `@/components/Explained.tsx` (`ExplainedScore`, `ExplainedConfidence`,
  `EvidenceQualityLine`, `ExplainedValue`).
- Tabs on detail pages: the Overview tab is the simple layer; Scoring/Evidence/Systems/
  Review tabs are analyst+; threshold tables and audit trails are methodology-only.
- Forms: in simple view, creation flows show the essential capture fields and explain that
  scoring/validation completes in Analyst view (objects land as drafts needing review) —
  the user must never feel they are filling a compliance form.

## Calm redesign (binding — supersedes earlier visual guidance where they conflict)

Cleanliness is the top priority: show less, separate better, prioritize clearly.
The exemplar page is `src/app/inbox/page.tsx` — match its calm exactly.

- **Whitespace before borders.** Prefer plain sections separated by generous spacing
  (mb-8/mb-10) and type hierarchy over `.card` boxes. Use `.card` ONLY for tables needing
  horizontal scroll, forms, or genuine asides. Never stack more than two cards in a row —
  merge into one flow under text headings.
- **Section headings**: `text-[13px] font-medium text-ink` (or 15px for major sections) with
  an optional one-line description in `text-[12px] text-ink-faint`. NO uppercase/overline
  section headers. `.overline-label` survives only for tiny inline metadata labels.
- **Lists over tables** for work queues: use the `.list-row` class — whole row is a Link,
  ONE primary line (13.5px, font-medium, truncate), ONE secondary metadata line (12px,
  ink-faint, values joined by " · "), right-aligned quiet status. Max 2 badges per row.
- **Tables**: only when columns genuinely aid comparison; ≤5 columns in simple view; the
  `.data-table` idiom is already restyled (sentence-case headers, roomier rows).
- **Filters**: exactly ONE ControlBar (`@/components/ControlBar`) per list page —
  ControlSearch + up to 3 ControlSelects + sort; everything else goes in the `more` slot.
  NO pill/chip filter rows anywhere.
- **Stats**: no boxed stat cards. Render figures as mono number (18–22px) over a small faint
  label, in a flex row with generous gaps; hairline dividers only if truly needed.
- **Badges**: `Pill` is now borderless/tinted; neutral renders as plain text. Reserve colour:
  accent = validated/promoted/strengthening; caution = genuinely needs attention;
  tension = contradiction ONLY. Default states (unreviewed, draft, stable) stay neutral.
  Most metadata should be plain faint text, not pills.
- **PageHeader**: title + one-line description + ONE primary action (no overline rendered).
  Secondary actions become quiet text links in the body.
- **Page guide**: WalkthroughPanel is now a one-line collapsed row. Exactly one per page,
  directly after PageHeader. Never add other instructional slabs above the work area.
- **Detail pages**: left column reads as an article — sections separated by whitespace and
  headings, not stacked cards. Right rail: RelatedObjectsPanel (now borderless) plus at most
  one quiet aside. Deep methodology stays behind tabs/ViewGate as before.
- **Buttons**: primary = `bg-accent text-white rounded-[4px] px-3.5 py-1.5 text-[12.5px]
  font-medium hover:bg-accent-ink` (no border); secondary = plain text link
  (`text-ink-soft hover:text-ink underline-offset-2`) or `bg-surface-muted` chip. No bordered
  button rows.
- **Shared components already restyled** (do not re-box them): badges, tags,
  IntelligencePipeline, EntityLink/RelatedObjectsPanel, ValidationChecklist, BiasCheckPanel,
  ZoomingPanel, ContradictionPanel, EmptyState, ScorePanel, WalkthroughPanel, PageHeader,
  ControlBar, form Field.
- **Three-second test** before finishing a page: page purpose obvious; main action obvious;
  nothing competing for attention; anything removable removed or hidden behind disclosure.
