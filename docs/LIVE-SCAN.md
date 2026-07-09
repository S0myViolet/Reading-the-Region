# Live scan — how the platform updates itself

Reading the Region can pull new material from real news feeds while it is
running. This document explains what updates, when, and how to control it.

## What it does

While the app is open, the server checks the feeds configured in
`scan.feeds.json` and turns items it has not seen before into two kinds of
records:

- a **Source** per feed (credibility defaults to 3 until a human assesses it),
- an **Observation** per new article, landing in the **Scan Inbox** as
  unreviewed material, tagged "from live scan".

Everything enters at the bottom of the pipeline. Nothing is scored, promoted,
or linked automatically — the platform's standing rule is that evidence earns
its place through human triage. Sector and country tags on scanned items are
keyword guesses and say so in the item's notes.

## When it runs

- On app load, and every 30 minutes while a browser tab is open, the client
  asks the server to scan. The server enforces the configured minimum interval
  (default: 6 hours), so most of those requests return immediately.
- "Scan now" (Scan Inbox header, or Settings → Live updates) forces an
  immediate scan.
- The app never scans while it is not running — there is no background daemon.
  If you want scheduled scans while the app is closed, run the server
  permanently (e.g. `npm start`) or trigger
  `curl -X POST localhost:4100/api/live-scan` from a cron/launchd job.

## Where the results live

- Scanned records accumulate server-side in `data/live-scan/state.json`
  (git-ignored, machine-local). The browser merges them into its local
  workspace on every sync — insert-only, so triage decisions and edits are
  never overwritten.
- Because the server file is the source of record, live-scanned items survive
  demo-dataset refreshes and "Reset to demonstration dataset": they are simply
  re-imported on the next sync.

## Configuring feeds

Edit `scan.feeds.json` in the project root:

```json
{
  "enabled": true,
  "minMinutesBetweenScans": 360,
  "maxNewItemsPerScan": 12,
  "feeds": [
    {
      "name": "Google News — Gulf long-term visas & settlement",
      "url": "https://news.google.com/rss/search?q=...",
      "sectors": ["migration_citizenship_belonging"],
      "region": "GCC"
    }
  ]
}
```

- Any RSS 2.0 or Atom feed URL works. Google News search feeds
  (`https://news.google.com/rss/search?q=<query>`) are an easy way to follow a
  theme across many outlets.
- `sectors` and `region` are optional hints applied to every item from that
  feed; keyword tagging refines them per item.
- `maxNewItemsPerScan` caps intake per scan so the inbox never floods.
- Restart is not required — the config is read on every scan.

## Controls in the app

- **Scan Inbox** (Advanced): a quiet status line shows when the last scan ran,
  how many items it added, and a "Scan now" action.
- **Settings → Live updates**: the same status plus pause/resume, the feed
  list, and any per-feed errors from the last scan.
- Pausing live scan stops the client from pulling new material; the rest of
  the platform is unaffected. The app works fully offline — live scan is an
  addition, never a dependency.

## Testing without internet

`/api/live-scan/fixture` serves a tiny static RSS document. Point a feed at
`http://localhost:4100/api/live-scan/fixture` to exercise the whole pipeline
(scan → dedupe → inbox → triage) in a sandboxed environment. Fixture items are
prefixed "[Fixture]".
