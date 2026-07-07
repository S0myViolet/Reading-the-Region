# Reading the Region

**A Strategic Foresight Intelligence System for Detecting, Interpreting, and Translating Regional Change**

Reading the Region is a structured foresight intelligence platform for the MENA region — with particular attention to the Gulf, the UAE, and Saudi Arabia. It is not a trends dashboard, a content aggregator, or a news app. It moves evidence through a disciplined pipeline in which every layer reduces noise while increasing meaning:

```
Observation → Signal → Cluster → Pattern → Contradiction → Driver
→ Future Territory → Scenario → Strategic Implication → Monitoring
```

## Principles

- Do not collect trends. Collect signals.
- Do not group by topic. Group by underlying logic.
- Do not search for confirmation. Search for contradiction.
- Do not describe only what is happening. Explain why it is happening.
- Do not predict one future. Identify plausible futures.
- Do not stop at insight. Translate into action.
- Do not publish and forget. Monitor and update.

## Running the platform

```bash
npm install
npm run dev        # development server on http://localhost:4100
npm run build      # production build
npm start          # production server on http://localhost:4100
npm run typecheck  # strict TypeScript check
```

The workspace opens seeded with a demonstration dataset (observations, signals, cluster candidates, patterns, contradictions, driver hypotheses, one future territory, scenarios, implications, and monitoring indicators) so every layer of the method is visible immediately. All demo sources are labelled as sample data; no real citations are invented. Data is persisted to the browser's localStorage; use **Settings → Reset to demonstration dataset** to restore the seed.

## Structure

| Area | Purpose |
| --- | --- |
| `src/lib/types.ts` | The full data model: 11 entity types, enums, scoring rubrics |
| `src/lib/validation.ts` | Workflow enforcement: promotion criteria, cluster thresholds, pattern tests, driver thresholds, territory/scenario/implication linkage rules |
| `src/lib/store.ts` | Persisted client store — the single write path for all workflow actions |
| `src/lib/derived.ts` | Dashboard queries, management center, task guidance, global search index |
| `src/lib/seed/` | Demonstration dataset (internally cross-linked; checked by `scripts/check-seed.ts`) |
| `src/components/` | Shared intelligence UI: badges, score panels, validation checklists, zooming panel, contradiction panel, pipeline, walkthroughs |
| `src/app/` | The fourteen platform sections |

## Methodology

The methodology is documented in-product at `/methodology`: the intelligence pyramid, signal scoring rubrics, the zooming method, cluster and pattern validation, systems thinking, driver thresholds, future territories, scenario quality tests, evidence guardrails, and the bias checklist.
