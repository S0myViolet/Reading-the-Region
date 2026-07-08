"use client";

/**
 * Explore — browse what is changing, by question, place, or theme.
 *
 * This is a reading index, not a filter database: every entry is a door
 * into a topic page that gathers the relevant signals, stories, tensions
 * and watch items in plain language. Counts are computed only after
 * hydration so the static index renders identically on server and client.
 */

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { WalkthroughPanel } from "@/components/WalkthroughPanel";
import { useHydrated, useIntelligenceStore } from "@/lib/store";
import {
  EXPLORE_PLACES,
  EXPLORE_QUESTIONS,
  EXPLORE_THEMES,
  topicContent,
} from "@/lib/explore";
import { numberWord } from "@/lib/simple";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-[13px] font-medium text-ink">{children}</h2>;
}

export default function ExplorePage() {
  const hydrated = useHydrated();
  const data = useIntelligenceStore();

  return (
    <>
      <PageHeader
        title="Explore"
        description="Browse what is changing — by question, place, or theme."
      />
      <WalkthroughPanel pageId="explore" />

      <section className="mb-10" aria-label="Browse by question">
        <SectionHeading>Browse by question</SectionHeading>
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {EXPLORE_QUESTIONS.map((topic) => {
            const count = hydrated ? topicContent(topic, data).signals.length : 0;
            return (
              <Link
                key={topic.slug}
                href={`/explore/${topic.slug}`}
                className="group -mx-3 rounded-[4px] px-3 py-3 transition-colors hover:bg-surface-muted"
              >
                <p className="text-[14px] font-medium leading-snug text-ink group-hover:text-accent-ink">
                  {topic.title}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-faint">
                  {topic.hint}
                  {hydrated && count > 0 ? (
                    <span>
                      {" "}
                      · {numberWord(count)} signal{count === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-10" aria-label="Browse by place">
        <SectionHeading>Browse by place</SectionHeading>
        <p className="flex max-w-2xl flex-wrap gap-x-6 gap-y-2">
          {EXPLORE_PLACES.map((topic) => (
            <Link
              key={topic.slug}
              href={`/explore/${topic.slug}`}
              title={topic.hint}
              className="text-[13.5px] text-ink-soft underline-offset-2 hover:text-accent-ink hover:underline"
            >
              {topic.title}
            </Link>
          ))}
        </p>
      </section>

      <section className="mb-10" aria-label="Browse by theme">
        <SectionHeading>Browse by theme</SectionHeading>
        <div className="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {EXPLORE_THEMES.map((topic) => (
            <Link
              key={topic.slug}
              href={`/explore/${topic.slug}`}
              title={topic.hint}
              className="text-[13px] text-ink-soft underline-offset-2 hover:text-accent-ink hover:underline"
            >
              {topic.title}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
