/**
 * Fixture feed — a tiny static RSS document served by the app itself.
 *
 * Lets the live-scan pipeline be tested end to end in environments with no
 * outbound internet access (point a feed in scan.feeds.json at
 * http://localhost:4100/api/live-scan/fixture). The items are clearly
 * labelled as fixture material and follow the same path as real items:
 * into the Scan Inbox, unreviewed, awaiting human triage.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIXTURE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Live-scan fixture feed</title>
    <link>http://localhost:4100/api/live-scan/fixture</link>
    <description>Static test items for verifying the live-scan pipeline.</description>
    <item>
      <title>[Fixture] Dubai developer announces family-district phase with school inside the masterplan</title>
      <link>https://example.com/fixture/dubai-family-district</link>
      <description>Test item: a developer adds a school and clinic to a residential phase aimed at long-stay families.</description>
      <source>Fixture Wire</source>
      <pubDate>Tue, 07 Jul 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>[Fixture] Riyadh metro weekend ridership passes weekday average for first time</title>
      <link>https://example.com/fixture/riyadh-metro-weekend</link>
      <description>Test item: transit ridership pattern shifts toward leisure and family use.</description>
      <source>Fixture Wire</source>
      <pubDate>Mon, 06 Jul 2026 09:30:00 GMT</pubDate>
    </item>
    <item>
      <title>[Fixture] Qatar bank pilots named-adviser mortgage line for long-visa families</title>
      <link>https://example.com/fixture/qatar-mortgage-pilot</link>
      <description>Test item: a bank pairs automated approval with a named human adviser for resident families.</description>
      <source>Fixture Wire</source>
      <pubDate>Sun, 05 Jul 2026 11:15:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

export async function GET() {
  return new Response(FIXTURE_RSS, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
